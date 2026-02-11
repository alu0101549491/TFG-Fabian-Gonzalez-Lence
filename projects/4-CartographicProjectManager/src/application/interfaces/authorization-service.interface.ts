/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file application/interfaces/authorization-service.interface.ts
 * @desc Service interface for authorization and permission checks.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {TaskStatus} from '../../domain/enumerations/task-status';
import {AccessRight} from '../../domain/enumerations/access-right';
import {UserRole} from '../../domain/enumerations/user-role';

/**
 * Service interface for authorization operations.
 * Provides centralized permission checking for all system operations
 * including projects, tasks, messages, files, and administrative functions.
 */
export interface IAuthorizationService {
  /**
   * Checks if a user can access a specific project.
   * @param userId - The unique identifier of the user
   * @param projectId - The unique identifier of the project
   * @returns True if the user has read access to the project
   * @throws {NotFoundError} If user or project doesn't exist
   */
  canAccessProject(userId: string, projectId: string): Promise<boolean>;

  /**
   * Checks if a user can modify a specific project.
   * @param userId - The unique identifier of the user
   * @param projectId - The unique identifier of the project
   * @returns True if the user has write access to the project
   * @throws {NotFoundError} If user or project doesn't exist
   */
  canModifyProject(userId: string, projectId: string): Promise<boolean>;

  /**
   * Checks if a user can delete a specific project.
   * @param userId - The unique identifier of the user
   * @param projectId - The unique identifier of the project
   * @returns True if the user has delete permission for the project
   * @throws {NotFoundError} If user or project doesn't exist
   */
  canDeleteProject(userId: string, projectId: string): Promise<boolean>;

  /**
   * Checks if a user can finalize a specific project.
   * @param userId - The unique identifier of the user
   * @param projectId - The unique identifier of the project
   * @returns True if the user can finalize the project
   * @throws {NotFoundError} If user or project doesn't exist
   */
  canFinalizeProject(userId: string, projectId: string): Promise<boolean>;

  /**
   * Checks if a user can create tasks in a specific project.
   * @param userId - The unique identifier of the user
   * @param projectId - The unique identifier of the project
   * @returns True if the user can create tasks in the project
   * @throws {NotFoundError} If user or project doesn't exist
   */
  canCreateTaskInProject(userId: string, projectId: string): Promise<boolean>;

  /**
   * Checks if a user can assign a task to another user.
   * @param userId - The unique identifier of the user performing the assignment
   * @param projectId - The unique identifier of the project
   * @param assigneeId - The unique identifier of the user to be assigned
   * @returns True if the user can assign tasks to the specified assignee
   * @throws {NotFoundError} If any user or project doesn't exist
   */
  canAssignTaskTo(
    userId: string,
    projectId: string,
    assigneeId: string,
  ): Promise<boolean>;

  /**
   * Checks if a user can modify a specific task.
   * @param userId - The unique identifier of the user
   * @param taskId - The unique identifier of the task
   * @returns True if the user can modify the task
   * @throws {NotFoundError} If user or task doesn't exist
   */
  canModifyTask(userId: string, taskId: string): Promise<boolean>;

  /**
   * Checks if a user can delete a specific task.
   * @param userId - The unique identifier of the user
   * @param taskId - The unique identifier of the task
   * @returns True if the user can delete the task
   * @throws {NotFoundError} If user or task doesn't exist
   */
  canDeleteTask(userId: string, taskId: string): Promise<boolean>;

  /**
   * Checks if a user can change a task to a specific status.
   * @param userId - The unique identifier of the user
   * @param taskId - The unique identifier of the task
   * @param newStatus - The target status for the transition
   * @returns True if the user can change the task to the specified status
   * @throws {NotFoundError} If user or task doesn't exist
   */
  canChangeTaskStatus(
    userId: string,
    taskId: string,
    newStatus: TaskStatus,
  ): Promise<boolean>;

  /**
   * Checks if a user can confirm a specific task.
   * @param userId - The unique identifier of the user
   * @param taskId - The unique identifier of the task
   * @returns True if the user can confirm the task completion
   * @throws {NotFoundError} If user or task doesn't exist
   */
  canConfirmTask(userId: string, taskId: string): Promise<boolean>;

  /**
   * Checks if a user can access messages in a project.
   * @param userId - The unique identifier of the user
   * @param projectId - The unique identifier of the project
   * @returns True if the user can read messages in the project
   * @throws {NotFoundError} If user or project doesn't exist
   */
  canAccessMessages(userId: string, projectId: string): Promise<boolean>;

  /**
   * Checks if a user can send messages in a project.
   * @param userId - The unique identifier of the user
   * @param projectId - The unique identifier of the project
   * @returns True if the user can send messages in the project
   * @throws {NotFoundError} If user or project doesn't exist
   */
  canSendMessage(userId: string, projectId: string): Promise<boolean>;

  /**
   * Checks if a user can upload files to a project.
   * @param userId - The unique identifier of the user
   * @param projectId - The unique identifier of the project
   * @returns True if the user can upload files to the project
   * @throws {NotFoundError} If user or project doesn't exist
   */
  canUploadFile(userId: string, projectId: string): Promise<boolean>;

  /**
   * Checks if a user can download a specific file.
   * @param userId - The unique identifier of the user
   * @param fileId - The unique identifier of the file
   * @returns True if the user can download the file
   * @throws {NotFoundError} If user or file doesn't exist
   */
  canDownloadFile(userId: string, fileId: string): Promise<boolean>;

  /**
   * Checks if a user can delete a specific file.
   * @param userId - The unique identifier of the user
   * @param fileId - The unique identifier of the file
   * @returns True if the user can delete the file
   * @throws {NotFoundError} If user or file doesn't exist
   */
  canDeleteFile(userId: string, fileId: string): Promise<boolean>;

  /**
   * Checks if a user can manage project participants.
   * @param userId - The unique identifier of the user
   * @param projectId - The unique identifier of the project
   * @returns True if the user can add/remove participants
   * @throws {NotFoundError} If user or project doesn't exist
   */
  canManageProjectParticipants(
    userId: string,
    projectId: string,
  ): Promise<boolean>;

  /**
   * Checks if a user can export data from the system.
   * @param userId - The unique identifier of the user
   * @returns True if the user has export permissions
   * @throws {NotFoundError} If user doesn't exist
   */
  canExportData(userId: string): Promise<boolean>;

  /**
   * Checks if a user can manage system backups.
   * @param userId - The unique identifier of the user
   * @returns True if the user has backup management permissions
   * @throws {NotFoundError} If user doesn't exist
   */
  canManageBackups(userId: string): Promise<boolean>;

  /**
   * Gets the complete set of permissions a user has for a project.
   * @param userId - The unique identifier of the user
   * @param projectId - The unique identifier of the project
   * @returns Set of access rights the user has for the project
   * @throws {NotFoundError} If user or project doesn't exist
   */
  getProjectPermissions(
    userId: string,
    projectId: string,
  ): Promise<Set<AccessRight>>;

  /**
   * Gets the role of a specific user in the system.
   * @param userId - The unique identifier of the user
   * @returns The user's role
   * @throws {NotFoundError} If user doesn't exist
   */
  getUserRole(userId: string): Promise<UserRole>;

  /**
   * Checks if a user has administrator privileges.
   * @param userId - The unique identifier of the user
   * @returns True if the user is an administrator
   * @throws {NotFoundError} If user doesn't exist
   */
  isAdmin(userId: string): Promise<boolean>;
}
   * @returns The permission set for the user-project pair.
   */
  getPermissions(userId: string, projectId: string): Promise<Set<Permission>>;
}
