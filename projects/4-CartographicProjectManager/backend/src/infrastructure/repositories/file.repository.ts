/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file src/infrastructure/repositories/file.repository.ts
 * @desc File repository implementation using Prisma
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {File, FileType} from '@prisma/client';
import type {IFileRepository} from '@domain/repositories/file.repository.interface.js';
import {prisma} from '../database/prisma.client.js';
import {DatabaseError} from '@shared/errors.js';

export class FileRepository implements IFileRepository {
  public async findById(id: string): Promise<File | null> {
    try {
      return await prisma.file.findUnique({
        where: {id},
        include: {project: true, uploader: true},
      });
    } catch (error) {
      throw new DatabaseError('Failed to find file by ID');
    }
  }

  public async findByProjectId(projectId: string): Promise<File[]> {
    try {
      return await prisma.file.findMany({
        where: {projectId},
        include: {uploader: true},
        orderBy: {uploadedAt: 'desc'},
      });
    } catch (error) {
      throw new DatabaseError('Failed to find files by project ID');
    }
  }

  public async findByUploaderId(uploaderId: string): Promise<File[]> {
    try {
      return await prisma.file.findMany({
        where: {uploadedBy: uploaderId},
        include: {project: true},
      });
    } catch (error) {
      throw new DatabaseError('Failed to find files by uploader ID');
    }
  }

  public async findByType(type: FileType): Promise<File[]> {
    try {
      return await prisma.file.findMany({
        where: {type},
        include: {project: true, uploader: true},
      });
    } catch (error) {
      throw new DatabaseError('Failed to find files by type');
    }
  }

  public async create(data: Omit<File, 'id' | 'uploadedAt'>): Promise<File> {
    try {
      return await prisma.file.create({data});
    } catch (error) {
      throw new DatabaseError('Failed to create file');
    }
  }

  public async update(id: string, data: Partial<File>): Promise<File> {
    try {
      return await prisma.file.update({
        where: {id},
        data,
      });
    } catch (error) {
      throw new DatabaseError('Failed to update file');
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      await prisma.file.delete({where: {id}});
    } catch (error) {
      throw new DatabaseError('Failed to delete file');
    }
  }
}
