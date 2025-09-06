# Monorepo Deployment Guide

## 🏗️ Project Structure

```
adaptive-learning/
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── Dockerfile (root - fallback)
├── railway.toml
└── deployment configs
```

## 🚀 Deployment Options

### Option 1: Separate Services (Recommended)

Deploy backend and frontend as separate services:

#### Railway:

1. **Create Backend Service**:

   - New Project → Import from GitHub
   - Service Name: `adaptive-learning-backend`
   - Settings → Build:
     - Root Directory: `backend`
     - Builder: Dockerfile
     - Dockerfile Path: `Dockerfile` (relative to root directory)

2. **Create Frontend Service**:
   - Add Service → GitHub Repo
   - Service Name: `adaptive-learning-frontend`
   - Settings → Build:
     - Root Directory: `frontend`
     - Builder: Dockerfile
     - Dockerfile Path: `Dockerfile` (relative to root directory)

#### Render:

Use the `render.yaml` configuration:

```yaml
services:
  - type: web
    name: adaptive-learning-backend
    env: docker
    dockerfilePath: ./backend/Dockerfile
    dockerContext: ./backend
    # ... other config

  - type: web
    name: adaptive-learning-frontend
    env: docker
    dockerfilePath: ./frontend/Dockerfile
    dockerContext: ./frontend
    # ... other config
```

### Option 2: Single Service with Build Args

Use the root Dockerfile with build arguments:

#### For Backend:

```bash
# Set environment variable in platform
SERVICE_TYPE=backend
```

#### For Frontend:

```bash
# Set environment variable in platform
SERVICE_TYPE=frontend
```

## 🔧 Platform-Specific Instructions

### Railway

#### Method 1: Separate Services

1. **Deploy Backend**:

   ```bash
   # In Railway dashboard:
   # - New Project → Import Repository
   # - Settings → Build → Root Directory: backend
   # - Settings → Build → Dockerfile Path: Dockerfile
   ```

2. **Deploy Frontend**:
   ```bash
   # Add new service to same project:
   # - Add Service → GitHub Repo (same repo)
   # - Settings → Build → Root Directory: frontend
   # - Settings → Build → Dockerfile Path: Dockerfile
   ```

#### Method 2: Using railway.toml

- For backend: Use `railway.toml` (points to backend/Dockerfile)
- For frontend: Create separate service with `railway-frontend.toml`

### Render

#### Using render.yaml

The `render.yaml` file handles both services automatically:

- Backend: `dockerContext: ./backend`
- Frontend: `dockerContext: ./frontend`

### Fly.io

#### Separate Apps

```bash
# Backend
cd backend
fly launch --name adaptive-learning-backend

# Frontend
cd ../frontend
fly launch --name adaptive-learning-frontend
```

## 🐛 Troubleshooting

### "Dockerfile does not exist"

**Problem**: Platform can't find Dockerfile in expected location.

**Solutions**:

1. **Check Root Directory Setting**:

   - Railway: Settings → Build → Root Directory
   - Should be `backend` or `frontend`, not empty

2. **Verify Dockerfile Path**:

   - Should be `Dockerfile` (relative to root directory)
   - NOT `backend/Dockerfile` if root directory is `backend`

3. **File Structure Check**:

   ```bash
   # Ensure these files exist:
   backend/Dockerfile
   frontend/Dockerfile

   # NOT:
   Dockerfile (in root) - unless using Option 2
   ```

### Build Context Issues

**Problem**: COPY commands fail during build.

**Solutions**:

1. **Dockerfile COPY paths should be relative to the service directory**:

   ```dockerfile
   # In backend/Dockerfile:
   COPY requirements.txt .  # ✅ Correct
   COPY backend/requirements.txt .  # ❌ Wrong

   # In frontend/Dockerfile:
   COPY package*.json ./  # ✅ Correct
   COPY frontend/package*.json ./  # ❌ Wrong
   ```

2. **Set correct Docker context in platform**:
   - Railway: Root Directory = `backend` or `frontend`
   - Render: `dockerContext: ./backend` or `./frontend`

### Environment Variables

**Backend**:

```env
DATABASE_URL=mongodb://...
SECRET_KEY=your-secret
GOOGLE_API_KEY=your-key
NODE_ENV=production
PYTHONPATH=/app
```

**Frontend**:

```env
REACT_APP_API_URL=https://your-backend-url
REACT_APP_ENV=production
```

## ✅ Deployment Checklist

### Before Deployment:

- [ ] `backend/Dockerfile` exists and builds locally
- [ ] `frontend/Dockerfile` exists and builds locally
- [ ] `backend/requirements.txt` is complete
- [ ] `frontend/package.json` has build script
- [ ] Environment variables are ready

### Platform Configuration:

- [ ] Root directory set correctly (`backend` or `frontend`)
- [ ] Dockerfile path is `Dockerfile` (not full path)
- [ ] Builder set to "Dockerfile"
- [ ] Environment variables configured
- [ ] Health check paths set (`/health`)

### Post-Deployment:

- [ ] Both services are running
- [ ] Frontend can reach backend API
- [ ] Database connections work
- [ ] Health checks pass

## 🚨 Common Mistakes

1. **Wrong Root Directory**: Setting root to empty instead of `backend`/`frontend`
2. **Wrong Dockerfile Path**: Using `backend/Dockerfile` instead of `Dockerfile`
3. **Missing Files**: Dockerfile doesn't exist in the specified location
4. **Build Context**: COPY paths wrong in Dockerfile
5. **Environment Variables**: Missing REACT*APP* prefix for frontend vars

## 💡 Pro Tips

1. **Test Locally First**:

   ```bash
   # Test backend build
   cd backend && docker build -t backend-test .

   # Test frontend build
   cd frontend && docker build -t frontend-test .
   ```

2. **Use Specific Tags**:

   ```dockerfile
   FROM node:18-alpine  # ✅ Specific version
   FROM node:latest     # ❌ Avoid latest
   ```

3. **Optimize Build Times**:

   - Copy package files first for better caching
   - Use .dockerignore files
   - Multi-stage builds for frontend

4. **Monitor Logs**:
   - Check build logs for specific errors
   - Monitor application logs after deployment
   - Set up health checks

## 🆘 Emergency Fixes

If deployment is completely broken:

1. **Use simplified Dockerfiles**:

   ```bash
   cp frontend/Dockerfile.simple frontend/Dockerfile
   ```

2. **Deploy one service at a time**:

   - Get backend working first
   - Then add frontend

3. **Check platform status pages**:

   - Railway, Render, Fly.io status pages
   - May be platform-wide issues

4. **Rollback if needed**:
   - Most platforms support rollback to previous deployment
   - Use while debugging current issues
