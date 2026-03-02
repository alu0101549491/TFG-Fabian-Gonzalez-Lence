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
import { BackupService } from '../../application/services/backup.service.js';

/**
 * Controller for handling backup and recovery HTTP requests
 * Provides endpoints for administrators to manage backups
 */
export class BackupController {
  private backupService: BackupService;

  /**
   * Creates an instance of BackupController
   */
  public constructor() {
    this.backupService = new BackupService({
      backupDir: path.join(process.cwd(), 'backups'),
      retentionDays: 30,
      databaseUrl: process.env.DATABASE_URL || '',
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
      const backup = await this.backupService.createBackup();

      res.status(201).json({
        success: true,
        message: 'Backup created successfully',
        data: backup,
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
      const backups = await this.backupService.listBackups();

      res.status(200).json({
        success: true,
        data: backups,
        count: backups.length,
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

      const result = await this.backupService.restoreBackup(filename);

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

      const result = await this.backupService.deleteBackup(filename);

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
      const result = await this.backupService.cleanupOldBackups();

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
}
