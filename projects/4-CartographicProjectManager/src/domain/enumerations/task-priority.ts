/**
 * @module domain/enumerations/task-priority
 * @description Enumeration defining the priority levels for tasks.
 * @category Domain
 */

/**
 * Represents the priority level assigned to a task.
 */
export enum TaskPriority {
  /** Non-critical task with flexible timeline. */
  LOW = 'LOW',
  /** Standard priority task. */
  MEDIUM = 'MEDIUM',
  /** Important task requiring prompt attention. */
  HIGH = 'HIGH',
  /** Critical task requiring immediate action. */
  URGENT = 'URGENT',
}
