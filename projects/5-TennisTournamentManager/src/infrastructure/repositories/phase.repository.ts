/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file infrastructure/repositories/phase.repository.ts
 * @desc HTTP-based implementation of IPhaseRepository using Axios client
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Phase} from '@domain/entities/phase';
import {IPhaseRepository} from '@domain/repositories/phase.repository.interface';
import {AxiosClient} from '../http/axios-client';

/**
 * HTTP-based implementation of IPhaseRepository.
 * Communicates with the backend REST API via Axios.
 */
export class PhaseRepositoryImpl implements IPhaseRepository {
  /**
   * Creates an instance of PhaseRepositoryImpl.
   * @param httpClient - The HTTP client for making API requests
   */
  constructor(private readonly httpClient: AxiosClient) {}

  /**
   * Finds a phase by its unique identifier.
   * @param id - The phase identifier
   * @returns Promise resolving to the phase or null if not found
   */
  public async findById(id: string): Promise<Phase | null> {
    try {
      const response = await this.httpClient.get<Phase>(`/phases/${id}`);
      return response;
    } catch (error) {
      if ((error as {response?: {status?: number}}).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Retrieves all phases from the system.
   * @returns Promise resolving to an array of all phases
   */
  public async findAll(): Promise<Phase[]> {
    const response = await this.httpClient.get<Phase[]>('/phases');
    return response;
  }

  /**
   * Persists a new phase to the database.
   * @param phase - The phase entity to save
   * @returns Promise resolving to the saved phase with assigned ID
   */
  public async save(phase: Phase): Promise<Phase> {
    const response = await this.httpClient.post<Phase>('/phases', phase);
    return response;
  }

  /**
   * Updates an existing phase in the database.
   * @param phase - The phase entity with updated data
   * @returns Promise resolving to the updated phase
   */
  public async update(phase: Phase): Promise<Phase> {
    const response = await this.httpClient.put<Phase>(`/phases/${phase.id}`, phase);
    return response;
  }

  /**
   * Removes a phase from the database.
   * @param id - The identifier of the phase to delete
   * @returns Promise resolving when deletion is complete
   */
  public async delete(id: string): Promise<void> {
    await this.httpClient.delete(`/phases/${id}`);
  }

  /**
   * Retrieves all phases belonging to a specific tournament.
   * @param tournamentId - The tournament identifier
   * @returns Promise resolving to an array of phases
   */
  public async findByTournament(tournamentId: string): Promise<Phase[]> {
    const response = await this.httpClient.get<Phase[]>(`/phases?tournamentId=${tournamentId}`);
    return response;
  }
}
