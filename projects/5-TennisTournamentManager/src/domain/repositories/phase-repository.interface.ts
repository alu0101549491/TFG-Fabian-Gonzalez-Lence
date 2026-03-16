/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/repositories/phase-repository.interface.ts
 * @desc Repository interface for Phase entity data access operations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Phase} from '../entities/phase.entity';

/**
 * Repository interface for Phase entity data access operations.
 * Defines the contract for persisting and retrieving phase data.
 */
export interface IPhaseRepository {
  /**
   * Finds a phase by its unique identifier.
   * @param id - The unique identifier
   * @returns Promise resolving to the phase if found, null otherwise
   */
  findById(id: string): Promise<Phase | null>;

  /**
   * Retrieves all phases.
   * @returns Promise resolving to an array of phases
   */
  findAll(): Promise<Phase[]>;

  /**
   * Persists a new phase.
   * @param entity - The phase to save
   * @returns Promise resolving to the saved phase
   */
  save(entity: Phase): Promise<Phase>;

  /**
   * Updates an existing phase.
   * @param entity - The phase with updated data
   * @returns Promise resolving to the updated phase
   */
  update(entity: Phase): Promise<Phase>;

  /**
   * Deletes a phase by its unique identifier.
   * @param id - The unique identifier of the phase to delete
   * @returns Promise resolving when deletion is complete
   */
  delete(id: string): Promise<void>;

  /**
   * Finds all phases belonging to a specific bracket.
   * @param bracketId - The unique identifier of the bracket
   * @returns Promise resolving to an array of phases
   */
  findByBracketId(bracketId: string): Promise<Phase[]>;
}
