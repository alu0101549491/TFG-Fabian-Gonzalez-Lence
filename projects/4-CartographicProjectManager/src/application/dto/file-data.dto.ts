/**
 * @module application/dto/file-data
 * @description Data Transfer Objects for file operations.
 * @category Application
 */

import {FileType} from '../../domain/enumerations/file-type';

/**
 * Project sections for file organization in Dropbox.
 */
export enum ProjectSection {
  /** Reports and supporting annexes */
  REPORT_AND_ANNEXES = 'Report and Annexes',
  /** Technical plans and drawings */
  PLANS = 'Plans',
  /** Project specifications */
  SPECIFICATIONS = 'Specifications',
  /** Budget and cost estimates */
  BUDGET = 'Budget',
}

/**
 * File error codes for programmatic error handling.
 */
export enum FileErrorCode {
  /** File exceeds maximum allowed size (50MB) */
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  /** File format is not supported */
  INVALID_FORMAT = 'INVALID_FORMAT',
  /** Upload operation failed */
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  /** Dropbox API error occurred */
  DROPBOX_ERROR = 'DROPBOX_ERROR',
  /** User doesn't have permission to upload/download */
  PERMISSION_DENIED = 'PERMISSION_DENIED',
}

/**
 * Input DTO for uploading a file.
 */
export interface UploadFileDto {
  /** Original filename with extension */
  readonly name: string;
  /** File content (max 50MB) */
  readonly content: ArrayBuffer | Blob;
  /** MIME type of the file */
  readonly mimeType: string;
  /** Parent project ID (required) */
  readonly projectId: string;
  /** Associated task ID (optional) */
  readonly taskId?: string;
  /** Associated message ID (optional) */
  readonly messageId?: string;
  /** Target section for project files (optional) */
  readonly section?: ProjectSection;
}

/**
 * File upload operation result.
 */
export interface FileUploadResultDto {
  /** Whether upload was successful */
  readonly success: boolean;
  /** Uploaded file information (if successful) */
  readonly file: FileDto | null;
  /** Error message (if failed) */
  readonly error: string | null;
  /** Programmatic error code (if failed) */
  readonly errorCode: FileErrorCode | null;
}

/**
 * Complete file information.
 */
export interface FileDto {
  /** Unique file identifier */
  readonly id: string;
  /** Original filename */
  readonly name: string;
  /** Dropbox file path */
  readonly dropboxPath: string;
  /** File type classification */
  readonly type: FileType;
  /** MIME type */
  readonly mimeType: string;
  /** File size in bytes */
  readonly sizeInBytes: number;
  /** Human-readable file size (e.g., "2.5 MB") */
  readonly humanReadableSize: string;
  /** User ID who uploaded the file */
  readonly uploadedBy: string;
  /** Username of uploader (denormalized) */
  readonly uploaderName: string;
  /** Upload timestamp */
  readonly uploadedAt: Date;
  /** Parent project ID */
  readonly projectId: string;
  /** Associated task ID (if attached to task) */
  readonly taskId: string | null;
  /** Associated message ID (if attached to message) */
  readonly messageId: string | null;
  /** Project section (if organized) */
  readonly section: ProjectSection | null;
  /** Dropbox download URL */
  readonly downloadUrl: string;
  /** Preview URL for images (if applicable) */
  readonly previewUrl: string | null;
  /** Whether file is an image */
  readonly isImage: boolean;
  /** Whether file is a document (PDF, Word, etc.) */
  readonly isDocument: boolean;
  /** Whether file is cartographic data (DWG, SHP, etc.) */
  readonly isCartographic: boolean;
}

/**
 * File summary for lists and references.
 */
export interface FileSummaryDto {
  /** Unique file identifier */
  readonly id: string;
  /** Original filename */
  readonly name: string;
  /** File type classification */
  readonly type: FileType;
  /** File size in bytes */
  readonly sizeInBytes: number;
  /** Human-readable file size */
  readonly humanReadableSize: string;
  /** User ID who uploaded the file */
  readonly uploadedBy: string;
  /** Username of uploader */
  readonly uploaderName: string;
  /** Upload timestamp */
  readonly uploadedAt: Date;
  /** Download URL */
  readonly downloadUrl: string;
}

/**
 * Batch file upload request.
 */
export interface BatchUploadDto {
  /** Array of files to upload */
  readonly files: UploadFileDto[];
  /** Parent project ID */
  readonly projectId: string;
  /** Associated task ID (optional) */
  readonly taskId?: string;
  /** Associated message ID (optional) */
  readonly messageId?: string;
}

/**
 * Batch file upload result.
 */
export interface BatchUploadResultDto {
  /** Number of successful uploads */
  readonly successCount: number;
  /** Number of failed uploads */
  readonly failureCount: number;
  /** Individual upload results */
  readonly results: FileUploadResultDto[];
}

/**
 * File download request.
 */
export interface DownloadFileDto {
  /** ID of the file to download */
  readonly fileId: string;
}

/**
 * File download result.
 */
export interface FileDownloadResultDto {
  /** Whether download was successful */
  readonly success: boolean;
  /** File content (if successful) */
  readonly content: ArrayBuffer | null;
  /** Filename for saving */
  readonly filename: string | null;
  /** MIME type for content-type header */
  readonly mimeType: string | null;
  /** Error message (if failed) */
  readonly error: string | null;
}

/**
 * File list filter options.
 */
export interface FileFilterDto {
  /** Filter by project ID */
  readonly projectId?: string;
  /** Filter by task ID */
  readonly taskId?: string;
  /** Filter by message ID */
  readonly messageId?: string;
  /** Filter by file type */
  readonly type?: FileType;
  /** Filter by project section */
  readonly section?: ProjectSection;
  /** Filter by uploader user ID */
  readonly uploadedBy?: string;
  /** Sort field */
  readonly sortBy?: 'name' | 'uploadedAt' | 'size';
  /** Sort order */
  readonly sortOrder?: 'asc' | 'desc';
}
