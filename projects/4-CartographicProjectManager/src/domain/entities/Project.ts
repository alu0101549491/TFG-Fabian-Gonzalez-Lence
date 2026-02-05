import {ProjectType} from '../enums/ProjectType';
import {ProjectStatus} from '../enums/ProjectStatus';
import {GeoCoordinates} from '../value-objects/GeoCoordinates';
import {Permission} from './Permission';

/**
 * Project entity representing a cartographic project
 * Contains project metadata, status, and relationships
 */
export class Project {
  private id: string;
  private code: string;
  private name: string;
  private clientId: string;
  private type: ProjectType;
  private startDate: Date;
  private deliveryDate: Date;
  private coordinates: GeoCoordinates;
  private status: ProjectStatus;
  private dropboxFolderId: string;
  private finalizedAt?: Date;

  constructor(
    id: string,
    code: string,
    name: string,
    clientId: string,
    type: ProjectType,
    startDate: Date,
    deliveryDate: Date,
    coordinates: GeoCoordinates,
  ) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.clientId = clientId;
    this.type = type;
    this.startDate = startDate;
    this.deliveryDate = deliveryDate;
    this.coordinates = coordinates;
    this.status = ProjectStatus.ACTIVE;
    this.dropboxFolderId = '';
  }

  /**
   * Assigns project to a client
   * @param clientId - ID of the client to assign
   */
  public assignToClient(clientId: string): void {
    // TODO: Implement assign to client logic
    throw new Error('Method not implemented.');
  }

  /**
   * Adds a special user with specific permissions
   * @param userId - ID of the user to add
   * @param permissions - Set of permissions to grant
   */
  public addSpecialUser(userId: string, permissions: Set<Permission>): void {
    // TODO: Implement add special user logic
    throw new Error('Method not implemented.');
  }

  /**
   * Finalizes the project
   */
  public finalize(): void {
    // TODO: Implement finalize logic
    throw new Error('Method not implemented.');
  }

  /**
   * Checks if project can be finalized
   * @returns True if project meets finalization criteria
   */
  public canBeFinalized(): boolean {
    // TODO: Implement can be finalized check
    throw new Error('Method not implemented.');
  }

  /**
   * Checks if user has access to this project
   * @param userId - ID of the user to check
   * @returns True if user can access project
   */
  public isAccessibleBy(userId: string): boolean {
    // TODO: Implement accessibility check
    throw new Error('Method not implemented.');
  }

  // Getters and setters
  public getId(): string {
    return this.id;
  }

  public getCode(): string {
    return this.code;
  }

  public getName(): string {
    return this.name;
  }

  public getClientId(): string {
    return this.clientId;
  }

  public getType(): ProjectType {
    return this.type;
  }

  public getStatus(): ProjectStatus {
    return this.status;
  }

  public setStatus(status: ProjectStatus): void {
    this.status = status;
  }

  public getDropboxFolderId(): string {
    return this.dropboxFolderId;
  }

  public setDropboxFolderId(folderId: string): void {
    this.dropboxFolderId = folderId;
  }
}