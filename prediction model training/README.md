# Stock Prediction Flask App

This project works best with **Python 3.11** because `tensorflow==2.16.1` is compatible with 3.11 on Windows, while Python 3.13 is not.

## Quick start (recommended)

Run the setup script from PowerShell:

```powershell
Set-Location "C:\Users\andre\prediction model training"
.\setup_and_run.ps1
```

The script will:
1. Show all detected Python versions.
2. Create/use `.venv311` with Python 3.11.
3. Install dependencies from `requirements.txt`.
4. Validate imports (`from app import app`).
5. Start the Flask server.

## Manual setup

```powershell
Set-Location "C:\Users\andre\prediction model training"
py -3.11 -m venv .venv311
.\.venv311\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python app.py
```

Open:
- http://127.0.0.1:5000

## Verify environment

```powershell
Set-Location "C:\Users\andre\prediction model training"
py -0p
.\.venv311\Scripts\python.exe -V
.\.venv311\Scripts\python.exe -m pip show tensorflow flask pandas yfinance
```

## REST API (microservice usage)

Use this endpoint when calling from Spring Boot or other services.

### Option 1: GET request (recommended for caching)

- Method: `GET`
- URL: `http://127.0.0.1:5000/api/v1/predictions/price?ticker=AAPL`
- Response: `{ "predictedPrice": 183.4271 }`

Possible error responses:
- `400` ticker missing
- `404` ticker has no usable market data
- `429` upstream market API is rate-limiting requests
- `503` model unavailable

### Option 2: POST request (with JSON body)

- Method: `POST`
- URL: `http://127.0.0.1:5000/api/v1/predictions/price`
- Request JSON: `{ "ticker": "AAPL" }`
- Response: `{ "predictedPrice": 183.4271 }`

### Quick test with PowerShell

**GET endpoint:**
```powershell
Invoke-RestMethod -Method Get -Uri "http://127.0.0.1:5000/api/v1/predictions/price?ticker=AAPL"
```

**POST endpoint:**
```powershell
$body = @{ ticker = "AAPL" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:5000/api/v1/predictions/price" -ContentType "application/json" -Body $body
```

### Spring Boot client example

**Using GET request:**
```java
RestTemplate restTemplate = new RestTemplate();
String url = "http://localhost:5000/api/v1/predictions/price?ticker=AAPL";
Map<String, Object> response = restTemplate.getForObject(url, Map.class);
double predictedPrice = (double) response.get("predictedPrice");
```

When using Spring Boot in production, configure retries with backoff for `429` and `503`.

**Using POST request:**
```java
record PredictionRequest(String ticker) {}
record PredictionResponse(double predictedPrice) {}

RestTemplate restTemplate = new RestTemplate();
String url = "http://localhost:5000/api/v1/predictions/price";

PredictionResponse response = restTemplate.postForObject(
	url,
	new PredictionRequest("AAPL"),
	PredictionResponse.class
);
```

### API-only smoke test (no external market API call)

```powershell
Set-Location "C:\Users\andre\prediction model training"
.\.venv311\Scripts\python.exe smoke_test_api.py
```

