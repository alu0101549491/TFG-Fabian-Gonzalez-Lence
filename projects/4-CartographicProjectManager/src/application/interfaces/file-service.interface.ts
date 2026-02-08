/**
 * @module application/interfaces/file-service
 * @description Service interface for file upload, download, and management through Dropbox integration.
 * @category Application
 */

import {
  type UploadFileDto,
  type BatchUploadDto,
  type FileUploadResultDto,
  type BatchUploadResultDto,
  type FileDownloadResultDto,
  type FileDto,
  type FileFilterDto,
  type ValidationResultDto,
  type ProjectSection,
} from '../dto';

/**
 * Service interface for file management operations.
 * Handles file upload, download, validation, and deletion via Dropbox,
 * with support for different project sections and file types.
 */
export interface IFileService {
  /**
   * Uploads a single file to the project's storage.
   * @param data - File upload data including file content and metadata
   * @param userId - The unique identifier of the user uploading the file
   * @returns Upload result with file metadata and storage location
   * @throws {ValidationError} If file validation fails
   * @throws {NotFoundError} If project doesn't exist
   * @throws {UnauthorizedError} If user doesn't have permission
   * @throws {StorageError} If upload to Dropbox fails
   */
  uploadFile(
    data: UploadFileDto,
    userId: string,
  ): Promise<FileUploadResultDto>;

  /**
   * Uploads multiple files to the project's storage in a batch.
   * @param data - Batch upload data containing multiple files
   * @param userId - The unique identifier of the user uploading the files
   * @returns Batch upload result with success/failure status for each file
   * @throws {ValidationError} If any file validation fails
   * @throws {NotFoundError} If project doesn't exist
   * @throws {UnauthorizedError} If user doesn't have permission
   */
  uploadMultipleFiles(
    data: BatchUploadDto,
    userId: string,
  ): Promise<BatchUploadResultDto>;

  /**
   * Downloads a file from storage.
   * @param fileId - The unique identifier of the file
   * @param userId - The unique identifier of the user requesting the download
   * @returns Download result with file stream and metadata
   * @throws {NotFoundError} If file doesn't exist
   * @throws {UnauthorizedError} If user doesn't have permission
   * @throws {StorageError} If download from Dropbox fails
   */
  downloadFile(
    fileId: string,
    userId: string,
  ): Promise<FileDownloadResultDto>;

  /**
   * Deletes a file from storage and removes its metadata.
   * @param fileId - The unique identifier of the file
   * @param userId - The unique identifier of the user performing the deletion
   * @returns Promise that resolves when file is deleted
   * @throws {NotFoundError} If file doesn't exist
   * @throws {UnauthorizedError} If user doesn't have permission
   * @throws {StorageError} If deletion from Dropbox fails
   */
  deleteFile(fileId: string, userId: string): Promise<void>;

  /**
   * Retrieves metadata for a specific file.
   * @param fileId - The unique identifier of the file
   * @param userId - The unique identifier of the requesting user
   * @returns File metadata and information
   * @throws {NotFoundError} If file doesn't exist
   * @throws {UnauthorizedError} If user doesn't have access
   */
  getFileById(fileId: string, userId: string): Promise<FileDto>;

  /**
   * Retrieves all files for a specific project with optional filtering.
   * @param projectId - The unique identifier of the project
   * @param userId - The unique identifier of the requesting user
   * @param filters - Optional filters for file list (section, type, date range)
   * @returns Array of file metadata
   * @throws {NotFoundError} If project doesn't exist
   * @throws {UnauthorizedError} If user doesn't have access
   */
  getFilesByProject(
    projectId: string,
    userId: string,
    filters?: FileFilterDto,
  ): Promise<FileDto[]>;

  /**
   * Retrieves all files in a specific section of a project.
   * @param projectId - The unique identifier of the project
   * @param section - The project section (e.g., DOCUMENTS, IMAGES, DELIVERABLES)
   * @param userId - The unique identifier of the requesting user
   * @returns Array of file metadata for the specified section
   * @throws {NotFoundError} If project doesn't exist
   * @throws {UnauthorizedError} If user doesn't have access
   */
  getFilesBySection(
    projectId: string,
    section: ProjectSection,
    userId: string,
  ): Promise<FileDto[]>;

  /**
   * Retrieves all files attached to a specific task.
   * @param taskId - The unique identifier of the task
   * @param userId - The unique identifier of the requesting user
   * @returns Array of file metadata attached to the task
   * @throws {NotFoundError} If task doesn't exist
   * @throws {UnauthorizedError} If user doesn't have access
   */
  getFilesByTask(taskId: string, userId: string): Promise<FileDto[]>;

  /**
   * Retrieves all files attached to a specific message.
   * @param messageId - The unique identifier of the message
   * @param userId - The unique identifier of the requesting user
   * @returns Array of file metadata attached to the message
   * @throws {NotFoundError} If message doesn't exist
   * @throws {UnauthorizedError} If user doesn't have access
   */
  getFilesByMessage(messageId: string, userId: string): Promise<FileDto[]>;

  /**
   * Validates a file before upload (format, size, etc.).
   * @param data - File data to validate
   * @returns Validation result with any errors or warnings
   */
  validateFile(data: UploadFileDto): Promise<ValidationResultDto>;

  /**
   * Generates a temporary download URL for a file.
   * @param fileId - The unique identifier of the file
   * @param userId - The unique identifier of the requesting user
   * @param expiresInSeconds - Optional expiration time in seconds (default: 3600)
   * @returns Temporary download URL
   * @throws {NotFoundError} If file doesn't exist
   * @throws {UnauthorizedError} If user doesn't have permission
   * @throws {StorageError} If URL generation fails
   */
  generateDownloadUrl(
    fileId: string,
    userId: string,
    expiresInSeconds?: number,
  ): Promise<string>;

  /**
   * Generates a preview URL for a file (if supported format).
   * @param fileId - The unique identifier of the file
   * @param userId - The unique identifier of the requesting user
   * @returns Preview URL or null if format doesn't support preview
   * @throws {NotFoundError} If file doesn't exist
   * @throws {UnauthorizedError} If user doesn't have permission
   */
  generatePreviewUrl(fileId: string, userId: string): Promise<string | null>;

  /**
   * Gets the maximum file size limit in bytes.
   * @returns Maximum file size in bytes
   */
  getFileSizeLimit(): number;

  /**
   * Gets the list of supported file formats.
   * @returns Array of supported file extensions
   */
  getSupportedFormats(): string[];

  /**
   * Moves a file to a different section within the same project.
   * @param fileId - The unique identifier of the file
   * @param newSection - The target project section
   * @param userId - The unique identifier of the user performing the move
   * @returns Promise that resolves when file is moved
   * @throws {NotFoundError} If file doesn't exist
   * @throws {UnauthorizedError} If user doesn't have permission
   * @throws {StorageError} If move operation fails
   */
  moveFile(
    fileId: string,
    newSection: ProjectSection,
    userId: string,
  ): Promise<void>;
}
