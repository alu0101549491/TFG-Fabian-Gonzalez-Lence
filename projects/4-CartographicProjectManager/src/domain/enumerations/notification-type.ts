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
