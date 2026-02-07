/**
 * @module domain/enumerations/user-role
 * @description Enumeration defining the possible roles a user can have
 * in the Cartographic Project Manager system.
 * @category Domain
 */

/**
 * Represents the role assigned to a user within the system.
 * Determines the level of access and permissions available.
 */
export enum UserRole {
  /** Full system access: project creation, user management, finalization. */
  ADMINISTRATOR = 'ADMINISTRATOR',
  /** Standard project participant: task creation, messaging, file access. */
  CLIENT = 'CLIENT',
  /** Limited access user: view-only or restricted permissions per project. */
  SPECIAL_USER = 'SPECIAL_USER',
}
