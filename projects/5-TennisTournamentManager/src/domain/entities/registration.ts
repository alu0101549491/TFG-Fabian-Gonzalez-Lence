/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/entities/registration.ts
 * @desc Entity representing a participant's registration for a tournament category. Follows the State Pattern for status transitions (RegistrationStatus).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {RegistrationStatus} from '../enumerations/registration-status';

/**
 * Properties for creating a Registration entity.
 */
export interface RegistrationProps {
  /** Unique identifier for the registration. */
  id: string;
  /** ID of the participant (User). */
  participantId: string;
  /** ID of the tournament. */
  tournamentId: string;
  /** ID of the category within the tournament. */
  categoryId: string;
  /** Current registration status. */
  status?: RegistrationStatus;
  /** Seed number assigned (null if unseeded). */
  seed?: number | null;
  /** Registration date. */
  registeredAt?: Date;
  /** Date the status was last updated. */
  updatedAt?: Date;
}

/**
 * Represents a participant's registration for a specific tournament category.
 *
 * Registration follows the State Pattern with these valid transitions:
 * PENDING → CONFIRMED | REJECTED | WAITLISTED | CANCELLED
 * WAITLISTED → CONFIRMED | CANCELLED
 * CONFIRMED → WITHDRAWN
 */
export class Registration {
  public readonly id: string;
  public readonly participantId: string;
  public readonly tournamentId: string;
  public readonly categoryId: string;
  public readonly status: RegistrationStatus;
  public readonly seed: number | null;
  public readonly registeredAt: Date;
  public readonly updatedAt: Date;

  constructor(props: RegistrationProps) {
    this.id = props.id;
    this.participantId = props.participantId;
    this.tournamentId = props.tournamentId;
    this.categoryId = props.categoryId;
    this.status = props.status ?? RegistrationStatus.PENDING;
    this.seed = props.seed ?? null;
    this.registeredAt = props.registeredAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  /**
   * Checks whether this registration can transition to the given status.
   *
   * @param newStatus - The target status to transition to
   * @returns True if the transition is valid per the state machine
   */
  public canTransitionTo(newStatus: RegistrationStatus): boolean {
    throw new Error('Not implemented');
  }

  /**
   * Checks whether this registration is confirmed and the participant is in the draw.
   *
   * @returns True if registration status is CONFIRMED
   */
  public isConfirmed(): boolean {
    throw new Error('Not implemented');
  }
}
