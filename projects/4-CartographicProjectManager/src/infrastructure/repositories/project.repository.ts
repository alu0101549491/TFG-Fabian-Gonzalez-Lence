/**
 * @module infrastructure/repositories/project-repository
 * @description Concrete implementation of the IProjectRepository interface.
 * Uses Axios HTTP client to communicate with the backend API.
 * @category Infrastructure
 */

import {type IProjectRepository} from '@domain/repositories/project-repository.interface';
import {type Project} from '@domain/entities/project';

/**
 * HTTP-based implementation of the Project repository.
 */
export class ProjectRepository implements IProjectRepository {
  async findById(id: string): Promise<Project | null> {
    // TODO: Implement API call GET /api/projects/:id
    throw new Error('Method not implemented.');
  }

  async save(project: Project): Promise<Project> {
    // TODO: Implement API call POST /api/projects
    throw new Error('Method not implemented.');
  }

  async update(project: Project): Promise<Project> {
    // TODO: Implement API call PUT /api/projects/:id
    throw new Error('Method not implemented.');
  }

  async findByClientId(clientId: string): Promise<Project[]> {
    // TODO: Implement API call GET /api/projects?clientId=:clientId
    throw new Error('Method not implemented.');
  }

  async findBySpecialUserId(userId: string): Promise<Project[]> {
    // TODO: Implement API call GET /api/projects?specialUserId=:userId
    throw new Error('Method not implemented.');
  }

  async findAll(): Promise<Project[]> {
    // TODO: Implement API call GET /api/projects
    throw new Error('Method not implemented.');
  }
}
