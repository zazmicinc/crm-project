FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Cloud Run will set PORT environment variable
ENV PORT=8000

EXPOSE 8000

# Use PORT environment variable from Cloud Run
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
