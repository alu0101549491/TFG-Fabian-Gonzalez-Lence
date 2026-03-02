# Railway Deployment - Quick Reference

## 📦 Configuration Files

This backend is configured for Railway deployment with:

- **`railway.json`** - Railway deployment configuration
- **`nixpacks.toml`** - Nixpacks build configuration (Node.js 20)
- **`.env.railway`** - Template for Railway environment variables

## 🚀 Deployment Setup

**Complete guide**: See `../RAILWAY-DEPLOYMENT.md`

### Quick Steps:

1. **Dropbox Setup** (mandatory)
   ```bash
   npm run get-dropbox-token
   ```

2. **Deploy to Railway**
   - Connect GitHub repository
   - Add PostgreSQL service
   - Set environment variables from `.env.railway`
   - Deploy automatically

3. **Configure Frontend**
   - Add Railway URL to GitHub Secrets
   - Redeploy frontend via GitHub Actions

## 🔑 Required Environment Variables

Copy from `.env.railway` and configure in Railway dashboard:

### Critical (Must Set):
- `JWT_SECRET` - Generate new random string
- `JWT_REFRESH_SECRET` - Generate new random string
- `DROPBOX_APP_KEY` - From Dropbox app
- `DROPBOX_APP_SECRET` - From Dropbox app
- `DROPBOX_REFRESH_TOKEN` - Generate with npm script
- `CORS_ORIGIN` - Your GitHub Pages URL
- `SOCKET_CORS_ORIGIN` - Your GitHub Pages URL

### Auto-Provided by Railway:
- `DATABASE_URL` - PostgreSQL connection (automatic)

### Optional:
- `NODE_ENV=production` (recommended)
- `LOG_LEVEL=info`
- Rate limiting settings

## 📋 Build Process

Railway automatically:
1. Detects Node.js 20 (from nixpacks.toml)
2. Runs `npm ci`
3. Runs `npx prisma generate`
4. Runs `npm run build` (compiles TypeScript)
5. Runs `npx prisma migrate deploy` (on start)
6. Starts with `node dist/server.js`

## 🗄️ Database Migrations

Railway runs migrations automatically on deploy:
```bash
npx prisma migrate deploy
```

To create new migrations locally:
```bash
npm run prisma:migrate
```

Then commit and push - Railway will apply them.

## 🧪 Testing Deployment

After deployment, test these endpoints:

```bash
# Health check
curl https://your-app.up.railway.app/api/v1/health

# API documentation
curl https://your-app.up.railway.app/api/v1/

# Test auth (should return 400 - no credentials)
curl https://your-app.up.railway.app/api/v1/auth/login
```

## 🔍 Troubleshooting

### Deployment fails
- Check Railway logs
- Verify Node.js 20 compatibility
- Ensure all dependencies are in package.json

### Database connection errors
- Verify DATABASE_URL is set by Railway
- Check PostgreSQL service is running
- Review Prisma schema

### File upload issues
- **Dropbox credentials must be correct**
- Railway storage is ephemeral (files deleted on redeploy)
- Dropbox integration is mandatory for persistence

### CORS errors
- Verify CORS_ORIGIN matches your frontend URL exactly
- No trailing slash
- Include protocol (https://)

## 🔄 Continuous Deployment

Railway auto-deploys on pushes to main branch:
```bash
git push origin main
# → Railway automatically deploys
```

## 📊 Monitoring

Check Railway dashboard for:
- **Deployments** - Build and deploy status
- **Logs** - Application logs and errors
- **Metrics** - CPU, memory, network usage
- **Variables** - Environment configuration

## ⚙️ Configuration Details

### Port
Railway automatically sets `PORT` environment variable (usually 3000).
The server respects `process.env.PORT`.

### Database
PostgreSQL connection via Railway plugin.
Automatic `DATABASE_URL` injection.

### File Storage
**Dropbox is mandatory** because:
- Railway uses ephemeral storage
- Files are deleted on each deploy
- Dropbox provides permanent cloud storage

### WebSocket
Supports WebSocket connections over HTTPS.
Ensure `SOCKET_CORS_ORIGIN` is configured.

## 🛡️ Security

Production settings:
- ✅ Helmet.js for security headers
- ✅ CORS configured for specific origins
- ✅ Rate limiting enabled
- ✅ JWT with secure secrets
- ✅ bcrypt password hashing
- ✅ Input validation

**⚠️ Never commit**:
- JWT secrets
- Dropbox credentials
- Database passwords
- Any .env files with real credentials

---

For complete deployment guide, see: `../RAILWAY-DEPLOYMENT.md`
