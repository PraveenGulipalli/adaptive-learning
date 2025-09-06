FROM python:3.11-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1
RUN pip install fastapi uvicorn
COPY . .
EXPOSE 5000
CMD ["python", "-c", "from fastapi import FastAPI; import uvicorn; app = FastAPI(); app.add_api_route('/', lambda: {'status': 'ok'}); app.add_api_route('/health', lambda: {'status': 'healthy'}); uvicorn.run(app, host='0.0.0.0', port=5000)"]