import {Task} from '../entities/Task';

/**
 * Repository interface for Task entity persistence
 */
export interface ITaskRepository {
  /**
   * Finds a task by ID
   * @param id - Task ID
   * @returns Task entity or null if not found
   */
  findById(id: string): Promise<Task | null>;

  /**
   * Saves a new task
   * @param task - Task entity to save
   * @returns Saved task entity
   */
  save(task: Task): Promise<Task>;

  /**
   * Updates an existing task
   * @param task - Task entity to update
   * @returns Updated task entity
   */
  update(task: Task): Promise<Task>;

  /**
   * Deletes a task by ID
   * @param id - Task ID to delete
   */
  delete(id: string): Promise<void>;

  /**
   * Finds all tasks for a project
   * @param projectId - Project ID
   * @returns List of project tasks
   */
  findByProjectId(projectId: string): Promise<Task[]>;

  /**
   * Finds tasks assigned to a user
   * @param userId - Assignee user ID
   * @returns List of assigned tasks
   */
  findByAssigneeId(userId: string): Promise<Task[]>;
}