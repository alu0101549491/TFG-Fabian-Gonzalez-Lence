/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 20, 2026
 * @file src/application/services/category.service.ts
 * @desc Service for managing tournament categories.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {environment} from '../../environments/environment';
import {type CategoryDto, type CreateCategoryDto} from '@application/dto/category.dto';

/**
 * Service for managing tournament categories via API.
 */
@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/categories`;

  /**
   * Fetches all categories for a specific tournament.
   *
   * @param tournamentId - The ID of the tournament
   * @returns Promise resolving to array of categories
   */
  public async getCategoriesByTournament(tournamentId: string): Promise<CategoryDto[]> {
    return firstValueFrom(
      this.http.get<CategoryDto[]>(`${this.apiUrl}?tournamentId=${tournamentId}`, {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Pragma: 'no-cache',
        },
      }),
    );
  }

  /**
   * Creates a new category for a tournament.
   *
   * @param categoryData - Category data to create
   * @returns Promise resolving to the created category
   */
  public async createCategory(categoryData: CreateCategoryDto): Promise<CategoryDto> {
    return firstValueFrom(
      this.http.post<CategoryDto>(this.apiUrl, categoryData),
    );
  }

  /**
   * Deletes a category by ID.
   *
   * @param categoryId - ID of the category to delete
   * @returns Promise resolving when deletion is complete
   */
  public async deleteCategory(categoryId: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.apiUrl}/${categoryId}`),
    );
  }

  /**
   * Fetches a single category by ID.
   *
   * @param categoryId - ID of the category
   * @returns Promise resolving to the category
   */
  public async getCategoryById(categoryId: string): Promise<CategoryDto> {
    return firstValueFrom(
      this.http.get<CategoryDto>(`${this.apiUrl}/${categoryId}`),
    );
  }
}
