# Tennis Tournament Manager - Deployment Checklist

> **Date:** April 15, 2026  
> **Project:** Tennis Tournament Manager (TENNIS)  
> **Platform:** Render.com (Backend) + GitHub Pages (Frontend)  
> **Status:** Ready for deployment ✅

---

## 📋 Pre-Deployment Overview

### Architecture
- **Backend**: Node.js + Express + TypeScript + TypeORM
- **Database**: PostgreSQL (Render managed)
- **Real-time**: Socket.IO
- **Deployment**: Render Web Service (Free tier)
- **Frontend**: Angular 19 on GitHub Pages

### Blueprint Configuration
Tennis is already configured in `/render.yaml` at the repository root. It will be deployed as part of the monorepo setup.

---

## ✅ Phase 1: Email Service Setup (REQUIRED)

Tennis backend **requires** email configuration for user registration, password resets, and notifications.

### Option A: Gmail (Recommended for Testing)

1. **Enable 2-Step Verification**
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - App: Mail
   - Device: Choose your device or "Other"
   - Copy the 16-character password (no spaces)

3. **Save for later:**
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=[YOUR_16_CHAR_APP_PASSWORD]
   EMAIL_FROM_NAME=Tennis Tournament Manager
   EMAIL_FROM_ADDRESS=your-email@gmail.com
   ```

### Option B: SendGrid (Recommended for Production)

1. **Create SendGrid Account**
   - Sign up at: https://sendgrid.com
   - Free tier: 100 emails/day

2. **Generate API Key**
   - Settings → API Keys → Create API Key
   - Name: "Tennis Backend"
   - Permissions: Full Access (for Mail Send)
   - Copy the API key (shown only once!)

3. **Verify Sender Identity**
   - Settings → Sender Authentication
   - Verify your email or domain

4. **Save for later:**
   ```
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=apikey
   EMAIL_PASSWORD=[YOUR_SENDGRID_API_KEY]
   EMAIL_FROM_NAME=Tennis Tournament Manager
   EMAIL_FROM_ADDRESS=your-verified-email@example.com
   ```

**Status:** ⬜ Gmail configured  ⬜ SendGrid configured

---

## ✅ Phase 2: Optional Notification Services

### Web Push Notifications (Optional)

Generate VAPID keys for browser push notifications:

```bash
npx web-push generate-vapid-keys
```

Save output:
```
WEB_PUSH_PUBLIC_KEY=[Public Key from output]
WEB_PUSH_PRIVATE_KEY=[Private Key from output]
WEB_PUSH_SUBJECT=mailto:your-email@example.com
WEB_PUSH_ENABLED=true
```

**Status:** ⬜ VAPID keys generated  ⬜ Skip (not using Web Push)

### Telegram Bot (Optional)

Create a Telegram bot for notifications:

1. Open Telegram, search for `@BotFather`
2. Send `/newbot`
3. Follow instructions to name your bot
4. Copy the token provided

Save for later:
```
TELEGRAM_BOT_TOKEN=[Your bot token]
TELEGRAM_ENABLED=true
```

**Status:** ⬜ Telegram bot created  ⬜ Skip (not using Telegram)

---

## ✅ Phase 3: Render Deployment

### Step 1: Verify render.yaml

The Blueprint is already configured. Verify it's uncommented:

```bash
cd /home/fabian/MyStuff/TFG-Fabian-Gonzalez-Lence
grep -A5 "tennis-backend" render.yaml
```

Should show the tennis-backend service definition (not commented out).

**Status:** ⬜ Blueprint verified

### Step 2: Deploy via Blueprint

1. **Navigate to Render Dashboard**
   - URL: https://dashboard.render.com
   - Login with GitHub account

2. **Apply Blueprint**
   - Since you already have the Blueprint applied for CARTO, Render will detect changes
   - Updated Blueprint will add `tennis-backend` and `tennis-db` alongside existing CARTO services
   - Go to: Dashboard → Blueprints → Your blueprint → **Apply Latest Changes**

3. **What Render Will Create:**
   - ✅ PostgreSQL database: `tennis-db` (Frankfurt region, Free tier)
   - ✅ Web service: `tennis-backend` (Node.js, Frankfurt region, Free tier)
   - ✅ Auto-connect database to backend service

**Expected Wait Time:** 8-12 minutes for first deployment

**Status:** ⬜ Blueprint applied  ⬜ tennis-db created  ⬜ tennis-backend created

### Step 3: Configure Manual Environment Variables

Go to: Render Dashboard → `tennis-backend` → Environment

**CRITICAL - Set These Manually:**

```bash
# ━━━━ Frontend URLs (REQUIRED) ━━━━
CORS_ORIGIN=https://alu0101549491.github.io
SOCKET_CORS_ORIGIN=https://alu0101549491.github.io
APP_URL=https://alu0101549491.github.io

# ━━━━ Email Configuration (REQUIRED - Choose Gmail OR SendGrid) ━━━━
# Option A: Gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=[YOUR_GMAIL_APP_PASSWORD]
EMAIL_FROM_NAME=Tennis Tournament Manager
EMAIL_FROM_ADDRESS=your-email@gmail.com

# Option B: SendGrid
# EMAIL_HOST=smtp.sendgrid.net
# EMAIL_PORT=587
# EMAIL_SECURE=false
# EMAIL_USER=apikey
# EMAIL_PASSWORD=[YOUR_SENDGRID_API_KEY]
# EMAIL_FROM_ADDRESS=your-verified-email@example.com
```

**OPTIONAL - If You Configured Them:**

```bash
# ━━━━ Web Push (OPTIONAL) ━━━━
WEB_PUSH_PUBLIC_KEY=[Your public key]
WEB_PUSH_PRIVATE_KEY=[Your private key]
WEB_PUSH_SUBJECT=mailto:your-email@example.com
WEB_PUSH_ENABLED=true

# ━━━━ Telegram (OPTIONAL) ━━━━
TELEGRAM_BOT_TOKEN=[Your bot token]
TELEGRAM_ENABLED=true
```

**After setting variables, click "Save Changes"** - This will trigger a redeploy.

**Status:** ⬜ CORS URLs configured  ⬜ Email configured  ⬜ Optional services configured

### Step 4: Monitor Deployment

Watch the deployment logs in real-time:

1. Go to: `tennis-backend` → Logs tab
2. Look for these success indicators:
   ```
   ✅ "npm run db:migrate" - Running database migrations
   ✅ "npm start" - Starting server
   ✅ "Server started on port 10000"
   ✅ "Database connected successfully"
   ✅ "WebSocket server listening"
   ```

3. Check for errors:
   - ❌ Database connection failures
   - ❌ Email configuration errors (will show as warnings)
   - ❌ Missing environment variables

**Status:** ⬜ Deployment successful  ⬜ No errors in logs

### Step 5: Test Backend Endpoints

Once deployment succeeds, test the health endpoint:

```bash
# Health check
curl https://tennis-backend-[YOUR_ID].onrender.com/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2026-04-15T...",
  "uptime": 123,
  "database": "connected"
}
```

**Status:** ⬜ Health endpoint responding

---

## ✅ Phase 4: Frontend Deployment (GitHub Pages)

### Step 1: Update Frontend Environment

Edit: `projects/5-TennisTournamentManager/src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tennis-backend-[YOUR_RENDER_ID].onrender.com/api',
  socketUrl: 'https://tennis-backend-[YOUR_RENDER_ID].onrender.com',
  wsPath: '/socket.io',
  appUrl: 'https://alu0101549491.github.io',
  // ... rest of config
};
```

**Replace `[YOUR_RENDER_ID]`** with your actual Render backend URL.

**Status:** ⬜ Environment configured

### Step 2: Build Frontend

```bash
cd /home/fabian/MyStuff/TFG-Fabian-Gonzalez-Lence/projects/5-TennisTournamentManager
npm run build
```

**Expected output:** `dist/` folder with production build

**Status:** ⬜ Frontend built successfully

### Step 3: Deploy to GitHub Pages

The repository already has a GitHub Actions workflow for deployment. Commit and push:

```bash
cd /home/fabian/MyStuff/TFG-Fabian-Gonzalez-Lence
git add projects/5-TennisTournamentManager/
git commit -m "chore(tennis): configure production deployment"
git push origin main
```

GitHub Actions will automatically deploy to: `https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/projects/5-TennisTournamentManager/`

**Status:** ⬜ Committed and pushed  ⬜ GitHub Actions succeeded

---

## ✅ Phase 5: Post-Deployment Verification

### Database Verification

```bash
# Check if migrations ran successfully
# In Render Dashboard → tennis-backend → Shell, run:
npm run db:migrate
```

Expected: "All migrations have been run" or "No pending migrations"

**Status:** ⬜ Migrations verified

### Seed Test Data (Optional)

Create initial test tournament:

```bash
# In Render Dashboard → tennis-backend → Shell, run:
npm run db:seed
```

This creates:
- Admin user (email: admin@tennis.com, password: Admin123!)
- Sample tournaments, categories, and test data

**Status:** ⬜ Seed data created  ⬜ Skip (manual setup)

### Frontend-Backend Integration Test

1. Navigate to deployed frontend
2. Try to register a new user
3. Check email for verification link
4. Login with new user
5. Create a test tournament

**Expected:**
- ✅ Registration email received
- ✅ Login successful
- ✅ Tournament created
- ✅ Real-time updates working (if you open in 2 tabs)

**Status:** ⬜ Registration working  ⬜ Login working  ⬜ CRUD working  ⬜ Real-time working

---

## 🚨 Troubleshooting

### Backend Won't Start

**Check logs for:**
- Database connection string correct?
- All required env vars set?
- TypeORM migrations failing?

**Solution:** Verify `DATABASE_URL` is the Internal Database URL from `tennis-db`

### Email Not Sending

**Check:**
- Gmail App Password correct (16 chars, no spaces)?
- SendGrid API key valid?
- `EMAIL_FROM_ADDRESS` verified with your provider?

**Solution:** Test with: `curl -X POST https://your-backend/api/auth/register` and check logs

### CORS Errors in Frontend

**Check:**
- `CORS_ORIGIN` matches your GitHub Pages URL exactly?
- No trailing slash differences?

**Solution:** Update `CORS_ORIGIN` in Render, save, and redeploy

### WebSocket Not Connecting

**Check:**
- `SOCKET_CORS_ORIGIN` set correctly?
- Frontend `socketUrl` matches backend URL?

**Solution:** Check browser console for WebSocket connection errors

---

## 📊 Deployment Summary

### Resources Created

| Resource | Name | Type | Region | Plan |
|----------|------|------|--------|------|
| Database | tennis-db | PostgreSQL | Frankfurt | Free |
| Backend | tennis-backend | Web Service | Frankfurt | Free |
| Frontend | GitHub Pages | Static Site | Global CDN | Free |

### Environment Variables Set

- ✅ Auto-generated: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`
- ✅ Manual: `CORS_ORIGIN`, `SOCKET_CORS_ORIGIN`, `APP_URL`
- ✅ Manual: `EMAIL_*` configuration
- ⬜ Optional: `WEB_PUSH_*`, `TELEGRAM_*`

### URLs

- Backend API: `https://tennis-backend-[ID].onrender.com/api`
- Backend Health: `https://tennis-backend-[ID].onrender.com/api/health`
- Frontend: `https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/projects/5-TennisTournamentManager/`

---

## 🎉 Next Steps

1. ✅ Update README.md with production URLs
2. ✅ Document admin credentials securely
3. ✅ Create user guide for tournament organizers
4. ✅ Set up monitoring (Render provides basic uptime monitoring)
5. ✅ Test all features end-to-end

---

## 📝 Notes

- **Free Tier Limits:** Render Free tier provides 750 hours/month total. With CARTO + Tennis both deployed, you have ~375 hours per service (15.5 days of uptime each if both always-on).
- **Cold Starts:** Free tier services sleep after 15 minutes of inactivity. First request after sleep takes ~30 seconds to wake up.
- **Database Backups:** Free tier includes 90 days of automatic backups.
- **Upgrade Path:** If you need always-on services, upgrade to Starter ($7/month per service).

---

**Deployment Date:** April 15, 2026  
**Deployed By:** Fabián González Lence  
**Status:** ⬜ Not Started  ⬜ In Progress  ⬜ Complete
