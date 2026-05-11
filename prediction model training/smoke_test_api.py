import numpy as np
import pandas as pd
from unittest.mock import patch

from app import app


def fake_predict_with_subprocess(x_test):
    # Return a simple constant normalized value for all windows.
    return np.full((x_test.shape[0], 1), 0.75, dtype=float)


def fake_download(*args, **kwargs):
    dates = pd.date_range("2020-01-01", periods=260, freq="D")
    closes = np.linspace(100.0, 220.0, num=260)
    return pd.DataFrame({"Close": closes}, index=dates)


def main():
    with patch("app.yf.download", side_effect=fake_download), patch("app.predict_with_subprocess", side_effect=fake_predict_with_subprocess):
        client = app.test_client()
        # Test POST endpoint
        response = client.post("/api/v1/predictions/price", json={"ticker": "AAPL"})
        body = response.get_json()
        print("POST /api/v1/predictions/price")
        print("status:", response.status_code)
        print("body:", body)

        if response.status_code != 200:
            raise SystemExit(1)
        if "predictedPrice" not in body:
            raise SystemExit(1)
        if len(body.keys()) != 1:
            raise SystemExit(1)

        # Test GET endpoint
        response = client.get("/api/v1/predictions/price?ticker=AAPL")
        body = response.get_json()
        print("\nGET /api/v1/predictions/price?ticker=AAPL")
        print("status:", response.status_code)
        print("body:", body)

    if response.status_code != 200:
        raise SystemExit(1)
    if "predictedPrice" not in body:
        raise SystemExit(1)
    if len(body.keys()) != 1:
        raise SystemExit(1)

    print("\nAll tests passed!")


if __name__ == "__main__":
    main()


