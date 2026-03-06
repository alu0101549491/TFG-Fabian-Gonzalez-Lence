# Dropbox Integration Guide

## Overview

The Cartographic Project Manager uses Dropbox as the cloud storage backend for all project files. This guide explains how to set up and configure the Dropbox integration.

## Features

- **Automatic folder structure** - Creates organized folders for each project
- **Large file support** - Handles files up to 50MB with chunked uploads
- **Temporary download links** - Generates secure, time-limited download URLs
- **Progress tracking** - Real-time upload/download progress callbacks
- **Retry logic** - Automatic retry with exponential backoff for failed requests
- **File type validation** - Supports multiple formats (PDF, CAD, GIS, images, etc.)

## Project Structure in Dropbox

```
CartographicProjects/
└── [PROJECT_CODE]/
    ├── ReportAndAnnexes/
    ├── Plans/
    ├── Specifications/
    ├── Budget/
    ├── Tasks/
    └── Messages/
```

## Prerequisites

1. A Dropbox account
2. A Dropbox App created in the [Dropbox App Console](https://www.dropbox.com/developers/apps)

## Setup Instructions

### 1. Create a Dropbox App

1. Go to [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Click **Create app**
3. Choose:
   - **Scoped access**
   - **Full Dropbox** (or App folder if you prefer isolation)
   - Enter app name (e.g., "Cartographic Project Manager")
4. Click **Create app**

### 2. Configure App Permissions

In the **Permissions** tab, enable the following scopes:

- `files.content.write` - Upload files
- `files.content.read` - Download files
- `files.metadata.write` - Create folders
- `files.metadata.read` - List folder contents
- `sharing.write` - Create shared links

Click **Submit** to save changes.

### 3. Generate Access Token

#### Option A: Development (OAuth2 flow not required)

In the **Settings** tab:
1. Scroll to **OAuth 2** section
2. Under **Generated access token**, click **Generate**
3. Copy the token (it starts with `sl.`)
4. Add to your `.env` file:

```bash
DROPBOX_ACCESS_TOKEN=<dropbox_access_token>
```

⚠️ **Note**: This token does not expire but should only be used for development.

#### Option B: Production (Recommended)

For production, implement the OAuth 2.0 flow:

1. In App Console, note your **App key** and **App secret**
2. Add to `.env`:

```bash
DROPBOX_APP_KEY=your-app-key
DROPBOX_APP_SECRET=your-app-secret
```

3. Implement OAuth flow in your backend to obtain/refresh tokens

### 4. Backend Configuration

Edit `backend/.env`:

```bash
# Required
DROPBOX_ACCESS_TOKEN=<dropbox_access_token>

# Optional (for OAuth flow)
DROPBOX_APP_KEY=your-app-key
DROPBOX_APP_SECRET=your-app-secret
```

### 5. Frontend Configuration

No Dropbox credentials should be configured in the frontend. The frontend must use the backend `/api/v1/files/*` endpoints.

## Usage

### Upload File (Frontend)

```typescript
// Using the API
const formData = new FormData();
formData.append('file', fileBlob);
formData.append('projectId', 'project-123');
formData.append('section', 'Plans');

const response = await fetch('http://localhost:3000/api/v1/files/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${authToken}`,
  },
  body: formData,
});

const result = await response.json();
console.log('File uploaded:', result.data);
```

### Download File

```typescript
// Get temporary download link
const response = await fetch(`http://localhost:3000/api/v1/files/${fileId}/download`, {
  headers: {
    'Authorization': `Bearer ${authToken}`,
  },
});

const {downloadUrl, expiresAt} = await response.json();

// Use the temporary URL to download
window.open(downloadUrl, '_blank');
```

### Backend Service Usage

```typescript
import {DropboxService} from '@infrastructure/external-services/dropbox.service.js';

const dropboxService = new DropboxService({
  accessToken: process.env.DROPBOX_ACCESS_TOKEN!,
});

// Create project folder structure
const projectPath = await dropboxService.createProjectFolder('PROJ-001');

// Upload file
const metadata = await dropboxService.uploadFile(
  '/CartographicProjects/PROJ-001/Plans/design.pdf',
  fileBuffer,
);

// Download file
const fileBuffer = await dropboxService.downloadFile(
  '/CartographicProjects/PROJ-001/Plans/design.pdf',
);

// Get temporary link
const linkResponse = await dropboxService.getTemporaryLink(
  '/CartographicProjects/PROJ-001/Plans/design.pdf',
);
console.log('Download URL:', linkResponse.link);
console.log('Expires at:', linkResponse.expiresAt);
```

## API Endpoints

### Upload File

```
POST /api/v1/files/upload
Content-Type: multipart/form-data

Body:
- file: File (required)
- projectId: string (required)
- section: string (optional, default: "Messages")
- taskId: string (optional)
- messageId: string (optional)

Response:
{
  "success": true,
  "data": {
    "id": "file-uuid",
    "name": "design.pdf",
    "dropboxPath": "/CartographicProjects/PROJ-001/Plans/design.pdf",
    "type": "PDF",
    "sizeInBytes": 1024000,
    "uploadedAt": "2026-02-24T10:00:00.000Z"
  }
}
```

### Get Download Link

```
GET /api/v1/files/:id/download

Response:
{
  "success": true,
  "data": {
    "downloadUrl": "https://dl.dropboxusercontent.com/...",
    "filename": "design.pdf",
    "expiresAt": "2026-02-24T14:00:00.000Z"
  }
}
```

### Delete File

```
DELETE /api/v1/files/:id

Response:
{
  "success": true,
  "message": "File deleted successfully"
}
```

### List Files by Project

```
GET /api/v1/files/project/:projectId

Response:
{
  "success": true,
  "data": [
    {
      "id": "file-uuid",
      "name": "design.pdf",
      "type": "PDF",
      "sizeInBytes": 1024000,
      ...
    }
  ]
}
```

## Supported File Types

- **Documents**: PDF, DOC, DOCX
- **Spreadsheets**: XLS, XLSX
- **Presentations**: PPT, PPTX
- **Images**: JPG, JPEG, PNG, GIF, TIF, TIFF
- **CAD**: DWG, DXF
- **GIS**: SHP, KML, KMZ, GeoJSON
- **Compressed**: ZIP, RAR, 7Z

## File Size Limits

- Maximum file size: **50 MB** (configurable via `MAX_FILE_SIZE` env variable)
- Files larger than 150MB use chunked upload (8MB chunks)

## Error Handling

The service handles various error scenarios:

- **401 Unauthorized** - Invalid or expired access token
- **409 Conflict** - File/folder already exists
- **429 Rate Limited** - Too many requests (automatic retry)
- **507 Insufficient Space** - Dropbox account out of space

## Troubleshooting

### "File upload service not configured"

Ensure `DROPBOX_ACCESS_TOKEN` is set in `backend/.env`

### "Insufficient space in Dropbox account"

Check your Dropbox account storage quota. Consider:
- Upgrading to Dropbox Plus/Professional
- Cleaning up old files
- Using a different Dropbox account

### "Rate limit exceeded"

The service automatically retries with exponential backoff. If persistent:
- Reduce concurrent upload operations
- Wait a few minutes before retrying

### "Invalid access token"

Regenerate the access token in the Dropbox App Console and update `.env`

## Security Considerations

1. **Never commit tokens** - Add `.env` to `.gitignore`
2. **Use environment variables** - Store tokens securely
3. **Rotate tokens regularly** - Regenerate access tokens periodically
4. **Implement OAuth** - For production, use OAuth 2.0 flow
5. **Validate file types** - Backend validates all uploads
6. **Set size limits** - Prevent abuse with file size restrictions

## Production Deployment

For production environments:

1. **Use OAuth 2.0 flow** - Don't use generated tokens
2. **Implement token refresh** - Handle expired tokens gracefully
3. **Monitor storage usage** - Track Dropbox quota usage
4. **Set up webhooks** - Get notified of file changes
5. **Enable audit logs** - Track all file operations
6. **Use environment-specific apps** - Separate dev/prod Dropbox apps

## Production Deployment

For production deployment strategies, security considerations, and best practices, see:

**📘 [Dropbox Deployment Guide](DROPBOX-DEPLOYMENT.md)**

Topics covered:
- Single business account vs OAuth flow
- Token management and rotation
- Security best practices
- Cost estimation
- Monitoring and backup strategies

## Additional Resources

- [Dropbox API Documentation](https://www.dropbox.com/developers/documentation)
- [Dropbox SDK for JavaScript](https://github.com/dropbox/dropbox-sdk-js)
- [OAuth 2.0 Guide](https://www.dropbox.com/developers/documentation/http/documentation#oauth2-authorize)
- [Rate Limiting](https://www.dropbox.com/developers/documentation/http/documentation#rate-limiting)
- [Dropbox Deployment Guide](DROPBOX-DEPLOYMENT.md) - Production setup

## Support

For issues related to:
- **Dropbox API** - Check [Dropbox Developer Forum](https://www.dropboxforum.com/t/developers-api)
- **This integration** - Open an issue in the project repository
