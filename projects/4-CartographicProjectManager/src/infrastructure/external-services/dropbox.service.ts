/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file src/infrastructure/external-services/dropbox.service.ts
 * @desc Dropbox API integration for file storage operations with retry logic
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://www.dropbox.com/developers/documentation/http/documentation}
 */

/**
 * Dropbox API base URL for standard operations
 */
const DROPBOX_API_URL = 'https://api.dropboxapi.com/2';

/**
 * Dropbox content API URL for upload/download operations
 */
const DROPBOX_CONTENT_URL = 'https://content.dropboxapi.com/2';

/**
 * Root folder path for all projects in Dropbox
 */
const ROOT_FOLDER = '/CartographicProjects';

/**
 * Maximum file size for simple upload (150MB)
 */
const MAX_SIMPLE_UPLOAD_SIZE = 150 * 1024 * 1024;

/**
 * Chunk size for large file uploads (8MB)
 */
const CHUNK_SIZE = 8 * 1024 * 1024;

/**
 * Maximum retry attempts for failed requests
 */
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Base delay for retry attempts (ms)
 */
const RETRY_DELAY_MS = 1000;

/**
 * Temporary link expiry duration (hours)
 */
const LINK_EXPIRY_HOURS = 4;

/**
 * Project folder sections that are auto-created
 */
const PROJECT_SECTIONS = [
  'ReportAndAnnexes',
  'Plans',
  'Specifications',
  'Budget',
  'Tasks',
  'Messages',
] as const;

/**
 * Dropbox service configuration
 */
export interface DropboxConfig {
  /** Dropbox access token for authentication */
  accessToken: string;
  /** Optional refresh token for token renewal */
  refreshToken?: string;
  /** App key for OAuth */
  appKey?: string;
  /** App secret for OAuth */
  appSecret?: string;
}

/**
 * Dropbox file metadata
 */
export interface DropboxFileMetadata {
  /** File unique identifier */
  id: string;
  /** File name */
  name: string;
  /** Full path in Dropbox */
  path: string;
  /** File size in bytes */
  size: number;
  /** Whether this is a folder */
  isFolder: boolean;
  /** Last modification timestamp */
  modifiedAt: Date;
  /** Content hash for change detection */
  contentHash?: string;
}

/**
 * Dropbox folder metadata
 */
export interface DropboxFolderMetadata {
  /** Folder unique identifier */
  id: string;
  /** Folder name */
  name: string;
  /** Full path in Dropbox */
  path: string;
}

/**
 * Upload progress callback type
 */
export type UploadProgressCallback = (progress: {
  loaded: number;
  total: number;
  percentage: number;
}) => void;

/**
 * Download progress callback type
 */
export type DownloadProgressCallback = (progress: {
  loaded: number;
  total: number;
  percentage: number;
}) => void;

/**
 * Shared link settings
 */
export interface SharedLinkSettings {
  /** Link visibility setting */
  requestedVisibility?: 'public' | 'team_only' | 'password';
  /** Password for protected links */
  linkPassword?: string;
  /** Link expiration date */
  expires?: Date;
}

/**
 * Temporary link response
 */
export interface TemporaryLinkResponse {
  /** Temporary download URL */
  link: string;
  /** File metadata */
  metadata: DropboxFileMetadata;
  /** Link expiration timestamp */
  expiresAt: Date;
}

/**
 * Dropbox error interface
 */
export interface DropboxError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Retry-After header value (seconds) */
  retryAfter?: number;
}

/**
 * Base Dropbox API error class
 */
export class DropboxApiError extends Error {
  public readonly status: number;

  public constructor(message: string, status: number) {
    super(message);
    this.name = 'DropboxApiError';
    this.status = status;
  }
}

/**
 * Dropbox path not found error
 */
export class DropboxPathNotFoundError extends DropboxApiError {
  public constructor(message: string) {
    super(message, 404);
    this.name = 'DropboxPathNotFoundError';
  }
}

/**
 * Dropbox path conflict error (already exists)
 */
export class DropboxPathConflictError extends DropboxApiError {
  public constructor(message: string) {
    super(message, 409);
    this.name = 'DropboxPathConflictError';
  }
}

/**
 * Dropbox rate limit error
 */
export class DropboxRateLimitError extends DropboxApiError {
  public readonly retryAfter: number;

  public constructor(retryAfter: number) {
    super(`Rate limit exceeded. Retry after ${retryAfter} seconds.`, 429);
    this.name = 'DropboxRateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Dropbox insufficient space error
 */
export class DropboxInsufficientSpaceError extends DropboxApiError {
  public constructor() {
    super('Insufficient space in Dropbox account', 507);
    this.name = 'DropboxInsufficientSpaceError';
  }
}

/**
 * Interface for Dropbox operations used throughout the application
 */
export interface IDropboxService {
  /**
   * Create complete project folder structure
   * @param projectCode - Project code for folder name
   * @returns Project folder path
   */
  createProjectFolder(projectCode: string): Promise<string>;

  /**
   * Create a single folder
   * @param path - Folder path to create
   * @returns Folder metadata
   */
  createFolder(path: string): Promise<DropboxFolderMetadata>;

  /**
   * Delete folder and all contents
   * @param path - Folder path to delete
   */
  deleteFolder(path: string): Promise<void>;

  /**
   * List folder contents
   * @param path - Folder path to list
   * @returns Array of file/folder metadata
   */
  listFolder(path: string): Promise<DropboxFileMetadata[]>;

  /**
   * Upload file to Dropbox
   * @param path - Destination file path
   * @param content - File content as ArrayBuffer or Blob
   * @param onProgress - Optional progress callback
   * @returns File metadata
   */
  uploadFile(
    path: string,
    content: ArrayBuffer | Blob,
    onProgress?: UploadProgressCallback,
  ): Promise<DropboxFileMetadata>;

  /**
   * Download file from Dropbox
   * @param path - File path to download
   * @param onProgress - Optional progress callback
   * @returns File content as ArrayBuffer
   */
  downloadFile(
    path: string,
    onProgress?: DownloadProgressCallback,
  ): Promise<ArrayBuffer>;

  /**
   * Delete file
   * @param path - File path to delete
   */
  deleteFile(path: string): Promise<void>;

  /**
   * Move file to new location
   * @param fromPath - Source file path
   * @param toPath - Destination file path
   * @returns File metadata
   */
  moveFile(
    fromPath: string,
    toPath: string,
  ): Promise<DropboxFileMetadata>;

  /**
   * Copy file to new location
   * @param fromPath - Source file path
   * @param toPath - Destination file path
   * @returns File metadata
   */
  copyFile(
    fromPath: string,
    toPath: string,
  ): Promise<DropboxFileMetadata>;

  /**
   * Get temporary download link (valid for 4 hours)
   * @param path - File path
   * @returns Temporary link response
   */
  getTemporaryLink(path: string): Promise<TemporaryLinkResponse>;

  /**
   * Create shared link with settings
   * @param path - File path
   * @param settings - Optional link settings
   * @returns Shared link URL
   */
  createSharedLink(
    path: string,
    settings?: SharedLinkSettings,
  ): Promise<string>;

  /**
   * Get file metadata
   * @param path - File path
   * @returns File metadata
   */
  getFileMetadata(path: string): Promise<DropboxFileMetadata>;

  /**
   * Check if path exists
   * @param path - Path to check
   * @returns True if exists, false otherwise
   */
  pathExists(path: string): Promise<boolean>;

  /**
   * Get account space usage
   * @returns Used and allocated space in bytes
   */
  getSpaceUsage(): Promise<{ used: number; allocated: number }>;
}

/**
 * Dropbox service implementation for file storage operations.
 * Handles all interactions with Dropbox API including file uploads,
 * downloads, folder management, and link generation.
 *
 * @example
 * ```typescript
 * const dropboxService = new DropboxService({
 *   accessToken: 'your-access-token'
 * });
 *
 * // Create project folder structure
 * const projectPath = await dropboxService.createProjectFolder('PROJ-001');
 *
 * // Upload file with progress tracking
 * const metadata = await dropboxService.uploadFile(
 *   `${projectPath}/Plans/design.pdf`,
 *   fileBuffer,
 *   (progress) => console.log(`Upload: ${progress.percentage}%`)
 * );
 *
 * // Generate temporary download link
 * const link = await dropboxService.getTemporaryLink(metadata.path);
 * ```
 */
export class DropboxService implements IDropboxService {
  /** Dropbox access token */
  private accessToken: string;

  /** Dropbox refresh token */
  private refreshToken: string | null = null;

  /**
   * Create Dropbox service instance
   * @param config - Dropbox configuration
   */
  public constructor(config: DropboxConfig) {
    this.accessToken = config.accessToken;
    this.refreshToken = config.refreshToken || null;
  }

  /**
   * Update access token (e.g., after refresh)
   * @param token - New access token
   */
  public setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Create complete project folder structure
   * @param projectCode - Project code for folder name
   * @returns Project folder path
   */
  public async createProjectFolder(projectCode: string): Promise<string> {
    const projectPath = this.getProjectFolderPath(projectCode);

    // Create main project folder
    await this.createFolder(projectPath);

    // Create all section folders
    for (const section of PROJECT_SECTIONS) {
      await this.createFolder(`${projectPath}/${section}`);
    }

    return projectPath;
  }

  /**
   * Create a single folder
   * @param path - Folder path to create
   * @returns Folder metadata
   */
  public async createFolder(path: string): Promise<DropboxFolderMetadata> {
    const normalizedPath = this.normalizePath(path);

    const result = await this.withRetry(() =>
      this.apiRequest<{ metadata: { id: string; name: string; path_display: string } }>(
        '/files/create_folder_v2',
        {
          path: normalizedPath,
          autorename: false,
        },
      ),
    );

    return {
      id: result.metadata.id,
      name: result.metadata.name,
      path: result.metadata.path_display,
    };
  }

  /**
   * Delete folder and all contents
   * @param path - Folder path to delete
   */
  public async deleteFolder(path: string): Promise<void> {
    await this.deleteFile(path); // Same endpoint for both
  }

  /**
   * List folder contents
   * @param path - Folder path to list
   * @returns Array of file/folder metadata
   */
  public async listFolder(path: string): Promise<DropboxFileMetadata[]> {
    const normalizedPath = this.normalizePath(path);

    const result = await this.withRetry(() =>
      this.apiRequest<{ entries: unknown[] }>(
        '/files/list_folder',
        {
          path: normalizedPath,
          recursive: false,
          include_deleted: false,
        },
      ),
    );

    return result.entries.map((entry) => this.mapToFileMetadata(entry));
  }

  /**
   * Upload file to Dropbox
   * @param path - Destination file path
   * @param content - File content as ArrayBuffer or Blob
   * @param onProgress - Optional progress callback
   * @returns File metadata
   */
  public async uploadFile(
    path: string,
    content: ArrayBuffer | Blob,
    onProgress?: UploadProgressCallback,
  ): Promise<DropboxFileMetadata> {
    const normalizedPath = this.normalizePath(path);
    const size = content instanceof Blob ? content.size : content.byteLength;

    // Convert Blob to ArrayBuffer if needed
    const buffer =
      content instanceof Blob ? await content.arrayBuffer() : content;

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
      }),
    );

    if (onProgress) {
      onProgress({ loaded: size, total: size, percentage: 100 });
    }

    return this.mapToFileMetadata(result);
  }

  /**
   * Upload large file using chunked upload session
   * @param path - Destination file path
   * @param content - File content as ArrayBuffer
   * @param onProgress - Optional progress callback
   * @returns File metadata
   */
  private async uploadLargeFile(
    path: string,
    content: ArrayBuffer,
    onProgress?: UploadProgressCallback,
  ): Promise<DropboxFileMetadata> {
    const totalSize = content.byteLength;
    let offset = 0;

    // Start upload session
    const startResponse = await this.apiRequest<{ session_id: string }>(
      '/files/upload_session/start',
      {},
      true,
    );
    const sessionId = startResponse.session_id;

    // Upload chunks
    while (offset < totalSize) {
      const chunkSize = Math.min(CHUNK_SIZE, totalSize - offset);
      const chunk = content.slice(offset, offset + chunkSize);
      const isLastChunk = offset + chunkSize >= totalSize;

      if (isLastChunk) {
        // Finish upload session
        const result = await this.contentUpload(
          '/files/upload_session/finish',
          chunk,
          {
            cursor: { session_id: sessionId, offset },
            commit: {
              path,
              mode: 'overwrite',
              autorename: false,
              mute: false,
            },
          },
        );

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

  /**
   * Download file from Dropbox
   * @param path - File path to download
   * @param onProgress - Optional progress callback
   * @returns File content as ArrayBuffer
   */
  public async downloadFile(
    path: string,
    onProgress?: DownloadProgressCallback,
  ): Promise<ArrayBuffer> {
    const normalizedPath = this.normalizePath(path);

    return this.withRetry(() =>
      this.contentDownload(
        '/files/download',
        { path: normalizedPath },
        onProgress,
      ),
    );
  }

  /**
   * Delete file
   * @param path - File path to delete
   */
  public async deleteFile(path: string): Promise<void> {
    const normalizedPath = this.normalizePath(path);

    await this.withRetry(() =>
      this.apiRequest('/files/delete_v2', {
        path: normalizedPath,
      }),
    );
  }

  /**
   * Move file to new location
   * @param fromPath - Source file path
   * @param toPath - Destination file path
   * @returns File metadata
   */
  public async moveFile(
    fromPath: string,
    toPath: string,
  ): Promise<DropboxFileMetadata> {
    const normalizedFrom = this.normalizePath(fromPath);
    const normalizedTo = this.normalizePath(toPath);

    const result = await this.withRetry(() =>
      this.apiRequest<{ metadata: unknown }>(
        '/files/move_v2',
        {
          from_path: normalizedFrom,
          to_path: normalizedTo,
          autorename: false,
        },
      ),
    );

    return this.mapToFileMetadata(result.metadata);
  }

  /**
   * Copy file to new location
   * @param fromPath - Source file path
   * @param toPath - Destination file path
   * @returns File metadata
   */
  public async copyFile(
    fromPath: string,
    toPath: string,
  ): Promise<DropboxFileMetadata> {
    const normalizedFrom = this.normalizePath(fromPath);
    const normalizedTo = this.normalizePath(toPath);

    const result = await this.withRetry(() =>
      this.apiRequest<{ metadata: unknown }>(
        '/files/copy_v2',
        {
          from_path: normalizedFrom,
          to_path: normalizedTo,
          autorename: false,
        },
      ),
    );

    return this.mapToFileMetadata(result.metadata);
  }

  /**
   * Get temporary download link (valid for 4 hours)
   * @param path - File path
   * @returns Temporary link response
   */
  public async getTemporaryLink(
    path: string,
  ): Promise<TemporaryLinkResponse> {
    const normalizedPath = this.normalizePath(path);

    const result = await this.withRetry(() =>
      this.apiRequest<{ link: string; metadata: unknown }>(
        '/files/get_temporary_link',
        { path: normalizedPath },
      ),
    );

    return {
      link: result.link,
      metadata: this.mapToFileMetadata(result.metadata),
      expiresAt: new Date(
        Date.now() + LINK_EXPIRY_HOURS * 60 * 60 * 1000,
      ),
    };
  }

  /**
   * Create shared link with settings
   * @param path - File path
   * @param settings - Optional link settings
   * @returns Shared link URL
   */
  public async createSharedLink(
    path: string,
    settings?: SharedLinkSettings,
  ): Promise<string> {
    const normalizedPath = this.normalizePath(path);

    const result = await this.withRetry(() =>
      this.apiRequest<{ url: string }>(
        '/sharing/create_shared_link_with_settings',
        {
          path: normalizedPath,
          settings: settings || {},
        },
      ),
    );

    return result.url;
  }

  /**
   * Get existing shared link or create new one
   * @param path - File path
   * @returns Shared link URL
   */
  public async getOrCreateSharedLink(path: string): Promise<string> {
    try {
      return await this.createSharedLink(path);
    } catch (error) {
      // If link already exists, list and return it
      const normalizedPath = this.normalizePath(path);
      const result = await this.apiRequest<{ links: Array<{ url: string }> }>(
        '/sharing/list_shared_links',
        { path: normalizedPath },
      );

      if (result.links.length > 0) {
        return result.links[0].url;
      }

      throw error;
    }
  }

  /**
   * Get file metadata
   * @param path - File path
   * @returns File metadata
   */
  public async getFileMetadata(path: string): Promise<DropboxFileMetadata> {
    const normalizedPath = this.normalizePath(path);

    const result = await this.withRetry(() =>
      this.apiRequest<unknown>(
        '/files/get_metadata',
        {
          path: normalizedPath,
          include_deleted: false,
        },
      ),
    );

    return this.mapToFileMetadata(result);
  }

  /**
   * Check if path exists
   * @param path - Path to check
   * @returns True if exists, false otherwise
   */
  public async pathExists(path: string): Promise<boolean> {
    try {
      await this.getFileMetadata(path);
      return true;
    } catch (error) {
      if (error instanceof DropboxPathNotFoundError) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get account space usage
   * @returns Used and allocated space in bytes
   */
  public async getSpaceUsage(): Promise<{ used: number; allocated: number }> {
    const result = await this.withRetry(() =>
      this.apiRequest<{ used: number; allocation: { allocated: number } }>(
        '/users/get_space_usage',
        null,
      ),
    );

    return {
      used: result.used,
      allocated: result.allocation.allocated,
    };
  }

  /**
   * Make API request to Dropbox
   * @param endpoint - API endpoint
   * @param data - Request data
   * @param isContentRequest - Whether this is a content endpoint
   * @returns Response data
   */
  private async apiRequest<T>(
    endpoint: string,
    data: unknown,
    isContentRequest = false,
  ): Promise<T> {
    const baseUrl = isContentRequest ? DROPBOX_CONTENT_URL : DROPBOX_API_URL;

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: data !== null ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        this.handleError({ status: response.status, ...errorData });
      }

      return (await response.json()) as T;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Make content upload request
   * @param endpoint - API endpoint
   * @param content - Content to upload
   * @param args - Request arguments
   * @returns Response data
   */
  private async contentUpload<T>(
    endpoint: string,
    content: ArrayBuffer | Blob,
    args: unknown,
  ): Promise<T> {
    try {
      const response = await fetch(`${DROPBOX_CONTENT_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/octet-stream',
          'Dropbox-API-Arg': JSON.stringify(args),
        },
        body: content,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        this.handleError({ status: response.status, ...errorData });
      }

      return (await response.json()) as T;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Make content download request
   * @param endpoint - API endpoint
   * @param args - Request arguments
   * @param onProgress - Optional progress callback
   * @returns Downloaded content
   */
  private async contentDownload(
    endpoint: string,
    args: unknown,
    onProgress?: DownloadProgressCallback,
  ): Promise<ArrayBuffer> {
    try {
      const response = await fetch(`${DROPBOX_CONTENT_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Dropbox-API-Arg': JSON.stringify(args),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        this.handleError({ status: response.status, ...errorData });
      }

      const contentLength = parseInt(
        response.headers.get('Content-Length') || '0',
        10,
      );

      if (onProgress && contentLength > 0 && response.body) {
        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let loaded = 0;

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          chunks.push(value);
          loaded += value.length;

          const percentage = Math.round((loaded / contentLength) * 100);
          onProgress({ loaded, total: contentLength, percentage });
        }

        // Combine chunks
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          result.set(chunk, offset);
          offset += chunk.length;
        }

        return result.buffer;
      }

      return await response.arrayBuffer();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Handle Dropbox API error
   * @param error - Error object
   */
  private handleError(error: unknown): never {
    const err = error as Record<string, unknown>;

    // Rate limit error
    if (err.status === 429) {
      const retryAfter = (err.retry_after as number) || 60;
      throw new DropboxRateLimitError(retryAfter);
    }

    // Path errors
    if (err.error && typeof err.error === 'object') {
      const errorObj = err.error as Record<string, unknown>;
      const errorTag = errorObj['.tag'] as string;

      switch (errorTag) {
        case 'path': {
          const pathError = errorObj.path as Record<string, unknown>;
          const pathTag = pathError?.['.tag'] as string;

          if (pathTag === 'not_found') {
            throw new DropboxPathNotFoundError(err.error_summary as string);
          }
          if (pathTag === 'conflict') {
            throw new DropboxPathConflictError(err.error_summary as string);
          }
          break;
        }

        case 'insufficient_space':
          throw new DropboxInsufficientSpaceError();
      }
    }

    throw new DropboxApiError(
      (err.error_summary as string) || 'Unknown Dropbox error',
      (err.status as number) || 500,
    );
  }

  /**
   * Retry request with exponential backoff
   * @param operation - Operation to retry
   * @param maxAttempts - Maximum retry attempts
   * @returns Operation result
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    maxAttempts = MAX_RETRY_ATTEMPTS,
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
        if (
          error instanceof DropboxApiError &&
          error.status >= 400 &&
          error.status < 500
        ) {
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

  /**
   * Delay execution
   * @param ms - Milliseconds to delay
   * @returns Promise that resolves after delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Normalize path (ensure leading slash, no trailing slash)
   * @param path - Path to normalize
   * @returns Normalized path
   */
  private normalizePath(path: string): string {
    let normalized = path.trim();

    // Add leading slash if missing
    if (!normalized.startsWith('/')) {
      normalized = `/${normalized}`;
    }

    // Remove trailing slash
    if (normalized.endsWith('/') && normalized !== '/') {
      normalized = normalized.slice(0, -1);
    }

    return normalized;
  }

  /**
   * Map Dropbox API response to internal metadata type
   * @param entry - Dropbox API entry
   * @returns File metadata
   */
  private mapToFileMetadata(entry: unknown): DropboxFileMetadata {
    const e = entry as Record<string, unknown>;

    return {
      id: e.id as string,
      name: e.name as string,
      path: e.path_display as string,
      size: (e.size as number) || 0,
      isFolder: e['.tag'] === 'folder',
      modifiedAt: new Date(e.server_modified as string),
      contentHash: e.content_hash as string | undefined,
    };
  }

  /**
   * Get project folder path
   * @param projectCode - Project code
   * @returns Project folder path
   */
  public getProjectFolderPath(projectCode: string): string {
    return `${ROOT_FOLDER}/${projectCode}`;
  }

  /**
   * Get section folder path within a project
   * @param projectCode - Project code
   * @param section - Section name
   * @returns Section folder path
   */
  public getSectionPath(projectCode: string, section: string): string {
    return `${ROOT_FOLDER}/${projectCode}/${section}`;
  }

  /**
   * Get task attachments folder path
   * @param projectCode - Project code
   * @param taskId - Task ID
   * @returns Task folder path
   */
  public getTaskFolderPath(projectCode: string, taskId: string): string {
    return `${ROOT_FOLDER}/${projectCode}/Tasks/Task_${taskId}`;
  }
}
