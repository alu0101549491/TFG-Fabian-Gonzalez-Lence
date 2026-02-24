/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file src/infrastructure/repositories/project.repository.ts
 * @desc Project repository implementation using Prisma
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {Project, ProjectStatus, ProjectType} from '@prisma/client';
import type {IProjectRepository} from '@domain/repositories/project.repository.interface.js';
import {prisma} from '../database/prisma.client.js';
import {DatabaseError} from '@shared/errors.js';

/**
 * Project repository implementation
 */
export class ProjectRepository implements IProjectRepository {
  public async findById(id: string): Promise<Project | null> {
    try {
      return await prisma.project.findUnique({
        where: {id},
        include: {
          client: true,
          specialUsers: {include: {user: true}},
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find project by ID');
    }
  }

  public async findByCode(code: string): Promise<Project | null> {
    try {
      return await prisma.project.findUnique({where: {code}});
    } catch (error) {
      throw new DatabaseError('Failed to find project by code');
    }
  }

  public async findAll(): Promise<Project[]> {
    try {
      return await prisma.project.findMany({
        include: {
          client: true,
          specialUsers: {include: {user: true}},
        },
        orderBy: {createdAt: 'desc'},
      });
    } catch (error) {
      throw new DatabaseError('Failed to fetch all projects');
    }
  }

  public async findByClientId(clientId: string): Promise<Project[]> {
    try {
      return await prisma.project.findMany({
        where: {clientId},
        include: {client: true},
      });
    } catch (error) {
      throw new DatabaseError('Failed to find projects by client ID');
    }
  }

  public async findBySpecialUserId(userId: string): Promise<Project[]> {
    try {
      return await prisma.project.findMany({
        where: {
          specialUsers: {
            some: {userId},
          },
        },
        include: {client: true},
      });
    } catch (error) {
      throw new DatabaseError('Failed to find projects by special user ID');
    }
  }

  public async findByCreatorId(creatorId: string): Promise<Project[]> {
    try {
      return await prisma.project.findMany({
        where: {creatorId},
        include: {client: true},
      });
    } catch (error) {
      throw new DatabaseError('Failed to find projects by creator ID');
    }
  }

  public async findByStatus(status: ProjectStatus): Promise<Project[]> {
    try {
      return await prisma.project.findMany({
        where: {status},
        include: {client: true},
      });
    } catch (error) {
      throw new DatabaseError('Failed to find projects by status');
    }
  }

  public async findByYear(year: number): Promise<Project[]> {
    try {
      return await prisma.project.findMany({
        where: {year},
        include: {client: true},
      });
    } catch (error) {
      throw new DatabaseError('Failed to find projects by year');
    }
  }

  public async findByType(type: ProjectType): Promise<Project[]> {
    try {
      return await prisma.project.findMany({
        where: {type},
        include: {client: true},
      });
    } catch (error) {
      throw new DatabaseError('Failed to find projects by type');
    }
  }

  public async create(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'finalizedAt'>): Promise<Project> {
    try {
      return await prisma.project.create({data});
    } catch (error) {
      throw new DatabaseError('Failed to create project');
    }
  }

  public async update(id: string, data: Partial<Project>): Promise<Project> {
    try {
      // If status is being changed to FINALIZED, set finalizedAt to current date
      const updateData: any = {...data};
      
      // Convert date strings to Date objects for Prisma
      if (updateData.contractDate && typeof updateData.contractDate === 'string') {
        updateData.contractDate = new Date(updateData.contractDate);
      }
      if (updateData.deliveryDate && typeof updateData.deliveryDate === 'string') {
        updateData.deliveryDate = new Date(updateData.deliveryDate);
      }
      
      if (updateData.status === 'FINALIZED' && !updateData.finalizedAt) {
        console.log(`[Backend ProjectRepository] Setting finalizedAt for project ${id}`);
        updateData.finalizedAt = new Date();
      }
      
      console.log(`[Backend ProjectRepository] Updating project ${id} with data:`, updateData);
      const result = await prisma.project.update({
        where: {id},
        data: updateData,
      });
      console.log(`[Backend ProjectRepository] Project ${id} updated successfully. Status: ${result.status}, FinalizedAt: ${result.finalizedAt}`);
      
      return result;
    } catch (error) {
      console.error(`[Backend ProjectRepository] Error updating project ${id}:`, error);
      throw new DatabaseError('Failed to update project');
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      console.log(`[Backend ProjectRepository] Deleting project ${id} from database...`);
      const result = await prisma.project.delete({where: {id}});
      console.log(`[Backend ProjectRepository] Project deleted:`, result);
    } catch (error) {
      console.error(`[Backend ProjectRepository] Error deleting project ${id}:`, error);
      throw new DatabaseError('Failed to delete project');
    }
  }

  public async addSpecialUser(projectId: string, userId: string): Promise<void> {
    try {
      await prisma.projectSpecialUser.create({
        data: {projectId, userId},
      });
    } catch (error) {
      throw new DatabaseError('Failed to add special user to project');
    }
  }

  public async removeSpecialUser(projectId: string, userId: string): Promise<void> {
    try {
      await prisma.projectSpecialUser.deleteMany({
        where: {projectId, userId},
      });
    } catch (error) {
      throw new DatabaseError('Failed to remove special user from project');
    }
  }

  public async getNextSequenceForYear(year: number): Promise<number> {
    try {
      const count = await prisma.project.count({where: {year}});
      return count + 1;
    } catch (error) {
      throw new DatabaseError('Failed to get next sequence for year');
    }
  }
}
