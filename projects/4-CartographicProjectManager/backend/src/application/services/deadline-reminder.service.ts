/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 2, 2026
 * @file backend/src/application/services/deadline-reminder.service.ts
 * @desc Service for checking and notifying upcoming deadlines
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {PrismaClient, NotificationType} from '@prisma/client';
import { NotificationRepository } from '../../infrastructure/repositories/notification.repository.js';
import { logInfo, logError } from '../../shared/logger.js';

/**
 * Configuration for deadline reminders
 */
export interface DeadlineReminderConfig {
  /**
   * Number of days before deadline to send reminders
   * Default: [7, 3, 1] (7 days, 3 days, 1 day before)
   */
  reminderDays: number[];
}

/**
 * Service for checking upcoming deadlines and sending reminders
 * Scans tasks and projects for approaching deadlines and notifies relevant users
 */
export class DeadlineReminderService {
  private prisma: PrismaClient;
  private notificationRepository: NotificationRepository;
  private config: DeadlineReminderConfig;

  /**
   * Returns local start/end bounds for the provided date.
   *
   * @param date - Date used to compute day bounds
   * @returns Start and end of the local day
   */
  private static getLocalDayBounds(date: Date): {start: Date; end: Date} {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return {start, end};
  }

  /**
   * Checks whether an equivalent notification has already been created today.
   *
   * This provides an idempotency guard when the scheduler reruns.
   *
   * @param now - Current timestamp
   * @param userId - Target user
   * @param type - Notification type
   * @param projectId - Optional project id
   * @param title - Notification title
   * @param message - Notification message
   * @returns True if a matching notification exists for the current day
   */
  private async hasSentToday(
    now: Date,
    userId: string,
    type: NotificationType,
    projectId: string | null,
    title: string,
    message: string,
  ): Promise<boolean> {
    const {start, end} = DeadlineReminderService.getLocalDayBounds(now);

    const existing = await this.prisma.notification.findFirst({
      where: {
        userId,
        type,
        projectId: projectId ?? undefined,
        title,
        message,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {id: true},
    });

    return existing != null;
  }

  /**
   * Creates an instance of DeadlineReminderService
   * @param prisma - Prisma client instance
   * @param notificationRepository - Repository for creating notifications
   * @param config - Configuration for reminder thresholds
   */
  public constructor(
    prisma: PrismaClient,
    notificationRepository: NotificationRepository,
    config?: DeadlineReminderConfig
  ) {
    this.prisma = prisma;
    this.notificationRepository = notificationRepository;
    this.config = config || { reminderDays: [7, 3, 1] };
  }

  /**
   * Check all tasks and projects for upcoming deadlines and send reminders
   * This is the main method called by the scheduler
   */
  public async checkAndNotifyDeadlines(): Promise<void> {
    try {
      logInfo('[DeadlineReminder] Starting deadline check...');
      
      const now = new Date();
      const taskReminders = await this.checkTaskDeadlines(now);
      const projectReminders = await this.checkProjectDeadlines(now);
      
      logInfo(`[DeadlineReminder] Sent ${taskReminders} task reminders and ${projectReminders} project reminders`);
    } catch (error) {
      logError('[DeadlineReminder] Error checking deadlines:', error as Error);
    }
  }

  /**
   * Check tasks for upcoming deadlines
   * @param now - Current timestamp
   * @returns Number of reminders sent
   */
  private async checkTaskDeadlines(now: Date): Promise<number> {
    let remindersSent = 0;

    for (const days of this.config.reminderDays) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + days);
      
      // Set time to start of day for comparison
      const startOfTargetDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfTargetDay = new Date(targetDate.setHours(23, 59, 59, 999));

      // Find tasks due on the target date that are not completed
      const tasks = await this.prisma.task.findMany({
        where: {
          dueDate: {
            gte: startOfTargetDay,
            lte: endOfTargetDay,
          },
          status: {
            not: 'COMPLETED',
          },
        },
        include: {
          project: true,
          assignee: true,
          creator: true,
        },
      });

      for (const task of tasks) {
        const title = `Task due in ${days} day${days > 1 ? 's' : ''}`;

        // Notify the assignee
        const assigneeMessage = `Task "${task.description}" in project "${task.project.name}" is due on ${task.dueDate.toLocaleDateString()}`;
        const shouldSendToAssignee = !(await this.hasSentToday(
          now,
          task.assigneeId,
          NotificationType.TASK_STATUS_CHANGE,
          task.projectId,
          title,
          assigneeMessage,
        ));

        if (shouldSendToAssignee) {
          await this.notificationRepository.create({
            userId: task.assigneeId,
            type: NotificationType.TASK_STATUS_CHANGE,
            title,
            message: assigneeMessage,
            projectId: task.projectId,
          });
          remindersSent += 1;
        }

        // Also notify the creator if different from assignee
        if (task.creatorId !== task.assigneeId) {
          const creatorMessage = `Task "${task.description}" assigned to ${task.assignee.username} is due on ${task.dueDate.toLocaleDateString()}`;
          const shouldSendToCreator = !(await this.hasSentToday(
            now,
            task.creatorId,
            NotificationType.TASK_STATUS_CHANGE,
            task.projectId,
            title,
            creatorMessage,
          ));

          if (shouldSendToCreator) {
            await this.notificationRepository.create({
              userId: task.creatorId,
              type: NotificationType.TASK_STATUS_CHANGE,
              title,
              message: creatorMessage,
              projectId: task.projectId,
            });
            remindersSent += 1;
          }
        }
      }
    }

    return remindersSent;
  }

  /**
   * Check projects for upcoming delivery dates
   * @param now - Current timestamp
   * @returns Number of reminders sent
   */
  private async checkProjectDeadlines(now: Date): Promise<number> {
    let remindersSent = 0;

    for (const days of this.config.reminderDays) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + days);
      
      // Set time to start of day for comparison
      const startOfTargetDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfTargetDay = new Date(targetDate.setHours(23, 59, 59, 999));

      // Find active projects with delivery date on target date
      const projects = await this.prisma.project.findMany({
        where: {
          deliveryDate: {
            gte: startOfTargetDay,
            lte: endOfTargetDay,
          },
          status: {
            in: ['ACTIVE', 'IN_PROGRESS', 'PENDING_REVIEW'],
          },
        },
        include: {
          client: true,
          creator: true,
          specialUsers: {
            include: {
              user: true,
            },
          },
        },
      });

      for (const project of projects) {
        const usersToNotify = new Set<string>();
        
        // Always notify the client
        usersToNotify.add(project.clientId);
        
        // Notify the creator if it's a special user
        if (project.creatorId) {
          usersToNotify.add(project.creatorId);
        }
        
        // Notify all special users with permissions
        for (const su of project.specialUsers) {
          usersToNotify.add(su.userId);
        }

        // Send notifications to all relevant users
        for (const userId of usersToNotify) {
          const title = `Project delivery in ${days} day${days > 1 ? 's' : ''}`;
          const message = `Project "${project.name}" (${project.code}) is due for delivery on ${project.deliveryDate.toLocaleDateString()}`;
          const shouldSend = !(await this.hasSentToday(
            now,
            userId,
            NotificationType.PROJECT_ASSIGNED,
            project.id,
            title,
            message,
          ));

          if (shouldSend) {
            await this.notificationRepository.create({
              userId,
              type: NotificationType.PROJECT_ASSIGNED,
              title,
              message,
              projectId: project.id,
            });
            remindersSent++;
          }
        }
      }
    }

    return remindersSent;
  }

  /**
   * Get statistics about upcoming deadlines
   * Used for dashboard/reporting
   */
  public async getDeadlineStatistics(): Promise<{
    tasksInNext7Days: number;
    tasksInNext3Days: number;
    tasksInNext1Day: number;
    projectsInNext7Days: number;
    projectsInNext3Days: number;
    projectsInNext1Day: number;
  }> {
    const now = new Date();
    
    const getTaskCount = async (days: number): Promise<number> => {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + days);
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + days + 1);
      
      return await this.prisma.task.count({
        where: {
          dueDate: {
            gte: now,
            lt: endDate,
          },
          status: {
            not: 'COMPLETED',
          },
        },
      });
    };

    const getProjectCount = async (days: number): Promise<number> => {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + days);
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + days + 1);
      
      return await this.prisma.project.count({
        where: {
          deliveryDate: {
            gte: now,
            lt: endDate,
          },
          status: {
            in: ['ACTIVE', 'IN_PROGRESS', 'PENDING_REVIEW'],
          },
        },
      });
    };

    const [
      tasksInNext7Days,
      tasksInNext3Days,
      tasksInNext1Day,
      projectsInNext7Days,
      projectsInNext3Days,
      projectsInNext1Day,
    ] = await Promise.all([
      getTaskCount(7),
      getTaskCount(3),
      getTaskCount(1),
      getProjectCount(7),
      getProjectCount(3),
      getProjectCount(1),
    ]);

    return {
      tasksInNext7Days,
      tasksInNext3Days,
      tasksInNext1Day,
      projectsInNext7Days,
      projectsInNext3Days,
      projectsInNext1Day,
    };
  }
}
