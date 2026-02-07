import {IProjectRepository} from '@domain/repositories/IProjectRepository';
import {Project} from '@domain/entities/Project';

/**
 * Project repository implementation
 * Handles project data persistence
 */
export class ProjectRepository implements IProjectRepository {
  async findById(id: string): Promise<Project | null> {
    // TODO: Implement find by id logic
    throw new Error('Method not implemented.');
  }

  async save(project: Project): Promise<Project> {
    // TODO: Implement save logic
    throw new Error('Method not implemented.');
  }

  async update(project: Project): Promise<Project> {
    // TODO: Implement update logic
    throw new Error('Method not implemented.');
  }

  async findByClientId(clientId: string): Promise<Project[]> {
    // TODO: Implement find by client id logic
    throw new Error('Method not implemented.');
  }

  async findBySpecialUserId(userId: string): Promise<Project[]> {
    // TODO: Implement find by special user id logic
    throw new Error('Method not implemented.');
  }

  async findAll(): Promise<Project[]> {
    // TODO: Implement find all logic
    throw new Error('Method not implemented.');
  }
}
