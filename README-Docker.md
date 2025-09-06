# Docker Deployment Guide

This guide explains how to run your full-stack application using Docker and Docker Compose.

## Project Structure

```
my-app/
├── backend/
│   ├── Dockerfile
│   ├── app.py (or main.py)
│   └── requirements.txt
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── src/
├── docker-compose.yml
├── docker-compose.override.yml
└── env.example
```

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Local Development Setup

### 1. Clone and Setup Environment

```bash
# Clone your repository
git clone <your-repo-url>
cd my-app

# Copy environment file and configure
cp env.example .env
# Edit .env file with your actual values
```

### 2. Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up --build -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 3. Access Your Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017 (if needed for development tools)

### 4. Development Commands

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (careful: this deletes database data)
docker-compose down -v

# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Run commands in containers
docker-compose exec backend python manage.py migrate
docker-compose exec backend bash
docker-compose exec frontend npm install

# View container status
docker-compose ps

# View resource usage
docker stats
```

## Framework-Specific Backend Configuration

### FastAPI (Default)

The Dockerfile is configured for FastAPI. No changes needed.

### Flask

If using Flask, update the backend Dockerfile:

```dockerfile
# Change the CMD line to:
CMD ["python", "app.py"]

# And ensure your app.py has:
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
```

### Django

If using Django, update the backend Dockerfile:

```dockerfile
# Change the CMD line to:
CMD ["python", "manage.py", "runserver", "0.0.0.0:5000"]

# And add these commands before CMD:
RUN python manage.py collectstatic --noinput
RUN python manage.py migrate
```

## Production Optimizations

### 1. Remove Development Overrides

For production, remove or rename `docker-compose.override.yml`:

```bash
mv docker-compose.override.yml docker-compose.dev.yml
```

### 2. Use Production Environment Variables

Update your `.env` file with production values:

```env
NODE_ENV=production
DEBUG=false
DATABASE_URL=your-production-database-url
SECRET_KEY=your-production-secret-key
```

### 3. Enable SSL (Optional)

Create nginx configuration for SSL:

```bash
mkdir nginx
# Add your SSL certificates and nginx.conf
```

## Troubleshooting

### Common Issues

1. **Port already in use**

   ```bash
   # Check what's using the port
   lsof -i :3000
   lsof -i :5000

   # Kill the process or change ports in docker-compose.yml
   ```

2. **Permission denied errors**

   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

3. **Database connection issues**

   ```bash
   # Check if MongoDB is running
   docker-compose logs mongodb

   # Restart MongoDB
   docker-compose restart mongodb
   ```

4. **Build failures**

   ```bash
   # Clean build cache
   docker system prune -a

   # Rebuild without cache
   docker-compose build --no-cache
   ```

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# Debug specific container
docker-compose exec backend bash
docker-compose exec frontend sh
```

## Performance Tips

1. **Use .dockerignore files** in backend/ and frontend/ directories
2. **Multi-stage builds** are already implemented for the frontend
3. **Volume caching** is configured for development
4. **Health checks** are implemented for all services

## Next Steps

- Set up CI/CD pipeline
- Configure monitoring and logging
- Implement backup strategies
- Set up SSL certificates
- Configure reverse proxy for production
