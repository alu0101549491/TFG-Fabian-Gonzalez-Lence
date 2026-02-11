/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file domain/repositories/user-repository.interface.ts
 * @desc Repository interface for User entity persistence operations. Defines the contract for user data access including authentication queries, role-based filtering, and user existence checks.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {User} from '../entities/user';
import {UserRole} from '../enumerations/user-role';

/**
 * Repository interface for User entity data access operations.
 *
 * This interface defines the contract that must be implemented by the
 * infrastructure layer for User persistence. It provides methods for
 * CRUD operations, authentication queries, and role-based filtering.
 *
 * @example
 * ```typescript
 * // Infrastructure layer implementation
 * class UserRepositoryImpl implements IUserRepository {
 *   async findByEmail(email: string): Promise<User | null> {
 *     // Database query implementation
 *   }
 * }
 * ```
 */
export interface IUserRepository {
  /**
   * Finds a user by their unique identifier.
   *
   * @param id - The unique identifier of the user
   * @returns Promise resolving to the User if found, null otherwise
   */
  findById(id: string): Promise<User | null>;

  /**
   * Finds a user by their email address.
   * Used primarily for authentication and login operations.
   *
   * @param email - The email address to search for
   * @returns Promise resolving to the User if found, null otherwise
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Finds a user by their username.
   *
   * @param username - The username to search for
   * @returns Promise resolving to the User if found, null otherwise
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * Creates a new user in the persistence layer.
   *
   * @param user - The User entity to persist
   * @returns Promise resolving to the created User with any generated fields
   * @throws {Error} If user with same email or username already exists
   */
  save(user: User): Promise<User>;

  /**
   * Updates an existing user in the persistence layer.
   *
   * @param user - The User entity with updated data
   * @returns Promise resolving to the updated User
   * @throws {Error} If user does not exist
   */
  update(user: User): Promise<User>;

  /**
   * Deletes a user by their unique identifier.
   *
   * @param id - The unique identifier of the user to delete
   * @returns Promise resolving when deletion is complete
   * @throws {Error} If user does not exist or has dependent entities
   */
  delete(id: string): Promise<void>;

  /**
   * Finds all users with a specific role.
   * Useful for administrative operations and role-based queries.
   *
   * @param role - The UserRole to filter by (ADMINISTRATOR, CLIENT, SPECIAL_USER)
   * @returns Promise resolving to array of Users with the specified role (empty if none found)
   */
  findByRole(role: UserRole): Promise<User[]>;

  /**
   * Retrieves all users in the system.
   * Should be used carefully in production due to potential large result sets.
   *
   * @returns Promise resolving to array of all Users (empty if none exist)
   */
  findAll(): Promise<User[]>;

  /**
   * Checks if a user with the given email already exists.
   * Used for validation during user registration.
   *
   * @param email - The email address to check
   * @returns Promise resolving to true if email exists, false otherwise
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * Checks if a user with the given username already exists.
   * Used for validation during user registration.
   *
   * @param username - The username to check
   * @returns Promise resolving to true if username exists, false otherwise
   */
  existsByUsername(username: string): Promise<boolean>;
}
