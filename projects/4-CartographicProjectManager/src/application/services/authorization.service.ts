/**
 * @module application/services/authorization
 * @description Service implementation for authorization and permission checks.
 * @category Application
 */

import {IAuthorizationService} from '../interfaces/authorization-service.interface';
import {
  type IUserRepository,
  type IProjectRepository,
  type ITaskRepository,
  type IFileRepository,
  type IPermissionRepository,
} from '../../domain/repositories';
import {NotFoundError} from './common/errors';
import {UserRole} from '../../domain/enumerations/user-role';
import {AccessRight} from '../../domain/enumerations/access-right';
import {TaskStatus} from '../../domain/enumerations/task-status';

/**
 * Implementation of authorization operations.
 * Provides centralized permission checking for all system operations.
 */
export class AuthorizationService implements IAuthorizationService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly taskRepository: ITaskRepository,
    private readonly fileRepository: IFileRepository,
    private readonly permissionRepository: IPermissionRepository
  ) {}

  /**
   * Checks if a user can access a specific project.
   */
  async canAccessProject(userId: string, projectId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new NotFoundError(`Project ${projectId} not found`);

    // Admin has access to all projects
    if (user.role === UserRole.ADMIN) return true;

    // Client can access assigned projects
    if (user.role === UserRole.CLIENT && project.clientId === userId) return true;

    // Special User needs explicit READ permission
    const permissions = await this.permissionRepository.findByUserAndProject(userId, projectId);
    return permissions.some(p => 
      p.accessRight === AccessRight.READ || 
      p.accessRight === AccessRight.WRITE ||
      p.accessRight === AccessRight.DELETE
    );
  }

  /**
   * Checks if a user can modify a specific project.
   */
  async canModifyProject(userId: string, projectId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new NotFoundError(`Project ${projectId} not found`);

    // Admin can modify all projects
    if (user.role === UserRole.ADMIN) return true;

    // Client cannot modify projects (read-only)
    if (user.role === UserRole.CLIENT) return false;

    // Special User needs WRITE permission
    const permissions = await this.permissionRepository.findByUserAndProject(userId, projectId);
    return permissions.some(p => 
      p.accessRight === AccessRight.WRITE || 
      p.accessRight === AccessRight.DELETE
    );
  }

  /**
   * Checks if a user can delete a specific project.
   */
  async canDeleteProject(userId: string, projectId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new NotFoundError(`Project ${projectId} not found`);

    // Only admins can delete projectsif (user.role === UserRole.ADMIN) return true;

    // Special User needs DELETE permission
    const permissions = await this.permissionRepository.findByUserAndProject(userId, projectId);
    return permissions.some(p => p.accessRight === AccessRight.DELETE);
  }

  /**
   * Checks if a user can finalize a specific project.
   */
  async canFinalizeProject(userId: string, projectId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    // Only admins can finalize projects
    return user.role === UserRole.ADMIN;
  }

  /**
   * Checks if a user can create tasks in a specific project.
   */
  async canCreateTaskInProject(userId: string, projectId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new NotFoundError(`Project ${projectId} not found`);

    // Admin can create tasks in any project
    if (user.role === UserRole.ADMIN) return true;

    // Client can create tasks in assigned projects
    if (user.role === UserRole.CLIENT && project.clientId === userId) return true;

    return false;
  }

  /**
   * Checks if a user can assign a task to another user.
   */
  async canAssignTaskTo(
    userId: string,
    projectId: string,
    assigneeId: string
  ): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    const assignee = await this.userRepository.findById(assigneeId);
    if (!assignee) throw new NotFoundError(`Assignee ${assigneeId} not found`);

    // Admin can assign to anyone
    if (user.role === UserRole.ADMIN) return true;

    // Client can only assign to admin
    if (user.role === UserRole.CLIENT) {
      return assignee.role === UserRole.ADMIN;
    }

    return false;
  }

  /**
   * Checks if a user can modify a specific task.
   */
  async canModifyTask(userId: string, taskId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    const task = await this.taskRepository.findById(taskId);
    if (!task) throw new NotFoundError(`Task ${taskId} not found`);

    // Admin can modify all tasks
    if (user.role === UserRole.ADMIN) return true;

    // Task creator and assignee can modify
    if (task.creatorId === userId || task.assigneeId === userId) return true;

    return false;
  }

  /**
   * Checks if a user can delete a specific task.
   */
  async canDeleteTask(userId: string, taskId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    const task = await this.taskRepository.findById(taskId);
    if (!task) throw new NotFoundError(`Task ${taskId} not found`);

    // Only admin and task creator can delete
    if (user.role === UserRole.ADMIN) return true;
    if (task.creatorId === userId) return true;

    return false;
  }

  /**
   * Checks if a user can change a task to a specific status.
   */
  async canChangeTaskStatus(
    userId: string,
    taskId: string,
    newStatus: TaskStatus
  ): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    const task = await this.taskRepository.findById(taskId);
    if (!task) throw new NotFoundError(`Task ${taskId} not found`);

    // Admin can change to any status
    if (user.role === UserRole.ADMIN) return true;

    // Assignee can change status of assigned tasks
    if (task.assigneeId === userId) return true;

    return false;
  }

  /**
   * Checks if a user can confirm a specific task.
   */
  async canConfirmTask(userId: string, taskId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    const task = await this.taskRepository.findById(taskId);
    if (!task) throw new NotFoundError(`Task ${taskId} not found`);

    // Get project to check if user is the client
    const project = await this.projectRepository.findById(task.projectId);
    if (!project) throw new NotFoundError(`Project ${task.projectId} not found`);

    // Only the project client can confirm tasks
    if (project.clientId === userId) return true;

    // Admin can also confirm
    if (user.role === UserRole.ADMIN) return true;

    return false;
  }

  /**
   * Checks if a user can access messages in a project.
   */
  async canAccessMessages(userId: string, projectId: string): Promise<boolean> {
    // Same as project access
    return this.canAccessProject(userId, projectId);
  }

  /**
   * Checks if a user can send messages in a project.
   */
  async canSendMessage(userId: string, projectId: string): Promise<boolean> {
    // Same as project access
    return this.canAccessProject(userId, projectId);
  }

  /**
   * Checks if a user can upload files to a project.
   */
  async canUploadFile(userId: string, projectId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new NotFoundError(`Project ${projectId} not found`);

    // Admin can upload to any project
    if (user.role === UserRole.ADMIN) return true;

    // Client can upload to assigned projects
    if (user.role === UserRole.CLIENT && project.clientId === userId) return true;

    // Special User needs WRITE permission
    const permissions = await this.permissionRepository.findByUserAndProject(userId, projectId);
    return permissions.some(p => 
      p.accessRight === AccessRight.WRITE || 
      p.accessRight === AccessRight.DELETE
    );
  }

  /**
   * Checks if a user can download a specific file.
   */
  async canDownloadFile(userId: string, fileId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    const file = await this.fileRepository.findById(fileId);
    if (!file) throw new NotFoundError(`File ${fileId} not found`);

    // Check project access
    return this.canAccessProject(userId, file.projectId);
  }

  /**
   * Checks if a user can delete a specific file.
   */
  async canDeleteFile(userId: string, fileId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    const file = await this.fileRepository.findById(fileId);
    if (!file) throw new NotFoundError(`File ${fileId} not found`);

    // Admin can delete any file
    if (user.role === UserRole.ADMIN) return true;

    // File uploader can delete their own files
    if (file.uploadedById === userId) return true;

    return false;
  }

  /**
   * Checks if a user can manage project participants.
   */
  async canManageProjectParticipants(
    userId: string,
    projectId: string
  ): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    // Only admins can manage participants
    return user.role === UserRole.ADMIN;
  }

  /**
   * Checks if a user can export data from the system.
   */
  async canExportData(userId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    // Only admins can export data
    return user.role === UserRole.ADMIN;
  }

  /**
   * Checks if a user can manage system backups.
   */
  async canManageBackups(userId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    // Only admins can manage backups
    return user.role === UserRole.ADMIN;
  }

  /**
   * Gets the complete set of permissions a user has for a project.
   */
  async getProjectPermissions(
    userId: string,
    projectId: string
  ): Promise<Set<AccessRight>> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new NotFoundError(`Project ${projectId} not found`);

    const rights = new Set<AccessRight>();

    // Admin has all rights
    if (user.role === UserRole.ADMIN) {
      rights.add(AccessRight.READ);
      rights.add(AccessRight.WRITE);
      rights.add(AccessRight.DELETE);
      return rights;
    }

    // Client has read access to assigned projects
    if (user.role === UserRole.CLIENT && project.clientId === userId) {
      rights.add(AccessRight.READ);
      return rights;
    }

    // Special User gets rights from permissions
    const permissions = await this.permissionRepository.findByUserAndProject(userId, projectId);
    permissions.forEach(p => rights.add(p.accessRight));

    return rights;
  }

  /**
   * Gets the role of a specific user in the system.
   */
  async getUserRole(userId: string): Promise<UserRole> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    return user.role;
  }

  /**
   * Checks if a user has administrator privileges.
   */
  async isAdmin(userId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    return user.role === UserRole.ADMIN;
  }
}
