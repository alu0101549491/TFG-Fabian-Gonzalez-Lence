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

import {Task} from '../entities/task';
import {TaskPriority} from '../enumerations/task-priority';
import {TaskStatus} from '../enumerations/task-status';

/** Query parameters for task lookups. */
export interface TaskFindQuery {
  /** Filter tasks by project id. */
  projectId?: string;
  /** Filter tasks by assignee id. */
  assigneeId?: string;
  /** Filter tasks by creator id. */
  creatorId?: string;
  /** Filter tasks by status. */
  status?: TaskStatus;
  /** Filter tasks by priority. */
  priority?: TaskPriority;
  /** If true, return only overdue tasks. */
  overdue?: boolean;
}

/** Query parameters for task counts. */
export type TaskCountQuery = TaskFindQuery;

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
   * Finds tasks matching the provided query.
   *
   * @param query - Query object.
   * @returns Array of tasks matching the criteria (empty if none found).
   * @throws Error if database connection fails.
   */
  find(query: TaskFindQuery): Promise<Task[]>;

  /**
   * Counts tasks matching the provided query.
   *
   * @param query - Query object.
   * @returns The count of tasks matching the criteria.
   * @throws Error if database connection fails.
   */
  count(query: TaskCountQuery): Promise<number>;

  /**
   * Deletes all tasks belonging to a project (cascade delete).
   * @param projectId - The project's unique ID.
   * @throws Error if database operation fails.
   */
  deleteByProjectId(projectId: string): Promise<void>;
}
