/**
 * @module application/services/export
 * @description Service implementation for data export functionality.
 * @category Application
 */

import {
  type ExportFiltersDto,
  type ExportResultDto,
  type ExportProgressDto,
  type ExportInfoDto,
  ExportFormat,
  ExportDataType,
  ExportStatus,
  ExportErrorCode,
} from '../dto';
import {IExportService} from '../interfaces/export-service.interface';
import {
  type IProjectRepository,
  type ITaskRepository,
  type IMessageRepository,
  type IFileRepository,
  type IUserRepository,
} from '../../domain/repositories';
import {IAuthorizationService} from '../interfaces/authorization-service.interface';
import {UnauthorizedError, NotFoundError} from './common/errors';
import {generateId} from './common/utils';

/**
 * Placeholder interfaces for export generators.
 */
interface ICSVGenerator {
  generate(data: unknown[]): Buffer;
}

interface IPDFGenerator {
  generate(data: unknown[], options: {title: string; headers: string[]}): Buffer;
}

interface IExcelGenerator {
  generate(data: unknown[], options: {sheetName: string}): Buffer;
}

/**
 * Implementation of export operations.
 */
export class ExportService implements IExportService {
  // Track export progress
  private readonly exportProgress = new Map<string, ExportProgressDto>();

  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly taskRepository: ITaskRepository,
    private readonly messageRepository: IMessageRepository,
    private readonly fileRepository: IFileRepository,
    private readonly userRepository: IUserRepository,
    private readonly authorizationService: IAuthorizationService,
    private readonly csvGenerator: ICSVGenerator,
    private readonly pdfGenerator: IPDFGenerator,
    private readonly excelGenerator: IExcelGenerator
  ) {}

  /**
   * Exports data based on filters and format.
   */
  async exportData(
    filters: ExportFiltersDto,
    userId: string
  ): Promise<ExportResultDto> {
    // Check permissions
    const canExport = await this.authorizationService.canExportData(userId);
    if (!canExport) {
      return {
        status: ExportStatus.FAILED,
        errorCode: ExportErrorCode.PERMISSION_DENIED,
        errorMessage: 'You do not have permission to export data',
      };
    }

    const exportId = generateId();
    
    try {
      // Initialize progress
      this.exportProgress.set(exportId, {
        exportId,
        status: ExportStatus.IN_PROGRESS,
        progress: 0,
        startedAt: new Date(),
      });

      // Fetch data based on type
      let data: unknown[];
      let filename: string;

      switch (filters.dataType) {
        case ExportDataType.PROJECTS:
          data = await this.fetchProjects(filters);
          filename = `projects_export_${Date.now()}`;
          break;
        case ExportDataType.TASKS:
          data = await this.fetchTasks(filters);
          filename = `tasks_export_${Date.now()}`;
          break;
        case ExportDataType.MESSAGES:
          data = await this.fetchMessages(filters);
          filename = `messages_export_${Date.now()}`;
          break;
        case ExportDataType.FILES:
          data = await this.fetchFiles(filters);
          filename = `files_export_${Date.now()}`;
          break;
        case ExportDataType.USERS:
          data = await this.fetchUsers(filters);
          filename = `users_export_${Date.now()}`;
          break;
        default:
          return {
            status: ExportStatus.FAILED,
            errorCode: ExportErrorCode.INVALID_FORMAT,
            errorMessage: 'Invalid data type',
          };
      }

      // Update progress
      this.exportProgress.set(exportId, {
        exportId,
        status: ExportStatus.IN_PROGRESS,
        progress: 50,
        startedAt: this.exportProgress.get(exportId)!.startedAt,
      });

      // Generate file based on format
      let fileContent: Buffer;
      let fileExtension: string;

      switch (filters.format) {
        case ExportFormat.CSV:
          fileContent = this.csvGenerator.generate(data);
          fileExtension = '.csv';
          break;
        case ExportFormat.PDF:
          fileContent = this.pdfGenerator.generate(data, {
            title: `${filters.dataType} Export`,
            headers: this.getHeaders(filters.dataType),
          });
          fileExtension = '.pdf';
          break;
        case ExportFormat.EXCEL:
          fileContent = this.excelGenerator.generate(data, {
            sheetName: filters.dataType,
          });
          fileExtension = '.xlsx';
          break;
        default:
          return {
            status: ExportStatus.FAILED,
            errorCode: ExportErrorCode.INVALID_FORMAT,
            errorMessage: 'Invalid export format',
          };
      }

      // TODO: Store file (e.g., in Dropbox or temp storage)
      const downloadUrl = `/api/exports/${exportId}/download`;

      // Update progress to completed
      this.exportProgress.set(exportId, {
        exportId,
        status: ExportStatus.COMPLETED,
        progress: 100,
        startedAt: this.exportProgress.get(exportId)!.startedAt,
        completedAt: new Date(),
      });

      return {
        status: ExportStatus.COMPLETED,
        exportId,
        filename: filename + fileExtension,
        downloadUrl,
        fileSize: fileContent.length,
        recordCount: data.length,
      };
    } catch (error) {
      console.error('Export error:', error);
      
      this.exportProgress.set(exportId, {
        exportId,
        status: ExportStatus.FAILED,
        progress: 0,
        startedAt: this.exportProgress.get(exportId)!.startedAt,
      });

      return {
        status: ExportStatus.FAILED,
        errorCode: ExportErrorCode.GENERATION_FAILED,
        errorMessage: 'Export generation failed',
      };
    }
  }

  /**
   * Gets the status of an ongoing export operation.
   */
  async getExportProgress(exportId: string, userId: string): Promise<ExportProgressDto> {
    const canExport = await this.authorizationService.canExportData(userId);
    if (!canExport) {
      throw new UnauthorizedError('You do not have permission to view export progress');
    }

    const progress = this.exportProgress.get(exportId);
    if (!progress) {
      throw new NotFoundError(`Export ${exportId} not found`);
    }

    return progress;
  }

  /**
   * Retrieves information about a completed export.
   */
  async getExportInfo(exportId: string, userId: string): Promise<ExportInfoDto> {
    const canExport = await this.authorizationService.canExportData(userId);
    if (!canExport) {
      throw new UnauthorizedError('You do not have permission to view export information');
    }

    const progress = this.exportProgress.get(exportId);
    if (!progress) {
      throw new NotFoundError(`Export ${exportId} not found`);
    }

    return {
      exportId,
      status: progress.status,
      createdAt: progress.startedAt,
      expiresAt: new Date(progress.startedAt.getTime() + 24 * 60 * 60 * 1000), // 24 hours
    };
  }

  /**
   * Lists all available export presets.
   */
  async getExportPresets(userId: string): Promise<ExportFiltersDto[]> {
    const canExport = await this.authorizationService.canExportData(userId);
    if (!canExport) {
      throw new UnauthorizedError('You do not have permission to access export presets');
    }

    // Return predefined presets
    return [
      {
        name: 'All Projects',
        dataType: ExportDataType.PROJECTS,
        format: ExportFormat.EXCEL,
      },
      {
        name: 'Active Tasks',
        dataType: ExportDataType.TASKS,
        format: ExportFormat.CSV,
        includeCompleted: false,
      },
      {
        name: 'Project Messages',
        dataType: ExportDataType.MESSAGES,
        format: ExportFormat.PDF,
      },
    ];
  }

  /**
   * Cancels an ongoing export operation.
   */
  async cancelExport(exportId: string, userId: string): Promise<void> {
    const canExport = await this.authorizationService.canExportData(userId);
    if (!canExport) {
      throw new UnauthorizedError('You do not have permission to cancel exports');
    }

    const progress = this.exportProgress.get(exportId);
    if (!progress) {
      throw new NotFoundError(`Export ${exportId} not found`);
    }

    if (progress.status === ExportStatus.IN_PROGRESS) {
      this.exportProgress.set(exportId, {
        ...progress,
        status: ExportStatus.FAILED,
        errorMessage: 'Export cancelled by user',
      });
    }
  }

  /**
   * Validates export filters.
   */
  async validateExportFilters(filters: ExportFiltersDto, userId: string): Promise<{
    isValid: boolean;
    errors?: string[];
  }> {
    const errors: string[] = [];

    if (!filters.dataType) {
      errors.push('Data type is required');
    }

    if (!filters.format) {
      errors.push('Export format is required');
    }

    // Validate date range if provided
    if (filters.startDate && filters.endDate && filters.startDate >= filters.endDate) {
      errors.push('Start date must be before end date');
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Deletes a completed export file.
   */
  async deleteExport(exportId: string, userId: string): Promise<void> {
    const canExport = await this.authorizationService.canExportData(userId);
    if (!canExport) {
      throw new UnauthorizedError('You do not have permission to delete exports');
    }

    this.exportProgress.delete(exportId);
    // TODO: Delete file from storage
  }

  /**
   * Gets available export formats for a data type.
   */
  async getAvailableFormats(dataType: ExportDataType, userId: string): Promise<ExportFormat[]> {
    const canExport = await this.authorizationService.canExportData(userId);
    if (!canExport) {
      throw new UnauthorizedError('You do not have permission to access export formats');
    }

    // All formats available for all data types
    return [ExportFormat.CSV, ExportFormat.PDF, ExportFormat.EXCEL];
  }

  /**
   * Fetches projects based on filters.
   */
  private async fetchProjects(filters: ExportFiltersDto): Promise<unknown[]> {
    const projects = await this.projectRepository.findAll({
      startDate: filters.startDate,
      endDate: filters.endDate,
      status: filters.status,
    });

    return projects.map(p => ({
      code: p.code,
      name: p.name,
      type: p.projectType,
      status: p.status,
      startDate: p.startDate,
      endDate: p.estimatedEndDate,
    }));
  }

  /**
   * Fetches tasks based on filters.
   */
  private async fetchTasks(filters: ExportFiltersDto): Promise<unknown[]> {
    const tasks = await this.taskRepository.findAll({
      projectId: filters.projectId,
      status: filters.status,
      includeCompleted: filters.includeCompleted,
    });

    return tasks.map(t => ({
      title: t.title,
      status: t.status,
      priority: t.priority,
      assignee: t.assigneeId,
      dueDate: t.dueDate,
      createdAt: t.createdAt,
    }));
  }

  /**
   * Fetches messages based on filters.
   */
  private async fetchMessages(filters: ExportFiltersDto): Promise<unknown[]> {
    if (!filters.projectId) {
      return [];
    }

    const messages = await this.messageRepository.findByProject(filters.projectId);

    return messages.map(m => ({
      sender: m.senderId,
      content: m.content,
      sentAt: m.sentAt,
      isSystem: m.isSystemMessage,
    }));
  }

  /**
   * Fetches files based on filters.
   */
  private async fetchFiles(filters: ExportFiltersDto): Promise<unknown[]> {
    const files = filters.projectId
      ? await this.fileRepository.findByProject(filters.projectId)
      : await this.fileRepository.findAll();

    return files.map(f => ({
      filename: f.filename,
      type: f.fileType,
      size: f.fileSize,
      uploadedBy: f.uploadedById,
      uploadedAt: f.uploadedAt,
    }));
  }

  /**
   * Fetches users based on filters.
   */
  private async fetchUsers(filters: ExportFiltersDto): Promise<unknown[]> {
    const users = await this.userRepository.findAll();

    return users.map(u => ({
      username: u.username,
      email: u.email,
      role: u.role,
      firstName: u.firstName,
      lastName: u.lastName,
      createdAt: u.createdAt,
    }));
  }

  /**
   * Gets column headers for a data type.
   */
  private getHeaders(dataType: ExportDataType): string[] {
    switch (dataType) {
      case ExportDataType.PROJECTS:
        return ['Code', 'Name', 'Type', 'Status', 'Start Date', 'End Date'];
      case ExportDataType.TASKS:
        return ['Title', 'Status', 'Priority', 'Assignee', 'Due Date', 'Created'];
      case ExportDataType.MESSAGES:
        return ['Sender', 'Content', 'Sent At', 'Is System'];
      case ExportDataType.FILES:
        return ['Filename', 'Type', 'Size', 'Uploaded By', 'Uploaded At'];
      case ExportDataType.USERS:
        return ['Username', 'Email', 'Role', 'First Name', 'Last Name', 'Created'];
      default:
        return [];
    }
  }
}
