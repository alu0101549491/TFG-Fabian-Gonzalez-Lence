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

import cron, { type ScheduledTask } from 'node-cron';
import path from 'path';
import { BackupService } from '../../application/services/backup.service.js';
import { logInfo, logError } from '../../shared/logger.js';
import {
  loadBackupRuntimeConfig,
  type BackupRuntimeConfig,
} from './backup.config.js';

let scheduledTask: ScheduledTask | null = null;

function buildCronExpression(config: BackupRuntimeConfig): string | null {
  if (config.frequency === 'disabled') return null;

  const [hourStr, minuteStr] = config.time.split(':');
  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return '0 2 * * *';
  }

  switch (config.frequency) {
    case 'daily':
      return `${minute} ${hour} * * *`;
    case 'weekly':
      // Sunday (0) by default (UI does not allow selecting day-of-week)
      return `${minute} ${hour} * * 0`;
    case 'monthly':
      // 1st of the month (UI does not allow selecting day-of-month)
      return `${minute} ${hour} 1 * *`;
    default:
      return `${minute} ${hour} * * *`;
  }
}

async function runBackupJob(databaseUrl: string, config: BackupRuntimeConfig): Promise<void> {
  const backupService = new BackupService({
    backupDir: path.join(process.cwd(), 'backups'),
    retentionDays: config.retentionDays,
    databaseUrl,
  });

  // Create backup
  const backup = await backupService.createBackup('automatic');
  logInfo(`[Scheduler] Backup created: ${backup.filename}`);

  // Cleanup old backups
  const cleanup = await backupService.cleanupOldBackups();
  logInfo(
    `[Scheduler] Cleanup: ${cleanup.deleted} deleted, ${cleanup.retained} retained`
  );
}

/**
 * Start or update the scheduled backup task based on the current config.
 */
export function startOrUpdateBackupScheduler(
  databaseUrl: string,
  config: BackupRuntimeConfig
): void {
  const cronExpr = buildCronExpression(config);

  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
  }

  if (!cronExpr) {
    logInfo('[Scheduler] Backup scheduler disabled by configuration');
    return;
  }

  logInfo(`[Scheduler] Database backup scheduled: ${cronExpr}`);

  scheduledTask = cron.schedule(cronExpr, async () => {
    try {
      await runBackupJob(databaseUrl, config);
    } catch (error) {
      logError('[Scheduler] Error in backup job:', error as Error);
    }
  });
}

/**
 * Initialize and start the database backup scheduler
 * Runs daily at 2:00 AM to create backups and cleanup old ones
 */
export function initializeBackupScheduler(): void {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    logError(
      '[Scheduler] Backup scheduler disabled: missing required env var DATABASE_URL'
    );
    return;
  }

  loadBackupRuntimeConfig()
    .then((config) => {
      startOrUpdateBackupScheduler(databaseUrl, config);
    })
    .catch((error) => {
      logError('[Scheduler] Failed to load backup runtime config:', error as Error);
      // Fall back to the historical behavior
      startOrUpdateBackupScheduler(databaseUrl, {
        frequency: 'daily',
        time: '02:00',
        retentionDays: 30,
        dropboxSyncEnabled: false,
        lastDropboxSyncAt: null,
      });
    });

  // Run initial backup on startup if enabled
  if (process.env.RUN_BACKUP_ON_STARTUP === 'true') {
    logInfo('[Scheduler] Running initial backup on startup...');

    loadBackupRuntimeConfig()
      .then(async (config) => {
        try {
          await runBackupJob(databaseUrl, config);
          logInfo('[Scheduler] Startup backup job completed');
        } catch (error) {
          logError('[Scheduler] Error in startup backup:', error as Error);
        }
      })
      .catch((error) => {
        logError('[Scheduler] Error loading config for startup backup:', error as Error);
      });
  }
}
