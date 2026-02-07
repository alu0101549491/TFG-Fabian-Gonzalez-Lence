/**
 * @module application/interfaces/file-service
 * @description Interface for the File Service.
 * Defines the contract for file upload, download, and validation
 * through the Dropbox integration.
 * @category Application
 */

import {type File} from '@domain/entities/file';
import {type FileData, type FileStream} from '../dto/file-data.dto';
import {type ValidationResult} from '../dto/validation-result.dto';

/**
 * Contract for file management operations.
 * Handles upload, download, validation, and deletion via Dropbox.
 */
export interface IFileService {
  /**
   * Uploads a file to the project's Dropbox folder.
   * @param fileData - The file data to upload.
   * @param projectId - The project's unique ID.
   * @returns The created file metadata entity.
   */
  uploadFile(fileData: FileData, projectId: string): Promise<File>;

  /**
   * Downloads a file from Dropbox.
   * @param fileId - The file's unique ID.
   * @param userId - The requesting user's ID (for permission checks).
   * @returns The file stream with content and metadata.
   */
  downloadFile(fileId: string, userId: string): Promise<FileStream>;

  /**
   * Validates a file before upload (format, size, etc.).
   * @param fileData - The file data to validate.
   * @returns Validation result with any errors or warnings.
   */
  validateFile(fileData: FileData): Promise<ValidationResult>;

  /**
   * Deletes a file from Dropbox and removes its metadata.
   * @param fileId - The file's unique ID.
   * @param userId - The requesting user's ID (for permission checks).
   */
  deleteFile(fileId: string, userId: string): Promise<void>;
}
