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
import type {Project} from '@prisma/client';
import type {AuthenticatedRequest} from '@shared/types.js';
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
   * Get all projects with optional filters, automatically filtered by user role and permissions
   */
  public async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;
      
      if (!currentUser) {
        throw new NotFoundError('User not authenticated');
      }

      const {status, year, type, clientId, specialUserId} = req.query;

      let projects: Project[];
      
      // ADMIN: Can see all projects or filter by any criteria
      if (currentUser.role === 'ADMINISTRATOR') {
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
      }
      // CLIENT: Can only see their assigned projects
      else if (currentUser.role === 'CLIENT') {
        projects = await this.projectRepository.findByClientId(currentUser.id);
        
        // Apply additional filters if provided
        if (status) {
          projects = projects.filter(p => p.status === status);
        }
        if (year) {
          projects = projects.filter(p => p.year === parseInt(year as string));
        }
        if (type) {
          projects = projects.filter(p => p.type === type);
        }
      }
      // SPECIAL_USER: Can see projects they created + projects they have permissions for
      else if (currentUser.role === 'SPECIAL_USER') {
        const permissionProjects = await this.projectRepository.findBySpecialUserId(currentUser.id);
        const createdProjects = await this.projectRepository.findByCreatorId(currentUser.id);
        
        // Merge and deduplicate by ID
        const projectMap = new Map<string, Project>();
        [...createdProjects, ...permissionProjects].forEach(p => projectMap.set(p.id, p));
        projects = Array.from(projectMap.values());
        
        // Apply additional filters if provided
        if (status) {
          projects = projects.filter(p => p.status === status);
        }
        if (year) {
          projects = projects.filter(p => p.year === parseInt(year as string));
        }
        if (type) {
          projects = projects.filter(p => p.type === type);
        }
      }
      // Unknown role: return empty array
      else {
        projects = [];
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
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;
      
      if (!currentUser) {
        throw new NotFoundError('User not authenticated');
      }

      const project = await this.projectRepository.findById(req.params.id as string);
      
      if (!project) {
        throw new NotFoundError(ERROR_MESSAGES.PROJECT_NOT_FOUND);
      }

      // Access control: Check if user has permission to view this project
      if (currentUser.role === 'ADMINISTRATOR') {
        // Admins can see all projects
        sendSuccess(res, project);
      } else if (currentUser.role === 'CLIENT') {
        // Clients can only see their own projects
        if (project.clientId !== currentUser.id) {
          throw new NotFoundError(ERROR_MESSAGES.PROJECT_NOT_FOUND);
        }
        sendSuccess(res, project);
      } else if (currentUser.role === 'SPECIAL_USER') {
        // Special users can see projects they created OR have permissions for
        const projectData = project as any;
        const isCreator = projectData.creatorId === currentUser.id;
        const hasPermission = projectData.specialUsers?.some((su: any) => su.userId === currentUser.id);
        
        if (!isCreator && !hasPermission) {
          throw new NotFoundError(ERROR_MESSAGES.PROJECT_NOT_FOUND);
        }
        sendSuccess(res, project);
      } else {
        throw new NotFoundError(ERROR_MESSAGES.PROJECT_NOT_FOUND);
      }
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
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;
      
      if (!currentUser) {
        throw new NotFoundError('User not authenticated');
      }

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
        creatorId: currentUser.id,
      });
      
      // If the creator is a SPECIAL_USER, automatically add them as a participant
      if (currentUser.role === 'SPECIAL_USER') {
        await this.projectRepository.addSpecialUser(project.id, currentUser.id);
      }
      
      sendSuccess(res, project, 'Project created successfully', HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/projects/:id
   * Update project (admin or creator can update)
   */
  public async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;
      
      if (!currentUser) {
        throw new NotFoundError('User not authenticated');
      }

      const projectId = req.params.id as string;
      console.log(`[ProjectController] UPDATE request for project ${projectId} with data:`, req.body);
      
      // Check if user has permission to update
      const existingProject = await this.projectRepository.findById(projectId);
      if (!existingProject) {
        throw new NotFoundError(ERROR_MESSAGES.PROJECT_NOT_FOUND);
      }

      // Allow if admin or creator
      const projectData = existingProject as any;
      if (currentUser.role !== 'ADMINISTRATOR' && projectData.creatorId !== currentUser.id) {
        throw new NotFoundError('You do not have permission to update this project');
      }

      const project = await this.projectRepository.update(projectId, req.body);
      console.log(`[ProjectController] Project ${projectId} updated successfully`);
      sendSuccess(res, project, 'Project updated successfully');
    } catch (error) {
      console.error('[ProjectController] Error updating project:', error);
      next(error);
    }
  }

  /**
   * DELETE /api/v1/projects/:id
   * Delete project (admin or creator can delete)
   */
  public async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;
      
      if (!currentUser) {
        throw new NotFoundError('User not authenticated');
      }

      const projectId = req.params.id as string;
      console.log(`[ProjectController] DELETE request for project: ${projectId}`);
      
      // Check if user has permission to delete
      const existingProject = await this.projectRepository.findById(projectId);
      if (!existingProject) {
        throw new NotFoundError(ERROR_MESSAGES.PROJECT_NOT_FOUND);
      }

      // Allow if admin or creator
      const projectData = existingProject as any;
      if (currentUser.role !== 'ADMINISTRATOR' && projectData.creatorId !== currentUser.id) {
        throw new NotFoundError('You do not have permission to delete this project');
      }

      await this.projectRepository.delete(projectId);
      console.log(`[ProjectController] Project ${projectId} deleted successfully`);
      
      sendSuccess(res, null, 'Project deleted successfully');
    } catch (error) {
      console.error('[ProjectController] Error deleting project:', error);
      next(error);
    }
  }
}
