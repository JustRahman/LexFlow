# LexFlow Deployment Guide

Quick deployment guide to get LexFlow live with Supabase, Railway, and Vercel.

---

## 🗄️ Step 1: Set Up Supabase Database (5 minutes)

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in:
   - **Name**: LexFlow
   - **Database Password**: (generate a strong password - SAVE THIS!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"** (takes ~2 minutes)

### 1.2 Get Database Connection String

1. Once project is ready, go to **Project Settings** (gear icon)
2. Click **"Database"** in the left sidebar
3. Scroll to **"Connection string"** section
4. Select **"URI"** tab
5. Copy the connection string - it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
6. Replace `[YOUR-PASSWORD]` with your actual password

### 1.3 Run Database Migrations

**Option A: From your local machine (Recommended)**

1. Update your local `.env` file with the Supabase connection string:
   ```bash
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```

2. Run migrations:
   ```bash
   cd backend
   alembic upgrade head
   ```

**Option B: Using Supabase SQL Editor**

1. Go to **SQL Editor** in Supabase dashboard
2. Run the migration SQL manually (you'll need to generate it first)

---

## 🚂 Step 2: Deploy Backend to Railway (5 minutes)

### 2.1 Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (easiest option)

### 2.2 Deploy Backend

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Connect your GitHub account if needed
4. Select your LexFlow repository
5. Click **"Deploy Now"**

### 2.3 Set Environment Variables

1. Go to your project → Click on the **backend service**
2. Click **"Variables"** tab
3. Add these variables (click **"+ New Variable"** for each):

```bash
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200

# CORS (will update after frontend deployment)
CORS_ORIGINS=https://your-frontend-url.vercel.app,http://localhost:3000

# Optional (for now - leave as mock)
REDIS_URL=redis://localhost:6379
CELERY_BROKER_URL=redis://localhost:6379

# Stripe (add later when ready)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# S3 (add later when ready)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
S3_BUCKET_NAME=
```

### 2.4 Get Backend URL

1. Once deployed, Railway will give you a URL like:
   ```
   https://lexflow-backend-production.up.railway.app
   ```
2. **SAVE THIS URL** - you'll need it for the frontend

### 2.5 Update Build Settings

1. In Railway project settings, set:
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: Leave empty

---

## ⚡ Step 3: Deploy Frontend to Vercel (3 minutes)

### 3.1 Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (easiest option)

### 3.2 Deploy Frontend

1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository
3. Vercel will auto-detect Next.js
4. Set **Root Directory** to: `frontend`
5. Click **"Deploy"** (do NOT click yet - see next step)

### 3.3 Set Environment Variables BEFORE Deploying

1. Before clicking "Deploy", scroll down to **"Environment Variables"**
2. Add these:

```bash
NEXT_PUBLIC_API_URL=https://lexflow-backend-production.up.railway.app
```

(Replace with your actual Railway backend URL)

3. Now click **"Deploy"**

### 3.4 Get Frontend URL

1. Once deployed, Vercel will give you a URL like:
   ```
   https://lexflow.vercel.app
   ```
2. **SAVE THIS URL**

---

## 🔄 Step 4: Update CORS Settings (2 minutes)

### 4.1 Update Railway Backend

1. Go back to **Railway**
2. Go to your backend service → **Variables**
3. Update `CORS_ORIGINS` to include your Vercel URL:
   ```bash
   CORS_ORIGINS=https://lexflow.vercel.app,https://www.lexflow.vercel.app
   ```
4. Save and redeploy

---

## ✅ Step 5: Test Your Deployment

### 5.1 Test Frontend

1. Visit your Vercel URL: `https://lexflow.vercel.app`
2. Should see the homepage

### 5.2 Test Backend API

1. Visit: `https://your-railway-url.railway.app/docs`
2. Should see FastAPI documentation

### 5.3 Test Full Flow

1. Register a new account
2. Create an intake form
3. Get the public link and test client submission
4. Test signature and payment flow

---

## 🎉 You're Live!

Your app is now deployed:
- **Frontend**: https://lexflow.vercel.app
- **Backend API**: https://your-backend.railway.app
- **Database**: Supabase PostgreSQL

---

## 🔧 Common Issues & Solutions

### Issue: Frontend can't connect to backend

**Solution**:
- Check `NEXT_PUBLIC_API_URL` in Vercel environment variables
- Make sure CORS is set correctly in Railway
- Redeploy both services

### Issue: Database connection errors

**Solution**:
- Verify DATABASE_URL is correct in Railway
- Make sure Supabase project is running
- Check if you replaced `[YOUR-PASSWORD]` with actual password

### Issue: 500 errors on backend

**Solution**:
- Check Railway logs: Service → Deployments → Click on latest → View Logs
- Make sure all required environment variables are set
- Run database migrations

---

## 🚀 Optional Enhancements (Do Later)

### Custom Domain

**Vercel:**
1. Go to project settings → Domains
2. Add your custom domain
3. Follow DNS instructions

**Railway:**
1. Go to service settings → Networking
2. Add custom domain
3. Update DNS records

### Redis for Production

1. Add Redis service in Railway
2. Copy the Redis URL
3. Update `REDIS_URL` and `CELERY_BROKER_URL` environment variables

### S3 for File Storage

1. Create AWS S3 bucket
2. Get access keys
3. Update S3 environment variables in Railway

### Stripe Connect

1. Get Stripe API keys from [stripe.com/dashboard](https://dashboard.stripe.com)
2. Add to Railway environment variables
3. Test payment flow

---

## 📊 Monitoring

### Railway
- View logs: Project → Service → Deployments → Logs
- Monitor usage: Project → Usage

### Vercel
- View logs: Project → Deployments → Click deployment → View Function Logs
- Analytics: Project → Analytics

### Supabase
- Database health: Project → Database → Health
- Query stats: Project → Database → Query Performance

---

## 💰 Cost Estimate (Free Tier)

- **Supabase**: Free (500 MB database, 2GB bandwidth/month)
- **Railway**: $5/month credit (enough for small app)
- **Vercel**: Free (100 GB bandwidth/month)

**Total**: ~$0-5/month for starter usage

---

## 🆘 Need Help?

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs

---

**Deployment Complete! 🎊**

Your legal client intake platform is now live and ready to accept clients!
