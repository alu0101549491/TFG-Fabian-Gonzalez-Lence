/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file backend/src/presentation/controllers/auth.controller.ts
 * @desc Authentication controller handling login, register, refresh, logout.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Request, Response, NextFunction} from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {User} from '../../domain/entities/user.entity';
import {config} from '../../shared/config';
import {generateId} from '../../shared/utils/id-generator';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {AppError} from '../middleware/error.middleware';
import {UserRole} from '../../domain/enumerations/user-role';

/**
 * Authentication controller.
 */
export class AuthController {
  /**
   * Builds a signed refresh token for the supplied authenticated user payload.
   *
   * @param payload - Minimal identity data embedded in the refresh token
   * @returns Signed JWT refresh token
   */
  private static buildRefreshToken(payload: {id: string; email: string; role: UserRole}): string {
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn as unknown as number,
    });
  }

  /**
   * POST /api/auth/login
   * Authenticates user and returns JWT token.
   */
  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {email, password} = req.body;
      
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({where: {email}});
      
      if (!user) {
        throw new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.INVALID_CREDENTIALS);
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      
      if (!isPasswordValid) {
        throw new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.INVALID_CREDENTIALS);
      }
      
      if (!user.isActive) {
        throw new AppError('Account is disabled', HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN);
      }
      
      const token = jwt.sign(
        {id: user.id, email: user.email, role: user.role},
        config.jwt.secret,
        {expiresIn: config.jwt.expiresIn as unknown as number}
      );
      const refreshToken = AuthController.buildRefreshToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });
      
      // Update last login
      user.lastLogin = new Date();
      await userRepository.save(user);
      
      res.status(HTTP_STATUS.OK).json({
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          idDocument: user.idDocument,
          ranking: user.ranking,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * POST /api/auth/register
   * Creates a new user account and automatically logs them in.
   */
  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {email, password, firstName, lastName, phone, username} = req.body;
      
      const userRepository = AppDataSource.getRepository(User);
      
      // Check if email already exists
      const existingUser = await userRepository.findOne({where: {email}});
      if (existingUser) {
        throw new AppError('Email already exists', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.ALREADY_EXISTS);
      }
      
      // Check if username already exists (if provided)
      if (username) {
        const existingUsername = await userRepository.findOne({where: {username}});
        if (existingUsername) {
          throw new AppError('Username already exists', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.ALREADY_EXISTS);
        }
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);
      
      const userRole = UserRole.PLAYER;
      
      // Create user
      const user = userRepository.create({
        id: generateId('usr'),
        email,
        username: username || email.split('@')[0], // Use username or derive from email
        passwordHash,
        firstName,
        lastName,
        phone: phone || null,
        role: userRole,
        isActive: true,
        gdprConsent: true,
        lastLogin: new Date(),
      });
      
      await userRepository.save(user);
      
      // Generate JWT token for auto-login
      const token = jwt.sign(
        {id: user.id, email: user.email, role: user.role},
        config.jwt.secret,
        {expiresIn: config.jwt.expiresIn as unknown as number}
      );
      const refreshToken = AuthController.buildRefreshToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });
      
      // Return token and user data
      res.status(HTTP_STATUS.CREATED).json({
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          idDocument: user.idDocument,
          ranking: user.ranking,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * POST /api/auth/refresh
   * Refreshes JWT token.
   */
  public async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {refreshToken} = req.body;

      if (!refreshToken) {
        throw new AppError('Refresh token is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }
      
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as {
        id: string;
        email: string;
        role: UserRole;
      };
      
      const token = jwt.sign(
        {id: decoded.id, email: decoded.email, role: decoded.role},
        config.jwt.secret,
        {expiresIn: config.jwt.expiresIn as unknown as number}
      );
      const rotatedRefreshToken = AuthController.buildRefreshToken({
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      });
      
      res.status(HTTP_STATUS.OK).json({
        token,
        refreshToken: rotatedRefreshToken,
        expiresIn: 1800,
      });
    } catch (error) {
      next(new AppError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.TOKEN_EXPIRED));
    }
  }
  
  /**
   * POST /api/auth/logout
   * Logs out user (client-side token removal).
   */
  public async logout(req: Request, res: Response): Promise<void> {
    res.status(HTTP_STATUS.NO_CONTENT).send();
  }
}
