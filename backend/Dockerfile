# Simplified Backend Dockerfile for FastAPI
FROM python:3.11-slim

WORKDIR /app

# Essential environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Install only essential packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip

# Install dependencies with fallback for problematic packages
RUN pip install --no-cache-dir -r requirements.txt || \
    (echo "Some packages failed, installing core dependencies..." && \
     pip install --no-cache-dir \
        fastapi==0.104.1 \
        uvicorn[standard]==0.24.0 \
        pydantic==2.5.0 \
        pydantic-settings==2.1.0 \
        python-multipart==0.0.6 \
        python-dotenv==1.0.0 \
        google-generativeai==0.3.2 \
        motor==3.3.2 \
        pymongo==4.6.0 \
        aiohttp)

# Copy application
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]

# Alternative commands for other frameworks:
# For Flask: CMD ["python", "app.py"]
# For Django: CMD ["python", "manage.py", "runserver", "0.0.0.0:5000"]