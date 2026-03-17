/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file infrastructure/repositories/order-of-play.repository.ts
 * @desc HTTP-based implementation of IOrderOfPlayRepository using Axios client
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {OrderOfPlay} from '@domain/entities/order-of-play';
import {IOrderOfPlayRepository} from '@domain/repositories/order-of-play.repository.interface';
import {AxiosClient} from '../http/axios-client';

/**
 * HTTP-based implementation of IOrderOfPlayRepository.
 * Communicates with the backend REST API via Axios.
 */
export class OrderOfPlayRepositoryImpl implements IOrderOfPlayRepository {
  /**
   * Creates an instance of OrderOfPlayRepositoryImpl.
   * @param httpClient - The HTTP client for making API requests
   */
  constructor(private readonly httpClient: AxiosClient) {}

  /**
   * Finds an order of play by its unique identifier.
   * @param id - The order of play identifier
   * @returns Promise resolving to the order of play or null if not found
   */
  public async findById(id: string): Promise<OrderOfPlay | null> {
    try {
      const response = await this.httpClient.get<OrderOfPlay>(`/order-of-play/${id}`);
      return response;
    } catch (error) {
      if ((error as {response?: {status?: number}}).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Retrieves all orders of play from the system.
   * @returns Promise resolving to an array of all orders of play
   */
  public async findAll(): Promise<OrderOfPlay[]> {
    const response = await this.httpClient.get<OrderOfPlay[]>('/order-of-play');
    return response;
  }

  /**
   * Persists a new order of play to the database.
   * @param orderOfPlay - The order of play entity to save
   * @returns Promise resolving to the saved order of play with assigned ID
   */
  public async save(orderOfPlay: OrderOfPlay): Promise<OrderOfPlay> {
    const response = await this.httpClient.post<OrderOfPlay>('/order-of-play', orderOfPlay);
    return response;
  }

  /**
   * Updates an existing order of play in the database.
   * @param orderOfPlay - The order of play entity with updated data
   * @returns Promise resolving to the updated order of play
   */
  public async update(orderOfPlay: OrderOfPlay): Promise<OrderOfPlay> {
    const response = await this.httpClient.put<OrderOfPlay>(`/order-of-play/${orderOfPlay.id}`, orderOfPlay);
    return response;
  }

  /**
   * Removes an order of play from the database.
   * @param id - The identifier of the order of play to delete
   * @returns Promise resolving when deletion is complete
   */
  public async delete(id: string): Promise<void> {
    await this.httpClient.delete(`/order-of-play/${id}`);
  }

  /**
   * Retrieves all orders of play for a specific tournament.
   * @param tournamentId - The tournament identifier
   * @returns Promise resolving to an array of orders of play
   */
  public async findByTournamentId(tournamentId: string): Promise<OrderOfPlay[]> {
    const response = await this.httpClient.get<OrderOfPlay[]>(`/order-of-play?tournamentId=${tournamentId}`);
    return response;
  }

  /**
   * Retrieves all orders of play for a specific court.
   * @param courtId - The court identifier
   * @returns Promise resolving to an array of orders of play
   */
  public async findByCourtId(courtId: string): Promise<OrderOfPlay[]> {
    const response = await this.httpClient.get<OrderOfPlay[]>(`/order-of-play?courtId=${courtId}`);
    return response;
  }

  /**
   * Retrieves all orders of play for a specific match.
   * @param matchId - The match identifier
   * @returns Promise resolving to an array of orders of play
   */
  public async findByMatchId(matchId: string): Promise<OrderOfPlay[]> {
    const response = await this.httpClient.get<OrderOfPlay[]>(`/order-of-play?matchId=${matchId}`);
    return response;
  }
}
