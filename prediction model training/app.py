import os
import datetime as dt
import subprocess
import sys
import tempfile
import time

import matplotlib
# Use a non-GUI backend to avoid Tk/Tcl thread issues in server environments.
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import yfinance as yf
from flask import Flask, jsonify, render_template, request, send_file
from sklearn.preprocessing import MinMaxScaler
from werkzeug.utils import secure_filename

plt.style.use("fivethirtyeight")

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
MODEL_PATH = os.path.join(BASE_DIR, "stock_dl_model_2.h5")

# Ensure runtime folders exist before writing generated files.
os.makedirs(STATIC_DIR, exist_ok=True)

_model = None
_model_load_error = None


class PredictionError(Exception):
    """Base exception for predictable API and UI prediction failures."""


class DataUnavailableError(PredictionError):
    """Raised when a ticker does not have enough market data."""


class ModelUnavailableError(PredictionError):
    """Raised when the ML model cannot be loaded or used."""


class UpstreamRateLimitError(PredictionError):
    """Raised when the market data provider throttles requests."""


PREDICTION_CACHE_TTL_SECONDS = 900
_prediction_cache = {}


def normalize_ticker(raw_ticker):
    value = (raw_ticker or "").strip().upper()
    if not value:
        raise DataUnavailableError("Ticker is required.")
    return value


def _is_rate_limited(stock):
    err = str(getattr(yf.shared, "_ERRORS", {}).get(stock, ""))
    err_lower = err.lower()
    return "too many requests" in err_lower or "rate limit" in err_lower


def predict_with_subprocess(x_test):
    worker_path = os.path.join(BASE_DIR, "inference_worker.py")
    if not os.path.exists(worker_path):
        raise ModelUnavailableError("Inference worker is missing.")

    with tempfile.TemporaryDirectory(prefix="stock_pred_") as tmp_dir:
        input_path = os.path.join(tmp_dir, "x_test.npy")
        output_path = os.path.join(tmp_dir, "y_pred.npy")
        np.save(input_path, x_test)

        cmd = [
            sys.executable,
            worker_path,
            "--model",
            MODEL_PATH,
            "--input",
            input_path,
            "--output",
            output_path,
        ]

        try:
            proc = subprocess.run(
                cmd,
                check=False,
                capture_output=True,
                text=True,
                timeout=180,
            )
        except subprocess.TimeoutExpired as exc:
            raise ModelUnavailableError("Inference worker timed out.") from exc

        if proc.returncode != 0:
            stderr = (proc.stderr or "").strip()
            stdout = (proc.stdout or "").strip()
            details = stderr or stdout or f"Exit code {proc.returncode}"
            raise ModelUnavailableError(f"Inference worker failed: {details}")

        if not os.path.exists(output_path):
            raise ModelUnavailableError("Inference worker did not produce prediction output.")

        return np.load(output_path)


def run_prediction(stock):
    start = dt.datetime(2020, 1, 1)
    # Get data up to today
    end = dt.datetime.today()

    now_ts = time.time()
    cached = _prediction_cache.get(stock)
    if cached and now_ts - cached["timestamp"] < PREDICTION_CACHE_TTL_SECONDS:
        return cached["result"]

    # Download data for the requested stock only
    df = yf.download(stock, start=start, end=end, auto_adjust=False, progress=False)
    if df.empty or 'Close' not in df:
        if _is_rate_limited(stock):
            if cached:
                return cached["result"]
            raise UpstreamRateLimitError("Market data provider rate-limited this request. Retry later.")
        raise DataUnavailableError(f"No market data found for '{stock}'.")

    close = df['Close']
    if isinstance(close, pd.DataFrame):
        close = close.iloc[:, 0]
    close = close.dropna()

    if len(close) < 100:
        raise DataUnavailableError(f"Not enough data to predict for '{stock}'.")

    close_df = pd.DataFrame(close)
    split_index = int(len(close_df) * 0.70)
    data_training = close_df.iloc[:split_index]
    data_testing = close_df.iloc[split_index:]

    if len(data_training) < 60 or data_testing.empty:
        raise DataUnavailableError(f"Not enough data to predict for '{stock}'.")

    scaler = MinMaxScaler(feature_range=(0, 1))
    scaler.fit(data_training)

    past_60_days = data_training.tail(60)
    final_df = pd.concat([past_60_days, data_testing], ignore_index=True)
    input_data = scaler.transform(final_df)

    if input_data.shape[0] <= 60:
        raise DataUnavailableError(f"Not enough data points to run inference for '{stock}'.")

    x_test, y_test = [], []
    for i in range(60, input_data.shape[0]):
        x_test.append(input_data[i - 60:i])
        y_test.append(input_data[i, 0])

    x_test, y_test = np.array(x_test), np.array(y_test)
    # Ensure shape is (samples, 60, 1) to match the new generalized LSTM requirements
    x_test = np.reshape(x_test, (x_test.shape[0], x_test.shape[1], 1))
    
    if x_test.size == 0:
        raise DataUnavailableError(f"Not enough sequences to predict for '{stock}'.")

    y_predicted = predict_with_subprocess(x_test)

    # Clean inverse transformation via 1D array handling
    y_predicted_actual = scaler.inverse_transform(np.ravel(y_predicted).reshape(-1, 1))[:, 0]
    y_test_actual = scaler.inverse_transform(np.ravel(y_test).reshape(-1, 1))[:, 0]

    if y_predicted_actual.size == 0:
        raise DataUnavailableError(f"No prediction output generated for '{stock}'.")

    result = {
        "stock": stock,
        "df": df,
        "data_desc": df.describe(),
        "ema20": close.ewm(span=20, adjust=False).mean(),
        "ema50": close.ewm(span=50, adjust=False).mean(),
        "ema100": close.ewm(span=100, adjust=False).mean(),
        "ema200": close.ewm(span=200, adjust=False).mean(),
        "y_test": y_test_actual,
        "y_predicted": y_predicted_actual,
        "predicted_price": float(y_predicted_actual[-1]),
    }
    _prediction_cache[stock] = {"timestamp": now_ts, "result": result}
    return result


@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        try:
            stock = normalize_ticker(request.form.get('stock') or 'POWERGRID.NS')
            result = run_prediction(stock)
        except PredictionError as exc:
            return render_template('index.html', error=str(exc))

        df = result["df"]
        data_desc = result["data_desc"]
        ema20 = result["ema20"]
        ema50 = result["ema50"]
        ema100 = result["ema100"]
        ema200 = result["ema200"]
        y_test = result["y_test"]
        y_predicted = result["y_predicted"]

        # Only plot the closing price
        fig1, ax1 = plt.subplots(figsize=(12, 6))
        
        # When yf.download is called with a single stock, df.Close is typically a Series or a DataFrame with 1 Column depending on version
        close_series = df['Close']
        if isinstance(close_series, pd.DataFrame):
            close_series = close_series.iloc[:, 0]
            
        ax1.plot(close_series, 'y', label=f'{stock} Closing Price')
        ax1.plot(ema20, 'g', label='EMA 20')
        ax1.plot(ema50, 'r', label='EMA 50')
        ax1.set_title("Closing Price vs Time (20 & 50 Days EMA)")
        ax1.set_xlabel("Time")
        ax1.set_ylabel("Price")
        ax1.legend()
        ema_chart_path = os.path.join('static', 'ema_20_50.png')
        fig1.savefig(os.path.join(BASE_DIR, ema_chart_path))
        plt.close(fig1)

        fig2, ax2 = plt.subplots(figsize=(12, 6))
        ax2.plot(close_series, 'y', label=f'{stock} Closing Price')
        ax2.plot(ema100, 'g', label='EMA 100')
        ax2.plot(ema200, 'r', label='EMA 200')
        ax2.set_title("Closing Price vs Time (100 & 200 Days EMA)")
        ax2.set_xlabel("Time")
        ax2.set_ylabel("Price")
        ax2.legend()
        ema_chart_path_100_200 = os.path.join('static', 'ema_100_200.png')
        fig2.savefig(os.path.join(BASE_DIR, ema_chart_path_100_200))
        plt.close(fig2)

        fig3, ax3 = plt.subplots(figsize=(12, 6))
        ax3.plot(y_test, 'g', label="Original Price", linewidth=1)
        ax3.plot(y_predicted, 'r', label="Predicted Price", linewidth=1)
        ax3.set_title("Prediction vs Original Trend")
        ax3.set_xlabel("Time")
        ax3.set_ylabel("Price")
        ax3.legend()
        prediction_chart_path = os.path.join('static', 'stock_prediction.png')
        fig3.savefig(os.path.join(BASE_DIR, prediction_chart_path))
        plt.close(fig3)

        safe_stock = secure_filename(stock).replace('.', '_')
        csv_file_path = os.path.join('static', f"{safe_stock}_dataset.csv")
        df.to_csv(os.path.join(BASE_DIR, csv_file_path))

        return render_template(
            'index.html',
            plot_path_ema_20_50=ema_chart_path,
            plot_path_ema_100_200=ema_chart_path_100_200,
            plot_path_prediction=prediction_chart_path,
            data_desc=data_desc.to_html(classes='table table-bordered'),
            dataset_link=csv_file_path,
            stock=stock,
        )

    return render_template('index.html')


@app.route('/api/v1/predictions/price', methods=['POST'])
def predict_price_api():
    payload = request.get_json(silent=True) or {}
    ticker = payload.get('ticker') or payload.get('stock')

    try:
        stock = normalize_ticker(ticker)
    except DataUnavailableError as exc:
        return jsonify({"error": str(exc)}), 400

    try:
        result = run_prediction(stock)
        return jsonify({"predictedPrice": round(result["predicted_price"], 4)})
    except DataUnavailableError as exc:
        return jsonify({"error": str(exc)}), 404
    except UpstreamRateLimitError as exc:
        return jsonify({"error": str(exc)}), 429
    except ModelUnavailableError as exc:
        return jsonify({"error": str(exc)}), 503
    except Exception:
        return jsonify({"error": "Prediction failed due to an internal error."}), 500


@app.route('/api/v1/predictions/price', methods=['GET'])
def predict_price_api_get():
    ticker = request.args.get('ticker') or request.args.get('stock')

    try:
        stock = normalize_ticker(ticker)
    except DataUnavailableError as exc:
        return jsonify({"error": str(exc)}), 400

    try:
        result = run_prediction(stock)
        return jsonify({"predictedPrice": round(result["predicted_price"], 4)})
    except DataUnavailableError as exc:
        return jsonify({"error": str(exc)}), 404
    except UpstreamRateLimitError as exc:
        return jsonify({"error": str(exc)}), 429
    except ModelUnavailableError as exc:
        return jsonify({"error": str(exc)}), 503
    except Exception:
        return jsonify({"error": "Prediction failed due to an internal error."}), 500


@app.route('/download/<path:filename>')
def download_file(filename):
    safe_name = os.path.basename(filename)
    return send_file(os.path.join(STATIC_DIR, safe_name), as_attachment=True)


if __name__ == '__main__':
    app.run(debug=True)
