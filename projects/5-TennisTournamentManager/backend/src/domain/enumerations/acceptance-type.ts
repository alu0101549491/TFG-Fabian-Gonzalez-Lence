/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file domain/enumerations/acceptance-type.ts
 * @desc Enumeration defining how participant registrations are accepted into a tournament.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * Represents the type of entry a participant has into a tournament draw.
 */
export enum AcceptanceType {
  /** Direct Acceptance by ranking classification (DA). */
  DIRECT_ACCEPTANCE = 'DIRECT_ACCEPTANCE',
  /** Wild Card: direct organizer invitation (WC). */
  WILD_CARD = 'WILD_CARD',
  /** Seeded: pre-ranked player placed in strategic draw positions (SE). */
  SEEDED = 'SEEDED',
}
