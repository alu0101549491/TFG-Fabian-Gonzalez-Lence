/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 2, 2026
 * @file backend/src/presentation/controllers/backup.controller.ts
 * @desc Controller for database backup and recovery endpoints
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import { Request, Response } from 'express';
import path from 'path';
import { promises as fs } from 'fs';
import { BackupService } from '../../application/services/backup.service.js';
import {
  loadBackupRuntimeConfig,
  updateBackupRuntimeConfig,
  type BackupRuntimeConfig,
} from '../../infrastructure/scheduler/backup.config.js';
import { startOrUpdateBackupScheduler } from '../../infrastructure/scheduler/backup.scheduler.js';
import { DropboxService } from '../../infrastructure/external-services/dropbox.service.js';

interface BackupDto {
  filename: string;
  size: number;
  created: string;
  age?: string;
  type: 'manual' | 'automatic';
}

interface DropboxStatusDto {
  connected: boolean;
  enabled: boolean;
  lastSyncAt: string | null;
}

/**
 * Controller for handling backup and recovery HTTP requests
 * Provides endpoints for administrators to manage backups
 */
export class BackupController {
  /**
   * Creates an instance of BackupController
   */
  public constructor() {
    // No-op: services are created per-request based on persisted config.
  }

  private async getRuntimeConfig(): Promise<BackupRuntimeConfig> {
    return loadBackupRuntimeConfig();
  }

  private async createBackupService(): Promise<BackupService> {
    const config = await this.getRuntimeConfig();
    return new BackupService({
      backupDir: path.join(process.cwd(), 'backups'),
      retentionDays: config.retentionDays,
      databaseUrl: process.env.DATABASE_URL || '',
    });
  }

  private mapBackupToDto(backup: {
    filename: string;
    size: number;
    created: Date;
    age?: string;
    type: 'manual' | 'automatic';
  }): BackupDto {
    return {
      filename: backup.filename,
      size: backup.size,
      created: backup.created.toISOString(),
      age: backup.age,
      type: backup.type,
    };
  }

  private getDropboxService(): DropboxService | null {
    const token = process.env.DROPBOX_ACCESS_TOKEN;
    if (!token) return null;

    return new DropboxService({
      accessToken: token,
      refreshToken: process.env.DROPBOX_REFRESH_TOKEN,
      appKey: process.env.DROPBOX_APP_KEY,
      appSecret: process.env.DROPBOX_APP_SECRET,
    });
  }

  /**
   * Create a new database backup
   * POST /api/v1/backup/create
   * @param req - HTTP request
   * @param res - HTTP response
   */
  public async createBackup(req: Request, res: Response): Promise<void> {
    try {
      const backupService = await this.createBackupService();
      const backup = await backupService.createBackup('manual');

      res.status(201).json({
        success: true,
        message: 'Backup created successfully',
        data: this.mapBackupToDto(backup),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create backup',
        message: (error as Error).message,
      });
    }
  }

  /**
   * List all available backups
   * GET /api/v1/backup/list
   * @param req - HTTP request
   * @param res - HTTP response
   */
  public async listBackups(req: Request, res: Response): Promise<void> {
    try {
      const backupService = await this.createBackupService();
      const backups = await backupService.listBackups();
      const mapped = backups.map((b) => this.mapBackupToDto(b));

      res.status(200).json({
        success: true,
        data: mapped,
        count: mapped.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to list backups',
        message: (error as Error).message,
      });
    }
  }

  /**
   * Restore database from a backup
   * POST /api/v1/backup/restore
   * @param req - HTTP request with backup filename in body
   * @param res - HTTP response
   */
  public async restoreBackup(req: Request, res: Response): Promise<void> {
    try {
      const { filename } = req.body;

      if (!filename) {
        res.status(400).json({
          success: false,
          error: 'Backup filename is required',
        });
        return;
      }

      const backupService = await this.createBackupService();
      const result = await backupService.restoreBackup(filename);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to restore backup',
        message: (error as Error).message,
      });
    }
  }

  /**
   * Delete a specific backup
   * DELETE /api/v1/backup/:filename
   * @param req - HTTP request with backup filename parameter
   * @param res - HTTP response
   */
  public async deleteBackup(req: Request, res: Response): Promise<void> {
    try {
      const filename = req.params.filename as string;

      const backupService = await this.createBackupService();
      const result = await backupService.deleteBackup(filename);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete backup',
        message: (error as Error).message,
      });
    }
  }

  /**
   * Cleanup old backups based on retention policy
   * POST /api/v1/backup/cleanup
   * @param req - HTTP request
   * @param res - HTTP response
   */
  public async cleanupBackups(req: Request, res: Response): Promise<void> {
    try {
      const backupService = await this.createBackupService();
      const result = await backupService.cleanupOldBackups();

      res.status(200).json({
        success: true,
        message: `Cleanup complete: ${result.deleted} deleted, ${result.retained} retained`,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to cleanup backups',
        message: (error as Error).message,
      });
    }
  }

  /**
   * Get persisted schedule configuration
   * GET /api/v1/backup/schedule
   */
  public async getSchedule(req: Request, res: Response): Promise<void> {
    try {
      const config = await this.getRuntimeConfig();

      res.status(200).json({
        success: true,
        data: {
          frequency: config.frequency,
          time: config.time,
          retentionDays: config.retentionDays,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to load backup schedule configuration',
        message: (error as Error).message,
      });
    }
  }

  /**
   * Update persisted schedule configuration and reschedule the cron job.
   * PUT /api/v1/backup/schedule
   */
  public async updateSchedule(req: Request, res: Response): Promise<void> {
    try {
      const { frequency, time, retentionDays } = req.body as Partial<BackupRuntimeConfig>;
      const updated = await updateBackupRuntimeConfig({
        frequency,
        time,
        retentionDays,
      });

      const databaseUrl = process.env.DATABASE_URL;
      if (databaseUrl) {
        startOrUpdateBackupScheduler(databaseUrl, updated);
      }

      res.status(200).json({
        success: true,
        message: 'Backup schedule configuration updated',
        data: {
          frequency: updated.frequency,
          time: updated.time,
          retentionDays: updated.retentionDays,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update backup schedule configuration',
        message: (error as Error).message,
      });
    }
  }

  /**
   * Download a backup file as an attachment.
   * GET /api/v1/backup/:filename/download
   */
  public async downloadBackup(req: Request, res: Response): Promise<void> {
    try {
      const filename = req.params.filename as string;

      if (!filename || !filename.endsWith('.sql')) {
        res.status(400).json({
          success: false,
          error: 'Invalid backup filename',
        });
        return;
      }

      const backupPath = path.join(process.cwd(), 'backups', filename);
      await fs.access(backupPath);

      res.download(backupPath, filename);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to download backup',
        message: (error as Error).message,
      });
    }
  }

  /**
   * Get Dropbox sync status.
   * GET /api/v1/backup/dropbox/status
   */
  public async getDropboxStatus(req: Request, res: Response): Promise<void> {
    try {
      const config = await this.getRuntimeConfig();
      const dropboxService = this.getDropboxService();
      const connected = dropboxService !== null;

      const dto: DropboxStatusDto = {
        connected,
        enabled: connected && config.dropboxSyncEnabled,
        lastSyncAt: config.lastDropboxSyncAt,
      };

      res.status(200).json({
        success: true,
        data: dto,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to load Dropbox status',
        message: (error as Error).message,
      });
    }
  }

  /**
   * Enable Dropbox sync (server must be configured with Dropbox credentials).
   * POST /api/v1/backup/dropbox/connect
   */
  public async connectDropbox(req: Request, res: Response): Promise<void> {
    try {
      const dropboxService = this.getDropboxService();
      if (!dropboxService) {
        res.status(400).json({
          success: false,
          error: 'Dropbox is not configured on the server',
        });
        return;
      }

      const updated = await updateBackupRuntimeConfig({
        dropboxSyncEnabled: true,
      });

      res.status(200).json({
        success: true,
        message: 'Dropbox sync enabled',
        data: {
          connected: true,
          enabled: updated.dropboxSyncEnabled,
          lastSyncAt: updated.lastDropboxSyncAt,
        } satisfies DropboxStatusDto,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to enable Dropbox sync',
        message: (error as Error).message,
      });
    }
  }

  /**
   * Disable Dropbox sync.
   * POST /api/v1/backup/dropbox/disconnect
   */
  public async disconnectDropbox(req: Request, res: Response): Promise<void> {
    try {
      const updated = await updateBackupRuntimeConfig({
        dropboxSyncEnabled: false,
      });

      const dropboxService = this.getDropboxService();
      const connected = dropboxService !== null;

      res.status(200).json({
        success: true,
        message: 'Dropbox sync disabled',
        data: {
          connected,
          enabled: connected && updated.dropboxSyncEnabled,
          lastSyncAt: updated.lastDropboxSyncAt,
        } satisfies DropboxStatusDto,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to disable Dropbox sync',
        message: (error as Error).message,
      });
    }
  }

  /**
   * Sync local backups to Dropbox.
   * POST /api/v1/backup/dropbox/sync
   */
  public async syncDropbox(req: Request, res: Response): Promise<void> {
    try {
      const dropboxService = this.getDropboxService();
      if (!dropboxService) {
        res.status(400).json({
          success: false,
          error: 'Dropbox is not configured on the server',
        });
        return;
      }

      const config = await this.getRuntimeConfig();
      if (!config.dropboxSyncEnabled) {
        res.status(400).json({
          success: false,
          error: 'Dropbox sync is disabled',
        });
        return;
      }

      const backupService = await this.createBackupService();
      const backups = await backupService.listBackups();

      const targetFolder = '/CPM-Backups';
      await dropboxService.ensureFolder(targetFolder);

      let uploaded = 0;
      for (const backup of backups) {
        const localPath = path.join(process.cwd(), 'backups', backup.filename);
        const content = await fs.readFile(localPath);
        await dropboxService.uploadFile(`${targetFolder}/${backup.filename}`, content);
        uploaded++;
      }

      const nowIso = new Date().toISOString();
      const updated = await updateBackupRuntimeConfig({
        lastDropboxSyncAt: nowIso,
      });

      res.status(200).json({
        success: true,
        message: `Dropbox sync complete (${uploaded} uploaded)`,
        data: {
          uploaded,
          lastSyncAt: updated.lastDropboxSyncAt,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to sync backups to Dropbox',
        message: (error as Error).message,
      });
    }
  }
}
