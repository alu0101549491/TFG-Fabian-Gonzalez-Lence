/**
 * @module domain/repositories/task-repository
 * @description Repository interface for Task entity persistence operations.
 * @category Domain
 */

import {Task} from '../entities/task';

/**
 * Abstraction for Task data access operations.
 * Implemented by infrastructure layer repositories.
 */
export interface ITaskRepository {
  /**
   * Finds a task by its unique identifier.
   * @param id - The task's unique ID.
   * @returns The found task or null if not found.
   */
  findById(id: string): Promise<Task | null>;

  /**
   * Persists a new task to the data store.
   * @param task - The task entity to save.
   * @returns The saved task with any generated fields populated.
   */
  save(task: Task): Promise<Task>;

  /**
   * Updates an existing task in the data store.
   * @param task - The task entity with updated data.
   * @returns The updated task.
   */
  update(task: Task): Promise<Task>;

  /**
   * Deletes a task from the data store.
   * @param id - The ID of the task to delete.
   */
  delete(id: string): Promise<void>;

  /**
   * Finds all tasks belonging to a specific project.
   * @param projectId - The project's unique ID.
   * @returns Array of tasks within the project.
   */
  findByProjectId(projectId: string): Promise<Task[]>;

  /**
   * Finds all tasks assigned to a specific user.
   * @param userId - The assignee's unique ID.
   * @returns Array of tasks assigned to the user.
   */
  findByAssigneeId(userId: string): Promise<Task[]>;
}
