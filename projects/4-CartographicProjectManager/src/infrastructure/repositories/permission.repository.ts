/**
 * @module infrastructure/repositories/permission-repository
 * @description Concrete implementation of the IPermissionRepository interface.
 * @category Infrastructure
 */

import {type IPermissionRepository} from '@domain/repositories/permission-repository.interface';
import {type Permission} from '@domain/entities/permission';

/**
 * HTTP-based implementation of the Permission repository.
 */
export class PermissionRepository implements IPermissionRepository {
  async findByUserAndProject(
    userId: string,
    projectId: string,
  ): Promise<Permission | null> {
    // TODO: Implement API call GET /api/permissions?userId=&projectId=
    throw new Error('Method not implemented.');
  }

  async save(permission: Permission): Promise<Permission> {
    // TODO: Implement API call POST /api/permissions
    throw new Error('Method not implemented.');
  }

  async update(permission: Permission): Promise<Permission> {
    // TODO: Implement API call PUT /api/permissions
    throw new Error('Method not implemented.');
  }

  async delete(userId: string, projectId: string): Promise<void> {
    // TODO: Implement API call DELETE /api/permissions
    throw new Error('Method not implemented.');
  }
}
