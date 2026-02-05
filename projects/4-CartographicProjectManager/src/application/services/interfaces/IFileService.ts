import {File} from '@domain/entities/File';
import {FileData} from '../../dtos/FileData';
import {ValidationResult} from '../../dtos/ValidationResult';

/**
 * File service interface
 * Handles file upload, download, and validation
 */
export interface IFileService {
  /**
   * Uploads a file to Dropbox
   * @param fileData - File data
   * @param projectId - Project ID
   * @returns Created file entity
   */
  uploadFile(fileData: FileData, projectId: string): Promise<File>;

  /**
   * Downloads a file from Dropbox
   * @param fileId - File ID
   * @param userId - Requesting user ID
   * @returns File stream
   */
  downloadFile(fileId: string, userId: string): Promise<Blob>;

  /**
   * Validates file before upload
   * @param fileData - File data to validate
   * @returns Validation result
   */
  validateFile(fileData: FileData): Promise<ValidationResult>;

  /**
   * Deletes a file
   * @param fileId - File ID
   * @param userId - User requesting deletion
   */
  deleteFile(fileId: string, userId: string): Promise<void>;
}