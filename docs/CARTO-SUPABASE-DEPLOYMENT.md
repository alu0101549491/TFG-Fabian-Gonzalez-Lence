# CARTO Backend + Supabase Integration - Deployment Guide

## ✅ Completed Setup

### Database Migration
- ✅ All 12 CARTO tables migrated to Supabase
- ✅ All SQL enums created (PascalCase to match Prisma)
- ✅ Row Level Security policies active
- ✅ Connection tested and verified
- ✅ Backend builds successfully with Supabase database

### Backend Configuration
- ✅ Prisma client configured for Supabase
- ✅ TypeScript build successful
- ✅ Render configuration updated to use Supabase DATABASE_URL

### Frontend Configuration
- ✅ GitHub Actions workflow ready
- ✅ Frontend uses `VITE_API_BASE_URL` environment variable
- ✅ Configured to connect to Render backend

---

## 🚀 Deployment Steps

### Step 1: Deploy Backend to Render

1. **Create Render Service** (if not already created):
   - Go to https://render.com/dashboard
   - Click "New +" → "Web Service"
   - Connect to your GitHub repository
   - Select branch: `main`

2. **Configure Service**:
   - Name: `carto-backend` (or `carto-backend-gl8l` if already exists)
   - Root Directory: `projects/4-CartographicProjectManager/backend`
   - Build Command: `npm ci && npx prisma generate && npm run build && npm run build:seed`
   - Start Command: `npx prisma migrate deploy && npm run prisma:seed:production && npm start`
   - **Important:** Choose "Manual deploys" to set environment variables first!

3. **Set Environment Variables** in Render Dashboard:
   ```bash
   # Database (Supabase Connection Pooler)
   # Get from: Supabase Dashboard → Settings → Database → Connection string (Session pooler)
   DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[YOUR_DB_PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres

   # Frontend URLs
   CORS_ORIGIN=https://[YOUR_GITHUB_USERNAME].github.io
   SOCKET_CORS_ORIGIN=https://[YOUR_GITHUB_USERNAME].github.io

   # Dropbox Integration (optional)
   DROPBOX_APP_KEY=[your_dropbox_app_key]
   DROPBOX_APP_SECRET=[your_dropbox_app_secret]
   DROPBOX_REFRESH_TOKEN=[run: npm run get-dropbox-token]

   # Initial Admin User (for seeding)
   SEED_ADMIN_EMAIL=admin@example.com
   SEED_ADMIN_PASSWORD=[choose-secure-password]

   # Auto-configured by render.yaml:
   NODE_ENV=production
   PORT=10000
   API_VERSION=v1
   JWT_SECRET=[auto-generated]
   JWT_REFRESH_SECRET=[auto-generated]
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_EXPIRES_IN=30d
   LOG_LEVEL=info
   MAX_FILE_SIZE_MB=50
   SESSION_TIMEOUT_MINUTES=60
   ```

4. **Deploy!**
   - Click "Manual Deploy" → "Deploy latest commit"
   - Wait for build to complete (~3-5 minutes)
   - Check logs for "Server running on port 10000"

5. **Get Backend URL**:
   - Copy your Render service URL (e.g., `https://carto-backend-gl8l.onrender.com`)
   - This will be used for frontend configuration

---

### Step 2: Deploy Frontend to GitHub Pages

1. **Update GitHub Secret** (if backend URL changed):
   - Go to GitHub repository → Settings → Secrets → Actions
   - Add or update secret:
     - Name: `CARTO_BACKEND_URL`
     - Value: `https://carto-backend-gl8l.onrender.com`

2. **Trigger Deployment**:
   ```bash
   git add .
   git commit -m "Configure CARTO backend with Supabase database"
   git push origin main
   ```

3. **Monitor Deployment**:
   - Go to GitHub → Actions tab
   - Watch the "Deploy to GitHub Pages" workflow
   - Wait for green ✅ (builds 5 projects, ~5-10 minutes)

4. **Access Application**:
   - URL: https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/4-CartographicProjectManager/
   - Should connect to backend at `https://carto-backend-gl8l.onrender.com`

---

## 🧪 Testing the Full Stack

### 1. Test Backend API
```bash
# Health check
curl https://carto-backend-gl8l.onrender.com/api/v1/health

# Should return: {"status":"ok","timestamp":"..."}
```

### 2. Test Frontend Connection
1. Open https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/4-CartographicProjectManager/
2. Open browser console (F12)
3. Try to login with seeded admin credentials
4. Check Network tab to verify API calls go to Render backend

### 3. Test Database
1. Login to application
2. Create a test project
3. Check Supabase dashboard → Table Editor → `projects` table
4. Verify new row appears

---

## 📊 Architecture Overview

```
┌─────────────────────┐
│   GitHub Pages      │
│  (Vue 3 Frontend)   │
│                     │
│   alu0101549491... │
└──────────┬──────────┘
           │
           │ HTTPS
           ▼
┌─────────────────────┐
│   Render.com        │
│  (Express Backend)  │
│                     │
│  carto-backend-gl8l │
└──────────┬──────────┘
           │
           │ Pool Connection
           │ (Port 5432)
           ▼
┌─────────────────────┐
│   Supabase          │
│  (PostgreSQL 17.6)  │
│                     │
│  Frankfurt Region   │
└─────────────────────┘
```

---

## 🔧 Troubleshooting

### Backend Won't Start
```bash
# Check Render logs
# Common issues:
# - DATABASE_URL incorrect
# - Prisma migrations failed
# - Missing environment variables
```

### Frontend Can't Connect
```bash
# Check browser console for CORS errors
# Verify CORS_ORIGIN in Render matches GitHub Pages URL
# Check Network tab for failed requests
```

### Database Connection Issues
```bash
# Verify Supabase DATABASE_URL:
# Format: postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres
# Must use Session pooler (port 5432) not Direct connection
```

---

## 🎯 Success Criteria

- ✅ Backend deploys successfully on Render
- ✅ Backend connects to Supabase database
- ✅ Frontend deploys to GitHub Pages
- ✅ Frontend connects to Render backend
- ✅ Login works end-to-end
- ✅ Data persists in Supabase
- ✅ Real-time features work (Socket.IO)

---

## 📝 Next Steps

After successful deployment:

1. **Migrate TENNIS backend** to Supabase (24 tables)
2. **Optimize Edge Functions** (future: replace Express with Deno)
3. **Setup Supabase Auth** (replace JWT)
4. **Configure Supabase Storage** (replace Dropbox)
5. **Enable Supabase Realtime** (replace Socket.IO)

---

## 🔗 Resources

- **Supabase Dashboard**: https://supabase.com/dashboard/project/[YOUR_PROJECT_REF]
- **Render Dashboard**: https://dashboard.render.com
- **GitHub Pages**: https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/
- **Backend API Docs**: [RENDER.md](projects/4-CartographicProjectManager/backend/RENDER.md)

---

**Ready to Deploy?** Follow Step 1 to deploy the backend to Render! 🚀
