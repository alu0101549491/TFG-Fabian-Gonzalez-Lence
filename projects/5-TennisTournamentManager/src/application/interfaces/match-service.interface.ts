/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/interfaces/match-service.interface.ts
 * @desc Match service interface for match management and result recording
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {RecordResultDto, MatchDto, UpdateMatchStatusDto} from '../dto';

/**
 * Match service interface.
 * Handles match queries, result recording, and status updates.
 */
export interface IMatchService {
  /**
   * Retrieves a match by its ID.
   *
   * @param matchId - ID of the match
   * @returns Match information
   */
  getMatchById(matchId: string): Promise<MatchDto>;

  /**
   * Retrieves all matches for a bracket.
   *
   * @param bracketId - ID of the bracket
   * @returns List of matches
   */
  getMatchesByBracket(bracketId: string): Promise<MatchDto[]>;

  /**
   * Retrieves all matches for a phase.
   *
   * @param phaseId - ID of the phase
   * @returns List of matches
   */
  getMatchesByPhase(phaseId: string): Promise<MatchDto[]>;

  /**
   * Retrieves all matches for a participant.
   *
   * @param participantId - ID of the participant
   * @returns List of matches
   */
  getMatchesByParticipant(participantId: string): Promise<MatchDto[]>;

  /**
   * Records the result of a match.
   *
   * @param data - Match result data
   * @param userId - ID of the user recording the result
   * @returns Updated match information
   */
  recordResult(data: RecordResultDto, userId: string): Promise<MatchDto>;

  /**
   * Updates the status of a match.
   *
   * @param data - Match status update data
   * @param userId - ID of the user performing the update
   * @returns Updated match information
   */
  updateStatus(data: UpdateMatchStatusDto, userId: string): Promise<MatchDto>;

  /**
   * Retrieves all live (in-progress) matches for a tournament.
   *
   * @param tournamentId - ID of the tournament
   * @returns List of live matches
   */
  getLiveMatches(tournamentId: string): Promise<MatchDto[]>;

  /**
   * Confirms the result of a match.
   *
   * @param matchId - ID of the match
   * @param userId - ID of the user confirming the result
   * @returns Updated match information
   */
  confirmResult(matchId: string, userId: string): Promise<MatchDto>;

  /**
   * Schedules a match at a specific court and time.
   *
   * @param matchId - ID of the match to schedule
   * @param courtId - ID of the court
   * @param time - Scheduled time for the match
   * @returns Updated match information
   */
  scheduleMatch(matchId: string, courtId: string, time: Date): Promise<MatchDto>;
}
