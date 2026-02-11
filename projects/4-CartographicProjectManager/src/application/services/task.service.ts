/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file application/services/task.service.ts
 * @desc Service implementation for task lifecycle management within projects.
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
  validResult,
  invalidResult,
  createError,
} from '../dto';
import {ITaskService} from '../interfaces/task-service.interface';
import {
  type ITaskRepository,
  type IProjectRepository,
  type IUserRepository,
  type IFileRepository,
  type ITaskHistoryRepository,
} from '../../domain/repositories';
import {INotificationService} from '../interfaces/notification-service.interface';
import {IAuthorizationService} from '../interfaces/authorization-service.interface';
import {UnauthorizedError, NotFoundError, ValidationError, BusinessRuleError, ConflictError} from './common/errors';
import {generateId} from './common/utils';
import {Task} from '../../domain/entities/task';
import {TaskHistory} from '../../domain/entities/task-history';
import {TaskStatus} from '../../domain/enumerations/task-status';
import {NotificationType} from '../../domain/enumerations/notification-type';

/**
 * Implementation of task management operations.
 */
export class TaskService implements ITaskService {
  // Valid status transitions map
  private readonly statusTransitions = new Map<TaskStatus, TaskStatus[]>([
    [TaskStatus.PENDING, [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED]],
    [TaskStatus.IN_PROGRESS, [TaskStatus.PERFORMED, TaskStatus.PENDING, TaskStatus.CANCELLED]],
    [TaskStatus.PERFORMED, [TaskStatus.COMPLETED, TaskStatus.PENDING]],
    [TaskStatus.COMPLETED, []],  // Cannot transition from completed
    [TaskStatus.CANCELLED, [TaskStatus.PENDING]],
  ]);

  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly userRepository: IUserRepository,
    private readonly fileRepository: IFileRepository,
    private readonly taskHistoryRepository: ITaskHistoryRepository,
    private readonly notificationService: INotificationService,
    private readonly authorizationService: IAuthorizationService
  ) {}

  /**
   * Creates a new task within a project.
   */
  public async createTask(data: CreateTaskDto, creatorId: string): Promise<TaskDto> {
    // Validate
    const validation = await this.validateTaskData(data);
    if (!validation.isValid) {
      throw new ValidationError('Invalid task data', validation.errors || []);
    }

    // Check permissions
    const canCreate = await this.authorizationService.canCreateTaskInProject(creatorId, data.projectId);
    if (!canCreate) {
      throw new UnauthorizedError('You do not have permission to create tasks in this project');
    }

    // Verify project exists
    const project = await this.projectRepository.findById(data.projectId);
    if (!project) {
      throw new NotFoundError(`Project ${data.projectId} not found`);
    }

    // Verify assignee exists and can be assigned
    const assignee = await this.userRepository.findById(data.assigneeId);
    if (!assignee) {
      throw new NotFoundError(`Assignee ${data.assigneeId} not found`);
    }

    const canAssign = await this.authorizationService.canAssignTaskTo(
      creatorId,
      data.projectId,
      data.assigneeId
    );
    if (!canAssign) {
      throw new UnauthorizedError('You cannot assign tasks to this user');
    }

    // Create task entity
    const task = new Task({
      id: generateId(),
      projectId: data.projectId,
      title: data.title,
      description: data.description,
      assigneeId: data.assigneeId,
      creatorId,
      status: TaskStatus.PENDING,
      priority: data.priority,
      dueDate: data.dueDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.taskRepository.save(task);

    // Record history
    await this.recordHistory(task.id, creatorId, 'CREATED', TaskStatus.PENDING, 'Task created');

    // Notify assignee
    await this.notificationService.sendNotification({
      recipientId: data.assigneeId,
      type: NotificationType.TASK_ASSIGNED,
      title: 'Task Assigned',
      message: `You have been assigned task: ${task.title}`,
      relatedProjectId: data.projectId,
      relatedTaskId: task.id,
    });

    return this.mapToDto(task);
  }

  /**
   * Updates an existing task.
   */
  public async updateTask(data: UpdateTaskDto, userId: string): Promise<TaskDto> {
    const canModify = await this.authorizationService.canModifyTask(userId, data.id);
    if (!canModify) {
      throw new UnauthorizedError('You do not have permission to modify this task');
    }

    const task = await this.taskRepository.findById(data.id);
    if (!task) {
      throw new NotFoundError(`Task ${data.id} not found`);
    }

    // Update fields
    if (data.title !== undefined) task.title = data.title;
    if (data.description !== undefined) task.description = data.description;
    if (data.priority !== undefined) task.priority = data.priority;
    if (data.dueDate !== undefined) task.dueDate = data.dueDate;
    
    task.updatedAt = new Date();

    await this.taskRepository.save(task);

    // Record history
    await this.recordHistory(task.id, userId, 'UPDATED', task.status, 'Task updated');

    return this.mapToDto(task);
  }

  /**
   * Deletes a task.
   */
  public async deleteTask(taskId: string, userId: string): Promise<void> {
    const canDelete = await this.authorizationService.canDeleteTask(userId, taskId);
    if (!canDelete) {
      throw new UnauthorizedError('You do not have permission to delete this task');
    }

    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError(`Task ${taskId} not found`);
    }

    if (task.status === TaskStatus.COMPLETED) {
      throw new BusinessRuleError('Cannot delete a completed task');
    }

    await this.taskRepository.delete(taskId);

    // Record history
    await this.recordHistory(taskId, userId, 'DELETED', task.status, 'Task deleted');
  }

  /**
   * Retrieves a specific task by its ID.
   */
  public async getTaskById(taskId: string, userId: string): Promise<TaskDto> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError(`Task ${taskId} not found`);
    }

    const canAccess = await this.authorizationService.canAccessProject(userId, task.projectId);
    if (!canAccess) {
      throw new UnauthorizedError('You do not have permission to access this task');
    }

    return this.mapToDto(task);
  }

  /**
   * Retrieves all tasks for a specific project with optional filtering.
   */
  public async getTasksByProject(
    projectId: string,
    userId: string,
    filters?: TaskFilterDto
  ): Promise<TaskListResponseDto> {
    const canAccess = await this.authorizationService.canAccessProject(userId, projectId);
    if (!canAccess) {
      throw new UnauthorizedError('You do not have permission to access this project');
    }

    const tasks = await this.taskRepository.findByProject(projectId, filters);
    const taskDtos = tasks.map(t => this.mapToDto(t));

    return {
      tasks: taskDtos.map(t => this.mapToSummaryDto(t)),
      total: taskDtos.length,
      page: filters?.page || 1,
      pageSize: filters?.pageSize || taskDtos.length,
    };
  }

  /**
   * Retrieves all tasks assigned to a specific user with optional filtering.
   */
  public async getTasksByAssignee(
    assigneeId: string,
    filters?: TaskFilterDto
  ): Promise<TaskListResponseDto> {
    const assignee = await this.userRepository.findById(assigneeId);
    if (!assignee) {
      throw new NotFoundError(`User ${assigneeId} not found`);
    }

    const tasks = await this.taskRepository.findByAssignee(assigneeId, filters);
    const taskDtos = tasks.map(t => this.mapToDto(t));

    return {
      tasks: taskDtos.map(t => this.mapToSummaryDto(t)),
      total: taskDtos.length,
      page: filters?.page || 1,
      pageSize: filters?.pageSize || taskDtos.length,
    };
  }

  /**
   * Retrieves all tasks created by a specific user with optional filtering.
   */
  public async getTasksByCreator(
    creatorId: string,
    filters?: TaskFilterDto
  ): Promise<TaskListResponseDto> {
    const creator = await this.userRepository.findById(creatorId);
    if (!creator) {
      throw new NotFoundError(`User ${creatorId} not found`);
    }

    const tasks = await this.taskRepository.findByCreator(creatorId, filters);
    const taskDtos = tasks.map(t => this.mapToDto(t));

    return {
      tasks: taskDtos.map(t => this.mapToSummaryDto(t)),
      total: taskDtos.length,
      page: filters?.page || 1,
      pageSize: filters?.pageSize || taskDtos.length,
    };
  }

  /**
   * Retrieves all overdue tasks for a user.
   */
  public async getOverdueTasks(userId: string): Promise<TaskSummaryDto[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    const filters: TaskFilterDto = {
      assigneeId: userId,
      overdue: true,
    };

    const result = await this.getTasksByAssignee(userId, filters);
    return result.tasks;
  }

  /**
   * Gets the count of pending (not completed/confirmed) tasks in a project.
   */
  public async getPendingTasksCount(projectId: string): Promise<number> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError(`Project ${projectId} not found`);
    }

    return await this.taskRepository.countPendingByProject(projectId);
  }

  /**
   * Changes the status of a task through its lifecycle.
   */
  public async changeTaskStatus(data: ChangeTaskStatusDto, userId: string): Promise<TaskDto> {
    const canChange = await this.authorizationService.canChangeTaskStatus(
      userId,
      data.taskId,
      data.newStatus
    );
    if (!canChange) {
      throw new UnauthorizedError('You do not have permission to change this task status');
    }

    const task = await this.taskRepository.findById(data.taskId);
    if (!task) {
      throw new NotFoundError(`Task ${data.taskId} not found`);
    }

    // Validate transition
    const validTransitions = this.statusTransitions.get(task.status) || [];
    if (!validTransitions.includes(data.newStatus)) {
      throw new BusinessRuleError(
        `Invalid status transition from ${task.status} to ${data.newStatus}`
      );
    }

    const oldStatus = task.status;
    task.status = data.newStatus;
    task.updatedAt = new Date();

    await this.taskRepository.save(task);

    // Record history
    await this.recordHistory(
      task.id,
      userId,
      'STATUS_CHANGED',
      data.newStatus,
      data.notes || `Status changed from ${oldStatus} to ${data.newStatus}`
    );

    // Notify relevant parties
    const notifyIds = new Set([task.creatorId, task.assigneeId]);
    notifyIds.delete(userId); // Don't notify the user who made the change

    for (const recipientId of notifyIds) {
      await this.notificationService.sendNotification({
        recipientId,
        type: NotificationType.TASK_STATUS_CHANGED,
        title: 'Task Status Changed',
        message: `Task "${task.title}" status changed to ${data.newStatus}`,
        relatedProjectId: task.projectId,
        relatedTaskId: task.id,
      });
    }

    return this.mapToDto(task);
  }

  /**
   * Confirms task completion by the project client.
   */
  public async confirmTask(data: ConfirmTaskDto, userId: string): Promise<TaskDto> {
    const canConfirm = await this.authorizationService.canConfirmTask(userId, data.taskId);
    if (!canConfirm) {
      throw new UnauthorizedError('Only the project client can confirm tasks');
    }

    const task = await this.taskRepository.findById(data.taskId);
    if (!task) {
      throw new NotFoundError(`Task ${data.taskId} not found`);
    }

    if (task.status !== TaskStatus.PERFORMED) {
      throw new BusinessRuleError('Only tasks in PERFORMED status can be confirmed');
    }

    // Client can accept (COMPLETED) or reject (back to PENDING)
    task.status = data.accepted ? TaskStatus.COMPLETED : TaskStatus.PENDING;
    task.updatedAt = new Date();

    await this.taskRepository.save(task);

    // Record history
    await this.recordHistory(
      task.id,
      userId,
      data.accepted ? 'CONFIRMED' : 'REJECTED',
      task.status,
      data.notes || (data.accepted ? 'Task confirmed' : 'Task rejected')
    );

    // Notify assignee
    await this.notificationService.sendNotification({
      recipientId: task.assigneeId,
      type: data.accepted ? NotificationType.TASK_COMPLETED : NotificationType.TASK_STATUS_CHANGED,
      title: data.accepted ? 'Task Confirmed' : 'Task Rejected',
      message: data.accepted
        ? `Your task "${task.title}" has been confirmed`
        : `Your task "${task.title}" needs revision`,
      relatedProjectId: task.projectId,
      relatedTaskId: task.id,
    });

    return this.mapToDto(task);
  }

  /**
   * Attaches a file to a task.
   */
  public async attachFileToTask(taskId: string, fileId: string, userId: string): Promise<void> {
    const canModify = await this.authorizationService.canModifyTask(userId, taskId);
    if (!canModify) {
      throw new UnauthorizedError('You do not have permission to modify this task');
    }

    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError(`Task ${taskId} not found`);
    }

    const file = await this.fileRepository.findById(fileId);
    if (!file) {
      throw new NotFoundError(`File ${fileId} not found`);
    }

    // Attach file (implementation depends on entity structure)
    // TODO: Implement file-task relationship
    console.log(`File ${fileId} attached to task ${taskId}`);
  }

  /**
   * Removes a file attachment from a task.
   */
  public async removeFileFromTask(taskId: string, fileId: string, userId: string): Promise<void> {
    const canModify = await this.authorizationService.canModifyTask(userId, taskId);
    if (!canModify) {
      throw new UnauthorizedError('You do not have permission to modify this task');
    }

    // Remove file attachment
    // TODO: Implement file-task relationship removal
    console.log(`File ${fileId} removed from task ${taskId}`);
  }

  /**
   * Retrieves the history of changes for a specific task.
   */
  public async getTaskHistory(taskId: string, userId: string): Promise<TaskHistoryEntryDto[]> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError(`Task ${taskId} not found`);
    }

    const canAccess = await this.authorizationService.canAccessProject(userId, task.projectId);
    if (!canAccess) {
      throw new UnauthorizedError('You do not have permission to access this task');
    }

    const history = await this.taskHistoryRepository.findByTask(taskId);
    
    return history.map(h => ({
      id: h.id,
      taskId: h.taskId,
      userId: h.userId,
      action: h.action,
      oldValue: h.oldValue,
      newValue: h.newValue,
      notes: h.notes,
      timestamp: h.timestamp,
    }));
  }

  /**
   * Gets the valid status transitions available for a task based on its current state.
   */
  public async getValidStatusTransitions(taskId: string, userId: string): Promise<TaskStatus[]> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError(`Task ${taskId} not found`);
    }

    const canAccess = await this.authorizationService.canAccessProject(userId, task.projectId);
    if (!canAccess) {
      throw new UnauthorizedError('You do not have permission to access this task');
    }

    return this.statusTransitions.get(task.status) || [];
  }

  /**
   * Validates task data before creation or update.
   */
  public async validateTaskData(
    data: CreateTaskDto | UpdateTaskDto
  ): Promise<ValidationResultDto> {
    const errors = [];

    if ('title' in data && (!data.title || data.title.trim().length === 0)) {
      errors.push(createError('title', 'Task title is required', 'REQUIRED'));
    }

    if ('title' in data && data.title && data.title.length > 200) {
      errors.push(createError('title', 'Task title must be 200 characters or less', 'TOO_LONG'));
    }

    if ('dueDate' in data && data.dueDate && data.dueDate < new Date()) {
      errors.push(createError('dueDate', 'Due date cannot be in the past', 'INVALID_DATE'));
    }

    return errors.length > 0 ? invalidResult(errors) : validResult();
  }

  /**
   * Records a history entry for a task.
   */
  private async recordHistory(
    taskId: string,
    userId: string,
    action: string,
    newValue: TaskStatus,
    notes?: string
  ): Promise<void> {
    const history = new TaskHistory({
      id: generateId(),
      taskId,
      userId,
      action,
      newValue: newValue.toString(),
      notes,
      timestamp: new Date(),
    });

    await this.taskHistoryRepository.save(history);
  }

  /**
   * Maps task entity to DTO.
   */
  private mapToDto(task: Task): TaskDto {
    return {
      id: task.id,
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      assigneeId: task.assigneeId,
      creatorId: task.creatorId,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  /**
   * Maps task to summary DTO.
   */
  private mapToSummaryDto(task: TaskDto): TaskSummaryDto {
    return {
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      assigneeId: task.assigneeId,
    };
  }
}
