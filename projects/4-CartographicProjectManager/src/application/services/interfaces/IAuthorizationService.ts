import {Permission} from '@domain/entities/Permission';

/**
 * Authorization service interface
 * Handles permission checks and access control
 */
export interface IAuthorizationService {
  /**
   * Checks if user can access project
   * @param userId - User ID
   * @param projectId - Project ID
   * @returns True if user has access
   */
  canAccessProject(userId: string, projectId: string): Promise<boolean>;

  /**
   * Checks if user can modify task
   * @param userId - User ID
   * @param taskId - Task ID
   * @returns True if user can modify
   */
  canModifyTask(userId: string, taskId: string): Promise<boolean>;

  /**
   * Checks if user can delete task
   * @param userId - User ID
   * @param taskId - Task ID
   * @returns True if user can delete
   */
  canDeleteTask(userId: string, taskId: string): Promise<boolean>;

  /**
   * Checks if user can view messages
   * @param userId - User ID
   * @param projectId - Project ID
   * @returns True if user can view messages
   */
  canViewMessages(userId: string, projectId: string): Promise<boolean>;

  /**
   * Gets user permissions for project
   * @param userId - User ID
   * @param projectId - Project ID
   * @returns Set of permissions
   */
  getPermissions(userId: string, projectId: string): Promise<Set<Permission>>;
}