/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file domain/enumerations/user-role.ts
 * @desc Enumeration defining the possible roles a user can have in the Cartographic Project Manager system.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
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
