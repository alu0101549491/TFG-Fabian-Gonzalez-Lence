/**
 * Backup operation result DTO
 */
export interface BackupResult {
  backupId: string;
  timestamp: Date;
  success: boolean;
  message?: string;
  filePath?: string;
}
