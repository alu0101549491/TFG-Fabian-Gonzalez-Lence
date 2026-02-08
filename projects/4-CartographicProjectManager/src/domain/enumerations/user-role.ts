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

/**
 * Human-readable display names for user roles.
 */
export const UserRoleDisplayName: Record<UserRole, string> = {
  [UserRole.ADMINISTRATOR]: 'Administrator',
  [UserRole.CLIENT]: 'Client',
  [UserRole.SPECIAL_USER]: 'Special User',
};

/**
 * Type guard to check if a value is a valid UserRole.
 *
 * @param value - The value to check
 * @returns True if the value is a valid UserRole
 */
export function isValidUserRole(value: unknown): value is UserRole {
  return Object.values(UserRole).includes(value as UserRole);
}

/**
 * Array of all user roles for iteration.
 */
export const ALL_USER_ROLES = Object.values(UserRole);
