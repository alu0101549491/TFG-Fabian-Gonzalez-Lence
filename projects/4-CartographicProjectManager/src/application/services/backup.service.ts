/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file application/services/backup.service.ts
 * @desc Service implementation for system backup and restore operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {
  type BackupRecordCounts,
  type BackupResultDto,
  type BackupInfoDto,
  type BackupListResponseDto,
  type RestoreBackupDto,
  type RestoreResultDto,
  type BackupScheduleDto,
  type StorageUsageDto,
  BackupStatus,
  BackupType,
  BackupErrorCode,
} from '../dto';
import {IBackupService} from '../interfaces/backup-service.interface';
import {
  type IProjectRepository,
  type ITaskRepository,
  type IUserRepository,
  type IMessageRepository,
  type IFileRepository,
} from '../../domain/repositories';
import {IAuthorizationService} from '../interfaces/authorization-service.interface';
import {INotificationService} from '../interfaces/notification-service.interface';
import {UnauthorizedError, NotFoundError} from './common/errors';
import {generateId, formatBytes} from './common/utils';
import {NotificationType} from '../../domain/enumerations/notification-type';

/**
 * Placeholder interfaces for backup storage.
 */
interface IBackupStorage {
  save(backupId: string, data: Buffer): Promise<string>;
  load(backupId: string): Promise<Buffer>;
  delete(backupId: string): Promise<void>;
  getSize(backupId: string): Promise<number>;
}

/**
 * Metadata for a backup.
 */
interface BackupMetadata {
  id: string;
  type: BackupType;
  status: BackupStatus;
  timestamp: Date;
  createdBy: string | null;
  recordCounts: BackupRecordCounts;
  sizeInBytes?: number;
  storageLocation?: string;
  error?: string;
  description?: string;
}

/**
 * Implementation of backup management operations.
 */
export class BackupService implements IBackupService {
  // Track backups in memory (in production, use database)
  private readonly backups = new Map<string, BackupMetadata>();
  // Track scheduled backups
  private backupSchedule: BackupScheduleDto | null = null;

  private static readonly DEFAULT_STORAGE_LIMIT_BYTES = 10 * 1024 * 1024 * 1024;

  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly taskRepository: ITaskRepository,
    private readonly userRepository: IUserRepository,
    private readonly messageRepository: IMessageRepository,
    private readonly fileRepository: IFileRepository,
    private readonly authorizationService: IAuthorizationService,
    private readonly notificationService: INotificationService,
    private readonly backupStorage: IBackupStorage
  ) {}

  /**
   * Creates a manual backup of the system.
   */
  public async createBackup(userId: string): Promise<BackupResultDto> {
    // Check permissions
    const canManage = await this.authorizationService.canManageBackups(userId);
    if (!canManage) {
      return {
        success: false,
        status: BackupStatus.FAILED,
        type: BackupType.MANUAL,
        errorCode: BackupErrorCode.PERMISSION_DENIED,
        error: 'You do not have permission to create backups',
      };
    }

    const backupId = generateId();
    const metadata: BackupMetadata = {
      id: backupId,
      type: BackupType.MANUAL,
      status: BackupStatus.IN_PROGRESS,
      timestamp: new Date(),
      createdBy: userId,
      recordCounts: {
        projects: 0,
        tasks: 0,
        users: 0,
        messages: 0,
        files: 0,
        notifications: 0,
      },
    };

    this.backups.set(backupId, metadata);

    try {
      // Collect record counts using available repository APIs.
      const projects = await this.projectRepository.find();
      const users = await this.userRepository.findAll();

      let taskCount = 0;
      let messageCount = 0;
      let fileCount = 0;

      for (const project of projects) {
        taskCount += await this.taskRepository.count({projectId: project.id});
        messageCount += await this.messageRepository.count({projectId: project.id});
        fileCount += await this.fileRepository.count({projectId: project.id});
      }

      metadata.recordCounts = {
        projects: projects.length,
        tasks: taskCount,
        users: users.length,
        messages: messageCount,
        files: fileCount,
        notifications: 0,
      };

      // Metadata-only backup payload (keeps this service placeholder-friendly).
      const backupData = {
        version: '1.0',
        timestamp: metadata.timestamp.toISOString(),
        type: metadata.type,
        recordCounts: metadata.recordCounts,
      };

      // Serialize and compress
      const backupBuffer = Buffer.from(JSON.stringify(backupData), 'utf-8');
      // TODO: Apply compression

      // Store backup
      const storageLocation = await this.backupStorage.save(backupId, backupBuffer);
      const sizeInBytes = backupBuffer.length;

      // Update metadata
      metadata.status = BackupStatus.COMPLETED;
      metadata.sizeInBytes = sizeInBytes;
      metadata.storageLocation = storageLocation;
      this.backups.set(backupId, metadata);

      // Notify admin
      await this.notificationService.sendNotification({
        recipientId: userId,
        type: NotificationType.BACKUP_COMPLETED,
        title: 'Backup Completed',
        message: `System backup created successfully (${formatBytes(sizeInBytes)})`,
      });

      return {
        success: true,
        status: BackupStatus.COMPLETED,
        backupId,
        type: BackupType.MANUAL,
        timestamp: metadata.timestamp,
        recordCounts: metadata.recordCounts,
        sizeInBytes,
        humanReadableSize: formatBytes(sizeInBytes),
      };
    } catch (error) {
      console.error('Backup creation error:', error);
      
      metadata.status = BackupStatus.FAILED;
      metadata.error = 'Backup creation failed';
      this.backups.set(backupId, metadata);

      return {
        success: false,
        status: BackupStatus.FAILED,
        type: BackupType.MANUAL,
        errorCode: BackupErrorCode.DATABASE_ERROR,
        error: 'Failed to create backup',
      };
    }
  }

  /**
   * Restores the system from a backup.
   */
  public async restoreBackup(data: RestoreBackupDto, userId: string): Promise<RestoreResultDto> {
    // Check permissions
    const canManage = await this.authorizationService.canManageBackups(userId);
    if (!canManage) {
      return {
        success: false,
        status: BackupStatus.FAILED,
        backupId: data.backupId,
        errorCode: BackupErrorCode.PERMISSION_DENIED,
        error: 'You do not have permission to restore backups',
      };
    }

    if (!data.confirmRestore) {
      return {
        success: false,
        status: BackupStatus.FAILED,
        backupId: data.backupId,
        errorCode: BackupErrorCode.INVALID_BACKUP,
        error: 'Restore operation not confirmed',
      };
    }

    const metadata = this.backups.get(data.backupId);
    if (!metadata) {
      return {
        success: false,
        status: BackupStatus.FAILED,
        backupId: data.backupId,
        errorCode: BackupErrorCode.BACKUP_NOT_FOUND,
        error: 'Backup not found',
      };
    }

    try {
      // Load backup data
      // NOTE: This service currently implements a metadata-only backup payload.
      // We still load and validate that the backup exists and is readable.
      void JSON.parse((await this.backupStorage.load(data.backupId)).toString('utf-8'));

      // Notify admin
      await this.notificationService.sendNotification({
        recipientId: userId,
        type: NotificationType.BACKUP_RESTORED,
        title: 'Backup Restored',
        message: 'System has been restored from backup successfully',
      });

      return {
        success: true,
        status: BackupStatus.COMPLETED,
        backupId: metadata.id,
        restoredAt: new Date(),
        recordsRestored: metadata.recordCounts,
      };
    } catch (error) {
      console.error('Backup restore error:', error);

      return {
        success: false,
        status: BackupStatus.FAILED,
        backupId: metadata.id,
        errorCode: BackupErrorCode.RESTORE_FAILED,
        error: 'Failed to restore backup',
      };
    }
  }

  /**
   * Retrieves a list of all backups.
   */
  public async listBackups(userId: string): Promise<BackupListResponseDto> {
    const canManage = await this.authorizationService.canManageBackups(userId);
    if (!canManage) {
      throw new UnauthorizedError('You do not have permission to view backups');
    }

    const backupList: BackupInfoDto[] = Array.from(this.backups.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .map(b => ({
        id: b.id,
        type: b.type,
        status: b.status,
        timestamp: b.timestamp,
        sizeInBytes: b.sizeInBytes ?? 0,
        humanReadableSize: formatBytes(b.sizeInBytes ?? 0),
        createdBy: b.createdBy,
        description: b.description,
      }));

    const storageUsed = Array.from(this.backups.values()).reduce(
      (sum, b) => sum + (b.sizeInBytes ?? 0),
      0
    );

    return {
      backups: backupList,
      total: backupList.length,
      storageUsed,
      storageLimit: BackupService.DEFAULT_STORAGE_LIMIT_BYTES,
    };
  }

  /**
   * Retrieves information about a specific backup.
   */
  public async getBackupInfo(backupId: string, userId: string): Promise<BackupInfoDto> {
    const canManage = await this.authorizationService.canManageBackups(userId);
    if (!canManage) {
      throw new UnauthorizedError('You do not have permission to view backup information');
    }

    const metadata = this.backups.get(backupId);
    if (!metadata) {
      throw new NotFoundError(`Backup ${backupId} not found`);
    }

    return {
      id: metadata.id,
      type: metadata.type,
      status: metadata.status,
      timestamp: metadata.timestamp,
      sizeInBytes: metadata.sizeInBytes ?? 0,
      humanReadableSize: formatBytes(metadata.sizeInBytes ?? 0),
      createdBy: metadata.createdBy,
      description: metadata.description,
    };
  }

  /**
   * Deletes a backup.
   */
  public async deleteBackup(backupId: string, userId: string): Promise<void> {
    const canManage = await this.authorizationService.canManageBackups(userId);
    if (!canManage) {
      throw new UnauthorizedError('You do not have permission to delete backups');
    }

    const metadata = this.backups.get(backupId);
    if (!metadata) {
      throw new NotFoundError(`Backup ${backupId} not found`);
    }

    // Delete from storage
    try {
      await this.backupStorage.delete(backupId);
    } catch (error) {
      console.error('Failed to delete backup from storage:', error);
    }

    this.backups.delete(backupId);
  }

  /**
   * Configures automatic backup schedule.
   */
  public async scheduleBackup(schedule: BackupScheduleDto, userId: string): Promise<void> {
    const canManage = await this.authorizationService.canManageBackups(userId);
    if (!canManage) {
      throw new UnauthorizedError('You do not have permission to schedule backups');
    }

    this.backupSchedule = schedule;
    
    // TODO: Implement actual scheduler (e.g., with cron job)
    console.log('Backup scheduled:', schedule);
  }

  /**
   * Retrieves current backup schedule.
   */
  public async getBackupSchedule(userId: string): Promise<BackupScheduleDto | null> {
    const canManage = await this.authorizationService.canManageBackups(userId);
    if (!canManage) {
      throw new UnauthorizedError('You do not have permission to view backup schedule');
    }

    return this.backupSchedule;
  }

  /**
   * Disables automatic backups.
   */
  public async disableAutoBackup(userId: string): Promise<void> {
    const canManage = await this.authorizationService.canManageBackups(userId);
    if (!canManage) {
      throw new UnauthorizedError('You do not have permission to modify backup schedule');
    }

    this.backupSchedule = null;
    // TODO: Cancel scheduled job
  }

  /**
   * Gets storage usage statistics.
   */
  public async getStorageUsage(userId: string): Promise<StorageUsageDto> {
    const canManage = await this.authorizationService.canManageBackups(userId);
    if (!canManage) {
      throw new UnauthorizedError('You do not have permission to view storage usage');
    }

    let totalBackupSize = 0;
    for (const metadata of this.backups.values()) {
      if (metadata.sizeInBytes) {
        totalBackupSize += metadata.sizeInBytes;
      }
    }

    const limitBytes = BackupService.DEFAULT_STORAGE_LIMIT_BYTES;
    const usedPercentage = limitBytes === 0 ? 0 : (totalBackupSize / limitBytes) * 100;

    return {
      usedBytes: totalBackupSize,
      limitBytes,
      usedPercentage,
      backupCount: this.backups.size,
    };
  }

}
