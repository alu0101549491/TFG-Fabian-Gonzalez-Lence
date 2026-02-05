import {BackupResult} from '../../dtos/BackupResult';

/**
 * Backup service interface
 * Handles system backup and restore
 */
export interface IBackupService {
  /**
   * Creates a system backup
   * @returns Backup result
   */
  createBackup(): Promise<BackupResult>;

  /**
   * Restores from backup
   * @param backupId - Backup ID to restore
   * @returns Restore result
   */
  restoreBackup(backupId: string): Promise<BackupResult>;

  /**
   * Schedules automatic backups
   * @param schedule - Cron schedule expression
   */
  scheduleAutomaticBackup(schedule: string): Promise<void>;

  /**
   * Gets backup history
   * @returns List of past backups
   */
  getBackupHistory(): Promise<BackupResult[]>;
}