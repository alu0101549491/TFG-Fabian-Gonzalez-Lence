import {AccessRight} from '../enums/AccessRight';

/**
 * Permission entity for user access rights on projects
 * Used for special users with custom permissions
 */
export class Permission {
  private userId: string;
  private projectId: string;
  private rights: Set<AccessRight>;

  constructor(userId: string, projectId: string, rights: Set<AccessRight>) {
    this.userId = userId;
    this.projectId = projectId;
    this.rights = rights;
  }

  /**
   * Checks if user can view project content
   * @returns True if view permission granted
   */
  public canView(): boolean {
    // TODO: Implement view check logic
    throw new Error('Method not implemented.');
  }

  /**
   * Checks if user can download files
   * @returns True if download permission granted
   */
  public canDownload(): boolean {
    // TODO: Implement download check logic
    throw new Error('Method not implemented.');
  }

  /**
   * Checks if user can edit project content
   * @returns True if edit permission granted
   */
  public canEdit(): boolean {
    // TODO: Implement edit check logic
    throw new Error('Method not implemented.');
  }

  // Getters
  public getUserId(): string {
    return this.userId;
  }

  public getProjectId(): string {
    return this.projectId;
  }

  public getRights(): Set<AccessRight> {
    return new Set(this.rights);
  }

  public addRight(right: AccessRight): void {
    this.rights.add(right);
  }

  public removeRight(right: AccessRight): void {
    this.rights.delete(right);
  }
}