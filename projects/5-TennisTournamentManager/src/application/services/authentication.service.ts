/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/services/authentication.service.ts
 * @desc Authentication service implementation for user authentication and token management
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {IAuthenticationService} from '../interfaces/authentication-service.interface';
import {RegisterUserDto, AuthResponseDto, UserDto} from '../dto';
import {IUserRepository} from '@domain/repositories/user-repository.interface';
import {User} from '@domain/entities/user';
import {UserRole} from '@domain/enumerations/user-role';
import {generateId} from '@shared/utils';

/**
 * Authentication service implementation.
 * Handles user authentication, registration, and JWT token management.
 */
export class AuthenticationService implements IAuthenticationService {
  /**
   * Creates a new AuthenticationService instance.
   *
   * @param userRepository - User repository for user data access
   */
  public constructor(
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Authenticates a user and returns a JWT token.
   *
   * @param username - User's username
   * @param password - User's password
   * @returns Authentication response with token and user data
   */
  public async login(username: string, password: string): Promise<AuthResponseDto> {
    // Validate input
    if (!username || username.trim().length === 0) {
      throw new Error('Username is required');
    }
    
    if (!password || password.length === 0) {
      throw new Error('Password is required');
    }
    
    // Find user by username or email
    let user = await this.userRepository.findByUsername(username);
    if (!user) {
      user = await this.userRepository.findByEmail(username);
    }
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Check if user is active
    if (!user.isActive) {
      throw new Error('User account is inactive');
    }
    
    // Verify password (in real implementation, use bcrypt.compare)
    // For now, this is a placeholder - actual bcrypt comparison should be done here
    const isPasswordValid = user.authenticate(password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }
    
    // Generate JWT token (in real implementation, use jsonwebtoken library)
    const token = this.generateToken(user);
    
    // Map user to DTO
    const userDto = this.mapUserToDto(user);
    
    return {
      token,
      user: userDto,
    };
  }

  /**
   * Registers a new user account.
   *
   * @param data - User registration data
   * @returns Created user information
   */
  public async register(data: RegisterUserDto): Promise<UserDto> {
    // Validate input
    if (!data.email || !data.email.includes('@')) {
      throw new Error('Valid email is required');
    }
    
    if (!data.password || data.password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    if (!data.gdprConsent) {
      throw new Error('GDPR consent is required');
    }
    
    // Check if user already exists
    const existingUserByEmail = await this.userRepository.findByEmail(data.email);
    if (existingUserByEmail) {
      throw new Error('Email is already registered');
    }
    
    const existingUserByUsername = await this.userRepository.findByUsername(data.username);
    if (existingUserByUsername) {
      throw new Error('Username is already taken');
    }
    
    // Hash password (in real implementation, use bcrypt.hash with salt >= 12)
    const passwordHash = this.hashPassword(data.password);
    
    // Create user entity
    const user = new User({
      id: generateId(),
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      passwordHash,
      role: UserRole.REGISTERED_PARTICIPANT,
      phone: data.phone || null,
      gdprConsent: data.gdprConsent,
      isActive: true,
    });
    
    // Save user
    const savedUser = await this.userRepository.save(user);
    
    // Map to DTO
    return this.mapUserToDto(savedUser);
  }

  /**
   * Validates a session token.
   *
   * @param token - Session token to validate
   * @returns True if the session is valid, false otherwise
   */
  public async validateSession(token: string): Promise<boolean> {
    if (!token || token.trim().length === 0) {
      return false;
    }
    
    try {
      // In real implementation, use jsonwebtoken.verify()
      // For now, basic validation
      const payload = this.verifyToken(token);
      if (!payload || !payload.userId) {
        return false;
      }
      
      // Check if user still exists and is active
      const user = await this.userRepository.findById(payload.userId);
      if (!user || !user.isActive) {
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Logs out the current user and invalidates the session.
   *
   * @param userId - ID of the user to log out
   */
  public async logout(userId: string): Promise<void> {
    // In a real implementation with Redis or database session storage,
    // you would invalidate the token here. With stateless JWT, we rely
    // on token expiration. This method is a placeholder for future
    // session management features.
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required for logout');
    }
    
    // Placeholder for session invalidation logic
    // In production: add token to blacklist or remove from session store
  }

  /**
   * Refreshes an expiring JWT token.
   *
   * @param token - Current token to refresh
   * @returns New authentication response with refreshed token
   */
  public async refreshToken(token: string): Promise<AuthResponseDto> {
    if (!token || token.trim().length === 0) {
      throw new Error('Token is required for refresh');
    }
    
    // Verify current token
    const payload = this.verifyToken(token);
    if (!payload || !payload.userId) {
      throw new Error('Invalid token');
    }
    
    // Get user
    const user = await this.userRepository.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }
    
    // Generate new token
    const newToken = this.generateToken(user);
    const userDto = this.mapUserToDto(user);
    
    return {
      token: newToken,
      user: userDto,
    };
  }

  /**
   * Generates a JWT token for the user.
   * In real implementation, use jsonwebtoken library.
   *
   * @param user - User to generate token for
   * @returns JWT token string
   */
  private generateToken(user: User): string {
    // Placeholder implementation
    // In production, use: jwt.sign({ userId: user.id, role: user.role }, secret, { expiresIn: '1h' })
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      iat: Date.now(),
    };
    
    // Simple base64 encoding for demonstration (NOT secure for production)
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  /**
   * Verifies and decodes a JWT token.
   * In real implementation, use jsonwebtoken library.
   *
   * @param token - Token to verify
   * @returns Decoded token payload
   */
  private verifyToken(token: string): {userId: string, role: UserRole} | null {
    try {
      // Placeholder implementation
      // In production, use: jwt.verify(token, secret)
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  }

  /**
   * Hashes a password using bcrypt.
   * In real implementation, use bcrypt.hash with salt >= 12.
   *
   * @param password - Plain text password
   * @returns Hashed password
   */
  private hashPassword(password: string): string {
    // Placeholder implementation
    // In production, use: bcrypt.hashSync(password, 12)
    return `hashed_${password}_placeholder`;
  }

  /**
   * Maps a User entity to a UserDto.
   *
   * @param user - User entity
   * @returns User DTO
   */
  private mapUserToDto(user: User): UserDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      phone: user.phone,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };
  }
}
