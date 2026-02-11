/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file application/services/file.service.ts
 * @desc Service implementation for file management via Dropbox.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {
  type UploadFileDto,
  type FileUploadResultDto,
  type FileDto,
  type FileSummaryDto,
  type BatchUploadDto,
  type BatchUploadResultDto,
  type FileDownloadResultDto,
  type FileFilterDto,
  type ValidationResultDto,
  type ValidationErrorDto,
  ProjectSection,
  FileErrorCode,
  ValidationErrorCode,
} from '../dto';
import {IFileService} from '../interfaces/file-service.interface';
import {
  type IFileRepository,
  type IProjectRepository,
} from '../../domain/repositories';
import {IAuthorizationService} from '../interfaces/authorization-service.interface';
import {UnauthorizedError, NotFoundError} from './common/errors';
import {generateId, formatBytes, getFileExtension} from './common/utils';
import {File} from '../../domain/entities/file';
import {FileType} from '../../domain/enumerations/file-type';

/**
 * Placeholder interface for Dropbox service.
 */
interface IDropboxService {
  uploadFile(projectCode: string, section: string, filename: string, content: ArrayBuffer | Blob): Promise<string>;
  downloadFile(fileId: string): Promise<ArrayBuffer>;
  deleteFile(fileId: string): Promise<void>;
  generateTemporaryUrl(fileId: string, expiresIn: number): Promise<string>;
}

/**
 * Implementation of file management operations.
 */
export class FileService implements IFileService {
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
  private readonly ALLOWED_EXTENSIONS = new Set([
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.jpg', '.jpeg', '.png', '.gif', '.tif', '.tiff',
    '.zip', '.rar', '.7z',
    '.dwg', '.dxf', '.shp', '.kml', '.kmz', '.geojson',
  ]);

  constructor(
    private readonly fileRepository: IFileRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly authorizationService: IAuthorizationService,
    private readonly dropboxService: IDropboxService
  ) {}

  /**
   * Uploads a single file to a project.
   */
  public async uploadFile(data: UploadFileDto, userId: string): Promise<FileUploadResultDto> {
    // Check permissions
    const canUpload = await this.authorizationService.canUploadFile(userId, data.projectId);
    if (!canUpload) {
      return {
        success: false,
        file: null,
        error: 'You do not have permission to upload files to this project',
        errorCode: FileErrorCode.PERMISSION_DENIED,
      };
    }

    // Get project
    const project = await this.projectRepository.findById(data.projectId);
    if (!project) {
      return {
        success: false,
        file: null,
        error: 'Project not found',
        errorCode: FileErrorCode.UPLOAD_FAILED,
      };
    }

    // Validate file
    const validation = await this.validateFile(data);
    if (!validation.isValid) {
      return {
        success: false,
        file: null,
        error: validation.errors[0]?.message || 'File validation failed',
        errorCode: FileErrorCode.INVALID_FORMAT,
      };
    }

    try {
      // Calculate file size from content
      const fileSize = data.content instanceof Blob 
        ? data.content.size 
        : data.content.byteLength;

      // Upload to Dropbox
      const dropboxPath = await this.dropboxService.uploadFile(
        project.code,
        data.section || 'general',
        data.name,
        data.content
      );

      // Create file entity
      const file = new File({
        id: generateId(),
        name: data.name,
        dropboxPath,
        type: this.determineFileType(data.name),
        sizeInBytes: fileSize,
        uploadedBy: userId,
        projectId: data.projectId,
        taskId: data.taskId,
        messageId: data.messageId,
        uploadedAt: new Date(),
      });

      await this.fileRepository.save(file);

      return {
        success: true,
        file: await this.mapToDto(file),
        error: null,
        errorCode: null,
      };
    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        file: null,
        error: 'Failed to upload file',
        errorCode: FileErrorCode.UPLOAD_FAILED,
      };
    }
  }

  /**
   * Uploads multiple files in batch.
   */
  public async uploadBatch(data: BatchUploadDto, userId: string): Promise<BatchUploadResultDto> {
    const results: FileUploadResultDto[] = [];
    
    for (const fileData of data.files) {
      const result = await this.uploadFile(
        {
          ...fileData,
          projectId: data.projectId,
        },
        userId
      );
      results.push(result);
    }

    const successCount = results.filter((r: FileUploadResultDto) => r.success).length;
    const failureCount = results.length - successCount;

    return {
      results,
      successCount,
      failureCount,
    };
  }

  /**
   * Uploads multiple files to the project's storage in a batch.
   */
  public async uploadMultipleFiles(data: BatchUploadDto, userId: string): Promise<BatchUploadResultDto> {
    return this.uploadBatch(data, userId);
  }

  /**
   * Downloads a file.
   */
  public async downloadFile(fileId: string, userId: string): Promise<FileDownloadResultDto> {
    const canDownload = await this.authorizationService.canDownloadFile(userId, fileId);
    if (!canDownload) {
      return {
        success: false,
        content: null,
        filename: null,
        mimeType: null,
        error: 'You do not have permission to download this file',
      };
    }

    const file = await this.fileRepository.findById(fileId);
    if (!file) {
      return {
        success: false,
        content: null,
        filename: null,
        mimeType: null,
        error: 'File not found',
      };
    }

    try {
      // Download file content from Dropbox
      const content = await this.dropboxService.downloadFile(file.dropboxPath);

      return {
        success: true,
        content,
        filename: file.name,
        mimeType: this.getMimeTypeFromExtension(file.name),
        error: null,
      };
    } catch (error) {
      console.error('File download error:', error);
      return {
        success: false,
        content: null,
        filename: null,
        mimeType: null,
        error: 'Failed to download file',
      };
    }
  }

  /**
   * Deletes a file.
   */
  public async deleteFile(fileId: string, userId: string): Promise<void> {
    const canDelete = await this.authorizationService.canDeleteFile(userId, fileId);
    if (!canDelete) {
      throw new UnauthorizedError('You do not have permission to delete this file');
    }

    const file = await this.fileRepository.findById(fileId);
    if (!file) {
      throw new NotFoundError(`File ${fileId} not found`);
    }

    // Delete from Dropbox
    try {
      await this.dropboxService.deleteFile(file.dropboxPath);
    } catch (error) {
      console.error('Failed to delete file from Dropbox:', error);
      // Continue with metadata deletion
    }

    await this.fileRepository.delete(fileId);
  }

  /**
   * Retrieves a specific file by ID.
   */
  public async getFileById(fileId: string, userId: string): Promise<FileDto> {
    const canDownload = await this.authorizationService.canDownloadFile(userId, fileId);
    if (!canDownload) {
      throw new UnauthorizedError('You do not have permission to access this file');
    }

    const file = await this.fileRepository.findById(fileId);
    if (!file) {
      throw new NotFoundError(`File ${fileId} not found`);
    }

    return this.mapToDto(file);
  }

  /**
   * Retrieves all files for a project with optional filtering.
   */
  public async getFilesByProject(
    projectId: string,
    userId: string,
    _filters?: FileFilterDto
  ): Promise<FileDto[]> {
    const canAccess = await this.authorizationService.canAccessProject(userId, projectId);
    if (!canAccess) {
      throw new UnauthorizedError('You do not have permission to access this project');
    }

    const files = await this.fileRepository.findByProjectId(projectId);
    return files.map((f: File) => this.mapToDto(f));
  }

  /**
   * Retrieves files by section within a project.
   */
  public async getFilesBySection(
    projectId: string,
    section: ProjectSection,
    userId: string
  ): Promise<FileDto[]> {
    const filters: FileFilterDto = {section};
    const files = await this.getFilesByProject(projectId, userId, filters);
    return files;
  }

  /**
   * Retrieves files uploaded by a specific user.
   */
  async getFilesByUploader(uploaderId: string, userId: string): Promise<FileSummaryDto[]> {
    // User can view their own files, admins can view all
    const isAdmin = await this.authorizationService.isAdmin(userId);
    if (!isAdmin && userId !== uploaderId) {
      throw new UnauthorizedError('You do not have permission to view these files');
    }

    const files = await this.fileRepository.findByUploadedBy(uploaderId);
    return files.map((f: File) => this.mapToSummaryDto(this.mapToDto(f)));
  }

  /**
   * Retrieves all files attached to a specific task.
   */
  public async getFilesByTask(taskId: string, userId: string): Promise<FileDto[]> {
    // Check if user can access the task's project
    const files = await this.fileRepository.findByTaskId(taskId);
    if (files.length === 0) {
      return [];
    }

    // Check access for the first file's project (all files in task should be from same project)
    const canAccess = await this.authorizationService.canAccessProject(userId, files[0].projectId);
    if (!canAccess) {
      throw new UnauthorizedError('You do not have permission to access these files');
    }

    return files.map((f: File) => this.mapToDto(f));
  }

  /**
   * Retrieves all files attached to a specific message.
   */
  public async getFilesByMessage(messageId: string, userId: string): Promise<FileDto[]> {
    // Check if user can access the message's project
    const files = await this.fileRepository.findByMessageId(messageId);
    if (files.length === 0) {
      return [];
    }

    // Check access for the first file's project (all files in message should be from same project)
    const canAccess = await this.authorizationService.canAccessProject(userId, files[0].projectId);
    if (!canAccess) {
      throw new UnauthorizedError('You do not have permission to access these files');
    }

    return files.map((f: File) => this.mapToDto(f));
  }

  /**
   * Generates a temporary download URL for a file.
   */
  public async generateDownloadUrl(
    fileId: string,
    userId: string,
    expiresInSeconds: number = 3600
  ): Promise<string> {
    const canDownload = await this.authorizationService.canDownloadFile(userId, fileId);
    if (!canDownload) {
      throw new UnauthorizedError('You do not have permission to download this file');
    }

    const file = await this.fileRepository.findById(fileId);
    if (!file) {
      throw new NotFoundError(`File ${fileId} not found`);
    }

    return await this.dropboxService.generateTemporaryUrl(file.dropboxPath, expiresInSeconds);
  }

  /**
   * Generates a preview URL for a file (if supported format).
   */
  public async generatePreviewUrl(fileId: string, userId: string): Promise<string | null> {
    const canDownload = await this.authorizationService.canDownloadFile(userId, fileId);
    if (!canDownload) {
      throw new UnauthorizedError('You do not have permission to access this file');
    }

    const file = await this.fileRepository.findById(fileId);
    if (!file) {
      throw new NotFoundError(`File ${fileId} not found`);
    }

    // Only generate preview URLs for images
    if (!file.isImage()) {
      return null;
    }

    return await this.dropboxService.generateTemporaryUrl(file.dropboxPath, 3600);
  }

  /**
   * Gets the maximum file size limit in bytes.
   */
  public getFileSizeLimit(): number {
    return this.MAX_FILE_SIZE;
  }

  /**
   * Gets the list of supported file formats.
   */
  public getSupportedFormats(): string[] {
    return Array.from(this.ALLOWED_EXTENSIONS);
  }

  /**
   * Moves a file to a different section within the same project.
   */
  public async moveFile(
    fileId: string,
    _newSection: ProjectSection,
    userId: string
  ): Promise<void> {
    const canModify = await this.authorizationService.canDownloadFile(userId, fileId);
    if (!canModify) {
      throw new UnauthorizedError('You do not have permission to modify this file');
    }

    const file = await this.fileRepository.findById(fileId);
    if (!file) {
      throw new NotFoundError(`File ${fileId} not found`);
    }

    // Note: File entity doesn't support sections in current implementation
    // This would require refactoring the File entity or moving files in Dropbox
    // For now, this is a placeholder
  }

  /**
   * Gets file statistics for a project.
   */
  async getProjectFileStats(projectId: string, userId: string): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByType: Record<string, number>;
    filesBySection: Record<string, number>;
  }> {
    const canAccess = await this.authorizationService.canAccessProject(userId, projectId);
    if (!canAccess) {
      throw new UnauthorizedError('You do not have permission to access this project');
    }

    const files = await this.fileRepository.findByProjectId(projectId);
    
    const stats = {
      totalFiles: files.length,
      totalSize: files.reduce((sum: number, f: File) => sum + f.sizeInBytes, 0),
      filesByType: {} as Record<string, number>,
      filesBySection: {} as Record<string, number>,
    };

    files.forEach((file: File) => {
      // By type
      const type = file.type.toString();
      stats.filesByType[type] = (stats.filesByType[type] || 0) + 1;
    });

    return stats;
  }

  /**
   * Searches files by name across accessible projects.
   */
  async searchFiles(query: string, userId: string): Promise<FileSummaryDto[]> {
    // Get all files and filter by name
    // TODO: Implement efficient search in repository
    const allProjects = await this.projectRepository.findAll();
    const accessibleFiles: File[] = [];
    
    for (const project of allProjects) {
      try {
        const canAccess = await this.authorizationService.canAccessProject(userId, project.id);
        if (canAccess) {
          const projectFiles = await this.fileRepository.findByProjectId(project.id);
          const matchingFiles = projectFiles.filter((f: File) => 
            f.name.toLowerCase().includes(query.toLowerCase())
          );
          accessibleFiles.push(...matchingFiles);
        }
      } catch {
        // Skip inaccessible projects
      }
    }

    return accessibleFiles.map((f: File) => this.mapToSummaryDto(this.mapToDto(f)));
  }

  /**
   * Gets total storage usage for a project.
   */
  async getProjectStorageUsage(projectId: string, userId: string): Promise<{
    usedBytes: number;
    formattedSize: string;
    fileCount: number;
  }> {
    const canAccess = await this.authorizationService.canAccessProject(userId, projectId);
    if (!canAccess) {
      throw new UnauthorizedError('You do not have permission to access this project');
    }

    const files = await this.fileRepository.findByProjectId(projectId);
    const usedBytes = files.reduce((sum: number, f: File) => sum + f.sizeInBytes, 0);

    return {
      usedBytes,
      formattedSize: formatBytes(usedBytes),
      fileCount: files.length,
    };
  }

  /**
   * Updates file metadata.
   */
  async updateFileMetadata(
    fileId: string,
    _updates: {description?: string; section?: ProjectSection},
    userId: string
  ): Promise<FileDto> {
    const canModify = await this.authorizationService.canDownloadFile(userId, fileId);
    if (!canModify) {
      throw new UnauthorizedError('You do not have permission to modify this file');
    }

    const file = await this.fileRepository.findById(fileId);
    if (!file) {
      throw new NotFoundError(`File ${fileId} not found`);
    }

    // Note: File entity is immutable, so we would need to create a new instance
    // or implement an update method in the repository
    // For now, we just return the existing file
    await this.fileRepository.save(file);

    return this.mapToDto(file);
  }

  /**
   * Validates a file before upload.
   */
  public async validateFile(data: UploadFileDto): Promise<ValidationResultDto> {
    const errors: ValidationErrorDto[] = [];

    // Calculate file size from content
    const fileSize = data.content instanceof Blob 
      ? data.content.size 
      : data.content.byteLength;

    // Check file size
    if (fileSize > this.MAX_FILE_SIZE) {
      errors.push({
        field: 'content',
        message: `File size must be less than ${formatBytes(this.MAX_FILE_SIZE)}`,
        code: ValidationErrorCode.TOO_LARGE,
        value: fileSize,
      });
    }

    // Check file extension
    const extension = getFileExtension(data.name);
    if (!this.ALLOWED_EXTENSIONS.has(extension)) {
      errors.push({
        field: 'name',
        message: `File type ${extension} is not allowed`,
        code: ValidationErrorCode.INVALID_FORMAT,
        value: extension,
      });
    }

    // Check filename
    if (!data.name || data.name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'Filename is required',
        code: ValidationErrorCode.REQUIRED,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Determines file type from extension.
   */
  private determineFileType(filename: string): FileType {
    const ext = getFileExtension(filename).toLowerCase().replace(/^\./, '');
    
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'tif', 'tiff', 'webp'];
    const documentExts = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
    const spreadsheetExts = ['xls', 'xlsx', 'csv'];
    const compressedExts = ['zip', 'rar'];
    const cadExts = ['dwg', 'dxf'];
    const kmlExts = ['kml', 'kmz', 'geojson'];
    const shpExts = ['shp', 'shx', 'dbf', 'prj'];

    if (imageExts.includes(ext)) return FileType.IMAGE;
    if (documentExts.includes(ext)) return FileType.DOCUMENT;
    if (spreadsheetExts.includes(ext)) return FileType.SPREADSHEET;
    if (compressedExts.includes(ext)) return FileType.COMPRESSED;
    if (cadExts.includes(ext)) return FileType.CAD;
    if (kmlExts.includes(ext)) return FileType.KML;
    if (shpExts.includes(ext)) return FileType.SHP;

    return FileType.DOCUMENT; // Default to DOCUMENT
  }

  /**
   * Maps file entity to DTO.
   */
  private mapToDto(file: File): FileDto {
    return {
      id: file.id,
      name: file.name,
      dropboxPath: file.dropboxPath,
      type: file.type,
      mimeType: this.getMimeTypeFromExtension(file.name),
      sizeInBytes: file.sizeInBytes,
      humanReadableSize: file.getHumanReadableSize(),
      uploadedBy: file.uploadedBy,
      uploaderName: 'Unknown', // TODO: Fetch from user repository
      uploadedAt: file.uploadedAt,
      projectId: file.projectId,
      taskId: file.taskId,
      messageId: file.messageId,
      section: null, // Files don't store section in entity
      downloadUrl: `/api/files/${file.id}/download`,
      previewUrl: file.isImage() ? `/api/files/${file.id}/preview` : null,
      isImage: file.isImage(),
      isDocument: file.isDocument(),
      isCartographic: file.isCartographic(),
    };
  }

  /**
   * Maps file to summary DTO.
   */
  private mapToSummaryDto(file: FileDto): FileSummaryDto {
    return {
      id: file.id,
      name: file.name,
      type: file.type,
      sizeInBytes: file.sizeInBytes,
      humanReadableSize: file.humanReadableSize,
      uploadedBy: file.uploadedBy,
      uploaderName: file.uploaderName,
      uploadedAt: file.uploadedAt,
      downloadUrl: file.downloadUrl,
    };
  }

  /**
   * Gets MIME type from file extension.
   */
  private getMimeTypeFromExtension(filename: string): string {
    const ext = getFileExtension(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.tif': 'image/tiff',
      '.tiff': 'image/tiff',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
      '.7z': 'application/x-7z-compressed',
      '.dwg': 'application/acad',
      '.dxf': 'application/dxf',
      '.shp': 'application/x-shapefile',
      '.kml': 'application/vnd.google-earth.kml+xml',
      '.kmz': 'application/vnd.google-earth.kmz',
      '.geojson': 'application/geo+json',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}
