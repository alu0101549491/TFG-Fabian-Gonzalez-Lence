# GLOBAL CONTEXT

**Project:** Cartographic Project Manager (CPM)

**Description:** A web and mobile application for comprehensive management of cartographic projects that facilitates collaboration between an administrator (professional cartographer) and multiple clients simultaneously. The system enables detailed tracking of project status, bidirectional task assignment between administrator and clients with 5 possible states, internal messaging per project with file attachments, calendar view for delivery date management, and technical file sharing through Dropbox integration.

**Architecture:** Layered Architecture with Clean Architecture principles
- Domain Layer → Application Layer → **Infrastructure Layer** (current) → Presentation Layer

**Current module:** Infrastructure Layer - External Services (Dropbox & WhatsApp)

## File Structure Reference
```
4-CartographicProjectManager/
├── src/
│   ├── application/
│   │   ├── dto/                            # ✅ Already implemented
│   │   ├── interfaces/                     # ✅ Already implemented
│   │   ├── services/                       # ✅ Already implemented
│   │   └── index.ts
│   ├── domain/
│   │   ├── entities/                       # ✅ Already implemented
│   │   ├── enumerations/                   # ✅ Already implemented
│   │   ├── repositories/                   # ✅ Already implemented
│   │   ├── value-objects/                  # ✅ Already implemented
│   │   └── index.ts
│   ├── infrastructure/
│   │   ├── external-services/
│   │   │   ├── index.ts                    # 🎯 TO IMPLEMENT
│   │   │   ├── dropbox.service.ts          # 🎯 TO IMPLEMENT
│   │   │   └── whatsapp.gateway.ts         # 🎯 TO IMPLEMENT
│   │   ├── http/
│   │   │   ├── index.ts                    # ✅ Already implemented
│   │   │   └── axios.client.ts             # ✅ Already implemented
│   │   ├── repositories/
│   │   │   └── ...
│   │   ├── websocket/
│   │   │   ├── index.ts                    # ✅ Already implemented
│   │   │   └── socket.handler.ts           # ✅ Already implemented
│   │   └── index.ts
│   ├── presentation/
│   │   └── ...
│   └── shared/
│       └── ...
```

---

# INPUT ARTIFACTS

## 1. Requirements Specification (Relevant Sections)

### Dropbox Integration Requirements (Section 12, FR18)

**Folder Structure (Section 12.1):**
```
Dropbox/
└── CartographicProjects/
    ├── [Project_Code_1]/
    │   ├── ReportAndAnnexes/
    │   ├── Plans/
    │   ├── Specifications/
    │   ├── Budget/
    │   ├── Tasks/
    │   │   ├── Task_001/
    │   │   └── Task_002/
    │   └── Messages/
    │       ├── Attachment_001.pdf
    │       └── Attachment_002.jpg
    └── [Project_Code_2]/
        └── ...
```

**Required Operations (Section 12.2):**
- **Create folder:** When creating new project, automatically generate folder structure in Dropbox
- **Upload file:** Save task or message attachments
- **Download file:** Retrieve documents for viewing or local download
- **List files:** Display project folder contents
- **Share file:** Generate direct access links (with permissions)
- **Delete file:** Delete obsolete documents (administrator only)
- **Synchronization:** Verify file integrity periodically

**Supported File Formats (Section 12.3):**
| Category | Formats |
|----------|---------|
| Documents | PDF, DOC, DOCX, TXT |
| Cartography | KML, KMZ, SHP (+ .shx, .dbf, .prj) |
| Images | JPG, JPEG, PNG, TIFF, GIF |
| CAD | DWG, DXF (optional) |
| Compressed | ZIP, RAR (optional) |
| Spreadsheets | XLS, XLSX, CSV |

**Non-Functional Requirements (NFR6):**
- Robust Dropbox API integration
- Handles errors correctly
- Automatic retries in case of temporary failure

### WhatsApp Integration Requirements (Section 13, FR21)

**Notification Events:**
- New task assigned
- Important messages
- Project about to expire (deadline warning)

**Configuration:**
- User can enable/disable WhatsApp notifications from personal settings
- Requires prior phone number configuration
- Only for critical events

**Rate Limiting:**
- Maximum 1 notification every 30 minutes per project
- Prevents spam to users

**Technical Requirements:**
- WhatsApp Business API or Twilio API
- Graceful fallback if WhatsApp fails (in-app notification still created)

## 2. Dropbox API Reference

**API Version:** Dropbox API v2

**Authentication:** OAuth 2.0 with access token

**Key Endpoints:**
```
POST /files/create_folder_v2       - Create folder
POST /files/upload                 - Upload file (up to 150MB)
POST /files/upload_session/start   - Start chunked upload
POST /files/upload_session/append  - Append to chunked upload
POST /files/upload_session/finish  - Complete chunked upload
POST /files/download               - Download file
POST /files/delete_v2              - Delete file or folder
POST /files/list_folder            - List folder contents
POST /files/get_temporary_link     - Get temporary download link
POST /files/copy_v2                - Copy file
POST /files/move_v2                - Move file
POST /sharing/create_shared_link_with_settings - Create shared link
```

**Error Codes:**
- `path/not_found` - Path does not exist
- `path/conflict` - Path already exists
- `insufficient_space` - No space in account
- `rate_limit` - Too many requests
- `access_denied` - No permission

## 3. WhatsApp Business API Reference

**Options:**
1. **WhatsApp Business API (Direct)** - Requires business verification
2. **Twilio API for WhatsApp** - Easier integration, pay-per-message

**Twilio WhatsApp API:**
```
POST /2010-04-01/Accounts/{AccountSid}/Messages.json

Parameters:
- To: whatsapp:+1234567890
- From: whatsapp:+0987654321 (Twilio number)
- Body: Message text
```

**Message Templates:**
WhatsApp Business requires pre-approved templates for proactive messages:
- `task_assigned`: "New task assigned: {{1}}. Due: {{2}}"
- `project_deadline`: "Project {{1}} deadline in {{2}} days"
- `important_message`: "New message in project {{1}} from {{2}}"

---

# SPECIFIC TASK

Implement the External Services modules for the Infrastructure Layer. These modules integrate with third-party services (Dropbox for file storage, WhatsApp for notifications).

## Files to implement:

### 1. **dropbox.service.ts**

**Responsibilities:**
- Implement Dropbox API integration for file storage
- Create project folder structures
- Handle file upload/download with progress tracking
- Generate temporary and shared links
- Implement retry logic for transient failures
- Manage chunked uploads for large files

**Constants to define:**

```typescript
const DROPBOX_API_URL = 'https://api.dropboxapi.com/2';
const DROPBOX_CONTENT_URL = 'https://content.dropboxapi.com/2';
const ROOT_FOLDER = '/CartographicProjects';
const MAX_SIMPLE_UPLOAD_SIZE = 150 * 1024 * 1024; // 150MB
const CHUNK_SIZE = 8 * 1024 * 1024; // 8MB chunks for large uploads
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;
const LINK_EXPIRY_HOURS = 4;

// Project folder sections
const PROJECT_SECTIONS = [
  'ReportAndAnnexes',
  'Plans',
  'Specifications',
  'Budget',
  'Tasks',
  'Messages',
] as const;
```

**Types to define:**

```typescript
/**
 * Dropbox service configuration
 */
interface DropboxConfig {
  accessToken: string;
  refreshToken?: string;
  appKey?: string;
  appSecret?: string;
}

/**
 * Dropbox file metadata
 */
interface DropboxFileMetadata {
  id: string;
  name: string;
  path: string;
  size: number;
  isFolder: boolean;
  modifiedAt: Date;
  contentHash?: string;
}

/**
 * Dropbox folder metadata
 */
interface DropboxFolderMetadata {
  id: string;
  name: string;
  path: string;
}

/**
 * Upload progress callback
 */
type UploadProgressCallback = (progress: {
  loaded: number;
  total: number;
  percentage: number;
}) => void;

/**
 * Download progress callback
 */
type DownloadProgressCallback = (progress: {
  loaded: number;
  total: number;
  percentage: number;
}) => void;

/**
 * Shared link settings
 */
interface SharedLinkSettings {
  requestedVisibility?: 'public' | 'team_only' | 'password';
  linkPassword?: string;
  expires?: Date;
}

/**
 * Temporary link response
 */
interface TemporaryLinkResponse {
  link: string;
  metadata: DropboxFileMetadata;
  expiresAt: Date;
}

/**
 * Dropbox error
 */
interface DropboxError {
  code: string;
  message: string;
  retryAfter?: number;
}

/**
 * Dropbox service interface (for dependency injection)
 */
interface IDropboxService {
  // Folder operations
  createProjectFolder(projectCode: string): Promise<string>;
  createFolder(path: string): Promise<DropboxFolderMetadata>;
  deleteFolder(path: string): Promise<void>;
  listFolder(path: string): Promise<DropboxFileMetadata[]>;
  
  // File operations
  uploadFile(
    path: string,
    content: ArrayBuffer | Blob,
    onProgress?: UploadProgressCallback
  ): Promise<DropboxFileMetadata>;
  downloadFile(
    path: string,
    onProgress?: DownloadProgressCallback
  ): Promise<ArrayBuffer>;
  deleteFile(path: string): Promise<void>;
  moveFile(fromPath: string, toPath: string): Promise<DropboxFileMetadata>;
  copyFile(fromPath: string, toPath: string): Promise<DropboxFileMetadata>;
  
  // Link operations
  getTemporaryLink(path: string): Promise<TemporaryLinkResponse>;
  createSharedLink(path: string, settings?: SharedLinkSettings): Promise<string>;
  
  // Utility
  getFileMetadata(path: string): Promise<DropboxFileMetadata>;
  pathExists(path: string): Promise<boolean>;
  getSpaceUsage(): Promise<{ used: number; allocated: number }>;
}
```

**Class to implement:**

```typescript
/**
 * Dropbox service implementation for file storage operations.
 * Handles all interactions with Dropbox API including file uploads,
 * downloads, folder management, and link generation.
 */
class DropboxService implements IDropboxService {
  private accessToken: string;
  private refreshToken: string | null = null;
  
  constructor(config: DropboxConfig) {
    this.accessToken = config.accessToken;
    this.refreshToken = config.refreshToken || null;
  }
  
  /**
   * Update access token (e.g., after refresh)
   */
  setAccessToken(token: string): void;
  
  /**
   * Create complete project folder structure
   * Creates: /CartographicProjects/{projectCode}/[all sections]
   */
  async createProjectFolder(projectCode: string): Promise<string>;
  
  /**
   * Create a single folder
   */
  async createFolder(path: string): Promise<DropboxFolderMetadata>;
  
  /**
   * Delete folder and all contents
   */
  async deleteFolder(path: string): Promise<void>;
  
  /**
   * List folder contents
   */
  async listFolder(path: string): Promise<DropboxFileMetadata[]>;
  
  /**
   * List folder contents with pagination
   */
  async listFolderContinue(cursor: string): Promise<{
    entries: DropboxFileMetadata[];
    cursor: string;
    hasMore: boolean;
  }>;
  
  /**
   * Upload file to Dropbox
   * Automatically uses chunked upload for files > 150MB
   */
  async uploadFile(
    path: string,
    content: ArrayBuffer | Blob,
    onProgress?: UploadProgressCallback
  ): Promise<DropboxFileMetadata>;
  
  /**
   * Upload large file using chunked upload session
   */
  private async uploadLargeFile(
    path: string,
    content: ArrayBuffer,
    onProgress?: UploadProgressCallback
  ): Promise<DropboxFileMetadata>;
  
  /**
   * Download file from Dropbox
   */
  async downloadFile(
    path: string,
    onProgress?: DownloadProgressCallback
  ): Promise<ArrayBuffer>;
  
  /**
   * Delete file
   */
  async deleteFile(path: string): Promise<void>;
  
  /**
   * Move file to new location
   */
  async moveFile(fromPath: string, toPath: string): Promise<DropboxFileMetadata>;
  
  /**
   * Copy file to new location
   */
  async copyFile(fromPath: string, toPath: string): Promise<DropboxFileMetadata>;
  
  /**
   * Get temporary download link (valid for 4 hours)
   */
  async getTemporaryLink(path: string): Promise<TemporaryLinkResponse>;
  
  /**
   * Create shared link with settings
   */
  async createSharedLink(path: string, settings?: SharedLinkSettings): Promise<string>;
  
  /**
   * Get existing shared link or create new one
   */
  async getOrCreateSharedLink(path: string): Promise<string>;
  
  /**
   * Get file metadata
   */
  async getFileMetadata(path: string): Promise<DropboxFileMetadata>;
  
  /**
   * Check if path exists
   */
  async pathExists(path: string): Promise<boolean>;
  
  /**
   * Get account space usage
   */
  async getSpaceUsage(): Promise<{ used: number; allocated: number }>;
  
  // Private helper methods
  
  /**
   * Make API request to Dropbox
   */
  private async apiRequest<T>(
    endpoint: string,
    data: unknown,
    isContentRequest?: boolean
  ): Promise<T>;
  
  /**
   * Make content upload request
   */
  private async contentUpload<T>(
    endpoint: string,
    content: ArrayBuffer | Blob,
    args: unknown
  ): Promise<T>;
  
  /**
   * Make content download request
   */
  private async contentDownload(
    endpoint: string,
    args: unknown,
    onProgress?: DownloadProgressCallback
  ): Promise<ArrayBuffer>;
  
  /**
   * Handle Dropbox API error
   */
  private handleError(error: unknown): never;
  
  /**
   * Retry request with exponential backoff
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    maxAttempts?: number
  ): Promise<T>;
  
  /**
   * Normalize path (ensure leading slash, no trailing slash)
   */
  private normalizePath(path: string): string;
  
  /**
   * Map Dropbox API response to internal metadata type
   */
  private mapToFileMetadata(entry: unknown): DropboxFileMetadata;
  
  /**
   * Get project folder path
   */
  getProjectFolderPath(projectCode: string): string;
  
  /**
   * Get section folder path within a project
   */
  getSectionPath(projectCode: string, section: string): string;
  
  /**
   * Get task attachments folder path
   */
  getTaskFolderPath(projectCode: string, taskId: string): string;
}
```

**Implementation Details:**

1. **Create Project Folder Structure:**
```typescript
async createProjectFolder(projectCode: string): Promise<string> {
  const projectPath = this.getProjectFolderPath(projectCode);
  
  // Create main project folder
  await this.createFolder(projectPath);
  
  // Create all section folders
  for (const section of PROJECT_SECTIONS) {
    await this.createFolder(`${projectPath}/${section}`);
  }
  
  return projectPath;
}

getProjectFolderPath(projectCode: string): string {
  return `${ROOT_FOLDER}/${projectCode}`;
}

getSectionPath(projectCode: string, section: string): string {
  return `${ROOT_FOLDER}/${projectCode}/${section}`;
}
```

2. **File Upload with Progress:**
```typescript
async uploadFile(
  path: string,
  content: ArrayBuffer | Blob,
  onProgress?: UploadProgressCallback
): Promise<DropboxFileMetadata> {
  const normalizedPath = this.normalizePath(path);
  const size = content instanceof Blob ? content.size : content.byteLength;
  
  // Convert Blob to ArrayBuffer if needed
  const buffer = content instanceof Blob 
    ? await content.arrayBuffer() 
    : content;
  
  // Use chunked upload for large files
  if (size > MAX_SIMPLE_UPLOAD_SIZE) {
    return this.uploadLargeFile(normalizedPath, buffer, onProgress);
  }
  
  // Simple upload for smaller files
  const result = await this.withRetry(() =>
    this.contentUpload('/files/upload', buffer, {
      path: normalizedPath,
      mode: 'overwrite',
      autorename: false,
      mute: false,
    })
  );
  
  if (onProgress) {
    onProgress({ loaded: size, total: size, percentage: 100 });
  }
  
  return this.mapToFileMetadata(result);
}

private async uploadLargeFile(
  path: string,
  content: ArrayBuffer,
  onProgress?: UploadProgressCallback
): Promise<DropboxFileMetadata> {
  const totalSize = content.byteLength;
  let offset = 0;
  
  // Start upload session
  const startResponse = await this.apiRequest<{ session_id: string }>(
    '/files/upload_session/start',
    {},
    true
  );
  const sessionId = startResponse.session_id;
  
  // Upload chunks
  while (offset < totalSize) {
    const chunkSize = Math.min(CHUNK_SIZE, totalSize - offset);
    const chunk = content.slice(offset, offset + chunkSize);
    const isLastChunk = offset + chunkSize >= totalSize;
    
    if (isLastChunk) {
      // Finish upload session
      const result = await this.contentUpload('/files/upload_session/finish', chunk, {
        cursor: { session_id: sessionId, offset },
        commit: { path, mode: 'overwrite', autorename: false, mute: false },
      });
      
      if (onProgress) {
        onProgress({ loaded: totalSize, total: totalSize, percentage: 100 });
      }
      
      return this.mapToFileMetadata(result);
    } else {
      // Append chunk
      await this.contentUpload('/files/upload_session/append_v2', chunk, {
        cursor: { session_id: sessionId, offset },
        close: false,
      });
      
      offset += chunkSize;
      
      if (onProgress) {
        const percentage = Math.round((offset / totalSize) * 100);
        onProgress({ loaded: offset, total: totalSize, percentage });
      }
    }
  }
  
  throw new Error('Upload failed: unexpected end of loop');
}
```

3. **Get Temporary Link:**
```typescript
async getTemporaryLink(path: string): Promise<TemporaryLinkResponse> {
  const normalizedPath = this.normalizePath(path);
  
  const result = await this.withRetry(() =>
    this.apiRequest<{ link: string; metadata: unknown }>(
      '/files/get_temporary_link',
      { path: normalizedPath }
    )
  );
  
  return {
    link: result.link,
    metadata: this.mapToFileMetadata(result.metadata),
    expiresAt: new Date(Date.now() + LINK_EXPIRY_HOURS * 60 * 60 * 1000),
  };
}
```

4. **API Request with Error Handling:**
```typescript
private async apiRequest<T>(
  endpoint: string,
  data: unknown,
  isContentRequest = false
): Promise<T> {
  const baseUrl = isContentRequest ? DROPBOX_CONTENT_URL : DROPBOX_API_URL;
  
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      this.handleError({ status: response.status, ...errorData });
    }
    
    return await response.json();
  } catch (error) {
    this.handleError(error);
  }
}

private handleError(error: unknown): never {
  const err = error as Record<string, unknown>;
  
  // Rate limit error
  if (err.status === 429) {
    const retryAfter = err.retry_after as number || 60;
    throw new DropboxRateLimitError(retryAfter);
  }
  
  // Path errors
  if (err.error && typeof err.error === 'object') {
    const errorTag = (err.error as Record<string, unknown>)['.tag'] as string;
    
    switch (errorTag) {
      case 'path':
        const pathError = (err.error as Record<string, unknown>).path as Record<string, unknown>;
        const pathTag = pathError?.['.tag'] as string;
        
        if (pathTag === 'not_found') {
          throw new DropboxPathNotFoundError(err.error_summary as string);
        }
        if (pathTag === 'conflict') {
          throw new DropboxPathConflictError(err.error_summary as string);
        }
        break;
        
      case 'insufficient_space':
        throw new DropboxInsufficientSpaceError();
    }
  }
  
  throw new DropboxApiError(
    (err.error_summary as string) || 'Unknown Dropbox error',
    err.status as number
  );
}
```

5. **Retry Logic:**
```typescript
private async withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts = MAX_RETRY_ATTEMPTS
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry rate limit errors, wait instead
      if (error instanceof DropboxRateLimitError) {
        await this.delay(error.retryAfter * 1000);
        continue;
      }
      
      // Don't retry client errors (4xx except 429)
      if (error instanceof DropboxApiError && error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Retry with exponential backoff
      if (attempt < maxAttempts) {
        await this.delay(RETRY_DELAY_MS * Math.pow(2, attempt - 1));
      }
    }
  }
  
  throw lastError;
}

private delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

### 2. **whatsapp.gateway.ts**

**Responsibilities:**
- Implement WhatsApp Business API integration via Twilio
- Send notification messages using templates
- Handle message delivery status
- Implement rate limiting
- Graceful error handling

**Constants to define:**

```typescript
const TWILIO_API_URL = 'https://api.twilio.com/2010-04-01';
const RATE_LIMIT_MINUTES = 30;
const MAX_MESSAGE_LENGTH = 1024;

// Message templates (must be pre-approved in WhatsApp Business)
const MESSAGE_TEMPLATES = {
  TASK_ASSIGNED: 'task_assigned',
  PROJECT_DEADLINE: 'project_deadline',
  IMPORTANT_MESSAGE: 'important_message',
  TASK_STATUS_CHANGED: 'task_status_changed',
  PROJECT_ASSIGNED: 'project_assigned',
} as const;
```

**Types to define:**

```typescript
/**
 * WhatsApp gateway configuration
 */
interface WhatsAppConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;  // Twilio WhatsApp number (e.g., +14155238886)
  enabled: boolean;
}

/**
 * Message template parameters
 */
interface TemplateParams {
  [key: string]: string | number;
}

/**
 * Send message request
 */
interface SendMessageRequest {
  to: string;           // Recipient phone number (E.164 format)
  template: keyof typeof MESSAGE_TEMPLATES;
  params: TemplateParams;
}

/**
 * Send message response
 */
interface SendMessageResponse {
  success: boolean;
  messageId: string | null;
  error: string | null;
  errorCode: WhatsAppErrorCode | null;
}

/**
 * WhatsApp error codes
 */
enum WhatsAppErrorCode {
  INVALID_NUMBER = 'INVALID_NUMBER',
  RATE_LIMITED = 'RATE_LIMITED',
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  DELIVERY_FAILED = 'DELIVERY_FAILED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  NOT_CONFIGURED = 'NOT_CONFIGURED',
  DISABLED = 'DISABLED',
}

/**
 * Message status
 */
enum MessageStatus {
  QUEUED = 'queued',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  UNDELIVERED = 'undelivered',
}

/**
 * Message status callback data
 */
interface MessageStatusCallback {
  messageId: string;
  status: MessageStatus;
  errorCode?: string;
  errorMessage?: string;
  timestamp: Date;
}

/**
 * Rate limit tracking
 */
interface RateLimitEntry {
  lastSentAt: Date;
  count: number;
}

/**
 * WhatsApp gateway interface
 */
interface IWhatsAppGateway {
  isConfigured(): boolean;
  isEnabled(): boolean;
  sendMessage(request: SendMessageRequest): Promise<SendMessageResponse>;
  sendTaskAssignedNotification(to: string, taskDescription: string, dueDate: string): Promise<SendMessageResponse>;
  sendProjectDeadlineNotification(to: string, projectCode: string, daysRemaining: number): Promise<SendMessageResponse>;
  sendImportantMessageNotification(to: string, projectCode: string, senderName: string): Promise<SendMessageResponse>;
  canSendMessage(to: string, rateLimitKey: string): boolean;
  getMessageStatus(messageId: string): Promise<MessageStatus>;
}
```

**Class to implement:**

```typescript
/**
 * WhatsApp gateway implementation using Twilio API.
 * Handles sending WhatsApp notifications with rate limiting and error handling.
 */
class WhatsAppGateway implements IWhatsAppGateway {
  private config: WhatsAppConfig;
  private rateLimitMap: Map<string, RateLimitEntry> = new Map();
  
  constructor(config: WhatsAppConfig) {
    this.config = config;
  }
  
  /**
   * Check if gateway is properly configured
   */
  isConfigured(): boolean;
  
  /**
   * Check if gateway is enabled
   */
  isEnabled(): boolean;
  
  /**
   * Update configuration
   */
  updateConfig(config: Partial<WhatsAppConfig>): void;
  
  /**
   * Enable/disable gateway
   */
  setEnabled(enabled: boolean): void;
  
  /**
   * Send message using template
   */
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse>;
  
  /**
   * Send task assigned notification
   */
  async sendTaskAssignedNotification(
    to: string,
    taskDescription: string,
    dueDate: string
  ): Promise<SendMessageResponse>;
  
  /**
   * Send project deadline warning notification
   */
  async sendProjectDeadlineNotification(
    to: string,
    projectCode: string,
    daysRemaining: number
  ): Promise<SendMessageResponse>;
  
  /**
   * Send important message notification
   */
  async sendImportantMessageNotification(
    to: string,
    projectCode: string,
    senderName: string
  ): Promise<SendMessageResponse>;
  
  /**
   * Send task status changed notification
   */
  async sendTaskStatusChangedNotification(
    to: string,
    taskDescription: string,
    newStatus: string
  ): Promise<SendMessageResponse>;
  
  /**
   * Send project assigned notification
   */
  async sendProjectAssignedNotification(
    to: string,
    projectCode: string,
    projectName: string
  ): Promise<SendMessageResponse>;
  
  /**
   * Check if can send message (rate limit check)
   */
  canSendMessage(to: string, rateLimitKey: string): boolean;
  
  /**
   * Record message sent for rate limiting
   */
  private recordMessageSent(rateLimitKey: string): void;
  
  /**
   * Get message delivery status
   */
  async getMessageStatus(messageId: string): Promise<MessageStatus>;
  
  /**
   * Clean up old rate limit entries
   */
  cleanupRateLimits(): void;
  
  // Private helper methods
  
  /**
   * Make Twilio API request
   */
  private async twilioRequest<T>(
    endpoint: string,
    data: Record<string, string>
  ): Promise<T>;
  
  /**
   * Format phone number to E.164 format
   */
  private formatPhoneNumber(phone: string): string;
  
  /**
   * Validate phone number
   */
  private isValidPhoneNumber(phone: string): boolean;
  
  /**
   * Build message body from template
   */
  private buildMessageBody(template: string, params: TemplateParams): string;
  
  /**
   * Handle Twilio API error
   */
  private handleError(error: unknown): SendMessageResponse;
  
  /**
   * Get rate limit key for tracking
   */
  private getRateLimitKey(to: string, contextKey: string): string;
}
```

**Implementation Details:**

1. **Send Message via Twilio:**
```typescript
async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
  // Check if configured and enabled
  if (!this.isConfigured()) {
    return {
      success: false,
      messageId: null,
      error: 'WhatsApp gateway not configured',
      errorCode: WhatsAppErrorCode.NOT_CONFIGURED,
    };
  }
  
  if (!this.isEnabled()) {
    return {
      success: false,
      messageId: null,
      error: 'WhatsApp notifications are disabled',
      errorCode: WhatsAppErrorCode.DISABLED,
    };
  }
  
  // Validate phone number
  if (!this.isValidPhoneNumber(request.to)) {
    return {
      success: false,
      messageId: null,
      error: 'Invalid phone number format',
      errorCode: WhatsAppErrorCode.INVALID_NUMBER,
    };
  }
  
  // Build message body
  const body = this.buildMessageBody(request.template, request.params);
  
  try {
    const formattedTo = this.formatPhoneNumber(request.to);
    
    const response = await this.twilioRequest<{ sid: string; status: string }>(
      `/Accounts/${this.config.accountSid}/Messages.json`,
      {
        To: `whatsapp:${formattedTo}`,
        From: `whatsapp:${this.config.fromNumber}`,
        Body: body,
      }
    );
    
    return {
      success: true,
      messageId: response.sid,
      error: null,
      errorCode: null,
    };
    
  } catch (error) {
    return this.handleError(error);
  }
}
```

2. **Template-Based Notifications:**
```typescript
async sendTaskAssignedNotification(
  to: string,
  taskDescription: string,
  dueDate: string
): Promise<SendMessageResponse> {
  return this.sendMessage({
    to,
    template: 'TASK_ASSIGNED',
    params: {
      '1': this.truncate(taskDescription, 100),
      '2': dueDate,
    },
  });
}

async sendProjectDeadlineNotification(
  to: string,
  projectCode: string,
  daysRemaining: number
): Promise<SendMessageResponse> {
  return this.sendMessage({
    to,
    template: 'PROJECT_DEADLINE',
    params: {
      '1': projectCode,
      '2': daysRemaining.toString(),
    },
  });
}

async sendImportantMessageNotification(
  to: string,
  projectCode: string,
  senderName: string
): Promise<SendMessageResponse> {
  return this.sendMessage({
    to,
    template: 'IMPORTANT_MESSAGE',
    params: {
      '1': projectCode,
      '2': senderName,
    },
  });
}

private buildMessageBody(template: string, params: TemplateParams): string {
  const templates: Record<string, string> = {
    'TASK_ASSIGNED': '📋 New task assigned: {{1}}\n📅 Due: {{2}}',
    'PROJECT_DEADLINE': '⚠️ Project {{1}} deadline in {{2}} days',
    'IMPORTANT_MESSAGE': '💬 New message in project {{1}} from {{2}}',
    'TASK_STATUS_CHANGED': '🔄 Task "{{1}}" status changed to: {{2}}',
    'PROJECT_ASSIGNED': '🎉 You have been assigned to project {{1}}: {{2}}',
  };
  
  let body = templates[template] || template;
  
  Object.entries(params).forEach(([key, value]) => {
    body = body.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
  });
  
  return body;
}
```

3. **Rate Limiting:**
```typescript
canSendMessage(to: string, rateLimitKey: string): boolean {
  const key = this.getRateLimitKey(to, rateLimitKey);
  const entry = this.rateLimitMap.get(key);
  
  if (!entry) {
    return true;
  }
  
  const minutesSinceLast = (Date.now() - entry.lastSentAt.getTime()) / (1000 * 60);
  return minutesSinceLast >= RATE_LIMIT_MINUTES;
}

private recordMessageSent(rateLimitKey: string): void {
  const existing = this.rateLimitMap.get(rateLimitKey);
  
  this.rateLimitMap.set(rateLimitKey, {
    lastSentAt: new Date(),
    count: (existing?.count || 0) + 1,
  });
}

private getRateLimitKey(to: string, contextKey: string): string {
  return `${to}:${contextKey}`;
}

cleanupRateLimits(): void {
  const now = Date.now();
  const expiryMs = RATE_LIMIT_MINUTES * 60 * 1000 * 2; // Keep for 2x the rate limit period
  
  for (const [key, entry] of this.rateLimitMap.entries()) {
    if (now - entry.lastSentAt.getTime() > expiryMs) {
      this.rateLimitMap.delete(key);
    }
  }
}
```

4. **Twilio API Request:**
```typescript
private async twilioRequest<T>(
  endpoint: string,
  data: Record<string, string>
): Promise<T> {
  const url = `${TWILIO_API_URL}${endpoint}`;
  const auth = Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString('base64');
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(data).toString(),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new TwilioApiError(
      errorData.message || 'Twilio API error',
      response.status,
      errorData.code
    );
  }
  
  return await response.json();
}

private handleError(error: unknown): SendMessageResponse {
  if (error instanceof TwilioApiError) {
    // Map Twilio error codes to our error codes
    let errorCode = WhatsAppErrorCode.DELIVERY_FAILED;
    
    if (error.twilioCode === 21211 || error.twilioCode === 21614) {
      errorCode = WhatsAppErrorCode.INVALID_NUMBER;
    } else if (error.status === 429) {
      errorCode = WhatsAppErrorCode.RATE_LIMITED;
    } else if (error.status >= 500) {
      errorCode = WhatsAppErrorCode.SERVICE_UNAVAILABLE;
    }
    
    return {
      success: false,
      messageId: null,
      error: error.message,
      errorCode,
    };
  }
  
  return {
    success: false,
    messageId: null,
    error: 'Unknown error occurred',
    errorCode: WhatsAppErrorCode.DELIVERY_FAILED,
  };
}
```

5. **Phone Number Validation:**
```typescript
private formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters except leading +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Ensure E.164 format (starts with +)
  if (!cleaned.startsWith('+')) {
    cleaned = `+${cleaned}`;
  }
  
  return cleaned;
}

private isValidPhoneNumber(phone: string): boolean {
  // E.164 format: + followed by 7-15 digits
  const e164Regex = /^\+[1-9]\d{6,14}$/;
  const formatted = this.formatPhoneNumber(phone);
  return e164Regex.test(formatted);
}

private truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}
```

---

### 3. **index.ts** (Barrel Export)

**Responsibilities:**
- Export all external service classes and interfaces
- Export all types and enums
- Provide singleton instances

**Content:**
```typescript
// Dropbox exports
export {
  DropboxService,
  type IDropboxService,
  type DropboxConfig,
  type DropboxFileMetadata,
  type DropboxFolderMetadata,
  type UploadProgressCallback,
  type DownloadProgressCallback,
  type SharedLinkSettings,
  type TemporaryLinkResponse,
  type DropboxError,
};

// Dropbox error classes
export {
  DropboxApiError,
  DropboxPathNotFoundError,
  DropboxPathConflictError,
  DropboxRateLimitError,
  DropboxInsufficientSpaceError,
};

// WhatsApp exports
export {
  WhatsAppGateway,
  type IWhatsAppGateway,
  type WhatsAppConfig,
  type SendMessageRequest,
  type SendMessageResponse,
  type MessageStatusCallback,
  WhatsAppErrorCode,
  MessageStatus,
  MESSAGE_TEMPLATES,
};

// WhatsApp error classes
export { TwilioApiError };

// Factory functions for creating configured instances
export function createDropboxService(config: DropboxConfig): IDropboxService {
  return new DropboxService(config);
}

export function createWhatsAppGateway(config: WhatsAppConfig): IWhatsAppGateway {
  return new WhatsAppGateway(config);
}
```

---

# CONSTRAINTS AND STANDARDS

## Code:
- **Language:** TypeScript 5.x
- **Code style:** Google TypeScript Style Guide
- **Maximum cyclomatic complexity:** 10
- **Maximum method length:** 50 lines

## Mandatory best practices:
- **Error Handling:** Custom error classes for each service
- **Retry Logic:** Automatic retry with exponential backoff for transient failures
- **Rate Limiting:** Respect API rate limits
- **Logging:** Log important operations and errors (without sensitive data)
- **Security:**
  - Never log access tokens or API keys
  - Use HTTPS for all API calls
  - Validate all inputs

## Environment Variables:
```typescript
// Dropbox
VITE_DROPBOX_ACCESS_TOKEN: string;
VITE_DROPBOX_REFRESH_TOKEN: string;
VITE_DROPBOX_APP_KEY: string;
VITE_DROPBOX_APP_SECRET: string;

// WhatsApp/Twilio
VITE_TWILIO_ACCOUNT_SID: string;
VITE_TWILIO_AUTH_TOKEN: string;
VITE_TWILIO_WHATSAPP_NUMBER: string;
VITE_WHATSAPP_ENABLED: boolean;
```

## Custom Error Classes:
```typescript
// Dropbox errors
class DropboxApiError extends Error { status: number; }
class DropboxPathNotFoundError extends DropboxApiError { }
class DropboxPathConflictError extends DropboxApiError { }
class DropboxRateLimitError extends DropboxApiError { retryAfter: number; }
class DropboxInsufficientSpaceError extends DropboxApiError { }

// Twilio errors
class TwilioApiError extends Error { status: number; twilioCode?: number; }
```

---

# DELIVERABLES

1. **Complete source code** for all 3 files (dropbox.service.ts + whatsapp.gateway.ts + index.ts)

2. **For dropbox.service.ts:**
   - Full DropboxService class implementation
   - All types and interfaces
   - Project folder structure creation
   - File upload with chunked upload support
   - File download with progress
   - Temporary and shared link generation
   - Retry logic with exponential backoff
   - Custom error classes

3. **For whatsapp.gateway.ts:**
   - Full WhatsAppGateway class implementation
   - All types and interfaces
   - Template-based message sending
   - Rate limiting implementation
   - Phone number validation
   - Error handling
   - Custom error classes

4. **Edge cases to handle:**
   - Dropbox: Large file uploads, rate limits, insufficient space, path conflicts
   - WhatsApp: Invalid phone numbers, rate limits, service unavailable
   - Both: Network failures, authentication errors, timeout

---

# OUTPUT FORMAT

For each file, provide the complete implementation:

```typescript
// src/infrastructure/external-services/dropbox.service.ts
[Complete code here]
```

```typescript
// src/infrastructure/external-services/whatsapp.gateway.ts
[Complete code here]
```

```typescript
// src/infrastructure/external-services/index.ts
[Complete code here]
```

**Design decisions made:**
- [Decision 1 and justification]
- [Decision 2 and justification]

**Possible future improvements:**
- [Improvement 1]
- [Improvement 2]
