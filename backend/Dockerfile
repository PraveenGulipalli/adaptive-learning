# Ultra-minimal Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Essential environment variables only
ENV PYTHONUNBUFFERED=1

# Copy and install Python dependencies (core only)
COPY requirements.txt .
RUN pip install --upgrade pip

# Install only essential packages to avoid build issues
RUN pip install \
    fastapi==0.104.1 \
    uvicorn==0.24.0 \
    python-dotenv==1.0.0 \
    motor==3.3.2 \
    pymongo==4.6.0 \
    google-generativeai==0.3.2 \
    aiohttp==3.12.15 \
    pydantic==2.5.0 \
    python-multipart==0.0.6

# Copy application
COPY . .

# Expose port
EXPOSE 5000

# Run application (no health check to avoid system dependencies)
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]