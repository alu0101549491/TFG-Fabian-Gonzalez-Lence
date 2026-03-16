/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/enumerations/acceptance-type.ts
 * @desc Enumeration defining how participant registrations are accepted into a tournament.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * Represents the method used to accept participants into a tournament.
 */
export enum AcceptanceType {
  /** Participants are accepted automatically upon registration. */
  AUTOMATIC = 'AUTOMATIC',
  /** Tournament administrator manually reviews and accepts participants. */
  MANUAL = 'MANUAL',
  /** Acceptance based on ranking position or seeding criteria. */
  RANKING_BASED = 'RANKING_BASED',
}

/**
 * Type guard to check if a value is a valid AcceptanceType.
 *
 * @param value - The value to check
 * @returns True if the value is a valid AcceptanceType
 */
export function isValidAcceptanceType(value: unknown): value is AcceptanceType {
  return Object.values(AcceptanceType).includes(value as AcceptanceType);
}

/** Array of all acceptance types for iteration. */
export const ALL_ACCEPTANCE_TYPES = Object.values(AcceptanceType);
