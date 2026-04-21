/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/domain/enumerations/acceptance-type.ts
 * @desc Enumeration defining how participant registrations are accepted into a tournament.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Represents the type of entry a participant has into a tournament draw.
 * Covers all 9 entry states as defined in the specification (FR11).
 */
export enum AcceptanceType {
  /** Organizer Acceptance: place assigned directly by organization (OA). */
  ORGANIZER_ACCEPTANCE = 'ORGANIZER_ACCEPTANCE',
  /** Direct Acceptance: automatic entry by ranking classification (DA). */
  DIRECT_ACCEPTANCE = 'DIRECT_ACCEPTANCE',
  /** Special Exemption: place for special circumstances (SE). */
  SPECIAL_EXEMPTION = 'SPECIAL_EXEMPTION',
  /** Junior Exemption: place reserved for junior category (JE). */
  JUNIOR_EXEMPTION = 'JUNIOR_EXEMPTION',
  /** Qualifier: participant who passed qualifying phase (QU). */
  QUALIFIER = 'QUALIFIER',
  /** Lucky Loser: alternate who enters due to another participant's withdrawal (LL). */
  LUCKY_LOSER = 'LUCKY_LOSER',
  /** Wild Card: direct organizer invitation (WC). */
  WILD_CARD = 'WILD_CARD',
  /** Alternate: reserve on waiting list (ALT). */
  ALTERNATE = 'ALTERNATE',
  /** Withdrawn: participant who has withdrawn (WD). */
  WITHDRAWN = 'WITHDRAWN',
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
