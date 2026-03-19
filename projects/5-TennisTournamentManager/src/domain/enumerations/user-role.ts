/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/enumerations/user-role.ts
 * @desc Enumeration defining the possible roles a user can have in the Tennis Tournament Manager system. Maps to the four actor types: System Administrator, Tournament Administrator, Registered Participant, and Public.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * Represents the role assigned to a user within the system.
 * Determines the level of access and permissions available.
 */
export enum UserRole {
  /** Full platform access: user management, system configuration, audit logs. */
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  /** Tournament lifecycle management: creation, draws, scheduling, results. */
  TOURNAMENT_ADMIN = 'TOURNAMENT_ADMIN',
  /** Match officiating: result entry, score validation. */
  REFEREE = 'REFEREE',
  /** Registered player: registration, profile, own results and notifications. */
  PLAYER = 'PLAYER',
  /** Public spectator: read-only access to published draws and results. */
  SPECTATOR = 'SPECTATOR',
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

/** Array of all user roles for iteration. */
export const ALL_USER_ROLES = Object.values(UserRole);
