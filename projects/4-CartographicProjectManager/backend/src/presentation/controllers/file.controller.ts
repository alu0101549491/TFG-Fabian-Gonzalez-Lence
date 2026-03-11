/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 7, 2026
 * @file backend/src/presentation/controllers/file.controller.ts
 * @desc File controller with Dropbox integration
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

import type {Response, NextFunction} from 'express';
import * as path from 'node:path';
import {FileRepository} from '@infrastructure/repositories/file.repository.js';
import {ProjectRepository} from '@infrastructure/repositories/project.repository.js';
import {UserRepository} from '@infrastructure/repositories/user.repository.js';
import {PermissionRepository} from '@infrastructure/repositories/permission.repository.js';
import {DropboxService} from '@infrastructure/external-services/dropbox.service.js';
import {sendSuccess, sendError} from '@shared/utils.js';
import {HTTP_STATUS} from '@shared/constants.js';
import type {AuthenticatedRequest} from '@shared/types.js';
import {logDebug, logError, logInfo, logWarning} from '@shared/logger.js';
import {v4 as uuidv4} from 'uuid';

/**
 * File controller with Dropbox integration for file storage
 */
export class FileController {
  private readonly fileRepository: FileRepository;
  private readonly projectRepository: ProjectRepository;
  private readonly userRepository: UserRepository;
  private readonly permissionRepository: PermissionRepository;
  private readonly dropboxService: DropboxService | null;

  public constructor() {
    this.fileRepository = new FileRepository();
    this.projectRepository = new ProjectRepository();
    this.userRepository = new UserRepository();
    this.permissionRepository = new PermissionRepository();

    // Initialize Dropbox service if token is available
    const dropboxToken = process.env.DROPBOX_ACCESS_TOKEN;
    if (dropboxToken) {
      this.dropboxService = new DropboxService({
        accessToken: dropboxToken,
        refreshToken: process.env.DROPBOX_REFRESH_TOKEN,
        appKey: process.env.DROPBOX_APP_KEY,
        appSecret: process.env.DROPBOX_APP_SECRET,
      });
    } else {
      logWarning('DROPBOX_ACCESS_TOKEN not set - file uploads will be disabled');
      this.dropboxService = null;
    }
  }

  private sanitizeDropboxPathSegment(segment: unknown): string {
    const str = typeof segment === 'string' ? segment : '';
    const withoutControlChars = Array.from(str)
      .filter((char) => {
        const codePoint = char.codePointAt(0);
        return codePoint !== undefined && codePoint >= 0x20 && codePoint !== 0x7f;
      })
      .join('');

    return withoutControlChars
      .replace(/[\\/]/g, '_')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 128);
  }

  private normalizeSection(section: unknown): string {
    const normalized = this.sanitizeDropboxPathSegment(section);
    const allowedSections = new Set([
      'ReportAndAnnexes',
      'Plans',
      'Specifications',
      'Budget',
      'Tasks',
    ]);
    return allowedSections.has(normalized) ? normalized : 'ReportAndAnnexes';
  }

  private buildDropboxStorageFilename(originalName: string, fileId: string): string {
    const sanitized = this.sanitizeDropboxPathSegment(originalName) || 'file';
    const ext = path.extname(sanitized).slice(0, 16);
    const base = path.basename(sanitized, ext).slice(0, 80) || 'file';
    return `${fileId}_${base}${ext}`;
  }

  /**
   * Get all files for a project
   */
  public async getByProjectId(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = req.params.projectId as string;
      
      // Check if user has permission to view files from this project
      const canView = await this.canDownloadFromProject(req.user!.id, projectId);
      if (!canView) {
        sendError(res, 'You do not have permission to view files from this project', HTTP_STATUS.FORBIDDEN);
        return;
      }

      const files = await this.fileRepository.findByProjectId(projectId);
      const mappedFiles = files.map((file) => this.mapFileToDto(file));
      sendSuccess(res, mappedFiles);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single file by ID
   */
  public async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = await this.fileRepository.findById(req.params.id as string);
      if (!file) {
        sendError(res, 'File not found', HTTP_STATUS.NOT_FOUND);
        return;
      }

      // Check if user has permission to view this file
      const canView = await this.canDownloadFromProject(req.user!.id, file.projectId);
      if (!canView) {
        sendError(res, 'You do not have permission to view this file', HTTP_STATUS.FORBIDDEN);
        return;
      }

      sendSuccess(res, this.mapFileToDto(file));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload a file to Dropbox and save metadata
   */
  public async upload(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!this.dropboxService) {
        logWarning('Dropbox service not configured; upload disabled');
        sendError(res, 'File upload service not configured', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        return;
      }

      if (!req.file) {
        logWarning('No file provided in upload request', {userId: req.user?.id});
        sendError(res, 'No file provided', HTTP_STATUS.BAD_REQUEST);
        return;
      }

      const {projectId, section, taskId, messageId} = req.body;

      if (!projectId) {
        logWarning('No projectId provided in upload request', {userId: req.user?.id});
        sendError(res, 'Project ID is required', HTTP_STATUS.BAD_REQUEST);
        return;
      }

      logDebug('Upload request received', {
        userId: req.user?.id,
        projectId,
        originalName: req.file.originalname,
        size: req.file.size,
      });

      // Get project to validate and get project code
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        logWarning('Upload project not found', {projectId, userId: req.user?.id});
        sendError(res, 'Project not found', HTTP_STATUS.NOT_FOUND);
        return;
      }

      // Check if user has permission to upload to this project
      const canUpload = await this.canUploadToProject(req.user!.id, projectId);
      if (!canUpload) {
        logWarning('User lacks upload permission for project', {
          userId: req.user?.id,
          projectId,
        });
        sendError(res, 'You do not have permission to upload files to this project', HTTP_STATUS.FORBIDDEN);
        return;
      }

      // Build Dropbox path
      const sectionFolder = this.normalizeSection(section);
      const fileId = uuidv4();
      const storageFilename = this.buildDropboxStorageFilename(
        req.file.originalname,
        fileId,
      );
      const dropboxPath = `${this.dropboxService.getProjectFolderPath(project.code)}/${sectionFolder}/${storageFilename}`;

      // Upload to Dropbox
      const dropboxMetadata = await this.dropboxService.uploadFile(
        dropboxPath,
        req.file.buffer,
      );

      // Save file metadata to database
      const fileData = {
        id: fileId,
        filename: req.file.originalname,
        originalName: req.file.originalname,
        dropboxPath: dropboxMetadata.path,
        type: this.determineFileType(req.file.originalname),
        size: req.file.size,
        mimeType: req.file.mimetype || 'application/octet-stream',
        projectId,
        uploadedBy: req.user!.id,
        uploadedAt: new Date(),
      };

      const file = await this.fileRepository.create(fileData);

      logInfo('File uploaded successfully', {
        fileId: file.id,
        projectId,
        userId: req.user?.id,
      });

      sendSuccess(res, {file: this.mapFileToDto(file)}, 'File uploaded successfully', HTTP_STATUS.CREATED);
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error(String(error));
      logError('File upload failed', normalizedError, {
        userId: req.user?.id,
        projectId: (req.body as {projectId?: string} | undefined)?.projectId,
      });
      next(error);
    }
  }

  /**
   * Download a file from Dropbox
   */
  public async download(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!this.dropboxService) {
        sendError(res, 'File download service not configured', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        return;
      }

      const file = await this.fileRepository.findById(req.params.id as string);
      if (!file) {
        sendError(res, 'File not found', HTTP_STATUS.NOT_FOUND);
        return;
      }

      // Check if user has permission to download from this project
      const canDownload = await this.canDownloadFromProject(req.user!.id, file.projectId);
      if (!canDownload) {
        sendError(res, 'You do not have permission to download files from this project', HTTP_STATUS.FORBIDDEN);
        return;
      }

      // Get temporary download link from Dropbox
      const linkResponse = await this.dropboxService.getTemporaryLink(file.dropboxPath);

      sendSuccess(res, {
        downloadUrl: linkResponse.link,
        filename: file.filename,
        expiresAt: linkResponse.expiresAt,
      });
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error(String(error));
      logError('File download failed', normalizedError, {
        userId: req.user?.id,
        fileId: req.params.id,
      });
      next(error);
    }
  }

  /**   * Get preview link for a file
   */
  public async preview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!this.dropboxService) {
        sendError(res, 'File preview service not configured', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        return;
      }

      const file = await this.fileRepository.findById(req.params.id as string);
      if (!file) {
        sendError(res, 'File not found', HTTP_STATUS.NOT_FOUND);
        return;
      }

      // Check if user has permission to view/download from this project
      const canDownload = await this.canDownloadFromProject(req.user!.id, file.projectId);
      if (!canDownload) {
        sendError(res, 'You do not have permission to preview files from this project', HTTP_STATUS.FORBIDDEN);
        return;
      }

      // Get preview link from Dropbox (shared link that opens in browser)
      const previewUrl = await this.dropboxService.getPreviewLink(file.dropboxPath);

      sendSuccess(res, {
        previewUrl,
        filename: file.filename || file.originalName,
      });
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error(String(error));
      logError('File preview failed', normalizedError, {
        userId: req.user?.id,
        fileId: req.params.id,
      });
      next(error);
    }
  }

  /**   * Delete a file from Dropbox and database
   */
  public async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = await this.fileRepository.findById(req.params.id as string);
      if (!file) {
        sendError(res, 'File not found', HTTP_STATUS.NOT_FOUND);
        return;
      }

      // Check if user has permission to delete (admin or file owner)
      const user = await this.userRepository.findById(req.user!.id);
      if (!user) {
        sendError(res, 'User not found', HTTP_STATUS.FORBIDDEN);
        return;
      }

      const isAdmin = user.role === 'ADMINISTRATOR';
      const isOwner = file.uploadedBy === req.user!.id;

      if (!isAdmin && !isOwner) {
        sendError(res, 'You can only delete files that you uploaded', HTTP_STATUS.FORBIDDEN);
        return;
      }

      // Delete from Dropbox if service is available
      if (this.dropboxService) {
        try {
          await this.dropboxService.deleteFile(file.dropboxPath);
        } catch (error) {
          const normalizedError =
            error instanceof Error ? error : new Error(String(error));
          logError('Failed to delete file from Dropbox; continuing with metadata deletion', normalizedError, {
            fileId: file.id,
            projectId: file.projectId,
          });
          // Continue with metadata deletion even if Dropbox deletion fails
        }
      }

      // Delete metadata from database
      await this.fileRepository.delete(req.params.id as string);

      sendSuccess(res, null, 'File deleted successfully', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if a user has permission to upload files to a project
   * @param userId - User ID
   * @param projectId - Project ID
   * @returns True if user can upload, false otherwise
   * @private
   */
  private async canUploadToProject(userId: string, projectId: string): Promise<boolean> {
    try {
      // Get user to check role
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return false;
      }

      // Administrator can upload to any project
      if (user.role === 'ADMINISTRATOR') {
        return true;
      }

      // Get project to check if user is the client
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        return false;
      }

      // Client can upload to their assigned projects
      if (user.role === 'CLIENT' && project.clientId === userId) {
        return true;
      }

      // Special user creator can upload to their own projects
      if (user.role === 'SPECIAL_USER' && project.creatorId === userId) {
        return true;
      }

      // Special user needs explicit UPLOAD permission
      if (user.role === 'SPECIAL_USER') {
        const permission = await this.permissionRepository.findByUserAndProject(userId, projectId);
        if (permission && permission.rights.includes('UPLOAD')) {
          return true;
        }
      }

      return false;
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error(String(error));
      logError('Error checking upload permission', normalizedError, {
        userId,
        projectId,
      });
      return false;
    }
  }

  /**
   * Check if a user has permission to download files from a project
   * @param userId - User ID
   * @param projectId - Project ID
   * @returns True if user can download, false otherwise
   * @private
   */
  private async canDownloadFromProject(userId: string, projectId: string): Promise<boolean> {
    try {
      // Get user to check role
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return false;
      }

      // Administrator can download from any project
      if (user.role === 'ADMINISTRATOR') {
        return true;
      }

      // Get project to check if user is the client
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        return false;
      }

      // Client can download from their assigned projects
      if (user.role === 'CLIENT' && project.clientId === userId) {
        return true;
      }

      // Special user creator can download from their own projects
      if (user.role === 'SPECIAL_USER' && project.creatorId === userId) {
        return true;
      }

      // Special user needs explicit DOWNLOAD or VIEW permission
      if (user.role === 'SPECIAL_USER') {
        const permission = await this.permissionRepository.findByUserAndProject(userId, projectId);
        if (permission && (permission.rights.includes('DOWNLOAD') || permission.rights.includes('VIEW'))) {
          return true;
        }
      }

      return false;
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error(String(error));
      logError('Error checking download permission', normalizedError, {
        userId,
        projectId,
      });
      return false;
    }
  }

  /**
   * Determine file type from filename extension
   * @param filename - File name
   * @returns File type enum value
   */
  private determineFileType(filename: string): any {
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));

    const typeMap: Record<string, string> = {
      '.pdf': 'PDF',
      '.doc': 'DOCUMENT',
      '.docx': 'DOCUMENT',
      '.txt': 'DOCUMENT',
      '.rtf': 'DOCUMENT',
      '.csv': 'SPREADSHEET',
      '.xls': 'SPREADSHEET',
      '.xlsx': 'SPREADSHEET',
      '.ods': 'SPREADSHEET',
      '.jpg': 'IMAGE',
      '.jpeg': 'IMAGE',
      '.png': 'IMAGE',
      '.gif': 'IMAGE',
      '.bmp': 'IMAGE',
      '.svg': 'IMAGE',
      '.tif': 'IMAGE',
      '.tiff': 'IMAGE',
      '.zip': 'COMPRESSED',
      '.rar': 'COMPRESSED',
      '.7z': 'COMPRESSED',
      '.tar': 'COMPRESSED',
      '.gz': 'COMPRESSED',
      '.kmz': 'COMPRESSED',
      '.dwg': 'CAD',
      '.dxf': 'CAD',
      '.shp': 'SHP',
      '.kml': 'KML',
      '.geojson': 'DOCUMENT',
    };

    return typeMap[ext] || 'DOCUMENT';
  }

  /**
   * Map Prisma File to API DTO format expected by frontend
   * @param file - Prisma File entity
   * @returns DTO object with mapped field names
   * @private
   */
  private mapFileToDto(file: any) {
    return {
      id: file.id,
      name: file.filename || file.originalName,
      sizeInBytes: file.size,
      type: file.type,
      dropboxPath: file.dropboxPath,
      uploadedBy: file.uploadedBy,
      uploadedAt: file.uploadedAt,
      projectId: file.projectId,
      mimeType: file.mimeType,
    };
  }

  /**
   * Sync files from Dropbox to database
   * Lists all files in the project's Dropbox folder and creates database entries for any that are missing
   */
  public async syncFromDropbox(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!this.dropboxService) {
        sendError(res, 'Dropbox service not configured', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        return;
      }

      const projectId = req.params.projectId as string;

      // Check if user has permission to manage files in this project
      const canManage = await this.canUploadToProject(req.user!.id, projectId);
      if (!canManage) {
        sendError(res, 'You do not have permission to sync files for this project', HTTP_STATUS.FORBIDDEN);
        return;
      }

      // Get project to get project code
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        sendError(res, 'Project not found', HTTP_STATUS.NOT_FOUND);
        return;
      }

      logInfo('Starting Dropbox file sync', {projectId, projectCode: project.code, userId: req.user!.id});

      // Get all files from Dropbox
      const dropboxPath = this.dropboxService.getProjectFolderPath(project.code);
      const dropboxFiles = await this.dropboxService.listFiles(dropboxPath);

      logDebug('Files found in Dropbox', {projectId, count: dropboxFiles.length});

      // Get all existing files from database for this project
      const dbFiles = await this.fileRepository.findByProjectId(projectId);
      const dbFilePaths = new Set(dbFiles.map((f) => f.dropboxPath));

      let syncedCount = 0;
      let skippedCount = 0;

      // Create database entries for files that don't exist in DB
      for (const dropboxFile of dropboxFiles) {
        if (dbFilePaths.has(dropboxFile.path)) {
          skippedCount++;
          continue;
        }

        try {
          // Extract section from path (e.g., /CartographicProjects/PROJ-001/Plans/file.pdf -> Plans)
          const pathParts = dropboxFile.path.split('/');
          const sectionIndex = pathParts.findIndex((part) => part === project.code) + 1;
          const section = sectionIndex < pathParts.length ? pathParts[sectionIndex] : 'Messages';

          // Determine file type based on section or extension
          const fileType = this.determineFileType(dropboxFile.name);

          // Create file entry
          const fileData = {
            id: uuidv4(),
            filename: dropboxFile.name,
            originalName: dropboxFile.name,
            dropboxPath: dropboxFile.path,
            type: fileType,
            size: dropboxFile.size,
            mimeType: this.getMimeTypeFromFilename(dropboxFile.name),
            projectId,
            uploadedBy: req.user!.id, // Attribute to current user performing the sync
            uploadedAt: dropboxFile.modifiedAt,
          };

          await this.fileRepository.create(fileData);
          syncedCount++;

          logDebug('File synced from Dropbox', {
            projectId,
            fileName: dropboxFile.name,
            dropboxPath: dropboxFile.path,
          });
        } catch (error) {
          const normalizedError =
            error instanceof Error ? error : new Error(String(error));
          logError('Failed to sync individual file from Dropbox', normalizedError, {
            projectId,
            fileName: dropboxFile.name,
            dropboxPath: dropboxFile.path,
          });
          // Continue with other files
        }
      }

      logInfo('Dropbox file sync completed', {
        projectId,
        projectCode: project.code,
        totalDropboxFiles: dropboxFiles.length,
        syncedCount,
        skippedCount,
      });

      sendSuccess(res, {
        totalFiles: dropboxFiles.length,
        synced: syncedCount,
        skipped: skippedCount,
      }, `Successfully synced ${syncedCount} file(s) from Dropbox`);
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error(String(error));
      logError('Dropbox file sync failed', normalizedError, {
        userId: req.user?.id,
        projectId: req.params.projectId,
      });
      next(error);
    }
  }

  /**
   * Get MIME type from filename extension
   * @param filename - Filename to analyze
   * @returns MIME type string
   * @private
   */
  private getMimeTypeFromFilename(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.zip': 'application/zip',
      '.dwg': 'application/acad',
      '.dxf': 'application/dxf',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}
