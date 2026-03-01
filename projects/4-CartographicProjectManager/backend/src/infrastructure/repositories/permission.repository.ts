/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 1, 2026
 * @file src/infrastructure/repositories/permission.repository.ts
 * @desc Permission repository implementation using Prisma
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

import type {Permission, AccessRight} from '@prisma/client';
import {prisma} from '../database/prisma.client.js';
import {DatabaseError} from '@shared/errors.js';

/**
 * Permission repository for managing user access rights to projects
 */
export class PermissionRepository {
  /**
   * Find permission by user ID and project ID
   * @param userId - User ID
   * @param projectId - Project ID
   * @returns Permission record or null if not found
   */
  public async findByUserAndProject(userId: string, projectId: string): Promise<Permission | null> {
    try {
      return await prisma.permission.findUnique({
        where: {
          userId_projectId: {
            userId,
            projectId,
          },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find permission');
    }
  }

  /**
   * Find all permissions for a user
   * @param userId - User ID
   * @returns Array of permission records
   */
  public async findByUserId(userId: string): Promise<Permission[]> {
    try {
      return await prisma.permission.findMany({
        where: {userId},
      });
    } catch (error) {
      throw new DatabaseError('Failed to find permissions by user ID');
    }
  }

  /**
   * Find all permissions for a project
   * @param projectId - Project ID
   * @returns Array of permission records
   */
  public async findByProjectId(projectId: string): Promise<Permission[]> {
    try {
      return await prisma.permission.findMany({
        where: {projectId},
      });
    } catch (error) {
      throw new DatabaseError('Failed to find permissions by project ID');
    }
  }

  /**
   * Create a new permission
   * @param data - Permission data
   * @returns Created permission record
   */
  public async create(data: {
    userId: string;
    projectId: string;
    rights: AccessRight[];
    grantedBy: string;
  }): Promise<Permission> {
    try {
      return await prisma.permission.create({
        data,
      });
    } catch (error) {
      throw new DatabaseError('Failed to create permission');
    }
  }

  /**
   * Update permission rights
   * @param userId - User ID
   * @param projectId - Project ID
   * @param rights - New access rights
   * @returns Updated permission record
   */
  public async update(userId: string, projectId: string, rights: AccessRight[]): Promise<Permission> {
    try {
      return await prisma.permission.update({
        where: {
          userId_projectId: {
            userId,
            projectId,
          },
        },
        data: {rights},
      });
    } catch (error) {
      throw new DatabaseError('Failed to update permission');
    }
  }

  /**
   * Delete a permission
   * @param userId - User ID
   * @param projectId - Project ID
   */
  public async delete(userId: string, projectId: string): Promise<void> {
    try {
      await prisma.permission.delete({
        where: {
          userId_projectId: {
            userId,
            projectId,
          },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to delete permission');
    }
  }
}
