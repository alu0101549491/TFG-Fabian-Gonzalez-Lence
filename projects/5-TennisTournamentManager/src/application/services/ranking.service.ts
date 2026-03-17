/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/services/ranking.service.ts
 * @desc Ranking service implementation for global participant rankings
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable} from '@angular/core';
import {IRankingService} from '../interfaces/ranking-service.interface';
import {RankingDto} from '../dto';
import {PaginatedResponseDto, PaginationDto} from '../dto';
import {GlobalRankingRepositoryImpl} from '@infrastructure/repositories/global-ranking.repository';
import {StandingRepositoryImpl} from '@infrastructure/repositories/standing.repository';

/**
 * Ranking service implementation.
 * Handles global ranking calculation and retrieval across all tournaments.
 */
@Injectable({providedIn: 'root'})
export class RankingService implements IRankingService {
  /**
   * Creates a new RankingService instance.
   *
   * @param globalRankingRepository - Global ranking repository for data access
   * @param _standingRepository - Standing repository for tournament results (reserved for future use)
   */
  public constructor(
    private readonly globalRankingRepository: GlobalRankingRepositoryImpl,
    private readonly _standingRepository: StandingRepositoryImpl,
    // TODO: inject RankingCalculator
  ) {}

  /**
   * Retrieves the global ranking with pagination.
   *
   * @param pagination - Pagination parameters
   * @returns Paginated list of global rankings
   */
  public async getGlobalRanking(pagination: PaginationDto): Promise<PaginatedResponseDto<RankingDto>> {
    // Get all rankings (in real implementation, apply pagination at DB level)
    const rankings = await this.globalRankingRepository.findAll();
    
    // Sort by position
    rankings.sort((a, b) => a.position - b.position);
    
    // Apply pagination
    const page = pagination.page ?? 1;
    const pageSize = pagination.pageSize ?? 20;
    const total = rankings.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    const paginatedRankings = rankings.slice(startIndex, endIndex);
    
    // Map to DTOs
    const items = paginatedRankings.map(r => this.mapRankingToDto(r));
    
    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Retrieves the global ranking for a specific participant.
   *
   * @param participantId - ID of the participant
   * @returns Participant's global ranking information
   */
  public async getParticipantRanking(participantId: string): Promise<RankingDto> {
    // Validate input
    if (!participantId || participantId.trim().length === 0) {
      throw new Error('Participant ID is required');
    }
    
    // Find ranking
    const ranking = await this.globalRankingRepository.findByParticipant(participantId);
    if (!ranking) {
      throw new Error('Ranking not found for participant');
    }
    
    // Map to DTO
    return this.mapRankingToDto(ranking);
  }

  /**
   * Recalculates all global rankings based on tournament results.
   */
  public async recalculateRankings(): Promise<void> {
    // In real implementation, fetch all standings and use RankingCalculator 
    // to compute points based on tournament results, wins, and ranking system
    // For now, this is a placeholder
    
    // Example: const allStandings = await this.standingRepository.findAll();
    // Process standings and update rankings
    // await this.globalRankingRepository.updateAll(calculatedRankings);
  }

  /**
   * Updates the global ranking for a participant based on a tournament result.
   *
   * @param participantId - ID of the participant
   * @param result - Tournament result data
   */
  public async updateGlobalRanking(participantId: string, result: Record<string, unknown>): Promise<void> {
    // Validate input
    if (!participantId || participantId.trim().length === 0) {
      throw new Error('Participant ID is required');
    }
    
    if (!result) {
      throw new Error('Result data is required');
    }
    
    // Get current ranking
    const ranking = await this.globalRankingRepository.findByParticipant(participantId);
    if (!ranking) {
      throw new Error('Ranking not found for participant');
    }
    
    // In real implementation, use RankingCalculator to compute new points
    // based on result and ranking system
    // For now, this is a placeholder
    
    // Update ranking
    // await this.globalRankingRepository.update(updatedRanking);
  }

  /**
   * Calculates seeding order for a category.
   *
   * @param categoryId - ID of the category
   * @param count - Number of seeds to calculate
   * @returns List of participant IDs in seeding order
   */
  public async calculateSeeds(categoryId: string, count: number): Promise<string[]> {
    // Validate input
    if (!categoryId || categoryId.trim().length === 0) {
      throw new Error('Category ID is required');
    }
    
    if (count <= 0) {
      throw new Error('Seed count must be greater than 0');
    }
    
    // Get all standings for the category (from previous tournaments)
    // In real implementation, this would use global rankings and
    // filter by participants registered in this category
    const allRankings = await this.globalRankingRepository.findAll();
    
    // Sort by ranking position
    const sortedRankings = allRankings.sort((a, b) => a.position - b.position);
    
    // Take top N participants
    const seeds = sortedRankings.slice(0, count).map(r => r.participantId);
    
    return seeds;
  }

  /**
   * Maps a GlobalRanking entity to RankingDto.
   *
   * @param ranking - GlobalRanking entity
   * @returns Ranking DTO
   */
  private mapRankingToDto(ranking: any): RankingDto {
    return {
      id: ranking.id,
      participantId: ranking.participantId,
      participantName: ranking.participantName ?? 'Unknown',
      position: ranking.position,
      totalPoints: ranking.totalPoints,
      rankingSystem: ranking.rankingSystem,
      tournamentsPlayed: ranking.tournamentsPlayed ?? 0,
      eloRating: ranking.eloRating ?? null,
      positionChange: ranking.positionChange ?? 0,
    };
  }
}
