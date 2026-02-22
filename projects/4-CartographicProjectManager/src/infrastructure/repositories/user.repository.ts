/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file src/infrastructure/repositories/user.repository.ts
 * @desc User repository implementation using HTTP API backend communication
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {httpClient} from '../http';
import {User} from '../../domain/entities/user';
import {type UserRole} from '../../domain/enumerations/user-role';
import {type IUserRepository} from '../../domain/repositories/user-repository.interface';
import type {
  UserDataDto,
  UserSummaryDto,
  CreateUserDto,
  UpdateUserDto,
  UserFilterDto,
  CreateUserResultDto,
  UpdateUserResultDto,
  DeleteUserResultDto,
} from '../../application/dto/user-data.dto';

/**
 * API response type for user data from backend
 */
interface UserApiResponse {
  id: string;
  username: string;
  email: string;
  passwordHash?: string; // Optional - backend removes it for security
  role: string;
  phone: string | null;
  whatsappEnabled: boolean;
  createdAt: string;
  lastLogin: string | null;
}

/**
 * User repository implementation using HTTP API.
 *
 * Handles communication with the backend REST API for user-related
 * data operations. Maps API responses to domain User entities.
 *
 * @example
 * ```typescript
 * const repository = new UserRepository();
 * const user = await repository.findById('user_001');
 * ```
 */
export class UserRepository implements IUserRepository {
  private readonly baseUrl = '/users';

  /**
   * Find user by unique identifier
   *
   * @param id - User ID
   * @returns User entity or null if not found
   */
  public async findById(id: string): Promise<User | null> {
    try {
      const response = await httpClient.get<UserApiResponse>(
        `${this.baseUrl}/${id}`,
      );
      return this.mapToEntity(response.data);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Find user by email address
   *
   * @param email - User email
   * @returns User entity or null if not found
   */
  public async findByEmail(email: string): Promise<User | null> {
    try {
      const response = await httpClient.get<UserApiResponse>(
        `${this.baseUrl}/email/${encodeURIComponent(email)}`,
      );
      return this.mapToEntity(response.data);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Find user by username
   *
   * @param username - Username to search
   * @returns User entity or null if not found
   */
  public async findByUsername(username: string): Promise<User | null> {
    try {
      const response = await httpClient.get<UserApiResponse>(
        `${this.baseUrl}/username/${encodeURIComponent(username)}`,
      );
      return this.mapToEntity(response.data);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create new user
   *
   * @param user - User entity to persist
   * @returns Created user with generated ID
   */
  public async save(user: User): Promise<User> {
    const response = await httpClient.post<UserApiResponse>(
      this.baseUrl,
      this.mapToApiRequest(user),
    );
    return this.mapToEntity(response.data);
  }

  /**
   * Update existing user
   *
   * @param user - User entity with updated data
   * @returns Updated user entity
   */
  public async update(user: User): Promise<User> {
    const response = await httpClient.put<UserApiResponse>(
      `${this.baseUrl}/${user.id}`,
      this.mapToApiRequest(user),
    );
    return this.mapToEntity(response.data);
  }

  /**
   * Delete user by ID
   *
   * @param id - User ID to delete
   */
  public async delete(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Find all users by role
   *
   * @param role - User role filter
   * @returns Array of users with specified role
   */
  public async findByRole(role: UserRole): Promise<User[]> {
    const response = await httpClient.get<UserApiResponse[]>(
      `${this.baseUrl}?role=${role}`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find all users in the system
   *
   * @returns Array of all users
   */
  public async findAll(): Promise<User[]> {
    const response = await httpClient.get<UserApiResponse[]>(this.baseUrl);
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Check if user exists by email
   *
   * @param email - Email to check
   * @returns True if user exists
   */
  public async existsByEmail(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }

  /**
   * Check if user exists by username
   *
   * @param username - Username to check
   * @returns True if user exists
   */
  public async existsByUsername(username: string): Promise<boolean> {
    const user = await this.findByUsername(username);
    return user !== null;
  }

  /**
   * Map API response to User entity
   *
   * @param data - API response data
   * @returns User domain entity
   */
  private mapToEntity(data: UserApiResponse): User {
    return new User({
      id: data.id,
      username: data.username,
      email: data.email,
      // Backend removes passwordHash for security, use placeholder for read operations
      passwordHash: data.passwordHash || '[REDACTED]',
      role: data.role as UserRole,
      phone: data.phone,
      whatsappEnabled: data.whatsappEnabled,
      createdAt: new Date(data.createdAt),
      lastLogin: data.lastLogin ? new Date(data.lastLogin) : null,
    });
  }

  /**
   * Map User entity to API request payload
   * 
   * @deprecated This method should not be used. Use DTOs instead.
   * @param user - User domain entity
   * @returns API request payload
   */
  private mapToApiRequest(user: User): Record<string, unknown> {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      // passwordHash is private and should never be sent in update requests
      role: user.role,
      phone: user.phone,
      whatsappEnabled: user.whatsappEnabled,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString() || null,
    };
  }

  /**
   * Check if error is 404 Not Found
   *
   * @param error - Error object
   * @returns True if 404 error
   */
  private isNotFoundError(error: unknown): boolean {
    return (error as {status?: number})?.status === 404;
  }

  // ============================================
  // DTO-based methods for UI management
  // ============================================

  /**
   * Get all users as DTOs with optional filtering
   *
   * @param filters - Optional filter criteria
   * @returns Array of user summary DTOs
   */
  public async getAllUsers(filters?: UserFilterDto): Promise<UserSummaryDto[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.role) params.append('role', filters.role);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.activeOnly) params.append('activeOnly', 'true');

      const queryString = params.toString();
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

      const response = await httpClient.get<UserApiResponse[]>(url);
      
      return response.data.map((user) => this.mapToSummaryDto(user));
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  }

  /**
   * Get user by ID as DTO
   *
   * @param id - User ID
   * @returns User data DTO or null
   */
  public async getUserById(id: string): Promise<UserDataDto | null> {
    try {
      const response = await httpClient.get<UserApiResponse>(
        `${this.baseUrl}/${id}`,
      );
      return this.mapToDataDto(response.data);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create new user from DTO
   *
   * @param userData - User creation data
   * @returns Creation result
   */
  public async createUser(userData: CreateUserDto): Promise<CreateUserResultDto> {
    try {
      const response = await httpClient.post<UserApiResponse>(
        this.baseUrl,
        userData,
      );

      return {
        success: true,
        user: this.mapToDataDto(response.data),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create user',
      };
    }
  }

  /**
   * Update user from DTO
   *
   * @param id - User ID
   * @param userData - Updated user data
   * @returns Update result
   */
  public async updateUser(id: string, userData: UpdateUserDto): Promise<UpdateUserResultDto> {
    try {
      const response = await httpClient.put<UserApiResponse>(
        `${this.baseUrl}/${id}`,
        userData,
      );

      return {
        success: true,
        user: this.mapToDataDto(response.data),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update user',
      };
    }
  }

  /**
   * Delete user by ID
   *
   * @param id - User ID
   * @returns Deletion result
   */
  public async deleteUser(id: string): Promise<DeleteUserResultDto> {
    try {
      await httpClient.delete(`${this.baseUrl}/${id}`);
      return {success: true};
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to delete user',
      };
    }
  }

  /**
   * Map API response to UserDataDto
   *
   * @param data - API response
   * @returns User data DTO
   */
  private mapToDataDto(data: UserApiResponse): UserDataDto {
    return {
      id: data.id,
      username: data.username,
      email: data.email,
      role: data.role as UserRole,
      phone: data.phone,
      whatsappEnabled: data.whatsappEnabled,
      createdAt: new Date(data.createdAt),
      lastLogin: data.lastLogin ? new Date(data.lastLogin) : null,
    };
  }

  /**
   * Map API response to UserSummaryDto
   *
   * @param data - API response
   * @returns User summary DTO
   */
  private mapToSummaryDto(data: UserApiResponse): UserSummaryDto {
    return {
      id: data.id,
      username: data.username,
      email: data.email,
      role: data.role as UserRole,
      phone: data.phone,
      lastLogin: data.lastLogin ? new Date(data.lastLogin) : null,
    };
  }
}
