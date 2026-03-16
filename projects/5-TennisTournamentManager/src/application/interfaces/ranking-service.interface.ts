/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/interfaces/ranking-service.interface.ts
 * @desc Ranking service interface for global participant rankings across tournaments
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {RankingDto} from '../dto';
import {PaginatedResponseDto, PaginationDto} from '../dto';

/**
 * Ranking service interface.
 * Handles global ranking calculation and retrieval across all tournaments.
 */
export interface IRankingService {
  /**
   * Retrieves the global ranking with pagination.
   *
   * @param pagination - Pagination parameters
   * @returns Paginated list of global rankings
   */
  getGlobalRanking(pagination: PaginationDto): Promise<PaginatedResponseDto<RankingDto>>;

  /**
   * Retrieves the global ranking for a specific participant.
   *
   * @param participantId - ID of the participant
   * @returns Participant's global ranking information
   */
  getParticipantRanking(participantId: string): Promise<RankingDto>;

  /**
   * Recalculates all global rankings based on tournament results.
   */
  recalculateRankings(): Promise<void>;
}
