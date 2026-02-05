import {User} from '../entities/User';
import {UserRole} from '../enums/UserRole';

/**
 * Repository interface for User entity persistence
 */
export interface IUserRepository {
  /**
   * Finds a user by ID
   * @param id - User ID
   * @returns User entity or null if not found
   */
  findById(id: string): Promise<User | null>;

  /**
   * Finds a user by username
   * @param username - Username to search
   * @returns User entity or null if not found
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * Saves a new user
   * @param user - User entity to save
   * @returns Saved user entity
   */
  save(user: User): Promise<User>;

  /**
   * Updates an existing user
   * @param user - User entity to update
   * @returns Updated user entity
   */
  update(user: User): Promise<User>;

  /**
   * Finds users by role
   * @param role - User role to filter
   * @returns List of users with specified role
   */
  findByRole(role: UserRole): Promise<User[]>;
}