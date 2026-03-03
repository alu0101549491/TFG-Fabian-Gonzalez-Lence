/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 20, 2026
 * @file src/application/dto/user-data.dto.ts
 * @desc DTOs for user management operations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

import type {UserRole} from '../../domain/enumerations/user-role';

/**
 * Complete user information DTO
 */
export interface UserDataDto {
  /** Unique user identifier */
  readonly id: string;
  /** Username */
  readonly username: string;
  /** Email address */
  readonly email: string;
  /** User role */
  readonly role: UserRole;
  /** Phone number */
  readonly phone: string | null;
  /** Account creation date */
  readonly createdAt: Date;
  /** Last login timestamp */
  readonly lastLogin: Date | null;
}

/**
 * User summary for list views
 */
export interface UserSummaryDto {
  /** Unique user identifier */
  readonly id: string;
  /** Username */
  readonly username: string;
  /** Email address */
  readonly email: string;
  /** User role */
  readonly role: UserRole;
  /** Phone number */
  readonly phone: string | null;
  /** Last login timestamp */
  readonly lastLogin: Date | null;
}

/**
 * DTO for creating a new user
 */
export interface CreateUserDto {
  /** Desired username */
  readonly username: string;
  /** Email address */
  readonly email: string;
  /** Password */
  readonly password: string;
  /** User role */
  readonly role: UserRole;
  /** Phone number (optional) */
  readonly phone?: string | null;
}

/**
 * DTO for updating user information
 */
export interface UpdateUserDto {
  /** Updated username */
  readonly username?: string;
  /** Updated email */
  readonly email?: string;
  /** Updated password */
  readonly password?: string;
  /** Updated role */
  readonly role?: UserRole;
  /** Updated phone */
  readonly phone?: string | null;
}

/**
 * User filter criteria
 */
export interface UserFilterDto {
  /** Filter by role */
  readonly role?: UserRole;
  /** Search in username/email */
  readonly search?: string;
  /** Only active users (logged in last 30 days) */
  readonly activeOnly?: boolean;
}

/**
 * Paginated user list response
 */
export interface UserListResponseDto {
  /** List of users */
  readonly users: UserSummaryDto[];
  /** Total count */
  readonly total: number;
  /** Current page */
  readonly page: number;
  /** Items per page */
  readonly limit: number;
  /** Total pages */
  readonly totalPages: number;
}

/**
 * Result of user creation
 */
export interface CreateUserResultDto {
  /** Whether operation was successful */
  readonly success: boolean;
  /** Created user */
  readonly user?: UserDataDto;
  /** Error message */
  readonly error?: string;
}

/**
 * Result of user update
 */
export interface UpdateUserResultDto {
  /** Whether operation was successful */
  readonly success: boolean;
  /** Updated user */
  readonly user?: UserDataDto;
  /** Error message */
  readonly error?: string;
}

/**
 * Result of user deletion
 */
export interface DeleteUserResultDto {
  /** Whether operation was successful */
  readonly success: boolean;
  /** Error message */
  readonly error?: string;
}
