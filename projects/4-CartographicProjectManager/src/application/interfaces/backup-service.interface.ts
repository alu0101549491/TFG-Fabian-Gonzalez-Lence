/**
 * @module application/interfaces/backup-service
 * @description Interface for the Backup Service.
 * Defines the contract for system backup and restore operations.
 * @category Application
 */

import {
  type BackupResult,
  type RestoreResult,
  type Backup,
  type Schedule,
} from '../dto/backup-result.dto';

/**
 * Contract for backup and restore operations.
 * Handles manual and scheduled backups, and data restoration.
 */
export interface IBackupService {
  /**
   * Creates a manual system backup.
   * @returns Backup result with metadata about the created backup.
   */
  createBackup(): Promise<BackupResult>;

  /**
   * Restores the system from a specific backup.
   * @param backupId - The ID of the backup to restore from.
   * @returns Restore result indicating success or failure.
   */
  restoreBackup(backupId: string): Promise<RestoreResult>;

  /**
   * Configures an automatic backup schedule.
   * @param schedule - The schedule configuration.
   */
  scheduleAutomaticBackup(schedule: Schedule): Promise<void>;

  /**
   * Retrieves the history of all backups.
   * @returns Array of backup entries, ordered by creation date.
   */
  getBackupHistory(): Promise<Backup[]>;
}
