/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file backend/src/domain/repositories/user.repository.interface.ts
 * @desc User repository interface for data access
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {User, UserRole} from '@prisma/client';

/**
 * User repository interface
 */
export interface IUserRepository {
  /**
   * Find user by ID
   *
   * @param id - User ID
   * @returns User or null if not found
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find user by email
   *
   * @param email - Email address
   * @returns User or null if not found
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find user by username
   *
   * @param username - Username
   * @returns User or null if not found
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * Find all users
   *
   * @returns Array of users
   */
  findAll(): Promise<User[]>;

  /**
   * Find users by role
   *
   * @param role - User role
   * @returns Array of users with specified role
   */
  findByRole(role: UserRole): Promise<User[]>;

  /**
   * Create new user
   *
   * @param data - User data
   * @returns Created user
   */
  create(data: Omit<User, 'id' | 'createdAt' | 'lastLogin'>): Promise<User>;

  /**
   * Update existing user
   *
   * @param id - User ID
   * @param data - Updated user data
   * @returns Updated user
   */
  update(id: string, data: Partial<User>): Promise<User>;

  /**
   * Delete user
   *
   * @param id - User ID
   */
  delete(id: string): Promise<void>;

  /**
   * Check if email exists
   *
   * @param email - Email address
   * @returns True if email exists
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * Update last login timestamp
   *
   * @param id - User ID
   */
  updateLastLogin(id: string): Promise<void>;
}
