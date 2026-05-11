# ─────────────────────────────────────────────────────────────────────────────
# Dockerfile for the Flask + TensorFlow prediction service
# Located in:  prediction model training/
# ─────────────────────────────────────────────────────────────────────────────

# TensorFlow 2.16.1 requires Python 3.11 — use the official TF image to avoid
# manual CUDA / lib setup. The CPU-only variant keeps the image smaller.
FROM python:3.11-slim

WORKDIR /app

# Install system deps needed by matplotlib / numpy
RUN apt-get update && apt-get install -y --no-install-recommends \
        libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (layer-cached unless requirements change)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY app.py .
COPY inference_worker.py .
COPY templates/ ./templates/
COPY static/ ./static/

# The model file (stock_dl_model_2.h5) is mounted at runtime via a Docker
# volume in docker-compose.yml — no need to COPY it into the image.
# This keeps the image ~22 MB lighter and avoids rebuilding on model updates.

EXPOSE 5000

# Run with gunicorn for production stability instead of Flask dev server
# Timeout is high because first prediction per ticker can take ~30s
RUN pip install --no-cache-dir gunicorn

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--timeout", "300", "app:app"]
