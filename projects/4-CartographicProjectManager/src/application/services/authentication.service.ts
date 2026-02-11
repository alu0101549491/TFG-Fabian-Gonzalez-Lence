/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file application/services/authentication.service.ts
 * @desc Service implementation for user authentication and session management.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {
  type LoginCredentialsDto,
  type AuthResultDto,
  type SessionDto,
  type ValidationResultDto,
  createSuccessAuthResult,
  createFailedAuthResult,
  AuthErrorCode,
  validResult,
  invalidResult,
  createError,
} from '../dto';
import {IAuthenticationService} from '../interfaces/authentication-service.interface';
import {type IUserRepository} from '../../domain/repositories';
import {UnauthorizedError, NotFoundError, ValidationError} from './common/errors';
import {generateId} from './common/utils';
import {UserRole} from '../../domain/enumerations/user-role';

/**
 * Implementation of authentication operations.
 * Handles user login, session management, password changes, and security controls.
 */
export class AuthenticationService implements IAuthenticationService {
  // Track failed login attempts (email -> count)
  private readonly failedAttempts = new Map<string, number>();
  // Track account lockout timestamps (email -> unlock time)
  private readonly lockedAccounts = new Map<string, Date>();
  // Track password reset tokens (token -> {userId, expiry})
  private readonly resetTokens = new Map<string, {userId: string; expiry: Date}>();
  // Track active sessions (token -> session)
  private readonly activeSessions = new Map<string, SessionDto>();
  
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes
  private readonly RESET_TOKEN_DURATION_MS = 60 * 60 * 1000; // 1 hour
  private readonly SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
  private readonly PASSWORD_MIN_LENGTH = 8;

  constructor(
    private readonly userRepository: IUserRepository
  ) {}

  /**
   * Authenticates a user with their credentials.
   */
  public async login(credentials: LoginCredentialsDto): Promise<AuthResultDto> {
    const {usernameOrEmail, password} = credentials;

    // Check if account is locked
    const lockoutEnd = this.lockedAccounts.get(usernameOrEmail);
    if (lockoutEnd && lockoutEnd > new Date()) {
      const remainingMinutes = Math.ceil((lockoutEnd.getTime() - Date.now()) / 60000);
      return createFailedAuthResult(
        `Account locked due to multiple failed login attempts. Try again in ${remainingMinutes} minutes.`,
        AuthErrorCode.ACCOUNT_LOCKED
      );
    }

    // Find user by username or email
    const user = await this.userRepository.findByUsernameOrEmail(usernameOrEmail);
    if (!user) {
      await this.recordFailedAttempt(usernameOrEmail);
      return createFailedAuthResult(
        'Invalid credentials',
        AuthErrorCode.INVALID_CREDENTIALS
      );
    }

    // TODO: Implement password verification with bcrypt
    // For now, use placeholder comparison
    const isPasswordValid = await this.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      await this.recordFailedAttempt(usernameOrEmail);
      return createFailedAuthResult(
        'Invalid credentials',
        AuthErrorCode.INVALID_CREDENTIALS
      );
    }

    // Clear failed attempts on successful login
    this.failedAttempts.delete(usernameOrEmail);
    this.lockedAccounts.delete(usernameOrEmail);

    // Generate tokens
    const token = this.generateToken(user.id);
    const refreshToken = this.generateToken(user.id, true);

    // Create session
    const session: SessionDto = {
      userId: user.id,
      token,
      refreshToken,
      expiresAt: new Date(Date.now() + this.SESSION_DURATION_MS),
      createdAt: new Date(),
      role: user.role,
    };

    this.activeSessions.set(token, session);

    // Map user to DTO
    const userDto = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return createSuccessAuthResult(userDto, token, refreshToken);
  }

  /**
   * Terminates the authenticated session for a user.
   */
  public async logout(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    // Remove all sessions for this user
    for (const [token, session] of this.activeSessions.entries()) {
      if (session.userId === userId) {
        this.activeSessions.delete(token);
      }
    }
  }

  /**
   * Validates an existing session token.
   */
  public async validateSession(token: string): Promise<SessionDto> {
    const session = this.activeSessions.get(token);
    
    if (!session) {
      throw new UnauthorizedError('Invalid session token');
    }

    if (session.expiresAt < new Date()) {
      this.activeSessions.delete(token);
      throw new UnauthorizedError('Session expired');
    }

    // Verify user still exists and is active
    const user = await this.userRepository.findById(session.userId);
    if (!user || !user.isActive) {
      this.activeSessions.delete(token);
      throw new UnauthorizedError('User account is not active');
    }

    return session;
  }

  /**
   * Refreshes an existing session using a refresh token.
   */
  public async refreshSession(refreshToken: string): Promise<AuthResultDto> {
    // TODO: Implement JWT refresh token verification
    // For now, find session by refresh token
    let foundSession: SessionDto | null = null;
    
    for (const session of this.activeSessions.values()) {
      if (session.refreshToken === refreshToken) {
        foundSession = session;
        break;
      }
    }

    if (!foundSession) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Get user
    const user = await this.userRepository.findById(foundSession.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User account is not active');
    }

    // Generate new tokens
    const newToken = this.generateToken(user.id);
    const newRefreshToken = this.generateToken(user.id, true);

    // Create new session
    const newSession: SessionDto = {
      userId: user.id,
      token: newToken,
      refreshToken: newRefreshToken,
      expiresAt: new Date(Date.now() + this.SESSION_DURATION_MS),
      createdAt: new Date(),
      role: user.role,
    };

    // Remove old session
    this.activeSessions.delete(foundSession.token);
    this.activeSessions.set(newToken, newSession);

    const userDto = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return createSuccessAuthResult(userDto, newToken, newRefreshToken);
  }

  /**
   * Changes a user's password after validating the old password.
   */
  public async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<ValidationResultDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    // Verify old password
    const isOldPasswordValid = await this.verifyPassword(oldPassword, user.passwordHash);
    if (!isOldPasswordValid) {
      return invalidResult([
        createError('oldPassword', 'Current password is incorrect', 'INVALID_PASSWORD'),
      ]);
    }

    // Validate new password
    const validation = this.validatePassword(newPassword);
    if (!validation.isValid) {
      return validation;
    }

    // TODO: Hash password with bcrypt
    const newPasswordHash = await this.hashPassword(newPassword);
    user.passwordHash = newPasswordHash;
    user.updatedAt = new Date();

    await this.userRepository.save(user);

    return validResult();
  }

  /**
   * Initiates a password reset process by sending a reset link.
   */
  public async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findByUsernameOrEmail(email);
    if (!user) {
      throw new NotFoundError(`No account found with email ${email}`);
    }

    // Generate reset token
    const resetToken = generateId();
    const expiry = new Date(Date.now() + this.RESET_TOKEN_DURATION_MS);

    this.resetTokens.set(resetToken, {
      userId: user.id,
      expiry,
    });

    // TODO: Send email with reset link
    // await emailService.sendPasswordResetEmail(user.email, resetToken);
    console.log(`Password reset token for ${email}: ${resetToken}`);
  }

  /**
   * Resets a user's password using a valid reset token.
   */
  public async resetPassword(
    token: string,
    newPassword: string
  ): Promise<ValidationResultDto> {
    const resetData = this.resetTokens.get(token);
    
    if (!resetData) {
      throw new UnauthorizedError('Invalid or expired reset token');
    }

    if (resetData.expiry < new Date()) {
      this.resetTokens.delete(token);
      throw new UnauthorizedError('Reset token has expired');
    }

    // Validate new password
    const validation = this.validatePassword(newPassword);
    if (!validation.isValid) {
      return validation;
    }

    // Get user and update password
    const user = await this.userRepository.findById(resetData.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const newPasswordHash = await this.hashPassword(newPassword);
    user.passwordHash = newPasswordHash;
    user.updatedAt = new Date();

    await this.userRepository.save(user);

    // Remove reset token
    this.resetTokens.delete(token);

    // Invalidate all sessions for this user
    for (const [sessionToken, session] of this.activeSessions.entries()) {
      if (session.userId === user.id) {
        this.activeSessions.delete(sessionToken);
      }
    }

    return validResult();
  }

  /**
   * Retrieves the number of failed login attempts for an account.
   */
  public async getFailedLoginAttempts(email: string): Promise<number> {
    const user = await this.userRepository.findByUsernameOrEmail(email);
    if (!user) {
      throw new NotFoundError(`No account found with email ${email}`);
    }

    return this.failedAttempts.get(email) || 0;
  }

  /**
   * Clears failed login attempts for an account.
   */
  public async clearFailedLoginAttempts(email: string): Promise<void> {
    const user = await this.userRepository.findByUsernameOrEmail(email);
    if (!user) {
      throw new NotFoundError(`No account found with email ${email}`);
    }

    this.failedAttempts.delete(email);
    this.lockedAccounts.delete(email);
  }

  /**
   * Records a failed login attempt and locks account if threshold exceeded.
   */
  private async recordFailedAttempt(email: string): Promise<void> {
    const currentAttempts = this.failedAttempts.get(email) || 0;
    const newAttempts = currentAttempts + 1;
    
    this.failedAttempts.set(email, newAttempts);

    if (newAttempts >= this.MAX_FAILED_ATTEMPTS) {
      const lockoutEnd = new Date(Date.now() + this.LOCKOUT_DURATION_MS);
      this.lockedAccounts.set(email, lockoutEnd);
    }
  }

  /**
   * Validates password requirements.
   */
  private validatePassword(password: string): ValidationResultDto {
    const errors = [];

    if (password.length < this.PASSWORD_MIN_LENGTH) {
      errors.push(
        createError(
          'password',
          `Password must be at least ${this.PASSWORD_MIN_LENGTH} characters`,
          'PASSWORD_TOO_SHORT'
        )
      );
    }

    if (!/[A-Z]/.test(password)) {
      errors.push(
        createError('password', 'Password must contain at least one uppercase letter', 'NO_UPPERCASE')
      );
    }

    if (!/[a-z]/.test(password)) {
      errors.push(
        createError('password', 'Password must contain at least one lowercase letter', 'NO_LOWERCASE')
      );
    }

    if (!/[0-9]/.test(password)) {
      errors.push(
        createError('password', 'Password must contain at least one digit', 'NO_DIGIT')
      );
    }

    return errors.length > 0 ? invalidResult(errors) : validResult();
  }

  /**
   * Generates a session or refresh token.
   * TODO: Implement with JWT library
   */
  private generateToken(userId: string, isRefresh = false): string {
    const type = isRefresh ? 'refresh' : 'access';
    return `${type}_${userId}_${generateId()}`;
  }

  /**
   * Verifies a password against its hash.
   * TODO: Implement with bcrypt
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    // Placeholder: In production, use bcrypt.compare(password, hash)
    return password === hash; // Temporary for testing
  }

  /**
   * Hashes a password.
   * TODO: Implement with bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    // Placeholder: In production, use bcrypt.hash(password, saltRounds)
    return password; // Temporary for testing
  }
}
