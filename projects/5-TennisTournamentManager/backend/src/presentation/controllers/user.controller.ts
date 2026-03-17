/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/controllers/user.controller.ts
 * @desc User controller handling user profile operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Response, NextFunction} from 'express';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {User} from '../../domain/entities/user.entity';
import {AuthRequest} from '../middleware/auth.middleware';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {AppError} from '../middleware/error.middleware';

/**
 * User controller.
 */
export class UserController {
  /**
   * GET /api/users/:id
   * Retrieves user by ID.
   */
  public async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const userRepository = AppDataSource.getRepository(User);
      
      const user = await userRepository.findOne({where: {id}});
      
      if (!user) {
        throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      const {passwordHash, ...userWithoutPassword} = user;
      
      res.status(HTTP_STATUS.OK).json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * PUT /api/users/:id
   * Updates user profile.
   */
  public async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const userRepository = AppDataSource.getRepository(User);
      
      const user = await userRepository.findOne({where: {id}});
      
      if (!user) {
        throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      const {firstName, lastName, phone} = req.body;
      
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phone !== undefined) user.phone = phone;
      
      await userRepository.save(user);
      
      const {passwordHash, ...userWithoutPassword} = user;
      
      res.status(HTTP_STATUS.OK).json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/users
   * Lists all users (admin only).
   */
  public async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {role, isActive} = req.query;
      const userRepository = AppDataSource.getRepository(User);
      
      const queryBuilder = userRepository.createQueryBuilder('user');
      
      if (role) {
        queryBuilder.andWhere('user.role = :role', {role});
      }
      if (isActive !== undefined) {
        queryBuilder.andWhere('user.isActive = :isActive', {isActive: isActive === 'true'});
      }
      
      queryBuilder.select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.role',
        'user.isActive',
      ]);
      
      const users = await queryBuilder.getMany();
      
      res.status(HTTP_STATUS.OK).json(users);
    } catch (error) {
      next(error);
    }
  }
}
