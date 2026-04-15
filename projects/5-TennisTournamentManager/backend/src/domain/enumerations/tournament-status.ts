/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file domain/enumerations/tournament-status.ts
 * @desc Enumeration representing the lifecycle states of a tournament.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * Represents the current lifecycle status of a tournament.
 */
export enum TournamentStatus {
  /** Tournament created but not yet open for registration. */
  DRAFT = 'DRAFT',
  /** Registration period is open for participants. */
  REGISTRATION_OPEN = 'REGISTRATION_OPEN',
  /** Registration is closed; draws are being prepared. */
  REGISTRATION_CLOSED = 'REGISTRATION_CLOSED',
  /** Draws have been generated; matches are being scheduled. */
  DRAW_PENDING = 'DRAW_PENDING',
  /** Tournament is actively in progress with matches underway. */
  IN_PROGRESS = 'IN_PROGRESS',
  /** All matches completed; final standings calculated. */
  FINALIZED = 'FINALIZED',
  /** Tournament cancelled before completion. */
  CANCELLED = 'CANCELLED',
}
