/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file src/infrastructure/repositories/permission.repository.ts
 * @desc Permission repository implementation using HTTP API backend communication
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {httpClient} from '../http';
import {isValidProjectSection, Permission} from '../../domain/entities/permission';
import {type AccessRight} from '../../domain/enumerations/access-right';
import {type IPermissionRepository} from '../../domain/repositories/permission-repository.interface';

/**
 * API response type for permission data from backend
 */
interface PermissionApiResponse {
  id: string;
  userId: string;
  projectId: string;
  rights: string[];
  sectionAccess: string[];
  grantedBy: string;
  grantedAt: string;
  updatedAt: string;
}

/**
 * Permission repository implementation using HTTP API.
 *
 * Manages special user permissions for project access control.
 * Handles Set<AccessRight> conversion to/from array format.
 *
 * @example
 * ```typescript
 * const repository = new PermissionRepository();
 * const permission = await repository.findByUserAndProject('user_1', 'proj_1');
 * ```
 */
export class PermissionRepository implements IPermissionRepository {
  private readonly baseUrl = '/permissions';

  /**
   * Find permission by unique identifier
   *
   * @param id - Permission ID
   * @returns Permission entity or null if not found
   */
  public async findById(id: string): Promise<Permission | null> {
    try {
      const response = await httpClient.get<PermissionApiResponse>(
        `${this.baseUrl}/${id}`,
      );
      return this.mapToEntity(response.data);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Find permission by user and project
   *
   * @param userId - User ID
   * @param projectId - Project ID
   * @returns Permission entity or null if not found
   */
  public async findByUserAndProject(
    userId: string,
    projectId: string,
  ): Promise<Permission | null> {
    try {
      const response = await httpClient.get<PermissionApiResponse>(
        `${this.baseUrl}?userId=${userId}&projectId=${projectId}`,
      );
      return this.mapToEntity(response.data);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create new permission
   *
   * @param permission - Permission entity to persist
   * @returns Created permission with generated fields
   */
  public async save(permission: Permission): Promise<Permission> {
    const response = await httpClient.post<PermissionApiResponse>(
      this.baseUrl,
      this.mapToApiRequest(permission),
    );
    return this.mapToEntity(response.data);
  }

  /**
   * Update existing permission
   *
   * @param permission - Permission entity with updated data
   * @returns Updated permission entity
   */
  public async update(permission: Permission): Promise<Permission> {
    const response = await httpClient.put<PermissionApiResponse>(
      `${this.baseUrl}/${permission.id}`,
      this.mapToApiRequest(permission),
    );
    return this.mapToEntity(response.data);
  }

  /**
   * Delete permission by ID
   *
   * @param id - Permission ID to delete
   */
  public async delete(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Delete permission by user and project
   *
   * @param userId - User ID
   * @param projectId - Project ID
   */
  public async deleteByUserAndProject(
    userId: string,
    projectId: string,
  ): Promise<void> {
    await httpClient.delete(
      `${this.baseUrl}?userId=${userId}&projectId=${projectId}`,
    );
  }

  /**
   * Find all permissions for user
   *
   * @param userId - User ID
   * @returns Array of user's permissions
   */
  public async findByUserId(userId: string): Promise<Permission[]> {
    const response = await httpClient.get<PermissionApiResponse[]>(
      `${this.baseUrl}?userId=${userId}`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find all permissions for project
   *
   * @param projectId - Project ID
   * @returns Array of project permissions
   */
  public async findByProjectId(projectId: string): Promise<Permission[]> {
    const response = await httpClient.get<PermissionApiResponse[]>(
      `${this.baseUrl}?projectId=${projectId}`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find permissions granted by admin
   *
   * @param adminId - Admin user ID
   * @returns Array of permissions granted by admin
   */
  public async findByGrantedBy(adminId: string): Promise<Permission[]> {
    const response = await httpClient.get<PermissionApiResponse[]>(
      `${this.baseUrl}?grantedBy=${adminId}`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Check if permission exists for user and project
   *
   * @param userId - User ID
   * @param projectId - Project ID
   * @returns True if permission exists
   */
  public async existsByUserAndProject(
    userId: string,
    projectId: string,
  ): Promise<boolean> {
    const permission = await this.findByUserAndProject(userId, projectId);
    return permission !== null;
  }

  /**
   * Delete all permissions for user
   *
   * @param userId - User ID
   */
  public async deleteByUserId(userId: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}?userId=${userId}`);
  }

  /**
   * Delete all permissions for project
   *
   * @param projectId - Project ID
   */
  public async deleteByProjectId(projectId: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}?projectId=${projectId}`);
  }

  /**
   * Count permissions for project
   *
   * @param projectId - Project ID
   * @returns Number of project permissions
   */
  public async countByProjectId(projectId: string): Promise<number> {
    const response = await httpClient.get<{count: number}>(
      `${this.baseUrl}/count?projectId=${projectId}`,
    );
    return response.data.count;
  }

  /**
   * Count permissions for user
   *
   * @param userId - User ID
   * @returns Number of user permissions
   */
  public async countByUserId(userId: string): Promise<number> {
    const response = await httpClient.get<{count: number}>(
      `${this.baseUrl}/count?userId=${userId}`,
    );
    return response.data.count;
  }

  /**
   * Map API response to Permission entity
   *
   * @param data - API response data
   * @returns Permission domain entity
   */
  private mapToEntity(data: PermissionApiResponse): Permission {
    const sectionAccess = (data.sectionAccess ?? []).filter(isValidProjectSection);

    return new Permission({
      id: data.id,
      userId: data.userId,
      projectId: data.projectId,
      rights: new Set(data.rights.map((r) => r as AccessRight)),
      sectionAccess,
      grantedBy: data.grantedBy,
      grantedAt: new Date(data.grantedAt),
      updatedAt: new Date(data.updatedAt),
    });
  }

  /**
   * Map Permission entity to API request payload
   *
   * @param permission - Permission domain entity
   * @returns API request payload
   */
  private mapToApiRequest(permission: Permission): Record<string, unknown> {
    return {
      id: permission.id,
      userId: permission.userId,
      projectId: permission.projectId,
      rights: Array.from(permission.rights),
      sectionAccess: permission.sectionAccess,
      grantedBy: permission.grantedBy,
      grantedAt: permission.grantedAt.toISOString(),
      updatedAt: permission.updatedAt.toISOString(),
    };
  }

  /**
   * Check if error is 404 Not Found
   *
   * @param error - Error object
   * @returns True if 404 error
   */
  private isNotFoundError(error: unknown): boolean {
    const maybeError = error as {status?: number; response?: {status?: number}};
    return maybeError?.status === 404 || maybeError?.response?.status === 404;
  }
}
