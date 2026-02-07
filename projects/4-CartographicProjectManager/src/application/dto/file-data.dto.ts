/**
 * @module application/dto/file-data
 * @description Data Transfer Object for file upload operations.
 * @category Application
 */

/**
 * Data required to upload a file.
 */
export interface FileData {
  /** Original file name. */
  name: string;
  /** File content as a byte array. */
  content: Uint8Array;
  /** MIME type of the file. */
  mimeType: string;
  /** File size in bytes. */
  sizeInBytes: number;
  /** ID of the user uploading the file. */
  uploadedBy: string;
}

/**
 * Represents a file stream for download operations.
 */
export interface FileStream {
  /** File content as a byte array. */
  content: Uint8Array;
  /** File name for download. */
  fileName: string;
  /** MIME type of the file. */
  mimeType: string;
}
