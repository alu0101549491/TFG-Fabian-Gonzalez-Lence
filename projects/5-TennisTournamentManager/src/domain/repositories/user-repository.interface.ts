/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/repositories/user-repository.interface.ts
 * @desc Repository interface for User entity data access operations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {User} from '../entities/user.entity';
import {UserRole} from '../enumerations/user-role.enum';

/**
 * Repository interface for User entity data access operations.
 * Defines the contract for persisting and retrieving user data.
 */
export interface IUserRepository {
  /**
   * Finds a user by its unique identifier.
   * @param id - The unique identifier
   * @returns Promise resolving to the user if found, null otherwise
   */
  findById(id: string): Promise<User | null>;

  /**
   * Retrieves all users.
   * @returns Promise resolving to an array of users
   */
  findAll(): Promise<User[]>;

  /**
   * Persists a new user.
   * @param entity - The user to save
   * @returns Promise resolving to the saved user
   */
  save(entity: User): Promise<User>;

  /**
   * Updates an existing user.
   * @param entity - The user with updated data
   * @returns Promise resolving to the updated user
   */
  update(entity: User): Promise<User>;

  /**
   * Deletes a user by its unique identifier.
   * @param id - The unique identifier of the user to delete
   * @returns Promise resolving when deletion is complete
   */
  delete(id: string): Promise<void>;

  /**
   * Finds a user by email address.
   * @param email - The email address to search for
   * @returns Promise resolving to the user if found, null otherwise
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Finds a user by username.
   * @param username - The username to search for
   * @returns Promise resolving to the user if found, null otherwise
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * Finds all users with a specific role.
   * @param role - The user role to filter by
   * @returns Promise resolving to an array of users with the specified role
   */
  findByRole(role: UserRole): Promise<User[]>;
}
