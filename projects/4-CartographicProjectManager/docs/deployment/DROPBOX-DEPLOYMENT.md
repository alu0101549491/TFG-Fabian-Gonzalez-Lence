# Dropbox Deployment Guide

## Deployment Strategies for Dropbox Integration

This guide covers different deployment strategies for the Dropbox integration in production environments.

---

## Option 1: Single Business Account (Recommended for Small-Medium Teams)

### Overview
Use a single Dropbox Business account to store all project files centrally.

### Setup

1. **Create Dropbox Business Account**
   - Sign up at [Dropbox Business](https://www.dropbox.com/business)
   - Choose appropriate plan (2TB+ recommended)

2. **Create Production App**
   - Go to [Dropbox App Console](https://www.dropbox.com/developers/apps)
   - Create new app (separate from development)
   - Name: `CartographicProjectManager-Production`
   - Choose: Full Dropbox access

3. **Configure Permissions**
   - Enable scopes:
     - `files.content.write`
     - `files.content.read`
     - `files.metadata.write`
     - `files.metadata.read`
     - `sharing.write`

4. **Generate Long-Lived Token**
   - In App Console → Settings → OAuth 2
   - Click "Generate access token"
   - Copy token (starts with `sl.`)
   - Store securely in production environment variables

5. **Deploy**

```bash
# Production .env (NEVER commit to git)
DROPBOX_ACCESS_TOKEN=sl.<DROPBOX_ACCESS_TOKEN>

# All projects will be stored in:
# /CartographicProjects/PROJ-001/
# /CartographicProjects/PROJ-002/
# etc.
```

### Pros
✅ Simple setup and maintenance  
✅ Centralized file management  
✅ Single point of backup  
✅ Works immediately without OAuth flow  
✅ Admin has full control  

### Cons
❌ All files in one account (no user separation)  
❌ Token doesn't expire (security risk if leaked)  
❌ Storage limits apply to single account  
❌ No per-user access control at Dropbox level  

### Best For
- Internal company tool
- Small-medium number of projects (<1000)
- Trusted user base
- Company wants centralized file control

---

## Option 2: OAuth 2.0 Flow (User-Specific Dropbox)

### Overview
Each user connects their own Dropbox account. Files are stored in individual user accounts.

### Architecture

```
User Browser → Your Frontend → Your Backend → User's Dropbox
                    ↓
            (OAuth Token Exchange)
                    ↓
            Store user's access token
```

### Implementation Steps

#### 1. Update Environment Variables

```bash
# Production .env
DROPBOX_APP_KEY=your-app-key
DROPBOX_APP_SECRET=your-app-secret
DROPBOX_REDIRECT_URI=https://yourapp.com/auth/dropbox/callback

# Remove this (no shared token):
# DROPBOX_ACCESS_TOKEN=
```

#### 2. Add Database Fields

```sql
-- Add to User table
ALTER TABLE "User" ADD COLUMN "dropboxAccessToken" TEXT;
ALTER TABLE "User" ADD COLUMN "dropboxRefreshToken" TEXT;
ALTER TABLE "User" ADD COLUMN "dropboxTokenExpiresAt" TIMESTAMP;
ALTER TABLE "User" ADD COLUMN "dropboxAccountId" TEXT;
```

#### 3. Implement OAuth Controller

Create `backend/src/presentation/controllers/dropbox-auth.controller.ts`:

```typescript
import {Router, Request, Response} from 'express';
import {Dropbox} from 'dropbox';

export class DropboxAuthController {
  /**
   * Step 1: Redirect user to Dropbox authorization
   */
  public async authorize(req: Request, res: Response): Promise<void> {
    const dbx = new Dropbox({
      clientId: process.env.DROPBOX_APP_KEY!,
    });

    const authUrl = await dbx.auth.getAuthenticationUrl(
      process.env.DROPBOX_REDIRECT_URI!,
      req.user.id, // state parameter
      'code',
      'offline', // Request refresh token
      undefined,
      undefined,
      true, // force re-approval
    );

    res.redirect(authUrl as string);
  }

  /**
   * Step 2: Handle OAuth callback
   */
  public async callback(req: Request, res: Response): Promise<void> {
    const {code, state} = req.query;
    const userId = state as string;

    const dbx = new Dropbox({
      clientId: process.env.DROPBOX_APP_KEY!,
      clientSecret: process.env.DROPBOX_APP_SECRET!,
    });

    try {
      const response = await dbx.auth.getAccessTokenFromCode(
        process.env.DROPBOX_REDIRECT_URI!,
        code as string,
      );

      // Save tokens to user record
      await prisma.user.update({
        where: {id: userId},
        data: {
          dropboxAccessToken: response.result.access_token,
          dropboxRefreshToken: response.result.refresh_token,
          dropboxTokenExpiresAt: new Date(
            Date.now() + response.result.expires_in * 1000
          ),
        },
      });

      res.redirect('/dashboard?dropbox=connected');
    } catch (error) {
      console.error('OAuth error:', error);
      res.redirect('/dashboard?dropbox=error');
    }
  }

  /**
   * Disconnect Dropbox account
   */
  public async disconnect(req: Request, res: Response): Promise<void> {
    await prisma.user.update({
      where: {id: req.user.id},
      data: {
        dropboxAccessToken: null,
        dropboxRefreshToken: null,
        dropboxTokenExpiresAt: null,
      },
    });

    res.json({success: true});
  }
}
```

#### 4. Update File Controller

```typescript
// Modified upload method
public async upload(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = await userRepository.findById(req.user!.id);

  if (!user.dropboxAccessToken) {
    return sendError(
      res,
      'Please connect your Dropbox account first',
      HTTP_STATUS.FORBIDDEN
    );
  }

  // Check if token expired
  if (user.dropboxTokenExpiresAt < new Date()) {
    // Refresh token logic here
    await this.refreshDropboxToken(user);
  }

  // Use user's personal token
  const dropboxService = new DropboxService({
    accessToken: user.dropboxAccessToken,
  });

  // Continue with upload...
}
```

#### 5. Frontend Flow

```vue
<!-- DropboxConnect.vue -->
<template>
  <div v-if="!isConnected">
    <button @click="connectDropbox">
      Connect Dropbox Account
    </button>
  </div>
  <div v-else>
    <span>✓ Dropbox Connected</span>
    <button @click="disconnectDropbox">Disconnect</button>
  </div>
</template>

<script setup lang="ts">
const connectDropbox = () => {
  window.location.href = '/api/v1/auth/dropbox';
};

const disconnectDropbox = async () => {
  await axios.post('/api/v1/auth/dropbox/disconnect');
  isConnected.value = false;
};
</script>
```

### Pros
✅ Files stored in user's personal Dropbox  
✅ No central storage limits  
✅ Users control their own data  
✅ Tokens refresh automatically  
✅ Better security (token per user)  

### Cons
❌ Complex implementation  
❌ Users must have Dropbox accounts  
❌ Files scattered across accounts  
❌ Harder for admin to manage files  
❌ User can revoke access anytime  

### Best For
- SaaS product with external users
- Privacy-focused applications
- When users want data ownership
- Large number of independent users

---

## Option 3: Hybrid Approach (Best of Both Worlds)

### Overview
Admin/company projects use central business account. User-specific projects use OAuth.

```typescript
public async getDropboxService(
  userId: string,
  projectId: string
): Promise<DropboxService> {
  const project = await projectRepository.findById(projectId);

  // Use company account for official projects
  if (project.type === 'COMPANY') {
    return new DropboxService({
      accessToken: process.env.DROPBOX_ACCESS_TOKEN!,
    });
  }

  // Use user's account for personal projects
  const user = await userRepository.findById(userId);
  if (!user.dropboxAccessToken) {
    throw new Error('User must connect Dropbox');
  }

  return new DropboxService({
    accessToken: user.dropboxAccessToken,
  });
}
```

---

## Production Deployment Checklist

### Security

- [ ] Use environment variables (never hardcode tokens)
- [ ] Different tokens for dev/staging/production
- [ ] Rotate tokens every 90 days (if using generated tokens)
- [ ] Enable 2FA on Dropbox Business account
- [ ] Restrict API access by IP (if possible)
- [ ] Monitor API usage for anomalies
- [ ] Set up alerts for failed auth attempts

### Monitoring

```typescript
// Add logging to Dropbox service
class DropboxService {
  async uploadFile(path: string, content: Buffer) {
    const startTime = Date.now();
    
    try {
      const result = await this.client.filesUpload({...});
      
      logger.info('Dropbox upload success', {
        path,
        size: content.length,
        duration: Date.now() - startTime,
      });
      
      return result;
    } catch (error) {
      logger.error('Dropbox upload failed', {
        path,
        error: error.message,
        duration: Date.now() - startTime,
      });
      throw error;
    }
  }
}
```

### Backup Strategy

Even with Dropbox, maintain backups:

```bash
# Cron job to backup critical metadata
0 2 * * * pg_dump cartographic_manager > /backups/db_$(date +\%Y\%m\%d).sql

# Periodically download critical files from Dropbox
0 3 * * 0 node scripts/backup-dropbox-files.js
```

### Performance Optimization

```typescript
// Use queue for large uploads
import Bull from 'bull';

const fileUploadQueue = new Bull('file-uploads');

fileUploadQueue.process(async (job) => {
  const {userId, projectId, file} = job.data;
  await dropboxService.uploadFile(file.path, file.buffer);
});

// In controller, queue instead of blocking
await fileUploadQueue.add({userId, projectId, file});
res.json({message: 'Upload queued'});
```

### Cost Estimation

**Dropbox Business Pricing (2026):**
- Advanced: $20/user/month (3TB)
- Enterprise: Custom pricing (unlimited)

**For 100 projects × 500MB each = 50GB:**
- Can fit in basic Business plan
- Add buffer for growth (recommend 2TB plan)

---

## Recommended Setup for Your Use Case

Based on a cartographic company managing client projects:

### Use **Option 1: Single Business Account**

**Why:**
1. Company owns all project files (professional requirement)
2. Centralized backup and compliance
3. Easier file management for admins
4. Simpler implementation
5. No dependency on client Dropbox accounts

**Setup:**

```bash
# Production .env
DROPBOX_ACCESS_TOKEN=sl.<DROPBOX_ACCESS_TOKEN>

# Storage structure:
# /CartographicProjects/
#   ├── CART-2026-001/    (Client A - Topographic Survey)
#   ├── CART-2026-002/    (Client B - Urban Planning)
#   └── CART-2026-003/    (Client C - Cadastral Mapping)
```

**Access Control:**
- Dropbox: Company account (single source of truth)
- App: Role-based permissions (who can view/download files)
- Clients: Download via temporary links (4-hour expiry)

**Migration Path to OAuth (if needed later):**
- Implement OAuth flow
- Add `usePersonalDropbox` flag to User model
- Gradually migrate users to personal storage
- Keep company projects in business account

---

## Environment Variables Per Environment

### Development
```bash
DROPBOX_ACCESS_TOKEN=sl.<DROPBOX_ACCESS_TOKEN>
```

### Staging
```bash
DROPBOX_ACCESS_TOKEN=sl.<DROPBOX_ACCESS_TOKEN>
```

### Production
```bash
DROPBOX_ACCESS_TOKEN=sl.<DROPBOX_ACCESS_TOKEN>
```

**Important:** Use separate Dropbox apps for each environment to avoid mixing data.

---

## Alternative: Cloud Storage Abstraction

If you want flexibility to switch storage providers:

```typescript
// Abstract storage interface
interface ICloudStorage {
  uploadFile(path: string, content: Buffer): Promise<FileMetadata>;
  downloadFile(path: string): Promise<Buffer>;
  deleteFile(path: string): Promise<void>;
}

// Implementations
class DropboxStorage implements ICloudStorage { ... }
class S3Storage implements ICloudStorage { ... }
class CloudinaryStorage implements ICloudStorage { ... }

// Factory
function createStorage(type: string): ICloudStorage {
  switch (process.env.STORAGE_PROVIDER) {
    case 'dropbox': return new DropboxStorage(...);
    case 's3': return new S3Storage(...);
    default: throw new Error('Unknown storage provider');
  }
}
```

This allows switching from Dropbox to AWS S3 or Google Cloud Storage without changing application code.

---

## Summary

**For your cartographic company:**

👉 **Use Option 1** (Single Business Account) with:
- Dropbox Business account
- Long-lived access token in production `.env`
- Centralized `/CartographicProjects/` folder
- Role-based access control in your app
- Temporary download links for clients
- Regular token rotation (regenerate every 6 months)

**Deployment steps:**
1. Create Dropbox Business account
2. Create production app in App Console
3. Generate access token
4. Add to production environment variables
5. Test with sample upload
6. Set up monitoring and alerts
7. Document recovery procedures
8. Schedule quarterly token rotation

This gives you maximum control, simplicity, and reliability for a professional cartographic service.
