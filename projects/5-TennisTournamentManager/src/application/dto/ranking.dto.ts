/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file application/dto/ranking.dto.ts
 * @desc Data transfer objects for global ranking operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {RankingSystem} from '@domain/enumerations/ranking-system';

/** DTO for ranking output representation. */
export interface RankingDto {
  id: string;
  participantId: string;
  participantName: string;
  position: number;
  totalPoints: number;
  rankingSystem: RankingSystem;
  tournamentsPlayed: number;
  eloRating: number | null;
  positionChange: number;
}
