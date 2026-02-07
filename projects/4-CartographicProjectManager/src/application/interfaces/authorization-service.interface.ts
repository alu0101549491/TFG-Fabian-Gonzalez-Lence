/**
 * @module application/interfaces/authorization-service
 * @description Interface for the Authorization Service.
 * Defines the contract for permission and access control checks.
 * @category Application
 */

import {type Permission} from '@domain/entities/permission';

/**
 * Contract for authorization operations.
 * Centralized permission checking for all system operations.
 */
export interface IAuthorizationService {
  /**
   * Checks if a user can access a specific project.
   * @param userId - The user's unique ID.
   * @param projectId - The project's unique ID.
   * @returns True if the user has access to the project.
   */
  canAccessProject(userId: string, projectId: string): Promise<boolean>;

  /**
   * Checks if a user can modify a specific task.
   * @param userId - The user's unique ID.
   * @param taskId - The task's unique ID.
   * @returns True if the user can modify the task.
   */
  canModifyTask(userId: string, taskId: string): Promise<boolean>;

  /**
   * Checks if a user can delete a specific task.
   * @param userId - The user's unique ID.
   * @param taskId - The task's unique ID.
   * @returns True if the user can delete the task.
   */
  canDeleteTask(userId: string, taskId: string): Promise<boolean>;

  /**
   * Checks if a user can view messages in a project.
   * @param userId - The user's unique ID.
   * @param projectId - The project's unique ID.
   * @returns True if the user can view messages.
   */
  canViewMessages(userId: string, projectId: string): Promise<boolean>;

  /**
   * Gets the set of permissions a user has for a project.
   * @param userId - The user's unique ID.
   * @param projectId - The project's unique ID.
   * @returns The permission set for the user-project pair.
   */
  getPermissions(userId: string, projectId: string): Promise<Set<Permission>>;
}
