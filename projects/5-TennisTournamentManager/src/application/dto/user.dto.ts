/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file application/dto/user.dto.ts
 * @desc Data transfer objects for user-related operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {UserRole} from '@domain/enumerations/user-role';

/** DTO for user login. */
export interface LoginDto {
  email: string;
  password: string;
}

/** DTO for user registration. */
export interface RegisterUserDto {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone?: string;
  gdprConsent: boolean;
}

/** DTO for updating a user profile. */
export interface UpdateUserDto {
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
}

/** DTO for authentication response. */
export interface AuthResponseDto {
  token: string;
  user: UserDto;
}

/** DTO for user output representation. */
export interface UserDto {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  phone: string | null;
  createdAt: Date;
  lastLogin: Date | null;
}
