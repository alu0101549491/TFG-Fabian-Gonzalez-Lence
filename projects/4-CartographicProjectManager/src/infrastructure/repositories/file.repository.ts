/**
 * @module infrastructure/repositories/file-repository
 * @description Concrete implementation of the IFileRepository interface.
 * @category Infrastructure
 */

import {type IFileRepository} from '@domain/repositories/file-repository.interface';
import {type File} from '@domain/entities/file';

/**
 * HTTP-based implementation of the File metadata repository.
 */
export class FileRepository implements IFileRepository {
  async findById(id: string): Promise<File | null> {
    // TODO: Implement API call GET /api/files/:id
    throw new Error('Method not implemented.');
  }

  async save(file: File): Promise<File> {
    // TODO: Implement API call POST /api/files
    throw new Error('Method not implemented.');
  }

  async delete(id: string): Promise<void> {
    // TODO: Implement API call DELETE /api/files/:id
    throw new Error('Method not implemented.');
  }

  async findByTaskId(taskId: string): Promise<File[]> {
    // TODO: Implement API call GET /api/tasks/:taskId/files
    throw new Error('Method not implemented.');
  }

  async findByMessageId(messageId: string): Promise<File[]> {
    // TODO: Implement API call GET /api/messages/:messageId/files
    throw new Error('Method not implemented.');
  }
}
