/**
 * @module application/interfaces/task-service
 * @description Interface for the Task Service.
 * Defines the contract for task lifecycle management within projects.
 * @category Application
 */

import {type Task} from '@domain/entities/task';
import {type TaskStatus} from '@domain/enumerations/task-status';
import {type TaskData} from '../dto/task-data.dto';

/**
 * Contract for task management operations.
 * Handles creation, modification, deletion, and status changes of tasks.
 */
export interface ITaskService {
  /**
   * Creates a new task within a project.
   * @param taskData - Data for the new task.
   * @returns The created task entity.
   */
  createTask(taskData: TaskData): Promise<Task>;

  /**
   * Updates an existing task.
   * @param taskId - The task's unique ID.
   * @param updates - The updated task data.
   * @param userId - The ID of the user performing the update.
   * @returns The updated task entity.
   */
  updateTask(taskId: string, updates: TaskData, userId: string): Promise<Task>;

  /**
   * Deletes a task.
   * @param taskId - The task's unique ID.
   * @param userId - The ID of the user performing the deletion.
   */
  deleteTask(taskId: string, userId: string): Promise<void>;

  /**
   * Changes the status of a task through its lifecycle.
   * @param taskId - The task's unique ID.
   * @param newStatus - The new status to apply.
   * @param userId - The ID of the user performing the change.
   */
  changeTaskStatus(
    taskId: string,
    newStatus: TaskStatus,
    userId: string,
  ): Promise<void>;

  /**
   * Attaches a file to a task.
   * @param taskId - The task's unique ID.
   * @param fileId - The file's unique ID.
   */
  attachFileToTask(taskId: string, fileId: string): Promise<void>;

  /**
   * Retrieves all tasks for a specific project.
   * @param projectId - The project's unique ID.
   * @returns Array of tasks within the project.
   */
  getTasksByProject(projectId: string): Promise<Task[]>;
}
