/**
 * @module domain/enumerations/notification-type
 * @description Enumeration defining the types of notifications in the system.
 * @category Domain
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
}
