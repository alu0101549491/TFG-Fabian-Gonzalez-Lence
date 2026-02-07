import {IFileService} from '../interfaces/IFileService';
import {IFileRepository} from '@domain/repositories/IFileRepository';
import {File} from '@domain/entities/File';
import {FileData} from '../../dtos/FileData';
import {ValidationResult} from '../../dtos/ValidationResult';

/**
 * File service implementation
 */
export class FileService implements IFileService {
  constructor(
    private readonly fileRepository: IFileRepository,
  ) {}

  async uploadFile(
      fileData: FileData,
      projectId: string,
  ): Promise<File> {
    // TODO: Implement upload file logic
    throw new Error('Method not implemented.');
  }

  async downloadFile(
      fileId: string,
      userId: string,
  ): Promise<Blob> {
    // TODO: Implement download file logic
    throw new Error('Method not implemented.');
  }

  async validateFile(fileData: FileData): Promise<ValidationResult> {
    // TODO: Implement validate file logic
    throw new Error('Method not implemented.');
  }

  async deleteFile(
      fileId: string,
      userId: string,
  ): Promise<void> {
    // TODO: Implement delete file logic
    throw new Error('Method not implemented.');
  }
}
