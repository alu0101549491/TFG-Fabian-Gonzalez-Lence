/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file application/dto/backup-result.dto.ts
 * @desc Data Transfer Objects for backup and restore operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Backup operation status.
 */
export enum BackupStatus {
  /** Backup is queued */
  PENDING = 'PENDING',
  /** Backup is in progress */
  IN_PROGRESS = 'IN_PROGRESS',
  /** Backup completed successfully */
  COMPLETED = 'COMPLETED',
  /** Backup failed */
  FAILED = 'FAILED',
}

/**
 * Types of backups.
 */
export enum BackupType {
  /** Complete database backup */
  FULL = 'FULL',
  /** Only changes since last backup */
  INCREMENTAL = 'INCREMENTAL',
  /** User-initiated backup */
  MANUAL = 'MANUAL',
  /** Automatically scheduled backup */
  SCHEDULED = 'SCHEDULED',
}

/**
 * Backup error codes for programmatic error handling.
 */
export enum BackupErrorCode {
  /** Insufficient storage space */
  STORAGE_FULL = 'STORAGE_FULL',
  /** Database connection or query error */
  DATABASE_ERROR = 'DATABASE_ERROR',
  /** User doesn't have permission */
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  /** Another backup is already running */
  BACKUP_IN_PROGRESS = 'BACKUP_IN_PROGRESS',
  /** Backup with given ID not found */
  BACKUP_NOT_FOUND = 'BACKUP_NOT_FOUND',
  /** Restore operation failed */
  RESTORE_FAILED = 'RESTORE_FAILED',
  /** Backup file is corrupted or invalid */
  INVALID_BACKUP = 'INVALID_BACKUP',
}

/**
 * Record counts for backup metadata.
 */
export interface BackupRecordCounts {
  /** Number of user records */
  readonly users: number;
  /** Number of project records */
  readonly projects: number;
  /** Number of task records */
  readonly tasks: number;
  /** Number of message records */
  readonly messages: number;
  /** Number of file records */
  readonly files: number;
  /** Number of notification records */
  readonly notifications: number;
}

/**
 * Backup creation result.
 */
export interface BackupResultDto {
  /** Whether backup was successful */
  readonly success: boolean;
  /** Current backup status */
  readonly status: BackupStatus;

  /** Unique backup identifier */
  readonly backupId?: string;
  /** Type of backup performed */
  readonly type: BackupType;
  /** When backup was created */
  readonly timestamp?: Date;
  /** Backup file size in bytes */
  readonly sizeInBytes?: number;
  /** Human-readable file size (e.g., "45.2 MB") */
  readonly humanReadableSize?: string;
  /** Record counts per entity type */
  readonly recordCounts?: BackupRecordCounts;

  /** Error message (if failed) */
  readonly error?: string;
  /** Programmatic error code (if failed) */
  readonly errorCode?: BackupErrorCode;
}

/**
 * Backup metadata for listing backups.
 */
export interface BackupInfoDto {
  /** Unique backup identifier */
  readonly id: string;
  /** Type of backup */
  readonly type: BackupType;
  /** Current status */
  readonly status: BackupStatus;
  /** Creation timestamp */
  readonly timestamp: Date;
  /** File size in bytes */
  readonly sizeInBytes: number;
  /** Human-readable file size */
  readonly humanReadableSize: string;
  /** User who created backup (null for scheduled) */
  readonly createdBy: string | null;
  /** Optional description or notes */
  readonly description?: string;
}

/**
 * Backup list response.
 */
export interface BackupListResponseDto {
  /** Array of available backups */
  readonly backups: BackupInfoDto[];
  /** Total number of backups */
  readonly total: number;
  /** Total storage used by backups (bytes) */
  readonly storageUsed: number;
  /** Maximum storage allowed (bytes) */
  readonly storageLimit: number;
}

/**
 * Request to restore from a backup.
 */
export interface RestoreBackupDto {
  /** ID of the backup to restore from */
  readonly backupId: string;
  /** Safety confirmation (must be true) */
  readonly confirmRestore: boolean;
}

/**
 * Restore operation result.
 */
export interface RestoreResultDto {
  /** Whether restore was successful */
  readonly success: boolean;
  /** Current restore status */
  readonly status: BackupStatus;
  /** Backup ID that was restored */
  readonly backupId: string;
  /** When restore completed */
  readonly restoredAt?: Date;
  /** Records restored per entity type */
  readonly recordsRestored?: BackupRecordCounts;
  /** Error message (if failed) */
  readonly error?: string;
  /** Programmatic error code (if failed) */
  readonly errorCode?: BackupErrorCode;
}

/**
 * Backup schedule frequency.
 */
export type BackupFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

/**
 * Backup schedule configuration.
 */
export interface BackupScheduleDto {
  /** Whether automatic backups are enabled */
  readonly enabled: boolean;
  /** How often to create backups */
  readonly frequency: BackupFrequency;
  /** Time of day in HH:mm format (24-hour) */
  readonly time: string;
  /** Day of week (0-6, Sunday=0) for weekly backups */
  readonly dayOfWeek?: number;
  /** Day of month (1-31) for monthly backups */
  readonly dayOfMonth?: number;
  /** How many days to keep old backups */
  readonly retentionDays: number;
}

/**
 * Storage usage information for backups.
 */
export interface StorageUsageDto {
  /** Used storage in bytes */
  readonly usedBytes: number;
  /** Storage limit in bytes */
  readonly limitBytes: number;
  /** Usage percentage (0-100) */
  readonly usedPercentage: number;
  /** Number of backups stored */
  readonly backupCount: number;
}
