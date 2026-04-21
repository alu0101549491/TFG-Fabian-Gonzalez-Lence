/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/domain/repositories/sanction-repository.interface.ts
 * @desc Repository interface for Sanction entity data access operations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Sanction} from '../entities/sanction';

/**
 * Repository interface for Sanction entity data access operations.
 * Defines the contract for persisting and retrieving sanction data.
 */
export interface ISanctionRepository {
  /**
   * Finds a sanction by its unique identifier.
   * @param id - The unique identifier
   * @returns Promise resolving to the sanction if found, null otherwise
   */
  findById(id: string): Promise<Sanction | null>;

  /**
   * Retrieves all sanctions.
   * @returns Promise resolving to an array of sanctions
   */
  findAll(): Promise<Sanction[]>;

  /**
   * Persists a new sanction.
   * @param entity - The sanction to save
   * @returns Promise resolving to the saved sanction
   */
  save(entity: Sanction): Promise<Sanction>;

  /**
   * Updates an existing sanction.
   * @param entity - The sanction with updated data
   * @returns Promise resolving to the updated sanction
   */
  update(entity: Sanction): Promise<Sanction>;

  /**
   * Deletes a sanction by its unique identifier.
   * @param id - The unique identifier of the sanction to delete
   * @returns Promise resolving when deletion is complete
   */
  delete(id: string): Promise<void>;

  /**
   * Finds all sanctions for a specific participant.
   * @param participantId - The unique identifier of the participant
   * @returns Promise resolving to an array of sanctions
   */
  findByParticipantId(participantId: string): Promise<Sanction[]>;

  /**
   * Finds all sanctions within a specific tournament.
   * @param tournamentId - The unique identifier of the tournament
   * @returns Promise resolving to an array of sanctions
   */
  findByTournamentId(tournamentId: string): Promise<Sanction[]>;

  /**
   * Finds all sanctions issued during a specific match.
   * @param matchId - The unique identifier of the match
   * @returns Promise resolving to an array of sanctions
   */
  findByMatchId(matchId: string): Promise<Sanction[]>;
}
