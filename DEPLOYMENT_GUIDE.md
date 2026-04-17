# 🚀 NEXSHIP DEPLOYMENT GUIDE

## ✅ Critical Fixes Applied

This guide covers the **8 critical deployment issues** that were fixed:

1. ✅ **SQLite → PostgreSQL Migration** - File-based database won't work on Vercel
2. ✅ **Mangum Handler Export** - Added proper serverless handler for Vercel
3. ✅ **Frontend API URL** - Fixed hardcoded empty `const API = ''`
4. ✅ **Error Logging** - Added comprehensive logging to auth endpoint
5. ✅ **Environment Variables** - System for DATABASE_URL, SECRET_KEY, etc.
6. ✅ **CORS Configuration** - Multi-origin support for production
7. ✅ **Vercel Configuration** - Updated vercel.json for proper routing
8. ✅ **Local-to-Production** - Fallback to SQLite for local dev, PostgreSQL for production

---

## 📋 Pre-Deployment Checklist

### 1. Local Testing (Before Deployment)

```bash
# Install dependencies
pip install -r requirements.txt

# Optional: Create .env file for local testing
# (Copy from .env.example, use SQLite for local dev)

# Run locally
uvicorn app.main:app --reload --port 8000
```

**Test endpoints:**
- Frontend: http://localhost:8000
- Register: POST http://localhost:8000/api/auth/register
- Login: POST http://localhost:8000/api/auth/login
- Health: http://localhost:8000/health

### 2. Database Setup (PostgreSQL)

You have **3 options** for PostgreSQL:

#### **Option A: Render (Recommended - Free tier available)**
1. Go to [render.com](https://render.com)
2. Create account → Dashboard → New PostgreSQL database
3. Choose **Static IP** for Vercel access (or allow all IPs: `0.0.0.0/0`)
4. Copy the connection string (looks like: `postgresql://user:pass@host:5432/db`)
5. Save this for Step 3 (Vercel deployment)

#### **Option B: Railway (Free tier available)**
1. Go to [railway.app](https://railway.app)
2. New Project → PostgreSQL
3. Copy connection URI from variables
4. Save for Vercel

#### **Option C: AWS RDS**
1. Create PostgreSQL instance
2. Set publicly accessible: **YES**
3. Copy endpoint
4. Save for Vercel

---

## 🌐 Backend Deployment to Vercel

### Step 1: Push Code to GitHub

```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Deployment ready: PostgreSQL, logging, Mangum handler"
git remote add origin https://github.com/YOUR_USERNAME/nexship.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)** → Import Project
2. **Connect GitHub** and select your `nexship` repository
3. **Framework Preset:** Select "Other"
4. **Configure Environment Variables:**

   In Vercel Project Settings → Environment Variables, add:

   ```
   DATABASE_URL = postgresql://user:password@host:5432/nexship_db
   SECRET_KEY = (generate with: python -c "import secrets; print(secrets.token_hex(32))")
   ENVIRONMENT = production
   LOG_LEVEL = INFO
   ```

5. **Deploy!** Vercel will:
   - Install `requirements.txt`
   - Create Mangum handler at `/api/index.py`
   - Route all requests through your FastAPI app

### Step 3: Get Your Vercel Backend URL

After deployment, Vercel shows:
```
✅ https://your-project-name.vercel.app
```

This is your **BACKEND_URL** → Use in next step

---

## 🎨 Frontend Deployment to Vercel

### Update Frontend API URL

**File:** `frontend/index.html` (around line 1815)

```javascript
// BEFORE (BROKEN):
const API = '';

// AFTER (DEPLOYED):
const API = 'https://your-project-name.vercel.app';  // Your Vercel backend URL
```

### Deploy Frontend

1. **Go to [vercel.com](https://vercel.com)** → Import Project
2. **Select just the `frontend` folder** (not root)
   - Or: Create `vercel.json` in frontend with:
     ```json
     { "buildCommand": "", "outputDirectory": "." }
     ```
3. **Deploy!**

---

## 🔐 CORS Configuration for Production

Your `app/main.py` is already configured with:

```python
allowed_origins = [
    "https://nexorder-kappa.vercel.app",      # Your frontend
    "https://your-project-name.vercel.app",   # Your backend (if frontend calls itself)
    "http://localhost:3000",                  # Local dev
]
```

**If you get CORS errors on Vercel:**

1. Check browser DevTools → Network tab
2. Look for `Access-Control-Allow-Origin` header
3. Make sure your Vercel frontend domain is in `allowed_origins`

---

## 🧪 Testing Deployment

### Test Backend Health

```bash
# Should return 200 OK
curl -X GET "https://your-backend-url.vercel.app/health"

{
  "status": "healthy",
  "message": "API is running",
  "version": "2.1.0"
}
```

### Test Database Connection

```bash
# Should return 200 OK
curl -X GET "https://your-backend-url.vercel.app/api/health"

{ "status": "ok", "api": "running" }
```

### Test Login in Browser

1. Open DevTools (F12)
2. Go to Console tab
3. Try login
4. Check console logs for errors:
   - `✅ API URL: https://your-backend-url.vercel.app` → URL is correct
   - `🔑 Attempting login...` → Frontend is sending request
   - Check Network tab for response status (should be 200 with token)

---

## ❌ Common Issues & Fixes

### Issue 1: "Cannot POST /api/auth/login"
**Cause:** Backend not deployed or wrong URL in frontend  
**Fix:** 
- Verify `const API = 'https://your-backend-url.vercel.app'`
- Check Vercel deployment succeeded
- Check `/health` endpoint returns 200

### Issue 2: CORS Error "No 'Access-Control-Allow-Origin' header"
**Cause:** Frontend domain not in backend's allowed origins  
**Fix:**
- Add your frontend URL to `allowed_origins` in `app/main.py`
- Redeploy backend
- Or use `"*"` for testing (remove in production)

### Issue 3: "Cannot reach database"
**Cause:** PostgreSQL connection string wrong  
**Fix:**
- Test locally: `DATABASE_URL=postgresql://...`
- Verify Render/Railway IP whitelist includes Vercel IPs
- Check `SECRET_KEY` and credentials are correct

### Issue 4: "Login works locally but not on Vercel"
**Cause:** 
- Token storage issue
- Headers not sent
- CORS blocking credentials

**Fix:**
```javascript
// In index.html, req() function needs:
credentials: 'include',  // If using cookies
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
}
```

### Issue 5: "Frontend deployed but getting 404 on /"
**Cause:** Vercel serving backend instead of frontend  
**Fix:** 
- Deploy frontend and backend separately
- Frontend: Deploy `/frontend` folder content
- Backend: Deploy root `/api` folder

---

## 🔄 Production Database Migration

When you switch from SQLite to PostgreSQL:

### Option 1: Start Fresh (Recommended)
```bash
# Backend will auto-create tables on first run
# Just deploy with DATABASE_URL = postgresql://...
```

### Option 2: Migrate Data (If you have existing data)
```bash
# Export from SQLite locally
# Import to PostgreSQL
# Then update DATABASE_URL on Vercel
```

---

## 📊 Monitoring & Logs

### View Vercel Logs

**Backend Logs:**
1. Go to Vercel Dashboard → Select project
2. Click "Deployments"
3. Click latest deployment
4. Click "Runtime logs"

You'll see:
```
✅ FastAPI app initialized
🔒 CORS configured for origins: [...]
✅ Mangum handler exported for Vercel serverless
✅ User registered successfully: username123
✅ Login successful: username123
❌ Login failed: Invalid credentials for username456
```

### Local Testing with Production Database

```bash
# Create .env with production DATABASE_URL
DATABASE_URL=postgresql://...  # Your Render/Railway database

# Test locally (will use real production DB!)
uvicorn app.main:app --reload --port 8000
```

---

## 🎯 Final Checklist

Before considering deployment complete:

- [ ] Backend deployed to Vercel → `/health` returns 200
- [ ] PostgreSQL database configured and connection tested
- [ ] `DATABASE_URL` environment variable set on Vercel
- [ ] Frontend `const API = 'https://your-backend-url.vercel.app'`
- [ ] Frontend deployed and accessible
- [ ] Login works: Can register and login on deployed frontend
- [ ] Orders, Products, Payments working in production
- [ ] No CORS errors in browser console
- [ ] Logs show successful database queries

---

## 🆘 If Login STILL Doesn't Work

### Debug Checklist:

1. **Check API URL is correct:**
   ```javascript
   // Open browser console, type:
   console.log(API);  // Should show your backend URL
   ```

2. **Check request is hitting backend:**
   - Open DevTools → Network tab
   - Attempt login
   - Look for `POST /api/auth/login` request
   - Check response status code:
     - 200 = Success (check for token in response)
     - 401 = Invalid credentials
     - 404 = Endpoint doesn't exist (wrong API URL)
     - 500 = Backend error (check Vercel logs)

3. **Check CORS headers:**
   - In Network tab, click login request
   - Go to "Response Headers"
   - Should see: `Access-Control-Allow-Origin: https://your-frontend.vercel.app`

4. **Check token is saved:**
   ```javascript
   // In browser console:
   localStorage.getItem('token')  // Should show token string
   ```

5. **Check backend logs:**
   - Vercel Dashboard → Deployments → Runtime logs
   - Look for:
     - `✅ Login successful` = Good
     - `❌ Login failed` = Credentials wrong or DB error
     - Missing logs = Request didn't reach backend (CORS issue)

---

## 📞 Support

If you need additional help:

1. **Check Vercel Status:** https://www.vercel.com/status
2. **Check PostgreSQL Provider Status:** Render/Railway dashboard
3. **Local reproduction:** Test the exact issue locally first
4. **Enable verbose logging:** Set `LOG_LEVEL=DEBUG` in Vercel

---

**Last Updated:** 2024
**Deployment Framework:** Vercel + PostgreSQL
**Language:** Python 3.11 + FastAPI
