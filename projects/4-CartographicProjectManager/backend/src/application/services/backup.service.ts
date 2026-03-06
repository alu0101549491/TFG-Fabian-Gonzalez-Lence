/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 2, 2026
 * @file backend/src/application/services/backup.service.ts
 * @desc Service for database backup and recovery operations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { logInfo, logError } from '../../shared/logger.js';

function runCommand(
  command: string,
  args: string[],
  env: NodeJS.ProcessEnv
): Promise<{stdout: string; stderr: string}> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    child.stdout.on('data', (chunk: Buffer) => stdoutChunks.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => stderrChunks.push(chunk));

    child.on('error', (error) => reject(error));
    child.on('close', (code) => {
      const stdout = Buffer.concat(stdoutChunks).toString('utf8');
      const stderr = Buffer.concat(stderrChunks).toString('utf8');

      if (code !== 0) {
        reject(new Error(`${command} exited with code ${code}: ${stderr || stdout}`));
        return;
      }

      resolve({stdout, stderr});
    });
  });
}

/**
 * Configuration for backup service
 */
export interface BackupConfig {
  /**
   * Directory to store backup files
   */
  backupDir: string;

  /**
   * Number of days to retain backups
   */
  retentionDays: number;

  /**
   * Database connection URL
   */
  databaseUrl: string;
}

/**
 * Service for database backup and recovery operations
 * Uses PostgreSQL pg_dump for creating backups
 */
export class BackupService {
  private config: BackupConfig;

  /**
   * Creates an instance of BackupService
   * @param config - Backup configuration
   */
  public constructor(config: BackupConfig) {
    this.config = config;
  }

  /**
   * Create a database backup
   * @returns Path to the created backup file
   */
  public async createBackup(): Promise<{ filename: string; path: string; size: number }> {
    try {
      // Ensure backup directory exists
      await fs.mkdir(this.config.backupDir, { recursive: true });

      // Generate backup filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup_${timestamp}.sql`;
      const backupPath = path.join(this.config.backupDir, filename);

      // Extract database connection parameters from URL
      const dbUrl = new URL(this.config.databaseUrl);
      const dbHost = dbUrl.hostname;
      const dbPort = dbUrl.port || '5432';
      const dbName = dbUrl.pathname.substring(1).split('?')[0];
      const dbUser = dbUrl.username;
      const dbPassword = dbUrl.password;

      if (!dbName) {
        throw new Error('Invalid database URL: missing database name');
      }
      if (!dbUser) {
        throw new Error('Invalid database URL: missing username');
      }
      if (!dbPassword) {
        throw new Error('Invalid database URL: missing password');
      }

      logInfo(`[Backup] Creating database backup: ${filename}`);

      const { stderr } = await runCommand(
        'pg_dump',
        [
          '-h',
          dbHost,
          '-p',
          dbPort,
          '-U',
          dbUser,
          '-F',
          'c',
          '-b',
          '-v',
          '-f',
          backupPath,
          dbName,
        ],
        {
          ...process.env,
          PGPASSWORD: dbPassword,
        }
      );

      if (stderr && !stderr.includes('pg_dump:')) {
        logError(`[Backup] Backup warnings: ${stderr}`);
      }
      // Get file size
      const stats = await fs.stat(backupPath);

      logInfo(`[Backup] Backup created successfully: ${filename} (${this.formatBytes(stats.size)})`);

      return {
        filename,
        path: backupPath,
        size: stats.size,
      };
    } catch (error) {
      logError('[Backup] Failed to create backup:', error as Error);
      throw new Error(`Backup creation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Restore database from a backup file
   * @param backupFilename - Name of backup file to restore
   * @returns Status message
   */
  public async restoreBackup(backupFilename: string): Promise<{ message: string }> {
    try {
      const backupPath = path.join(this.config.backupDir, backupFilename);

      // Verify backup file exists
      await fs.access(backupPath);

      // Extract database connection parameters
      const dbUrl = new URL(this.config.databaseUrl);
      const dbHost = dbUrl.hostname;
      const dbPort = dbUrl.port || '5432';
      const dbName = dbUrl.pathname.substring(1).split('?')[0];
      const dbUser = dbUrl.username;
      const dbPassword = dbUrl.password;

      if (!dbName) {
        throw new Error('Invalid database URL: missing database name');
      }
      if (!dbUser) {
        throw new Error('Invalid database URL: missing username');
      }
      if (!dbPassword) {
        throw new Error('Invalid database URL: missing password');
      }

      logInfo(`[Backup] Restoring database from: ${backupFilename}`);

      const { stderr } = await runCommand(
        'pg_restore',
        [
          '-h',
          dbHost,
          '-p',
          dbPort,
          '-U',
          dbUser,
          '-d',
          dbName,
          '-c',
          '-v',
          backupPath,
        ],
        {
          ...process.env,
          PGPASSWORD: dbPassword,
        }
      );

      if (stderr && !stderr.includes('pg_restore:')) {
        logError(`[Backup] Restore warnings: ${stderr}`);
      }
      logInfo(`[Backup] Database restored successfully from: ${backupFilename}`);

      return {
        message: `Database restored successfully from ${backupFilename}`,
      };
    } catch (error) {
      logError('[Backup] Failed to restore backup:', error as Error);
      throw new Error(`Backup restoration failed: ${(error as Error).message}`);
    }
  }

  /**
   * List all available backups
   * @returns Array of backup file information
   */
  public async listBackups(): Promise<
    Array<{
      filename: string;
      path: string;
      size: number;
      created: Date;
      age: string;
    }>
  > {
    try {
      // Ensure directory exists
      await fs.mkdir(this.config.backupDir, { recursive: true });

      // Read directory
      const files = await fs.readdir(this.config.backupDir);

      // Filter for .sql files and get stats
      const backups = await Promise.all(
        files
          .filter((file) => file.endsWith('.sql'))
          .map(async (file) => {
            const filePath = path.join(this.config.backupDir, file);
            const stats = await fs.stat(filePath);
            const now = new Date();
            const ageMs = now.getTime() - stats.mtime.getTime();
            const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));

            return {
              filename: file,
              path: filePath,
              size: stats.size,
              created: stats.mtime,
              age: ageDays === 0 ? 'Today' : `${ageDays} day${ageDays > 1 ? 's' : ''} ago`,
            };
          })
      );

      // Sort by creation date (newest first)
      backups.sort((a, b) => b.created.getTime() - a.created.getTime());

      return backups;
    } catch (error) {
      logError('[Backup] Failed to list backups:', error as Error);
      throw new Error(`Failed to list backups: ${(error as Error).message}`);
    }
  }

  /**
   * Clean up old backups based on retention policy
   * @returns Number of backups deleted
   */
  public async cleanupOldBackups(): Promise<{ deleted: number; retained: number }> {
    try {
      const backups = await this.listBackups();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

      let deleted = 0;
      let retained = 0;

      for (const backup of backups) {
        if (backup.created < cutoffDate) {
          await fs.unlink(backup.path);
          logInfo(`[Backup] Deleted old backup: ${backup.filename} (${backup.age})`);
          deleted++;
        } else {
          retained++;
        }
      }

      logInfo(`[Backup] Cleanup complete: ${deleted} deleted, ${retained} retained`);

      return { deleted, retained };
    } catch (error) {
      logError('[Backup] Failed to cleanup old backups:', error as Error);
      throw new Error(`Backup cleanup failed: ${(error as Error).message}`);
    }
  }

  /**
   * Delete a specific backup file
   * @param backupFilename - Name of backup file to delete
   * @returns Confirmation message
   */
  public async deleteBackup(backupFilename: string): Promise<{ message: string }> {
    try {
      const backupPath = path.join(this.config.backupDir, backupFilename);

      // Verify it exists and is a .sql file
      if (!backupFilename.endsWith('.sql')) {
        throw new Error('Invalid backup filename');
      }

      await fs.unlink(backupPath);
      logInfo(`[Backup] Deleted backup: ${backupFilename}`);

      return {
        message: `Backup ${backupFilename} deleted successfully`,
      };
    } catch (error) {
      logError('[Backup] Failed to delete backup:', error as Error);
      throw new Error(`Failed to delete backup: ${(error as Error).message}`);
    }
  }

  /**
   * Format bytes to human-readable string
   * @param bytes - Number of bytes
   * @returns Formatted string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}
