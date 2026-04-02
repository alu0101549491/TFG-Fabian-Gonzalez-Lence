/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file infrastructure/repositories/match.repository.ts
 * @desc HTTP-based implementation of IMatchRepository using Axios client
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable, inject} from '@angular/core';
import {Match} from '@domain/entities/match';
import {IMatchRepository} from '@domain/repositories/match.repository.interface';
import {MatchStatus} from '@domain/enumerations/match-status';
import {AxiosClient} from '../http/axios-client';

/**
 * HTTP-based implementation of IMatchRepository.
 * Communicates with the backend REST API via Axios.
 */
@Injectable({providedIn: 'root'})
export class MatchRepositoryImpl implements IMatchRepository {
  /** The HTTP client for making API requests */
  private readonly httpClient = inject(AxiosClient);

  /**
   * Serializes a date value to ISO string format.
   * Handles dates that are already ISO strings from backend responses.
   * 
   * @param date - Date object, ISO string, or null
   * @returns ISO string or null
   */
  private serializeDate(date: Date | string | null | undefined): string | null {
    if (!date) return null;
    if (typeof date === 'string') return date; // Already serialized
    return date.toISOString(); // Convert Date to string
  }

  /**
   * Maps backend match response to frontend Match entity.
   * Backend uses participant1Id/participant2Id, frontend uses player1Id/player2Id.
   * Also preserves participant objects for display purposes.
   * 
   * @param response - Raw backend match response
   * @returns Match entity instance
   */
  private mapBackendToMatch(response: any): Match {
    const match = new Match({
      id: response.id,
      bracketId: response.bracketId,
      phaseId: response.phaseId,
      courtId: response.courtId ?? null,
      player1Id: response.participant1Id,  // Backend: participant1Id → Frontend: player1Id
      player2Id: response.participant2Id,  // Backend: participant2Id → Frontend: player2Id
      winnerId: response.winnerId ?? null,
      status: response.status,
      scheduledTime: response.scheduledTime ? new Date(response.scheduledTime) : null,
      startedAt: response.startTime ? new Date(response.startTime) : null,
      completedAt: response.endTime ? new Date(response.endTime) : null,
      matchOrder: response.matchNumber ?? 0,
      createdAt: response.createdAt ? new Date(response.createdAt) : new Date(),
      updatedAt: response.updatedAt ? new Date(response.updatedAt) : new Date(),
      scores: response.scores ?? [],  // Include scores from backend
      score: response.score ?? null,  // Include score string (from dispute resolution)
      suspensionReason: response.suspensionReason ?? null,  // Include suspension reason
    });
    
    // Preserve participant objects from backend for display
    if (response.participant1) {
      (match as any).participant1 = response.participant1;
    }
    if (response.participant2) {
      (match as any).participant2 = response.participant2;
    }
    if (response.winner) {
      (match as any).winner = response.winner;
    }
    if (response.round !== undefined) {
      (match as any).round = response.round;
    }
    if (response.matchNumber !== undefined) {
      (match as any).matchNumber = response.matchNumber;
    }
    if (response.courtName !== undefined) {
      (match as any).courtName = response.courtName;
    }
    if (response.pendingResult !== undefined) {
      (match as any).pendingResult = response.pendingResult;
    }
    
    return match;
  }

  /**
   * Finds a match by its unique identifier.
   * @param id - The match identifier
   * @returns Promise resolving to the match or null if not found
   */
  public async findById(id: string): Promise<Match | null> {
    try {
      const response = await this.httpClient.get<any>(`/matches/${id}`);
      return this.mapBackendToMatch(response);
    } catch (error) {
      if ((error as {response?: {status?: number}}).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Retrieves all matches from the system.
   * @returns Promise resolving to an array of all matches
   */
  public async findAll(): Promise<Match[]> {
    const response = await this.httpClient.get<any[]>('/matches');
    return response.map(item => this.mapBackendToMatch(item));
  }

  /**
   * Persists a new match to the database.
   * @param match - The match entity to save
   * @returns Promise resolving to the saved match with assigned ID
   */
  public async save(match: Match): Promise<Match> {
    // Convert Match entity to backend API format
    const matchData: any = {
      id: match.id,
      bracketId: match.bracketId,
      phaseId: match.phaseId,
      participant1Id: match.player1Id,  // Frontend: player1Id → Backend: participant1Id
      participant2Id: match.player2Id,  // Frontend: player2Id → Backend: participant2Id
      winnerId: match.winnerId,
      status: match.status,
      scheduledTime: this.serializeDate(match.scheduledTime),
      startTime: this.serializeDate(match.startedAt),  // Frontend: startedAt → Backend: startTime
      endTime: this.serializeDate(match.completedAt),  // Frontend: completedAt → Backend: endTime
      round: 1, // Default round for new matches
      matchNumber: match.matchOrder || 1,  // Default to 1 if not specified
    };
    
    // Only include courtId if it exists
    if (match.courtId) {
      matchData.courtId = match.courtId;
    }
    
    // Include courtName if it exists (free text reference)
    const backendCourtName = (match as any).courtName;
    if (backendCourtName) {
      matchData.courtName = backendCourtName;
    }
    
    const response = await this.httpClient.post<Match>('/matches', matchData);
    return response;
  }

  /**
   * Updates an existing match in the database.
   * @param match - The match entity with updated data
   * @returns Promise resolving to the updated match
   */
  public async update(match: Match): Promise<Match> {
    // Convert Match entity to backend API format
    // Map frontend field names to backend entity field names
    
    // Preserve round and matchNumber from backend response (attached as extra properties)
    // Use || instead of ?? to ensure 0 values are replaced with defaults
    const backendRound = (match as any).round || 1;
    const backendMatchNumber = (match as any).matchNumber || match.matchOrder || 1;
    
    const matchData: any = {
      bracketId: match.bracketId,
      phaseId: match.phaseId,
      participant1Id: match.player1Id,  // Frontend: player1Id → Backend: participant1Id
      participant2Id: match.player2Id,  // Frontend: player2Id → Backend: participant2Id
      winnerId: match.winnerId,
      status: match.status,
      scheduledTime: this.serializeDate(match.scheduledTime),
      startTime: this.serializeDate(match.startedAt),  // Frontend: startedAt → Backend: startTime
      endTime: this.serializeDate(match.completedAt),  // Frontend: completedAt → Backend: endTime
      round: backendRound,  // Preserve from backend
      matchNumber: backendMatchNumber,  // Preserve from backend
    };
    
    // Only include courtId if it exists (don't send null to avoid clearing existing court)
    if (match.courtId) {
      matchData.courtId = match.courtId;
    }
    
    // Include courtName if it exists (free text reference)
    const backendCourtName = (match as any).courtName;
    if (backendCourtName) {
      matchData.courtName = backendCourtName;
    }
    
    const response = await this.httpClient.put<Match>(`/matches/${match.id}`, matchData);
    return response;
  }

  /**
   * Removes a match from the database.
   * @param id - The identifier of the match to delete
   * @returns Promise resolving when deletion is complete
   */
  public async delete(id: string): Promise<void> {
    await this.httpClient.delete(`/matches/${id}`);
  }

  /**
   * Retrieves all matches belonging to a specific bracket.
   * @param bracketId - The bracket identifier
   * @returns Promise resolving to an array of matches
   */
  public async findByBracket(bracketId: string): Promise<Match[]> {
    const response = await this.httpClient.get<any[]>(`/matches?bracketId=${bracketId}`);
    return response.map(item => this.mapBackendToMatch(item));
  }

  /**
   * Retrieves all matches in a specific phase.
   * @param phaseId - The phase identifier
   * @returns Promise resolving to an array of matches
   */
  public async findByPhaseId(phaseId: string): Promise<Match[]> {
    const response = await this.httpClient.get<any[]>(`/matches?phaseId=${phaseId}`);
    return response.map(item => this.mapBackendToMatch(item));
  }

  /**
   * Retrieves all matches involving a specific participant.
   * @param participantId - The participant's identifier
   * @returns Promise resolving to an array of matches
   */
  public async findByParticipantId(participantId: string): Promise<Match[]> {
    const response = await this.httpClient.get<any[]>(`/matches?participantId=${participantId}`);
    return response.map(item => this.mapBackendToMatch(item));
  }

  /**
   * Retrieves all matches scheduled on a specific court.
   * @param courtId - The court identifier
   * @returns Promise resolving to an array of matches
   */
  public async findByCourtId(courtId: string): Promise<Match[]> {
    const response = await this.httpClient.get<Match[]>(`/matches?courtId=${courtId}`);
    return response;
  }

  /**
   * Retrieves all matches with a specific status.
   * @param status - The match status to filter by
   * @returns Promise resolving to an array of matches
   */
  public async findByStatus(status: MatchStatus): Promise<Match[]> {
    const response = await this.httpClient.get<Match[]>(`/matches?status=${status}`);
    return response;
  }

  /**
   * Submits a match result as a participant (FR24).
   * Result will be PENDING_CONFIRMATION until opponent confirms.
   *
   * @param matchId - ID of the match
   * @param data - Result submission data
   * @returns Created match result
   */
  public async submitResult(
    matchId: string,
    data: {
      winnerId: string;
      setScores: string[];
      player1Games?: number;
      player2Games?: number;
      playerComments?: string;
    }
  ): Promise<any> {
    const response = await this.httpClient.post(`/matches/${matchId}/result`, data);
    return response;
  }

  /**
   * Confirms a pending match result (FR25).
   *
   * @param matchId - ID of the match
   * @returns Confirmed match result
   */
  public async confirmResult(matchId: string): Promise<any> {
    const response = await this.httpClient.post(`/matches/${matchId}/result/confirm`, {});
    return response;
  }

  /**
   * Disputes a pending match result (FR26).
   *
   * @param matchId - ID of the match
   * @param disputeReason - Reason for disputing the result
   * @returns Disputed match result
   */
  public async disputeResult(matchId: string, disputeReason: string): Promise<any> {
    const response = await this.httpClient.post(`/matches/${matchId}/result/dispute`, {
      disputeReason,
    });
    return response;
  }

  /**
   * Suspends an in-progress match.
   *
   * @param matchId - ID of the match to suspend
   * @param suspensionReason - Reason for suspension (weather, light, etc.)
   * @returns Suspended match
   */
  public async suspendMatch(matchId: string, suspensionReason: string): Promise<any> {
    const response = await this.httpClient.post(`/matches/${matchId}/suspend`, {
      suspensionReason,
    });
    return response;
  }

  /**
   * Resumes a previously suspended match.
   *
   * @param matchId - ID of the match to resume
   * @param scheduledTime - Optional new scheduled date/time in ISO format
   * @returns Resumed match
   */
  public async resumeMatch(matchId: string, scheduledTime?: string): Promise<any> {
    const body = scheduledTime ? {scheduledTime} : {};
    const response = await this.httpClient.post(`/matches/${matchId}/resume`, body);
    return response;
  }
}
