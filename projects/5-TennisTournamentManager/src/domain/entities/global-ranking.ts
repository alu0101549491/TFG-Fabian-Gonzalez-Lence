/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/domain/entities/global-ranking.ts
 * @desc Entity representing a participant's position in the global cross-tournament ranking.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
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
  points: number;
  /** The ranking system used for calculation. */
  system: RankingSystem;
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
  public readonly points: number;
  public readonly system: RankingSystem;
  public readonly tournamentsPlayed: number;
  public readonly eloRating: number | null;
  public readonly previousPosition: number | null;
  public readonly updatedAt: Date;

  constructor(props: GlobalRankingProps) {
    this.id = props.id;
    this.participantId = props.participantId;
    this.position = props.position;
    this.points = props.points;
    this.system = props.system;
    this.tournamentsPlayed = props.tournamentsPlayed ?? 0;
    this.eloRating = props.eloRating ?? null;
    this.previousPosition = props.previousPosition ?? null;
    this.updatedAt = props.updatedAt ?? new Date();
  }

  /**
   * Updates ranking points based on a match result.
   *
   * @param result - The match result data
   */
  public updatePoints(result: Record<string, unknown>): void {
    // Note: Actual ranking calculation should be done in the application
    // layer by the GlobalRankingService using the configured RankingSystem.
    // This method validates the input.
    if (!result) {
      throw new Error('Match result is required to update ranking points.');
    }
    
    // Validation only - real implementation in application layer
  }
}
