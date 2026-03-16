/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/entities/global-ranking.ts
 * @desc Entity representing a participant's position in the global cross-tournament ranking.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {RankingSystem} from '../enumerations/ranking-system';

/**
 * Properties for creating a GlobalRanking entity.
 */
export interface GlobalRankingProps {
  /** Unique identifier for the ranking entry. */
  id: string;
  /** ID of the participant. */
  participantId: string;
  /** Current global ranking position. */
  position: number;
  /** Total accumulated ranking points. */
  totalPoints: number;
  /** The ranking system used for calculation. */
  rankingSystem: RankingSystem;
  /** Number of tournaments counted toward the ranking. */
  tournamentsPlayed?: number;
  /** ELO rating (only applicable when rankingSystem is ELO). */
  eloRating?: number | null;
  /** Previous ranking position (for trend display). */
  previousPosition?: number | null;
  /** Last calculation/update timestamp. */
  updatedAt?: Date;
}

/**
 * Represents a participant's position in the global ranking system.
 *
 * Global rankings aggregate results across all tournaments using the
 * Strategy Pattern (RankingSystem): points-based, ratio-based, or ELO.
 */
export class GlobalRanking {
  public readonly id: string;
  public readonly participantId: string;
  public readonly position: number;
  public readonly totalPoints: number;
  public readonly rankingSystem: RankingSystem;
  public readonly tournamentsPlayed: number;
  public readonly eloRating: number | null;
  public readonly previousPosition: number | null;
  public readonly updatedAt: Date;

  constructor(props: GlobalRankingProps) {
    this.id = props.id;
    this.participantId = props.participantId;
    this.position = props.position;
    this.totalPoints = props.totalPoints;
    this.rankingSystem = props.rankingSystem;
    this.tournamentsPlayed = props.tournamentsPlayed ?? 0;
    this.eloRating = props.eloRating ?? null;
    this.previousPosition = props.previousPosition ?? null;
    this.updatedAt = props.updatedAt ?? new Date();
  }

  /**
   * Calculates the position change since the last update.
   *
   * @returns Positive number if improved, negative if dropped, 0 if unchanged
   */
  public getPositionChange(): number {
    throw new Error('Not implemented');
  }
}
