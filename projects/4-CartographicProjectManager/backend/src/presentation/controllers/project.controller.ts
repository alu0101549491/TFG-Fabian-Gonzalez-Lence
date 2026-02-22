/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file src/presentation/controllers/project.controller.ts
 * @desc Project controller handling project CRUD operations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {Request, Response, NextFunction} from 'express';
import {ProjectRepository} from '@infrastructure/repositories/project.repository.js';
import {sendSuccess, generateProjectCode} from '@shared/utils.js';
import {HTTP_STATUS, ERROR_MESSAGES} from '@shared/constants.js';
import {NotFoundError} from '@shared/errors.js';

/**
 * Project controller
 */
export class ProjectController {
  private readonly projectRepository: ProjectRepository;

  public constructor() {
    this.projectRepository = new ProjectRepository();
  }

  /**
   * GET /api/v1/projects
   * Get all projects with optional filters
   */
  public async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {status, year, type, clientId, specialUserId} = req.query;

      let projects;
      if (status) {
        projects = await this.projectRepository.findByStatus(status as any);
      } else if (year) {
        projects = await this.projectRepository.findByYear(parseInt(year as string));
      } else if (type) {
        projects = await this.projectRepository.findByType(type as any);
      } else if (clientId) {
        projects = await this.projectRepository.findByClientId(clientId as string);
      } else if (specialUserId) {
        projects = await this.projectRepository.findBySpecialUserId(specialUserId as string);
      } else {
        projects = await this.projectRepository.findAll();
      }

      sendSuccess(res, projects);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/projects/:id
   * Get project by ID
   */
  public async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const project = await this.projectRepository.findById(req.params.id as string);
      
      if (!project) {
        throw new NotFoundError(ERROR_MESSAGES.PROJECT_NOT_FOUND);
      }

      sendSuccess(res, project);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/projects/code/:code
   * Get project by code
   */
  public async getByCode(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const project = await this.projectRepository.findByCode(decodeURIComponent(req.params.code as string));
      
      if (!project) {
        throw new NotFoundError(ERROR_MESSAGES.PROJECT_NOT_FOUND);
      }

      sendSuccess(res, project);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/projects
   * Create new project
   */
  public async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {year, ...projectData} = req.body;
      
      // Generate project code if not provided
      if (!projectData.code) {
        const sequence = await this.projectRepository.getNextSequenceForYear(year);
        projectData.code = generateProjectCode(year, sequence);
      }

      const project = await this.projectRepository.create({
        ...projectData,
        year,
        status: 'ACTIVE',
      });
      
      sendSuccess(res, project, 'Project created successfully', HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/projects/:id
   * Update project
   */
  public async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const project = await this.projectRepository.update(req.params.id as string, req.body);
      sendSuccess(res, project, 'Project updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/projects/:id
   * Delete project
   */
  public async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await this.projectRepository.delete(req.params.id as string);
      sendSuccess(res, null, 'Project deleted successfully', HTTP_STATUS.NO_CONTENT);
    } catch (error) {
      next(error);
    }
  }
}
