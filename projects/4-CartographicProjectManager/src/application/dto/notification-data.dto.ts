/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file application/dto/notification-data.dto.ts
 * @desc Data Transfer Objects for notification operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {NotificationType} from '../../domain/enumerations/notification-type';

/**
 * Complete notification information.
 */
export interface NotificationDto {
  /** Unique notification identifier */
  readonly id: string;
  /** User ID who receives this notification */
  readonly userId: string;
  /** Notification type */
  readonly type: NotificationType;
  /** Notification title */
  readonly title: string;
  /** Notification message content */
  readonly message: string;
  /** Related entity ID (e.g., projectId, taskId) */
  readonly relatedEntityId: string | null;
  /** Whether notification has been read */
  readonly isRead: boolean;
  /** When notification was created */
  readonly createdAt: Date;
  /** When notification was read */
  readonly readAt: Date | null;
}

/**
 * Filter options for notification queries.
 */
export interface NotificationFilterDto {
  /** Filter by notification type */
  readonly type?: NotificationType;
  /** Filter unread notifications only */
  readonly unreadOnly?: boolean;
  /** Filter by related entity ID */
  readonly relatedEntityId?: string;
  /** Filter by creation date start */
  readonly startDate?: Date;
  /** Filter by creation date end */
  readonly endDate?: Date;
  /** Page number (for pagination) */
  readonly page?: number;
  /** Items per page */
  readonly limit?: number;
}

/**
 * Paginated notification list response.
 */
export interface NotificationListResponseDto {
  /** Array of notifications */
  readonly notifications: NotificationDto[];
  /** Total number of notifications matching filters */
  readonly total: number;
  /** Current page number */
  readonly page: number;
  /** Items per page */
  readonly limit: number;
  /** Total number of pages */
  readonly totalPages: number;
  /** Unread notification count */
  readonly unreadCount: number;
}

/**
 * User notification preferences.
 */
export interface NotificationPreferencesDto {
  /** Whether in-app notifications are enabled */
  readonly inAppEnabled: boolean;
  /** Whether WhatsApp notifications are enabled */
  readonly whatsAppEnabled: boolean;
  /** Notify on new messages */
  readonly notifyNewMessages: boolean;
  /** Notify on received files */
  readonly notifyReceivedFiles: boolean;
  /** Notify on assigned tasks */
  readonly notifyAssignedTasks: boolean;
  /** Notify on task status changes */
  readonly notifyTaskStatusChanges: boolean;
  /** Notify on deadline reminders */
  readonly notifyDeadlineReminders: boolean;
}
