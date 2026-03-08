/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 8, 2026
 * @file backend/src/infrastructure/repositories/interfaces/user.repository.interface.ts
 * @desc User repository interface for Prisma-based data access
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {User, UserRole} from '@prisma/client';

/**
 * User repository interface
 */
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  findByRole(role: UserRole): Promise<User[]>;
  create(data: Omit<User, 'id' | 'createdAt' | 'lastLogin'>): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  existsByEmail(email: string): Promise<boolean>;
  updateLastLogin(id: string): Promise<void>;
}
