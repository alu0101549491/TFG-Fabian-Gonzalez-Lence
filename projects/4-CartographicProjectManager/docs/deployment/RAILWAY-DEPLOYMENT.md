# 🚀 Railway Deployment Guide
## Cartographic Project Manager - Full Stack Deployment

This guide walks you through deploying the complete Cartographic Project Manager application:
- **Backend**: Node.js/Express API on Railway
- **Frontend**: Vue.js app on GitHub Pages
- **Database**: PostgreSQL on Railway
- **File Storage**: Dropbox (mandatory for persistent file storage)

---

## 📋 Prerequisites

Before starting, you'll need:

1. **GitHub Account** (you already have this ✓)
2. **Railway Account** - Sign up at [railway.app](https://railway.app)
   - Connect with your GitHub account (recommended)
   - Free tier: $5/month credit (enough for development)
3. **Dropbox Account** - For file storage
4. **Dropbox App** - You'll create this during setup

---

## 🎯 Part 1: Set Up Dropbox Integration (MANDATORY)

Dropbox is **required** because Railway uses ephemeral storage. Files uploaded to Railway are lost when the app redeploys. Dropbox provides permanent cloud storage for project files.

### Step 1.1: Create Dropbox App

1. Go to [Dropbox Developers](https://www.dropbox.com/developers/apps)
2. Click **"Create app"**
3. Choose:
   - **Scoped access**
   - **Full Dropbox** (or App folder if you prefer isolation)
   - **Name**: `CartographicProjectManager` (or your choice)
4. Click **Create app**

### Step 1.2: Configure App Permissions

In your Dropbox app settings:

1. Go to **Permissions** tab
2. Enable these scopes:
   - ✅ `files.metadata.write`
   - ✅ `files.metadata.read`
   - ✅ `files.content.write`
   - ✅ `files.content.read`
   - ✅ `sharing.write`
   - ✅ `sharing.read`
3. Click **Submit** at the bottom

### Step 1.3: Get App Credentials

In the **Settings** tab, note down:
- **App key** (you'll need this)
- **App secret** (click "Show" to reveal it)

### Step 1.4: Generate Refresh Token (LOCALLY)

⚠️ **Important**: Run this on your local machine, NOT on Railway

```bash
cd projects/4-CartographicProjectManager/backend

# Make sure you have the backend dependencies installed
npm install

# Set temporary environment variables
export DROPBOX_APP_KEY="your_app_key_here"
export DROPBOX_APP_SECRET="your_app_secret_here"

# Run the token generation script
npm run get-dropbox-token
```

The script will:
1. Open a browser window
2. Ask you to authorize the app
3. Redirect you to a page with an authorization code
4. Paste the code back into the terminal
5. Generate a **refresh token** (save this - it never expires!)

**Save these three values - you'll need them for Railway:**
- ✅ DROPBOX_APP_KEY
- ✅ DROPBOX_APP_SECRET  
- ✅ DROPBOX_REFRESH_TOKEN

---

## 🚂 Part 2: Deploy Backend to Railway

### Step 2.1: Create Railway Project

1. Go to [railway.app](https://railway.app/new)
2. Click **"Deploy from GitHub repo"**
3. Select your repository: `TFG-Fabian-Gonzalez-Lence`
4. Railway will analyze the repository (it will fail initially - this is expected for monorepos)

### Step 2.2: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway automatically:
   - Provisions a PostgreSQL instance
   - Creates a `DATABASE_URL` environment variable
   - Links it to your backend service

### Step 2.3: Configure Backend Service (⚠️ CRITICAL FOR MONOREPO)

1. Click on your backend service
2. Go to **Settings** tab
3. Scroll down to **Service Settings**:
   - **Root Directory**: `projects/4-CartographicProjectManager/backend`
   - **Build Command**: `npm ci && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm start`
   
4. Click **"Redeploy"** after saving these settings

> **Why this is needed**: Your repository is a monorepo with multiple projects. Railway needs to know which directory contains the backend app. Setting the Root Directory tells Railway to build from that specific folder.

### Step 2.4: Set Environment Variables

Go to **Variables** tab and add ALL of these:

#### Server Configuration
```bash
NODE_ENV=production
PORT=3000
API_VERSION=v1
```

#### JWT Secrets (GENERATE NEW ONES!)
Generate secure random strings using Node.js:
```bash
# On your local machine, run these commands:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy the output for JWT_SECRET

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy the output for JWT_REFRESH_SECRET (must be different!)
```

Then add to Railway:
```bash
JWT_SECRET=<paste_64_char_hex_string_here>
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<paste_different_64_char_hex_string_here>
JWT_REFRESH_EXPIRES_IN=30d
```

#### CORS Configuration
```bash
CORS_ORIGIN=https://alu0101549491.github.io
SOCKET_CORS_ORIGIN=https://alu0101549491.github.io
```

#### File Upload
```bash
MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads
```

#### Dropbox Integration (from Part 1)
```bash
DROPBOX_APP_KEY=<your_app_key>
DROPBOX_APP_SECRET=<your_app_secret>
DROPBOX_REFRESH_TOKEN=<your_refresh_token>
```

#### Logging & Rate Limiting
```bash
LOG_LEVEL=info
LOG_FILE=logs/app.log
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 2.5: Deploy Backend

1. Railway will automatically deploy when you save variables
2. Wait for deployment to complete (3-5 minutes)
3. Check the **Deployments** tab for progress
4. Once deployed, go to **Settings** → **Networking**
5. Click **"Generate Domain"** to get your public URL
   - Example: `cartographic-backend-production.up.railway.app`
   - **Save this URL** - you'll need it for the frontend!

### Step 2.6: Verify Backend Deployment

Test your API:
```bash
# Replace with your actual Railway URL
curl https://your-railway-app.up.railway.app/api/v1/health

# Expected response:
# {"status":"ok","timestamp":"..."}
```

If you get an error, check:
- **Logs** tab in Railway for error messages
- Database connection (DATABASE_URL is set)
- All environment variables are configured

---

## 🌐 Part 3: Configure Frontend for Production

### Step 3.1: Add GitHub Secret

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add:
   - **Name**: `RAILWAY_BACKEND_URL`
   - **Value**: `https://your-railway-app.up.railway.app` (without /api/v1)
5. Click **"Add secret"**

### Step 3.2: Update Local Production Config

Edit `.env.production` in the frontend directory:

```bash
cd projects/4-CartographicProjectManager

# Edit .env.production
nano .env.production
```

Replace `YOUR_RAILWAY_APP_NAME` with your actual Railway URL:
```env
VITE_API_BASE_URL=https://your-railway-app.up.railway.app/api/v1
VITE_SOCKET_URL=https://your-railway-app.up.railway.app
VITE_APP_VERSION=1.0.0
NODE_ENV=production
```

### Step 3.3: Commit and Deploy

```bash
cd ../../  # Back to repository root

git add .
git commit -m "Configure Railway deployment for CartographicProjectManager

- Add Railway and Nixpacks configuration files
- Add production environment variables
- Update GitHub Actions to use Railway backend URL
- Add comprehensive deployment documentation"

git push origin main
```

This will trigger GitHub Actions to rebuild all projects with the production backend URL.

---

## ✅ Part 4: Verify Full Stack Deployment

### Step 4.1: Wait for GitHub Pages Deployment

1. Go to **Actions** tab in your GitHub repository
2. Wait for the deployment workflow to complete (5-10 minutes)
3. Go to **Settings** → **Pages**
4. Your site should be live at: `https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/`

### Step 4.2: Test the Application

1. Open: `https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/4-CartographicProjectManager/`
2. You should see the login page
3. The app should NOT show `localhost:3000` errors anymore

### Step 4.3: Create First Admin User

You can seed the database or create a user via the backend:

**Option A: SSH into Railway and run seed script**
```bash
# In Railway service, go to Settings → Deploy Logs
# Or connect via Railway CLI:
railway link
railway run npm run prisma:seed
```

**Option B: Use the API directly**
```bash
curl -X POST https://your-railway-app.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "SecurePassword123!",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMINISTRATOR"
  }'
```

### Step 4.4: Test Full Functionality

Try these features:
- ✅ Login/Logout
- ✅ Create a project
- ✅ Upload a file (tests Dropbox integration)
- ✅ Create a task
- ✅ Send a message (tests WebSocket)
- ✅ View notifications

---

## 🔧 Troubleshooting

### Backend Issues

**Problem: Database migration fails**
```bash
# In Railway CLI:
railway run npx prisma migrate deploy
railway run npx prisma generate
```

**Problem: 500 errors on API calls**
- Check Railway **Logs** tab
- Verify all environment variables are set
- Check DATABASE_URL is present

**Problem: CORS errors**
- Verify CORS_ORIGIN includes your GitHub Pages URL
- Check it matches exactly (no trailing slash)

**Problem: File uploads fail**
- Verify Dropbox credentials are correct
- Check Dropbox app permissions
- Test refresh token locally first

### Frontend Issues

**Problem: Still connects to localhost**
- Check GitHub Actions secret `RAILWAY_BACKEND_URL` is set
- Rebuild the deployment (re-run workflow)
- Clear browser cache

**Problem: WebSocket connection fails**
- Verify SOCKET_CORS_ORIGIN in Railway
- Check Railway URL uses `https://` (required for WSS)

### General Issues

**Problem: Railway deployment fails**
```bash
# Check logs in Railway dashboard
# Common fixes:
- Ensure Node.js version matches (20.x)
- Verify package.json scripts are correct
- Check railway.json configuration
```

---

## 💰 Cost Estimation

### Railway Free Tier
- **$5/month credit** (sufficient for development)
- **PostgreSQL**: ~$2-3/month
- **Backend**: ~$1-2/month
- **Total**: ~$3-5/month (within free credit)

### Scaling Costs
If you exceed free tier:
- Additional usage: $0.000231/GB-hour
- Database storage: $0.25/GB/month

### Dropbox
- **Free tier**: 2GB storage (usually sufficient)
- **Plus**: $11.99/month for 2TB

---

## 📚 Additional Resources

- **Railway Docs**: https://docs.railway.app
- **Dropbox API**: https://www.dropbox.com/developers/documentation
- **Prisma Railway Guide**: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-railway

---

## 🎉 Success!

If you've reached this point and everything works:

✅ Backend deployed on Railway with PostgreSQL  
✅ Frontend deployed on GitHub Pages  
✅ Dropbox integration working  
✅ WebSocket real-time features active  
✅ Full application accessible online  

You now have a fully deployed full-stack application! 🚀

---

## 🔄 Continuous Deployment

Both services are now configured for automatic deployment:

- **Backend**: Pushes to `main` branch auto-deploy to Railway
- **Frontend**: Pushes to `main` branch trigger GitHub Actions → GitHub Pages

Make changes → Commit → Push → Automatically deploys!

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review Railway deployment logs
3. Verify all environment variables
4. Test Dropbox integration locally first
5. Check GitHub Actions logs for frontend build errors

**Remember**: Dropbox integration is mandatory because Railway storage is ephemeral!
