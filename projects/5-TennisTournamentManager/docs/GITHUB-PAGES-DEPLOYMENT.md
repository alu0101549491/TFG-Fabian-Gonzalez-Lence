# GitHub Pages Deployment - Tennis Tournament Manager Frontend

> **ℹ️ MONOREPO SETUP**  
> This frontend is part of a monorepo with multiple projects.  
> Main workflow: **`/.github/workflows/deploy.yml`** (repository root)  
> See: `/MONOREPO-GITHUB-PAGES.md` for complete monorepo setup.

## 📋 Overview

The Tennis Tournament Manager frontend is automatically deployed to GitHub Pages on every push to the `main` branch.

**Deployed URL:**
```
https://<your-username>.github.io/<repo-name>/5-TennisTournamentManager/
```

**Backend API:**
```
https://tennis-backend.onrender.com
```

## 🏗️ Architecture

### Technology Stack
- **Framework:** Angular 19 with TypeScript
- **Build Tool:** Vite
- **Styling:** CSS with CSS Variables
- **Real-time:** Socket.IO client
- **HTTP Client:** Axios
- **PDF Generation:** jsPDF with autoTable

### Environment Configuration

The app uses Vite environment variables for configuration:

**Development (localhost):**
- API: `/api` (proxied to `http://localhost:3000` via Vite)
- WebSocket: `http://localhost:3000`

**Production (GitHub Pages):**
- API: `VITE_API_BASE_URL` or `https://tennis-backend.onrender.com/api`
- WebSocket: `VITE_SOCKET_URL` or `https://tennis-backend.onrender.com`
- Base URL: `/<repo-name>/5-TennisTournamentManager/`

## 🚀 Deployment Process

### Automatic Deployment

Every push to `main` triggers:

1. **Checkout** - Clone repository
2. **Setup Node.js** - v20
3. **Build Tennis** - Run build process:
   ```bash
   cd projects/5-TennisTournamentManager
   npm ci
   export BASE_URL="/<repo>/5-TennisTournamentManager/"
   export VITE_API_BASE_URL="https://tennis-backend.onrender.com/api"
   export VITE_SOCKET_URL="https://tennis-backend.onrender.com"
   npm run build
   ```
4. **Deploy** - Upload to GitHub Pages with other projects

### Manual Deployment

You can also trigger deployment manually:

1. Go to GitHub → Actions
2. Select "Deploy Projects to GitHub Pages"
3. Click "Run workflow" → "Run workflow"

## 🔧 Configuration

### Vite Configuration

The `vite.config.ts` is already configured for monorepo deployment:

```typescript
export default defineConfig(({mode}) => {
  const base = mode === 'production' 
    ? (process.env.BASE_URL || '/5-TennisTournamentManager/')
    : '/';

  return {
    base,
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
    },
    // ... other config
  };
});
```

### API Configuration

The `src/shared/constants.ts` uses environment variables:

```typescript
export const API_BASE_URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_BASE_URL || 'https://tennis-backend.onrender.com/api')
  : '/api';

export const WS_URL = import.meta.env.PROD
  ? (import.meta.env.VITE_SOCKET_URL || 'https://tennis-backend.onrender.com')
  : 'http://localhost:3000';
```

### GitHub Secrets (Optional)

You can override the default backend URLs by setting GitHub secrets:

**GitHub → Settings → Secrets and variables → Actions → New repository secret:**

```
Name: TENNIS_BACKEND_URL
Value: https://your-custom-backend.onrender.com
```

If not set, defaults to `https://tennis-backend.onrender.com`.

## 📁 Build Output

The build process generates:

```
dist/
├── index.html           # Entry point
├── assets/              # JS, CSS, images, fonts
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
└── ...
```

All assets are served from the `assets/` directory with hashed filenames for cache busting.

## 🌐 Portfolio Integration

The Tennis project is automatically added to the portfolio index page:

```html
<a href="./5-TennisTournamentManager/" class="project-card">
    <div class="project-icon">🎾</div>
    <div class="project-name">Tennis Tournament Manager</div>
    <div class="project-description">
        Comprehensive management of tennis tournaments with 
        real-time notifications and standings
    </div>
</a>
```

**Portfolio URL:**
```
https://<your-username>.github.io/<repo-name>/
```

## 🔍 Verification

After deployment (takes ~2-5 minutes):

### 1. Check Deployment Status

GitHub → Actions → Latest workflow run → Should show ✅

### 2. Test Frontend

```bash
# Open in browser
https://<your-username>.github.io/<repo-name>/5-TennisTournamentManager/

# Should load the Tennis Tournament Manager app
```

### 3. Test API Connection

1. Open browser DevTools (F12) → Network tab
2. Navigate to the app
3. Try to login or perform an action
4. Check Network tab for API calls to `tennis-backend.onrender.com`
5. Verify WebSocket connection in Network → WS tab

### 4. Test Real-time Features

1. Open the app in two browser windows/tabs
2. Create a tournament in one window
3. Verify it appears in real-time in the other window
4. Check browser console for WebSocket connection logs

## 🐛 Troubleshooting

### ❌ 404 Error on Page Refresh

**Problem:** Refreshing a route like `/tournaments/123` gives 404.

**Solution:** GitHub Pages doesn't support client-side routing by default. Options:
1. Use hash routing (not implemented currently)
2. Add a custom 404.html that redirects to index.html
3. Use a SPA redirect script (recommended)

**Quick Fix:** Add to `public/404.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <script>
    sessionStorage.redirect = location.href;
  </script>
  <meta http-equiv="refresh" content="0;URL='/'">
</head>
</html>
```

### ❌ CORS Errors

**Problem:** Browser blocks API requests with CORS error.

**Solution:** Ensure backend CORS is configured:
```bash
# In Render backend environment:
CORS_ORIGIN=https://<your-username>.github.io
SOCKET_CORS_ORIGIN=https://<your-username>.github.io
```

### ❌ API Requests Failing

**Problem:** API calls return 404 or fail to connect.

**Checklist:**
1. Verify backend is running: `curl https://tennis-backend.onrender.com/api/health`
2. Check `src/shared/constants.ts` has correct URLs
3. Verify `VITE_API_BASE_URL` in workflow includes `/api` suffix
4. Check browser DevTools Network tab for actual request URL
5. Ensure backend isn't sleeping (Render free tier sleeps after 15 min)

### ❌ WebSocket Connection Fails

**Problem:** Real-time updates don't work.

**Checklist:**
1. Check browser DevTools Console for WebSocket errors
2. Verify `VITE_SOCKET_URL` points to backend (without `/api` suffix)
3. Ensure backend `SOCKET_CORS_ORIGIN` is configured
4. Test WebSocket endpoint: `wscat -c wss://tennis-backend.onrender.com`
5. Check if Socket.IO is running on backend

### ❌ Assets Not Loading (404)

**Problem:** CSS, JS, or images return 404.

**Solution:** 
1. Verify `base` in `vite.config.ts` matches deployment path
2. Check `BASE_URL` in workflow is correct
3. Assets should be at: `/5-TennisTournamentManager/assets/...`
4. Clear browser cache and hard refresh (Ctrl+Shift+R)

### ❌ Build Fails in GitHub Actions

**Checklist:**
1. Check Actions logs for specific error
2. Verify `package.json` scripts are correct
3. Test build locally: `npm run build`
4. Ensure all dependencies are in `package.json` (not just devDependencies)
5. Check Node.js version matches workflow (v20)

## 📊 Monitoring

### GitHub Actions Logs

View detailed build/deploy logs:
1. GitHub → Actions
2. Select latest workflow run
3. Click "build" job
4. Expand "Build all projects" step
5. Look for: "✅ 5-TennisTournamentManager built successfully"

### Build Time

Typical build times:
- **Cold build** (no cache): ~2-3 minutes
- **Warm build** (with cache): ~1-2 minutes

### Bundle Size

After build, check `dist/` size:
```bash
npm run build
du -sh dist
```

Typical size: ~2-5 MB (including assets, images, fonts)

## 🎯 Best Practices

### 1. Environment Variables

✅ **DO:**
- Use `import.meta.env.VITE_*` for all config
- Provide fallback defaults in constants.ts
- Document required env vars in README

❌ **DON'T:**
- Hardcode production URLs in code
- Commit sensitive data (API keys, secrets)
- Use runtime environment variables (Vite doesn't support them)

### 2. Asset Optimization

✅ **DO:**
- Compress images before adding to repo
- Use SVG for icons when possible
- Enable Vite's minification (already configured)
- Use lazy loading for routes

❌ **DON'T:**
- Add large files to `public/` directory
- Include unused images or fonts
- Disable source maps in production (needed for debugging)

### 3. Deployment

✅ **DO:**
- Test build locally before pushing: `npm run build && npm run preview`
- Check Actions logs after each deploy
- Verify app functionality after deployment
- Keep dependencies up to date

❌ **DON'T:**
- Push directly to main without testing
- Ignore failed Actions workflows
- Mix version formats in package.json (use ^, not ~)

## 📚 Related Documentation

- **Backend Deployment:** [backend/RENDER.md](../backend/RENDER.md)
- **Backend Quick Start:** [backend/QUICK-START-RENDER.md](../backend/QUICK-START-RENDER.md)
- **Monorepo Setup:** [/MONOREPO-GITHUB-PAGES.md](../../../MONOREPO-GITHUB-PAGES.md)
- **Project README:** [README.md](../README.md)

## 🎉 Summary

The Tennis Tournament Manager frontend is now configured for automatic deployment to GitHub Pages:

✅ **Automatic deployment** on every push to main  
✅ **Environment-based configuration** for dev/prod  
✅ **Integrated with monorepo portfolio**  
✅ **Connected to Render backend**  
✅ **Real-time WebSocket support**  
✅ **Free hosting via GitHub Pages**  

Your app is production-ready! 🎾🚀
