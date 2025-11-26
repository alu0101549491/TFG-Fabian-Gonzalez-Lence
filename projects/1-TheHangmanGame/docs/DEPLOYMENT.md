# Deployment Guide - The Hangman Game

This guide provides comprehensive instructions for deploying The Hangman Game to various hosting platforms.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Build Process](#build-process)
3. [Deployment Options](#deployment-options)
   - [GitHub Pages](#option-1-github-pages)
   - [Netlify](#option-2-netlify)
   - [Vercel](#option-3-vercel)
   - [Traditional Web Server](#option-4-traditional-web-server)
4. [Post-Deployment Verification](#post-deployment-verification)
5. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying, ensure the following steps are completed:

- [ ] All unit tests pass (`npm test`)
- [ ] Code coverage meets threshold (≥80%)
- [ ] Linting passes without errors (`npm run lint`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Application works correctly in preview mode (`npm run preview`)
- [ ] All documentation is up to date
- [ ] Environment variables configured (if any)

### Verification Commands

```bash
# Run all checks
npm run type-check
npm run lint
npm run test:coverage
npm run build
npm run preview
```

---

## Build Process

### 1. Production Build

```bash
# Navigate to project directory
cd 1-TheHangmanGame

# Install dependencies (if not already installed)
npm install

# Build for production
npm run build
```

This creates an optimized production build in the `dist/` directory with:
- Minified JavaScript and CSS
- Optimized assets
- Source maps for debugging
- Tree-shaken code

### 2. Build Output Structure

```
dist/
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other-assets]
├── favicon.ico
└── index.html
```

---

## Deployment Options

### Option 1: GitHub Pages

GitHub Pages provides free static hosting directly from your repository.

#### Method A: Using GitHub Actions (Recommended)

**Step 1**: Create GitHub Actions workflow file (already provided in `.github/workflows/deploy.yml`)

**Step 2**: Configure GitHub Pages
1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Source", select **GitHub Actions**
4. Save the configuration

**Step 3**: Push to trigger deployment
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

The application will be available at: `https://<username>.github.io/<repository-name>/`

#### Method B: Manual Deployment

```bash
# Build the project
npm run build

# Install gh-pages package
npm install --save-dev gh-pages

# Add deploy script to package.json (if not present)
# "deploy": "gh-pages -d dist"

# Deploy
npm run deploy
```

#### Configuration Notes for GitHub Pages

If your repository is not at the root (e.g., `https://username.github.io/repo-name/`), update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/repo-name/', // Add your repository name
  // ... rest of config
});
```

---

### Option 2: Netlify

Netlify offers continuous deployment, custom domains, and automatic HTTPS.

#### Method A: Continuous Deployment (Recommended)

**Step 1**: Connect Repository
1. Sign in to [Netlify](https://www.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect to your Git provider (GitHub, GitLab, Bitbucket)
4. Select your repository

**Step 2**: Configure Build Settings
- **Base directory**: `1-TheHangmanGame`
- **Build command**: `npm run build`
- **Publish directory**: `1-TheHangmanGame/dist`
- **Node version**: 18 or 20

**Step 3**: Deploy
- Click "Deploy site"
- Netlify will automatically build and deploy your application

#### Method B: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

#### Netlify Configuration File

Create `netlify.toml` in project root:

```toml
[build]
  base = "1-TheHangmanGame"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

---

### Option 3: Vercel

Vercel provides zero-configuration deployments with automatic HTTPS and global CDN.

#### Method A: Vercel Dashboard (Recommended)

**Step 1**: Import Project
1. Sign in to [Vercel](https://vercel.com/)
2. Click "Add New" → "Project"
3. Import your Git repository

**Step 2**: Configure Project
- **Framework Preset**: Vite
- **Root Directory**: `1-TheHangmanGame`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

**Step 3**: Deploy
- Click "Deploy"
- Vercel will build and deploy automatically

#### Method B: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project
cd 1-TheHangmanGame

# Deploy
vercel --prod
```

#### Vercel Configuration File

Create `vercel.json` in project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite"
}
```

---

### Option 4: Traditional Web Server

Deploy to any web server (Apache, Nginx, etc.) that can serve static files.

#### Step 1: Build the Project

```bash
npm run build
```

#### Step 2: Upload Files

Upload the contents of the `dist/` directory to your web server's public directory:
- Via FTP/SFTP
- Via SSH/SCP
- Via hosting control panel

#### Step 3: Configure Web Server

##### Nginx Configuration

Create or modify `/etc/nginx/sites-available/hangman-game`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/hangman-game;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

##### Apache Configuration

Create or modify `.htaccess` in the root directory:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Enable gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType application/font-woff "access plus 1 year"
  ExpiresByType application/font-woff2 "access plus 1 year"
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-Content-Type-Options "nosniff"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

---

## Post-Deployment Verification

After deployment, verify the application is working correctly:

### 1. Functional Testing

- [ ] Application loads without errors
- [ ] All assets load correctly (CSS, JS, images)
- [ ] Game initializes properly
- [ ] Letter selection works
- [ ] Hangman drawing renders correctly
- [ ] Victory/defeat conditions trigger properly
- [ ] Restart functionality works

### 2. Performance Testing

Use browser DevTools or online tools:

- [ ] Page load time < 3 seconds
- [ ] First Contentful Paint < 1.5 seconds
- [ ] Time to Interactive < 3 seconds
- [ ] No console errors or warnings

### 3. Cross-Browser Testing

Test on multiple browsers:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### 4. Responsive Testing

Test on different screen sizes:
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### 5. SEO and Metadata

Verify metadata is correct:
- [ ] Page title is descriptive
- [ ] Meta description is present
- [ ] Favicon loads correctly
- [ ] Open Graph tags (if added)

---

## Troubleshooting

### Issue: Assets not loading (404 errors)

**Solution**: Check the `base` configuration in `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/', // For root deployment
  // OR
  base: '/your-repo-name/', // For subdirectory deployment
});
```

### Issue: Blank page after deployment

**Possible causes**:
1. **JavaScript errors**: Check browser console
2. **Incorrect base path**: Update `vite.config.ts`
3. **Missing files**: Verify all files uploaded correctly

**Solution**: Check browser console for errors and verify build output.

### Issue: 404 on page refresh

**Cause**: Server not configured for SPA routing

**Solution**: Configure server to serve `index.html` for all routes (see web server configurations above)

### Issue: CSS not applying

**Possible causes**:
1. **Bulma not imported**: Verify `import 'bulma/css/bulma.min.css'` in `main.ts`
2. **Build issue**: Try rebuilding with `npm run build`
3. **Cache issue**: Clear browser cache

### Issue: Performance issues

**Solutions**:
1. Enable gzip compression on server
2. Configure proper cache headers
3. Verify assets are minified
4. Check network tab for slow resources

### Issue: Mobile display problems

**Solutions**:
1. Verify viewport meta tag in `index.html`
2. Test responsive CSS breakpoints
3. Check touch event handling

---

## Continuous Deployment

For automatic deployments on every commit:

### GitHub Actions (Already configured)

The `.github/workflows/ci.yml` file handles:
- Automated testing
- Linting
- Building
- Deployment (if deploy workflow is added)

### Additional Deploy Workflow

Create `.github/workflows/deploy.yml` for automatic deployment to GitHub Pages:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: '1-TheHangmanGame/package-lock.json'
      
      - name: Install dependencies
        working-directory: 1-TheHangmanGame
        run: npm ci
      
      - name: Build
        working-directory: 1-TheHangmanGame
        run: npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: 1-TheHangmanGame/dist
```

---

## Environment-Specific Configurations

### Development
```bash
npm run dev
```

### Preview (test production build locally)
```bash
npm run build
npm run preview
```

### Production
```bash
npm run build
# Then deploy the dist/ directory
```

---

## Custom Domain Setup

### GitHub Pages

1. Add `CNAME` file in `public/` directory:
   ```
   yourdomain.com
   ```
2. Configure DNS settings with your domain provider
3. Enable "Enforce HTTPS" in GitHub Pages settings

### Netlify

1. Go to Site settings → Domain management
2. Add custom domain
3. Follow DNS configuration instructions
4. HTTPS is automatic

### Vercel

1. Go to Project settings → Domains
2. Add custom domain
3. Configure DNS as instructed
4. SSL is automatic

---

## Monitoring and Analytics

Consider adding analytics to monitor usage:

### Google Analytics

Add to `index.html` before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Performance Monitoring

Use browser DevTools or services like:
- Lighthouse
- WebPageTest
- GTmetrix

---

## Security Considerations

### Content Security Policy (CSP)

Add CSP headers for enhanced security (configure on your hosting platform):

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self';
```

### HTTPS

Always use HTTPS in production:
- GitHub Pages: Automatic with custom domain
- Netlify: Automatic
- Vercel: Automatic
- Traditional hosting: Configure SSL certificate (Let's Encrypt)

---

## Backup and Rollback

### Version Control

- Always tag releases: `git tag -a v1.0.0 -m "Release version 1.0.0"`
- Keep production branch clean
- Test thoroughly before merging to production

### Rollback Procedure

If deployment issues occur:

**GitHub Pages**:
```bash
git revert HEAD
git push origin main
```

**Netlify/Vercel**:
- Use dashboard to rollback to previous deployment
- Or deploy a previous commit

---

## Conclusion

Your Hangman Game is now ready for deployment! Choose the hosting option that best fits your needs:

- **GitHub Pages**: Best for open-source projects
- **Netlify**: Best for ease of use and features
- **Vercel**: Best for performance and DX
- **Traditional Server**: Best for full control

For questions or issues, refer to the troubleshooting section or consult the hosting platform's documentation.

**Next Steps**:
1. Choose your hosting platform
2. Follow the deployment instructions
3. Verify the deployment
4. Share your game with the world!

Good luck! 🎮