/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file infrastructure/repositories/tournament.repository.ts
 * @desc HTTP-based implementation of ITournamentRepository using Axios client
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable, inject} from '@angular/core';
import {Tournament} from '@domain/entities/tournament';
import {ITournamentRepository} from '@domain/repositories/tournament.repository.interface';
import {TournamentStatus} from '@domain/enumerations/tournament-status';
import {AxiosClient} from '../http/axios-client';

/**
 * HTTP-based implementation of ITournamentRepository.
 * Communicates with the backend REST API via Axios.
 */
@Injectable({providedIn: 'root'})
export class TournamentRepositoryImpl implements ITournamentRepository {
  /** The HTTP client for making API requests */
  private readonly httpClient = inject(AxiosClient);

  /**
   * Finds a tournament by its unique identifier.
   * @param id - The tournament identifier
   * @returns Promise resolving to the tournament or null if not found
   */
  public async findById(id: string): Promise<Tournament | null> {
    try {
      const response = await this.httpClient.get<Tournament>(`/tournaments/${id}`);
      return response;
    } catch (error) {
      if ((error as {response?: {status?: number}}).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Retrieves all tournaments from the system.
   * @returns Promise resolving to an array of all tournaments
   */
  public async findAll(): Promise<Tournament[]> {
    const response = await this.httpClient.get<Tournament[]>('/tournaments');
    return response;
  }

  /**
   * Persists a new tournament to the database.
   * @param tournament - The tournament entity to save
   * @returns Promise resolving to the saved tournament with assigned ID
   */
  public async save(tournament: Tournament): Promise<Tournament> {
    const response = await this.httpClient.post<Tournament>('/tournaments', tournament);
    return response;
  }

  /**
   * Updates an existing tournament in the database.
   * @param tournament - The tournament entity with updated data
   * @returns Promise resolving to the updated tournament
   */
  public async update(tournament: Tournament): Promise<Tournament> {
    const response = await this.httpClient.put<Tournament>(`/tournaments/${tournament.id}`, tournament);
    return response;
  }

  /**
   * Removes a tournament from the database.
   * @param id - The identifier of the tournament to delete
   * @returns Promise resolving when deletion is complete
   */
  public async delete(id: string): Promise<void> {
    await this.httpClient.delete(`/tournaments/${id}`);
  }

  /**
   * Retrieves all tournaments organized by a specific user.
   * @param organizerId - The organizer's user identifier
   * @returns Promise resolving to an array of tournaments
   */
  public async findByOrganizerId(organizerId: string): Promise<Tournament[]> {
    const response = await this.httpClient.get<Tournament[]>(`/tournaments?organizerId=${organizerId}`);
    return response;
  }

  /**
   * Retrieves all tournaments with a specific status.
   * @param status - The tournament status to filter by
   * @returns Promise resolving to an array of tournaments
   */
  public async findByStatus(status: TournamentStatus): Promise<Tournament[]> {
    const response = await this.httpClient.get<Tournament[]>(`/tournaments?status=${status}`);
    return response;
  }

  /**
   * Retrieves all active tournaments.
   * @returns Promise resolving to an array of active tournaments
   */
  public async findActive(): Promise<Tournament[]> {
    const response = await this.httpClient.get<Tournament[]>('/tournaments/active');
    return response;
  }
}
