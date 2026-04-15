/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file infrastructure/repositories/user.repository.ts
 * @desc HTTP-based implementation of IUserRepository using Axios client
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable, inject} from '@angular/core';
import {User} from '@domain/entities/user';
import {IUserRepository} from '@domain/repositories/user.repository.interface';
import {UserRole} from '@domain/enumerations/user-role';
import {AxiosClient} from '../http/axios-client';

/**
 * HTTP-based implementation of IUserRepository.
 * Communicates with the backend REST API via Axios.
 */
@Injectable({providedIn: 'root'})
export class UserRepositoryImpl implements IUserRepository {
  /** The HTTP client for making API requests */
  private readonly httpClient = inject(AxiosClient);

  /**
   * Finds a user by their unique identifier.
   * @param id - The user identifier
   * @returns Promise resolving to the user or null if not found
   */
  public async findById(id: string): Promise<User | null> {
    try {
      const response = await this.httpClient.get<User>(`/users/${id}`);
      return response;
    } catch (error) {
      if ((error as {response?: {status?: number}}).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Finds public user information by ID (no authentication required).
   * Returns only publicly visible user data: id, username, firstName, lastName, avatarUrl.
   * 
   * @param id - The user identifier
   * @returns Promise resolving to the user or null if not found
   */
  public async findPublicById(id: string): Promise<User | null> {
    try {
      const response = await this.httpClient.get<User>(`/users/${id}/public`);
      return response;
    } catch (error) {
      if ((error as {response?: {status?: number}}).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Retrieves all users from the system.
   * @returns Promise resolving to an array of all users
   */
  public async findAll(): Promise<User[]> {
    const response = await this.httpClient.get<User[]>('/users');
    return response;
  }

  /**
   * Persists a new user to the database.
   * @param user - The user entity to save
   * @returns Promise resolving to the saved user with assigned ID
   */
  public async save(user: User): Promise<User> {
    const response = await this.httpClient.post<User>('/users', user);
    return response;
  }

  /**
   * Updates an existing user in the database.
   * @param user - The user entity with updated data
   * @returns Promise resolving to the updated user
   */
  public async update(user: User): Promise<User> {
    const response = await this.httpClient.put<User>(`/users/${user.id}`, user);
    return response;
  }

  /**
   * Removes a user from the database.
   * @param id - The identifier of the user to delete
   * @returns Promise resolving when deletion is complete
   */
  public async delete(id: string): Promise<void> {
    await this.httpClient.delete(`/users/${id}`);
  }

  /**
   * Finds a user by their email address.
   * @param email - The email address to search for
   * @returns Promise resolving to the user or null if not found
   */
  public async findByEmail(email: string): Promise<User | null> {
    try {
      const response = await this.httpClient.get<User>(`/users/email/${email}`);
      return response;
    } catch (error) {
      if ((error as {response?: {status?: number}}).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Finds a user by their username.
   * @param username - The username to search for
   * @returns Promise resolving to the user or null if not found
   */
  public async findByUsername(username: string): Promise<User | null> {
    try {
      const response = await this.httpClient.get<User>(`/users/username/${username}`);
      return response;
    } catch (error) {
      if ((error as {response?: {status?: number}}).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Retrieves all users with a specific role.
   * @param role - The user role to filter by
   * @returns Promise resolving to an array of users with the specified role
   */
  public async findByRole(role: UserRole): Promise<User[]> {
    const response = await this.httpClient.get<User[]>(`/users?role=${role}`);
    return response;
  }
}
