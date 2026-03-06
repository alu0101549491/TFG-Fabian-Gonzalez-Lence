/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file application/services/export.service.ts
 * @desc Service implementation for data export functionality.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {
  type ExportFiltersDto,
  type ExportResultDto,
  type ExportProgressDto,
  type ExportInfoDto,
  type ValidationResultDto,
  ExportFormat,
  ExportDataType,
  ExportStatus,
  ExportErrorCode,
  ValidationErrorCode,
  validResult,
  invalidResult,
  createError,
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
import {ProjectStatus} from '../../domain/enumerations/project-status';

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
  private readonly exportJobs = new Map<
    string,
    {
      progress: ExportProgressDto;
      info: ExportInfoDto;
    }
  >();

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
    const requestedAt = new Date();

    // Check permissions
    const canExport = await this.authorizationService.canExportData(userId);
    if (!canExport) {
      return {
        success: false,
        status: ExportStatus.FAILED,
        errorCode: ExportErrorCode.PERMISSION_DENIED,
        error: 'You do not have permission to export data',
        format: filters.format,
        recordCount: 0,
        requestedAt,
      };
    }

    const exportId = generateId();
    
    try {
      const initialProgress: ExportProgressDto = {
        exportId,
        status: ExportStatus.PROCESSING,
        progress: 0,
        currentStep: 'Fetching data',
      };

      const initialInfo: ExportInfoDto = {
        exportId,
        format: filters.format,
        status: ExportStatus.PROCESSING,
        recordCount: 0,
        fileSize: 0,
        requestedAt,
        completedAt: null,
        downloadUrl: null,
        expiresAt: null,
      };

      this.exportJobs.set(exportId, {progress: initialProgress, info: initialInfo});

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
        case ExportDataType.FULL_REPORT:
          data = await this.fetchFullReport(filters);
          filename = `full_report_export_${Date.now()}`;
          break;
        default:
          return {
            success: false,
            status: ExportStatus.FAILED,
            errorCode: ExportErrorCode.INVALID_FILTERS,
            error: 'Invalid data type',
            format: filters.format,
            recordCount: 0,
            requestedAt,
          };
      }

      {
        const job = this.exportJobs.get(exportId);
        if (job) {
          this.exportJobs.set(exportId, {
            progress: {
              ...job.progress,
              status: ExportStatus.PROCESSING,
              progress: 50,
              currentStep: 'Generating file',
            },
            info: {
              ...job.info,
              status: ExportStatus.PROCESSING,
              recordCount: data.length,
            },
          });
        }
      }

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
            success: false,
            status: ExportStatus.FAILED,
            errorCode: ExportErrorCode.FORMAT_ERROR,
            error: 'Invalid export format',
            format: filters.format,
            recordCount: data.length,
            requestedAt,
          };
      }

      // TODO: Store file (e.g., in Dropbox or temp storage)
      const downloadUrl = `/api/exports/${exportId}/download`;
      const completedAt = new Date();
      const expiresAt = new Date(requestedAt.getTime() + 24 * 60 * 60 * 1000);

      {
        const job = this.exportJobs.get(exportId);
        if (job) {
          this.exportJobs.set(exportId, {
            progress: {
              ...job.progress,
              status: ExportStatus.COMPLETED,
              progress: 100,
              currentStep: 'Completed',
            },
            info: {
              ...job.info,
              status: ExportStatus.COMPLETED,
              recordCount: data.length,
              fileSize: fileContent.length,
              completedAt,
              downloadUrl,
              expiresAt,
            },
          });
        }
      }

      return {
        success: true,
        status: ExportStatus.COMPLETED,
        exportId,
        filename: filename + fileExtension,
        downloadUrl,
        fileSize: fileContent.length,
        format: filters.format,
        recordCount: data.length,
        requestedAt,
        completedAt,
        expiresAt,
      };
    } catch (error) {
      console.error('Export error:', error);

      {
        const job = this.exportJobs.get(exportId);
        if (job) {
          this.exportJobs.set(exportId, {
            progress: {
              ...job.progress,
              status: ExportStatus.FAILED,
              progress: 0,
              currentStep: 'Failed',
            },
            info: {
              ...job.info,
              status: ExportStatus.FAILED,
              completedAt: new Date(),
            },
          });
        }
      }

      return {
        success: false,
        status: ExportStatus.FAILED,
        errorCode: ExportErrorCode.GENERATION_FAILED,
        error: 'Export generation failed',
        format: filters.format,
        recordCount: 0,
        requestedAt,
      };
    }
  }

  /**
   * Gets the status of an ongoing export operation.
   */
  public async getExportProgress(exportId: string, userId: string): Promise<ExportProgressDto> {
    const canExport = await this.authorizationService.canExportData(userId);
    if (!canExport) {
      throw new UnauthorizedError('You do not have permission to view export progress');
    }

    const job = this.exportJobs.get(exportId);
    if (!job) {
      throw new NotFoundError(`Export ${exportId} not found`);
    }

    return job.progress;
  }

  /**
   * Retrieves information about a completed export.
   */
  public async getExportInfo(exportId: string, userId: string): Promise<ExportInfoDto> {
    const canExport = await this.authorizationService.canExportData(userId);
    if (!canExport) {
      throw new UnauthorizedError('You do not have permission to view export information');
    }

    const job = this.exportJobs.get(exportId);
    if (!job) {
      throw new NotFoundError(`Export ${exportId} not found`);
    }

    return job.info;
  }

  /**
   * Lists all available export presets.
   */
  public async getExportPresets(userId: string): Promise<ExportFiltersDto[]> {
    const canExport = await this.authorizationService.canExportData(userId);
    if (!canExport) {
      throw new UnauthorizedError('You do not have permission to access export presets');
    }

    // Return predefined presets
    return [
      {
        dataType: ExportDataType.PROJECTS,
        format: ExportFormat.EXCEL,
        includeFinalized: true,
      },
      {
        dataType: ExportDataType.TASKS,
        format: ExportFormat.CSV,
        includeFinalized: false,
      },
      {
        dataType: ExportDataType.MESSAGES,
        format: ExportFormat.PDF,
      },
    ];
  }

  /**
   * Cancels an ongoing export operation.
   */
  public async cancelExport(exportId: string, userId: string): Promise<void> {
    const canExport = await this.authorizationService.canExportData(userId);
    if (!canExport) {
      throw new UnauthorizedError('You do not have permission to cancel exports');
    }

    const job = this.exportJobs.get(exportId);
    if (!job) {
      throw new NotFoundError(`Export ${exportId} not found`);
    }

    if (job.progress.status === ExportStatus.PROCESSING) {
      this.exportJobs.set(exportId, {
        progress: {
          ...job.progress,
          status: ExportStatus.FAILED,
          progress: 0,
          currentStep: 'Cancelled',
        },
        info: {
          ...job.info,
          status: ExportStatus.FAILED,
          completedAt: new Date(),
        },
      });
    }
  }

  /**
   * Validates export filters.
   */
  async validateExportFilters(
    filters: ExportFiltersDto,
    userId: string
  ): Promise<ValidationResultDto> {
    const errors = [];

    // Keep auth check consistent with other export operations
    const canExport = await this.authorizationService.canExportData(userId);
    if (!canExport) {
      errors.push(
        createError(
          'userId',
          'You do not have permission to export data',
          ValidationErrorCode.PERMISSION_DENIED
        )
      );
    }

    if (!filters.dataType) {
      errors.push(
        createError(
          'dataType',
          'Data type is required',
          ValidationErrorCode.REQUIRED
        )
      );
    }

    if (!filters.format) {
      errors.push(
        createError(
          'format',
          'Export format is required',
          ValidationErrorCode.REQUIRED
        )
      );
    }

    if (
      filters.startDate &&
      filters.endDate &&
      filters.startDate >= filters.endDate
    ) {
      errors.push(
        createError(
          'dateRange',
          'Start date must be before end date',
          ValidationErrorCode.DATE_RANGE_INVALID
        )
      );
    }

    return errors.length > 0 ? invalidResult(errors) : validResult();
  }

  /**
   * Deletes a completed export file.
   */
  public async deleteExport(exportId: string, userId: string): Promise<void> {
    const canExport = await this.authorizationService.canExportData(userId);
    if (!canExport) {
      throw new UnauthorizedError('You do not have permission to delete exports');
    }

    this.exportJobs.delete(exportId);
    // TODO: Delete file from storage
  }

  /**
   * Gets available export formats for a data type.
   */
  public async getAvailableFormats(dataType: ExportDataType, userId: string): Promise<ExportFormat[]> {
    void dataType;
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
    const projects = await this.projectRepository.findAll();

    const filtered = projects.filter((p) => {
      if (filters.projectIds && !filters.projectIds.includes(p.id)) return false;
      if (filters.clientId && p.clientId !== filters.clientId) return false;
      if (filters.projectType && p.type !== filters.projectType) return false;
      if (filters.projectStatus && p.status !== filters.projectStatus) return false;
      if (filters.includeFinalized === false && p.status === ProjectStatus.FINALIZED) return false;
      if (filters.startDate && p.contractDate < filters.startDate) return false;
      if (filters.endDate && p.contractDate > filters.endDate) return false;
      return true;
    });

    return filtered.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      type: p.type,
      status: p.status,
      clientId: p.clientId,
      contractDate: p.contractDate,
      deliveryDate: p.deliveryDate,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  /**
   * Fetches tasks based on filters.
   */
  private async fetchTasks(filters: ExportFiltersDto): Promise<unknown[]> {
    const projectIds = filters.projectIds ?? [];
    if (projectIds.length === 0) {
      return [];
    }

    const tasksByProject = await Promise.all(
      projectIds.map(async (projectId) => ({
        projectId,
        tasks: await this.taskRepository.findByProjectId(projectId),
      })),
    );

    const allTasks = tasksByProject.flatMap(({projectId, tasks}) =>
      tasks.map((t) => ({projectId, task: t})),
    );

    const filtered = allTasks.filter(({task}) => {
      if (filters.taskStatus && task.status !== filters.taskStatus) return false;
      if (filters.taskPriority && task.priority !== filters.taskPriority) return false;
      if (filters.assigneeId && task.assigneeId !== filters.assigneeId) return false;
      if (filters.startDate && task.createdAt < filters.startDate) return false;
      if (filters.endDate && task.createdAt > filters.endDate) return false;
      return true;
    });

    return filtered.map(({projectId, task}) => ({
      projectId,
      id: task.id,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId,
      creatorId: task.creatorId,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }));
  }

  /**
   * Fetches messages based on filters.
   */
  private async fetchMessages(filters: ExportFiltersDto): Promise<unknown[]> {
    const projectIds = filters.projectIds ?? [];
    if (projectIds.length === 0) {
      return [];
    }

    const messagesByProject = await Promise.all(
      projectIds.map(async (projectId) => ({
        projectId,
        messages: await this.messageRepository.findByProjectId(projectId),
      })),
    );

    const allMessages = messagesByProject.flatMap(({projectId, messages}) =>
      messages.map((m) => ({projectId, message: m})),
    );

    const filtered = allMessages.filter(({message}) => {
      if (filters.startDate && message.sentAt < filters.startDate) return false;
      if (filters.endDate && message.sentAt > filters.endDate) return false;
      return true;
    });

    return filtered.map(({projectId, message}) => ({
      projectId,
      id: message.id,
      senderId: message.senderId,
      content: message.content,
      sentAt: message.sentAt,
      isSystemMessage: message.isSystemMessage(),
      type: message.type,
    }));
  }

  private async fetchFullReport(filters: ExportFiltersDto): Promise<unknown[]> {
    const projects = (await this.fetchProjects(filters)) as Array<{id: string; code: string; name: string; clientId: string}>;

    const reports = await Promise.all(
      projects.map(async (p) => {
        const [tasks, messages, files, client] = await Promise.all([
          this.taskRepository.findByProjectId(p.id),
          this.messageRepository.findByProjectId(p.id),
          filters.includeAttachments ? this.fileRepository.findByProjectId(p.id) : Promise.resolve([]),
          this.userRepository.findById(p.clientId),
        ]);

        return {
          project: {
            id: p.id,
            code: p.code,
            name: p.name,
            clientId: p.clientId,
            clientName: client?.username ?? 'Unknown',
          },
          counts: {
            tasks: tasks.length,
            messages: messages.length,
            files: filters.includeAttachments ? files.length : undefined,
          },
          tasks: tasks.map((t) => ({
            id: t.id,
            description: t.description,
            status: t.status,
            priority: t.priority,
            assigneeId: t.assigneeId,
            dueDate: t.dueDate,
          })),
          messages: messages.map((m) => ({
            id: m.id,
            senderId: m.senderId,
            content: m.content,
            sentAt: m.sentAt,
            type: m.type,
          })),
          files: filters.includeAttachments
            ? files.map((f) => ({
                id: f.id,
                name: f.name,
                type: f.type,
                sizeInBytes: f.sizeInBytes,
                dropboxPath: f.dropboxPath,
                uploadedBy: f.uploadedBy,
                uploadedAt: f.uploadedAt,
              }))
            : undefined,
        };
      }),
    );

    return reports;
  }

  /**
   * Gets column headers for a data type.
   */
  private getHeaders(dataType: ExportDataType): string[] {
    switch (dataType) {
      case ExportDataType.PROJECTS:
        return ['ID', 'Code', 'Name', 'Type', 'Status', 'Client ID', 'Contract Date', 'Delivery Date'];
      case ExportDataType.TASKS:
        return ['Project ID', 'ID', 'Description', 'Status', 'Priority', 'Assignee', 'Due Date', 'Created'];
      case ExportDataType.MESSAGES:
        return ['Project ID', 'ID', 'Sender ID', 'Content', 'Sent At', 'Is System', 'Type'];
      case ExportDataType.FULL_REPORT:
        return ['Project', 'Counts', 'Tasks', 'Messages', 'Files'];
      default:
        return [];
    }
  }
}
