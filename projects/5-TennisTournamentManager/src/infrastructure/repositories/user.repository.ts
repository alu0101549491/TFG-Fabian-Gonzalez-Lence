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

import {User} from '@domain/entities/user';
import {IUserRepository} from '@domain/repositories/user.repository.interface';
import {UserRole} from '@domain/enumerations/user-role';
import {AxiosClient} from '../http/axios-client';

/**
 * HTTP-based implementation of IUserRepository.
 * Communicates with the backend REST API via Axios.
 */
export class UserRepositoryImpl implements IUserRepository {
  /**
   * Creates an instance of UserRepositoryImpl.
   * @param httpClient - The HTTP client for making API requests
   */
  constructor(private readonly httpClient: AxiosClient) {}

  /**
   * Finds a user by their unique identifier.
   * @param id - The user identifier
   * @returns Promise resolving to the user or null if not found
   */
  public async findById(id: string): Promise<User | null> {
    throw new Error('Not implemented');
  }

  /**
   * Retrieves all users from the system.
   * @returns Promise resolving to an array of all users
   */
  public async findAll(): Promise<User[]> {
    throw new Error('Not implemented');
  }

  /**
   * Persists a new user to the database.
   * @param user - The user entity to save
   * @returns Promise resolving to the saved user with assigned ID
   */
  public async save(user: User): Promise<User> {
    throw new Error('Not implemented');
  }

  /**
   * Updates an existing user in the database.
   * @param user - The user entity with updated data
   * @returns Promise resolving to the updated user
   */
  public async update(user: User): Promise<User> {
    throw new Error('Not implemented');
  }

  /**
   * Removes a user from the database.
   * @param id - The identifier of the user to delete
   * @returns Promise resolving when deletion is complete
   */
  public async delete(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  /**
   * Finds a user by their email address.
   * @param email - The email address to search for
   * @returns Promise resolving to the user or null if not found
   */
  public async findByEmail(email: string): Promise<User | null> {
    throw new Error('Not implemented');
  }

  /**
   * Finds a user by their username.
   * @param username - The username to search for
   * @returns Promise resolving to the user or null if not found
   */
  public async findByUsername(username: string): Promise<User | null> {
    throw new Error('Not implemented');
  }

  /**
   * Retrieves all users with a specific role.
   * @param role - The user role to filter by
   * @returns Promise resolving to an array of users with the specified role
   */
  public async findByRole(role: UserRole): Promise<User[]> {
    throw new Error('Not implemented');
  }
}
