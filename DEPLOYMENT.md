# Cloud Deployment Guide

This guide covers deploying your Dockerized full-stack application to various cloud providers.

## Prerequisites

- Docker setup completed (see README-Docker.md)
- Application tested locally
- Cloud provider account
- Domain name (optional but recommended)

---

## 🚀 Render Deployment

Render provides excellent Docker support with automatic deployments from Git.

### 1. Prepare for Render

Create a `render.yaml` file in your project root:

```yaml
services:
  - type: web
    name: my-app-backend
    env: docker
    dockerfilePath: ./backend/Dockerfile
    dockerContext: ./backend
    plan: starter
    port: 5000
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: my-app-mongodb
          property: connectionString
      - key: SECRET_KEY
        generateValue: true
      - key: GOOGLE_API_KEY
        sync: false
    healthCheckPath: /health

  - type: web
    name: my-app-frontend
    env: docker
    dockerfilePath: ./frontend/Dockerfile
    dockerContext: ./frontend
    plan: starter
    port: 3000
    envVars:
      - key: REACT_APP_API_URL
        value: https://my-app-backend.onrender.com
    healthCheckPath: /health

databases:
  - name: my-app-mongodb
    databaseName: myapp
    plan: starter
```

### 2. Deploy to Render

1. **Connect Repository**:

   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml`

2. **Configure Environment Variables**:

   - Set `GOOGLE_API_KEY` in the Render dashboard
   - Other variables are auto-configured

3. **Deploy**:
   - Render automatically builds and deploys
   - Access your app at the provided URLs

### 3. Custom Domain (Optional)

```bash
# In Render dashboard:
# 1. Go to your frontend service
# 2. Settings → Custom Domains
# 3. Add your domain
# 4. Configure DNS CNAME record
```

---

## 🚄 Railway Deployment

Railway offers simple Docker deployments with excellent developer experience.

### 1. Install Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login
```

### 2. Deploy Services

```bash
# Initialize Railway project
railway init

# Deploy backend
cd backend
railway up --service backend

# Deploy frontend
cd ../frontend
railway up --service frontend

# Add MongoDB
railway add --service mongodb
```

### 3. Configure Environment Variables

```bash
# Set environment variables
railway variables set DATABASE_URL=mongodb://...
railway variables set SECRET_KEY=your-secret-key
railway variables set GOOGLE_API_KEY=your-api-key

# For frontend
railway variables set REACT_APP_API_URL=https://your-backend.railway.app
```

### 4. Railway Configuration File

Create `railway.toml` in your project root:

```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10

[[services]]
name = "backend"
source = "./backend"

[[services]]
name = "frontend"
source = "./frontend"
```

---

## ✈️ Fly.io Deployment

Fly.io provides excellent Docker support with global edge deployment.

### 1. Install Fly CLI

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login to Fly
fly auth login
```

### 2. Initialize Fly Apps

```bash
# Create backend app
cd backend
fly launch --name my-app-backend --region ord

# Create frontend app
cd ../frontend
fly launch --name my-app-frontend --region ord
```

### 3. Configure Fly.toml Files

Backend `fly.toml`:

```toml
app = "my-app-backend"
primary_region = "ord"

[build]
  dockerfile = "Dockerfile"

[http_service]
  internal_port = 5000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1

[[http_service.checks]]
  grace_period = "10s"
  interval = "30s"
  method = "GET"
  timeout = "5s"
  path = "/health"

[env]
  PORT = "5000"
  PYTHONPATH = "/app"

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512
```

Frontend `fly.toml`:

```toml
app = "my-app-frontend"
primary_region = "ord"

[build]
  dockerfile = "Dockerfile"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1

[[http_service.checks]]
  grace_period = "10s"
  interval = "30s"
  method = "GET"
  timeout = "5s"
  path = "/health"

[env]
  REACT_APP_API_URL = "https://my-app-backend.fly.dev"

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512
```

### 4. Set Secrets and Deploy

```bash
# Set secrets for backend
cd backend
fly secrets set DATABASE_URL=mongodb://...
fly secrets set SECRET_KEY=your-secret-key
fly secrets set GOOGLE_API_KEY=your-api-key

# Deploy backend
fly deploy

# Deploy frontend
cd ../frontend
fly deploy
```

### 5. Add MongoDB

```bash
# Create MongoDB using Fly Postgres (or external service)
fly postgres create --name my-app-db --region ord

# Or use external MongoDB Atlas
# Set DATABASE_URL to your Atlas connection string
```

---

## 🌊 DigitalOcean App Platform

### 1. Create App Spec

Create `.do/app.yaml`:

```yaml
name: my-app
services:
  - name: backend
    source_dir: /backend
    dockerfile_path: backend/Dockerfile
    github:
      repo: your-username/your-repo
      branch: main
    http_port: 5000
    instance_count: 1
    instance_size_slug: basic-xxs
    env_vars:
      - key: DATABASE_URL
        scope: RUN_AND_BUILD_TIME
        type: SECRET
      - key: SECRET_KEY
        scope: RUN_AND_BUILD_TIME
        type: SECRET
    health_check:
      http_path: /health

  - name: frontend
    source_dir: /frontend
    dockerfile_path: frontend/Dockerfile
    github:
      repo: your-username/your-repo
      branch: main
    http_port: 3000
    instance_count: 1
    instance_size_slug: basic-xxs
    env_vars:
      - key: REACT_APP_API_URL
        value: ${backend.PUBLIC_URL}
    health_check:
      http_path: /health

databases:
  - name: mongodb
    engine: MONGODB
    version: "5"
    size: basic-xs
```

### 2. Deploy

```bash
# Install doctl CLI
# Deploy using the app spec
doctl apps create --spec .do/app.yaml
```

---

## 🔧 General Cloud Deployment Tips

### 1. Environment Variables

Always set these environment variables in your cloud provider:

```env
# Backend
DATABASE_URL=your-mongodb-connection-string
SECRET_KEY=your-secret-key
GOOGLE_API_KEY=your-google-api-key
NODE_ENV=production

# Frontend
REACT_APP_API_URL=https://your-backend-url
REACT_APP_ENV=production
```

### 2. Health Checks

All Dockerfiles include health check endpoints:

- Backend: `/health`
- Frontend: `/health`

### 3. Database Options

**Managed MongoDB Services**:

- MongoDB Atlas (recommended)
- DigitalOcean Managed MongoDB
- AWS DocumentDB
- Azure Cosmos DB

**Connection String Format**:

```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### 4. SSL/HTTPS

Most cloud providers automatically provide SSL certificates:

- Render: Automatic SSL
- Railway: Automatic SSL
- Fly.io: Automatic SSL
- DigitalOcean: Automatic SSL

### 5. Custom Domains

1. Add domain in cloud provider dashboard
2. Update DNS records:
   ```
   CNAME www your-app.provider.com
   A @ provider-ip-address
   ```

### 6. Monitoring and Logs

```bash
# Render
# View logs in dashboard or CLI
render logs --service my-app-backend

# Railway
railway logs --service backend

# Fly.io
fly logs --app my-app-backend

# DigitalOcean
doctl apps logs your-app-id
```

### 7. Scaling

```bash
# Fly.io
fly scale count 2 --app my-app-backend

# Railway
railway scale --replicas 2

# Most providers offer auto-scaling in dashboard
```

---

## 🚨 Production Checklist

- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Health checks working
- [ ] SSL certificates active
- [ ] Custom domain configured (if needed)
- [ ] Monitoring and alerts set up
- [ ] Backup strategy implemented
- [ ] CI/CD pipeline configured
- [ ] Security headers configured
- [ ] Rate limiting implemented

---

## 💰 Cost Optimization

1. **Start Small**: Use basic/starter plans initially
2. **Monitor Usage**: Set up billing alerts
3. **Auto-scaling**: Configure based on traffic patterns
4. **Database**: Use managed services for production
5. **CDN**: Consider adding CloudFlare for static assets

---

## 🔍 Troubleshooting

### Common Issues

1. **Build Failures**:

   - Check Dockerfile syntax
   - Verify all dependencies in requirements.txt/package.json
   - Check build logs for specific errors

2. **Database Connection**:

   - Verify DATABASE_URL format
   - Check network connectivity
   - Ensure database is running

3. **Environment Variables**:

   - Double-check variable names
   - Ensure secrets are properly set
   - Verify frontend can reach backend

4. **Health Check Failures**:
   - Test health endpoints locally
   - Check port configurations
   - Verify application startup time

### Getting Help

- Check cloud provider documentation
- Review application logs
- Test locally with same environment variables
- Use cloud provider support channels
