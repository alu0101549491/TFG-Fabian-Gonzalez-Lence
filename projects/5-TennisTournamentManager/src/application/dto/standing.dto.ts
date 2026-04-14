/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file application/dto/standing.dto.ts
 * @desc Data transfer objects for standing-related operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/** Doubles team info in standings. */
export interface StandingTeamDto {
  id: string;
  seedNumber?: number | null;
  player1: {id: string; firstName: string; lastName: string};
  player2: {id: string; firstName: string; lastName: string};
}

/** DTO for standing output representation. */
export interface StandingDto {
  id: string;
  bracketId: string;
  participantId: string | null;
  teamId?: string | null;
  team?: StandingTeamDto | null;
  participantName: string;
  position: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  points: number;
  setDifference: number;
  gameDifference: number;
}
