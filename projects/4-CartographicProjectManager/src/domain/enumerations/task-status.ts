/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file domain/enumerations/task-status.ts
 * @desc Enumeration defining the lifecycle states of a task.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Represents the current status of a task within a project.
 *
 * Task Status Flow:
 * PENDING ←→ IN_PROGRESS ←→ PARTIAL
 *    ↓            ↓            ↓
 *    └─────────→ PERFORMED ←───┘
 *                   ↓
 *              COMPLETED (terminal)
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

/**
 * Human-readable display names for task statuses.
 */
export const TaskStatusDisplayName: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: 'Pending',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.PARTIAL]: 'Partial',
  [TaskStatus.PERFORMED]: 'Performed',
  [TaskStatus.COMPLETED]: 'Completed',
};

/**
 * UI color mappings for task statuses.
 */
export const TaskStatusColor: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: 'gray',
  [TaskStatus.IN_PROGRESS]: 'blue',
  [TaskStatus.PARTIAL]: 'orange',
  [TaskStatus.PERFORMED]: 'purple',
  [TaskStatus.COMPLETED]: 'green',
};

/**
 * Defines valid transitions from each task status.
 */
export const TaskStatusTransitions: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.PENDING]: [
    TaskStatus.IN_PROGRESS,
    TaskStatus.PARTIAL,
    TaskStatus.PERFORMED,
  ],
  [TaskStatus.IN_PROGRESS]: [
    TaskStatus.PENDING,
    TaskStatus.PARTIAL,
    TaskStatus.PERFORMED,
  ],
  [TaskStatus.PARTIAL]: [
    TaskStatus.PENDING,
    TaskStatus.IN_PROGRESS,
    TaskStatus.PERFORMED,
  ],
  [TaskStatus.PERFORMED]: [TaskStatus.COMPLETED, TaskStatus.PENDING],
  [TaskStatus.COMPLETED]: [],
};

/**
 * Type guard to check if a value is a valid TaskStatus.
 *
 * @param value - The value to check
 * @returns True if the value is a valid TaskStatus
 */
export function isValidTaskStatus(value: unknown): value is TaskStatus {
  return Object.values(TaskStatus).includes(value as TaskStatus);
}

/**
 * Checks if a transition from one status to another is valid.
 *
 * @param from - The current task status
 * @param to - The target task status
 * @returns True if the transition is allowed
 */
export function isValidTaskStatusTransition(
  from: TaskStatus,
  to: TaskStatus
): boolean {
  return TaskStatusTransitions[from].includes(to);
}

/**
 * Checks if a task status represents a terminal (final) state.
 *
 * @param status - The task status to check
 * @returns True if the status is terminal (no further transitions)
 */
export function isTerminalTaskStatus(status: TaskStatus): boolean {
  return status === TaskStatus.COMPLETED;
}

/**
 * Array of all task statuses for iteration.
 */
export const ALL_TASK_STATUSES = Object.values(TaskStatus);
