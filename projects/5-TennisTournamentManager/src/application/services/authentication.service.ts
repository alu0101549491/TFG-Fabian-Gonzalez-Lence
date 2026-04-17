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
 * @see {@link https://typescripttutorial.net}
 */

import {Injectable, inject} from '@angular/core';
import {IAuthenticationService} from '../interfaces/authentication-service.interface';
import {RegisterUserDto, AuthResponseDto, UserDto} from '../dto';
import {AxiosClient} from '@infrastructure/http/axios-client';

/**
 * Decodes a JWT payload segment encoded with base64url rules.
 *
 * @param segment - Encoded JWT segment without URL-unsafe characters
 * @returns Decoded UTF-8 payload string ready for JSON parsing
 */
function decodeBase64UrlSegment(segment: string): string {
  const normalizedSegment = segment.replace(/-/g, '+').replace(/_/g, '/');
  const paddingLength = (4 - (normalizedSegment.length % 4)) % 4;
  return atob(`${normalizedSegment}${'='.repeat(paddingLength)}`);
}

/**
 * Authentication service implementation.
 * Handles user authentication, registration, and JWT token management.
 */
@Injectable({providedIn: 'root'})
export class AuthenticationService implements IAuthenticationService {
  /** HTTP client for making API requests */
  private readonly httpClient = inject(AxiosClient);

  /**
   * Authenticates a user and returns a JWT token.
   *
   * @param username - User's email (username field accepts email)
   * @param password - User's password
   * @returns Authentication response with token and user data
   */
  public async login(username: string, password: string): Promise<AuthResponseDto> {
    // Validate input
    if (!username || username.trim().length === 0) {
      throw new Error('Email is required');
    }
    
    if (!password || password.length === 0) {
      throw new Error('Password is required');
    }
    
    try {
      // Call backend auth endpoint
      const response = await this.httpClient.post<AuthResponseDto>('/auth/login', {
        email: username, // Backend expects 'email' field
        password,
      });
      
      return response;
    } catch (error: any) {
      // Handle HTTP errors
      if (error.response?.status === 401) {
        throw new Error('Invalid credentials');
      }
      if (error.response?.status === 403) {
        throw new Error('Account is disabled');
      }
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  /**
   * Registers a new user account and automatically logs them in.
   *
   * @param data - User registration data
   * @returns Authentication response with token and user data
   */
  public async register(data: RegisterUserDto): Promise<AuthResponseDto> {
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
    
    try {
      // Call backend auth endpoint
      const response = await this.httpClient.post<AuthResponseDto>('/auth/register', {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        phone: data.phone || null,
      });
      
      return response;
    } catch (error: any) {
      // Handle HTTP errors
      if (error.response?.status === 400) {
        const message = error.response?.data?.message;
        if (message?.includes('Email already exists')) {
          throw new Error('Email is already registered');
        }
        if (message?.includes('Username already exists')) {
          throw new Error('Username is already taken');
        }
      }
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
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
    
    // For JWT tokens, validation is typically done via token expiration
    // In a more complete implementation, you might call a backend endpoint
    // to verify the token's validity
    try {
      // Basic structure check (JWT has 3 parts separated by dots)
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }
      
      // Decode payload to check expiration
      const payload = JSON.parse(decodeBase64UrlSegment(parts[1]));
      if (!payload.exp) {
        return false;
      }
      
      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
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
    // With stateless JWT tokens, logout is typically handled client-side
    // by removing the token from storage. This method calls the backend
    // logout endpoint if server-side session invalidation is needed.
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required for logout');
    }
    
    try {
      await this.httpClient.post('/auth/logout', {userId});
    } catch (error) {
      // Logout endpoint may not be critical - silently fail
      console.warn('Logout endpoint call failed:', error);
    }
  }
}
