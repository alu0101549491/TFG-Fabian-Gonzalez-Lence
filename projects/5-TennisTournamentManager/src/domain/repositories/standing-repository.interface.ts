/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/repositories/standing-repository.interface.ts
 * @desc Repository interface for Standing entity data access operations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Standing} from '../entities/standing';

/**
 * Repository interface for Standing entity data access operations.
 * Defines the contract for persisting and retrieving standing data.
 */
export interface IStandingRepository {
  /**
   * Finds a standing by its unique identifier.
   * @param id - The unique identifier
   * @returns Promise resolving to the standing if found, null otherwise
   */
  findById(id: string): Promise<Standing | null>;

  /**
   * Retrieves all standings.
   * @returns Promise resolving to an array of standings
   */
  findAll(): Promise<Standing[]>;

  /**
   * Persists a new standing.
   * @param entity - The standing to save
   * @returns Promise resolving to the saved standing
   */
  save(entity: Standing): Promise<Standing>;

  /**
   * Updates an existing standing.
   * @param entity - The standing with updated data
   * @returns Promise resolving to the updated standing
   */
  update(entity: Standing): Promise<Standing>;

  /**
   * Deletes a standing by its unique identifier.
   * @param id - The unique identifier of the standing to delete
   * @returns Promise resolving when deletion is complete
   */
  delete(id: string): Promise<void>;

  /**
   * Finds all standings for a specific bracket.
   * @param bracketId - The unique identifier of the bracket
   * @returns Promise resolving to an array of standings
   */
  findByBracket(bracketId: string): Promise<Standing[]>;

  /**
   * Finds all standings for a specific participant.
   * @param participantId - The unique identifier of the participant
   * @returns Promise resolving to an array of standings
   */
  findByParticipantId(participantId: string): Promise<Standing[]>;
}
