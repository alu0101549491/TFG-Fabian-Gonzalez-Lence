/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 24, 2026
 * @file backend/src/infrastructure/external-services/dropbox.service.ts
 * @desc Dropbox API integration for file storage operations (Backend)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://www.dropbox.com/developers/documentation/http/documentation}
 */

import {Dropbox} from 'dropbox';
import type {files} from 'dropbox';
import {logDebug, logError, logInfo, logWarning} from '../../shared/logger.js';

/**
 * Root folder path for all projects in Dropbox
 */
const ROOT_FOLDER = '/CartographicProjects';

/**
 * Maximum file size for simple upload (150MB)
 */
const MAX_SIMPLE_UPLOAD_SIZE = 150 * 1024 * 1024;

/**
 * Project folder sections that are auto-created
 */
const PROJECT_SECTIONS = [
  'ReportAndAnnexes',
  'Plans',
  'Specifications',
  'Budget',
  'Tasks',
] as const;

/**
 * Dropbox service configuration
 */
export interface DropboxConfig {
  /** Dropbox access token for authentication */
  accessToken: string;
  /** Dropbox refresh token for automatic token renewal (optional) */
  refreshToken?: string;
  /** Dropbox app key (required if using refresh token) */
  appKey?: string;
  /** Dropbox app secret (required if using refresh token) */
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
 * Interface for Dropbox operations
 */
export interface IDropboxService {
  /**
   * Create complete project folder structure
   * @param projectCode - Project code for folder name
   * @returns Project folder path
   */
  createProjectFolder(projectCode: string): Promise<string>;

  /**
   * Upload file to Dropbox
   * @param path - Destination file path
   * @param content - File content as Buffer
   * @returns File metadata
   */
  uploadFile(path: string, content: Buffer): Promise<DropboxFileMetadata>;

  /**
   * Download file from Dropbox
   * @param path - File path to download
   * @returns File content as Buffer
   */
  downloadFile(path: string): Promise<Buffer>;

  /**
   * Delete file
   * @param path - File path to delete
   */
  deleteFile(path: string): Promise<void>;

  /**
   * Get temporary download link (valid for 4 hours)
   * @param path - File path
   * @returns Temporary link response
   */
  getTemporaryLink(path: string): Promise<TemporaryLinkResponse>;

  /**
   * Get preview link (shared link for viewing in browser)
   * @param path - File path
   * @returns Preview link URL
   */
  getPreviewLink(path: string): Promise<string>;

  /**
   * Check if path exists
   * @param path - Path to check
   * @returns True if exists, false otherwise
   */
  pathExists(path: string): Promise<boolean>;

  /**
   * Get project folder path
   * @param projectCode - Project code
   * @returns Project folder path
   */
  getProjectFolderPath(projectCode: string): string;

  /**
   * Get section folder path within a project
   * @param projectCode - Project code
   * @param section - Section name
   * @returns Section folder path
   */
  getSectionPath(projectCode: string, section: string): string;

  /**
   * List all files in a folder recursively
   * @param path - Folder path to list
   * @returns Array of file metadata
   */
  listFiles(path: string): Promise<DropboxFileMetadata[]>;

  /**
   * Delete a folder and all its contents
   * @param path - Folder path to delete
   */
  deleteFolder(path: string): Promise<void>;
}

/**
 * Dropbox service implementation for file storage operations.
 * Uses official Dropbox SDK for Node.js.
 *
 * @example
 * ```typescript
 * const dropboxService = new DropboxService({
 *   accessToken: process.env.DROPBOX_ACCESS_TOKEN
 * });
 *
 * // Create project folder structure
 * const projectPath = await dropboxService.createProjectFolder('PROJ-001');
 *
 * // Upload file
 * const metadata = await dropboxService.uploadFile(
 *   `${projectPath}/Plans/design.pdf`,
 *   fileBuffer
 * );
 * ```
 */
export class DropboxService implements IDropboxService {
  /** Dropbox client instance */
  private client: Dropbox;

  /** Upload timeout in milliseconds (5 minutes) */
  private readonly UPLOAD_TIMEOUT = 5 * 60 * 1000;

  /** Current access token */
  private accessToken: string;

  /** Refresh token for automatic renewal */
  private readonly refreshToken?: string;

  /** App key for OAuth */
  private readonly appKey?: string;

  /** App secret for OAuth */
  private readonly appSecret?: string;

  /** Flag to prevent concurrent token refreshes */
  private isRefreshing = false;

  /** Promise for ongoing refresh operation */
  private refreshPromise: Promise<void> | null = null;

  /**
   * Create Dropbox service instance
   * @param config - Dropbox configuration
   */
  public constructor(config: DropboxConfig) {
    this.accessToken = config.accessToken;
    this.refreshToken = config.refreshToken;
    this.appKey = config.appKey;
    this.appSecret = config.appSecret;

    this.client = new Dropbox({
      accessToken: this.accessToken,
      fetch: this.createFetchWithTimeout(),
    });
  }

  /**
   * Create custom fetch function with timeout configuration
   * @returns Fetch function with timeout support
   * @private
   */
  private createFetchWithTimeout() {
    return async (url: string | URL, init?: RequestInit) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.UPLOAD_TIMEOUT);

      try {
        const response = await fetch(url, {
          ...init,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };
  }

  /**
   * Refresh the access token using the refresh token
   * @throws Error if refresh token is not configured or refresh fails
   * @private
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken || !this.appKey || !this.appSecret) {
      throw new Error(
        'Cannot refresh token: refresh token, app key, or app secret not configured'
      );
    }

    // If already refreshing, wait for that operation to complete
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;

    this.refreshPromise = (async () => {
      try {
        logInfo('Refreshing Dropbox access token');

        const params = new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken!,
          client_id: this.appKey!,
          client_secret: this.appSecret!,
        });

        const response = await fetch('https://api.dropbox.com/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Failed to refresh token: ${response.status} - ${JSON.stringify(errorData)}`
          );
        }

        const data = (await response.json()) as {
          access_token: string;
          expires_in?: number;
        };
        this.accessToken = data.access_token;

        // Update Dropbox client with new token
        this.client = new Dropbox({
          accessToken: this.accessToken,
          fetch: this.createFetchWithTimeout(),
        });

        logInfo('Dropbox access token refreshed successfully');
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Execute a Dropbox API operation with automatic retry on 401 (expired token)
   * @param operation - Function that performs the Dropbox API call
   * @returns Result of the operation
   * @private
   */
  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      // Check if error is 401 (expired token)
      const is401Error =
        error?.status === 401 ||
        error?.error?.error?.['.tag'] === 'expired_access_token';

      if (is401Error && this.refreshToken) {
        logWarning('Dropbox access token expired; attempting refresh');

        // Refresh the token
        await this.refreshAccessToken();

        // Retry the operation with the new token
        logInfo('Retrying Dropbox operation with refreshed token');
        return await operation();
      }

      // If not a 401 or no refresh token, rethrow the error
      throw error;
    }
  }

  /**
   * Create complete project folder structure
   * @param projectCode - Project code for folder name
   * @returns Project folder path
   */
  public async createProjectFolder(projectCode: string): Promise<string> {
    // Ensure root folder exists first
    try {
      await this.createFolder(ROOT_FOLDER);
      logDebug('Root folder ensured in Dropbox', {path: ROOT_FOLDER});
    } catch (error) {
      // Root folder might already exist, continue
      logDebug('Root folder creation result (may already exist)', {
        path: ROOT_FOLDER,
        error: error instanceof Error ? error.message : String(error),
      });
    }

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
   * @returns Folder path
   */
  private async createFolder(path: string): Promise<string> {
    try {
      await this.client.filesCreateFolderV2({
        path,
        autorename: false,
      });
      return path;
    } catch (error: unknown) {
      const err = error as {
        error?: {
          error?: {
            '.tag'?: string;
            path?: {
              '.tag'?: string;
              conflict?: {
                '.tag'?: string;
              };
            };
          };
        };
      };

      const createFolderTag = err.error?.error?.['.tag'];
      const writeErrorTag = err.error?.error?.path?.['.tag'];
      const conflictTag = err.error?.error?.path?.conflict?.['.tag'];

      // Ignore only explicit conflict/exists cases (folder already exists)
      if (
        createFolderTag === 'path' &&
        writeErrorTag === 'conflict' &&
        (conflictTag === 'folder' || conflictTag === undefined)
      ) {
        return path;
      }

      throw error;
    }
  }

  /**
   * Upload file to Dropbox
   * @param path - Destination file path
   * @param content - File content as Buffer
   * @returns File metadata
   */
  public async uploadFile(
    path: string,
    content: Buffer,
  ): Promise<DropboxFileMetadata> {
    return this.executeWithRetry(async () => {
      const size = content.length;

      // Use simple upload for smaller files
      if (size <= MAX_SIMPLE_UPLOAD_SIZE) {
        const response = await this.client.filesUpload({
          path,
          contents: content,
          mode: {'.tag': 'overwrite'},
          autorename: false,
          mute: false,
        });

        return this.mapToFileMetadata(response.result);
      }

      // Use upload session for large files
      return this.uploadLargeFile(path, content);
    });
  }

  /**
   * Ensure a folder exists in Dropbox.
   *
   * This is useful for server-side maintenance tasks (e.g., backup sync)
   * that need to create a dedicated storage folder.
   *
   * @param path - Folder path to ensure
   * @returns Folder path
   */
  public async ensureFolder(path: string): Promise<string> {
    return this.createFolder(path);
  }

  /**
   * Upload large file using chunked upload session
   * @param path - Destination file path
   * @param content - File content as Buffer
   * @returns File metadata
   */
  private async uploadLargeFile(
    path: string,
    content: Buffer,
  ): Promise<DropboxFileMetadata> {
    const CHUNK_SIZE = 8 * 1024 * 1024; // 8MB chunks
    const totalSize = content.length;
    let offset = 0;

    // Start upload session
    const startResponse = await this.client.filesUploadSessionStart({
      contents: Buffer.alloc(0),
      close: false,
    });
    const sessionId = startResponse.result.session_id;

    // Upload chunks
    while (offset < totalSize) {
      const chunkSize = Math.min(CHUNK_SIZE, totalSize - offset);
      const chunk = content.slice(offset, offset + chunkSize);
      const isLastChunk = offset + chunkSize >= totalSize;

      if (isLastChunk) {
        // Finish upload session
        const finishResponse = await this.client.filesUploadSessionFinish({
          cursor: {
            session_id: sessionId,
            offset,
          },
          commit: {
            path,
            mode: {'.tag': 'overwrite'},
            autorename: false,
            mute: false,
          },
          contents: chunk,
        });

        return this.mapToFileMetadata(finishResponse.result);
      } else {
        // Append chunk
        await this.client.filesUploadSessionAppendV2({
          cursor: {
            session_id: sessionId,
            offset,
          },
          close: false,
          contents: chunk,
        });

        offset += chunkSize;
      }
    }

    throw new Error('Upload failed: unexpected end of loop');
  }

  /**
   * Download file from Dropbox
   * @param path - File path to download
   * @returns File content as Buffer
   */
  public async downloadFile(path: string): Promise<Buffer> {
    return this.executeWithRetry(async () => {
      const response = await this.client.filesDownload({path});
      const fileBlob = (response.result as files.FileMetadata & {fileBinary?: Buffer}).fileBinary;

      if (!fileBlob) {
        throw new Error('Failed to download file: no content received');
      }

      return fileBlob;
    });
  }

  /**
   * Delete file or folder
   * @param path - File/folder path to delete
   */
  public async deleteFile(path: string): Promise<void> {
    return this.executeWithRetry(async () => {
      await this.client.filesDeleteV2({path});
    });
  }

  /**
   * Get temporary download link (valid for 4 hours)
   * @param path - File path
   * @returns Temporary link response
   */
  public async getTemporaryLink(path: string): Promise<TemporaryLinkResponse> {
    return this.executeWithRetry(async () => {
      const response = await this.client.filesGetTemporaryLink({path});

      return {
        link: response.result.link,
        metadata: this.mapToFileMetadata(response.result.metadata),
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
      };
    });
  }

  /**
   * Get preview link (shared link) for viewing file in browser
   * Creates a shared link that opens the Dropbox web viewer instead of forcing download
   * Wrapped in executeWithRetry to handle token expiration
   * @param path - Dropbox path
   * @returns Preview URL
   */
  public async getPreviewLink(path: string): Promise<string> {
    return this.executeWithRetry(async () => {
      try {
        // Try to get existing shared links first
        const existingLinks = await this.client.sharingListSharedLinks({
          path,
          direct_only: true,
        });

        if (existingLinks.result.links && existingLinks.result.links.length > 0) {
          // Return existing shared link (replace dl=0 with raw=1 for direct preview)
          return existingLinks.result.links[0].url.replace('dl=0', 'raw=1');
        }
      } catch (error) {
        // No existing links found, continue to create new one
        logWarning('Unable to list existing Dropbox shared links; creating a new one', {
          path,
          error: error instanceof Error ? error.message : String(error),
        });
      }

      // Create new shared link
      const response = await this.client.sharingCreateSharedLinkWithSettings({
        path,
        settings: {
          requested_visibility: {'.tag': 'public'},
        },
      });

      // Return the preview URL (raw=1 for direct viewing)
      return response.result.url.replace('dl=0', 'raw=1');
    });
  }

  /**
   * Check if path exists
   * @param path - Path to check
   * @returns True if exists, false otherwise
   */
  public async pathExists(path: string): Promise<boolean> {
    return this.executeWithRetry(async () => {
      try {
        await this.client.filesGetMetadata({path});
        return true;
      } catch (error: unknown) {
        const err = error as {
          error?: {
            error?: {
              '.tag'?: string;
              path?: {
                '.tag'?: string;
              };
            };
          };
        };

        const getMetadataTag = err.error?.error?.['.tag'];
        const lookupErrorTag = err.error?.error?.path?.['.tag'];
        if (getMetadataTag === 'path' && lookupErrorTag === 'not_found') {
          return false;
        }

        const normalizedError =
          error instanceof Error ? error : new Error(String(error));
        logError('Unexpected Dropbox error while checking path existence', normalizedError, {
          path,
          getMetadataTag,
          lookupErrorTag,
        });
        throw error;
      }
    });
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
   * Map Dropbox API response to internal metadata type
   * @param entry - Dropbox API entry
   * @returns File metadata
   */
  private mapToFileMetadata(
    entry: files.FileMetadataReference | files.FileMetadata,
  ): DropboxFileMetadata {
    const fileEntry = entry as files.FileMetadata & {'.tag'?: string};
    const isFolder = fileEntry['.tag'] === 'folder';

    return {
      id: fileEntry.id || '',
      name: fileEntry.name,
      path: fileEntry.path_display || fileEntry.path_lower || '',
      size: fileEntry.size || 0,
      isFolder,
      modifiedAt: fileEntry.server_modified
        ? new Date(fileEntry.server_modified)
        : new Date(),
      contentHash: fileEntry.content_hash,
    };
  }

  /**
   * List all files in a folder recursively
   * @param path - Folder path to list
   * @returns Array of file metadata
   */
  public async listFiles(path: string): Promise<DropboxFileMetadata[]> {
    return this.executeWithRetry(async () => {
      const allFiles: DropboxFileMetadata[] = [];
      let hasMore = true;
      let cursor: string | undefined;

      while (hasMore) {
        const response = cursor
          ? await this.client.filesListFolderContinue({cursor})
          : await this.client.filesListFolder({
              path,
              recursive: true,
              include_deleted: false,
            });

        // Filter out folders, only include files
        const files = response.result.entries
          .filter((entry) => entry['.tag'] === 'file')
          .map((entry) => this.mapToFileMetadata(entry as files.FileMetadata));

        allFiles.push(...files);
        hasMore = response.result.has_more;
        cursor = response.result.cursor;
      }

      return allFiles;
    });
  }

  /**
   * Delete a folder and all its contents
   * @param path - Folder path to delete
   */
  public async deleteFolder(path: string): Promise<void> {
    return this.executeWithRetry(async () => {
      try {
        await this.client.filesDeleteV2({path});
        logInfo('Dropbox folder deleted successfully', {path});
      } catch (error: unknown) {
        const err = error as {
          error?: {
            error?: {
              '.tag'?: string;
              path_lookup?: {
                '.tag'?: string;
              };
            };
          };
        };

        const deleteErrorTag = err.error?.error?.['.tag'];
        const lookupErrorTag = err.error?.error?.path_lookup?.['.tag'];

        // Ignore error if folder doesn't exist (already deleted)
        if (deleteErrorTag === 'path_lookup' && lookupErrorTag === 'not_found') {
          logWarning('Dropbox folder not found during deletion (already deleted)', {path});
          return;
        }

        const normalizedError =
          error instanceof Error ? error : new Error(String(error));
        logError('Failed to delete Dropbox folder', normalizedError, {path});
        throw error;
      }
    });
  }
}
