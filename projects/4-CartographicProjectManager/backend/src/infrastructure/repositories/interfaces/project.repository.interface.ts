/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 8, 2026
 * @file backend/src/infrastructure/repositories/interfaces/project.repository.interface.ts
 * @desc Project repository interface for Prisma-based data access
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {Project, ProjectStatus, ProjectType} from '@prisma/client';

/**
 * Project repository interface
 */
export interface IProjectRepository {
  findById(id: string): Promise<Project | null>;
  findByCode(code: string): Promise<Project | null>;
  findAll(): Promise<Project[]>;
  findByClientId(clientId: string): Promise<Project[]>;
  findBySpecialUserId(userId: string): Promise<Project[]>;
  findByStatus(status: ProjectStatus): Promise<Project[]>;
  findByYear(year: number): Promise<Project[]>;
  findByType(type: ProjectType): Promise<Project[]>;
  create(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'finalizedAt'>): Promise<Project>;
  update(id: string, data: Partial<Project>): Promise<Project>;
  delete(id: string): Promise<void>;
  addSpecialUser(projectId: string, userId: string): Promise<void>;
  removeSpecialUser(projectId: string, userId: string): Promise<void>;
  getNextSequenceForYear(year: number): Promise<number>;
}
