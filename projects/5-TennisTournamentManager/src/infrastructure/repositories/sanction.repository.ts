/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/infrastructure/repositories/sanction.repository.ts
 * @desc HTTP-based implementation of ISanctionRepository using Axios client
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Injectable, inject} from '@angular/core';
import {Sanction} from '@domain/entities/sanction';
import {ISanctionRepository} from '@domain/repositories/sanction.repository.interface';
import {AxiosClient} from '../http/axios-client';

/**
 * HTTP-based implementation of ISanctionRepository.
 * Communicates with the backend REST API via Axios.
 */
@Injectable({providedIn: 'root'})
export class SanctionRepositoryImpl implements ISanctionRepository {
  /** The HTTP client for making API requests */
  private readonly httpClient = inject(AxiosClient);

  /**
   * Finds a sanction by its unique identifier.
   * @param id - The sanction identifier
   * @returns Promise resolving to the sanction or null if not found
   */
  public async findById(id: string): Promise<Sanction | null> {
    try {
      const response = await this.httpClient.get<Sanction>(`/sanctions/${id}`);
      return response;
    } catch (error) {
      if ((error as {response?: {status?: number}}).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Retrieves all sanctions from the system.
   * @returns Promise resolving to an array of all sanctions
   */
  public async findAll(): Promise<Sanction[]> {
    const response = await this.httpClient.get<Sanction[]>('/sanctions');
    return response;
  }

  /**
   * Persists a new sanction to the database.
   * @param sanction - The sanction entity to save
   * @returns Promise resolving to the saved sanction with assigned ID
   */
  public async save(sanction: Sanction): Promise<Sanction> {
    const response = await this.httpClient.post<Sanction>('/sanctions', sanction);
    return response;
  }

  /**
   * Updates an existing sanction in the database.
   * @param sanction - The sanction entity with updated data
   * @returns Promise resolving to the updated sanction
   */
  public async update(sanction: Sanction): Promise<Sanction> {
    const response = await this.httpClient.put<Sanction>(`/sanctions/${sanction.id}`, sanction);
    return response;
  }

  /**
   * Removes a sanction from the database.
   * @param id - The identifier of the sanction to delete
   * @returns Promise resolving when deletion is complete
   */
  public async delete(id: string): Promise<void> {
    await this.httpClient.delete(`/sanctions/${id}`);
  }

  /**
   * Retrieves all sanctions for a specific participant.
   * @param participantId - The participant's identifier
   * @returns Promise resolving to an array of sanctions
   */
  public async findByParticipantId(participantId: string): Promise<Sanction[]> {
    const response = await this.httpClient.get<Sanction[]>(`/sanctions?participantId=${participantId}`);
    return response;
  }

  /**
   * Retrieves all sanctions for a specific tournament.
   * @param tournamentId - The tournament identifier
   * @returns Promise resolving to an array of sanctions
   */
  public async findByTournamentId(tournamentId: string): Promise<Sanction[]> {
    const response = await this.httpClient.get<Sanction[]>(`/sanctions?tournamentId=${tournamentId}`);
    return response;
  }

  /**
   * Retrieves all sanctions issued during a specific match.
   * @param matchId - The match identifier
   * @returns Promise resolving to an array of sanctions
   */
  public async findByMatchId(matchId: string): Promise<Sanction[]> {
    const response = await this.httpClient.get<Sanction[]>(`/sanctions?matchId=${matchId}`);
    return response;
  }
}
