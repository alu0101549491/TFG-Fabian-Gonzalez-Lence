/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 19, 2026
 * @file application/services/user-management.service.ts
 * @desc Service for admin user management operations (CRUD operations on users).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable, inject} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {
  type UserSummaryDto,
  type CreateUserDto,
  type UpdateUserByAdminDto,
  type UserFilterDto,
  type UserStatsDto,
} from '@application/dto';
import {environment} from '../../environments/environment';

/**
 * UserManagementService provides admin operations for managing system users.
 * All operations require SYSTEM_ADMIN role.
 *
 * @example
 * ```typescript
 * const service = inject(UserManagementService);
 * 
 * // Get all users
 * const all Users = await service.getAllUsers();
 * 
 * // Create new user
 * const newUser = await service.createUser({
 *   username: 'newuser',
 *   email: 'newuser@example.com',
 *   firstName: 'New',
 *   lastName: 'User',
 *   password: 'securePassword123',
 *   role: UserRole.PLAYER
 * });
 * ```
 */
@Injectable({providedIn: 'root'})
export class UserManagementService {
  /** HTTP client for API requests */
  private readonly http = inject(HttpClient);

  /** Base API URL */
  private readonly apiUrl = `${environment.apiUrl}/users`;

  /**
   * Retrieves all users with optional filtering.
   *
   * @param filters - Optional filter criteria (role, isActive, searchQuery)
   * @param bypassCache - If true, forces fresh data fetch (bypasses HTTP cache)
   * @returns Promise resolving to array of user summaries
   */
  public async getAllUsers(filters?: UserFilterDto, bypassCache = false): Promise<UserSummaryDto[]> {
    let params = new HttpParams();

    if (filters?.role) {
      params = params.set('role', filters.role);
    }
    if (filters?.isActive !== undefined) {
      params = params.set('isActive', filters.isActive.toString());
    }
    if (filters?.searchQuery) {
      params = params.set('searchQuery', filters.searchQuery);
    }

    // Add cache-buster timestamp if bypassing cache
    if (bypassCache) {
      params = params.set('_t', Date.now().toString());
    }

    return firstValueFrom(
      this.http.get<UserSummaryDto[]>(this.apiUrl, {
        params,
        headers: bypassCache ? {'Cache-Control': 'no-cache', 'Pragma': 'no-cache'} : {}
      })
    );
  }

  /**
   * Retrieves users eligible for tournament registration.
   * Only returns active PLAYER role users. Accessible by tournament and system admins.
   *
   * @param searchQuery - Optional search query to filter users
   * @param bypassCache - If true, forces fresh data fetch (bypasses HTTP cache)
   * @returns Promise resolving to array of eligible participant summaries
   */
  public async getEligibleParticipants(searchQuery?: string, bypassCache = false): Promise<UserSummaryDto[]> {
    let params = new HttpParams();

    if (searchQuery) {
      params = params.set('searchQuery', searchQuery);
    }

    // Add cache-buster timestamp if bypassing cache
    if (bypassCache) {
      params = params.set('_t', Date.now().toString());
    }

    return firstValueFrom(
      this.http.get<UserSummaryDto[]>(`${this.apiUrl}/eligible-participants`, {
        params,
        headers: bypassCache ? {'Cache-Control': 'no-cache', 'Pragma': 'no-cache'} : {}
      })
    );
  }

  /**
   * Retrieves user statistics.
   *
   * @param bypassCache - If true, forces fresh data fetch (bypasses HTTP cache)
   * @returns Promise resolving to user statistics
   */
  public async getUserStats(bypassCache = false): Promise<UserStatsDto> {
    let params = new HttpParams();
    
    // Add cache-buster timestamp if bypassing cache
    if (bypassCache) {
      params = params.set('_t', Date.now().toString());
    }

    return firstValueFrom(
      this.http.get<UserStatsDto>(`${this.apiUrl}/stats`, {
        params,
        headers: bypassCache ? {'Cache-Control': 'no-cache', 'Pragma': 'no-cache'} : {}
      })
    );
  }

  /**
   * Creates a new user.
   *
   * @param userData - User creation data
   * @returns Promise resolving to created user
   */
  public async createUser(userData: CreateUserDto): Promise<UserSummaryDto> {
    return firstValueFrom(
      this.http.post<UserSummaryDto>(this.apiUrl, userData)
    );
  }

  /**
   * Updates a user (admin operation - can modify any field including role).
   *
   * @param userId - ID of user to update
   * @param userData - Updated user data
   * @returns Promise resolving to updated user
   */
  public async updateUser(userId: string, userData: UpdateUserByAdminDto): Promise<UserSummaryDto> {
    return firstValueFrom(
      this.http.put<UserSummaryDto>(`${this.apiUrl}/${userId}/admin`, userData)
    );
  }

  /**
   * Deletes a user.
   *
   * @param userId - ID of user to delete
   * @returns Promise resolving when deletion completes
   */
  public async deleteUser(userId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`${this.apiUrl}/${userId}`)
    );
  }
}
