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

import {GlobalRanking} from '@domain/entities/global-ranking';
import {IGlobalRankingRepository} from '@domain/repositories/global-ranking.repository.interface';
import {AxiosClient} from '../http/axios-client';

/**
 * HTTP-based implementation of IGlobalRankingRepository.
 * Communicates with the backend REST API via Axios.
 */
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
    throw new Error('Not implemented');
  }

  /**
   * Retrieves all global rankings from the system.
   * @returns Promise resolving to an array of all global rankings
   */
  public async findAll(): Promise<GlobalRanking[]> {
    throw new Error('Not implemented');
  }

  /**
   * Persists a new global ranking to the database.
   * @param globalRanking - The global ranking entity to save
   * @returns Promise resolving to the saved global ranking with assigned ID
   */
  public async save(globalRanking: GlobalRanking): Promise<GlobalRanking> {
    throw new Error('Not implemented');
  }

  /**
   * Updates an existing global ranking in the database.
   * @param globalRanking - The global ranking entity with updated data
   * @returns Promise resolving to the updated global ranking
   */
  public async update(globalRanking: GlobalRanking): Promise<GlobalRanking> {
    throw new Error('Not implemented');
  }

  /**
   * Removes a global ranking from the database.
   * @param id - The identifier of the global ranking to delete
   * @returns Promise resolving when deletion is complete
   */
  public async delete(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  /**
   * Retrieves all global rankings for a specific participant.
   * @param participantId - The participant's identifier
   * @returns Promise resolving to an array of global rankings
   */
  public async findByParticipantId(participantId: string): Promise<GlobalRanking[]> {
    throw new Error('Not implemented');
  }

  /**
   * Retrieves the top N participants from the global ranking.
   * @param n - The number of top-ranked participants to retrieve
   * @returns Promise resolving to an array of global rankings
   */
  public async findTopN(n: number): Promise<GlobalRanking[]> {
    throw new Error('Not implemented');
  }
}
