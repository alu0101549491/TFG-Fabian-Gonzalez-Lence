/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/enumerations/match-status.ts
 * @desc Enumeration representing the state transitions of a match (State Pattern).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * Represents the current status of a tennis match.
 * Follows the State Pattern for valid transitions.
 */
export enum MatchStatus {
  /** Match scheduled but not yet started. */
  SCHEDULED = 'SCHEDULED',
  /** Match is currently being played. */
  IN_PROGRESS = 'IN_PROGRESS',
  /** Match completed with a result recorded. */
  COMPLETED = 'COMPLETED',
  /** Match suspended due to weather or other circumstances. */
  SUSPENDED = 'SUSPENDED',
  /** Match postponed to a later date/time. */
  POSTPONED = 'POSTPONED',
  /** Match cancelled and will not be played. */
  CANCELLED = 'CANCELLED',
  /** Match awarded by walkover (opponent did not appear). */
  WALKOVER = 'WALKOVER',
  /** Match result under dispute or review. */
  UNDER_REVIEW = 'UNDER_REVIEW',
}

/**
 * Type guard to check if a value is a valid MatchStatus.
 *
 * @param value - The value to check
 * @returns True if the value is a valid MatchStatus
 */
export function isValidMatchStatus(value: unknown): value is MatchStatus {
  return Object.values(MatchStatus).includes(value as MatchStatus);
}

/** Array of all match statuses for iteration. */
export const ALL_MATCH_STATUSES = Object.values(MatchStatus);
