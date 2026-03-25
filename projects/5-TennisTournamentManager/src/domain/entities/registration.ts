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
import {AcceptanceType} from '../enumerations/acceptance-type';
import {Tournament} from './tournament';
import {Category} from './category';

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
  /** Type of acceptance (direct, waitlist, etc.). */
  acceptanceType?: AcceptanceType;
  /** Participant's ranking. */
  ranking?: number;
  /** Seed number assigned (null if unseeded). */
  seed?: number | null;
  /** Registration date. */
  registeredAt?: Date;
  /** Date the status was last updated. */
  updatedAt?: Date;
  /** Optional populated tournament object. */
  tournament?: Tournament;
  /** Optional populated category object. */
  category?: Category;
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
  public readonly acceptanceType: AcceptanceType;
  public readonly ranking: number;
  public readonly seed: number | null;
  public readonly registeredAt: Date;
  public readonly updatedAt: Date;
  public readonly tournament?: Tournament;
  public readonly category?: Category;

  constructor(props: RegistrationProps) {
    this.id = props.id;
    this.participantId = props.participantId;
    this.tournamentId = props.tournamentId;
    this.categoryId = props.categoryId;
    this.status = props.status ?? RegistrationStatus.PENDING;
    this.acceptanceType = props.acceptanceType ?? AcceptanceType.DIRECT_ACCEPTANCE;
    this.ranking = props.ranking ?? 0;
    this.seed = props.seed ?? null;
    this.registeredAt = props.registeredAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
    this.tournament = props.tournament;
    this.category = props.category;
  }

  /**
   * Accepts this registration.
   */
  public accept(): void {
    if (this.status !== RegistrationStatus.PENDING && 
        this.status !== RegistrationStatus.WAITING_LIST) {
      throw new Error(
        `Cannot accept registration in status ${this.status}. ` +
        'Must be PENDING or WAITING_LIST.'
      );
    }
    
    // Note: Actual status update should be done via repository in application layer
    // This method validates the business rule only
  }

  /**
   * Withdraws this registration at the specified time.
   *
   * @param time - The withdrawal timestamp
   */
  public withdraw(time: string): void {
    if (this.status === RegistrationStatus.WITHDRAWN) {
      throw new Error('Registration is already withdrawn.');
    }
    
    // Note: Actual status update should be done via repository in application layer
    // This method validates the business rule only
  }
}
