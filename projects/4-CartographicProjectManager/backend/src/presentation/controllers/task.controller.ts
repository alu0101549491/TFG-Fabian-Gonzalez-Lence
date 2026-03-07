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
import {TaskRepository} from '@infrastructure/repositories/task.repository.js';
import {ProjectRepository} from '@infrastructure/repositories/project.repository.js';
import {sendSuccess, sendError} from '@shared/utils.js';
import {HTTP_STATUS, ERROR_MESSAGES} from '@shared/constants.js';
import {NotFoundError} from '@shared/errors.js';

export class TaskController {
  private readonly taskRepository: TaskRepository;
  private readonly projectRepository: ProjectRepository;

  public constructor() {
    this.taskRepository = new TaskRepository();
    this.projectRepository = new ProjectRepository();
  }

  public async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {projectId, assigneeId, status} = req.query;
      let tasks;
      if (projectId) tasks = await this.taskRepository.findByProjectId(projectId as string);
      else if (assigneeId) tasks = await this.taskRepository.findByAssigneeId(assigneeId as string);
      else if (status) tasks = await this.taskRepository.findByStatus(status as any);
      else tasks = await this.taskRepository.findAll();
      sendSuccess(res, tasks);
    } catch (error) {
      next(error);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await this.taskRepository.findById(req.params.id as string);
      if (!task) throw new NotFoundError(ERROR_MESSAGES.TASK_NOT_FOUND);
      sendSuccess(res, task);
    } catch (error) {
      next(error);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;
      
      if (!currentUser) {
        throw new NotFoundError('User not authenticated');
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
      // - User is a SPECIAL_USER with permissions
      const isAdmin = currentUser.role === 'ADMINISTRATOR';
      const isCreator = projectData.creatorId === currentUser.id;
      const isClient = project.clientId === currentUser.id;
      const isParticipant = projectData.specialUsers?.some((su: any) => su.userId === currentUser.id);
      
      if (!isAdmin && !isCreator && !isClient && !isParticipant) {
        throw new NotFoundError('You do not have permission to create tasks in this project');
      }

      // Validate that task due date is within project date range
      if (taskData.dueDate) {
        const taskDueDate = new Date(taskData.dueDate);
        const projectContractDate = new Date(project.contractDate);
        const projectDeliveryDate = new Date(project.deliveryDate);

        if (taskDueDate < projectContractDate || taskDueDate > projectDeliveryDate) {
          throw new NotFoundError(
            `Task due date must be between project contract date (${projectContractDate.toLocaleDateString()}) and delivery date (${projectDeliveryDate.toLocaleDateString()})`
          );
        }
      }

      // Create task without fileIds (which is not a Prisma field)
      const task = await this.taskRepository.create({projectId, ...taskData});
      sendSuccess(res, task, 'Task created successfully', HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;
      
      if (!currentUser) {
        throw new NotFoundError('User not authenticated');
      }

      // Get existing task to check for changes
      const existingTask = await this.taskRepository.findById(req.params.id as string);
      if (!existingTask) {
        throw new NotFoundError(ERROR_MESSAGES.TASK_NOT_FOUND);
      }

      // Permission check: Admin, task creator, or task assignee can update
      const canUpdate = currentUser.role === 'ADMINISTRATOR' 
        || existingTask.creatorId === currentUser.id 
        || existingTask.assigneeId === currentUser.id;
      
      if (!canUpdate) {
        sendError(res, 'You do not have permission to update this task', HTTP_STATUS.FORBIDDEN);
        return;
      }
      
      // Extract only fields that can be updated (exclude id, createdAt, updatedAt, fileIds, etc.)
      const {assigneeId, description, status, priority, dueDate, comments, completedAt, confirmedAt} = req.body;
      
      // If dueDate is being updated, validate it's within project date range
      if (dueDate) {
        const project = await this.projectRepository.findById(existingTask.projectId);
        if (!project) {
          throw new NotFoundError(ERROR_MESSAGES.PROJECT_NOT_FOUND);
        }

        const taskDueDate = new Date(dueDate);
        const projectContractDate = new Date(project.contractDate);
        const projectDeliveryDate = new Date(project.deliveryDate);

        if (taskDueDate < projectContractDate || taskDueDate > projectDeliveryDate) {
          throw new NotFoundError(
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
      sendSuccess(res, task, 'Task updated successfully');
    } catch (error) {
      next(error);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;
      
      if (!currentUser) {
        throw new NotFoundError('User not authenticated');
      }

      // Get existing task to check permissions
      const existingTask = await this.taskRepository.findById(req.params.id as string);
      if (!existingTask) {
        throw new NotFoundError(ERROR_MESSAGES.TASK_NOT_FOUND);
      }

      // Permission check: Only admin or task creator can delete
      const canDelete = currentUser.role === 'ADMINISTRATOR' 
        || existingTask.creatorId === currentUser.id;
      
      if (!canDelete) {
        sendError(res, 'You do not have permission to delete this task', HTTP_STATUS.FORBIDDEN);
        return;
      }

      await this.taskRepository.delete(req.params.id as string);
      sendSuccess(res, null, 'Task deleted successfully', HTTP_STATUS.NO_CONTENT);
    } catch (error) {
      next(error);
    }
  }
}
