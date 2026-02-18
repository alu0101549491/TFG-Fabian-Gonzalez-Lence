/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file src/presentation/controllers/task.controller.ts
 * @desc Task controller
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

import type {Request, Response, NextFunction} from 'express';
import {TaskRepository} from '@infrastructure/repositories/task.repository.js';
import {sendSuccess} from '@shared/utils.js';
import {HTTP_STATUS, ERROR_MESSAGES} from '@shared/constants.js';
import {NotFoundError} from '@shared/errors.js';

export class TaskController {
  private readonly taskRepository: TaskRepository;

  public constructor() {
    this.taskRepository = new TaskRepository();
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
      const task = await this.taskRepository.findById(req.params.id);
      if (!task) throw new NotFoundError(ERROR_MESSAGES.TASK_NOT_FOUND);
      sendSuccess(res, task);
    } catch (error) {
      next(error);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await this.taskRepository.create(req.body);
      sendSuccess(res, task, 'Task created successfully', HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await this.taskRepository.update(req.params.id, req.body);
      sendSuccess(res, task, 'Task updated successfully');
    } catch (error) {
      next(error);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.taskRepository.delete(req.params.id);
      sendSuccess(res, null, 'Task deleted successfully', HTTP_STATUS.NO_CONTENT);
    } catch (error) {
      next(error);
    }
  }
}
