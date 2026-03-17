/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/services/match.service.ts
 * @desc Match service implementation for match management and result recording
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable} from '@angular/core';
import {IMatchService} from '../interfaces/match-service.interface';
import {RecordResultDto, MatchDto, UpdateMatchStatusDto} from '../dto';
import {MatchRepositoryImpl} from '@infrastructure/repositories/match.repository';
import {ScoreRepositoryImpl} from '@infrastructure/repositories/score.repository';
import {IStandingService} from '../interfaces/standing-service.interface';
import {INotificationService} from '../interfaces/notification-service.interface';
import {Match} from '@domain/entities/match';
import {Score} from '@domain/entities/score';
import {MatchStatus} from '@domain/enumerations/match-status';
import {generateId} from '@shared/utils';

/**
 * Match service implementation.
 * Handles match queries, result recording, and status updates.
 */
@Injectable({providedIn: 'root'})
export class MatchService implements IMatchService {
  /**
   * Creates a new MatchService instance.
   *
   * @param matchRepository - Match repository for data access
   * @param scoreRepository - Score repository for score data access
   * @param standingService - Standing service for updating standings
   * @param notificationService - Notification service for match notifications
   */
  public constructor(
    private readonly matchRepository: MatchRepositoryImpl,
    private readonly scoreRepository: ScoreRepositoryImpl,
    private readonly standingService: IStandingService,
    private readonly notificationService: INotificationService,
  ) {}

  /**
   * Retrieves a match by its ID.
   *
   * @param matchId - ID of the match
   * @returns Match information
   */
  public async getMatchById(matchId: string): Promise<MatchDto> {
    // Validate input
    if (!matchId || matchId.trim().length === 0) {
      throw new Error('Match ID is required');
    }
    
    // Find match
    const match = await this.matchRepository.findById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }
    
    // Get score if match is completed
    let scoreString = '';
    if (match.status === MatchStatus.COMPLETED) {
      const score = await this.scoreRepository.findByMatchId(matchId);
      if (score) {
        scoreString = score.getFormattedScore();
      }
    }
    
    // Map to DTO
    return this.mapMatchToDto(match, scoreString);
  }

  /**
   * Retrieves all matches for a bracket.
   *
   * @param bracketId - ID of the bracket
   * @returns List of matches
   */
  public async getMatchesByBracket(bracketId: string): Promise<MatchDto[]> {
    // Validate input
    if (!bracketId || bracketId.trim().length === 0) {
      throw new Error('Bracket ID is required');
    }
    
    const matches = await this.matchRepository.findByBracket(bracketId);
    return Promise.all(matches.map(async m => {
      const score = await this.scoreRepository.findByMatchId(m.id);
      const scoreString = score ? score.getFormattedScore() : '';
      return this.mapMatchToDto(m, scoreString);
    }));
  }

  /**
   * Retrieves all matches for a phase.
   *
   * @param phaseId - ID of the phase
   * @returns List of matches
   */
  public async getMatchesByPhase(phaseId: string): Promise<MatchDto[]> {
    // Validate input
    if (!phaseId || phaseId.trim().length === 0) {
      throw new Error('Phase ID is required');
    }
    
    const matches = await this.matchRepository.findByPhaseId(phaseId);
    return Promise.all(matches.map(async m => {
      const score = await this.scoreRepository.findByMatchId(m.id);
      const scoreString = score ? score.getFormattedScore() : '';
      return this.mapMatchToDto(m, scoreString);
    }));
  }

  /**
   * Retrieves all matches for a participant.
   *
   * @param participantId - ID of the participant
   * @returns List of matches
   */
  public async getMatchesByParticipant(participantId: string): Promise<MatchDto[]> {
    // Validate input
    if (!participantId || participantId.trim().length === 0) {
      throw new Error('Participant ID is required');
    }
    
    const matches = await this.matchRepository.findByParticipantId(participantId);
    return Promise.all(matches.map(async m => {
      const score = await this.scoreRepository.findByMatchId(m.id);
      const scoreString = score ? score.getFormattedScore() : '';
      return this.mapMatchToDto(m, scoreString);
    }));
  }

  /**
   * Records the result of a match.
   *
   * @param data - Match result data
   * @param userId - ID of the user recording the result
   * @returns Updated match information
   */
  public async recordResult(data: RecordResultDto, userId: string): Promise<MatchDto> {
    // Validate input
    if (!data.matchId || data.matchId.trim().length === 0) {
      throw new Error('Match ID is required');
    }
    
    if (!data.winnerId || data.winnerId.trim().length === 0) {
      throw new Error('Winner ID is required');
    }
    
    if (!data.sets || data.sets.length === 0) {
      throw new Error('Match sets are required');
    }
    
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
    
    // Check if match exists
    const match = await this.matchRepository.findById(data.matchId);
    if (!match) {
      throw new Error('Match not found');
    }
    
    // Validate winner is one of the participants
    if (data.winnerId !== match.player1Id && data.winnerId !== match.player2Id) {
      throw new Error('Winner must be one of the match participants');
    }
    
    // Validate business rule
    match.recordResult({winnerId: data.winnerId});
    
    // Create score entity
    const score = new Score({
      id: generateId(),
      matchId: data.matchId,
      sets: data.sets,
      isRetirement: data.isRetirement ?? false,
      retiredParticipantId: data.retiredParticipantId ?? null,
    });
    
    await this.scoreRepository.save(score);
    
    // Update match with result
    const updatedMatch = new Match({
      ...match,
      winnerId: data.winnerId,
      status: data.isRetirement ? MatchStatus.RETIRED : MatchStatus.COMPLETED,
      completedAt: new Date(),
      updatedAt: new Date(),
    });
    
    const savedMatch = await this.matchRepository.update(updatedMatch);
    
    // Update standings
    await this.standingService.updateStandings(match.bracketId, {
      matchId: data.matchId,
      winnerId: data.winnerId,
    });
    
    // Send notifications
    // await this.notificationService.sendNotification(...)
    
    // Map to DTO
    return this.mapMatchToDto(savedMatch, score.getFormattedScore());
  }

  /**
   * Updates the status of a match.
   *
   * @param data - Match status update data
   * @param userId - ID of the user performing the update
   * @returns Updated match information
   */
  public async updateStatus(data: UpdateMatchStatusDto, userId: string): Promise<MatchDto> {
    // Validate input
    if (!data.matchId || data.matchId.trim().length === 0) {
      throw new Error('Match ID is required');
    }
    
    if (!data.status) {
      throw new Error('Status is required');
    }
    
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
    
    // Check if match exists
    const match = await this.matchRepository.findById(data.matchId);
    if (!match) {
      throw new Error('Match not found');
    }
    
    // Update match status
    const updatedMatch = new Match({
      ...match,
      status: data.status,
      startedAt: data.status === MatchStatus.IN_PROGRESS && !match.startedAt ? new Date() : match.startedAt,
      updatedAt: new Date(),
    });
    
    const savedMatch = await this.matchRepository.update(updatedMatch);
    
    // Get score if available
    const score = await this.scoreRepository.findByMatchId(data.matchId);
    const scoreString = score ? score.getFormattedScore() : '';
    
    // Map to DTO
    return this.mapMatchToDto(savedMatch, scoreString);
  }

  /**
   * Retrieves all live (in-progress) matches for a tournament.
   *
   * @param tournamentId - ID of the tournament
   * @returns List of live matches
   */
  public async getLiveMatches(tournamentId: string): Promise<MatchDto[]> {
    // Validate input
    if (!tournamentId || tournamentId.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }
    
    // In real implementation, filter by tournamentId at repository level
    const allMatches = await this.matchRepository.findAll();
    const liveMatches = allMatches.filter(m => m.status === MatchStatus.IN_PROGRESS);
    
    return Promise.all(liveMatches.map(async m => {
      const score = await this.scoreRepository.findByMatchId(m.id);
      const scoreString = score ? score.getFormattedScore() : '';
      return this.mapMatchToDto(m, scoreString);
    }));
  }

  /**
   * Confirms the result of a match.
   *
   * @param matchId - ID of the match
   * @param userId - ID of the user confirming the result
   * @returns Updated match information
   */
  public async confirmResult(matchId: string, userId: string): Promise<MatchDto> {
    // Validate input
    if (!matchId || matchId.trim().length === 0) {
      throw new Error('Match ID is required');
    }
    
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
    
    // Check if match exists
    const match = await this.matchRepository.findById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }
    
    if (match.status !== MatchStatus.COMPLETED) {
      throw new Error('Can only confirm completed matches');
    }
    
    // In real implementation, might update a confirmation flag
    // For now, just return the match
    const score = await this.scoreRepository.findByMatchId(matchId);
    const scoreString = score ? score.getFormattedScore() : '';
    
    return this.mapMatchToDto(match, scoreString);
  }

  /**
   * Schedules a match to a specific court and time.
   *
   * @param matchId - ID of the match to schedule
   * @param courtId - ID of the court
   * @param time - Scheduled time
   * @returns Updated match information
   */
  public async scheduleMatch(matchId: string, courtId: string, time: Date): Promise<MatchDto> {
    // Validate input
    if (!matchId || matchId.trim().length === 0) {
      throw new Error('Match ID is required');
    }
    
    if (!courtId || courtId.trim().length === 0) {
      throw new Error('Court ID is required');
    }
    
    if (!time) {
      throw new Error('Scheduled time is required');
    }
    
    // Check if match exists
    const match = await this.matchRepository.findById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }
    
    // Update match with schedule
    const scheduledMatch = new Match({
      ...match,
      courtId,
      scheduledTime: time,
      updatedAt: new Date(),
    });
    
    const savedMatch = await this.matchRepository.update(scheduledMatch);
    
    // Get score if available
    const score = await this.scoreRepository.findByMatchId(matchId);
    const scoreString = score ? score.getFormattedScore() : '';
    
    // Map to DTO
    return this.mapMatchToDto(savedMatch, scoreString);
  }

  /**
   * Maps a Match entity to MatchDto.
   *
   * @param match - Match entity
   * @param score - Formatted score string
   * @returns Match DTO
   */
  private mapMatchToDto(match: Match, score = ''): MatchDto {
    return {
      id: match.id,
      bracketId: match.bracketId,
      phaseId: match.phaseId,
      courtId: match.courtId,
      participant1Id: match.player1Id,
      participant2Id: match.player2Id,
      winnerId: match.winnerId,
      status: match.status,
      scheduledAt: match.scheduledTime,
      score,
    };
  }
}
