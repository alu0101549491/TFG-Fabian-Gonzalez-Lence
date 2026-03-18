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
import {ImageOptimizationService} from '../../application/services/image-optimization.service';

/**
 * User controller.
 */
export class UserController {
  private readonly imageService: ImageOptimizationService;

  /**
   * Creates an instance of UserController.
   */
  public constructor() {
    this.imageService = new ImageOptimizationService();
  }
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

  /**
   * POST /api/users/:id/avatar
   * Uploads and optimizes user avatar image.
   * 
   * Expects multipart/form-data with 'image' field.
   * - Validates image format and size
   * - Optimizes with compression and WebP conversion
   * - Generates responsive sizes (thumbnail, medium)
   * - Stores in filesystem and updates user.avatarUrl
   */
  public async uploadAvatar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const userRepository = AppDataSource.getRepository(User);

      // Verify user exists
      const user = await userRepository.findOne({where: {id}});
      if (!user) {
        throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Verify authorization (users can only upload their own avatar, admins can upload for anyone)
      if (req.user?.id !== id && req.user?.role !== 'ADMIN') {
        throw new AppError(
          'Unauthorized to upload avatar for this user',
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.FORBIDDEN,
        );
      }

      // Check if file was uploaded
      if (!req.file) {
        throw new AppError('No image file provided', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_FAILED);
      }

      // Validate image
      const isValid = await this.imageService.validateImage(req.file.buffer);
      if (!isValid) {
        throw new AppError('Invalid image file', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_FAILED);
      }

      // Delete old avatar if exists
      if (user.avatarUrl) {
        const oldPath = user.avatarUrl.replace('/uploads/', '');
        await this.imageService.deleteImage(oldPath);
      }

      // Optimize image (compress, resize to 400x400, convert to WebP)
      const optimized = await this.imageService.optimizeImage(req.file.buffer, {
        width: 400,
        height: 400,
        fit: 'cover',
      });

      // Save to filesystem
      const filename = `${id}-${Date.now()}.webp`;
      const relativePath = `avatars/${filename}`;
      await this.imageService.saveImage(optimized.buffer, relativePath);

      // Update user entity
      user.avatarUrl = this.imageService.getImageUrl(relativePath);
      await userRepository.save(user);

      const {passwordHash, ...userWithoutPassword} = user;

      res.status(HTTP_STATUS.OK).json({
        message: 'Avatar uploaded successfully',
        user: userWithoutPassword,
        image: {
          url: user.avatarUrl,
          size: optimized.size,
          width: optimized.width,
          height: optimized.height,
          format: optimized.format,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/users/:id/avatar
   * Deletes user avatar image.
   */
  public async deleteAvatar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const userRepository = AppDataSource.getRepository(User);

      const user = await userRepository.findOne({where: {id}});
      if (!user) {
        throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Verify authorization
      if (req.user?.id !== id && req.user?.role !== 'ADMIN') {
        throw new AppError(
          'Unauthorized to delete avatar for this user',
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.FORBIDDEN,
        );
      }

      if (!user.avatarUrl) {
        throw new AppError('User has no avatar to delete', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Delete from filesystem
      const relativePath = user.avatarUrl.replace('/uploads/', '');
      await this.imageService.deleteImage(relativePath);

      // Update user entity
      user.avatarUrl = null;
      await userRepository.save(user);

      const {passwordHash, ...userWithoutPassword} = user;

      res.status(HTTP_STATUS.OK).json({
        message: 'Avatar deleted successfully',
        user: userWithoutPassword,
      });
    } catch (error) {
      next(error);
    }
  }
}
