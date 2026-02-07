/**
 * @module domain/enumerations/task-status
 * @description Enumeration defining the lifecycle states of a task.
 * @category Domain
 */

/**
 * Represents the current status of a task within a project.
 */
export enum TaskStatus {
  /** Task has been created but not started. */
  PENDING = 'PENDING',
  /** Task is actively being worked on. */
  IN_PROGRESS = 'IN_PROGRESS',
  /** Task is partially completed. */
  PARTIAL = 'PARTIAL',
  /** Task has been performed and awaits confirmation. */
  PERFORMED = 'PERFORMED',
  /** Task has been confirmed as fully completed. */
  COMPLETED = 'COMPLETED',
}
