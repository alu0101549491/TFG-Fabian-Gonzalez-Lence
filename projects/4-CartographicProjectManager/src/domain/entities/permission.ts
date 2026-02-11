/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file domain/entities/permission.ts
 * @desc Entity representing the permissions a user has for a specific project. Encapsulates access rights (View, Download, Edit, Delete) per user-project pair.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {
  AccessRight,
  READ_ONLY_ACCESS_RIGHTS,
  ALL_ACCESS_RIGHTS,
} from '../enumerations/access-right';

/**
 * Project sections that can have access control.
 */
export const PROJECT_SECTIONS = [
  'REPORT_AND_ANNEXES',
  'PLANS',
  'SPECIFICATIONS',
  'BUDGET',
] as const;

/**
 * Properties for creating a Permission entity.
 */
export interface PermissionProps {
  /** Unique identifier */
  id: string;
  /** Special user ID */
  userId: string;
  /** Project ID */
  projectId: string;
  /** Granted access rights */
  rights: Set<AccessRight>;
  /** Specific sections accessible */
  sectionAccess?: string[];
  /** Admin who granted permissions */
  grantedBy: string;
  /** When permissions were set */
  grantedAt?: Date;
  /** Last modification */
  updatedAt?: Date;
}

/**
 * Represents permissions granted to a special user for a project.
 *
 * Permissions provide fine-grained access control with:
 * - Specific access rights (VIEW, DOWNLOAD, EDIT, DELETE, UPLOAD, SEND_MESSAGE)
 * - Section-level access control
 *
 * @example
 * ```typescript
 * const permission = Permission.createViewOnly(
 *   'special_user_001',
 *   'proj_001',
 *   'admin_001'
 * );
 *
 * permission.grantRight(AccessRight.DOWNLOAD);
 * console.log(permission.canDownload()); // true
 * ```
 */
export class Permission {
  public readonly id: string;
  public readonly userId: string;
  public readonly projectId: string;
  private rightsValue: Set<AccessRight>;
  private sectionAccessValue: string[];
  public readonly grantedBy: string;
  public readonly grantedAt: Date;
  private updatedAtValue: Date;

  /**
   * Creates a new Permission entity.
   *
   * @param props - Permission properties
   * @throws {Error} If required fields are missing
   */
  public constructor(props: PermissionProps) {
    this.validateProps(props);

    this.id = props.id;
    this.userId = props.userId;
    this.projectId = props.projectId;
    this.rightsValue = new Set(props.rights);
    this.sectionAccessValue = props.sectionAccess ?? [];
    this.grantedBy = props.grantedBy;
    this.grantedAt = props.grantedAt ?? new Date();
    this.updatedAtValue = props.updatedAt ?? new Date();
  }

  /**
   * Validates permission properties.
   */
  private validateProps(props: PermissionProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new Error('Permission ID is required');
    }
    if (!props.userId || props.userId.trim() === '') {
      throw new Error('User ID is required');
    }
    if (!props.projectId || props.projectId.trim() === '') {
      throw new Error('Project ID is required');
    }
    if (!props.grantedBy || props.grantedBy.trim() === '') {
      throw new Error('Granted by (admin) is required');
    }
  }

  // Getters

  public get rights(): Set<AccessRight> {
    return new Set(this.rightsValue);
  }

  public get sectionAccess(): string[] {
    return [...this.sectionAccessValue];
  }

  public get updatedAt(): Date {
    return this.updatedAtValue;
  }

  // Business Logic Methods

  /**
   * Updates the updatedAt timestamp.
   */
  private touchUpdatedAt(): void {
    this.updatedAtValue = new Date();
  }

  /**
   * Grants an access right.
   *
   * @param right - Right to grant
   */
  public grantRight(right: AccessRight): void {
    this.rightsValue.add(right);
    this.touchUpdatedAt();
  }

  /**
   * Revokes an access right.
   *
   * @param right - Right to revoke
   */
  public revokeRight(right: AccessRight): void {
    this.rightsValue.delete(right);
    this.touchUpdatedAt();
  }

  /**
   * Checks if permission includes specific right.
   *
   * @param right - Right to check
   * @returns True if right is granted
   */
  public hasRight(right: AccessRight): boolean {
    return this.rightsValue.has(right);
  }

  /**
   * Checks VIEW right.
   */
  public canView(): boolean {
    return this.hasRight(AccessRight.VIEW);
  }

  /**
   * Checks DOWNLOAD right.
   */
  public canDownload(): boolean {
    return this.hasRight(AccessRight.DOWNLOAD);
  }

  /**
   * Checks EDIT right.
   */
  public canEdit(): boolean {
    return this.hasRight(AccessRight.EDIT);
  }

  /**
   * Checks DELETE right.
   */
  public canDelete(): boolean {
    return this.hasRight(AccessRight.DELETE);
  }

  /**
   * Checks UPLOAD right.
   */
  public canUpload(): boolean {
    return this.hasRight(AccessRight.UPLOAD);
  }

  /**
   * Checks SEND_MESSAGE right.
   */
  public canSendMessage(): boolean {
    return this.hasRight(AccessRight.SEND_MESSAGE);
  }

  /**
   * Grants access to a section.
   *
   * @param section - Section name
   */
  public grantSectionAccess(section: string): void {
    if (!this.sectionAccessValue.includes(section)) {
      this.sectionAccessValue.push(section);
      this.touchUpdatedAt();
    }
  }

  /**
   * Revokes access to a section.
   *
   * @param section - Section name
   */
  public revokeSectionAccess(section: string): void {
    const index = this.sectionAccessValue.indexOf(section);
    if (index !== -1) {
      this.sectionAccessValue.splice(index, 1);
      this.touchUpdatedAt();
    }
  }

  /**
   * Checks if can access specific section.
   *
   * @param section - Section to check
   * @returns True if has access (empty sectionAccess = all access)
   */
  public canAccessSection(section: string): boolean {
    // Empty array means all sections accessible
    if (this.sectionAccessValue.length === 0) {
      return true;
    }
    return this.sectionAccessValue.includes(section);
  }

  // Factory Methods

  /**
   * Creates view-only permission.
   *
   * @param userId - User ID
   * @param projectId - Project ID
   * @param grantedBy - Admin granting permission
   * @returns New Permission
   */
  public static createViewOnly(
    userId: string,
    projectId: string,
    grantedBy: string
  ): Permission {
    const id = `perm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return new Permission({
      id,
      userId,
      projectId,
      rights: new Set(READ_ONLY_ACCESS_RIGHTS),
      grantedBy,
    });
  }

  /**
   * Creates full access permission.
   *
   * @param userId - User ID
   * @param projectId - Project ID
   * @param grantedBy - Admin granting permission
   * @returns New Permission
   */
  public static createFullAccess(
    userId: string,
    projectId: string,
    grantedBy: string
  ): Permission {
    const id = `perm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return new Permission({
      id,
      userId,
      projectId,
      rights: new Set(ALL_ACCESS_RIGHTS),
      grantedBy,
    });
  }

  /**
   * Serializes the permission entity.
   */
  public toJSON(): object {
    return {
      id: this.id,
      userId: this.userId,
      projectId: this.projectId,
      rights: Array.from(this.rightsValue),
      sectionAccess: [...this.sectionAccessValue],
      grantedBy: this.grantedBy,
      grantedAt: this.grantedAt.toISOString(),
      updatedAt: this.updatedAtValue.toISOString(),
    };
  }
}
