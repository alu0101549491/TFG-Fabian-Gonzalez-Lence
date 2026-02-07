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
   * Finds permissions for a specific user-project combination.
   * @param userId - The user's unique ID.
   * @param projectId - The project's unique ID.
   * @returns The permission record or null if none exists.
   */
  findByUserAndProject(
    userId: string,
    projectId: string,
  ): Promise<Permission | null>;

  /**
   * Persists a new permission record.
   * @param permission - The permission entity to save.
   * @returns The saved permission.
   */
  save(permission: Permission): Promise<Permission>;

  /**
   * Updates an existing permission record.
   * @param permission - The permission entity with updated data.
   * @returns The updated permission.
   */
  update(permission: Permission): Promise<Permission>;

  /**
   * Deletes a permission record for a user-project pair.
   * @param userId - The user's unique ID.
   * @param projectId - The project's unique ID.
   */
  delete(userId: string, projectId: string): Promise<void>;
}
