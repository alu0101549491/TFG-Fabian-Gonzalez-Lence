/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file application/dto/statistics.dto.ts
 * @desc Data transfer objects for statistics-related operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/** DTO for statistics output representation. */
export interface StatisticsDto {
  participantId: string | null;
  participantName: string | null;
  tournamentId: string | null;
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  winPercentage: number;
  totalSetsWon: number;
  totalSetsLost: number;
  setRatio: number;
  totalGamesWon: number;
  totalGamesLost: number;
  tiebreaksWon: number;
  currentWinStreak: number;
  bestWinStreak: number;
}
