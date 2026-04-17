/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/domain/repositories/match-repository.interface.ts
 * @desc Repository interface for Match entity data access operations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Match} from '../entities/match';
import {MatchStatus} from '../enumerations/match-status';

/**
 * Repository interface for Match entity data access operations.
 * Defines the contract for persisting and retrieving match data.
 */
export interface IMatchRepository {
  /**
   * Finds a match by its unique identifier.
   * @param id - The unique identifier
   * @returns Promise resolving to the match if found, null otherwise
   */
  findById(id: string): Promise<Match | null>;

  /**
   * Retrieves all matches.
   * @returns Promise resolving to an array of matches
   */
  findAll(): Promise<Match[]>;

  /**
   * Persists a new match.
   * @param entity - The match to save
   * @returns Promise resolving to the saved match
   */
  save(entity: Match): Promise<Match>;

  /**
   * Updates an existing match.
   * @param entity - The match with updated data
   * @returns Promise resolving to the updated match
   */
  update(entity: Match): Promise<Match>;

  /**
   * Deletes a match by its unique identifier.
   * @param id - The unique identifier of the match to delete
   * @returns Promise resolving when deletion is complete
   */
  delete(id: string): Promise<void>;

  /**
   * Finds all matches belonging to a specific bracket.
   * @param bracketId - The unique identifier of the bracket
   * @returns Promise resolving to an array of matches
   */
  findByBracket(bracketId: string): Promise<Match[]>;

  /**
   * Finds all matches belonging to a specific phase.
   * @param phaseId - The unique identifier of the phase
   * @returns Promise resolving to an array of matches
   */
  findByPhaseId(phaseId: string): Promise<Match[]>;

  /**
   * Finds all matches involving a specific participant.
   * @param participantId - The unique identifier of the participant
   * @returns Promise resolving to an array of matches
   */
  findByParticipantId(participantId: string): Promise<Match[]>;

  /**
   * Finds all matches scheduled on a specific court.
   * @param courtId - The unique identifier of the court
   * @returns Promise resolving to an array of matches
   */
  findByCourtId(courtId: string): Promise<Match[]>;

  /**
   * Finds all matches with a specific status.
   * @param status - The match status to filter by
   * @returns Promise resolving to an array of matches with the specified status
   */
  findByStatus(status: MatchStatus): Promise<Match[]>;
}
