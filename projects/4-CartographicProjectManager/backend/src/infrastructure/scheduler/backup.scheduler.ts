/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 2, 2026
 * @file backend/src/infrastructure/scheduler/backup.scheduler.ts
 * @desc Scheduler for automatic database backups
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import cron from 'node-cron';
import path from 'path';
import { BackupService } from '../../application/services/backup.service.js';
import { logInfo, logError } from '../../shared/logger.js';

/**
 * Initialize and start the database backup scheduler
 * Runs daily at 2:00 AM to create backups and cleanup old ones
 */
export function initializeBackupScheduler(): void {
  const backupService = new BackupService({
    backupDir: path.join(process.cwd(), 'backups'),
    retentionDays: 30, // Keep backups for 30 days
    databaseUrl: process.env.DATABASE_URL || '',
  });

  // Schedule: Run every day at 2:00 AM
  // Cron format: minute hour day month weekday
  // '0 2 * * *' = At 02:00 every day
  const schedule = '0 2 * * *';

  logInfo(`[Scheduler] Database backup scheduled to run at 2:00 AM daily`);

  cron.schedule(schedule, async () => {
    try {
      // Create backup
      const backup = await backupService.createBackup();
      logInfo(`[Scheduler] Backup created: ${backup.filename}`);

      // Cleanup old backups
      const cleanup = await backupService.cleanupOldBackups();
      logInfo(`[Scheduler] Cleanup: ${cleanup.deleted} deleted, ${cleanup.retained} retained`);
    } catch (error) {
      logError('[Scheduler] Error in backup job:', error as Error);
    }
  });

  // Run initial backup on startup if enabled
  if (process.env.RUN_BACKUP_ON_STARTUP === 'true') {
    logInfo('[Scheduler] Running initial backup on startup...');
    backupService
      .createBackup()
      .then((backup) => {
        logInfo(`[Scheduler] Startup backup created: ${backup.filename}`);
      })
      .catch((error) => {
        logError('[Scheduler] Error in startup backup:', error as Error);
      });
  }
}
