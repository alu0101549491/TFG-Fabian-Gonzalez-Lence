/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/domain/enumerations/ranking-system.ts
 * @desc Enumeration defining the ranking calculation strategies (Strategy Pattern).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Represents the ranking calculation system used for standings.
 * Implements the Strategy Pattern — each value maps to a different ranking algorithm.
 */
export enum RankingSystem {
  /** Points-based ranking: accumulates points per win/loss/draw. */
  POINTS_BASED = 'POINTS_BASED',
  /** Ratio-based ranking: win/loss ratio calculation. */
  RATIO_BASED = 'RATIO_BASED',
  /** ELO rating system: dynamic rating based on opponent strength. */
  ELO = 'ELO',
}

/**
 * Type guard to check if a value is a valid RankingSystem.
 *
 * @param value - The value to check
 * @returns True if the value is a valid RankingSystem
 */
export function isValidRankingSystem(value: unknown): value is RankingSystem {
  return Object.values(RankingSystem).includes(value as RankingSystem);
}

/**
 * Converts a RankingSystem enum to a user-friendly display name.
 *
 * @param system - The ranking system enum value
 * @returns Human-readable name
 */
export function getRankingSystemDisplayName(system: RankingSystem): string {
  switch (system) {
    case RankingSystem.POINTS_BASED:
      return 'Points Based';
    case RankingSystem.RATIO_BASED:
      return 'Ratio Based';
    case RankingSystem.ELO:
      return 'ELO Rating';
    default:
      return system;
  }
}

/** Array of all ranking systems for iteration. */
export const ALL_RANKING_SYSTEMS = Object.values(RankingSystem);
