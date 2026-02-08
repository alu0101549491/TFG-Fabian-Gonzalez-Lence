/**
 * @module domain/enumerations/access-right
 * @description Enumeration defining the granular access rights for permissions.
 * @category Domain
 */

/**
 * Represents specific access rights that can be granted to a user
 * for a particular project.
 */
export enum AccessRight {
  /** Permission to view project data and files. */
  VIEW = 'VIEW',
  /** Permission to download project files. */
  DOWNLOAD = 'DOWNLOAD',
  /** Permission to edit project data and tasks. */
  EDIT = 'EDIT',
  /** Permission to delete project elements. */
  DELETE = 'DELETE',
  /** Permission to upload new files to the project. */
  UPLOAD = 'UPLOAD',
  /** Permission to send messages in the project. */
  SEND_MESSAGE = 'SEND_MESSAGE',
}

/**
 * Human-readable display names for access rights.
 */
export const AccessRightDisplayName: Record<AccessRight, string> = {
  [AccessRight.VIEW]: 'View',
  [AccessRight.DOWNLOAD]: 'Download',
  [AccessRight.EDIT]: 'Edit',
  [AccessRight.DELETE]: 'Delete',
  [AccessRight.UPLOAD]: 'Upload',
  [AccessRight.SEND_MESSAGE]: 'Send Message',
};

/**
 * Descriptions for access rights.
 */
export const AccessRightDescription: Record<AccessRight, string> = {
  [AccessRight.VIEW]: 'Can view project data and files',
  [AccessRight.DOWNLOAD]: 'Can download project files',
  [AccessRight.EDIT]: 'Can edit project data and tasks',
  [AccessRight.DELETE]: 'Can delete project elements',
  [AccessRight.UPLOAD]: 'Can upload files to the project',
  [AccessRight.SEND_MESSAGE]: 'Can send messages in the project',
};

/**
 * Type guard to check if a value is a valid AccessRight.
 *
 * @param value - The value to check
 * @returns True if the value is a valid AccessRight
 */
export function isValidAccessRight(value: unknown): value is AccessRight {
  return Object.values(AccessRight).includes(value as AccessRight);
}

/**
 * Checks if a set of access rights includes a specific right.
 *
 * @param rights - Array of access rights to check
 * @param right - The specific right to look for
 * @returns True if the right is included in the set
 */
export function hasAccessRight(
  rights: AccessRight[],
  right: AccessRight
): boolean {
  return rights.includes(right);
}

/**
 * Array of all access rights for iteration.
 */
export const ALL_ACCESS_RIGHTS = Object.values(AccessRight);

/**
 * Default access rights for read-only special users.
 */
export const READ_ONLY_ACCESS_RIGHTS: AccessRight[] = [AccessRight.VIEW];

/**
 * Standard access rights for contributors (can view, download, and upload).
 */
export const CONTRIBUTOR_ACCESS_RIGHTS: AccessRight[] = [
  AccessRight.VIEW,
  AccessRight.DOWNLOAD,
  AccessRight.UPLOAD,
  AccessRight.SEND_MESSAGE,
];
