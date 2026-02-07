import {
  IPermissionRepository,
} from '@domain/repositories/IPermissionRepository';
import {Permission} from '@domain/entities/Permission';

/**
 * Permission repository implementation
 * Handles permission data persistence
 */
export class PermissionRepository implements IPermissionRepository {
  async findByUserAndProject(
      userId: string,
      projectId: string,
  ): Promise<Permission | null> {
    // TODO: Implement find by user and project logic
    throw new Error('Method not implemented.');
  }

  async save(permission: Permission): Promise<Permission> {
    // TODO: Implement save logic
    throw new Error('Method not implemented.');
  }

  async update(permission: Permission): Promise<Permission> {
    // TODO: Implement update logic
    throw new Error('Method not implemented.');
  }

  async delete(userId: string, projectId: string): Promise<void> {
    // TODO: Implement delete logic
    throw new Error('Method not implemented.');
  }
}
