# MongoDB Configuration Guide

## 🔍 Current MongoDB URL Status

### ✅ Current Default (Safe for Development)

```
mongodb://localhost:27017/adaptive_learning
```

This is safe and won't cause connection errors during deployment.

## 🚀 Production MongoDB URL Options

### Option 1: MongoDB Atlas (Recommended)

```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/adaptive_learning?retryWrites=true&w=majority
```

**Steps to set up:**

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create free cluster
3. Create database user
4. Get connection string
5. Replace `username`, `password`, and `cluster` with your values

### Option 2: Railway MongoDB Plugin

```env
DATABASE_URL=mongodb://username:password@mongodb.railway.internal:27017/railway
```

**Steps to set up:**

1. In Railway dashboard: Add → Database → MongoDB
2. Railway will provide the connection string
3. Use the provided `DATABASE_URL`

### Option 3: Docker Compose (Local Development)

```env
DATABASE_URL=mongodb://admin:password@mongodb:27017/myapp?authSource=admin
```

## 🔧 How to Set in Railway

### Method 1: Railway Dashboard

1. Go to your Railway project
2. Click on your service
3. Go to **Variables** tab
4. Add new variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Your MongoDB connection string

### Method 2: Railway CLI

```bash
railway variables set DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/adaptive_learning?retryWrites=true&w=majority"
```

## ✅ Current App Behavior

**Good news**: Your app is configured to:

- ✅ Start even if MongoDB is unavailable
- ✅ Show warning but continue running
- ✅ Health check works without MongoDB
- ✅ Some features work without database

## 🎯 Recommended Next Steps

### For Immediate Deployment Success:

**No action needed** - App will deploy successfully with current config

### For Full Functionality:

1. **Set up MongoDB Atlas** (free tier available)
2. **Add DATABASE_URL** to Railway variables
3. **Restart deployment** (Railway will auto-restart when you add variables)

## 🧪 Testing Database Connection

Once you set the DATABASE_URL:

### Test Basic Health:

```bash
curl https://your-app.railway.app/health
```

### Test Detailed Health (with MongoDB):

```bash
curl https://your-app.railway.app/health/detailed
```

Should show:

```json
{
  "status": "healthy",
  "timestamp": 1694123456.789,
  "mongodb": "connected"
}
```

## 🚨 Common MongoDB URL Issues

### ❌ Wrong Format:

```
mongodb://localhost:27017  # Missing database name
sqlite:///./app.db         # Wrong database type
```

### ✅ Correct Formats:

```
# Atlas
mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# Self-hosted
mongodb://user:pass@host:27017/dbname?authSource=admin

# Local development
mongodb://localhost:27017/dbname
```

## 💡 Pro Tips

1. **Use MongoDB Atlas free tier** for production
2. **Keep local fallback** for development
3. **Test connection** before deploying
4. **Use environment variables** never hardcode credentials
5. **Enable retryWrites** for better reliability

## 🎉 Current Status

Your MongoDB configuration is **correct and safe**:

- ✅ Won't cause deployment failures
- ✅ App starts without database
- ✅ Ready for database when you add it
- ✅ Graceful error handling

**Your deployment should work perfectly as-is!** 🚀
