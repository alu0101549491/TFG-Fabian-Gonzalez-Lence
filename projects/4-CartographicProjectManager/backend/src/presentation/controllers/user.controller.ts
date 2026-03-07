/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file backend/src/presentation/controllers/user.controller.ts
 * @desc User controller handling user CRUD operations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {Request, Response, NextFunction} from 'express';
import {UserRepository} from '@infrastructure/repositories/user.repository.js';
import {hashPassword} from '@infrastructure/auth/password.service.js';
import {sendSuccess, sendError} from '@shared/utils.js';
import {HTTP_STATUS, ERROR_MESSAGES} from '@shared/constants.js';
import {NotFoundError} from '@shared/errors.js';

/**
 * User controller
 */
export class UserController {
  private readonly userRepository: UserRepository;

  public constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * GET /api/v1/users
   * Get all users, optionally filtered by role
   */
  public async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {role} = req.query;
      
      const users = role
        ? await this.userRepository.findByRole(role as any)
        : await this.userRepository.findAll();

      // Remove passwordHash from response
      const usersWithoutPassword = users.map(({passwordHash, ...user}) => user);
      
      sendSuccess(res, usersWithoutPassword);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/users/:id
   * Get user by ID
   */
  public async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await this.userRepository.findById(req.params.id as string);
      
      if (!user) {
        throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      const {passwordHash, ...userWithoutPassword} = user;
      sendSuccess(res, userWithoutPassword);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/users/email/:email
   * Get user by email
   */
  public async getByEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await this.userRepository.findByEmail(decodeURIComponent(req.params.email as string));
      
      if (!user) {
        throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      const {passwordHash, ...userWithoutPassword} = user;
      sendSuccess(res, userWithoutPassword);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/users/username/:username
   * Get user by username
   */
  public async getByUsername(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await this.userRepository.findByUsername(decodeURIComponent(req.params.username as string));
      
      if (!user) {
        throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      const {passwordHash, ...userWithoutPassword} = user;
      sendSuccess(res, userWithoutPassword);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/users
   * Create new user
   */
  public async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {password, ...userData} = req.body;
      
      // Hash password before creating user
      const passwordHash = await hashPassword(password);
      
      const user = await this.userRepository.create({
        ...userData,
        passwordHash
      });
      
      const {passwordHash: _, ...userWithoutPassword} = user;
      sendSuccess(res, userWithoutPassword, 'User created successfully', HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/users/:id
   * Update user
   */
  public async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {password, ...userData} = req.body;
      
      // Hash password if it's being updated
      const updateData = password 
        ? {...userData, passwordHash: await hashPassword(password)}
        : userData;
      
      const user = await this.userRepository.update(req.params.id as string, updateData);
      const {passwordHash, ...userWithoutPassword} = user;
      sendSuccess(res, userWithoutPassword, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/users/:id
   * Delete user
   */
  public async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await this.userRepository.delete(req.params.id as string);
      sendSuccess(res, null, 'User deleted successfully', HTTP_STATUS.NO_CONTENT);
    } catch (error) {
      next(error);
    }
  }
}
