/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file src/application/services/auth.service.ts
 * @desc Authentication service for user login and registration
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {User} from '@prisma/client';
import {UserRepository} from '@infrastructure/repositories/user.repository.js';
import {hashPassword, verifyPassword} from '@infrastructure/auth/password.service.js';
import {generateAccessToken, generateRefreshToken} from '@infrastructure/auth/jwt.service.js';
import {UnauthorizedError, ConflictError, BadRequestError} from '@shared/errors.js';

/**
 * Authentication service
 */
export class AuthService {
  private readonly userRepository: UserRepository;

  public constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Register new user
   *
   * @param data - User registration data
   * @returns Created user and tokens
   */
  public async register(data: {
    username: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
  }): Promise<{user: Omit<User, 'passwordHash'>; accessToken: string; refreshToken: string}> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await this.userRepository.create({
      username: data.username,
      email: data.email,
      passwordHash,
      role: data.role as any,
      phone: data.phone ?? null,
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password hash from response
    const {passwordHash: _, ...userWithoutPassword} = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user
   *
   * @param email - User email
   * @param password - User password
   * @returns User and tokens
   */
  public async login(email: string, password: string): Promise<{
    user: Omit<User, 'passwordHash'>;
    accessToken: string;
    refreshToken: string;
  }> {
    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.id);

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password hash from response
    const {passwordHash: _, ...userWithoutPassword} = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }
}
