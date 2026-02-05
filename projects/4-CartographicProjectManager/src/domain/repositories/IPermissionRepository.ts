import {Permission} from '../entities/Permission';

/**
 * Repository interface for Permission entity persistence
 */
export interface IPermissionRepository {
  /**
   * Finds permission for user on project
   * @param userId - User ID
   * @param projectId - Project ID
   * @returns Permission entity or null if not found
   */
  findByUserAndProject(
    userId: string,
    projectId: string,
  ): Promise<Permission | null>;

  /**
   * Saves a new permission
   * @param permission - Permission entity to save
   * @returns Saved permission entity
   */
  save(permission: Permission): Promise<Permission>;

  /**
   * Updates an existing permission
   * @param permission - Permission entity to update
   * @returns Updated permission entity
   */
  update(permission: Permission): Promise<Permission>;

  /**
   * Deletes a permission
   * @param userId - User ID
   * @param projectId - Project ID
   */
  delete(userId: string, projectId: string): Promise<void>;
}