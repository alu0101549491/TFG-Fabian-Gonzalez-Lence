/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file infrastructure/repositories/registration.repository.ts
 * @desc HTTP-based implementation of IRegistrationRepository using Axios client
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Registration} from '@domain/entities/registration';
import {IRegistrationRepository} from '@domain/repositories/registration.repository.interface';
import {RegistrationStatus} from '@domain/enumerations/registration-status';
import {AxiosClient} from '../http/axios-client';

/**
 * HTTP-based implementation of IRegistrationRepository.
 * Communicates with the backend REST API via Axios.
 */
export class RegistrationRepositoryImpl implements IRegistrationRepository {
  /**
   * Creates an instance of RegistrationRepositoryImpl.
   * @param httpClient - The HTTP client for making API requests
   */
  constructor(private readonly httpClient: AxiosClient) {}

  /**
   * Finds a registration by its unique identifier.
   * @param id - The registration identifier
   * @returns Promise resolving to the registration or null if not found
   */
  public async findById(id: string): Promise<Registration | null> {
    throw new Error('Not implemented');
  }

  /**
   * Retrieves all registrations from the system.
   * @returns Promise resolving to an array of all registrations
   */
  public async findAll(): Promise<Registration[]> {
    throw new Error('Not implemented');
  }

  /**
   * Persists a new registration to the database.
   * @param registration - The registration entity to save
   * @returns Promise resolving to the saved registration with assigned ID
   */
  public async save(registration: Registration): Promise<Registration> {
    throw new Error('Not implemented');
  }

  /**
   * Updates an existing registration in the database.
   * @param registration - The registration entity with updated data
   * @returns Promise resolving to the updated registration
   */
  public async update(registration: Registration): Promise<Registration> {
    throw new Error('Not implemented');
  }

  /**
   * Removes a registration from the database.
   * @param id - The identifier of the registration to delete
   * @returns Promise resolving when deletion is complete
   */
  public async delete(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  /**
   * Retrieves all registrations for a specific participant.
   * @param participantId - The participant's identifier
   * @returns Promise resolving to an array of registrations
   */
  public async findByParticipantId(participantId: string): Promise<Registration[]> {
    throw new Error('Not implemented');
  }

  /**
   * Retrieves all registrations for a specific tournament.
   * @param tournamentId - The tournament identifier
   * @returns Promise resolving to an array of registrations
   */
  public async findByTournamentId(tournamentId: string): Promise<Registration[]> {
    throw new Error('Not implemented');
  }

  /**
   * Retrieves all registrations for a specific category.
   * @param categoryId - The category identifier
   * @returns Promise resolving to an array of registrations
   */
  public async findByCategoryId(categoryId: string): Promise<Registration[]> {
    throw new Error('Not implemented');
  }

  /**
   * Retrieves all registrations with a specific status.
   * @param status - The registration status to filter by
   * @returns Promise resolving to an array of registrations
   */
  public async findByStatus(status: RegistrationStatus): Promise<Registration[]> {
    throw new Error('Not implemented');
  }
}
