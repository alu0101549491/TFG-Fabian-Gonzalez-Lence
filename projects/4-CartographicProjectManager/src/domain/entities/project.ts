/**
 * @module domain/entities/project
 * @description Entity representing a cartographic project.
 * Central aggregate root that connects tasks, messages, files, and users.
 * @category Domain
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
  /** Dropbox folder path or ID */
  dropboxFolderId: string;
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
  private readonly _id: string;
  private readonly _code: string;
  private _name: string;
  private readonly _year: number;
  private _clientId: string;
  private _type: ProjectType;
  private _coordinates: GeoCoordinates | null;
  private _contractDate: Date;
  private _deliveryDate: Date;
  private _status: ProjectStatus;
  private _dropboxFolderId: string;
  private _specialUserIds: string[];
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _finalizedAt: Date | null;

  /**
   * Creates a new Project entity.
   *
   * @param props - Project properties
   * @throws {Error} If required fields are missing or invalid
   */
  constructor(props: ProjectProps) {
    this.validateProps(props);

    this._id = props.id;
    this._code = props.code;
    this._name = props.name;
    this._year = props.year;
    this._clientId = props.clientId;
    this._type = props.type;
    this._coordinates = props.coordinates ?? null;
    this._contractDate = props.contractDate;
    this._deliveryDate = props.deliveryDate;
    this._status = props.status ?? ProjectStatus.ACTIVE;
    this._dropboxFolderId = props.dropboxFolderId;
    this._specialUserIds = props.specialUserIds ?? [];
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
    this._finalizedAt = props.finalizedAt ?? null;
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

    if (!props.dropboxFolderId || props.dropboxFolderId.trim() === '') {
      throw new Error('Dropbox folder ID is required');
    }
  }

  // Getters

  get id(): string {
    return this._id;
  }

  get code(): string {
    return this._code;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Project name cannot be empty');
    }
    this._name = value;
    this.touchUpdatedAt();
  }

  get year(): number {
    return this._year;
  }

  get clientId(): string {
    return this._clientId;
  }

  set clientId(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Client ID cannot be empty');
    }
    this._clientId = value;
    this.touchUpdatedAt();
  }

  get type(): ProjectType {
    return this._type;
  }

  set type(value: ProjectType) {
    this._type = value;
    this.touchUpdatedAt();
  }

  get coordinates(): GeoCoordinates | null {
    return this._coordinates;
  }

  set coordinates(value: GeoCoordinates | null) {
    this._coordinates = value;
    this.touchUpdatedAt();
  }

  get contractDate(): Date {
    return this._contractDate;
  }

  set contractDate(value: Date) {
    if (value > this._deliveryDate) {
      throw new Error('Contract date must be before delivery date');
    }
    this._contractDate = value;
    this.touchUpdatedAt();
  }

  get deliveryDate(): Date {
    return this._deliveryDate;
  }

  set deliveryDate(value: Date) {
    if (value < this._contractDate) {
      throw new Error('Delivery date must be after contract date');
    }
    this._deliveryDate = value;
    this.touchUpdatedAt();
  }

  get status(): ProjectStatus {
    return this._status;
  }

  set status(value: ProjectStatus) {
    this._status = value;
    this.touchUpdatedAt();
  }

  get dropboxFolderId(): string {
    return this._dropboxFolderId;
  }

  set dropboxFolderId(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Dropbox folder ID cannot be empty');
    }
    this._dropboxFolderId = value;
    this.touchUpdatedAt();
  }

  get specialUserIds(): string[] {
    // Return copy to prevent external modification
    return [...this._specialUserIds];
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get finalizedAt(): Date | null {
    return this._finalizedAt;
  }

  // Business Logic Methods

  /**
   * Updates the updatedAt timestamp to the current time.
   */
  private touchUpdatedAt(): void {
    this._updatedAt = new Date();
  }

  /**
   * Assigns the project to a client user.
   *
   * @param clientId - The ID of the client to assign
   * @throws {Error} If clientId is empty
   */
  assignToClient(clientId: string): void {
    if (!clientId || clientId.trim() === '') {
      throw new Error('Client ID is required');
    }
    this._clientId = clientId;
    this.touchUpdatedAt();
  }

  /**
   * Adds a special user to the project.
   *
   * @param userId - The ID of the special user to add
   * @throws {Error} If userId is empty or already exists
   */
  addSpecialUser(userId: string): void {
    if (!userId || userId.trim() === '') {
      throw new Error('User ID is required');
    }

    if (this._specialUserIds.includes(userId)) {
      throw new Error('Special user already added to this project');
    }

    this._specialUserIds.push(userId);
    this.touchUpdatedAt();
  }

  /**
   * Removes a special user from the project.
   *
   * @param userId - The ID of the special user to remove
   * @throws {Error} If userId doesn't exist
   */
  removeSpecialUser(userId: string): void {
    const index = this._specialUserIds.indexOf(userId);
    if (index === -1) {
      throw new Error('Special user not found in this project');
    }

    this._specialUserIds.splice(index, 1);
    this.touchUpdatedAt();
  }

  /**
   * Checks if a special user is linked to this project.
   *
   * @param userId - The ID of the user to check
   * @returns True if user is in specialUserIds
   */
  hasSpecialUser(userId: string): boolean {
    return this._specialUserIds.includes(userId);
  }

  /**
   * Marks the project as finalized.
   *
   * @throws {Error} If project cannot be finalized
   */
  finalize(): void {
    if (!this.canBeFinalized()) {
      throw new Error('Project cannot be finalized in current state');
    }

    this._status = ProjectStatus.FINALIZED;
    this._finalizedAt = new Date();
    this.touchUpdatedAt();
  }

  /**
   * Checks whether the project can be finalized.
   *
   * @returns True if the project can be finalized
   */
  canBeFinalized(): boolean {
    // Project can be finalized if not already finalized
    return this._status !== ProjectStatus.FINALIZED;
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
  isAccessibleBy(userId: string, userRole: UserRole): boolean {
    // Administrators always have access
    if (userRole === UserRole.ADMINISTRATOR) {
      return true;
    }

    // Clients have access if they are the assigned client
    if (userRole === UserRole.CLIENT) {
      return this._clientId === userId;
    }

    // Special users have access if they are in the special users list
    if (userRole === UserRole.SPECIAL_USER) {
      return this._specialUserIds.includes(userId);
    }

    return false;
  }

  /**
   * Checks if the project is in an active state (not finalized).
   *
   * @returns True if project status is not FINALIZED
   */
  isActive(): boolean {
    return this._status !== ProjectStatus.FINALIZED;
  }

  /**
   * Checks if the project is past its delivery date.
   *
   * @returns True if current date is past delivery date and project not finalized
   */
  isOverdue(): boolean {
    const now = new Date();
    return now > this._deliveryDate && this._status !== ProjectStatus.FINALIZED;
  }

  /**
   * Calculates the number of days until the delivery date.
   *
   * @returns Number of days (positive if in future, negative if past)
   */
  daysUntilDelivery(): number {
    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffMs = this._deliveryDate.getTime() - now.getTime();
    return Math.ceil(diffMs / msPerDay);
  }

  /**
   * Serializes the project entity to a plain object.
   *
   * @returns Plain object representation suitable for API responses
   */
  toJSON(): object {
    return {
      id: this._id,
      code: this._code,
      name: this._name,
      year: this._year,
      clientId: this._clientId,
      type: this._type,
      coordinates: this._coordinates ? this._coordinates.toJSON() : null,
      contractDate: this._contractDate.toISOString(),
      deliveryDate: this._deliveryDate.toISOString(),
      status: this._status,
      dropboxFolderId: this._dropboxFolderId,
      specialUserIds: [...this._specialUserIds],
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      finalizedAt: this._finalizedAt ? this._finalizedAt.toISOString() : null,
    };
  }
}
