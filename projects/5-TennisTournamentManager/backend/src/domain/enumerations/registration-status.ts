/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file domain/enumerations/registration-status.ts
 * @desc Enumeration representing the state transitions of a participant registration.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * Represents the current status of a participant's tournament registration.
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
