# Deployment Troubleshooting Guide

## 🚨 Common Deployment Issues and Solutions

### Issue: "Nixpacks build failed" / "No start command could be found"

**Problem**: The platform is trying to use Nixpacks instead of Docker.

**Solutions**:

1. **Force Docker Usage** - Add these files to your root directory:

   ```bash
   # nixpacks.toml
   [build]
   nixpacks = false
   ```

2. **Railway Configuration** - Use `railway.toml`:

   ```toml
   [build]
   builder = "dockerfile"
   dockerfilePath = "Dockerfile"
   ```

3. **Render Configuration** - Use `render.yaml` (already created)

4. **Platform-Specific Settings**:
   - **Railway**: Go to Settings → Build → Set "Builder" to "Dockerfile"
   - **Render**: Ensure "Environment" is set to "Docker"
   - **Fly.io**: Uses Dockerfile by default

### Issue: Frontend Build Failures

**Problem**: React build fails during Docker build.

**Solutions**:

1. **Check package.json** exists in frontend directory
2. **Verify build script** in package.json:

   ```json
   {
     "scripts": {
       "build": "react-scripts build --no-eslint"
     }
   }
   ```

3. **Use simplified Dockerfile** (Dockerfile.simple provided)

4. **Environment Variables** - Ensure REACT*APP* variables are set:
   ```env
   REACT_APP_API_URL=https://your-backend-url
   REACT_APP_ENV=production
   ```

### Issue: Backend Build Failures

**Problem**: Python dependencies fail to install.

**Solutions**:

1. **Check requirements.txt** exists and is complete
2. **Python version compatibility** - Update Dockerfile:

   ```dockerfile
   FROM python:3.11-slim  # Use compatible version
   ```

3. **System dependencies** - Add to Dockerfile if needed:
   ```dockerfile
   RUN apt-get update && apt-get install -y \
       build-essential \
       libpq-dev \
       && rm -rf /var/lib/apt/lists/*
   ```

### Issue: Port Configuration Problems

**Problem**: Application not accessible on expected ports.

**Solutions**:

1. **Check Dockerfile EXPOSE** statements:

   ```dockerfile
   # Backend
   EXPOSE 5000

   # Frontend
   EXPOSE 3000
   ```

2. **Verify application binding**:

   ```python
   # FastAPI
   uvicorn.run(app, host="0.0.0.0", port=5000)

   # Flask
   app.run(host="0.0.0.0", port=5000)
   ```

3. **Platform port configuration**:
   - Most platforms auto-detect from EXPOSE
   - Some require manual port setting in dashboard

### Issue: Environment Variables Not Working

**Problem**: App can't access environment variables.

**Solutions**:

1. **Set in platform dashboard**:

   - Railway: Variables tab
   - Render: Environment tab
   - Fly.io: `fly secrets set KEY=value`

2. **Check variable names**:

   ```env
   # Backend
   DATABASE_URL=mongodb://...
   SECRET_KEY=your-secret

   # Frontend (must start with REACT_APP_)
   REACT_APP_API_URL=https://backend-url
   ```

3. **Verify in Dockerfile**:
   ```dockerfile
   ENV NODE_ENV=production
   ENV PYTHONPATH=/app
   ```

### Issue: Database Connection Failures

**Problem**: Can't connect to MongoDB.

**Solutions**:

1. **Use managed database**:

   - MongoDB Atlas (recommended)
   - Platform-provided databases

2. **Connection string format**:

   ```
   mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   ```

3. **Network configuration**:
   - Ensure database allows connections from your platform
   - Check IP whitelist settings

### Issue: Health Check Failures

**Problem**: Platform reports unhealthy services.

**Solutions**:

1. **Add health endpoints** to your applications:

   ```python
   # FastAPI
   @app.get("/health")
   def health():
       return {"status": "healthy"}
   ```

2. **Update Dockerfile health checks**:

   ```dockerfile
   HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
       CMD curl -f http://localhost:5000/health || exit 1
   ```

3. **Install curl** in containers:
   ```dockerfile
   RUN apk add --no-cache curl  # Alpine
   RUN apt-get update && apt-get install -y curl  # Debian/Ubuntu
   ```

## 🔧 Platform-Specific Fixes

### Railway

1. **Settings → Build**:

   - Builder: Dockerfile
   - Root Directory: (leave empty for monorepo)

2. **For monorepo deployment**:

   - Deploy backend: Set Root Directory to `backend`
   - Deploy frontend: Set Root Directory to `frontend`

3. **Environment Variables**:
   - Add in Variables tab
   - Use Railway's provided DATABASE_URL if using their database

### Render

1. **Service Configuration**:

   - Environment: Docker
   - Dockerfile Path: `./backend/Dockerfile` or `./frontend/Dockerfile`
   - Docker Context: `./backend` or `./frontend`

2. **Auto-Deploy**:
   - Connect GitHub repository
   - Enable auto-deploy on push

### Fly.io

1. **Separate apps for backend/frontend**:

   ```bash
   # Backend
   cd backend
   fly launch --name my-app-backend

   # Frontend
   cd ../frontend
   fly launch --name my-app-frontend
   ```

2. **Set secrets**:
   ```bash
   fly secrets set DATABASE_URL=mongodb://...
   fly secrets set SECRET_KEY=your-secret
   ```

## 🚀 Quick Deployment Checklist

- [ ] Dockerfile exists and builds locally
- [ ] Environment variables configured
- [ ] Health endpoints implemented
- [ ] Database connection string set
- [ ] Platform configured to use Docker
- [ ] Ports properly exposed
- [ ] Dependencies complete in requirements.txt/package.json
- [ ] Build scripts work locally

## 🆘 Emergency Fixes

### If deployment is completely broken:

1. **Use simplified Dockerfiles**:

   - Copy `Dockerfile.simple` over `Dockerfile`
   - Remove complex configurations

2. **Minimal environment variables**:

   ```env
   NODE_ENV=production
   DATABASE_URL=your-db-url
   ```

3. **Disable features temporarily**:

   - Comment out health checks
   - Remove non-essential dependencies
   - Use basic configurations

4. **Deploy single service first**:
   - Get backend working first
   - Then add frontend
   - Finally add database

### Contact Support

If issues persist:

- Railway: Discord community or support
- Render: Support tickets
- Fly.io: Community forum
- Include deployment logs and configuration details
