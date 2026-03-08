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
  ValidationErrorCode,
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
import {NotFoundError, ValidationError, BusinessRuleError, UnauthorizedError} from './common/errors';
import {generateId} from './common/utils';
import {Task} from '../../domain/entities/task';
import {TaskHistory} from '../../domain/entities/task-history';
import {TaskStatus, TaskStatusTransitions} from '../../domain/enumerations/task-status';
import {NotificationType} from '../../domain/enumerations/notification-type';
import {type TaskHistoryAction} from '../../domain/enumerations/task-history-action';

/**
 * Implementation of task management operations.
 */
export class TaskService implements ITaskService {
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
      description: data.description,
      assigneeId: data.assigneeId,
      creatorId,
      status: TaskStatus.PENDING,
      priority: data.priority,
      dueDate: data.dueDate,
      comments: data.comments ?? null,
      fileIds: data.fileIds ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.taskRepository.save(task);

    // Record history
    await this.recordHistory(task.id, creatorId, 'CREATED', null, TaskStatus.PENDING);

    // Notify assignee
    await this.notificationService.sendNotification({
      recipientId: data.assigneeId,
      type: NotificationType.NEW_TASK,
      title: 'Task Assigned',
      message: `You have been assigned a new task: ${task.description}`,
      relatedProjectId: data.projectId,
      relatedTaskId: task.id,
    });

    return this.mapToDto(task, creatorId);
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

    const validation = await this.validateTaskData(data);
    if (!validation.isValid) {
      throw new ValidationError('Invalid task data', validation.errors || []);
    }

    if (data.description !== undefined) task.description = data.description;
    if (data.assigneeId !== undefined) task.assigneeId = data.assigneeId;
    if (data.priority !== undefined) task.priority = data.priority;
    if (data.dueDate !== undefined) task.dueDate = data.dueDate;
    if (data.comments !== undefined) task.comments = data.comments;

    if (data.fileIds !== undefined) {
      const desired = new Set(data.fileIds);
      for (const existingId of task.fileIds) {
        if (!desired.has(existingId)) {
          task.removeFile(existingId);
        }
      }
      for (const nextId of desired) {
        if (!task.fileIds.includes(nextId)) {
          task.attachFile(nextId);
        }
      }
    }

    await this.taskRepository.update(task);

    // Record history
    await this.recordHistory(task.id, userId, 'UPDATED', null, null);

    return this.mapToDto(task, userId);
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
    await this.recordHistory(taskId, userId, 'DELETED', task.status, null);
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

    return this.mapToDto(task, userId);
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

    const allTasks = await this.taskRepository.findByProjectId(projectId);
    const filtered = this.applyFilters(allTasks, filters);
    const {items, page, limit, total, totalPages} = this.paginate(filtered, filters);

    const summaries = await Promise.all(
      items.map((t) => this.mapToSummaryDto(t)),
    );

    return {tasks: summaries, total, page, limit, totalPages};
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

    const allTasks = await this.taskRepository.findByAssigneeId(assigneeId);
    const filtered = this.applyFilters(allTasks, filters);
    const {items, page, limit, total, totalPages} = this.paginate(filtered, filters);
    const summaries = await Promise.all(items.map((t) => this.mapToSummaryDto(t)));
    return {tasks: summaries, total, page, limit, totalPages};
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

    const allTasks = await this.taskRepository.findByCreatorId(creatorId);
    const filtered = this.applyFilters(allTasks, filters);
    const {items, page, limit, total, totalPages} = this.paginate(filtered, filters);
    const summaries = await Promise.all(items.map((t) => this.mapToSummaryDto(t)));
    return {tasks: summaries, total, page, limit, totalPages};
  }

  /**
   * Retrieves all overdue tasks for a user.
   */
  public async getOverdueTasks(userId: string): Promise<TaskSummaryDto[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    const tasks = await this.taskRepository.findOverdueByAssigneeId(userId);
    return Promise.all(tasks.map((t) => this.mapToSummaryDto(t)));
  }

  /**
   * Gets the count of pending (not completed/confirmed) tasks in a project.
   */
  public async getPendingTasksCount(projectId: string): Promise<number> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError(`Project ${projectId} not found`);
    }

    return await this.taskRepository.countPendingByProjectId(projectId);
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

    if (data.newStatus === TaskStatus.COMPLETED) {
      throw new BusinessRuleError('Use confirmTask to complete a task');
    }

    const validTransitions = TaskStatusTransitions[task.status];
    if (!validTransitions.includes(data.newStatus)) {
      throw new BusinessRuleError(
        `Invalid status transition from ${task.status} to ${data.newStatus}`
      );
    }

    const oldStatus = task.status;
    if (data.newStatus === TaskStatus.PERFORMED) {
      task.markAsPerformed(userId);
    } else {
      task.changeStatus(data.newStatus, userId);
    }

    await this.taskRepository.update(task);

    // Record history
    await this.recordHistory(
      task.id,
      userId,
      'STATUS_CHANGED',
      oldStatus,
      data.newStatus
    );

    // Notify relevant parties
    const notifyIds = new Set([task.creatorId, task.assigneeId]);
    notifyIds.delete(userId); // Don't notify the user who made the change

    for (const recipientId of notifyIds) {
      await this.notificationService.sendNotification({
        recipientId,
        type: NotificationType.TASK_STATUS_CHANGE,
        title: 'Task Status Changed',
        message: `Task "${task.description}" status changed to ${data.newStatus}`,
        relatedProjectId: task.projectId,
        relatedTaskId: task.id,
      });
    }

    return this.mapToDto(task, userId);
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

    if (data.confirmed) {
      task.confirm(userId);
    } else {
      task.rejectConfirmation(userId);
    }

    await this.taskRepository.update(task);

    // Record history
    await this.recordHistory(
      task.id,
      userId,
      data.confirmed ? 'CONFIRMED' : 'REJECTED',
      TaskStatus.PERFORMED,
      task.status
    );

    // Notify assignee
    await this.notificationService.sendNotification({
      recipientId: task.assigneeId,
      type: NotificationType.TASK_STATUS_CHANGE,
      title: data.confirmed ? 'Task Confirmed' : 'Task Rejected',
      message: data.confirmed
        ? `Your task "${task.description}" has been confirmed`
        : `Your task "${task.description}" needs revision`,
      relatedProjectId: task.projectId,
      relatedTaskId: task.id,
    });

    return this.mapToDto(task, userId);
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

    const history = await this.taskHistoryRepository.findByTaskId(taskId);

    const usersById = new Map<string, string>();
    await Promise.all(
      [...new Set(history.map((h) => h.userId))].map(async (id) => {
        const u = await this.userRepository.findById(id);
        usersById.set(id, u?.username ?? 'Unknown');
      }),
    );

    return history.map((h) => ({
      id: h.id,
      action: h.action,
      previousValue: h.previousValue,
      newValue: h.newValue,
      userId: h.userId,
      userName: usersById.get(h.userId) ?? 'Unknown',
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

    return TaskStatusTransitions[task.status];
  }

  /**
   * Validates task data before creation or update.
   */
  public async validateTaskData(
    data: CreateTaskDto | UpdateTaskDto
  ): Promise<ValidationResultDto> {
    const errors: Array<ReturnType<typeof createError>> = [];

    if ('description' in data) {
      if (!data.description || data.description.trim().length === 0) {
        errors.push(
          createError(
            'description',
            'Task description is required',
            ValidationErrorCode.REQUIRED,
          ),
        );
      } else if (data.description.length > 1000) {
        errors.push(
          createError(
            'description',
            'Task description must be 1000 characters or less',
            ValidationErrorCode.TOO_LONG,
          ),
        );
      }
    }

    if ('dueDate' in data && data.dueDate && data.dueDate < new Date()) {
      errors.push(
        createError(
          'dueDate',
          'Due date cannot be in the past',
          ValidationErrorCode.DATE_IN_PAST,
        ),
      );
    }

    return errors.length > 0 ? invalidResult(errors) : validResult();
  }

  /**
   * Records a history entry for a task.
   */
  private async recordHistory(
    taskId: string,
    userId: string,
    action: TaskHistoryAction,
    previousValue: TaskStatus | null,
    newValue: TaskStatus | null
  ): Promise<void> {
    const history = new TaskHistory({
      id: generateId(),
      taskId,
      userId,
      action,
      previousValue: previousValue?.toString() ?? null,
      newValue: newValue?.toString() ?? null,
      timestamp: new Date(),
    });

    await this.taskHistoryRepository.save(history);
  }

  /**
   * Maps task entity to DTO.
   */
  private async mapToDto(task: Task, userId: string): Promise<TaskDto> {
    const project = await this.projectRepository.findById(task.projectId);
    if (!project) {
      throw new NotFoundError(`Project ${task.projectId} not found`);
    }

    const [creator, assignee] = await Promise.all([
      this.userRepository.findById(task.creatorId),
      this.userRepository.findById(task.assigneeId),
    ]);

    const files = await Promise.all(
      task.fileIds.map(async (fileId) => {
        const file = await this.fileRepository.findById(fileId);
        if (!file) return null;
        const uploader = await this.userRepository.findById(file.uploadedBy);
        return {
          id: file.id,
          name: file.name,
          type: file.type,
          sizeInBytes: file.sizeInBytes,
          humanReadableSize: file.getHumanReadableSize(),
          uploadedBy: file.uploadedBy,
          uploaderName: uploader?.username ?? 'Unknown',
          uploadedAt: file.uploadedAt,
          downloadUrl: `/api/files/${file.id}/download`,
        };
      }),
    );

    const canModify = await this.authorizationService.canModifyTask(userId, task.id);
    const canDelete = await this.authorizationService.canDeleteTask(userId, task.id);
    const canConfirm = await this.authorizationService.canConfirmTask(userId, task.id);

    const allowedTransitions = TaskStatusTransitions[task.status];
    const transitionChecks = await Promise.all(
      allowedTransitions.map(async (next) => {
        const ok = await this.authorizationService.canChangeTaskStatus(userId, task.id, next);
        return ok ? next : null;
      }),
    );

    const allowedStatusTransitions = transitionChecks.filter(
      (s): s is TaskStatus => s !== null,
    );

    return {
      id: task.id,
      projectId: task.projectId,
      projectCode: project.code,
      projectName: project.name,
      description: task.description,
      creatorId: task.creatorId,
      creatorName: task.creatorName ?? creator?.username ?? 'Unknown',
      assigneeId: task.assigneeId,
      assigneeName: task.assigneeName ?? assignee?.username ?? 'Unknown',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      comments: task.comments,
      fileIds: task.fileIds,
      files: files.filter((f): f is NonNullable<typeof f> => f !== null),
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
      confirmedAt: task.confirmedAt,
      isOverdue: task.isOverdue(),
      canModify,
      canDelete,
      canConfirm,
      canChangeStatus: allowedStatusTransitions.length > 0,
      allowedStatusTransitions,
    };
  }

  private async mapToSummaryDto(task: Task): Promise<TaskSummaryDto> {
    const [creator, assignee] = await Promise.all([
      this.userRepository.findById(task.creatorId),
      this.userRepository.findById(task.assigneeId),
    ]);

    return {
      id: task.id,
      description: task.description,
      assigneeId: task.assigneeId,
      assigneeName: task.assigneeName ?? assignee?.username ?? 'Unknown',
      creatorId: task.creatorId,
      creatorName: task.creatorName ?? creator?.username ?? 'Unknown',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      isOverdue: task.isOverdue(),
      hasAttachments: task.fileIds.length > 0,
      attachmentCount: task.fileIds.length,
      createdAt: task.createdAt,
    };
  }

  private applyFilters(tasks: Task[], filters?: TaskFilterDto): Task[] {
    if (!filters) return tasks;

    return tasks.filter((t) => {
      if (filters.projectId && t.projectId !== filters.projectId) return false;
      if (filters.assigneeId && t.assigneeId !== filters.assigneeId) return false;
      if (filters.creatorId && t.creatorId !== filters.creatorId) return false;
      if (filters.status && t.status !== filters.status) return false;
      if (filters.priority && t.priority !== filters.priority) return false;
      if (filters.isOverdue && !t.isOverdue()) return false;
      if (filters.dueDateFrom && t.dueDate < filters.dueDateFrom) return false;
      if (filters.dueDateTo && t.dueDate > filters.dueDateTo) return false;
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        if (!t.description.toLowerCase().includes(term)) return false;
      }
      return true;
    });
  }

  private paginate(tasks: Task[], filters?: TaskFilterDto): {
    items: Task[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } {
    const total = tasks.length;
    const page = Math.max(1, filters?.page ?? 1);
    const limit = Math.max(1, filters?.limit ?? (total || 1));
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const items = tasks.slice(start, start + limit);
    return {items, page, limit, total, totalPages};
  }
}
