/**
 * @module application/interfaces/backup-service
 * @description Service interface for system backup and restore operations.
 * @category Application
 */

import {
  type BackupResultDto,
  type RestoreBackupDto,
  type RestoreResultDto,
  type BackupListResponseDto,
  type BackupInfoDto,
  type BackupScheduleDto,
  type StorageUsageDto,
  type ValidationResultDto,
} from '../dto';

/**
 * Service interface for backup and restore operations.
 * Handles manual and scheduled backups, data restoration,
 * backup management, and storage monitoring.
 */
export interface IBackupService {
  /**
   * Creates a manual system backup.
   * @param userId - The unique identifier of the user creating the backup
   * @param description - Optional description for the backup
   * @returns Backup result with metadata about the created backup
   * @throws {UnauthorizedError} If user doesn't have backup permission
   * @throws {StorageError} If backup creation fails
   */
  createBackup(
    userId: string,
    description?: string,
  ): Promise<BackupResultDto>;

  /**
   * Restores the system from a specific backup.
   * @param data - Restore data including backup ID and options
   * @param userId - The unique identifier of the user performing the restore
   * @returns Restore result indicating success or failure with details
   * @throws {NotFoundError} If backup doesn't exist
   * @throws {UnauthorizedError} If user doesn't have restore permission
   * @throws {ValidationError} If backup is corrupted or invalid
   * @throws {StorageError} If restore operation fails
   */
  restoreBackup(
    data: RestoreBackupDto,
    userId: string,
  ): Promise<RestoreResultDto>;

  /**
   * Retrieves the history of all backups.
   * @param userId - The unique identifier of the requesting user
   * @returns Paginated list of backup entries ordered by creation date
   * @throws {UnauthorizedError} If user doesn't have backup permission
   */
  getBackupHistory(userId: string): Promise<BackupListResponseDto>;

  /**
   * Retrieves detailed information about a specific backup.
   * @param backupId - The unique identifier of the backup
   * @param userId - The unique identifier of the requesting user
   * @returns Detailed backup information including size and contents
   * @throws {NotFoundError} If backup doesn't exist
   * @throws {UnauthorizedError} If user doesn't have backup permission
   */
  getBackupById(backupId: string, userId: string): Promise<BackupInfoDto>;

  /**
   * Deletes a specific backup.
   * @param backupId - The unique identifier of the backup
   * @param userId - The unique identifier of the user performing the deletion
   * @returns Promise that resolves when backup is deleted
   * @throws {NotFoundError} If backup doesn't exist
   * @throws {UnauthorizedError} If user doesn't have backup permission
   * @throws {BusinessLogicError} If backup cannot be deleted (e.g., in use)
   */
  deleteBackup(backupId: string, userId: string): Promise<void>;

  /**
   * Configures an automatic backup schedule.
   * @param schedule - The schedule configuration (frequency, time, retention)
   * @param userId - The unique identifier of the user configuring the schedule
   * @returns Promise that resolves when schedule is configured
   * @throws {UnauthorizedError} If user doesn't have backup permission
   * @throws {ValidationError} If schedule configuration is invalid
   */
  scheduleAutomaticBackup(
    schedule: BackupScheduleDto,
    userId: string,
  ): Promise<void>;

  /**
   * Retrieves the current automatic backup schedule.
   * @param userId - The unique identifier of the requesting user
   * @returns Current backup schedule configuration
   * @throws {UnauthorizedError} If user doesn't have backup permission
   * @throws {NotFoundError} If no schedule is configured
   */
  getBackupSchedule(userId: string): Promise<BackupScheduleDto>;

  /**
   * Disables the automatic backup schedule.
   * @param userId - The unique identifier of the user disabling the schedule
   * @returns Promise that resolves when schedule is disabled
   * @throws {UnauthorizedError} If user doesn't have backup permission
   */
  disableAutomaticBackup(userId: string): Promise<void>;

  /**
   * Gets storage usage information for backups.
   * @param userId - The unique identifier of the requesting user
   * @returns Storage usage statistics including size and limits
   * @throws {UnauthorizedError} If user doesn't have backup permission
   */
  getStorageUsage(userId: string): Promise<StorageUsageDto>;

  /**
   * Validates the integrity of a backup file.
   * @param backupId - The unique identifier of the backup to validate
   * @returns Validation result indicating if backup is valid and restorable
   * @throws {NotFoundError} If backup doesn't exist
   * @throws {UnauthorizedError} If user doesn't have backup permission
   */
  validateBackup(backupId: string): Promise<ValidationResultDto>;
}
