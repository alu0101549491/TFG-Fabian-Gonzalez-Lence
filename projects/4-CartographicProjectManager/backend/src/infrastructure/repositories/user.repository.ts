/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file backend/src/infrastructure/repositories/user.repository.ts
 * @desc User repository implementation using Prisma
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {User, UserRole} from '@prisma/client';
import type {IUserRepository} from '@domain/repositories/user.repository.interface.js';
import {prisma} from '../database/prisma.client.js';
import {NotFoundError, DatabaseError} from '@shared/errors.js';

/**
 * User repository implementation
 */
export class UserRepository implements IUserRepository {
  /**
   * Find user by ID
   */
  public async findById(id: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({where: {id}});
    } catch (error) {
      throw new DatabaseError('Failed to find user by ID');
    }
  }

  /**
   * Find user by email
   */
  public async findByEmail(email: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({where: {email}});
    } catch (error) {
      throw new DatabaseError('Failed to find user by email');
    }
  }

  /**
   * Find user by username
   */
  public async findByUsername(username: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({where: {username}});
    } catch (error) {
      throw new DatabaseError('Failed to find user by username');
    }
  }

  /**
   * Find all users
   */
  public async findAll(): Promise<User[]> {
    try {
      return await prisma.user.findMany();
    } catch (error) {
      throw new DatabaseError('Failed to fetch all users');
    }
  }

  /**
   * Find users by role
   */
  public async findByRole(role: UserRole): Promise<User[]> {
    try {
      return await prisma.user.findMany({where: {role}});
    } catch (error) {
      throw new DatabaseError('Failed to find users by role');
    }
  }

  /**
   * Create new user
   */
  public async create(data: Omit<User, 'id' | 'createdAt' | 'lastLogin'>): Promise<User> {
    try {
      return await prisma.user.create({data});
    } catch (error) {
      throw new DatabaseError('Failed to create user');
    }
  }

  /**
   * Update existing user
   */
  public async update(id: string, data: Partial<User>): Promise<User> {
    try {
      return await prisma.user.update({
        where: {id},
        data,
      });
    } catch (error) {
      throw new DatabaseError('Failed to update user');
    }
  }

  /**
   * Delete user
   */
  public async delete(id: string): Promise<void> {
    try {
      await prisma.user.delete({where: {id}});
    } catch (error) {
      throw new DatabaseError('Failed to delete user');
    }
  }

  /**
   * Check if email exists
   */
  public async existsByEmail(email: string): Promise<boolean> {
    try {
      const count = await prisma.user.count({where: {email}});
      return count > 0;
    } catch (error) {
      throw new DatabaseError('Failed to check if email exists');
    }
  }

  /**
   * Update last login timestamp
   */
  public async updateLastLogin(id: string): Promise<void> {
    try {
      await prisma.user.update({
        where: {id},
        data: {lastLogin: new Date()},
      });
    } catch (error) {
      throw new DatabaseError('Failed to update last login');
    }
  }
}
