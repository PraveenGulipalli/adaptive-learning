# Root Dockerfile - Multi-service deployment
# This is a fallback if the platform requires a root Dockerfile

ARG SERVICE_TYPE=backend

# Backend build
FROM python:3.11-slim AS backend-build
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
EXPOSE 5000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]

# Frontend build
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM nginx:alpine AS frontend-serve
RUN apk add --no-cache curl
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /app/build /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]

# Final stage - choose based on SERVICE_TYPE
FROM backend-build AS backend
FROM frontend-serve AS frontend

# Default to backend if no SERVICE_TYPE specified
FROM ${SERVICE_TYPE} AS final
