import {FileType} from '@domain/enums/FileType';

/**
 * File upload data DTO
 */
export interface FileData {
  name: string;
  type: FileType;
  sizeInBytes: number;
  content: ArrayBuffer;
  uploadedBy: string;
}
