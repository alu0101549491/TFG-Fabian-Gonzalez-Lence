import {Task} from '@domain/entities/Task';
import {TaskData} from '../../dtos/TaskData';
import {TaskStatus} from '@domain/enums/TaskStatus';

/**
 * Task service interface
 * Handles task management operations
 */
export interface ITaskService {
  /**
   * Creates a new task
   * @param taskData - Task creation data
   * @returns Created task entity
   */
  createTask(taskData: TaskData): Promise<Task>;

  /**
   * Updates an existing task
   * @param taskId - Task ID
   * @param updates - Task update data
   * @param userId - User making the update
   * @returns Updated task entity
   */
  updateTask(
    taskId: string,
    updates: TaskData,
    userId: string,
  ): Promise<Task>;

  /**
   * Deletes a task
   * @param taskId - Task ID
   * @param userId - User requesting deletion
   */
  deleteTask(taskId: string, userId: string): Promise<void>;

  /**
   * Changes task status
   * @param taskId - Task ID
   * @param newStatus - New status
   * @param userId - User making the change
   */
  changeTaskStatus(
    taskId: string,
    newStatus: TaskStatus,
    userId: string,
  ): Promise<void>;

  /**
   * Attaches file to task
   * @param taskId - Task ID
   * @param fileId - File ID to attach
   */
  attachFileToTask(taskId: string, fileId: string): Promise<void>;

  /**
   * Gets tasks for a project
   * @param projectId - Project ID
   * @returns List of project tasks
   */
  getTasksByProject(projectId: string): Promise<Task[]>;
}