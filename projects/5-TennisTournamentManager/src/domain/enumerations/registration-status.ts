/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/domain/enumerations/registration-status.ts
 * @desc Enumeration representing the state transitions of a participant registration (State Pattern).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Represents the current status of a participant's tournament registration.
 * Follows the State Pattern for valid transitions.
 */
export enum RegistrationStatus {
  /** Registration submitted, awaiting review or payment. */
  PENDING = 'PENDING',
  /** Registration confirmed and participant accepted into the draw. */
  ACCEPTED = 'ACCEPTED',
  /** Registration rejected by tournament administrator. */
  REJECTED = 'REJECTED',
  /** Participant placed on the waiting list. */
  WAITING_LIST = 'WAITING_LIST',
  /** Registration cancelled by the participant. */
  CANCELLED = 'CANCELLED',
  /** Participant withdrew after confirmation. */
  WITHDRAWN = 'WITHDRAWN',
}

/**
 * Type guard to check if a value is a valid RegistrationStatus.
 *
 * @param value - The value to check
 * @returns True if the value is a valid RegistrationStatus
 */
export function isValidRegistrationStatus(value: unknown): value is RegistrationStatus {
  return Object.values(RegistrationStatus).includes(value as RegistrationStatus);
}

/** Array of all registration statuses for iteration. */
export const ALL_REGISTRATION_STATUSES = Object.values(RegistrationStatus);
