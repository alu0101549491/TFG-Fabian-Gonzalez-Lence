/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file backend/src/presentation/controllers/task.controller.ts
 * @desc Task controller
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

import type {Request, Response, NextFunction} from 'express';
import type {AuthenticatedRequest} from '@shared/types.js';
import {TaskStatus, UserRole} from '@prisma/client';
import {TaskRepository} from '@infrastructure/repositories/task.repository.js';
import {ProjectRepository} from '@infrastructure/repositories/project.repository.js';
import {prisma} from '@infrastructure/database/prisma.client.js';
import {emitToProject} from '@infrastructure/websocket/index.js';
import {PermissionRepository} from '@infrastructure/repositories/permission.repository.js';
import {sendSuccess, sendError} from '@shared/utils.js';
import {HTTP_STATUS, ERROR_MESSAGES} from '@shared/constants.js';
import {BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError} from '@shared/errors.js';

export class TaskController {
  private readonly taskRepository: TaskRepository;
  private readonly projectRepository: ProjectRepository;
  private readonly permissionRepository: PermissionRepository;

  public constructor() {
    this.taskRepository = new TaskRepository();
    this.projectRepository = new ProjectRepository();
    this.permissionRepository = new PermissionRepository();
  }

  private async hasSpecialUserRight(userId: string, projectId: string, right: 'EDIT' | 'DELETE'): Promise<boolean> {
    const permission = await this.permissionRepository.findByUserAndProject(userId, projectId);
    return Boolean(permission && permission.rights.includes(right));
  }

  public async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId =
        typeof req.query.projectId === 'string'
          ? req.query.projectId
          : typeof req.params.projectId === 'string'
            ? req.params.projectId
            : undefined;
      const {assigneeId, status} = req.query;
      let tasks;
      if (projectId) tasks = await this.taskRepository.findByProjectId(projectId as string);
      else if (assigneeId) tasks = await this.taskRepository.findByAssigneeId(assigneeId as string);
      else if (status && typeof status === 'string') {
        tasks = await this.taskRepository.findByStatus(status as TaskStatus);
      }
      else tasks = await this.taskRepository.findAll();
      const tasksWithNames = tasks.map(task => ({
        ...task,
        creatorName: task.creator.username,
        assigneeName: task.assignee?.username ?? null,
        fileIds: Array.isArray((task as any).files)
          ? (task as any).files.map((tf: any) => tf.fileId)
          : [],
      }));
      sendSuccess(res, tasksWithNames);
    } catch (error) {
      next(error);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await this.taskRepository.findById(req.params.id as string);
      if (!task) throw new NotFoundError(ERROR_MESSAGES.TASK_NOT_FOUND);
      sendSuccess(res, {
        ...task,
        creatorName: task.creator.username,
        assigneeName: task.assignee?.username ?? null,
        fileIds: task.files?.map((tf) => tf.fileId) ?? [],
      });
    } catch (error) {
      next(error);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;
      
      if (!currentUser) {
        throw new UnauthorizedError('User not authenticated');
      }

      const {projectId, fileIds, ...taskData} = req.body;
      
      // Remove any id field from taskData (backend generates UUID)
      if ('id' in taskData) {
        delete taskData.id;
      }
      
      // Verify user has permission to create tasks in this project
      const project = await this.projectRepository.findById(projectId);
      
      if (!project) {
        throw new NotFoundError(ERROR_MESSAGES.PROJECT_NOT_FOUND);
      }

      const projectData = project as any;
      
      // Allow if:
      // - User is ADMINISTRATOR
      // - User is the project creator
      // - User is the client
      // - User is a SPECIAL_USER with EDIT permission
      const isAdmin = currentUser.role === UserRole.ADMINISTRATOR;
      const isCreator = projectData.creatorId === currentUser.id;
      const isClient = project.clientId === currentUser.id;
      const isSpecialUser = currentUser.role === UserRole.SPECIAL_USER;

      const hasEditPermission = isSpecialUser
        ? await this.hasSpecialUserRight(currentUser.id, projectId, 'EDIT')
        : false;

      if (!isAdmin && !isCreator && !isClient && !(isSpecialUser && hasEditPermission)) {
        throw new ForbiddenError('You do not have permission to create tasks in this project');
      }

      // Validate that task due date is within project date range
      if (taskData.dueDate) {
        const taskDueDate = new Date(taskData.dueDate);
        if (Number.isNaN(taskDueDate.getTime())) {
          throw new BadRequestError('Invalid task due date');
        }
        const projectContractDate = new Date(project.contractDate);
        const projectDeliveryDate = new Date(project.deliveryDate);

        if (taskDueDate < projectContractDate || taskDueDate > projectDeliveryDate) {
          throw new BadRequestError(
            `Task due date must be between project contract date (${projectContractDate.toLocaleDateString()}) and delivery date (${projectDeliveryDate.toLocaleDateString()})`
          );
        }
      }

      // Create task without fileIds (which is not a Prisma field)
      const task = await this.taskRepository.create({projectId, ...taskData});

      const requestedFileIds: string[] = Array.isArray(fileIds)
        ? fileIds.filter((id: unknown): id is string => typeof id === 'string' && id.trim().length > 0)
        : [];

      if (requestedFileIds.length > 0) {
        // Validate files belong to this project.
        const matchingFiles = await prisma.file.findMany({
          where: {
            id: {in: requestedFileIds},
            projectId,
          },
          select: {id: true},
        });

        if (matchingFiles.length !== requestedFileIds.length) {
          throw new BadRequestError('One or more attached files are invalid for this project');
        }

        for (const fileId of requestedFileIds) {
          await this.taskRepository.addFile(task.id, fileId);
        }
      }

      const taskDetails = await this.taskRepository.findById(task.id);
      if (!taskDetails) {
        throw new NotFoundError(ERROR_MESSAGES.TASK_NOT_FOUND);
      }

      const taskWithNames = {
        ...taskDetails,
        creatorName: taskDetails.creator.username,
        assigneeName: taskDetails.assignee?.username ?? null,
        fileIds: taskDetails.files?.map((tf) => tf.fileId) ?? [],
      };

      // Emit real-time event to project participants.
      emitToProject(projectId, 'task:created', taskWithNames);
      sendSuccess(res, taskWithNames, 'Task created successfully', HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;
      
      if (!currentUser) {
        throw new UnauthorizedError('User not authenticated');
      }

      // Get existing task to check for changes
      const existingTask = await this.taskRepository.findById(req.params.id as string);
      if (!existingTask) {
        throw new NotFoundError(ERROR_MESSAGES.TASK_NOT_FOUND);
      }

      // Permission check:
      // - Admin can update
      // - Clients/other roles: creator or assignee can update
      // - Special users: require EDIT permission (or be project creator)
      let canUpdate = currentUser.role === 'ADMINISTRATOR'
        || existingTask.creatorId === currentUser.id
        || existingTask.assigneeId === currentUser.id;

      if (currentUser.role === 'SPECIAL_USER') {
        const project = await this.projectRepository.findById(existingTask.projectId);
        const isProjectCreator = Boolean(project && (project as any).creatorId === currentUser.id);
        const hasEditPermission = await this.hasSpecialUserRight(currentUser.id, existingTask.projectId, 'EDIT');
        canUpdate = canUpdate && (isProjectCreator || hasEditPermission);
      }
      
      if (!canUpdate) {
        sendError(res, 'You do not have permission to update this task', HTTP_STATUS.FORBIDDEN);
        return;
      }
      
      // Extract only fields that can be updated
      const {assigneeId, description, status, priority, dueDate, comments, completedAt, confirmedAt, fileIds} = req.body;

      const previousStatus = existingTask.status;
      
      // If dueDate is being updated, validate it's within project date range
      if (dueDate) {
        const project = await this.projectRepository.findById(existingTask.projectId);
        if (!project) {
          throw new NotFoundError(ERROR_MESSAGES.PROJECT_NOT_FOUND);
        }

        const taskDueDate = new Date(dueDate);
        if (Number.isNaN(taskDueDate.getTime())) {
          throw new BadRequestError('Invalid task due date');
        }
        const projectContractDate = new Date(project.contractDate);
        const projectDeliveryDate = new Date(project.deliveryDate);

        if (taskDueDate < projectContractDate || taskDueDate > projectDeliveryDate) {
          throw new BadRequestError(
            `Task due date must be between project contract date (${projectContractDate.toLocaleDateString()}) and delivery date (${projectDeliveryDate.toLocaleDateString()})`
          );
        }
      }
      
      const taskData = {
        assigneeId,
        description,
        status,
        priority,
        dueDate,
        comments,
        completedAt,
        confirmedAt,
      };
      
      const task = await this.taskRepository.update(req.params.id as string, taskData);

      if (Array.isArray(fileIds)) {
        const requestedFileIds = fileIds.filter(
          (id: unknown): id is string => typeof id === 'string' && id.trim().length > 0,
        );

        const matchingFiles = await prisma.file.findMany({
          where: {
            id: {in: requestedFileIds},
            projectId: existingTask.projectId,
          },
          select: {id: true},
        });

        if (matchingFiles.length !== requestedFileIds.length) {
          throw new BadRequestError('One or more attached files are invalid for this project');
        }

        const existingFileIds = existingTask.files?.map((tf) => tf.fileId) ?? [];
        const requested = new Set(requestedFileIds);
        const existing = new Set(existingFileIds);

        for (const fileId of requestedFileIds) {
          if (!existing.has(fileId)) {
            await this.taskRepository.addFile(existingTask.id, fileId);
          }
        }

        for (const fileId of existingFileIds) {
          if (!requested.has(fileId)) {
            await this.taskRepository.removeFile(existingTask.id, fileId);
          }
        }
      }

      const taskDetails = await this.taskRepository.findById(existingTask.id);
      if (!taskDetails) {
        throw new NotFoundError(ERROR_MESSAGES.TASK_NOT_FOUND);
      }

      // Emit real-time events.
      if (status && status !== previousStatus) {
        emitToProject(existingTask.projectId, 'task:status-changed', {
          taskId: existingTask.id,
          projectId: existingTask.projectId,
          previousStatus,
          newStatus: status,
          changedBy: currentUser.id,
        });
      }

      // Emit a general update event as well (useful for clients that don't handle the specialized status event).
      emitToProject(existingTask.projectId, 'task:updated', {
        ...taskDetails,
        projectId: existingTask.projectId,
        creatorName: taskDetails.creator.username,
        assigneeName: taskDetails.assignee?.username ?? null,
        fileIds: taskDetails.files?.map((tf) => tf.fileId) ?? [],
      });

      sendSuccess(
        res,
        {
          ...taskDetails,
          creatorName: taskDetails.creator.username,
          assigneeName: taskDetails.assignee?.username ?? null,
          fileIds: taskDetails.files?.map((tf) => tf.fileId) ?? [],
        },
        'Task updated successfully',
      );
    } catch (error) {
      next(error);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;
      
      if (!currentUser) {
        throw new UnauthorizedError('User not authenticated');
      }

      // Get existing task to check permissions
      const existingTask = await this.taskRepository.findById(req.params.id as string);
      if (!existingTask) {
        throw new NotFoundError(ERROR_MESSAGES.TASK_NOT_FOUND);
      }

      // Permission check:
      // - Admin can delete
      // - Others: only task creator can delete
      // - Special users: require DELETE permission (or be project creator)
      let canDelete = currentUser.role === 'ADMINISTRATOR'
        || existingTask.creatorId === currentUser.id;

      if (currentUser.role === 'SPECIAL_USER') {
        const project = await this.projectRepository.findById(existingTask.projectId);
        const isProjectCreator = Boolean(project && (project as any).creatorId === currentUser.id);
        const hasDeletePermission = await this.hasSpecialUserRight(currentUser.id, existingTask.projectId, 'DELETE');
        canDelete = canDelete && (isProjectCreator || hasDeletePermission);
      }
      
      if (!canDelete) {
        sendError(res, 'You do not have permission to delete this task', HTTP_STATUS.FORBIDDEN);
        return;
      }

      await this.taskRepository.delete(req.params.id as string);

      emitToProject(existingTask.projectId, 'task:deleted', {
        taskId: existingTask.id,
        projectId: existingTask.projectId,
      });
      sendSuccess(res, null, 'Task deleted successfully', HTTP_STATUS.NO_CONTENT);
    } catch (error) {
      next(error);
    }
  }
}
