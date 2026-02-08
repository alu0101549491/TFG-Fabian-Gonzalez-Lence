/**
 * @module domain/repositories/permission-repository
 * @description Repository interface for Permission entity persistence operations.
 * @category Domain
 */

import {Permission} from '../entities/permission';

/**
 * Abstraction for Permission data access operations.
 * Manages user-project permission pairs.
 * Implemented by infrastructure layer repositories.
 */
export interface IPermissionRepository {
  /**
   * Finds a permission by its unique identifier.
   * @param id - The permission's unique ID.
   * @returns The found permission or null if not found.
   * @throws Error if database connection fails.
   */
  findById(id: string): Promise<Permission | null>;

  /**
   * Finds permissions for a specific user-project combination.
   * @param userId - The user's unique ID.
   * @param projectId - The project's unique ID.
   * @returns The permission record or null if none exists.
   * @throws Error if database connection fails.
   */
  findByUserAndProject(
    userId: string,
    projectId: string,
  ): Promise<Permission | null>;

  /**
   * Persists a new permission record.
   * @param permission - The permission entity to save.
   * @returns The saved permission with generated fields populated.
   * @throws Error if permission already exists or database operation fails.
   */
  save(permission: Permission): Promise<Permission>;

  /**
   * Updates an existing permission record.
   * @param permission - The permission entity with updated data.
   * @returns The updated permission.
   * @throws Error if permission doesn't exist or database operation fails.
   */
  update(permission: Permission): Promise<Permission>;

  /**
   * Deletes a permission record by its unique identifier.
   * @param id - The permission's unique ID.
   * @throws Error if permission doesn't exist or database operation fails.
   */
  delete(id: string): Promise<void>;

  /**
   * Deletes a permission record for a user-project pair.
   * @param userId - The user's unique ID.
   * @param projectId - The project's unique ID.
   * @throws Error if permission doesn't exist or database operation fails.
   */
  deleteByUserAndProject(userId: string, projectId: string): Promise<void>;

  /**
   * Finds all permissions for a specific user.
   * @param userId - The user's unique ID.
   * @returns Array of permissions the user has (empty if none found).
   * @throws Error if database connection fails.
   */
  findByUserId(userId: string): Promise<Permission[]>;

  /**
   * Finds all permissions for a specific project.
   * @param projectId - The project's unique ID.
   * @returns Array of permissions for the project (empty if none found).
   * @throws Error if database connection fails.
   */
  findByProjectId(projectId: string): Promise<Permission[]>;

  /**
   * Finds all permissions granted by a specific user.
   * @param userId - The granter's unique ID.
   * @returns Array of permissions granted by the user (empty if none found).
   * @throws Error if database connection fails.
   */
  findByGrantedBy(userId: string): Promise<Permission[]>;

  /**
   * Checks if a permission exists for a user-project combination.
   * @param userId - The user's unique ID.
   * @param projectId - The project's unique ID.
   * @returns True if a permission exists, false otherwise.
   * @throws Error if database connection fails.
   */
  existsByUserAndProject(userId: string, projectId: string): Promise<boolean>;

  /**
   * Deletes all permissions for a specific user.
   * @param userId - The user's unique ID.
   * @throws Error if database operation fails.
   */
  deleteByUserId(userId: string): Promise<void>;

  /**
   * Deletes all permissions for a specific project (cascade delete).
   * @param projectId - The project's unique ID.
   * @throws Error if database operation fails.
   */
  deleteByProjectId(projectId: string): Promise<void>;

  /**
   * Counts the total number of permissions for a project.
   * @param projectId - The project's unique ID.
   * @returns The count of permissions for the project.
   * @throws Error if database connection fails.
   */
  countByProjectId(projectId: string): Promise<number>;

  /**
   * Counts the total number of permissions for a user.
   * @param userId - The user's unique ID.
   * @returns The count of permissions the user has.
   * @throws Error if database connection fails.
   */
  countByUserId(userId: string): Promise<number>;
}
