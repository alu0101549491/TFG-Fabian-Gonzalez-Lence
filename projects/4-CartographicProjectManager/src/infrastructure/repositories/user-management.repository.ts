/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 10, 2026
 * @file src/infrastructure/repositories/user-management.repository.ts
 * @desc User management repository for admin/self user CRUD via backend HTTP API.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {httpClient} from '../http';
import type {
  CreateUserDto,
  UpdateUserDto,
  UserDataDto,
  UserFilterDto,
  UserSummaryDto,
} from '../../application/dto/user-data.dto';
import type {UserRole} from '../../domain/enumerations/user-role';

interface UserApiResponse {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  phone: string | null;
  createdAt: string;
  updatedAt?: string;
  lastLogin: string | null;
}

/**
 * Repository for administrator-oriented user operations.
 */
export class UserManagementRepository {
  private readonly baseUrl = '/users';

  /**
   * Fetch all users (optionally filtered).
   */
  public async getAllUsers(filters?: UserFilterDto): Promise<UserSummaryDto[]> {
    const params: Record<string, string> = {};

    if (filters?.role) {
      params.role = String(filters.role);
    }
    if (filters?.search) {
      params.search = filters.search;
    }
    if (filters?.activeOnly != null) {
      params.activeOnly = String(filters.activeOnly);
    }

    const url = this.buildUrlWithParams(this.baseUrl, params);
    const response = await httpClient.get<UserApiResponse[]>(url);
    return response.data.map((data) => this.mapToUserSummaryDto(data));
  }

  /**
   * Fetch a single user by id.
   */
  public async getUserById(id: string): Promise<UserDataDto> {
    const response = await httpClient.get<UserApiResponse>(`${this.baseUrl}/${id}`);
    return this.mapToUserDataDto(response.data);
  }

  /**
   * Create a new user (admin only).
   */
  public async createUser(data: CreateUserDto): Promise<UserDataDto> {
    const response = await httpClient.post<UserApiResponse>(this.baseUrl, data);
    return this.mapToUserDataDto(response.data);
  }

  /**
   * Update an existing user (admin or owner).
   */
  public async updateUser(id: string, data: UpdateUserDto): Promise<UserDataDto> {
    const response = await httpClient.put<UserApiResponse>(`${this.baseUrl}/${id}`, data);
    return this.mapToUserDataDto(response.data);
  }

  /**
   * Delete a user (admin or owner).
   */
  public async deleteUser(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/${id}`);
  }

  private buildUrlWithParams(baseUrl: string, params: Record<string, string>): string {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }

  private mapToUserSummaryDto(data: UserApiResponse): UserSummaryDto {
    return {
      id: data.id,
      username: data.username,
      email: data.email,
      role: data.role,
      phone: data.phone,
      lastLogin: data.lastLogin ? new Date(data.lastLogin) : null,
    };
  }

  private mapToUserDataDto(data: UserApiResponse): UserDataDto {
    return {
      ...this.mapToUserSummaryDto(data),
      createdAt: new Date(data.createdAt),
    };
  }
}
