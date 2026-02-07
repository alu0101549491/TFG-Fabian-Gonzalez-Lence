/**
 * @module domain/entities/project
 * @description Entity representing a cartographic project.
 * Central aggregate root that connects tasks, messages, files, and users.
 * @category Domain
 */

import {ProjectType} from '../enumerations/project-type';
import {ProjectStatus} from '../enumerations/project-status';
import {type Permission} from './permission';
import {type GeoCoordinates} from '../value-objects/geo-coordinates';

/**
 * Represents a cartographic project in the system.
 * Projects are the primary organizational unit, containing tasks,
 * messages, and files, and linking an administrator with clients.
 */
export class Project {
  private readonly id: string;
  private readonly code: string;
  private name: string;
  private clientId: string;
  private readonly type: ProjectType;
  private readonly startDate: Date;
  private deliveryDate: Date;
  private coordinates: GeoCoordinates;
  private status: ProjectStatus;
  private dropboxFolderId: string;
  private finalizedAt: Date | null;

  constructor(
    id: string,
    code: string,
    name: string,
    clientId: string,
    type: ProjectType,
    startDate: Date,
    deliveryDate: Date,
    coordinates: GeoCoordinates,
    status: ProjectStatus,
    dropboxFolderId: string,
    finalizedAt: Date | null,
  ) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.clientId = clientId;
    this.type = type;
    this.startDate = startDate;
    this.deliveryDate = deliveryDate;
    this.coordinates = coordinates;
    this.status = status;
    this.dropboxFolderId = dropboxFolderId;
    this.finalizedAt = finalizedAt;
  }

  /**
   * Assigns the project to a client user.
   * @param clientId - The ID of the client to assign.
   */
  assignToClient(clientId: string): void {
    // TODO: Implement client assignment logic
    throw new Error('Method not implemented.');
  }

  /**
   * Adds a special user to the project with specific permissions.
   * @param userId - The ID of the special user to add.
   * @param permissions - The set of permissions to grant.
   */
  addSpecialUser(userId: string, permissions: Set<Permission>): void {
    // TODO: Implement special user addition logic
    throw new Error('Method not implemented.');
  }

  /**
   * Marks the project as finalized.
   * Sets the status to FINALIZED and records the finalization timestamp.
   */
  finalize(): void {
    // TODO: Implement finalization logic
    throw new Error('Method not implemented.');
  }

  /**
   * Checks whether the project meets all conditions to be finalized.
   * @returns True if the project can be finalized.
   */
  canBeFinalized(): boolean {
    // TODO: Implement finalization eligibility check
    throw new Error('Method not implemented.');
  }

  /**
   * Determines if a specific user has access to this project.
   * @param userId - The ID of the user to check.
   * @returns True if the user can access this project.
   */
  isAccessibleBy(userId: string): boolean {
    // TODO: Implement access check logic
    throw new Error('Method not implemented.');
  }

  getId(): string {
    return this.id;
  }

  getCode(): string {
    return this.code;
  }

  getName(): string {
    return this.name;
  }

  getClientId(): string {
    return this.clientId;
  }

  getType(): ProjectType {
    return this.type;
  }

  getStartDate(): Date {
    return this.startDate;
  }

  getDeliveryDate(): Date {
    return this.deliveryDate;
  }

  getCoordinates(): GeoCoordinates {
    return this.coordinates;
  }

  getStatus(): ProjectStatus {
    return this.status;
  }

  getDropboxFolderId(): string {
    return this.dropboxFolderId;
  }

  getFinalizedAt(): Date | null {
    return this.finalizedAt;
  }
}
