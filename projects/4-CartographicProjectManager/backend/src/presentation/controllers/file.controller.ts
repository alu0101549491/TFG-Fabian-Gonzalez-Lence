/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 24, 2026
 * @file src/presentation/controllers/file.controller.ts
 * @desc File controller with Dropbox integration
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

import type {Request, Response, NextFunction} from 'express';
import {FileRepository} from '@infrastructure/repositories/file.repository.js';
import {ProjectRepository} from '@infrastructure/repositories/project.repository.js';
import {DropboxService} from '@infrastructure/external-services/dropbox.service.js';
import {sendSuccess, sendError} from '@shared/utils.js';
import {HTTP_STATUS} from '@shared/constants.js';
import type {AuthenticatedRequest} from '@shared/types.js';
import {v4 as uuidv4} from 'uuid';

/**
 * File controller with Dropbox integration for file storage
 */
export class FileController {
  private readonly fileRepository: FileRepository;
  private readonly projectRepository: ProjectRepository;
  private readonly dropboxService: DropboxService | null;

  public constructor() {
    this.fileRepository = new FileRepository();
    this.projectRepository = new ProjectRepository();

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
      console.warn('DROPBOX_ACCESS_TOKEN not set - file uploads will be disabled');
      this.dropboxService = null;
    }
  }

  /**
   * Get all files for a project
   */
  public async getByProjectId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = await this.fileRepository.findByProjectId(req.params.projectId as string);
      const mappedFiles = files.map((file) => this.mapFileToDto(file));
      sendSuccess(res, mappedFiles);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single file by ID
   */
  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = await this.fileRepository.findById(req.params.id as string);
      if (!file) {
        sendError(res, 'File not found', HTTP_STATUS.NOT_FOUND);
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
      console.log('📤 Upload request received');
      console.log('User:', req.user?.id);
      console.log('Body:', req.body);
      console.log('File:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'NO FILE');

      if (!this.dropboxService) {
        console.error('❌ Dropbox service not configured');
        sendError(res, 'File upload service not configured', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        return;
      }

      if (!req.file) {
        console.error('❌ No file provided');
        sendError(res, 'No file provided', HTTP_STATUS.BAD_REQUEST);
        return;
      }

      const {projectId, section, taskId, messageId} = req.body;

      if (!projectId) {
        console.error('❌ No project ID provided');
        sendError(res, 'Project ID is required', HTTP_STATUS.BAD_REQUEST);
        return;
      }

      console.log('🔍 Finding project:', projectId);

      // Get project to validate and get project code
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        console.error('❌ Project not found:', projectId);
        sendError(res, 'Project not found', HTTP_STATUS.NOT_FOUND);
        return;
      }

      console.log('✅ Project found:', project.code);

      // Build Dropbox path
      const sectionFolder = section || 'Messages';
      const dropboxPath = `${this.dropboxService.getProjectFolderPath(project.code)}/${sectionFolder}/${req.file.originalname}`;

      console.log('📂 Dropbox path:', dropboxPath);
      console.log('☁️  Uploading to Dropbox...');

      // Upload to Dropbox
      const dropboxMetadata = await this.dropboxService.uploadFile(
        dropboxPath,
        req.file.buffer,
      );

      console.log('✅ Uploaded to Dropbox');
      console.log('💾 Saving to database...');

      // Save file metadata to database
      const fileData = {
        id: uuidv4(),
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

      console.log('✅ File created in database:', file.id);

      sendSuccess(res, {file: this.mapFileToDto(file)}, 'File uploaded successfully', HTTP_STATUS.CREATED);
    } catch (error) {
      console.error('❌ File upload error:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      next(error);
    }
  }

  /**
   * Download a file from Dropbox
   */
  public async download(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      // Get temporary download link from Dropbox
      const linkResponse = await this.dropboxService.getTemporaryLink(file.dropboxPath);

      sendSuccess(res, {
        downloadUrl: linkResponse.link,
        filename: file.filename,
        expiresAt: linkResponse.expiresAt,
      });
    } catch (error) {
      console.error('File download error:', error);
      next(error);
    }
  }

  /**   * Get preview link for a file
   */
  public async preview(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      // Get preview link from Dropbox (shared link that opens in browser)
      const previewUrl = await this.dropboxService.getPreviewLink(file.dropboxPath);

      sendSuccess(res, {
        previewUrl,
        filename: file.filename || file.originalName,
      });
    } catch (error) {
      console.error('Preview error:', error);
      next(error);
    }
  }

  /**   * Delete a file from Dropbox and database
   */
  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = await this.fileRepository.findById(req.params.id as string);
      if (!file) {
        sendError(res, 'File not found', HTTP_STATUS.NOT_FOUND);
        return;
      }

      // Delete from Dropbox if service is available
      if (this.dropboxService) {
        try {
          await this.dropboxService.deleteFile(file.dropboxPath);
        } catch (error) {
          console.error('Failed to delete from Dropbox:', error);
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
      '.xls': 'SPREADSHEET',
      '.xlsx': 'SPREADSHEET',
      '.ppt': 'PRESENTATION',
      '.pptx': 'PRESENTATION',
      '.jpg': 'IMAGE',
      '.jpeg': 'IMAGE',
      '.png': 'IMAGE',
      '.gif': 'IMAGE',
      '.tif': 'IMAGE',
      '.tiff': 'IMAGE',
      '.zip': 'COMPRESSED',
      '.rar': 'COMPRESSED',
      '.7z': 'COMPRESSED',
      '.dwg': 'CAD',
      '.dxf': 'CAD',
      '.shp': 'GIS',
      '.kml': 'GIS',
      '.kmz': 'GIS',
      '.geojson': 'GIS',
    };

    return typeMap[ext] || 'OTHER';
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
}
