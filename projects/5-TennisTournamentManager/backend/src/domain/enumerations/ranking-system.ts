/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file domain/enumerations/ranking-system.ts
 * @desc Enumeration defining the ranking calculation strategies (Strategy Pattern).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * Represents the ranking calculation system used for standings.
 */
export enum RankingSystem {
  /** Points-based ranking: accumulates points per win/loss/draw. */
  POINTS_BASED = 'POINTS_BASED',
  /** Ratio-based ranking: win/loss ratio calculation. */
  RATIO_BASED = 'RATIO_BASED',
  /** ELO rating system: dynamic rating based on opponent strength. */
  ELO = 'ELO',
}
