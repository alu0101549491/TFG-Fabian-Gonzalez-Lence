/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file domain/enumerations/notification-type.ts
 * @desc Enumeration defining the types of notifications in the system.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Represents the type of event that triggered a notification.
 */
export enum NotificationType {
  /** A new message has been received in a project. */
  NEW_MESSAGE = 'NEW_MESSAGE',
  /** A new task has been created or assigned. */
  NEW_TASK = 'NEW_TASK',
  /** The status of a task has changed. */
  TASK_STATUS_CHANGE = 'TASK_STATUS_CHANGE',
  /** A new file has been received/uploaded. */
  FILE_RECEIVED = 'FILE_RECEIVED',
  /** A project has been assigned to the user. */
  PROJECT_ASSIGNED = 'PROJECT_ASSIGNED',
  /** A project has been finalized. */
  PROJECT_FINALIZED = 'PROJECT_FINALIZED',
  /** A system backup finished successfully. */
  BACKUP_COMPLETED = 'BACKUP_COMPLETED',
  /** The system was restored from a backup successfully. */
  BACKUP_RESTORED = 'BACKUP_RESTORED',
}

/**
 * Human-readable display names for notification types.
 */
export const NotificationTypeDisplayName: Record<NotificationType, string> = {
  [NotificationType.NEW_MESSAGE]: 'New Message',
  [NotificationType.NEW_TASK]: 'New Task',
  [NotificationType.TASK_STATUS_CHANGE]: 'Task Status Changed',
  [NotificationType.FILE_RECEIVED]: 'File Received',
  [NotificationType.PROJECT_ASSIGNED]: 'Project Assigned',
  [NotificationType.PROJECT_FINALIZED]: 'Project Finalized',
  [NotificationType.BACKUP_COMPLETED]: 'Backup Completed',
  [NotificationType.BACKUP_RESTORED]: 'Backup Restored',
};

/**
 * Message templates for notification types.
 * Use placeholders like {projectName}, {taskDescription}, {status}, {fileName}, {projectCode}.
 */
export const NotificationTypeMessageTemplate: Record<NotificationType, string> =
  {
    [NotificationType.NEW_MESSAGE]: 'New message in {projectName}',
    [NotificationType.NEW_TASK]: 'New task: {taskDescription}',
    [NotificationType.TASK_STATUS_CHANGE]:
      "Task '{taskDescription}' changed to {status}",
    [NotificationType.FILE_RECEIVED]: 'New file: {fileName}',
    [NotificationType.PROJECT_ASSIGNED]:
      "You've been assigned to project {projectCode}",
    [NotificationType.PROJECT_FINALIZED]:
      'Project {projectCode} has been finalized',
    [NotificationType.BACKUP_COMPLETED]: 'System backup completed',
    [NotificationType.BACKUP_RESTORED]: 'System restored from backup',
  };

/**
 * Icon identifiers for notification types (for UI rendering).
 */
export const NotificationTypeIcon: Record<NotificationType, string> = {
  [NotificationType.NEW_MESSAGE]: 'message',
  [NotificationType.NEW_TASK]: 'task',
  [NotificationType.TASK_STATUS_CHANGE]: 'update',
  [NotificationType.FILE_RECEIVED]: 'file',
  [NotificationType.PROJECT_ASSIGNED]: 'project',
  [NotificationType.PROJECT_FINALIZED]: 'check',
  [NotificationType.BACKUP_COMPLETED]: 'backup',
  [NotificationType.BACKUP_RESTORED]: 'restore',
};

/**
 * Type guard to check if a value is a valid NotificationType.
 *
 * @param value - The value to check
 * @returns True if the value is a valid NotificationType
 */
export function isValidNotificationType(
  value: unknown
): value is NotificationType {
  return Object.values(NotificationType).includes(value as NotificationType);
}

/**
 * Array of all notification types for iteration.
 */
export const ALL_NOTIFICATION_TYPES = Object.values(NotificationType);
