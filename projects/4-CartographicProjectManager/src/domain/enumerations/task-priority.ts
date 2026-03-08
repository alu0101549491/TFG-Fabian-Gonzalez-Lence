/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file domain/enumerations/task-priority.ts
 * @desc Enumeration defining the priority levels for tasks.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
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

/**
 * Sort order values for task priorities (lower number = higher priority).
 */
export const TaskPrioritySortOrder: Record<TaskPriority, number> = {
  [TaskPriority.URGENT]: 1,
  [TaskPriority.HIGH]: 2,
  [TaskPriority.MEDIUM]: 3,
  [TaskPriority.LOW]: 4,
};

/**
 * Type guard to check if a value is a valid TaskPriority.
 *
 * @param value - The value to check
 * @returns True if the value is a valid TaskPriority
 */
export function isValidTaskPriority(value: unknown): value is TaskPriority {
  return Object.values(TaskPriority).includes(value as TaskPriority);
}

/**
 * Compares two task priorities for sorting.
 *
 * @param a - First priority
 * @param b - Second priority
 * @returns Negative if a has higher priority, positive if b has higher priority, 0 if equal
 */
export function compareTaskPriority(a: TaskPriority, b: TaskPriority): number {
  return TaskPrioritySortOrder[a] - TaskPrioritySortOrder[b];
}

/**
 * Array of all task priorities for iteration.
 */
export const ALL_TASK_PRIORITIES = Object.values(TaskPriority);

/**
 * Array of task priorities ordered by urgency (most urgent first).
 */
export const TASK_PRIORITIES_BY_URGENCY = [
  TaskPriority.URGENT,
  TaskPriority.HIGH,
  TaskPriority.MEDIUM,
  TaskPriority.LOW,
];
