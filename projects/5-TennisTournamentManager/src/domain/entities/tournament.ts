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
import {FacilityType} from '../enumerations/facility-type';
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
  /** Facility type (indoor or outdoor). */
  facilityType?: FacilityType;
  /** Tournament-specific regulations, rules, and tiebreak criteria. */
  regulations?: string;
  /** Primary branding colour (hex, e.g. '#2563eb'). */
  primaryColor?: string | null;
  /** Secondary/accent branding colour (hex, e.g. '#10b981'). */
  secondaryColor?: string | null;
  /** URL of the tournament logo image. */
  logoUrl?: string | null;
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
  public readonly facilityType: FacilityType;
  public readonly regulations: string;
  public readonly primaryColor: string | null;
  public readonly secondaryColor: string | null;
  public readonly logoUrl: string | null;
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
    this.facilityType = props.facilityType ?? FacilityType.OUTDOOR;
    this.regulations = props.regulations ?? '';
    this.primaryColor = props.primaryColor ?? null;
    this.secondaryColor = props.secondaryColor ?? null;
    this.logoUrl = props.logoUrl ?? null;
    this.status = props.status ?? TournamentStatus.DRAFT;
    this.maxParticipants = props.maxParticipants;
    this.registrationFee = props.registrationFee ?? 0;
    this.currency = props.currency ?? 'EUR';
    this.acceptanceType = props.acceptanceType ?? AcceptanceType.DIRECT_ACCEPTANCE;
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
    const now = new Date();
    
    if (this.status !== TournamentStatus.REGISTRATION_OPEN) {
      return false;
    }
    
    if (this.registrationOpenDate && now < this.registrationOpenDate) {
      return false;
    }
    
    if (this.registrationCloseDate && now > this.registrationCloseDate) {
      return false;
    }
    
    return true;
  }

  /**
   * Checks whether the tournament can accept new registrations.
   *
   * @returns True if the tournament accepts registrations
   */
  public canAcceptRegistrations(): boolean {
    return this.isRegistrationOpen();
  }

  /**
   * Finalizes the tournament, marking it as complete.
   */
  public finalize(): void {
    if (!this.canTransitionTo(TournamentStatus.FINALIZED)) {
      throw new Error(
        `Cannot finalize tournament in status ${this.status}. Must be IN_PROGRESS.`
      );
    }
    
    // Note: Actual status update should be done via repository in application layer
    // This method validates the business rule only
  }

  /**
   * Checks whether the tournament can transition to the given status.
   *
   * @param newStatus - The target status to transition to
   * @returns True if the transition is valid
   */
  public canTransitionTo(newStatus: TournamentStatus): boolean {
    const validTransitions: Record<TournamentStatus, TournamentStatus[]> = {
      [TournamentStatus.DRAFT]: [
        TournamentStatus.REGISTRATION_OPEN,
        TournamentStatus.CANCELLED,
      ],
      [TournamentStatus.REGISTRATION_OPEN]: [
        TournamentStatus.REGISTRATION_CLOSED,
        TournamentStatus.CANCELLED,
      ],
      [TournamentStatus.REGISTRATION_CLOSED]: [
        TournamentStatus.DRAW_PENDING,
        TournamentStatus.CANCELLED,
      ],
      [TournamentStatus.DRAW_PENDING]: [
        TournamentStatus.IN_PROGRESS,
        TournamentStatus.CANCELLED,
      ],
      [TournamentStatus.IN_PROGRESS]: [
        TournamentStatus.FINALIZED,
        TournamentStatus.CANCELLED,
      ],
      [TournamentStatus.FINALIZED]: [],
      [TournamentStatus.CANCELLED]: [],
    };
    
    const allowedTransitions = validTransitions[this.status] || [];
    return allowedTransitions.includes(newStatus);
  }
}
