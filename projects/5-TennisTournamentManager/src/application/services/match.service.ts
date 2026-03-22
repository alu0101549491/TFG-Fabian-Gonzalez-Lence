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

import {Injectable, inject} from '@angular/core';
import {IMatchService} from '../interfaces/match-service.interface';
import {RecordResultDto, MatchDto, UpdateMatchStatusDto} from '../dto';
import {MatchRepositoryImpl} from '@infrastructure/repositories/match.repository';
import {ScoreRepositoryImpl} from '@infrastructure/repositories/score.repository';
import {StandingService} from './standing.service';
import {NotificationService} from './notification.service';
import {Match} from '@domain/entities/match';
import {MatchStatus} from '@domain/enumerations/match-status';

/**
 * Match service implementation.
 * Handles match queries, result recording, and status updates.
 */
@Injectable({providedIn: 'root'})
export class MatchService implements IMatchService {
  private readonly matchRepository = inject(MatchRepositoryImpl);
  private readonly scoreRepository = inject(ScoreRepositoryImpl);
  private readonly standingService = inject(StandingService);
  private readonly notificationService = inject(NotificationService);

  /**
   * Preserves backend-specific fields (round, matchNumber, courtName) from source match to target match.
   * These fields exist in backend responses but aren't part of the frontend Match type.
   *
   * @param sourceMatch - Match with backend fields (from repository)
   * @param targetMatch - New Match entity to attach fields to
   * @returns Target match with backend fields attached
   */
  private preserveBackendFields(sourceMatch: Match, targetMatch: Match): Match {
    const backendRound = (sourceMatch as any).round;
    const backendMatchNumber = (sourceMatch as any).matchNumber;
    const backendCourtName = (sourceMatch as any).courtName;
    
    if (backendRound !== undefined) {
      (targetMatch as any).round = backendRound;
    }
    if (backendMatchNumber !== undefined) {
      (targetMatch as any).matchNumber = backendMatchNumber;
    }
    if (backendCourtName !== undefined) {
      (targetMatch as any).courtName = backendCourtName;
    }
    
    return targetMatch;
  }

  /**
   * Formats scores from the match object (scores come from backend with match data).
   * 
   * @param match - Match entity with scores
   * @returns Formatted score string or empty string if no scores
   */
  private formatMatchScores(match: any): string {
    try {
      const scores = match.scores;
      
      if (!scores || scores.length === 0) {
        return '';
      }
      
      // Convert backend Score entities to SetScore format
      const setScores = scores.map((score: any) => ({
        setNumber: score.setNumber,
        participant1Games: score.player1Games,
        participant2Games: score.player2Games,
        tiebreakParticipant1: score.player1TiebreakPoints,
        tiebreakParticipant2: score.player2TiebreakPoints,
      })).sort((a: any, b: any) => a.setNumber - b.setNumber);
      
      // Format as "6-4, 3-6, 7-6(5)"
      return setScores.map((set: any) => {
        let setStr = `${set.participant1Games}-${set.participant2Games}`;
        if (set.tiebreakParticipant1 !== null && set.tiebreakParticipant1 !== undefined) {
          const tbWinner = set.participant1Games > set.participant2Games ? set.tiebreakParticipant1 : set.tiebreakParticipant2;
          setStr += `(${tbWinner})`;
        }
        return setStr;
      }).join(', ');
    } catch (error) {
      console.error('Error formatting match scores:', error);
      return '';
    }
  }

  /**
   * Retrieves a match by its ID.
   * Note: Backend includes scores in the match response via relations.
   *
   * @param matchId - ID of the match
   * @returns Match information
   */
  public async getMatchById(matchId: string): Promise<MatchDto> {
    // Validate input
    if (!matchId || matchId.trim().length === 0) {
      throw new Error('Match ID is required');
    }
    
    // Find match (backend includes scores via relations)
    const match = await this.matchRepository.findById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }
    
    // Format scores from match object (no separate API call needed)
    const score = this.formatMatchScores(match);
    
    return this.mapMatchToDto(match, score);
  }

  /**
   * Retrieves all matches from the system.
   *
   * @returns List of all matches
   */
  public async getAllMatches(): Promise<MatchDto[]> {
    const matches = await this.matchRepository.findAll();
    return matches.map(m => this.mapMatchToDto(m, ''));
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
    return matches.map(m => this.mapMatchToDto(m, ''));
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
    return matches.map(m => this.mapMatchToDto(m, ''));
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
    return matches.map(m => this.mapMatchToDto(m, ''));
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
    
    // Persist scores to backend (one score record per set)
    await this.scoreRepository.saveMatchScores(data.matchId, data.sets);
    
    // Update match with result
    const updatedMatch = this.preserveBackendFields(
      match,
      new Match({
        ...match,
        winnerId: data.winnerId,
        status: data.isRetirement ? MatchStatus.RETIRED : MatchStatus.COMPLETED,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
    );
    
    const savedMatch = await this.matchRepository.update(updatedMatch);
    
    // Update standings
    await this.standingService.updateStandings(match.bracketId, {
      matchId: data.matchId,
      winnerId: data.winnerId,
    });
    
    // Send notifications
    // await this.notificationService.sendNotification(...)
    
    // Format scores from the saved match
    const score = this.formatMatchScores(savedMatch);
    
    return this.mapMatchToDto(savedMatch, score);
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
    const updatedMatch = this.preserveBackendFields(
      match,
      new Match({
        ...match,
        status: data.status,
        startedAt: data.status === MatchStatus.IN_PROGRESS && !match.startedAt ? new Date() : match.startedAt,
        updatedAt: new Date(),
      })
    );
    
    const savedMatch = await this.matchRepository.update(updatedMatch);
    
    const score = this.formatMatchScores(savedMatch);
    return this.mapMatchToDto(savedMatch, score);
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
    
    return liveMatches.map(m => {
      const score = this.formatMatchScores(m);
      return this.mapMatchToDto(m, score);
    });
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
    const score = this.formatMatchScores(match);
    return this.mapMatchToDto(match, score);
  }

  /**
   * Schedules a match to a specific court and time.
   *
   * @param matchId - ID of the match to schedule
   * @param courtId - ID of the court (optional, can be null or text label)
   * @param courtName - Free text court name for reference (optional)
   * @param time - Scheduled time
   * @returns Updated match information
   */
  public async scheduleMatch(
    matchId: string,
    courtId: string | null,
    courtName: string | null,
    time: Date
  ): Promise<MatchDto> {
    // Validate input
    if (!matchId || matchId.trim().length === 0) {
      throw new Error('Match ID is required');
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
    const scheduledMatch = this.preserveBackendFields(
      match,
      new Match({
        ...match,
        courtId,
        scheduledTime: time,
        updatedAt: new Date(),
      })
    );
    
    // Attach courtName if provided (free text reference)
    if (courtName) {
      (scheduledMatch as any).courtName = courtName;
    }
    
    const savedMatch = await this.matchRepository.update(scheduledMatch);
    
    const score = this.formatMatchScores(savedMatch);
    return this.mapMatchToDto(savedMatch, score);
  }

  /**
   * Starts a match, transitioning from SCHEDULED to IN_PROGRESS.
   *
   * @param matchId - ID of the match to start
   * @param userId - ID of the user starting the match
   * @returns Updated match information
   * @throws Error if match cannot be started
   */
  public async startMatch(matchId: string, userId: string): Promise<MatchDto> {
    if (!matchId || matchId.trim().length === 0) {
      throw new Error('Match ID is required');
    }

    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    const match = await this.matchRepository.findById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    // Validate state transition
    match.start();

    const updatedMatch = this.preserveBackendFields(
      match,
      new Match({
        ...match,
        status: MatchStatus.IN_PROGRESS,
        startedAt: new Date(),
        updatedAt: new Date(),
      })
    );

    const savedMatch = await this.matchRepository.update(updatedMatch);
    
    return this.mapMatchToDto(savedMatch);
  }

  /**
   * Resumes a suspended match.
   *
   * @param matchId - ID of the match to resume
   * @param userId - ID of the user resuming the match
   * @returns Updated match information
   * @throws Error if match cannot be resumed
   */
  public async resumeMatch(matchId: string, userId: string): Promise<MatchDto> {
    if (!matchId || matchId.trim().length === 0) {
      throw new Error('Match ID is required');
    }

    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    const match = await this.matchRepository.findById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    // Validate state transition
    match.resume();

    const updatedMatch = this.preserveBackendFields(
      match,
      new Match({
        ...match,
        status: MatchStatus.IN_PROGRESS,
        updatedAt: new Date(),
      })
    );

    const savedMatch = await this.matchRepository.update(updatedMatch);
    
    return this.mapMatchToDto(savedMatch);
  }

  /**
   * Records a retirement during the match.
   *
   * @param matchId - ID of the match
   * @param retiringPlayerId - ID of the player retiring
   * @param reason - Reason for retirement (optional)
   * @param userId - ID of the user recording the retirement
   * @returns Updated match information
   * @throws Error if retirement cannot be recorded
   */
  public async retireMatch(
    matchId: string,
    retiringPlayerId: string,
    reason: string | undefined,
    userId: string
  ): Promise<MatchDto> {
    if (!matchId || matchId.trim().length === 0) {
      throw new Error('Match ID is required');
    }

    if (!retiringPlayerId || retiringPlayerId.trim().length === 0) {
      throw new Error('Retiring player ID is required');
    }

    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    const match = await this.matchRepository.findById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    // Validate state transition
    match.retire(retiringPlayerId, reason);

    // Determine winner (opponent of retiring player)
    const winnerId = match.player1Id === retiringPlayerId ? match.player2Id : match.player1Id;

    const updatedMatch = this.preserveBackendFields(
      match,
      new Match({
        ...match,
        status: MatchStatus.RETIRED,
        winnerId,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
    );

    const savedMatch = await this.matchRepository.update(updatedMatch);

    // Update standings
    await this.standingService.updateStandings(match.bracketId, {
      matchId,
      winnerId,
    });

    // Send notifications
    // await this.notificationService.sendNotification(...)

    return this.mapMatchToDto(savedMatch);
  }

  /**
   * Assigns a walkover to a player.
   *
   * @param matchId - ID of the match
   * @param winnerId - ID of the player receiving the walkover
   * @param userId - ID of the user assigning the walkover
   * @returns Updated match information
   * @throws Error if walkover cannot be assigned
   */
  public async assignWalkover(
    matchId: string,
    winnerId: string,
    userId: string
  ): Promise<MatchDto> {
    if (!matchId || matchId.trim().length === 0) {
      throw new Error('Match ID is required');
    }

    if (!winnerId || winnerId.trim().length === 0) {
      throw new Error('Winner ID is required');
    }

    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    const match = await this.matchRepository.findById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    // Validate state transition
    match.assignWalkover(winnerId);

    const updatedMatch = this.preserveBackendFields(
      match,
      new Match({
        ...match,
        status: MatchStatus.WALKOVER,
        winnerId,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
    );

    const savedMatch = await this.matchRepository.update(updatedMatch);

    // Update standings
    await this.standingService.updateStandings(match.bracketId, {
      matchId,
      winnerId,
    });

    // Send notifications
    // await this.notificationService.sendNotification(...)

    return this.mapMatchToDto(savedMatch);
  }

  /**
   * Abandons a match without a valid result.
   *
   * @param matchId - ID of the match
   * @param reason - Reason for abandonment
   * @param userId - ID of the user abandoning the match
   * @returns Updated match information
   * @throws Error if match cannot be abandoned
   */
  public async abandonMatch(
    matchId: string,
    reason: string,
    userId: string
  ): Promise<MatchDto> {
    if (!matchId || matchId.trim().length === 0) {
      throw new Error('Match ID is required');
    }

    if (!reason || reason.trim().length === 0) {
      throw new Error('Abandonment reason is required');
    }

    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    const match = await this.matchRepository.findById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    // Validate state transition
    match.abandon(reason);

    const updatedMatch = this.preserveBackendFields(
      match,
      new Match({
        ...match,
        status: MatchStatus.ABANDONED,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
    );

    const savedMatch = await this.matchRepository.update(updatedMatch);

    // No standings update for abandoned matches
    // Send notifications
    // await this.notificationService.sendNotification(...)

    return this.mapMatchToDto(savedMatch);
  }

  /**
   * Cancels a scheduled match.
   *
   * @param matchId - ID of the match
   * @param reason - Reason for cancellation
   * @param userId - ID of the user cancelling the match
   * @returns Updated match information
   * @throws Error if match cannot be cancelled
   */
  public async cancelMatch(
    matchId: string,
    reason: string,
    userId: string
  ): Promise<MatchDto> {
    if (!matchId || matchId.trim().length === 0) {
      throw new Error('Match ID is required');
    }

    if (!reason || reason.trim().length === 0) {
      throw new Error('Cancellation reason is required');
    }

    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    const match = await this.matchRepository.findById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    // Validate state transition
    match.cancel(reason);

    const updatedMatch = this.preserveBackendFields(
      match,
      new Match({
        ...match,
        status: MatchStatus.CANCELLED,
        updatedAt: new Date(),
      })
    );

    const savedMatch = await this.matchRepository.update(updatedMatch);

    // No standings update for cancelled matches
    // Send notifications
    // await this.notificationService.sendNotification(...)

    return this.mapMatchToDto(savedMatch);
  }

  /**
   * Applies a default (disciplinary disqualification) to a player.
   *
   * @param matchId - ID of the match
   * @param defaultedPlayerId - ID of the player receiving the default
   * @param reason - Reason for default
   * @param userId - ID of the user applying the default
   * @returns Updated match information
   * @throws Error if default cannot be applied
   */
  public async applyDefault(
    matchId: string,
    defaultedPlayerId: string,
    reason: string,
    userId: string
  ): Promise<MatchDto> {
    if (!matchId || matchId.trim().length === 0) {
      throw new Error('Match ID is required');
    }

    if (!defaultedPlayerId || defaultedPlayerId.trim().length === 0) {
      throw new Error('Defaulted player ID is required');
    }

    if (!reason || reason.trim().length === 0) {
      throw new Error('Default reason is required');
    }

    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    const match = await this.matchRepository.findById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    // Validate state transition
    match.applyDefault(defaultedPlayerId, reason);

    // Determine winner (opponent of defaulted player)
    const winnerId = match.player1Id === defaultedPlayerId ? match.player2Id : match.player1Id;

    const updatedMatch = this.preserveBackendFields(
      match,
      new Match({
        ...match,
        status: MatchStatus.DEFAULT,
        winnerId,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
    );

    const savedMatch = await this.matchRepository.update(updatedMatch);

    // Update standings
    await this.standingService.updateStandings(match.bracketId, {
      matchId,
      winnerId,
    });

    // Send notifications
    // await this.notificationService.sendNotification(...)

    return this.mapMatchToDto(savedMatch);
  }

  /**
   * Marks a match as not played.
   *
   * @param matchId - ID of the match
   * @param reason - Reason the match was not played
   * @param userId - ID of the user marking the match
   * @returns Updated match information
   * @throws Error if match cannot be marked as not played
   */
  public async markNotPlayed(
    matchId: string,
    reason: string,
    userId: string
  ): Promise<MatchDto> {
    if (!matchId || matchId.trim().length === 0) {
      throw new Error('Match ID is required');
    }

    if (!reason || reason.trim().length === 0) {
      throw new Error('Reason is required');
    }

    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    const match = await this.matchRepository.findById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    // Validate state transition
    match.markNotPlayed(reason);

    const updatedMatch = this.preserveBackendFields(
      match,
      new Match({
        ...match,
        status: MatchStatus.NOT_PLAYED,
        updatedAt: new Date(),
      })
    );

    const savedMatch = await this.matchRepository.update(updatedMatch);

    // No standings update for not played matches
    // Send notifications
    // await this.notificationService.sendNotification(...)

    return this.mapMatchToDto(savedMatch);
  }

  /**
   * Marks a completed match as a dead rubber.
   *
   * @param matchId - ID of the match
   * @param userId - ID of the user marking the match
   * @returns Updated match information
   * @throws Error if match cannot be marked as dead rubber
   */
  public async markAsDeadRubber(
    matchId: string,
    userId: string
  ): Promise<MatchDto> {
    if (!matchId || matchId.trim().length === 0) {
      throw new Error('Match ID is required');
    }

    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    const match = await this.matchRepository.findById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    // Validate state transition
    match.markAsDeadRubber();

    const updatedMatch = this.preserveBackendFields(
      match,
      new Match({
        ...match,
        status: MatchStatus.DEAD_RUBBER,
        updatedAt: new Date(),
      })
    );

    const savedMatch = await this.matchRepository.update(updatedMatch);

    // Standings remain as they were when match was completed
    // Send notifications
    // await this.notificationService.sendNotification(...)

    const score = this.formatMatchScores(savedMatch);
    return this.mapMatchToDto(savedMatch, score);
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
      courtName: (match as any).courtName ?? null,  // From backend response (free text reference)
      round: (match as any).round ?? 1,  // From backend response
      matchNumber: (match as any).matchNumber ?? match.matchOrder ?? 0,  // Backend uses matchNumber
      participant1Id: match.player1Id,  // Domain: player1Id → DTO: participant1Id
      participant2Id: match.player2Id,  // Domain: player2Id → DTO: participant2Id
      winnerId: match.winnerId,
      status: match.status,
      scheduledTime: match.scheduledTime,
      startTime: match.startedAt,  // Domain: startedAt → DTO: startTime
      endTime: match.completedAt,  // Domain: completedAt → DTO: endTime
      score,
      // Map participant User objects from backend relations
      participant1: (match as any).participant1 ? {
        id: (match as any).participant1.id,
        firstName: (match as any).participant1.firstName,
        lastName: (match as any).participant1.lastName,
        email: (match as any).participant1.email,
      } : null,
      participant2: (match as any).participant2 ? {
        id: (match as any).participant2.id,
        firstName: (match as any).participant2.firstName,
        lastName: (match as any).participant2.lastName,
        email: (match as any).participant2.email,
      } : null,
      winner: (match as any).winner ? {
        id: (match as any).winner.id,
        firstName: (match as any).winner.firstName,
        lastName: (match as any).winner.lastName,
        email: (match as any).winner.email,
      } : null,
    };
  }
}
