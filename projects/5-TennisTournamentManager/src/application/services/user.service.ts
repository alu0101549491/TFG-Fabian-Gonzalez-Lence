/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 20, 2026
 * @file application/services/user.service.ts
 * @desc Service for user profile operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {type UserDto, type UpdateUserDto} from '@application/dto';
import {environment} from '../../environments/environment';

/**
 * UserService provides operations for managing user profiles.
 *
 * @example
 * ```typescript
 * const service = inject(UserService);
 * 
 * // Update user profile
 * const updated = await service.updateProfile('usr_123', {
 *   firstName: 'John',
 *   lastName: 'Doe'
 * });
 * ```
 */
@Injectable({providedIn: 'root'})
export class UserService {
  /** HTTP client for API requests */
  private readonly http = inject(HttpClient);

  /** Base API URL */
  private readonly apiUrl = `${environment.apiUrl}/users`;

  /**
   * Updates user profile.
   *
   * @param userId - ID of user to update
   * @param userData - Updated user data
   * @returns Promise resolving to updated user
   */
  public async updateProfile(userId: string, userData: UpdateUserDto): Promise<UserDto> {
    return firstValueFrom(
      this.http.put<UserDto>(`${this.apiUrl}/${userId}`, userData, {
        headers: {'Cache-Control': 'no-cache', 'Pragma': 'no-cache'}
      })
    );
  }

  /**
   * Gets user by ID.
   *
   * @param userId - ID of user to retrieve
   * @param bypassCache - If true, forces fresh data fetch
   * @returns Promise resolving to user data
   */
  public async getUserById(userId: string, bypassCache = false): Promise<UserDto> {
    return firstValueFrom(
      this.http.get<UserDto>(`${this.apiUrl}/${userId}`, {
        params: bypassCache ? {_t: Date.now().toString()} : {},
        headers: bypassCache ? {'Cache-Control': 'no-cache', 'Pragma': 'no-cache'} : {}
      })
    );
  }
}
