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
import type {Project, AccessRight} from '@prisma/client';
import type {AuthenticatedRequest} from '@shared/types.js';
import {ProjectRepository} from '@infrastructure/repositories/project.repository.js';
import {PermissionRepository} from '@infrastructure/repositories/permission.repository.js';
import {UserRepository} from '@infrastructure/repositories/user.repository.js';
import {sendSuccess, generateProjectCode, sendError} from '@shared/utils.js';
import {HTTP_STATUS, ERROR_MESSAGES} from '@shared/constants.js';
import {NotFoundError} from '@shared/errors.js';

/**
 * Project controller
 */
export class ProjectController {
  private readonly projectRepository: ProjectRepository;
  private readonly permissionRepository: PermissionRepository;
  private readonly userRepository: UserRepository;

  public constructor() {
    this.projectRepository = new ProjectRepository();
    this.permissionRepository = new PermissionRepository();
    this.userRepository = new UserRepository();
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
      let hasAccess = false;
      
      if (currentUser.role === 'ADMINISTRATOR') {
        hasAccess = true;
      } else if (currentUser.role === 'CLIENT' && project.clientId === currentUser.id) {
        hasAccess = true;
      } else if (currentUser.role === 'SPECIAL_USER') {
        const projectData = project as any;
        const isCreator = projectData.creatorId === currentUser.id;
        const hasPermission = projectData.specialUsers?.some((su: any) => su.userId === currentUser.id);
        hasAccess = isCreator || hasPermission;
      }

      if (!hasAccess) {
        throw new NotFoundError(ERROR_MESSAGES.PROJECT_NOT_FOUND);
      }

      // Get user's permissions for this project
      const permissions = await this.getUserPermissions(currentUser.id, project.id, currentUser.role as string, project.clientId);

      sendSuccess(res, {
        ...project,
        currentUserPermissions: permissions,
      });
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
        
        // Automatically grant full permissions to the creator
        await this.permissionRepository.create({
          userId: currentUser.id,
          projectId: project.id,
          rights: ['VIEW', 'DOWNLOAD', 'UPLOAD', 'EDIT', 'DELETE', 'SEND_MESSAGE'],
          grantedBy: currentUser.id,
        });
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

  /**
   * POST /api/v1/projects/:id/special-users
   * Add a special user to a project with configurable permissions (admin only)
   */
  public async addSpecialUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;
      
      if (!currentUser || currentUser.role !== 'ADMINISTRATOR') {
        sendError(res, 'Only administrators can add special users', HTTP_STATUS.FORBIDDEN);
        return;
      }

      const projectId = req.params.id as string;
      const {userId, permissions} = req.body;

      if (!userId) {
        sendError(res, 'User ID is required', HTTP_STATUS.BAD_REQUEST);
        return;
      }

      // Validate project exists
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        sendError(res, ERROR_MESSAGES.PROJECT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
        return;
      }

      // Validate user exists and is a special user
      const user = await this.userRepository.findById(userId);
      if (!user) {
        sendError(res, 'User not found', HTTP_STATUS.NOT_FOUND);
        return;
      }

      if (user.role !== 'SPECIAL_USER') {
        sendError(res, 'User must have SPECIAL_USER role', HTTP_STATUS.BAD_REQUEST);
        return;
      }

      // Add user to project
      await this.projectRepository.addSpecialUser(projectId, userId);

      // Create permissions if provided
      if (permissions && Array.isArray(permissions)) {
        const validPermissions = permissions.filter((p: string) => 
          ['VIEW', 'DOWNLOAD', 'UPLOAD', 'EDIT', 'DELETE', 'SEND_MESSAGE'].includes(p)
        ) as AccessRight[];

        if (validPermissions.length > 0) {
          await this.permissionRepository.create({
            userId,
            projectId,
            rights: validPermissions,
            grantedBy: currentUser.id,
          });
        }
      } else {
        // Default permissions: VIEW only
        await this.permissionRepository.create({
          userId,
          projectId,
          rights: ['VIEW'] as AccessRight[],
          grantedBy: currentUser.id,
        });
      }

      sendSuccess(res, {
        message: 'Special user added to project successfully',
        userId,
        projectId,
        permissions: permissions || ['VIEW'],
      }, 'Special user added successfully', HTTP_STATUS.CREATED);
    } catch (error) {
      console.error('[ProjectController] Error adding special user:', error);
      next(error);
    }
  }

  /**
   * PUT /api/v1/projects/:id/special-users/:userId/permissions
   * Update special user permissions for a project (admin only)
   */
  public async updateSpecialUserPermissions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;
      
      if (!currentUser || currentUser.role !== 'ADMINISTRATOR') {
        sendError(res, 'Only administrators can update permissions', HTTP_STATUS.FORBIDDEN);
        return;
      }

      const projectId = req.params.id as string;
      const userId = req.params.userId as string;
      const {permissions} = req.body;

      if (!permissions || !Array.isArray(permissions)) {
        sendError(res, 'Permissions array is required', HTTP_STATUS.BAD_REQUEST);
        return;
      }

      // Validate project exists
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        sendError(res, ERROR_MESSAGES.PROJECT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
        return;
      }

      // Validate valid permissions
      const validPermissions = permissions.filter((p: string) => 
        ['VIEW', 'DOWNLOAD', 'UPLOAD', 'EDIT', 'DELETE', 'SEND_MESSAGE'].includes(p)
      ) as AccessRight[];

      if (validPermissions.length === 0) {
        sendError(res, 'At least one valid permission is required', HTTP_STATUS.BAD_REQUEST);
        return;
      }

      // Update permissions
      const existingPermission = await this.permissionRepository.findByUserAndProject(userId, projectId);
      
      if (existingPermission) {
        await this.permissionRepository.update(userId, projectId, validPermissions);
      } else {
        await this.permissionRepository.create({
          userId,
          projectId,
          rights: validPermissions,
          grantedBy: currentUser.id,
        });
      }

      sendSuccess(res, {
        message: 'Permissions updated successfully',
        userId,
        projectId,
        permissions: validPermissions,
      });
    } catch (error) {
      console.error('[ProjectController] Error updating permissions:', error);
      next(error);
    }
  }

  /**
   * DELETE /api/v1/projects/:id/special-users/:userId
   * Remove a special user from a project (admin only)
   */
  public async removeSpecialUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;
      
      if (!currentUser || currentUser.role !== 'ADMINISTRATOR') {
        sendError(res, 'Only administrators can remove special users', HTTP_STATUS.FORBIDDEN);
        return;
      }

      const projectId = req.params.id as string;
      const userId = req.params.userId as string;

      // Validate project exists
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        sendError(res, ERROR_MESSAGES.PROJECT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
        return;
      }

      // Remove special user from project
      await this.projectRepository.removeSpecialUser(projectId, userId);

      // Remove permissions
      try {
        await this.permissionRepository.delete(userId, projectId);
      } catch (error) {
        // Permission might not exist, that's okay
        console.log('No permissions to delete');
      }

      sendSuccess(res, null, 'Special user removed from project successfully');
    } catch (error) {
      console.error('[ProjectController] Error removing special user:', error);
      next(error);
    }
  }

  /**
   * Helper method to get user permissions for a project
   * @param userId - User ID
   * @param projectId - Project ID
   * @param userRole - User's role
   * @param projectClientId - Project's client ID
   * @returns Permission object
   * @private
   */
  private async getUserPermissions(
    userId: string,
    projectId: string,
    userRole: string,
    projectClientId: string
  ): Promise<{
    canEdit: boolean;
    canDelete: boolean;
    canFinalize: boolean;
    canCreateTask: boolean;
    canSendMessage: boolean;
    canUploadFile: boolean;
    canDownloadFile: boolean;
    canManageParticipants: boolean;
  }> {
    // Administrator has all permissions
    if (userRole === 'ADMINISTRATOR') {
      return {
        canEdit: true,
        canDelete: true,
        canFinalize: true,
        canCreateTask: true,
        canSendMessage: true,
        canUploadFile: true,
        canDownloadFile: true,
        canManageParticipants: true,
      };
    }

    // Client has most permissions on their projects
    if (userRole === 'CLIENT' && projectClientId === userId) {
      return {
        canEdit: true,
        canDelete: false, // Only admin can delete
        canFinalize: false, // Only admin can finalize
        canCreateTask: true,
        canSendMessage: true,
        canUploadFile: true,
        canDownloadFile: true,
        canManageParticipants: false,
      };
    }

    // Special user permissions from database
    if (userRole === 'SPECIAL_USER') {
      const permission = await this.permissionRepository.findByUserAndProject(userId, projectId);
      
      if (permission) {
        const rights = permission.rights;
        return {
          canEdit: rights.includes('EDIT'),
          canDelete: rights.includes('DELETE'),
          canFinalize: false, // Special users cannot finalize
          canCreateTask: rights.includes('EDIT'),
          canSendMessage: rights.includes('SEND_MESSAGE'),
          canUploadFile: rights.includes('UPLOAD'),
          canDownloadFile: rights.includes('DOWNLOAD') || rights.includes('VIEW'),
          canManageParticipants: false,
        };
      }
      
      // Special user with no explicit permissions has VIEW only
      return {
        canEdit: false,
        canDelete: false,
        canFinalize: false,
        canCreateTask: false,
        canSendMessage: false,
        canUploadFile: false,
        canDownloadFile: true, // Can at least view
        canManageParticipants: false,
      };
    }

    // Default: no permissions
    return {
      canEdit: false,
      canDelete: false,
      canFinalize: false,
      canCreateTask: false,
      canSendMessage: false,
      canUploadFile: false,
      canDownloadFile: false,
      canManageParticipants: false,
    };
  }

  /**
   * GET /api/v1/projects/:id/special-users/:userId/permissions
   * Get special user permissions for a project (admin only)
   */
  public async getSpecialUserPermissions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;
      
      if (!currentUser || currentUser.role !== 'ADMINISTRATOR') {
        sendError(res, 'Only administrators can view special user permissions', HTTP_STATUS.FORBIDDEN);
        return;
      }

      const projectId = req.params.id as string;
      const userId = req.params.userId as string;

      const permission = await this.permissionRepository.findByUserAndProject(userId, projectId);

      if (!permission) {
        sendSuccess(res, {
          userId,
          projectId,
          permissions: [],
        });
        return;
      }

      sendSuccess(res, {
        userId,
        projectId,
        permissions: permission.rights,
        grantedAt: permission.grantedAt,
      });
    } catch (error) {
      console.error('[ProjectController] Error getting permissions:', error);
      next(error);
    }
  }
}
