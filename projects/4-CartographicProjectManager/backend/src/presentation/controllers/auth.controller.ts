/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence < alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file backend/src/presentation/controllers/auth.controller.ts
 * @desc Authentication controller handling login and registration
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {Request, Response, NextFunction} from 'express';
import {AuthService} from '@application/services/auth.service.js';
import {AuditService} from '@application/services/audit.service.js';
import {AuditLogRepository} from '@infrastructure/repositories/audit-log.repository.js';
import {PrismaClient} from '@prisma/client';
import {sendSuccess, sendError} from '@shared/utils.js';
import {HTTP_STATUS} from '@shared/constants.js';

const prisma = new PrismaClient();
const auditLogRepository = new AuditLogRepository(prisma);

/**
 * Authentication controller
 */
export class AuthController {
  private readonly authService: AuthService;
  private readonly auditService: AuditService;

  public constructor() {
    this.authService = new AuthService();
    this.auditService = new AuditService(auditLogRepository);
  }

  /**
   * POST /api/v1/auth/register
   * Register new user
   */
  public async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {username, email, password, role, phone} = req.body;
      const result = await this.authService.register({
        username,
        email,
        password,
        role,
        phone,
      });
      
      // Log user creation in audit trail
      await this.auditService.logUserCreation(
        result.user.id,
        result.user.id,
        result.user.username,
        result.user.role,
        req
      );
      
      sendSuccess(res, result, 'User registered successfully', HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/login
   * Login user
   */
  public async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {email, password} = req.body;
      const result = await this.authService.login(email, password);
      
      // Log login in audit trail
      await this.auditService.logLogin(
        result.user.id,
        result.user.username,
        req
      );
      
      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Logout user
   */
  public async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Log logout in audit trail if user is authenticated
      if ((req as any).user) {
        await this.auditService.logLogout(
          (req as any).user.userId,
          (req as any).user.email,
          req
        );
      }
      
      sendSuccess(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token
   */
  public async refresh(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {refreshToken} = req.body;
      const result = await this.authService.refresh(refreshToken);
      sendSuccess(res, result, 'Token refreshed');
    } catch (error) {
      next(error);
    }
  }
}
