/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file src/infrastructure/repositories/auth.repository.ts
 * @desc Authentication repository for login, register, and session management
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import axios, {type AxiosInstance} from 'axios';
import {API} from '../../shared/constants';
import type {LoginCredentialsDto, RegisterCredentialsDto} from '../../application/dto';
import type {UserRole} from '../../domain/enumerations/user-role';

/**
 * API response for authentication operations
 */
interface AuthApiResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      username: string;
      email: string;
      role: UserRole;
      phone: string | null;
      createdAt: string;
      lastLogin: string | null;
    };
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}

/**
 * Authentication repository for backend API communication.
 *
 * Handles user authentication operations including login, registration,
 * and session management without requiring pre-authenticated tokens.
 *
 * @example
 * ```typescript
 * const authRepo = new AuthRepository();
 * const result = await authRepo.login({
 *   email: 'user@example.com',
 *   password: 'password123'
 * });
 * ```
 */
export class AuthRepository {
  private readonly axiosInstance: AxiosInstance;
  private readonly baseUrl = '/auth';

  constructor() {
    // Create a separate axios instance without auth interceptors
    this.axiosInstance = axios.create({
      baseURL: API.BASE_URL,
      timeout: API.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Authenticate user with email and password
   *
   * @param credentials - Login credentials
   * @returns Authentication response with user and tokens
   */
  public async login(credentials: LoginCredentialsDto): Promise<AuthApiResponse> {
    const response = await this.axiosInstance.post<AuthApiResponse>(
      `${this.baseUrl}/login`,
      credentials
    );
    return response.data;
  }

  /**
   * Register a new user account
   *
   * @param credentials - Registration credentials
   * @returns Authentication response with user and tokens
   */
  public async register(credentials: RegisterCredentialsDto): Promise<AuthApiResponse> {
    const response = await this.axiosInstance.post<AuthApiResponse>(
      `${this.baseUrl}/register`,
      {
        username: credentials.username,
        email: credentials.email,
        password: credentials.password,
        phone: credentials.phone,
      }
    );
    return response.data;
  }

  /**
   * Logout user and invalidate session
   *
   * @param token - Access token for authorization
   */
  public async logout(token: string): Promise<void> {
    await this.axiosInstance.post(
      `${this.baseUrl}/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  /**
   * Refresh access token using refresh token
   *
   * @param refreshToken - Refresh token
   * @returns New authentication response
   */
  public async refreshToken(refreshToken: string): Promise<AuthApiResponse> {
    const response = await this.axiosInstance.post<AuthApiResponse>(
      `${this.baseUrl}/refresh`,
      {refreshToken}
    );
    return response.data;
  }
}
