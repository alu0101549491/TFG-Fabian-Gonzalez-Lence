/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file application/services/authorization.service.ts
 * @desc Service implementation for authorization and permission checks.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
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
  public async canAccessProject(userId: string, projectId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new NotFoundError(`Project ${projectId} not found`);

    // Admin has access to all projects
    if (user.role === UserRole.ADMINISTRATOR) return true;

    // Client can access assigned projects
    if (user.role === UserRole.CLIENT && project.clientId === userId) return true;

    // Special User needs explicit VIEW permission
    const permission = await this.permissionRepository.findByUserAndProject(userId, projectId);
    return permission ? permission.canView() : false;
  }

  /**
   * Checks if a user can modify a specific project.
   */
  public async canModifyProject(userId: string, projectId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new NotFoundError(`Project ${projectId} not found`);

    // Admin can modify all projects
    if (user.role === UserRole.ADMINISTRATOR) return true;

    // Client cannot modify projects (read-only)
    if (user.role === UserRole.CLIENT) return false;

    // Special User needs EDIT permission
    const permission = await this.permissionRepository.findByUserAndProject(userId, projectId);
    return permission ? (permission.canEdit() || permission.canDelete()) : false;
  }

  /**
   * Checks if a user can delete a specific project.
   */
  public async canDeleteProject(userId: string, projectId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new NotFoundError(`Project ${projectId} not found`);

    // Only admins can delete projects
    if (user.role === UserRole.ADMINISTRATOR) return true;

    // Special User needs DELETE permission
    const permission = await this.permissionRepository.findByUserAndProject(userId, projectId);
    return permission ? permission.canDelete() : false;
  }

  /**
   * Checks if a user can finalize a specific project.
   */
  public async canFinalizeProject(userId: string, projectId: string): Promise<boolean> {
    void projectId;
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    // Only admins can finalize projects
    return user.role === UserRole.ADMINISTRATOR;
  }

  /**
   * Checks if a user can create tasks in a specific project.
   */
  public async canCreateTaskInProject(userId: string, projectId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new NotFoundError(`Project ${projectId} not found`);

    // Admin can create tasks in any project
    if (user.role === UserRole.ADMINISTRATOR) return true;

    // Client can create tasks in assigned projects
    if (user.role === UserRole.CLIENT && project.clientId === userId) return true;

    return false;
  }

  /**
   * Checks if a user can assign a task to another user.
   */
  public async canAssignTaskTo(
    userId: string,
    projectId: string,
    assigneeId: string
  ): Promise<boolean> {
    void projectId;
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    const assignee = await this.userRepository.findById(assigneeId);
    if (!assignee) throw new NotFoundError(`Assignee ${assigneeId} not found`);

    // Admin can assign to anyone
    if (user.role === UserRole.ADMINISTRATOR) return true;

    // Client can only assign to admin
    if (user.role === UserRole.CLIENT) {
      return assignee.role === UserRole.ADMINISTRATOR;
    }

    return false;
  }

  /**
   * Checks if a user can modify a specific task.
   */
  public async canModifyTask(userId: string, taskId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    const task = await this.taskRepository.findById(taskId);
    if (!task) throw new NotFoundError(`Task ${taskId} not found`);

    // Admin can modify all tasks
    if (user.role === UserRole.ADMINISTRATOR) return true;

    // Task creator and assignee can modify
    if (task.creatorId === userId || task.assigneeId === userId) return true;

    return false;
  }

  /**
   * Checks if a user can delete a specific task.
   */
  public async canDeleteTask(userId: string, taskId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    const task = await this.taskRepository.findById(taskId);
    if (!task) throw new NotFoundError(`Task ${taskId} not found`);

    // Only admin and task creator can delete
    if (user.role === UserRole.ADMINISTRATOR) return true;
    if (task.creatorId === userId) return true;

    return false;
  }

  /**
   * Checks if a user can change a task to a specific status.
   */
  public async canChangeTaskStatus(
    userId: string,
    taskId: string,
    newStatus: TaskStatus
  ): Promise<boolean> {
    void newStatus;
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    const task = await this.taskRepository.findById(taskId);
    if (!task) throw new NotFoundError(`Task ${taskId} not found`);

    // Admin can change to any status
    if (user.role === UserRole.ADMINISTRATOR) return true;

    // Assignee can change status of assigned tasks
    if (task.assigneeId === userId) return true;

    return false;
  }

  /**
   * Checks if a user can confirm a specific task.
   */
  public async canConfirmTask(userId: string, taskId: string): Promise<boolean> {
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
    if (user.role === UserRole.ADMINISTRATOR) return true;

    return false;
  }

  /**
   * Checks if a user can access messages in a project.
   */
  public async canAccessMessages(userId: string, projectId: string): Promise<boolean> {
    // Same as project access
    return this.canAccessProject(userId, projectId);
  }

  /**
   * Checks if a user can send messages in a project.
   */
  public async canSendMessage(userId: string, projectId: string): Promise<boolean> {
    // Same as project access
    return this.canAccessProject(userId, projectId);
  }

  /**
   * Checks if a user can upload files to a project.
   */
  public async canUploadFile(userId: string, projectId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new NotFoundError(`Project ${projectId} not found`);

    // Admin can upload to any project
    if (user.role === UserRole.ADMINISTRATOR) return true;

    // Client can upload to assigned projects
    if (user.role === UserRole.CLIENT && project.clientId === userId) return true;

    // Special User needs UPLOAD permission
    const permission = await this.permissionRepository.findByUserAndProject(userId, projectId);
    return permission ? permission.canUpload() : false;
  }

  /**
   * Checks if a user can download a specific file.
   */
  public async canDownloadFile(userId: string, fileId: string): Promise<boolean> {
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
  public async canDeleteFile(userId: string, fileId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    const file = await this.fileRepository.findById(fileId);
    if (!file) throw new NotFoundError(`File ${fileId} not found`);

    // Admin can delete any file
    if (user.role === UserRole.ADMINISTRATOR) return true;

    // File uploader can delete their own files
    if (file.uploadedBy === userId) return true;

    return false;
  }

  /**
   * Checks if a user can manage project participants.
   */
  public async canManageProjectParticipants(
    userId: string,
    projectId: string
  ): Promise<boolean> {
    void projectId;
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    // Only admins can manage participants
    return user.role === UserRole.ADMINISTRATOR;
  }

  /**
   * Checks if a user can export data from the system.
   */
  public async canExportData(userId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    // Only admins can export data
    return user.role === UserRole.ADMINISTRATOR;
  }

  /**
   * Checks if a user can manage system backups.
   */
  public async canManageBackups(userId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    // Only admins can manage backups
    return user.role === UserRole.ADMINISTRATOR;
  }

  /**
   * Gets the complete set of permissions a user has for a project.
   */
  public async getProjectPermissions(
    userId: string,
    projectId: string
  ): Promise<Set<AccessRight>> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new NotFoundError(`Project ${projectId} not found`);

    const rights = new Set<AccessRight>();

    // Admin has all rights
    if (user.role === UserRole.ADMINISTRATOR) {
      rights.add(AccessRight.VIEW);
      rights.add(AccessRight.DOWNLOAD);
      rights.add(AccessRight.EDIT);
      rights.add(AccessRight.DELETE);
      rights.add(AccessRight.UPLOAD);
      rights.add(AccessRight.SEND_MESSAGE);
      return rights;
    }

    // Client has view and download access to assigned projects
    if (user.role === UserRole.CLIENT && project.clientId === userId) {
      rights.add(AccessRight.VIEW);
      rights.add(AccessRight.DOWNLOAD);
      return rights;
    }

    // Special User gets rights from permissions
    const permission = await this.permissionRepository.findByUserAndProject(userId, projectId);
    if (permission) {
      return permission.rights;
    }

    return rights;
  }

  /**
   * Gets the role of a specific user in the system.
   */
  public async getUserRole(userId: string): Promise<UserRole> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    return user.role;
  }

  /**
   * Checks if a user has administrator privileges.
   */
  public async isAdmin(userId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    return user.role === UserRole.ADMINISTRATOR;
  }
}
