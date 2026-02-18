/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence < alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file src/presentation/controllers/auth.controller.ts
 * @desc Authentication controller handling login and registration
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {Request, Response, NextFunction} from 'express';
import {AuthService} from '@application/services/auth.service.js';
import {sendSuccess, sendError} from '@shared/utils.js';
import {HTTP_STATUS} from '@shared/constants.js';

/**
 * Authentication controller
 */
export class AuthController {
  private readonly authService: AuthService;

  public constructor() {
    this.authService = new AuthService();
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
      sendSuccess(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }
}
