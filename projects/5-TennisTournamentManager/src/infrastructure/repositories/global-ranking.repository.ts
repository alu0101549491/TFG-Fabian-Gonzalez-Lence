/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file infrastructure/repositories/global-ranking.repository.ts
 * @desc HTTP-based implementation of IGlobalRankingRepository using Axios client
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable} from '@angular/core';
import {GlobalRanking} from '@domain/entities/global-ranking';
import {IGlobalRankingRepository} from '@domain/repositories/global-ranking.repository.interface';
import {AxiosClient} from '../http/axios-client';

/**
 * HTTP-based implementation of IGlobalRankingRepository.
 * Communicates with the backend REST API via Axios.
 */
@Injectable({providedIn: 'root'})
export class GlobalRankingRepositoryImpl implements IGlobalRankingRepository {
  /**
   * Creates an instance of GlobalRankingRepositoryImpl.
   * @param httpClient - The HTTP client for making API requests
   */
  constructor(private readonly httpClient: AxiosClient) {}

  /**
   * Finds a global ranking by its unique identifier.
   * @param id - The global ranking identifier
   * @returns Promise resolving to the global ranking or null if not found
   */
  public async findById(id: string): Promise<GlobalRanking | null> {
    try {
      const response = await this.httpClient.get<GlobalRanking>(`/global-rankings/${id}`);
      return response;
    } catch (error) {
      if ((error as {response?: {status?: number}}).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Retrieves all global rankings from the system.
   * @returns Promise resolving to an array of all global rankings
   */
  public async findAll(): Promise<GlobalRanking[]> {
    const response = await this.httpClient.get<GlobalRanking[]>('/global-rankings');
    return response;
  }

  /**
   * Persists a new global ranking to the database.
   * @param globalRanking - The global ranking entity to save
   * @returns Promise resolving to the saved global ranking with assigned ID
   */
  public async save(globalRanking: GlobalRanking): Promise<GlobalRanking> {
    const response = await this.httpClient.post<GlobalRanking>('/global-rankings', globalRanking);
    return response;
  }

  /**
   * Updates an existing global ranking in the database.
   * @param globalRanking - The global ranking entity with updated data
   * @returns Promise resolving to the updated global ranking
   */
  public async update(globalRanking: GlobalRanking): Promise<GlobalRanking> {
    const response = await this.httpClient.put<GlobalRanking>(`/global-rankings/${globalRanking.id}`, globalRanking);
    return response;
  }

  /**
   * Removes a global ranking from the database.
   * @param id - The identifier of the global ranking to delete
   * @returns Promise resolving when deletion is complete
   */
  public async delete(id: string): Promise<void> {
    await this.httpClient.delete(`/global-rankings/${id}`);
  }

  /**
   * Retrieves the global ranking for a specific participant.
   * @param participantId - The participant's identifier
   * @returns Promise resolving to the global ranking or null if not found
   */
  public async findByParticipant(participantId: string): Promise<GlobalRanking | null> {
    try {
      const response = await this.httpClient.get<GlobalRanking>(`/global-rankings?participantId=${participantId}`);
      return response;
    } catch (error) {
      if ((error as {response?: {status?: number}}).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Retrieves the top N participants from the global ranking.
   * @param n - The number of top-ranked participants to retrieve
   * @returns Promise resolving to an array of global rankings
   */
  public async findTopN(n: number): Promise<GlobalRanking[]> {
    const response = await this.httpClient.get<GlobalRanking[]>(`/global-rankings?limit=${n}&sort=rank:asc`);
    return response;
  }
}
