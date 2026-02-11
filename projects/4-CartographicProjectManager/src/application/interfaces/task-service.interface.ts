/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file application/interfaces/task-service.interface.ts
 * @desc Service interface for task lifecycle management within projects.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {
  type CreateTaskDto,
  type UpdateTaskDto,
  type TaskDto,
  type TaskFilterDto,
  type TaskListResponseDto,
  type TaskSummaryDto,
  type ChangeTaskStatusDto,
  type ConfirmTaskDto,
  type TaskHistoryEntryDto,
  type ValidationResultDto,
} from '../dto';
import {TaskStatus} from '../../domain/enumerations/task-status';

/**
 * Service interface for task management operations.
 * Handles creation, modification, deletion, status changes,
 * and file attachments for tasks within projects.
 */
export interface ITaskService {
  /**
   * Creates a new task within a project.
   * @param data - Task creation data
   * @param creatorId - The unique identifier of the user creating the task
   * @returns The created task data transfer object
   * @throws {ValidationError} If task data is invalid
   * @throws {NotFoundError} If project or assignee doesn't exist
   * @throws {UnauthorizedError} If creator doesn't have permission
   */
  createTask(data: CreateTaskDto, creatorId: string): Promise<TaskDto>;

  /**
   * Updates an existing task.
   * @param data - Task update data including ID
   * @param userId - The unique identifier of the user performing the update
   * @returns The updated task data transfer object
   * @throws {NotFoundError} If task doesn't exist
   * @throws {UnauthorizedError} If user doesn't have permission
   * @throws {ValidationError} If update data is invalid
   */
  updateTask(data: UpdateTaskDto, userId: string): Promise<TaskDto>;

  /**
   * Deletes a task.
   * @param taskId - The unique identifier of the task
   * @param userId - The unique identifier of the user performing the deletion
   * @returns Promise that resolves when deletion is complete
   * @throws {NotFoundError} If task doesn't exist
   * @throws {UnauthorizedError} If user doesn't have permission
   * @throws {BusinessLogicError} If task cannot be deleted (e.g., confirmed)
   */
  deleteTask(taskId: string, userId: string): Promise<void>;

  /**
   * Retrieves a specific task by its ID.
   * @param taskId - The unique identifier of the task
   * @param userId - The unique identifier of the requesting user
   * @returns The task data transfer object
   * @throws {NotFoundError} If task doesn't exist
   * @throws {UnauthorizedError} If user doesn't have access
   */
  getTaskById(taskId: string, userId: string): Promise<TaskDto>;

  /**
   * Retrieves all tasks for a specific project with optional filtering.
   * @param projectId - The unique identifier of the project
   * @param userId - The unique identifier of the requesting user
   * @param filters - Optional filters for task list
   * @returns Paginated list of tasks
   * @throws {NotFoundError} If project doesn't exist
   * @throws {UnauthorizedError} If user doesn't have access
   */
  getTasksByProject(
    projectId: string,
    userId: string,
    filters?: TaskFilterDto,
  ): Promise<TaskListResponseDto>;

  /**
   * Retrieves all tasks assigned to a specific user with optional filtering.
   * @param assigneeId - The unique identifier of the assignee
   * @param filters - Optional filters for task list
   * @returns Paginated list of assigned tasks
   * @throws {NotFoundError} If assignee doesn't exist
   */
  getTasksByAssignee(
    assigneeId: string,
    filters?: TaskFilterDto,
  ): Promise<TaskListResponseDto>;

  /**
   * Retrieves all tasks created by a specific user with optional filtering.
   * @param creatorId - The unique identifier of the creator
   * @param filters - Optional filters for task list
   * @returns Paginated list of created tasks
   * @throws {NotFoundError} If creator doesn't exist
   */
  getTasksByCreator(
    creatorId: string,
    filters?: TaskFilterDto,
  ): Promise<TaskListResponseDto>;

  /**
   * Retrieves all overdue tasks for a user.
   * @param userId - The unique identifier of the user
   * @returns Array of overdue task summaries
   * @throws {NotFoundError} If user doesn't exist
   */
  getOverdueTasks(userId: string): Promise<TaskSummaryDto[]>;

  /**
   * Gets the count of pending (not completed/confirmed) tasks in a project.
   * @param projectId - The unique identifier of the project
   * @returns The number of pending tasks
   * @throws {NotFoundError} If project doesn't exist
   */
  getPendingTasksCount(projectId: string): Promise<number>;

  /**
   * Changes the status of a task through its lifecycle.
   * @param data - Status change data including task ID and new status
   * @param userId - The unique identifier of the user performing the change
   * @returns The updated task data transfer object
   * @throws {NotFoundError} If task doesn't exist
   * @throws {UnauthorizedError} If user doesn't have permission
   * @throws {BusinessLogicError} If status transition is invalid
   */
  changeTaskStatus(
    data: ChangeTaskStatusDto,
    userId: string,
  ): Promise<TaskDto>;

  /**
   * Confirms task completion by the project client.
   * @param data - Confirmation data including task ID and optional notes
   * @param userId - The unique identifier of the user confirming the task
   * @returns The updated task data transfer object
   * @throws {NotFoundError} If task doesn't exist
   * @throws {UnauthorizedError} If user is not the project client
   * @throws {BusinessLogicError} If task is not in a confirmable state
   */
  confirmTask(data: ConfirmTaskDto, userId: string): Promise<TaskDto>;

  /**
   * Attaches a file to a task.
   * @param taskId - The unique identifier of the task
   * @param fileId - The unique identifier of the file
   * @param userId - The unique identifier of the user performing the attachment
   * @returns Promise that resolves when file is attached
   * @throws {NotFoundError} If task or file doesn't exist
   * @throws {UnauthorizedError} If user doesn't have permission
   * @throws {ConflictError} If file is already attached
   */
  attachFileToTask(
    taskId: string,
    fileId: string,
    userId: string,
  ): Promise<void>;

  /**
   * Removes a file attachment from a task.
   * @param taskId - The unique identifier of the task
   * @param fileId - The unique identifier of the file
   * @param userId - The unique identifier of the user performing the removal
   * @returns Promise that resolves when file is removed
   * @throws {NotFoundError} If task or file doesn't exist
   * @throws {UnauthorizedError} If user doesn't have permission
   */
  removeFileFromTask(
    taskId: string,
    fileId: string,
    userId: string,
  ): Promise<void>;

  /**
   * Retrieves the history of changes for a specific task.
   * @param taskId - The unique identifier of the task
   * @param userId - The unique identifier of the requesting user
   * @returns Array of task history entries
   * @throws {NotFoundError} If task doesn't exist
   * @throws {UnauthorizedError} If user doesn't have access
   */
  getTaskHistory(
    taskId: string,
    userId: string,
  ): Promise<TaskHistoryEntryDto[]>;

  /**
   * Gets the valid status transitions available for a task based on its current state.
   * @param taskId - The unique identifier of the task
   * @param userId - The unique identifier of the requesting user
   * @returns Array of valid target statuses
   * @throws {NotFoundError} If task doesn't exist
   * @throws {UnauthorizedError} If user doesn't have access
   */
  getValidStatusTransitions(
    taskId: string,
    userId: string,
  ): Promise<TaskStatus[]>;

  /**
   * Validates task data before creation or update.
   * @param data - Task data to validate
   * @returns Validation result with any errors or warnings
   */
  validateTaskData(
    data: CreateTaskDto | UpdateTaskDto,
  ): Promise<ValidationResultDto>;
}
