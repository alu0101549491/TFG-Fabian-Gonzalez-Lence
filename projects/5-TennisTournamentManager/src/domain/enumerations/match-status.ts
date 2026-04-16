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
  /** Match created but not yet scheduled (awaiting players, time, court). */
  NOT_SCHEDULED = 'NOT_SCHEDULED',
  /** Match fully scheduled with players, time, and court assigned (TBP — To Be Played). */
  SCHEDULED = 'SCHEDULED',
  /** Match is currently being played (IP — In Progress). */
  IN_PROGRESS = 'IN_PROGRESS',
  /** Match completed with a result recorded (CO — Completed). */
  COMPLETED = 'COMPLETED',
  /** Match suspended due to weather or other circumstances (SUS). */
  SUSPENDED = 'SUSPENDED',
  /** Match awarded by walkover — opponent did not appear (WO). */
  WALKOVER = 'WALKOVER',
  /** Match ended by retirement during play (RET). */
  RETIRED = 'RETIRED',
  /** Match abandoned without valid result (ABN). */
  ABANDONED = 'ABANDONED',
  /** Automatic pass without playing (BYE). */
  BYE = 'BYE',
  /** Match not played / not disputed (NP). */
  NOT_PLAYED = 'NOT_PLAYED',
  /** Match cancelled by organization (CAN). */
  CANCELLED = 'CANCELLED',
  /** Disciplinary disqualification (DEF — Player default). */
  DEFAULT = 'DEFAULT',
  /** Match without relevance for standings (DR — Dead rubber). */
  DEAD_RUBBER = 'DEAD_RUBBER',
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
