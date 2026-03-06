/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file domain/entities/project.ts
 * @desc Entity representing a cartographic project. Central aggregate root that connects tasks, messages, files, and users.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {ProjectType} from '../enumerations/project-type';
import {ProjectStatus} from '../enumerations/project-status';
import {UserRole} from '../enumerations/user-role';
import {type GeoCoordinates} from '../value-objects/geo-coordinates';

/**
 * Properties for creating a Project entity.
 */
export interface ProjectProps {
  /** Unique identifier */
  id: string;
  /** Project unique code (e.g., CART-2025-001) */
  code: string;
  /** Complete project name */
  name: string;
  /** Project year (YYYY) */
  year: number;
  /** ID of assigned client */
  clientId: string;
  /** Type of cartographic work */
  type: ProjectType;
  /** Geographic coordinates (optional) */
  coordinates?: GeoCoordinates | null;
  /** Project start date */
  contractDate: Date;
  /** Completion deadline */
  deliveryDate: Date;
  /** Current project status */
  status?: ProjectStatus;
  /** Dropbox folder path or ID (optional, can be set later) */
  dropboxFolderId?: string;
  /** List of linked special user IDs */
  specialUserIds?: string[];
  /** Record creation timestamp */
  createdAt?: Date;
  /** Last modification timestamp */
  updatedAt?: Date;
  /** When project was finalized */
  finalizedAt?: Date | null;
}

/**
 * Represents a cartographic project in the system.
 *
 * Projects are the primary organizational unit, containing tasks,
 * messages, and files. They link an administrator with clients and
 * optional special users with configurable permissions.
 *
 * Project Lifecycle:
 * - ACTIVE: Project created and accepting work
 * - IN_PROGRESS: Tasks being worked on
 * - PENDING_REVIEW: Awaiting approval
 * - FINALIZED: Completed and archived
 *
 * @example
 * ```typescript
 * const project = new Project({
 *   id: 'proj_001',
 *   code: 'CART-2025-001',
 *   name: 'Residential Urbanization Project',
 *   year: 2025,
 *   clientId: 'client_001',
 *   type: ProjectType.RESIDENTIAL,
 *   contractDate: new Date('2025-01-15'),
 *   deliveryDate: new Date('2025-06-30'),
 *   dropboxFolderId: '/projects/CART-2025-001'
 * });
 *
 * project.addSpecialUser('special_user_001');
 * ```
 */
export class Project {
  public readonly id: string;
  public readonly code: string;
  private nameValue: string;
  public readonly year: number;
  private clientIdValue: string;
  private typeValue: ProjectType;
  private coordinatesValue: GeoCoordinates | null;
  private contractDateValue: Date;
  private deliveryDateValue: Date;
  private statusValue: ProjectStatus;
  private dropboxFolderIdValue: string;
  private specialUserIdsValue: string[];
  public readonly createdAt: Date;
  private updatedAtValue: Date;
  private finalizedAtValue: Date | null;

  /**
   * Creates a new Project entity.
   *
   * @param props - Project properties
   * @throws {Error} If required fields are missing or invalid
   */
  public constructor(props: ProjectProps) {
    this.validateProps(props);

    this.id = props.id;
    this.code = props.code;
    this.nameValue = props.name;
    this.year = props.year;
    this.clientIdValue = props.clientId;
    this.typeValue = props.type;
    this.coordinatesValue = props.coordinates ?? null;
    this.contractDateValue = props.contractDate;
    this.deliveryDateValue = props.deliveryDate;
    this.statusValue = props.status ?? ProjectStatus.ACTIVE;
    this.dropboxFolderIdValue = props.dropboxFolderId ?? '';
    this.specialUserIdsValue = props.specialUserIds ?? [];
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAtValue = props.updatedAt ?? new Date();
    this.finalizedAtValue = props.finalizedAt ?? null;
  }

  /**
   * Validates project properties.
   *
   * @param props - Properties to validate
   * @throws {Error} If validation fails
   */
  private validateProps(props: ProjectProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new Error('Project ID is required');
    }

    if (!props.code || props.code.trim() === '') {
      throw new Error('Project code is required');
    }

    if (!props.name || props.name.trim() === '') {
      throw new Error('Project name is required');
    }

    if (!props.year || props.year < 2000 || props.year > 2100) {
      throw new Error('Project year must be between 2000 and 2100');
    }

    if (!props.clientId || props.clientId.trim() === '') {
      throw new Error('Client ID is required');
    }

    if (!props.type) {
      throw new Error('Project type is required');
    }

    if (!props.contractDate) {
      throw new Error('Contract date is required');
    }

    if (!props.deliveryDate) {
      throw new Error('Delivery date is required');
    }

    if (props.deliveryDate < props.contractDate) {
      throw new Error('Delivery date must be after or equal to contract date');
    }
  }

  // Getters and Setters for mutable properties

  public get name(): string {
    return this.nameValue;
  }

  public set name(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Project name cannot be empty');
    }
    this.nameValue = value;
    this.touchUpdatedAt();
  }

  public get clientId(): string {
    return this.clientIdValue;
  }

  public set clientId(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Client ID cannot be empty');
    }
    this.clientIdValue = value;
    this.touchUpdatedAt();
  }

  public get type(): ProjectType {
    return this.typeValue;
  }

  public set type(value: ProjectType) {
    this.typeValue = value;
    this.touchUpdatedAt();
  }

  public get coordinates(): GeoCoordinates | null {
    return this.coordinatesValue;
  }

  public set coordinates(value: GeoCoordinates | null) {
    this.coordinatesValue = value;
    this.touchUpdatedAt();
  }

  public get contractDate(): Date {
    return this.contractDateValue;
  }

  public set contractDate(value: Date) {
    if (value > this.deliveryDateValue) {
      throw new Error('Contract date must be before delivery date');
    }
    this.contractDateValue = value;
    this.touchUpdatedAt();
  }

  public get deliveryDate(): Date {
    return this.deliveryDateValue;
  }

  public set deliveryDate(value: Date) {
    if (value < this.contractDateValue) {
      throw new Error('Delivery date must be after contract date');
    }
    this.deliveryDateValue = value;
    this.touchUpdatedAt();
  }

  public get status(): ProjectStatus {
    return this.statusValue;
  }

  public set status(value: ProjectStatus) {
    this.statusValue = value;
    this.touchUpdatedAt();
  }

  public get dropboxFolderId(): string {
    return this.dropboxFolderIdValue;
  }

  public set dropboxFolderId(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Dropbox folder ID cannot be empty');
    }
    this.dropboxFolderIdValue = value;
    this.touchUpdatedAt();
  }

  public get specialUserIds(): string[] {
    // Return copy to prevent external modification
    return [...this.specialUserIdsValue];
  }

  public get updatedAt(): Date {
    return this.updatedAtValue;
  }

  public get finalizedAt(): Date | null {
    return this.finalizedAtValue;
  }

  // Business Logic Methods

  /**
   * Updates the updatedAt timestamp to the current time.
   */
  private touchUpdatedAt(): void {
    this.updatedAtValue = new Date();
  }

  /**
   * Assigns the project to a client user.
   *
   * @param clientId - The ID of the client to assign
   * @throws {Error} If clientId is empty
   */
  public assignToClient(clientId: string): void {
    if (!clientId || clientId.trim() === '') {
      throw new Error('Client ID is required');
    }
    this.clientIdValue = clientId;
    this.touchUpdatedAt();
  }

  /**
   * Adds a special user to the project.
   *
   * @param userId - The ID of the special user to add
   * @throws {Error} If userId is empty or already exists
   */
  public addSpecialUser(userId: string): void {
    if (!userId || userId.trim() === '') {
      throw new Error('User ID is required');
    }

    if (this.specialUserIdsValue.includes(userId)) {
      throw new Error('Special user already added to this project');
    }

    this.specialUserIdsValue.push(userId);
    this.touchUpdatedAt();
  }

  /**
   * Removes a special user from the project.
   *
   * @param userId - The ID of the special user to remove
   * @throws {Error} If userId doesn't exist
   */
  public removeSpecialUser(userId: string): void {
    const index = this.specialUserIdsValue.indexOf(userId);
    if (index === -1) {
      throw new Error('Special user not found in this project');
    }

    this.specialUserIdsValue.splice(index, 1);
    this.touchUpdatedAt();
  }

  /**
   * Checks if a special user is linked to this project.
   *
   * @param userId - The ID of the user to check
   * @returns True if user is in specialUserIds
   */
  public hasSpecialUser(userId: string): boolean {
    return this.specialUserIdsValue.includes(userId);
  }

  /**
   * Marks the project as finalized.
   *
   * @throws {Error} If project cannot be finalized
   */
  public finalize(): void {
    if (!this.canBeFinalized()) {
      throw new Error('Project cannot be finalized in current state');
    }

    this.statusValue = ProjectStatus.FINALIZED;
    this.finalizedAtValue = new Date();
    this.touchUpdatedAt();
  }

  /**
   * Checks whether the project can be finalized.
   *
   * @returns True if the project can be finalized
   */
  public canBeFinalized(): boolean {
    // Project can be finalized if not already finalized
    return this.statusValue !== ProjectStatus.FINALIZED;
  }

  /**
   * Determines if a specific user has access to this project.
   *
   * Access Rules:
   * - ADMINISTRATOR: Always has access
   * - CLIENT: Has access if they are the assigned client
   * - SPECIAL_USER: Has access if in specialUserIds
   *
   * @param userId - The ID of the user to check
   * @param userRole - The role of the user
   * @returns True if the user can access this project
   */
  public isAccessibleBy(userId: string, userRole: UserRole): boolean {
    // Administrators always have access
    if (userRole === UserRole.ADMINISTRATOR) {
      return true;
    }

    // Clients have access if they are the assigned client
    if (userRole === UserRole.CLIENT) {
      return this.clientIdValue === userId;
    }

    // Special users have access if they are in the special users list
    if (userRole === UserRole.SPECIAL_USER) {
      return this.specialUserIdsValue.includes(userId);
    }

    return false;
  }

  /**
   * Checks if the project is in an active state (not finalized).
   *
   * @returns True if project status is not FINALIZED
   */
  public isActive(): boolean {
    return this.statusValue !== ProjectStatus.FINALIZED;
  }

  /**
   * Checks if the project is past its delivery date.
   *
   * @returns True if current date is past delivery date and project not finalized
   */
  public isOverdue(): boolean {
    const now = new Date();
    return now > this.deliveryDateValue && this.statusValue !== ProjectStatus.FINALIZED;
  }

  /**
   * Calculates the number of days until the delivery date.
   *
   * @returns Number of days (positive if in future, negative if past)
   */
  public daysUntilDelivery(): number {
    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffMs = this.deliveryDateValue.getTime() - now.getTime();
    return Math.ceil(diffMs / msPerDay);
  }

  /**
   * Serializes the project entity to a plain object.
   *
   * @returns Plain object representation suitable for API responses
   */
  public toJSON(): object {
    return {
      id: this.id,
      code: this.code,
      name: this.nameValue,
      year: this.year,
      clientId: this.clientIdValue,
      type: this.typeValue,
      coordinates: this.coordinatesValue ? this.coordinatesValue.toJSON() : null,
      contractDate: this.contractDateValue.toISOString(),
      deliveryDate: this.deliveryDateValue.toISOString(),
      status: this.statusValue,
      dropboxFolderId: this.dropboxFolderIdValue,
      specialUserIds: [...this.specialUserIdsValue],
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAtValue.toISOString(),
      finalizedAt: this.finalizedAtValue ? this.finalizedAtValue.toISOString() : null,
    };
  }
}
