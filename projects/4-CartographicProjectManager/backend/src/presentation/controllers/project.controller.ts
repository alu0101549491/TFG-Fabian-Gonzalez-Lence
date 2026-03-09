/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 7, 2026
 * @file backend/src/presentation/controllers/project.controller.ts
 * @desc Project controller handling project CRUD operations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {Request, Response, NextFunction} from 'express';
import {AccessRight, UserRole, TaskStatus} from '@prisma/client';
import type {Prisma} from '@prisma/client';
import type {Project} from '@prisma/client';
import type {AuthenticatedRequest} from '@shared/types.js';
import {ProjectRepository} from '@infrastructure/repositories/project.repository.js';
import {PermissionRepository} from '@infrastructure/repositories/permission.repository.js';
import {UserRepository} from '@infrastructure/repositories/user.repository.js';
import {AuditService} from '@application/services/audit.service.js';
import {AuditLogRepository} from '@infrastructure/repositories/audit-log.repository.js';
import {DropboxService} from '@infrastructure/external-services/dropbox.service.js';
import {prisma} from '@infrastructure/database/prisma.client.js';
import {sendSuccess, generateProjectCode, sendError} from '@shared/utils.js';
import {HTTP_STATUS, ERROR_MESSAGES} from '@shared/constants.js';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '@shared/errors.js';
import {logDebug, logError, logInfo, logWarning} from '@shared/logger.js';

const auditLogRepository = new AuditLogRepository(prisma);

/**
 * Project controller
 */
export class ProjectController {
  private readonly projectRepository: ProjectRepository;
  private readonly permissionRepository: PermissionRepository;
  private readonly userRepository: UserRepository;
  private readonly auditService: AuditService;
  private readonly dropboxService: DropboxService | null;

  public constructor() {
    this.projectRepository = new ProjectRepository();
    this.permissionRepository = new PermissionRepository();
    this.userRepository = new UserRepository();
    this.auditService = new AuditService(auditLogRepository);

    // Initialize Dropbox service if credentials available
    const dropboxToken = process.env.DROPBOX_ACCESS_TOKEN;
    if (dropboxToken) {
      this.dropboxService = new DropboxService({
        accessToken: dropboxToken,
        refreshToken: process.env.DROPBOX_REFRESH_TOKEN,
        appKey: process.env.DROPBOX_APP_KEY,
        appSecret: process.env.DROPBOX_APP_SECRET,
      });
    } else {
      logWarning('DROPBOX_ACCESS_TOKEN not set - project folders will not be auto-created');
      this.dropboxService = null;
    }
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
        throw new UnauthorizedError('User not authenticated');
      }

      const {status, year, type, clientId, specialUserId} = req.query;

      let parsedYear: number | undefined;
      if (year != null) {
        if (typeof year !== 'string') {
          throw new BadRequestError('Invalid year query parameter');
        }
        parsedYear = Number.parseInt(year, 10);
        if (!Number.isFinite(parsedYear)) {
          throw new BadRequestError('Invalid year query parameter');
        }
      }

      let projects: Project[];
      
      // ADMIN: Can see all projects or filter by any criteria
      if (currentUser.role === UserRole.ADMINISTRATOR) {
        if (status) {
          projects = await this.projectRepository.findByStatus(status as any);
        } else if (parsedYear != null) {
          projects = await this.projectRepository.findByYear(parsedYear);
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
      else if (currentUser.role === UserRole.CLIENT) {
        projects = await this.projectRepository.findByClientId(currentUser.id);
        
        // Apply additional filters if provided
        if (status) {
          projects = projects.filter(p => p.status === status);
        }
        if (parsedYear != null) {
          projects = projects.filter(p => p.year === parsedYear);
        }
        if (type) {
          projects = projects.filter(p => p.type === type);
        }
      }
      // SPECIAL_USER: Can see projects they created + projects they have permissions for
      else if (currentUser.role === UserRole.SPECIAL_USER) {
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
        if (parsedYear != null) {
          projects = projects.filter(p => p.year === parsedYear);
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
   * GET /api/v1/projects/summaries
   * Get all accessible projects with denormalized summary fields to avoid N+1 client calls.
   */
  public async getSummaries(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;

      if (!currentUser) {
        throw new UnauthorizedError('User not authenticated');
      }

      const {status, year, type, clientId, specialUserId} = req.query;

      let parsedYear: number | undefined;
      if (year != null) {
        if (typeof year !== 'string') {
          throw new BadRequestError('Invalid year query parameter');
        }
        parsedYear = Number.parseInt(year, 10);
        if (!Number.isFinite(parsedYear)) {
          throw new BadRequestError('Invalid year query parameter');
        }
      }

      const where: Prisma.ProjectWhereInput = {};

      if (typeof status === 'string') {
        where.status = status as any;
      }
      if (parsedYear != null) {
        where.year = parsedYear;
      }
      if (typeof type === 'string') {
        where.type = type as any;
      }

      if (currentUser.role === UserRole.ADMINISTRATOR) {
        if (typeof clientId === 'string') {
          where.clientId = clientId;
        }
        if (typeof specialUserId === 'string') {
          where.specialUsers = {
            some: {userId: specialUserId},
          };
        }
      } else if (currentUser.role === UserRole.CLIENT) {
        where.clientId = currentUser.id;
      } else if (currentUser.role === UserRole.SPECIAL_USER) {
        where.OR = [
          {creatorId: currentUser.id},
          {specialUsers: {some: {userId: currentUser.id}}},
        ];
      } else {
        sendSuccess(res, []);
        return;
      }

      const projects = await prisma.project.findMany({
        where,
        include: {
          client: {
            select: {
              username: true,
            },
          },
          specialUsers: {
            select: {
              userId: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const projectIds = projects.map((p) => p.id);
      if (projectIds.length === 0) {
        sendSuccess(res, []);
        return;
      }

      const pendingTaskCounts = await prisma.task.groupBy({
        by: ['projectId'],
        where: {
          projectId: {in: projectIds},
          status: {in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS]},
        },
        _count: {
          _all: true,
        },
      });

      const unreadMessageCounts = await prisma.message.groupBy({
        by: ['projectId'],
        where: {
          projectId: {in: projectIds},
          senderId: {not: currentUser.id},
          NOT: {
            readByUserIds: {
              has: currentUser.id,
            },
          },
        },
        _count: {
          _all: true,
        },
      });

      const pendingTaskCountByProjectId = new Map(
        pendingTaskCounts.map((row) => [row.projectId, row._count._all]),
      );
      const unreadMessageCountByProjectId = new Map(
        unreadMessageCounts.map((row) => [row.projectId, row._count._all]),
      );

      const summaries = projects.map((project) => {
        const specialUserCount = project.specialUsers?.length ?? 0;
        const participantCount = specialUserCount + 1;

        return {
          id: project.id,
          code: project.code,
          name: project.name,
          clientId: project.clientId,
          clientName: project.client?.username ?? 'Unknown Client',
          type: project.type,
          deliveryDate: project.deliveryDate,
          status: project.status,
          pendingTasksCount: pendingTaskCountByProjectId.get(project.id) ?? 0,
          unreadMessagesCount: unreadMessageCountByProjectId.get(project.id) ?? 0,
          participantCount,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        };
      });

      sendSuccess(res, summaries);
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
        throw new UnauthorizedError('User not authenticated');
      }

      const project = await this.projectRepository.findById(req.params.id as string);
      
      if (!project) {
        throw new NotFoundError(ERROR_MESSAGES.PROJECT_NOT_FOUND);
      }

      // Access control: Check if user has permission to view this project
      let hasAccess = false;
      
      if (currentUser.role === UserRole.ADMINISTRATOR) {
        hasAccess = true;
      } else if (currentUser.role === UserRole.CLIENT && project.clientId === currentUser.id) {
        hasAccess = true;
      } else if (currentUser.role === UserRole.SPECIAL_USER) {
        const projectData = project as any;
        const isCreator = projectData.creatorId === currentUser.id;
        const hasPermission = projectData.specialUsers?.some((su: any) => su.userId === currentUser.id);
        hasAccess = isCreator || hasPermission;
      }

      if (!hasAccess) {
        throw new ForbiddenError(ERROR_MESSAGES.FORBIDDEN);
      }

      // Get user's permissions for this project
      const permissions = await this.getUserPermissions(currentUser.id, project.id, currentUser.role, project.clientId);

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
      let decodedCode: string;
      try {
        decodedCode = decodeURIComponent(req.params.code as string);
      } catch {
        throw new BadRequestError('Invalid code parameter');
      }

      const project = await this.projectRepository.findByCode(decodedCode);
      
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
        throw new UnauthorizedError('User not authenticated');
      }

      const {year, ...projectData} = req.body;
      
      // Generate project code if not provided
      if (!projectData.code) {
        const sequence = await this.projectRepository.getNextSequenceForYear(year);
        projectData.code = generateProjectCode(year, sequence);
      }

      // Create Dropbox folder structure
      let dropboxFolderId = '';
      if (this.dropboxService) {
        try {
          dropboxFolderId = await this.dropboxService.createProjectFolder(projectData.code);
          logInfo('Created Dropbox folder for project', {
            projectCode: projectData.code,
            dropboxFolderId,
          });
        } catch (error) {
          const normalizedError =
            error instanceof Error ? error : new Error(String(error));
          logError('Failed to create Dropbox folder for project', normalizedError, {
            projectCode: projectData.code,
          });
          // Continue without Dropbox folder - files can still be uploaded, folders will be auto-created
        }
      }

      const project = await this.projectRepository.create({
        ...projectData,
        year,
        status: 'ACTIVE',
        creatorId: currentUser.id,
        dropboxFolderId,
      });
      
      // If the creator is a SPECIAL_USER, automatically add them as a participant
      if (currentUser.role === UserRole.SPECIAL_USER) {
        await this.projectRepository.addSpecialUser(project.id, currentUser.id);
        
        // Automatically grant full permissions to the creator
        await this.permissionRepository.create({
          userId: currentUser.id,
          projectId: project.id,
          rights: ['VIEW', 'DOWNLOAD', 'UPLOAD', 'EDIT', 'DELETE', 'SEND_MESSAGE'],
          grantedBy: currentUser.id,
        });
      }
      
      // Log project creation in audit trail
      await this.auditService.logProjectCreation(
        currentUser.id,
        project.id,
        project.name,
        req
      );
      
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
        throw new UnauthorizedError('User not authenticated');
      }

      const projectId = req.params.id as string;
      logDebug('Project update request received', {
        projectId,
        fields: Object.keys(req.body as object),
        userId: currentUser.id,
      });
      
      // Check if user has permission to update
      const existingProject = await this.projectRepository.findById(projectId);
      if (!existingProject) {
        throw new NotFoundError(ERROR_MESSAGES.PROJECT_NOT_FOUND);
      }

      // Allow if admin or creator
      const projectData = existingProject as any;
      if (currentUser.role !== 'ADMINISTRATOR' && projectData.creatorId !== currentUser.id) {
        throw new ForbiddenError('You do not have permission to update this project');
      }

      const project = await this.projectRepository.update(projectId, req.body);
  logInfo('Project updated successfully', {projectId});
      
      // Log project finalization if status changed to FINALIZED
      if (req.body.status === 'FINALIZED' && existingProject.status !== 'FINALIZED') {
        await this.auditService.logProjectFinalization(
          currentUser.id,
          project.id,
          project.name,
          req
        );
      } else {
        // Log general project update
        await this.auditService.logProjectUpdate(
          currentUser.id,
          project.id,
          project.name,
          JSON.stringify({ status: existingProject.status }),
          JSON.stringify({ status: project.status }),
          req
        );
      }
      
      sendSuccess(res, project, 'Project updated successfully');
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error(String(error));
      logError('Error updating project', normalizedError, {
        projectId: req.params.id,
      });
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
        throw new UnauthorizedError('User not authenticated');
      }

      const projectId = req.params.id as string;
      logDebug('Project delete request received', {
        projectId,
        userId: currentUser.id,
      });
      
      // Check if user has permission to delete
      const existingProject = await this.projectRepository.findById(projectId);
      if (!existingProject) {
        throw new NotFoundError(ERROR_MESSAGES.PROJECT_NOT_FOUND);
      }

      // Allow if admin or creator
      const projectData = existingProject as any;
      if (currentUser.role !== 'ADMINISTRATOR' && projectData.creatorId !== currentUser.id) {
        throw new ForbiddenError('You do not have permission to delete this project');
      }

      await this.projectRepository.delete(projectId);
  logInfo('Project deleted successfully', {projectId});
      
      // Log project deletion in audit trail
      await this.auditService.logProjectDeletion(
        currentUser.id,
        existingProject.id,
        existingProject.name,
        req
      );
      
      sendSuccess(res, null, 'Project deleted successfully');
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error(String(error));
      logError('Error deleting project', normalizedError, {
        projectId: req.params.id,
      });
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
      let grantedPermissions: string[];
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
          grantedPermissions = validPermissions;
        } else {
          grantedPermissions = ['VIEW'];
          await this.permissionRepository.create({
            userId,
            projectId,
            rights: ['VIEW'] as AccessRight[],
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
        grantedPermissions = ['VIEW'];
      }

      // Log permission grant in audit trail
      await this.auditService.logPermissionGrant(
        currentUser.id,
        userId,
        user.username,
        projectId,
        project.name,
        grantedPermissions,
        req
      );

      sendSuccess(res, {
        message: 'Special user added to project successfully',
        userId,
        projectId,
        permissions: grantedPermissions,
      }, 'Special user added successfully', HTTP_STATUS.CREATED);
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error(String(error));
      logError('Error adding special user', normalizedError, {
        projectId: req.params.id,
      });
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
      const normalizedError =
        error instanceof Error ? error : new Error(String(error));
      logError('Error updating permissions', normalizedError, {
        projectId: req.params.id,
      });
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
        logDebug('No permissions to delete for user+project', {
          userId,
          projectId,
        });
      }

      sendSuccess(res, null, 'Special user removed from project successfully');
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error(String(error));
      logError('Error removing special user', normalizedError, {
        projectId: req.params.id,
      });
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
    userRole: UserRole,
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
    if (userRole === UserRole.ADMINISTRATOR) {
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
    if (userRole === UserRole.CLIENT && projectClientId === userId) {
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
    if (userRole === UserRole.SPECIAL_USER) {
      const permission = await this.permissionRepository.findByUserAndProject(userId, projectId);
      
      if (permission) {
        const rights = permission.rights;
        return {
          canEdit: rights.includes(AccessRight.EDIT),
          canDelete: rights.includes(AccessRight.DELETE),
          canFinalize: false, // Special users cannot finalize
          canCreateTask: rights.includes(AccessRight.EDIT),
          canSendMessage: rights.includes(AccessRight.SEND_MESSAGE),
          canUploadFile: rights.includes(AccessRight.UPLOAD),
          canDownloadFile: rights.includes(AccessRight.DOWNLOAD) || rights.includes(AccessRight.VIEW),
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
      const normalizedError =
        error instanceof Error ? error : new Error(String(error));
      logError('Error getting permissions', normalizedError, {
        projectId: req.params.id,
        userId: req.params.userId,
      });
      next(error);
    }
  }
}
