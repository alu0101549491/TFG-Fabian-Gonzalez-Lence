/**
 * @module domain/entities/permission
 * @description Entity representing the permissions a user has for a specific project.
 * Encapsulates access rights (View, Download, Edit, Delete) per user-project pair.
 * @category Domain
 */

import {AccessRight} from '../enumerations/access-right';

/**
 * Represents the set of permissions granted to a user for a specific project.
 * Used to control fine-grained access to project resources.
 */
export class Permission {
  private readonly userId: string;
  private readonly projectId: string;
  private rights: Set<AccessRight>;

  constructor(
    userId: string,
    projectId: string,
    rights: Set<AccessRight>,
  ) {
    this.userId = userId;
    this.projectId = projectId;
    this.rights = rights;
  }

  /**
   * Checks if the permission includes view access.
   * @returns True if the user can view the project.
   */
  canView(): boolean {
    // TODO: Implement view permission check
    throw new Error('Method not implemented.');
  }

  /**
   * Checks if the permission includes download access.
   * @returns True if the user can download files from the project.
   */
  canDownload(): boolean {
    // TODO: Implement download permission check
    throw new Error('Method not implemented.');
  }

  /**
   * Checks if the permission includes edit access.
   * @returns True if the user can edit project data.
   */
  canEdit(): boolean {
    // TODO: Implement edit permission check
    throw new Error('Method not implemented.');
  }

  getUserId(): string {
    return this.userId;
  }

  getProjectId(): string {
    return this.projectId;
  }

  getRights(): Set<AccessRight> {
    return new Set(this.rights);
  }
}
