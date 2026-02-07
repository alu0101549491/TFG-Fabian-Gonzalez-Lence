/**
 * @module application/dto/backup-result
 * @description Data Transfer Objects for backup and restore operations.
 * @category Application
 */

/**
 * Represents the result of a backup operation.
 */
export interface BackupResult {
  /** Whether the backup was successful. */
  success: boolean;
  /** Unique identifier for the created backup. */
  backupId?: string;
  /** Timestamp of the backup creation. */
  createdAt?: Date;
  /** Size of the backup in bytes. */
  sizeInBytes?: number;
  /** Error message on failure. */
  errorMessage?: string;
}

/**
 * Represents the result of a restore operation.
 */
export interface RestoreResult {
  /** Whether the restore was successful. */
  success: boolean;
  /** Timestamp of the restore completion. */
  restoredAt?: Date;
  /** Error message on failure. */
  errorMessage?: string;
}

/**
 * Represents a backup entry for listing purposes.
 */
export interface Backup {
  /** Unique identifier. */
  id: string;
  /** Creation timestamp. */
  createdAt: Date;
  /** Size in bytes. */
  sizeInBytes: number;
  /** Description or label. */
  description: string;
}

/**
 * Represents a backup schedule configuration.
 */
export interface Schedule {
  /** Cron expression or interval descriptor. */
  cronExpression: string;
  /** Whether the schedule is active. */
  enabled: boolean;
}
