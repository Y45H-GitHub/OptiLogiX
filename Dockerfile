# === Stage 1: Build Node.js Backend ===
FROM node:18-alpine as backend_builder
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install
COPY backend/ .

# === Stage 2: Build Frontend ===
FROM node:18-alpine as frontend_builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .

# === Stage 3: Python Backend ===
FROM python:3.9-slim as python_builder
WORKDIR /app/backendOmni

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY backendOmni/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backendOmni/ .

# === Stage 4: Final Combined Image ===
FROM node:18-alpine

WORKDIR /app

# Install Python
RUN apk add --no-cache python3 py3-pip

# Copy backend
COPY --from=backend_builder /app/backend ./backend

# Copy frontend
COPY --from=frontend_builder /app/frontend ./frontend

# Copy Python backend
COPY --from=python_builder /app/backendOmni ./backendOmni
COPY --from=python_builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages

# Copy env (optional)
COPY .env* ./

# Add shell script to run all
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose ports (adjust as needed)
EXPOSE 3000 3001 5000

CMD ["/app/start.sh"]