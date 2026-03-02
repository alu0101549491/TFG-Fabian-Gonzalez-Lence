/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 2, 2026
 * @file backend/src/infrastructure/scheduler/deadline-reminder.scheduler.ts
 * @desc Scheduler for automatic deadline reminder checks
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { DeadlineReminderService } from '../../application/services/deadline-reminder.service.js';
import { NotificationRepository } from '../repositories/notification.repository.js';
import { logInfo, logError } from '../../shared/logger.js';

/**
 * Initialize and start the deadline reminder scheduler
 * Runs daily at 9:00 AM to check for upcoming deadlines
 */
export function initializeDeadlineReminder(): void {
  const prisma = new PrismaClient();
  const notificationRepository = new NotificationRepository();
  const deadlineService = new DeadlineReminderService(prisma, notificationRepository, {
    reminderDays: [7, 3, 1], // Remind at 7, 3, and 1 days before deadline
  });

  // Schedule: Run every day at 9:00 AM
  // Cron format: minute hour day month weekday
  // '0 9 * * *' = At 09:00 every day
  const schedule = '0 9 * * *';
  
  logInfo(`[Scheduler] Deadline reminder scheduled to run at 9:00 AM daily`);
  
  cron.schedule(schedule, async () => {
    try {
      await deadlineService.checkAndNotifyDeadlines();
    } catch (error) {
      logError('[Scheduler] Error in deadline reminder job:', error as Error);
    }
  });

  // Also run immediately on startup (optional - for testing)
  if (process.env.RUN_DEADLINE_CHECK_ON_STARTUP === 'true') {
    logInfo('[Scheduler] Running deadline check on startup...');
    deadlineService.checkAndNotifyDeadlines().catch((error) => {
      logError('[Scheduler] Error in startup deadline check:', error as Error);
    });
  }
}
