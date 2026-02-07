/**
 * @module application/dto/task-data
 * @description Data Transfer Object for task creation and update operations.
 * @category Application
 */

import {TaskPriority} from '@domain/enumerations/task-priority';

/**
 * Data required to create or update a task.
 */
export interface TaskData {
  /** ID of the project this task belongs to. */
  projectId: string;
  /** ID of the user this task is assigned to. */
  assigneeId: string;
  /** Description of the task. */
  description: string;
  /** Priority level of the task. */
  priority: TaskPriority;
  /** Due date for the task. */
  dueDate: Date;
}
