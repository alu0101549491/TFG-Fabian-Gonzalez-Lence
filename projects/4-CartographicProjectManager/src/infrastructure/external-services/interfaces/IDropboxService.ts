/**
 * Dropbox service interface
 * Handles file storage operations with Dropbox API
 */
export interface IDropboxService {
  /**
   * Creates a project folder in Dropbox
   * @param projectCode - Project code for folder name
   * @returns Folder ID
   */
  createProjectFolder(projectCode: string): Promise<string>;

  /**
   * Uploads file to Dropbox
   * @param filePath - Dropbox file path
   * @param content - File content
   * @returns File path in Dropbox
   */
  uploadFile(filePath: string, content: Buffer): Promise<string>;

  /**
   * Downloads file from Dropbox
   * @param filePath - Dropbox file path
   * @returns File content
   */
  downloadFile(filePath: string): Promise<Buffer>;

  /**
   * Generates shareable link for file
   * @param filePath - Dropbox file path
   * @returns Share link URL
   */
  generateShareLink(filePath: string): Promise<string>;

  /**
   * Syncs files in folder
   * @param folderId - Dropbox folder ID
   */
  syncFiles(folderId: string): Promise<void>;
}
