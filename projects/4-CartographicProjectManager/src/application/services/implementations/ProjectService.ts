import {IProjectService} from '../interfaces/IProjectService';
import {IProjectRepository} from '@domain/repositories/IProjectRepository';
import {Project} from '@domain/entities/Project';
import {ProjectData} from '../../dtos/ProjectData';
import {Permission} from '@domain/entities/Permission';

/**
 * Project service implementation
 */
export class ProjectService implements IProjectService {
  constructor(
    private readonly projectRepository: IProjectRepository,
  ) {}

  async createProject(projectData: ProjectData): Promise<Project> {
    // TODO: Implement create project logic
    throw new Error('Method not implemented.');
  }

  async assignProjectToClient(
      projectId: string,
      clientId: string,
  ): Promise<void> {
    // TODO: Implement assign project logic
    throw new Error('Method not implemented.');
  }

  async addSpecialUserToProject(
      projectId: string,
      userId: string,
      permissions: Set<Permission>,
  ): Promise<void> {
    // TODO: Implement add special user logic
    throw new Error('Method not implemented.');
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    // TODO: Implement get projects logic
    throw new Error('Method not implemented.');
  }

  async finalizeProject(projectId: string): Promise<void> {
    // TODO: Implement finalize project logic
    throw new Error('Method not implemented.');
  }

  async getProjectDetails(
      projectId: string,
      userId: string,
  ): Promise<Project> {
    // TODO: Implement get project details logic
    throw new Error('Method not implemented.');
  }
}
