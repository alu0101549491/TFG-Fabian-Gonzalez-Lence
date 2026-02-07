/**
 * @module domain/repositories/user-repository
 * @description Repository interface for User entity persistence operations.
 * Defines the contract for data access — implementations live in the
 * Infrastructure layer (Dependency Inversion Principle).
 * @category Domain
 */

import {User} from '../entities/user';
import {UserRole} from '../enumerations/user-role';

/**
 * Abstraction for User data access operations.
 * Implemented by infrastructure layer repositories.
 */
export interface IUserRepository {
  /**
   * Finds a user by their unique identifier.
   * @param id - The user's unique ID.
   * @returns The found user or null if not found.
   */
  findById(id: string): Promise<User | null>;

  /**
   * Finds a user by their username.
   * @param username - The username to search for.
   * @returns The found user or null if not found.
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * Persists a new user to the data store.
   * @param user - The user entity to save.
   * @returns The saved user with any generated fields populated.
   */
  save(user: User): Promise<User>;

  /**
   * Updates an existing user in the data store.
   * @param user - The user entity with updated data.
   * @returns The updated user.
   */
  update(user: User): Promise<User>;

  /**
   * Finds all users with a specific role.
   * @param role - The role to filter by.
   * @returns Array of users matching the specified role.
   */
  findByRole(role: UserRole): Promise<User[]>;
}
