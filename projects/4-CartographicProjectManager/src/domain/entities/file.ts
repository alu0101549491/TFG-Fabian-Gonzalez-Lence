/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file domain/entities/file.ts
 * @desc Entity representing a file managed through the Dropbox integration. Supports cartographic file formats (KML, SHP) as well as standard documents.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {FileType, getFileTypeFromExtension, isValidFileType} from '../enumerations/file-type';

/**
 * Properties for creating a File entity.
 */
export interface FileProps {
  /** Unique identifier */
  id: string;
  /** Original filename */
  name: string;
  /** Path in Dropbox storage */
  dropboxPath: string;
  /** File category */
  type: FileType;
  /** File size in bytes */
  sizeInBytes: number;
  /** User who uploaded */
  uploadedBy: string;
  /** Parent project */
  projectId: string;
  /** Associated task (if any) */
  taskId?: string | null;
  /** Associated message (if any) */
  messageId?: string | null;
  /** Upload timestamp */
  uploadedAt?: Date;
}

/**
 * Represents an uploaded file stored in Dropbox.
 *
 * Files track metadata for Dropbox-stored documents and can be
 * attached to tasks and messages.
 *
 * @example
 * ```typescript
 * const file = new File({
 *   id: 'file_001',
 *   name: 'plans.pdf',
 *   dropboxPath: '/projects/CART-2025-001/plans.pdf',
 *   type: FileType.PDF,
 *   sizeInBytes: 2048000,
 *   uploadedBy: 'user_001',
 *   projectId: 'proj_001'
 * });
 *
 * console.log(file.getHumanReadableSize()); // '2.0 MB'
 * console.log(file.isDocument()); // true
 * ```
 */
export class File {
  public readonly id: string;
  public readonly name: string;
  public readonly dropboxPath: string;
  public readonly type: FileType;
  public readonly sizeInBytes: number;
  public readonly uploadedBy: string;
  public readonly uploadedAt: Date;
  public readonly projectId: string;
  public readonly taskId: string | null;
  public readonly messageId: string | null;

  /**
   * Creates a new File entity.
   *
   * @param props - File properties
   * @throws {Error} If required fields are missing or invalid
   */
  public constructor(props: FileProps) {
    this.validateProps(props);

    this.id = props.id;
    this.name = props.name;
    this.dropboxPath = props.dropboxPath;
    this.type = props.type;
    this.sizeInBytes = props.sizeInBytes;
    this.uploadedBy = props.uploadedBy;
    this.uploadedAt = props.uploadedAt ?? new Date();
    this.projectId = props.projectId;
    this.taskId = props.taskId ?? null;
    this.messageId = props.messageId ?? null;
  }

  /**
   * Validates file properties.
   */
  private validateProps(props: FileProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new Error('File ID is required');
    }
    if (!props.name || props.name.trim() === '') {
      throw new Error('File name is required');
    }
    if (!props.dropboxPath || props.dropboxPath.trim() === '') {
      throw new Error('Dropbox path is required');
    }
    if (!props.type) {
      throw new Error('File type is required');
    }
    if (props.sizeInBytes < 0) {
      throw new Error('File size cannot be negative');
    }
    if (!props.uploadedBy || props.uploadedBy.trim() === '') {
      throw new Error('Upload user is required');
    }
    if (!props.projectId || props.projectId.trim() === '') {
      throw new Error('Project ID is required');
    }
  }

  // Business Logic Methods

  /**
   * Extracts file extension.
   *
   * @returns Lowercase extension (e.g., 'pdf', 'kml')
   */
  public getExtension(): string {
    const parts = this.name.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  /**
   * Validates that the file format is accepted.
   *
   * @returns True if file type is valid
   */
  public isValidFormat(): boolean {
    return isValidFileType(this.type);
  }

  /**
   * Checks if file size is within limit.
   *
   * @param maxBytes - Maximum allowed size
   * @returns True if within limit
   */
  public isWithinSizeLimit(maxBytes: number): boolean {
    return this.sizeInBytes <= maxBytes;
  }

  /**
   * Checks if file is an image.
   */
  public isImage(): boolean {
    return this.type === FileType.IMAGE;
  }

  /**
   * Checks if file is a document.
   */
  public isDocument(): boolean {
    return (
      this.type === FileType.PDF ||
      this.type === FileType.DOCUMENT
    );
  }

  /**
   * Checks if file is cartographic.
   */
  public isCartographic(): boolean {
    return (
      this.type === FileType.KML ||
      this.type === FileType.SHP ||
      this.type === FileType.CAD
    );
  }

  /**
   * Checks if file is a spreadsheet.
   */
  public isSpreadsheet(): boolean {
    return this.type === FileType.SPREADSHEET;
  }

  /**
   * Formats size for display.
   *
   * @returns Human-readable size (e.g., '2.5 MB', '500 KB')
   */
  public getHumanReadableSize(): string {
    const bytes = this.sizeInBytes;

    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
  }

  /**
   * Determines FileType from filename.
   *
   * @param filename - File name with extension
   * @returns Determined FileType
   * @throws {Error} If file type cannot be determined
   */
  public static determineFileType(filename: string): FileType {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext) {
      throw new Error('Cannot determine file type: no extension found');
    }

    const fileType = getFileTypeFromExtension(ext);
    if (!fileType) {
      throw new Error(`Unsupported file extension: ${ext}`);
    }

    return fileType;
  }
}
