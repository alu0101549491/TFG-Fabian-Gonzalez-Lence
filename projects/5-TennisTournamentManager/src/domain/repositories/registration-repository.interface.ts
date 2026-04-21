/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/domain/repositories/registration-repository.interface.ts
 * @desc Repository interface for Registration entity data access operations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Registration} from '../entities/registration';
import {RegistrationStatus} from '../enumerations/registration-status';
import {AcceptanceType} from '../enumerations/acceptance-type';

/**
 * Repository interface for Registration entity data access operations.
 * Defines the contract for persisting and retrieving registration data.
 */
export interface IRegistrationRepository {
  /**
   * Finds a registration by its unique identifier.
   * @param id - The unique identifier
   * @returns Promise resolving to the registration if found, null otherwise
   */
  findById(id: string): Promise<Registration | null>;

  /**
   * Retrieves all registrations.
   * @returns Promise resolving to an array of registrations
   */
  findAll(): Promise<Registration[]>;

  /**
   * Persists a new registration.
   * @param entity - The registration to save
   * @returns Promise resolving to the saved registration
   */
  save(entity: Registration): Promise<Registration>;

  /**
   * Updates an existing registration.
   * @param entity - The registration with updated data
   * @returns Promise resolving to the updated registration
   */
  update(entity: Registration): Promise<Registration>;

  /**
   * Deletes a registration by its unique identifier.
   * @param id - The unique identifier of the registration to delete
   * @returns Promise resolving when deletion is complete
   */
  delete(id: string): Promise<void>;

  /**
   * Finds all registrations for a specific participant.
   * @param participantId - The unique identifier of the participant
   * @returns Promise resolving to an array of registrations
   */
  findByParticipantId(participantId: string): Promise<Registration[]>;

  /**
   * Finds all registrations for a specific tournament.
   * @param tournamentId - The unique identifier of the tournament
   * @returns Promise resolving to an array of registrations
   */
  findByTournament(tournamentId: string): Promise<Registration[]>;

  /**
   * Finds all registrations for a specific category.
   * @param categoryId - The unique identifier of the category
   * @returns Promise resolving to an array of registrations
   */
  findByCategoryId(categoryId: string): Promise<Registration[]>;

  /**
   * Finds all registrations for a tournament with a specific status.
   * @param tournamentId - The unique identifier of the tournament
   * @param status - The registration status to filter by
   * @returns Promise resolving to an array of registrations with the specified status
   */
  findByStatus(tournamentId: string, status: RegistrationStatus): Promise<Registration[]>;

  /**
   * Updates the status of a registration.
   * @param id - The unique identifier of the registration
   * @param status - The new registration status
   * @param acceptanceType - Optional acceptance type (for admin setting as alternate)
   * @returns Promise resolving to the updated registration
   */
  updateStatus(id: string, status: RegistrationStatus, acceptanceType?: AcceptanceType): Promise<Registration>;
}
