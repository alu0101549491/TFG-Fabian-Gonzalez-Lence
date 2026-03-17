/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/enumerations/sanction-type.ts
 * @desc Enumeration defining the types of sanctions/penalties that can be applied to participants.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * Represents the type of sanction applied to a participant.
 */
export enum SanctionType {
  /** Verbal warning for minor infractions. */
  WARNING = 'WARNING',
  /** Point deduction during a match. */
  POINT_DEDUCTION = 'POINT_DEDUCTION',
  /** Exclusion from the current match or tournament. */
  EXCLUSION = 'EXCLUSION',
}

/**
 * Type guard to check if a value is a valid SanctionType.
 *
 * @param value - The value to check
 * @returns True if the value is a valid SanctionType
 */
export function isValidSanctionType(value: unknown): value is SanctionType {
  return Object.values(SanctionType).includes(value as SanctionType);
}

/** Array of all sanction types for iteration. */
export const ALL_SANCTION_TYPES = Object.values(SanctionType);
