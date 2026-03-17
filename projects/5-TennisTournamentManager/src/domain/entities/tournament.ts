/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/entities/tournament.ts
 * @desc Entity representing a tennis tournament. Manages the full tournament lifecycle from creation through registration, draw generation, match play, and completion.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {TournamentStatus} from '../enumerations/tournament-status';
import {Surface} from '../enumerations/surface';
import {AcceptanceType} from '../enumerations/acceptance-type';
import {RankingSystem} from '../enumerations/ranking-system';
import {Category} from './category';
import {Court} from './court';

/**
 * Properties for creating a Tournament entity.
 */
export interface TournamentProps {
  /** Unique identifier for the tournament. */
  id: string;
  /** Official name of the tournament. */
  name: string;
  /** Detailed description of the tournament. */
  description?: string;
  /** Tournament start date. */
  startDate: Date;
  /** Tournament end date. */
  endDate: Date;
  /** Physical location / venue of the tournament. */
  location: string;
  /** Default court surface type. */
  surface: Surface;
  /** Current lifecycle status. */
  status?: TournamentStatus;
  /** Maximum number of participants allowed. */
  maxParticipants: number;
  /** Registration fee amount. */
  registrationFee?: number;
  /** Currency for the registration fee (ISO 4217). */
  currency?: string;
  /** How participant registrations are accepted. */
  acceptanceType?: AcceptanceType;
  /** Ranking system used for standings calculation. */
  rankingSystem?: RankingSystem;
  /** ID of the tournament administrator who created this tournament. */
  organizerId: string;
  /** Registration opening date. */
  registrationOpenDate?: Date;
  /** Registration closing date. */
  registrationCloseDate?: Date;
  /** Categories within this tournament. */
  categories?: Category[];
  /** Courts available for this tournament. */
  courts?: Court[];
  /** Tournament configuration settings. */
  config?: Record<string, unknown>;
  /** Creation timestamp. */
  createdAt?: Date;
  /** Last update timestamp. */
  updatedAt?: Date;
}

/**
 * Represents a tennis tournament in the system.
 *
 * A tournament progresses through a defined lifecycle:
 * DRAFT → REGISTRATION_OPEN → REGISTRATION_CLOSED → DRAW_PENDING →
 * IN_PROGRESS → COMPLETED (or CANCELLED at any point).
 *
 * Supports multiple categories, courts, bracket types, and configurable
 * ranking systems for standings calculation.
 */
export class Tournament {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly startDate: Date;
  public readonly endDate: Date;
  public readonly location: string;
  public readonly surface: Surface;
  public readonly status: TournamentStatus;
  public readonly maxParticipants: number;
  public readonly registrationFee: number;
  public readonly currency: string;
  public readonly acceptanceType: AcceptanceType;
  public readonly rankingSystem: RankingSystem;
  public readonly organizerId: string;
  public readonly registrationOpenDate: Date | null;
  public readonly registrationCloseDate: Date | null;
  public readonly categories: Category[];
  public readonly courts: Court[];
  public readonly config: Record<string, unknown>;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: TournamentProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description ?? '';
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.location = props.location;
    this.surface = props.surface;
    this.status = props.status ?? TournamentStatus.DRAFT;
    this.maxParticipants = props.maxParticipants;
    this.registrationFee = props.registrationFee ?? 0;
    this.currency = props.currency ?? 'EUR';
    this.acceptanceType = props.acceptanceType ?? AcceptanceType.MANUAL;
    this.rankingSystem = props.rankingSystem ?? RankingSystem.POINTS_BASED;
    this.organizerId = props.organizerId;
    this.registrationOpenDate = props.registrationOpenDate ?? null;
    this.registrationCloseDate = props.registrationCloseDate ?? null;
    this.categories = props.categories ?? [];
    this.courts = props.courts ?? [];
    this.config = props.config ?? {};
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  /**
   * Checks whether the tournament is currently accepting registrations.
   *
   * @returns True if registration is open
   */
  public isRegistrationOpen(): boolean {
    throw new Error('Not implemented');
  }

  /**
   * Checks whether the tournament can accept new registrations.
   *
   * @returns True if the tournament accepts registrations
   */
  public canAcceptRegistrations(): boolean {
    throw new Error('Not implemented');
  }

  /**
   * Finalizes the tournament, marking it as complete.
   */
  public finalize(): void {
    throw new Error('Not implemented');
  }

  /**
   * Checks whether the tournament can transition to the given status.
   *
   * @param newStatus - The target status to transition to
   * @returns True if the transition is valid
   */
  public canTransitionTo(newStatus: TournamentStatus): boolean {
    throw new Error('Not implemented');
  }
}
