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
 * @see {@link https://typescripttutorial.net}
 */

import {Injectable, inject} from '@angular/core';
import {IRankingService} from '../interfaces/ranking-service.interface';
import {RankingDto} from '../dto';
import {PaginatedResponseDto, PaginationDto} from '../dto';
import {GlobalRankingRepositoryImpl} from '@infrastructure/repositories/global-ranking.repository';
import {RegistrationRepositoryImpl} from '@infrastructure/repositories/registration.repository';
import {StandingRepositoryImpl} from '@infrastructure/repositories/standing.repository';
import {AxiosClient} from '@infrastructure/http/axios-client';
import {RankingSystem} from '@domain/enumerations/ranking-system';
import {AcceptanceType} from '@domain/enumerations/acceptance-type';
import {RegistrationStatus} from '@domain/enumerations/registration-status';

interface RankingApiResponse {
  id: string;
  playerId: string;
  playerName: string;
  rank: number;
  points: number;
  tournamentsPlayed?: number;
  wins?: number;
  losses?: number;
}

/**
 * Ranking service implementation.
 * Handles global ranking calculation and retrieval across all tournaments.
 */
@Injectable({providedIn: 'root'})
export class RankingService implements IRankingService {
  private static readonly POINTS_PER_WIN = 3;

  private readonly globalRankingRepository = inject(GlobalRankingRepositoryImpl);
  private readonly _standingRepository = inject(StandingRepositoryImpl);
  private readonly registrationRepository = inject(RegistrationRepositoryImpl);
  private readonly httpClient = inject(AxiosClient);
  // TODO: inject RankingCalculator

  /**
   * Retrieves rankings for a selected ranking system.
   *
   * @remarks
   * Backend currently exposes ELO global rankings at `/api/rankings`.
   * For non-ELO systems we return the same dataset for now to keep the page usable.
   *
   * @param system - Requested ranking system
   * @returns Ranking DTO list for the view
   */
  public async getRankingsBySystem(system: RankingSystem): Promise<RankingDto[]> {
    const response = await this.httpClient.get<RankingApiResponse[]>('/rankings');

    if (system === RankingSystem.ELO) {
      return [...response]
        .sort((left, right) => left.rank - right.rank)
        .map((item) => ({
          id: item.id,
          participantId: item.playerId,
          participantName: item.playerName,
          position: item.rank,
          totalPoints: item.points,
          rankingSystem: RankingSystem.ELO,
          tournamentsPlayed: item.tournamentsPlayed ?? 0,
          eloRating: item.points,
          positionChange: 0,
        }));
    }

    return this.buildDerivedRankings(response, system);
  }

  private buildDerivedRankings(
    response: RankingApiResponse[],
    system: RankingSystem.POINTS_BASED | RankingSystem.RATIO_BASED,
  ): RankingDto[] {
    const derived = response.map((item) => {
      const matchesPlayed = (item.wins ?? 0) + (item.losses ?? 0);
      const score = system === RankingSystem.POINTS_BASED
        ? (item.wins ?? 0) * RankingService.POINTS_PER_WIN + matchesPlayed
        : (matchesPlayed === 0 ? 0 : Number((((item.wins ?? 0) / matchesPlayed) * 100).toFixed(2)));

      return {
        item,
        matchesPlayed,
        score,
      };
    });

    derived.sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if (right.matchesPlayed !== left.matchesPlayed) {
        return right.matchesPlayed - left.matchesPlayed;
      }

      if ((right.item.wins ?? 0) !== (left.item.wins ?? 0)) {
        return (right.item.wins ?? 0) - (left.item.wins ?? 0);
      }

      if (right.item.points !== left.item.points) {
        return right.item.points - left.item.points;
      }

      return left.item.rank - right.item.rank;
    });

    return derived.map(({item, score}, index) => ({
      id: `${item.id}-${system}`,
      participantId: item.playerId,
      participantName: item.playerName,
      position: index + 1,
      totalPoints: score,
      rankingSystem: system,
      tournamentsPlayed: item.tournamentsPlayed ?? 0,
      eloRating: null,
      positionChange: item.rank - (index + 1),
    }));
  }

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
   * Recalculates all global rankings based on current ELO/points data.
   * Fetches existing global rankings, re-sorts by points, and updates each
   * entry's `position` (preserving the old position as `previousPosition`).
   *
   * @returns Promise that resolves when all rankings have been updated
   */
  public async recalculateRankings(): Promise<void> {
    const allRankings = await this.globalRankingRepository.findAll();
    if (allRankings.length === 0) return;

    // Sort descending by points (then by id for stable ordering)
    const sorted = [...allRankings].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return (a.participantId ?? '').localeCompare(b.participantId ?? '');
    });

    // Update each ranking with new position and previous position
    const updates = sorted.map((ranking, index) => ({
      ...ranking,
      previousPosition: ranking.position,
      position: index + 1,
    }));

    await Promise.all(updates.map(r => this.globalRankingRepository.update(r as any)));
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
    
    const registrations = await this.registrationRepository.findByCategoryId(categoryId);
    const eligibleRegistrations = registrations.filter(
      (registration) => registration.status === RegistrationStatus.ACCEPTED
        && registration.acceptanceType !== AcceptanceType.ALTERNATE
        && registration.acceptanceType !== AcceptanceType.WITHDRAWN
    );

    if (eligibleRegistrations.length === 0) {
      return [];
    }

    const allRankings = await this.globalRankingRepository.findAll();
    const rankingsByParticipant = new Map(
      allRankings.map((ranking) => [ranking.participantId, ranking])
    );

    return [...eligibleRegistrations]
      .sort((left, right) => {
        const leftRanking = rankingsByParticipant.get(left.participantId);
        const rightRanking = rankingsByParticipant.get(right.participantId);

        if (left.ranking !== right.ranking) {
          return (left.ranking ?? Number.MAX_SAFE_INTEGER) - (right.ranking ?? Number.MAX_SAFE_INTEGER);
        }

        if (leftRanking && rightRanking && leftRanking.position !== rightRanking.position) {
          return leftRanking.position - rightRanking.position;
        }

        return left.registeredAt.getTime() - right.registeredAt.getTime();
      })
      .slice(0, count)
      .map((registration) => registration.participantId);
  }

  /**
   * Maps a GlobalRanking entity to RankingDto.
   *
   * @param ranking - GlobalRanking entity
   * @returns Ranking DTO
   */
  private mapRankingToDto(ranking: any): RankingDto {
    const previousPosition = typeof ranking.previousPosition === 'number'
      ? ranking.previousPosition
      : null;

    return {
      id: ranking.id,
      participantId: ranking.participantId,
      participantName: ranking.participantName ?? 'Unknown',
      position: ranking.position,
      totalPoints: ranking.points,
      rankingSystem: ranking.system,
      tournamentsPlayed: ranking.tournamentsPlayed ?? 0,
      eloRating: ranking.eloRating ?? null,
      positionChange: previousPosition === null ? 0 : previousPosition - ranking.position,
    };
  }
}
