# 📋 STEP-BY-STEP DEPLOYMENT INSTRUCTIONS

**Last Updated:** February 2026  
**Application:** Electroland E-Commerce Platform  
**Frontend:** Vercel  
**Backend:** Render  

---

## ✅ WHAT HAS BEEN DONE

Your codebase has been prepared for production deployment:

### Frontend Changes (Client Folder)
- ✅ Created `.env.development` with localhost configuration
- ✅ Created `.env.production` for production builds
- ✅ Updated `vite.config.js` to expose environment variables
- ✅ Updated `client/src/api/api.jsx` to use `VITE_API_BASE_URL`
- ✅ Updated 11 component files to use environment variables instead of hardcoded localhost:
  - CompanyAnalyticsPage.jsx
  - Companymessages.jsx
  - CompanyOrders.jsx
  - CompanyComplaints.jsx
  - ForgotPassword.jsx
  - ManagerMessages.jsx
  - NewProducts.jsx
  - OurProducts.jsx
  - TopProducts.jsx
  - SalesmanMessages.jsx
  - OwnerMessages.jsx

### Backend Changes (Server Folder)
- ✅ Updated `server/.env` with production configuration template
- ✅ Updated `server/server.js` CORS configuration to use `CORS_ORIGIN` environment variable
- ✅ Updated Helmet CSP to use dynamic origin from environment
- ✅ Redis configuration already uses `REDIS_URL` environment variable
- ✅ Database configuration already uses `MONGO_URI` environment variable
- ✅ PORT already uses `process.env.PORT`

---

## 🚀 DEPLOYMENT STEPS

### PREREQUISITE: Create Cloud Service Accounts

Before deploying, you need to create accounts for cloud services:

#### 1️⃣ MongoDB Atlas (Database)

1. Go to **https://www.mongodb.com/cloud/atlas**
2. Click **"Try Free"** or **"Sign Up"**
3. Create account with email/password
4. **Create a Project:**
   - Project Name: "Electroland" (or your choice)
   - Click **"Create Project"**

5. **Create a Cluster:**
   - Select **"M0 FREE"** tier
   - Cloud Provider: **AWS**
   - Region: Select closest to you
   - Click **"Create"** (wait 3-5 minutes)

6. **Create Database User:**
   - Go to **"Database Access"**
   - Click **"Add New Database User"**
   - Username: `electroland_user` (or your choice)
   - Password: Generate secure password (copy it!)
   - Click **"Add User"**

7. **Allow Network Access:**
   - Go to **"Network Access"**
   - Click **"Add IP Address"**
   - Select **"Allow Access from Anywhere"** (0.0.0.0/0) - For Render
   - Click **"Confirm"**

8. **Get Connection String:**
   - Go to **"Databases"**
   - Click **"Connect"**
   - Select **"Connect your application"**
   - Copy the connection string: `mongodb+srv://username:password@cluster.mongodb.net/...`
   - Save this for later (use in Render env variables)

#### 2️⃣ Redis Cloud (Cache)

1. Go to **https://redis.com/try-free/**
2. Click **"Get Started"**
3. Create account (Email/Google/GitHub)
4. **Create Database:**
   - Subscription: **Free (30MB)**
   - Click **"Create"**

5. **Get Connection URL:**
   - Click on your database
   - Go to **"Configuration"** tab
   - Copy **Default user** password
   - Connection URL format: `redis://:PASSWORD@host:port`
   - Save this for later

---

### PHASE 1: DEPLOY BACKEND TO RENDER

#### Step 1: Create Render Account

1. Go to **https://render.com**
2. Click **"Get Started"**
3. Sign up with GitHub (recommended - easier for deployments)
4. Link your GitHub repository

#### Step 2: Create Backend Service on Render

1. **In Render Dashboard:**
   - Click **"New +"**
   - Select **"Web Service"**

2. **Select Repository:**
   - Find your **FDFED_React** repository
   - Click **"Connect"**

3. **Configure Service:**
   - **Name:** `electroland-backend`
   - **Environment:** `Node`
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && npm start`
   - **Instance Type:** `Free` (for testing) or `Starter`
   - **Region:** Select your region
   - Click **"Create Web Service"**

4. **Add Environment Variables:**
   - In Render dashboard, go to **"Environment"** tab
   - Click **"Add Environment Variable"** and add these:

   ```
   NODE_ENV                = production
   PORT                    = 5000
   MONGO_URI              = mongodb+srv://username:password@cluster.mongodb.net/electroland?retryWrites=true&w=majority
   REDIS_URL              = redis://:password@host:port
   JWT_SECRET             = your-super-secret-key-min-32-chars
   EMAIL_USER             = electroland2005@gmail.com
   EMAIL_PASS             = wcqr fdct qndq znrx
   RAZORPAY_KEY_ID        = rzp_test_SWP1MbSaI7aQNQ
   RAZORPAY_KEY_SECRET    = KDcrhnaJwT8cNhW6IKICt9fX
   CORS_ORIGIN            = https://your-vercel-frontend.vercel.app
   ```

   - Replace values with your actual credentials
   - Click **"Save Changes"**

5. **Wait for Deployment:**
   - Watch the **"Deploy Log"** for build progress
   - Wait until you see: ✅ **"Your service is live!"**
   - Copy your Backend URL (format: `https://electroland-backend.onrender.com`)

6. **Verify Backend is Running:**
   - Open: `https://your-backend-url.onrender.com/api-docs`
   - You should see the Swagger API documentation
   - If you see this, your backend is working! ✅

---

### PHASE 2: DEPLOY FRONTEND TO VERCEL

#### Step 1: Create Vercel Account

1. Go to **https://vercel.com**
2. Click **"Sign Up"**
3. Sign up with GitHub (recommended)
4. Link your GitHub repository

#### Step 2: Deploy Frontend to Vercel

1. **In Vercel Dashboard:**
   - Click **"Add New..."**
   - Select **"Project"**

2. **Import Project:**
   - Find your **FDFED_React** repository
   - Click **"Import"**

3. **Configure Project:**
   - **Framework Preset:** React
   - **Root Directory:** `client` ⚠️ **IMPORTANT!**
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Add Environment Variables:**
   - Click **"Environment Variables"**
   - Add these variables:

   ```
   VITE_API_BASE_URL     = https://your-backend-url.onrender.com/api
   VITE_SOCKET_URL       = https://your-backend-url.onrender.com
   ```

   - Replace `your-backend-url` with your actual Render backend URL (from Phase 1, Step 5)
   - Click **"Save"**

5. **Deploy:**
   - Click **"Deploy"**
   - Wait for build to complete
   - You should see: ✅ **"Congratulations! Your project has been successfully deployed!"**
   - Copy your Frontend URL (format: `https://your-app.vercel.app`)

6. **Update Backend CORS:**
   - Go back to **Render Dashboard**
   - Go to **Environment** tab
   - Update `CORS_ORIGIN` to your Vercel frontend URL: `https://your-app.vercel.app`
   - Click **"Save Changes"**
   - Backend will auto-redeploy ⏳

---

## ✅ VERIFICATION CHECKLIST

After both deployments are live, test everything:

### Frontend Tests (Vercel URL)

- [ ] Website loads at `https://your-app.vercel.app`
- [ ] No errors in browser console (DevTools → Console tab)
- [ ] Login page appears correctly
- [ ] Can login with test credentials
- [ ] After login, dashboard loads
- [ ] API calls work (DevTools → Network tab, look for API calls succeeding)

### Backend Tests (Render URL)

- [ ] API Swagger docs load at `https://your-backend.onrender.com/api-docs`
- [ ] API response test: `https://your-backend.onrender.com/api/ourproducts`
- [ ] Database connected (check Render logs - should show MongoDB connected)
- [ ] Redis connected (check Render logs - should show Redis available)

### Feature Tests

- [ ] ✅ Login/Signup works
- [ ] ✅ Product listing loads
- [ ] ✅ Search functionality works
- [ ] ✅ Shopping cart works
- [ ] ✅ Messages/Chat (Socket.io) works
- [ ] ✅ Analytics loads (for company role)
- [ ] ✅ Complaints loading works (for company role)
- [ ] ✅ Orders page works

---

## ❌ COMMON ISSUES & SOLUTIONS

### Issue 1: Frontend shows blank page / 404

**Causes:**
- Vercel root directory not set to `client`
- Build command incorrect

**Solution:**
1. Go to Vercel project settings
2. Verify **"Root Directory"** is set to `client`
3. Verify **"Build Command"** is `npm run build`
4. Redeploy

### Issue 2: API calls failing (CORS error in console)

**Causes:**
- `VITE_API_BASE_URL` not set correctly
- Backend `CORS_ORIGIN` doesn't match frontend URL
- Frontend URL has trailing slash mismatch

**Solution:**
1. Check Vercel Environment Variables:
   - `VITE_API_BASE_URL` should be `https://your-render-backend.onrender.com/api`
2. Check Render Environment Variables:
   - `CORS_ORIGIN` should be `https://your-vercel-app.vercel.app` (no trailing slash)
3. Redeploy both

### Issue 3: Socket.io connection fails (Real-time messaging doesn't work)

**Causes:**
- `VITE_SOCKET_URL` not matching backend URL
- Backend CORS not allowing the frontend origin

**Solution:**
1. Verify `VITE_SOCKET_URL` in Vercel: `https://your-render-backend.onrender.com`
2. Verify `CORS_ORIGIN` in Render: `https://your-vercel-app.vercel.app`
3. Both must use HTTPS and exact URLs
4. Redeploy both

### Issue 4: Database connection timeout

**Causes:**
- MongoDB whitelist missing Render IP
- MongoDB credentials incorrect
- Network connectivity issue

**Solution:**
1. Go to MongoDB Atlas → Network Access
2. Add Render IP: **0.0.0.0/0** (Allow from anywhere)
3. Test connection string in MongoDB Atlas → Databases → Connect
4. Verify credentials are correct in `MONGO_URI`

### Issue 5: Redis connection fails

**Causes:**
- `REDIS_URL` incorrect format
- Redis credentials wrong
- Network firewall blocking connection

**Solution:**
1. Go to Redis Cloud console
2. Verify connection URL format: `redis://:password@host:port`
3. Test connection locally first
4. If local works but Render doesn't, check Redis Cloud firewall settings

### Issue 6: 502 Bad Gateway error

**Causes:**
- Backend crashed during startup
- Missing environment variables
- Port already in use
- Build failed

**Solution:**
1. Check Render Deploy Logs for errors
2. Verify all required environment variables are set
3. Check for build errors
4. Manually restart service: Render Dashboard → "Manual Deploy" → redeploy

---

## 📝 IMPORTANT NOTES FOR PROFESSOR REVIEW

### Deployment URLs to Share

When presenting to professor, provide these URLs:

```
Frontend (Vercel):  https://your-app.vercel.app
Backend (Render):   https://your-backend.onrender.com
API Docs:           https://your-backend.onrender.com/api-docs
```

### What Professor Will Check

1. **Website loads and works** in browser
2. **Login/Signup functionality** works
3. **Database connectivity** - data persists
4. **API documentation** - Swagger at `/api-docs`
5. **Real-time features** - Socket.io messaging works
6. **Performance** - Pages load quickly
7. **Styling** - No broken CSS or layout issues

### Demo Checklist

Before your professor review, test:

- [ ] Landing page loads with products
- [ ] Login page works (company/manager/salesman/owner)
- [ ] After login, relevant dashboard/pages load
- [ ] Search functionality works
- [ ] Product details page works
- [ ] Analytics (if applicable) loads data
- [ ] Messages/Chat works (real-time)
- [ ] Orders page shows data
- [ ] Complaints page shows data (if applicable)
- [ ] No console errors (DevTools → Console)
- [ ] API docs accessible and complete

---

## 🔄 REDEPLOYMENT PROCESS

If you make changes to your code later:

### For Backend (Render):
1. Push changes to GitHub
2. Render auto-detects and redeploys
3. Wait for build to complete
4. Check Deploy Logs for success

### For Frontend (Vercel):
1. Push changes to GitHub
2. Vercel auto-detects and redeploys
3. Wait for build to complete
4. New URL deployed automatically

---

## 📞 SUPPORT

If you encounter issues:

1. **Check error logs:**
   - Render: Dashboard → Logs tab
   - Vercel: Dashboard → Deployments → Build Logs / Logs tab

2. **Check browser console:**
   - DevTools → Console tab (look for CORS, API errors)
   - DevTools → Network tab (check API responses)

3. **Verify environment variables:**
   - Render: Environment tab
   - Vercel: Settings → Environment Variables

4. **Test locally first:**
   - Run `npm install && npm start` in both folders
   - Verify everything works before deploying

---

## ✨ SUCCESS INDICATORS

When everything is working correctly:

- ✅ Website loads without errors
- ✅ Console shows NO red error messages
- ✅ API calls return 200/201 status codes
- ✅ Database operations work (login, create, update)
- ✅ Real-time features work (Socket.io)
- ✅ Swagger docs display all endpoints
- ✅ Performance is fast (pages load in <3 seconds)
- ✅ Styling looks correct (no broken layouts)

---

**You're ready to deploy! Good luck! 🚀**
