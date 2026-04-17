# 🚀 DEPLOYMENT GUIDE - Vercel (Frontend) + Render (Backend)

**Status:** Step-by-step guide for production deployment  
**Frontend:** Vercel  
**Backend:** Render  
**Database:** MongoDB Atlas (Cloud)  
**Cache:** Redis Cloud  

---

## ⚠️ CRITICAL: BEFORE DEPLOYMENT

### Issues to Fix (46 hardcoded localhost references found)
- ❌ `client/src/api/api.jsx` - localhost:5001
- ❌ `client/src/pages/*` - Multiple files with hardcoded URLs
- ❌ `server/.env` - Redis localhost, MongoDB credentials exposed
- ❌ Socket.io connections hardcoded to localhost

---

## 🔧 STEP 1: FRONTEND SETUP (Client Folder)

### Step 1.1: Create `.env.development` file

**File:** `client/.env.development`

```env
# Development environment
VITE_API_BASE_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

### Step 1.2: Create `.env.production` file

**File:** `client/.env.production`

```env
# Production environment - Will be set on Vercel
VITE_API_BASE_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
```

### Step 1.3: Update `vite.config.js`

Add this to make environment variables accessible:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    __API_BASE_URL__: JSON.stringify(process.env.VITE_API_BASE_URL || 'http://localhost:5001/api'),
    __SOCKET_URL__: JSON.stringify(process.env.VITE_SOCKET_URL || 'http://localhost:5001'),
  },
})
```

### Step 1.4: Update `src/api/api.jsx`

Replace hardcoded localhost with environment variable:

```javascript
import axios from 'axios';

// Use environment variable or fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ... rest of interceptors
```

---

## 🔧 STEP 2: BACKEND SETUP (Server Folder)

### Step 2.1: Update `server/.env` for Production

**File:** `server/.env` (Update existing)

```env
# Production Environment
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/electroland?retryWrites=true&w=majority
REDIS_URL=redis://:PASSWORD@your-redis-host:PORT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
CORS_ORIGIN=https://your-frontend-vercel-url.vercel.app
```

### Step 2.2: Update `server/server.js` for CORS

Add/update CORS configuration:

```javascript
const cors = require('cors');

// CORS configuration for production
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
};

app.use(cors(corsOptions));
```

### Step 2.3: Check `server/config/redis.js`

Ensure it handles Redis URL properly:

```javascript
const Redis = require('ioredis');

const initRedis = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  redisClient = new Redis(redisUrl, {
    retryStrategy: (times) => {
      if (times > 3) {
        console.warn('[REDIS] Failed after 3 retries. Caching disabled.');
        return null;
      }
      return Math.min(times * 50, 2000);
    }
  });
  // ... rest of code
};
```

---

## 📦 STEP 3: SETUP CLOUD SERVICES

### Step 3.1: MongoDB Atlas Setup

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create account and new project
3. Create cluster (M0 Free tier)
4. Create database user (not default admin)
5. Whitelist IPs (Allow 0.0.0.0 for Render)
6. Copy connection string: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`
7. Use in `MONGO_URI` in `.env`

### Step 3.2: Redis Cloud Setup

1. Go to [redis.com/try-free](https://redis.com/try-free)
2. Create free account
3. Create database (30MB free)
4. Copy connection URL: `redis://:password@host:port`
5. Use in `REDIS_URL` in `.env`

### Step 3.3: Create `.gitignore` entries

**File:** `server/.env.local` (don't commit)

```
.env
.env.local
.env.production
node_modules/
coverage/
```

---

## 🚀 STEP 4: DEPLOYMENT TO RENDER (Backend)

### Step 4.1: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up (can use GitHub)
3. Connect your GitHub repository

### Step 4.2: Deploy Backend Service

1. **New Service** → **Web Service**
2. **Select GitHub repo** (FDFED_React)
3. **Configuration:**
   - Name: `electroland-backend` (or your choice)
   - Environment: `Node`
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Instance Type: Free (or Starter)
   - Region: Closest to you

4. **Add Environment Variables:**
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `MONGO_URI` = `mongodb+srv://...` (from MongoDB Atlas)
   - `REDIS_URL` = `redis://:...` (from Redis Cloud)
   - `JWT_SECRET` = `your-secret-key`
   - `EMAIL_USER` = `your-email@gmail.com`
   - `EMAIL_PASS` = `app-password`
   - `RAZORPAY_KEY_ID` = `your-key`
   - `RAZORPAY_KEY_SECRET` = `your-secret`
   - `CORS_ORIGIN` = `https://your-vercel-frontend.vercel.app`

5. **Deploy** and wait for build to complete

6. **Get your Backend URL:** `https://electroland-backend.onrender.com`

---

## 🚀 STEP 5: DEPLOYMENT TO VERCEL (Frontend)

### Step 5.1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up (can use GitHub)
3. Connect your GitHub repository

### Step 5.2: Deploy Frontend

1. **Import Project** → Select **FDFED_React**
2. **Configuration:**
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add Environment Variables:**
   - `VITE_API_BASE_URL` = `https://your-render-backend.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://your-render-backend.onrender.com`

4. **Deploy** and wait for build to complete

5. **Get your Frontend URL:** `https://your-app.vercel.app`

---

## ✅ STEP 6: POST-DEPLOYMENT CHECKLIST

After deployment, verify everything works:

```
Frontend:
☑ Website loads at https://your-app.vercel.app
☑ Login/Signup works
☑ API calls succeed (check Network tab in DevTools)
☑ Swagger docs accessible: https://backend-url/api-docs

Backend:
☑ API responds at https://backend-url/api/ourproducts
☑ Database connected (check logs on Render)
☑ Redis connected (check logs on Render)
☑ CORS errors not present

Production:
☑ No localhost references in frontend
☑ Environment variables set on both platforms
☑ HTTPS working on both frontend and backend
☑ Socket.io working for real-time features
```

---

## 🔍 TROUBLESHOOTING

### Frontend shows blank page
- Check browser console for errors
- Verify `VITE_API_BASE_URL` is set correctly in Vercel
- Check Network tab to see if API calls are failing

### API calls return CORS error
- Backend `CORS_ORIGIN` doesn't match frontend URL
- Update `CORS_ORIGIN` in Render environment variables
- Restart Render service after updating

### Socket.io connection fails
- Backend `SOCKET_URL` doesn't match socket connection URL
- Use same domain as API base URL (backend domain)
- Check that socket.io is enabled on backend

### Database connection timeout
- MongoDB whitelist IPs - Add Render IP to MongoDB Atlas
- Redis connection - Check if Redis URL is correct
- Try connecting directly from MongoDB Atlas dashboard

### 502/503 Bad Gateway on Render
- Check build logs for errors
- Verify all environment variables are set
- Check if service is running: `npm start` works locally
- Restart the service on Render dashboard

---

## 📝 SUMMARY OF CHANGES

### Files to Update:
1. ✅ `client/.env.development` - Create new
2. ✅ `client/.env.production` - Create new
3. ✅ `client/vite.config.js` - Update to expose env vars
4. ✅ `client/src/api/api.jsx` - Use env variable
5. ✅ `client/src/pages/*` - Replace all hardcoded URLs (see Step 7)
6. ✅ `server/.env` - Update with cloud services URLs
7. ✅ `server/server.js` - Update CORS with env variable

### Services to Create:
1. ✅ MongoDB Atlas account + cluster
2. ✅ Redis Cloud account + database
3. ✅ Render account + backend service
4. ✅ Vercel account + frontend deployment

---

## 🎯 NEXT STEPS

1. **Read Step 7** below for file-by-file updates
2. **Setup cloud services** (MongoDB Atlas, Redis Cloud)
3. **Deploy backend** to Render first
4. **Update frontend** env variables
5. **Deploy frontend** to Vercel
6. **Test everything** end-to-end
7. **Share deployed links** for professor review

---

## ❌ COMMON MISTAKES TO AVOID

1. ❌ Not updating `VITE_API_BASE_URL` after getting Render URL
2. ❌ Not adding Render IP to MongoDB whitelist
3. ❌ Using `http://` instead of `https://` in production
4. ❌ Committing `.env` file with secrets to GitHub
5. ❌ Not setting `CORS_ORIGIN` on backend
6. ❌ Using wrong environment variable names (missing `VITE_` prefix in frontend)

---

**Proceed to Step 7 for detailed file updates →**
