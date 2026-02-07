import {FileType} from '../enums/FileType';

/**
 * File entity representing uploaded files
 * Stored in Dropbox with metadata in database
 */
export class File {
  private id: string;
  private name: string;
  private dropboxPath: string;
  private type: FileType;
  private sizeInBytes: number;
  private uploadedBy: string;
  private uploadedAt: Date;

  constructor(
    id: string,
    name: string,
    dropboxPath: string,
    type: FileType,
    sizeInBytes: number,
    uploadedBy: string,
  ) {
    this.id = id;
    this.name = name;
    this.dropboxPath = dropboxPath;
    this.type = type;
    this.sizeInBytes = sizeInBytes;
    this.uploadedBy = uploadedBy;
    this.uploadedAt = new Date();
  }

  /**
   * Validates file format against allowed types
   * @returns True if format is valid
   */
  public isValidFormat(): boolean {
    // TODO: Implement format validation logic
    throw new Error('Method not implemented.');
  }

  /**
   * Checks if file is within size limits
   * @returns True if size is acceptable
   */
  public isWithinSizeLimit(): boolean {
    // TODO: Implement size validation logic
    throw new Error('Method not implemented.');
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getDropboxPath(): string {
    return this.dropboxPath;
  }

  public getType(): FileType {
    return this.type;
  }

  public getSizeInBytes(): number {
    return this.sizeInBytes;
  }

  public getUploadedBy(): string {
    return this.uploadedBy;
  }

  public getUploadedAt(): Date {
    return this.uploadedAt;
  }
}
