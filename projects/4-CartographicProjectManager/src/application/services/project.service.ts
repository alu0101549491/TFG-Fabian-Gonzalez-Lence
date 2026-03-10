/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file application/services/project.service.ts
 * @desc Service implementation for project lifecycle management.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {
  type CreateProjectDto,
  type UpdateProjectDto,
  type ProjectDto,
  type ProjectDetailsDto,
  type ProjectSummaryDto,
  type ProjectFilterDto,
  type ProjectListResponseDto,
  type CalendarProjectDto,
  type ParticipantDto,
  type ProjectPermissionsDto,
  type ValidationResultDto,
  ValidationErrorCode,
  validResult,
  invalidResult,
  createError,
} from '../dto';
import {IProjectService} from '../interfaces/project-service.interface';
import {
  type IProjectRepository,
  type IUserRepository,
  type ITaskRepository,
  type IMessageRepository,
  type IFileRepository,
  type IPermissionRepository,
} from '../../domain/repositories';
import {INotificationService} from '../interfaces/notification-service.interface';
import {IAuthorizationService} from '../interfaces/authorization-service.interface';
import {UnauthorizedError, NotFoundError, ValidationError, BusinessLogicError, ConflictError} from './common/errors';
import {generateId} from './common/utils';
import {Project} from '../../domain/entities/project';
import {Permission} from '../../domain/entities/permission';
import {UserRole} from '../../domain/enumerations/user-role';
import {ProjectStatus} from '../../domain/enumerations/project-status';
import {TaskStatus} from '../../domain/enumerations/task-status';
import {AccessRight} from '../../domain/enumerations/access-right';
import {NotificationType} from '../../domain/enumerations/notification-type';
import {GeoCoordinates} from '../../domain/value-objects/geo-coordinates';

/**
 * Implementation of project management operations.
 */
export class ProjectService implements IProjectService {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly userRepository: IUserRepository,
    private readonly taskRepository: ITaskRepository,
    private readonly messageRepository: IMessageRepository,
    private readonly fileRepository: IFileRepository,
    private readonly permissionRepository: IPermissionRepository,
    private readonly notificationService: INotificationService,
    private readonly authorizationService: IAuthorizationService,
  ) {}

  /**
   * Creates a new cartographic project.
   */
  public async createProject(data: CreateProjectDto, creatorId: string): Promise<ProjectDto> {
    // Validate
    const validation = await this.validateProjectData(data);
    if (!validation.isValid) {
      throw new ValidationError('Invalid project data', validation.errors || []);
    }

    // Check unique code
    const codeExists = await this.checkProjectCodeExists(data.code);
    if (codeExists) {
      throw new ConflictError(`Project code ${data.code} already exists`);
    }

    // Get creator
    const creator = await this.userRepository.findById(creatorId);
    if (!creator) {
      throw new NotFoundError(`User ${creatorId} not found`);
    }

    // Create project entity
    const project = new Project({
      id: generateId(),
      year: data.year,
      code: data.code,
      name: data.name,
      type: data.type,
      clientId: data.clientId,
      coordinates:
        data.coordinateX != null && data.coordinateY != null
          ? new GeoCoordinates(data.coordinateY, data.coordinateX)
          : null,
      contractDate: data.contractDate,
      deliveryDate: data.deliveryDate,
      status: ProjectStatus.ACTIVE,
      dropboxFolderId: data.storageFolderId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.projectRepository.save(project);

    // Assign client if specified
    if (data.clientId) {
      await this.assignProjectToClient(project.id, data.clientId, creatorId);
    }

    // Notify
    await this.notificationService.sendNotification({
      recipientId: creatorId,
      type: NotificationType.PROJECT_ASSIGNED,
      title: 'Project Created',
      message: `Project ${project.name} has been created`,
      relatedProjectId: project.id,
    });

    return await this.mapToDto(project);
  }

  /**
   * Updates an existing project.
   */
  public async updateProject(data: UpdateProjectDto, userId: string): Promise<ProjectDto> {
    const canModify = await this.authorizationService.canModifyProject(userId, data.id);
    if (!canModify) {
      throw new UnauthorizedError('You do not have permission to modify this project');
    }

    const project = await this.projectRepository.findById(data.id);
    if (!project) {
      throw new NotFoundError(`Project ${data.id} not found`);
    }

    // Update fields
    if (data.name !== undefined) project.name = data.name;
    if (data.type !== undefined) project.type = data.type;
    if (data.clientId !== undefined) project.clientId = data.clientId;
    if (data.contractDate !== undefined) project.contractDate = data.contractDate;
    if (data.deliveryDate !== undefined) project.deliveryDate = data.deliveryDate;
    if (data.storageFolderId !== undefined) project.dropboxFolderId = data.storageFolderId;
    if (data.status !== undefined) project.status = data.status;
    if (data.coordinateX !== undefined || data.coordinateY !== undefined) {
      const nextX =
        data.coordinateX !== undefined
          ? data.coordinateX
          : (project.coordinates?.getX() ?? null);
      const nextY =
        data.coordinateY !== undefined
          ? data.coordinateY
          : (project.coordinates?.getY() ?? null);

      project.coordinates =
        nextX != null && nextY != null ? new GeoCoordinates(nextY, nextX) : null;
    }

    await this.projectRepository.save(project);

    return await this.mapToDto(project);
  }

  /**
   * Deletes a project and all associated data.
   */
  public async deleteProject(projectId: string, userId: string): Promise<void> {
    const canDelete = await this.authorizationService.canDeleteProject(userId, projectId);
    if (!canDelete) {
      throw new UnauthorizedError('You do not have permission to delete this project');
    }

    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError(`Project ${projectId} not found`);
    }

    if (project.status === ProjectStatus.FINALIZED) {
      throw new BusinessLogicError('Cannot delete a finalized project');
    }

    await this.projectRepository.delete(projectId);
  }

  /**
   * Retrieves detailed information about a specific project.
   */
  public async getProjectById(projectId: string, userId: string): Promise<ProjectDetailsDto> {
    const canAccess = await this.authorizationService.canAccessProject(userId, projectId);
    if (!canAccess) {
      throw new UnauthorizedError('You do not have permission to access this project');
    }

    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError(`Project ${projectId} not found`);
    }

    return this.mapToDetailsDto(project, userId);
  }

  /**
   * Retrieves summary information about a specific project.
   */
  public async getProjectSummary(projectId: string, userId: string): Promise<ProjectSummaryDto> {
    const canAccess = await this.authorizationService.canAccessProject(userId, projectId);
    if (!canAccess) {
      throw new UnauthorizedError('You do not have permission to access this project');
    }

    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError(`Project ${projectId} not found`);
    }

    return await this.mapToSummaryDto(project);
  }

  /**
   * Retrieves all projects accessible by a specific user with optional filtering.
   */
  public async getProjectsByUser(userId: string, filters?: ProjectFilterDto): Promise<ProjectListResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    let projects: Project[];

      if (user.role === UserRole.ADMINISTRATOR) {
        projects = await this.projectRepository.find();
    } else if (user.role === UserRole.CLIENT) {
        projects = await this.projectRepository.find({clientId: userId});
    } else {
      // Special User - find projects via permissions
      const permissions = await this.permissionRepository.findByUserId(userId);
      const projectIds = [...new Set(permissions.map((p: Permission) => p.projectId))];
      // Fetch projects individually since findByIds doesn't exist
      const projectPromises = projectIds.map(id => this.projectRepository.findById(id));
      const projectResults = await Promise.all(projectPromises);
      projects = projectResults.filter((p): p is Project => p !== null);
    }

    const summaries = await Promise.all(projects.map((p: Project) => this.mapToSummaryDto(p)));

    return {
      projects: summaries,
      total: summaries.length,
      page: filters?.page || 1,
      limit: filters?.limit || summaries.length,
      totalPages: 1,
    };
  }

  /**
   * Retrieves all projects in the system with optional filtering (admin only).
   */
  public async getAllProjects(filters?: ProjectFilterDto): Promise<ProjectListResponseDto> {
    const projects = await this.projectRepository.find();
    const summaries = await Promise.all(projects.map(p => this.mapToSummaryDto(p)));

    const limit = filters?.limit || 20;
    const totalPages = Math.ceil(summaries.length / limit);

    return {
      projects: summaries,
      total: summaries.length,
      page: filters?.page || 1,
      limit,
      totalPages,
    };
  }

  /**
   * Retrieves active (non-finalized) projects for a user.
   */
  public async getActiveProjects(userId: string): Promise<ProjectSummaryDto[]> {
    const filters: ProjectFilterDto = {
      status: ProjectStatus.ACTIVE,
    };

    const result = await this.getProjectsByUser(userId, filters);
    return result.projects;
  }

  /**
   * Retrieves projects within a date range for calendar display.
   */
  public async getProjectsForCalendar(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<CalendarProjectDto[]> {
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    const errors: Array<ReturnType<typeof createError>> = [];

    if (!Number.isFinite(parsedStartDate.getTime())) {
      errors.push(
        createError(
          'startDate',
          'Start date must be a valid ISO date string',
          ValidationErrorCode.INVALID_DATE,
          startDate,
        ),
      );
    }

    if (!Number.isFinite(parsedEndDate.getTime())) {
      errors.push(
        createError(
          'endDate',
          'End date must be a valid ISO date string',
          ValidationErrorCode.INVALID_DATE,
          endDate,
        ),
      );
    }

    if (errors.length > 0) {
      throw new ValidationError('Invalid date range', errors);
    }

    if (parsedStartDate >= parsedEndDate) {
      throw new ValidationError('Invalid date range', [
        createError(
          'dateRange',
          'Start date must be before end date',
          ValidationErrorCode.DATE_RANGE_INVALID,
        ),
      ]);
    }

    const filters: ProjectFilterDto = {
      startDate: parsedStartDate,
      endDate: parsedEndDate,
    };

    const result = await this.getProjectsByUser(userId, filters);
    
    return result.projects.map(p => ({
      id: p.id,
      code: p.code,
      name: p.name,
      deliveryDate: p.deliveryDate,
      status: p.status,
      hasPendingTasks: p.hasPendingTasks,
    }));
  }

  /**
   * Assigns a project to a client user.
   */
  public async assignProjectToClient(projectId: string, clientId: string, adminId: string): Promise<void> {
    const isAdmin = await this.authorizationService.isAdmin(adminId);
    if (!isAdmin) {
      throw new UnauthorizedError('Only admins can assign projects to clients');
    }

    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError(`Project ${projectId} not found`);
    }

    const client = await this.userRepository.findById(clientId);
    if (!client) {
      throw new NotFoundError(`Client ${clientId} not found`);
    }

    if (client.role !== UserRole.CLIENT) {
      throw new ValidationError('User is not a client', [
        createError('clientId', 'User must have CLIENT role', ValidationErrorCode.INVALID_TYPE),
      ]);
    }

    project.clientId = clientId;
    await this.projectRepository.save(project);

    // Notify client
    await this.notificationService.sendNotification({
      recipientId: clientId,
      type: NotificationType.PROJECT_ASSIGNED,
      title: 'Project Assigned',
      message: `You have been assigned to project ${project.name}`,
      relatedProjectId: projectId,
    });
  }

  /**
   * Adds a special user to a project with specific permissions.
   */
  public async addSpecialUser(
    projectId: string,
    userId: string,
    permissions: AccessRight[],
    adminId: string
  ): Promise<void> {
    const isAdmin = await this.authorizationService.isAdmin(adminId);
    if (!isAdmin) {
      throw new UnauthorizedError('Only admins can add special users');
    }

    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError(`Project ${projectId} not found`);
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    // Check if already has permissions
    const existing = await this.permissionRepository.findByUserAndProject(userId, projectId);
    if (existing && Array.isArray(existing) && existing.length > 0) {
      throw new ConflictError('User already has permissions for this project');
    }

    // Create permission with all specified rights
    const permission = new Permission({
      id: generateId(),
      userId,
      projectId,
      rights: new Set(permissions),
      grantedBy: adminId,
      grantedAt: new Date(),
    });
    await this.permissionRepository.save(permission);

    // Notify user
    await this.notificationService.sendNotification({
      recipientId: userId,
      type: NotificationType.PROJECT_ASSIGNED,
      title: 'Added to Project',
      message: `You have been added to project ${project.name}`,
      relatedProjectId: projectId,
    });
  }

  /**
   * Removes a special user from a project.
   */
  public async removeSpecialUser(projectId: string, userId: string, adminId: string): Promise<void> {
    const isAdmin = await this.authorizationService.isAdmin(adminId);
    if (!isAdmin) {
      throw new UnauthorizedError('Only admins can remove special users');
    }

    const permissions = await this.permissionRepository.findByUserAndProject(userId, projectId);
    
    if (permissions && Array.isArray(permissions) && permissions.length > 0) {
      for (const permission of permissions) {
        await this.permissionRepository.delete(permission.id);
      }
    }
  }

  /**
   * Updates permissions for a special user in a project.
   */
  public async updateSpecialUserPermissions(
    projectId: string,
    userId: string,
    permissions: AccessRight[],
    adminId: string
  ): Promise<void> {
    // Remove old permissions
    await this.removeSpecialUser(projectId, userId, adminId);
    
    // Add new permissions
    await this.addSpecialUser(projectId, userId, permissions, adminId);
  }

  /**
   * Retrieves all participants (client and special users) of a project.
   */
  public async getProjectParticipants(projectId: string, userId: string): Promise<ParticipantDto[]> {
    const canAccess = await this.authorizationService.canAccessProject(userId, projectId);
    if (!canAccess) {
      throw new UnauthorizedError('You do not have permission to access this project');
    }

    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError(`Project ${projectId} not found`);
    }

    const participants: ParticipantDto[] = [];

    // Add client
    if (project.clientId) {
      const client = await this.userRepository.findById(project.clientId);
      if (client) {
        participants.push({
          userId: client.id,
          username: client.username,
          email: client.email,
          role: client.role,
          participantType: 'client',
          permissions: [AccessRight.VIEW],
          joinedAt: project.createdAt,
        });
      }
    }

    // Add special users
    const permissions = await this.permissionRepository.findByProjectId(projectId);
    const userPermissions = new Map<string, Set<AccessRight>>();
    
    for (const perm of permissions) {
      if (!userPermissions.has(perm.userId)) {
        userPermissions.set(perm.userId, new Set());
      }
      // Permission.rights is a Set<AccessRight>
      perm.rights.forEach(right => userPermissions.get(perm.userId)!.add(right));
    }

    for (const [uid, permsSet] of userPermissions.entries()) {
      const user = await this.userRepository.findById(uid);
      if (user) {
        participants.push({
          userId: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          participantType: 'special_user',
          permissions: Array.from(permsSet),
          joinedAt: project.createdAt,
        });
      }
    }

    return participants;
  }

  /**
   * Finalizes a project, marking it as completed.
   */
  public async finalizeProject(projectId: string, adminId: string): Promise<void> {
    const canFinalize = await this.authorizationService.canFinalizeProject(adminId, projectId);
    if (!canFinalize) {
      throw new UnauthorizedError('Only admins can finalize projects');
    }

    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError(`Project ${projectId} not found`);
    }

    // Check no pending tasks
    const pendingCount = await this.taskRepository.count({
      projectId,
      status: TaskStatus.PENDING,
    });
    if (pendingCount > 0) {
      throw new BusinessLogicError(`Cannot finalize project with ${pendingCount} pending tasks`);
    }

    project.status = ProjectStatus.FINALIZED;

    await this.projectRepository.save(project);

    // Notify all participants
    const participants = await this.getProjectParticipants(projectId, adminId);
    for (const participant of participants) {
      await this.notificationService.sendNotification({
        recipientId: participant.userId,
        type: NotificationType.PROJECT_FINALIZED,
        title: 'Project Finalized',
        message: `Project ${project.name} has been completed`,
        relatedProjectId: projectId,
      });
    }
  }

  /**
   * Reopens a finalized project.
   */
  public async reopenProject(projectId: string, adminId: string): Promise<void> {
    const isAdmin = await this.authorizationService.isAdmin(adminId);
    if (!isAdmin) {
      throw new UnauthorizedError('Only admins can reopen projects');
    }

    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError(`Project ${projectId} not found`);
    }

    if (project.status !== ProjectStatus.FINALIZED) {
      throw new BusinessLogicError('Project is not finalized');
    }

    project.status = ProjectStatus.ACTIVE;

    await this.projectRepository.save(project);
  }

  /**
   * Checks if a project code already exists in the system.
   */
  public async checkProjectCodeExists(code: string): Promise<boolean> {
    const project = await this.projectRepository.findByCode(code);
    return project !== null;
  }

  /**
   * Validates project data before creation or update.
   */
  public async validateProjectData(
    data: CreateProjectDto | UpdateProjectDto
  ): Promise<ValidationResultDto> {
    const errors = [];

    if ('code' in data && (!data.code || data.code.trim().length === 0)) {
      errors.push(createError('code', 'Project code is required', ValidationErrorCode.REQUIRED));
    }

    if ('name' in data && (!data.name || data.name.trim().length === 0)) {
      errors.push(createError('name', 'Project name is required', ValidationErrorCode.REQUIRED));
    }

    if ('contractDate' in data && 'deliveryDate' in data) {
      if (data.deliveryDate && data.contractDate && data.deliveryDate < data.contractDate) {
        errors.push(
          createError('deliveryDate', 'Delivery date must be after contract date', ValidationErrorCode.DATE_RANGE_INVALID)
        );
      }
    }

    return errors.length > 0 ? invalidResult(errors) : validResult();
  }

  /**
   * Maps project entity to DTO.
   */
  private async mapToDto(project: Project): Promise<ProjectDto> {
    // Get client name
    const client = await this.userRepository.findById(project.clientId);
    const clientName = client ? client.username : 'Unknown';

    const storageFolderId = project.dropboxFolderId;
    const storageFolderUrl = storageFolderId
      ? `https://www.dropbox.com/home${storageFolderId}`
      : null;

    return {
      id: project.id,
      code: project.code,
      name: project.name,
      year: project.year,
      type: project.type,
      description: null,
      clientId: project.clientId,
      clientName,
      coordinateX: project.coordinates?.longitude ?? null,
      coordinateY: project.coordinates?.latitude ?? null,
      contractDate: project.contractDate,
      deliveryDate: project.deliveryDate,
      status: project.status,
      storageFolderId: storageFolderId,
      storageFolderUrl: storageFolderUrl,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      finalizedAt: project.finalizedAt,
    };
  }

  /**
   * Maps project to summary DTO.
   */
  private async mapToSummaryDto(project: Project): Promise<ProjectSummaryDto> {
    // Get client name
    const client = await this.userRepository.findById(project.clientId);
    const clientName = client ? client.username : 'Unknown';

    // Get pending tasks count
    const pendingTasksCount = await this.taskRepository.count({
      projectId: project.id,
      status: TaskStatus.PENDING,
    });
    
    // Get unread messages count (placeholder - needs implementation)
    const unreadMessagesCount = 0;
    
    // Count participants
    const participantCount = 1 + project.specialUserIds.length; // client + special users
    
    return {
      id: project.id,
      code: project.code,
      name: project.name,
      clientId: project.clientId,
      clientName,
      type: project.type,
      deliveryDate: project.deliveryDate,
      status: project.status,
      hasPendingTasks: pendingTasksCount > 0,
      pendingTasksCount,
      unreadMessagesCount,
      participantCount,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  /**
   * Maps project to detailed DTO with related data.
   */
  private async mapToDetailsDto(project: Project, userId: string): Promise<ProjectDetailsDto> {
    // Get tasks, messages, files counts
    const tasks = await this.taskRepository.find({projectId: project.id});
    const messages = await this.messageRepository.count({projectId: project.id});
    const files = await this.fileRepository.count({projectId: project.id});
    const participants = await this.getProjectParticipants(project.id, userId);
    const accessRights = await this.authorizationService.getProjectPermissions(userId, project.id);
    const projectDto = await this.mapToDto(project);

    // Convert AccessRight[] to ProjectPermissionsDto
    const userPermissions = this.convertToProjectPermissions(accessRights);

    // This needs to be refactored to match ProjectDetailsDto structure
    // For now, return a simplified version
    return {
      project: projectDto,
      tasks: [],
      taskStats: { total: tasks.length, pending: 0, inProgress: 0, completed: 0, overdue: 0 },
      recentMessages: [],
      unreadMessagesCount: 0,
      totalMessagesCount: messages,
      participants,
      sections: [],
      totalFilesCount: files,
      currentUserPermissions: userPermissions,
    } as ProjectDetailsDto;
  }

  /**
   * Converts a list of AccessRights to ProjectPermissionsDto.
   */
  private convertToProjectPermissions(accessRights: ReadonlyArray<AccessRight>): ProjectPermissionsDto {
    const rightsSet = new Set(accessRights);
    return {
      canEdit: rightsSet.has(AccessRight.EDIT),
      canDelete: rightsSet.has(AccessRight.DELETE),
      canFinalize: rightsSet.has(AccessRight.EDIT), // Finalize requires edit permission
      canCreateTask: rightsSet.has(AccessRight.EDIT),
      canSendMessage: rightsSet.has(AccessRight.SEND_MESSAGE),
      canUploadFile: rightsSet.has(AccessRight.UPLOAD),
      canDownloadFile: rightsSet.has(AccessRight.DOWNLOAD),
      canManageParticipants: rightsSet.has(AccessRight.EDIT) && rightsSet.has(AccessRight.DELETE),
    };
  }
}
