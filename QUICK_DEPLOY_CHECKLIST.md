# 🚀 Quick Deployment Checklist

Use this checklist to deploy LexFlow in ~15 minutes.

---

## ☐ Step 1: Supabase Database (5 min)

- [ ] Go to [supabase.com](https://supabase.com)
- [ ] Create new project named "LexFlow"
- [ ] Copy database password (SAVE IT!)
- [ ] Wait for project to be ready (~2 min)
- [ ] Go to Settings → Database
- [ ] Copy connection string (URI format)
- [ ] Replace `[YOUR-PASSWORD]` with your password
- [ ] Save connection string somewhere safe

**Your DB URL should look like:**
```
postgresql://postgres:your-password@db.xxx.supabase.co:5432/postgres
```

---

## ☐ Step 2: Run Database Migrations (2 min)

- [ ] Update local `backend/.env` with Supabase connection string
- [ ] Run: `cd backend && alembic upgrade head`
- [ ] Verify no errors in terminal

---

## ☐ Step 3: Deploy Backend to Railway (5 min)

- [ ] Go to [railway.app](https://railway.app)
- [ ] Sign up with GitHub
- [ ] Click "New Project" → "Deploy from GitHub repo"
- [ ] Select your LexFlow repository
- [ ] Click "Deploy Now"

### Environment Variables:
- [ ] Click on service → Variables tab
- [ ] Add `DATABASE_URL` (your Supabase URL)
- [ ] Add `SECRET_KEY` (any random 32+ character string)
- [ ] Add `ALGORITHM=HS256`
- [ ] Add `ACCESS_TOKEN_EXPIRE_MINUTES=43200`
- [ ] Add `CORS_ORIGINS=http://localhost:3000` (will update later)

### Build Settings:
- [ ] Go to Settings → Build
- [ ] Set Start Command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

- [ ] Copy your Railway backend URL (e.g., `https://xxx.railway.app`)
- [ ] Save it somewhere - you'll need it!

---

## ☐ Step 4: Deploy Frontend to Vercel (3 min)

- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Sign up with GitHub
- [ ] Click "Add New..." → "Project"
- [ ] Import your GitHub repository
- [ ] Set Root Directory: `frontend`

### Environment Variables (BEFORE deploying):
- [ ] Add `NEXT_PUBLIC_API_URL` = your Railway backend URL

Example: `NEXT_PUBLIC_API_URL=https://lexflow-production.railway.app`

- [ ] Click "Deploy"
- [ ] Wait for deployment (~2 min)
- [ ] Copy your Vercel frontend URL (e.g., `https://lexflow.vercel.app`)
- [ ] Save it!

---

## ☐ Step 5: Update CORS in Railway (1 min)

- [ ] Go back to Railway
- [ ] Click your backend service → Variables
- [ ] Update `CORS_ORIGINS` to:
  ```
  https://your-frontend.vercel.app,https://www.your-frontend.vercel.app
  ```
- [ ] Save (will auto-redeploy)

---

## ☐ Step 6: Test Everything (3 min)

- [ ] Visit your Vercel URL → Homepage loads ✓
- [ ] Visit `https://your-backend.railway.app/docs` → API docs load ✓
- [ ] Register a new account → Works ✓
- [ ] Login → Works ✓
- [ ] Create a form → Works ✓
- [ ] View form public link → Works ✓

---

## 🎉 Deployment Complete!

**Your Live URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-backend.railway.app`
- API Docs: `https://your-backend.railway.app/docs`

---

## 📝 Save These URLs

Write down:
1. Frontend URL: ___________________________
2. Backend URL: ___________________________
3. Supabase DB URL: ___________________________
4. Supabase Project: https://supabase.com/dashboard/project/___________

---

## 🐛 If Something Breaks

### Frontend won't load
- Check Vercel deployment logs
- Make sure `NEXT_PUBLIC_API_URL` is set correctly

### Backend errors
- Check Railway logs (Service → Deployments → View Logs)
- Verify all environment variables are set
- Test database connection

### Can't login/register
- Check Railway logs for errors
- Verify DATABASE_URL is correct
- Make sure migrations ran successfully

---

## 🎯 Next Steps (Optional)

- [ ] Add custom domain to Vercel
- [ ] Set up Stripe for payments
- [ ] Add S3 for document storage
- [ ] Set up email notifications
- [ ] Add Redis for better performance

---

**Total Time: ~15 minutes** ⏱️

Your app is now LIVE and ready for clients! 🚀
