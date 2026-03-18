/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file infrastructure/repositories/category.repository.ts
 * @desc HTTP-based implementation of ICategoryRepository using Axios client
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable, inject} from '@angular/core';
import {Category} from '@domain/entities/category';
import {ICategoryRepository} from '@domain/repositories/category.repository.interface';
import {AxiosClient} from '../http/axios-client';

/**
 * HTTP-based implementation of ICategoryRepository.
 * Communicates with the backend REST API via Axios.
 */
@Injectable({providedIn: 'root'})
export class CategoryRepositoryImpl implements ICategoryRepository {
  /** The HTTP client for making API requests */
  private readonly httpClient = inject(AxiosClient);

  /**
   * Finds a category by its unique identifier.
   * @param id - The category identifier
   * @returns Promise resolving to the category or null if not found
   */
  public async findById(id: string): Promise<Category | null> {
    try {
      const response = await this.httpClient.get<Category>(`/categories/${id}`);
      return response;
    } catch (error) {
      if ((error as {response?: {status?: number}}).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Retrieves all categories from the system.
   * @returns Promise resolving to an array of all categories
   */
  public async findAll(): Promise<Category[]> {
    const response = await this.httpClient.get<Category[]>('/categories');
    return response;
  }

  /**
   * Persists a new category to the database.
   * @param category - The category entity to save
   * @returns Promise resolving to the saved category with assigned ID
   */
  public async save(category: Category): Promise<Category> {
    const response = await this.httpClient.post<Category>('/categories', category);
    return response;
  }

  /**
   * Updates an existing category in the database.
   * @param category - The category entity with updated data
   * @returns Promise resolving to the updated category
   */
  public async update(category: Category): Promise<Category> {
    const response = await this.httpClient.put<Category>(`/categories/${category.id}`, category);
    return response;
  }

  /**
   * Removes a category from the database.
   * @param id - The identifier of the category to delete
   * @returns Promise resolving when deletion is complete
   */
  public async delete(id: string): Promise<void> {
    await this.httpClient.delete(`/categories/${id}`);
  }

  /**
   * Retrieves all categories belonging to a specific tournament.
   * @param tournamentId - The tournament identifier
   * @returns Promise resolving to an array of categories
   */
  public async findByTournamentId(tournamentId: string): Promise<Category[]> {
    const response = await this.httpClient.get<Category[]>(`/categories?tournamentId=${tournamentId}`);
    return response;
  }
}
