/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file infrastructure/repositories/score.repository.ts
 * @desc HTTP-based implementation of IScoreRepository using Axios client
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Score} from '@domain/entities/score';
import {IScoreRepository} from '@domain/repositories/score.repository.interface';
import {AxiosClient} from '../http/axios-client';

/**
 * HTTP-based implementation of IScoreRepository.
 * Communicates with the backend REST API via Axios.
 */
export class ScoreRepositoryImpl implements IScoreRepository {
  /**
   * Creates an instance of ScoreRepositoryImpl.
   * @param httpClient - The HTTP client for making API requests
   */
  constructor(private readonly httpClient: AxiosClient) {}

  /**
   * Finds a score by its unique identifier.
   * @param id - The score identifier
   * @returns Promise resolving to the score or null if not found
   */
  public async findById(id: string): Promise<Score | null> {
    throw new Error('Not implemented');
  }

  /**
   * Retrieves all scores from the system.
   * @returns Promise resolving to an array of all scores
   */
  public async findAll(): Promise<Score[]> {
    throw new Error('Not implemented');
  }

  /**
   * Persists a new score to the database.
   * @param score - The score entity to save
   * @returns Promise resolving to the saved score with assigned ID
   */
  public async save(score: Score): Promise<Score> {
    throw new Error('Not implemented');
  }

  /**
   * Updates an existing score in the database.
   * @param score - The score entity with updated data
   * @returns Promise resolving to the updated score
   */
  public async update(score: Score): Promise<Score> {
    throw new Error('Not implemented');
  }

  /**
   * Removes a score from the database.
   * @param id - The identifier of the score to delete
   * @returns Promise resolving when deletion is complete
   */
  public async delete(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  /**
   * Retrieves all scores for a specific match.
   * @param matchId - The match identifier
   * @returns Promise resolving to an array of scores
   */
  public async findByMatchId(matchId: string): Promise<Score[]> {
    throw new Error('Not implemented');
  }
}
