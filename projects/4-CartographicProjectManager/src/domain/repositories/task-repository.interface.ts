/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file domain/repositories/task-repository.interface.ts
 * @desc Repository interface for Task entity persistence operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Task, TaskPriority, TaskStatus} from '../entities/task';

/**
 * Abstraction for Task data access operations.
 * Implemented by infrastructure layer repositories.
 */
export interface ITaskRepository {
  /**
   * Finds a task by its unique identifier.
   * @param id - The task's unique ID.
   * @returns The found task or null if not found.
   * @throws Error if database connection fails.
   */
  findById(id: string): Promise<Task | null>;

  /**
   * Persists a new task to the data store.
   * @param task - The task entity to save.
   * @returns The saved task with any generated fields populated.
   * @throws Error if database operation fails.
   */
  save(task: Task): Promise<Task>;

  /**
   * Updates an existing task in the data store.
   * @param task - The task entity with updated data.
   * @returns The updated task.
   * @throws Error if task doesn't exist or database operation fails.
   */
  update(task: Task): Promise<Task>;

  /**
   * Deletes a task from the data store.
   * @param id - The ID of the task to delete.
   * @throws Error if task doesn't exist or database operation fails.
   */
  delete(id: string): Promise<void>;

  /**
   * Finds all tasks belonging to a specific project.
   * @param projectId - The project's unique ID.
   * @returns Array of tasks within the project (empty if none found).
   * @throws Error if database connection fails.
   */
  findByProjectId(projectId: string): Promise<Task[]>;

  /**
   * Finds all tasks assigned to a specific user.
   * @param userId - The assignee's unique ID.
   * @returns Array of tasks assigned to the user (empty if none found).
   * @throws Error if database connection fails.
   */
  findByAssigneeId(userId: string): Promise<Task[]>;

  /**
   * Finds all tasks created by a specific user.
   * @param userId - The creator's unique ID.
   * @returns Array of tasks created by the user (empty if none found).
   * @throws Error if database connection fails.
   */
  findByCreatorId(userId: string): Promise<Task[]>;

  /**
   * Finds all tasks in a project with a specific status.
   * @param projectId - The project's unique ID.
   * @param status - The task status to filter by.
   * @returns Array of tasks matching the criteria (empty if none found).
   * @throws Error if database connection fails.
   */
  findByProjectIdAndStatus(
    projectId: string,
    status: TaskStatus,
  ): Promise<Task[]>;

  /**
   * Finds all tasks in a project with a specific priority.
   * @param projectId - The project's unique ID.
   * @param priority - The task priority to filter by.
   * @returns Array of tasks matching the criteria (empty if none found).
   * @throws Error if database connection fails.
   */
  findByProjectIdAndPriority(
    projectId: string,
    priority: TaskPriority,
  ): Promise<Task[]>;

  /**
   * Finds all tasks assigned to a user with a specific status.
   * @param userId - The assignee's unique ID.
   * @param status - The task status to filter by.
   * @returns Array of tasks matching the criteria (empty if none found).
   * @throws Error if database connection fails.
   */
  findByAssigneeIdAndStatus(
    userId: string,
    status: TaskStatus,
  ): Promise<Task[]>;

  /**
   * Finds all overdue tasks across all projects.
   * @returns Array of overdue tasks (empty if none found).
   * @throws Error if database connection fails.
   */
  findOverdue(): Promise<Task[]>;

  /**
   * Finds all overdue tasks in a specific project.
   * @param projectId - The project's unique ID.
   * @returns Array of overdue tasks in the project (empty if none found).
   * @throws Error if database connection fails.
   */
  findOverdueByProjectId(projectId: string): Promise<Task[]>;

  /**
   * Finds all overdue tasks assigned to a specific user.
   * @param userId - The assignee's unique ID.
   * @returns Array of overdue tasks assigned to the user (empty if none found).
   * @throws Error if database connection fails.
   */
  findOverdueByAssigneeId(userId: string): Promise<Task[]>;

  /**
   * Counts the total number of tasks in a project.
   * @param projectId - The project's unique ID.
   * @returns The count of tasks in the project.
   * @throws Error if database connection fails.
   */
  countByProjectId(projectId: string): Promise<number>;

  /**
   * Counts the number of pending tasks in a project.
   * @param projectId - The project's unique ID.
   * @returns The count of pending tasks in the project.
   * @throws Error if database connection fails.
   */
  countPendingByProjectId(projectId: string): Promise<number>;

  /**
   * Counts the total number of tasks assigned to a user.
   * @param userId - The assignee's unique ID.
   * @returns The count of tasks assigned to the user.
   * @throws Error if database connection fails.
   */
  countByAssigneeId(userId: string): Promise<number>;

  /**
   * Counts the number of pending tasks assigned to a user.
   * @param userId - The assignee's unique ID.
   * @returns The count of pending tasks assigned to the user.
   * @throws Error if database connection fails.
   */
  countPendingByAssigneeId(userId: string): Promise<number>;

  /**
   * Deletes all tasks belonging to a project (cascade delete).
   * @param projectId - The project's unique ID.
   * @throws Error if database operation fails.
   */
  deleteByProjectId(projectId: string): Promise<void>;
}
