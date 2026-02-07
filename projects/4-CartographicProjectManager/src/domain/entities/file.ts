/**
 * @module domain/entities/file
 * @description Entity representing a file managed through the Dropbox integration.
 * Supports cartographic file formats (KML, SHP) as well as standard documents.
 * @category Domain
 */

import {FileType} from '../enumerations/file-type';

/**
 * Represents an uploaded file stored in Dropbox.
 * Files can be attached to tasks and messages.
 */
export class File {
  private readonly id: string;
  private readonly name: string;
  private readonly dropboxPath: string;
  private readonly type: FileType;
  private readonly sizeInBytes: number;
  private readonly uploadedBy: string;
  private readonly uploadedAt: Date;

  constructor(
    id: string,
    name: string,
    dropboxPath: string,
    type: FileType,
    sizeInBytes: number,
    uploadedBy: string,
    uploadedAt: Date,
  ) {
    this.id = id;
    this.name = name;
    this.dropboxPath = dropboxPath;
    this.type = type;
    this.sizeInBytes = sizeInBytes;
    this.uploadedBy = uploadedBy;
    this.uploadedAt = uploadedAt;
  }

  /**
   * Validates that the file format is one of the accepted types.
   * @returns True if the file format is valid.
   */
  isValidFormat(): boolean {
    // TODO: Implement format validation logic
    throw new Error('Method not implemented.');
  }

  /**
   * Checks if the file size is within the allowed upload limit.
   * @returns True if the file is within the size limit.
   */
  isWithinSizeLimit(): boolean {
    // TODO: Implement size limit check
    throw new Error('Method not implemented.');
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getDropboxPath(): string {
    return this.dropboxPath;
  }

  getType(): FileType {
    return this.type;
  }

  getSizeInBytes(): number {
    return this.sizeInBytes;
  }

  getUploadedBy(): string {
    return this.uploadedBy;
  }

  getUploadedAt(): Date {
    return this.uploadedAt;
  }
}
