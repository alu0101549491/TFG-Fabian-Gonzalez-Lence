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
}
