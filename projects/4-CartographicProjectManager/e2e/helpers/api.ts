/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2026-03-13
 * @file e2e/helpers/api.ts
 * @desc Backend API helper for seeding/cleanup in Playwright E2E tests.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {APIRequestContext, APIResponse} from '@playwright/test';

export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}

export interface RegisterCredentials {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly phone?: string;
}

export interface AuthUser {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly role: string;
}

export interface AuthSession {
  readonly user: AuthUser;
  readonly accessToken: string;
  readonly refreshToken: string;
}

export interface UserDto {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly role: string;
  readonly isActive?: boolean;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly lastLogin?: string | null;
}

export interface CreateProjectPayload {
  readonly year: number;
  readonly code: string;
  readonly name: string;
  readonly clientId: string;
  readonly type: 'TOPOGRAPHY' | 'CARTOGRAPHY' | 'GIS' | 'CADASTRE' | 'OTHER';
  readonly coordinateX: number | null;
  readonly coordinateY: number | null;
  readonly contractDate: string;
  readonly deliveryDate: string;
}

export interface ProjectDto {
  readonly id: string;
  readonly code: string;
  readonly name: string;
}

export interface ProjectListDto {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly year?: number;
  readonly status?: string;
  readonly type?: string;
  readonly clientId?: string;
  readonly creatorId?: string;
}

export interface CreateTaskPayload {
  readonly projectId: string;
  readonly creatorId: string;
  readonly assigneeId: string;
  readonly description: string;
  readonly status: 'PENDING' | 'IN_PROGRESS' | 'PARTIAL' | 'PERFORMED' | 'COMPLETED';
  readonly priority: 'HIGH' | 'MEDIUM' | 'LOW';
  readonly dueDate: string;
  readonly comments: string | null;
}

export interface TaskDto {
  readonly id: string;
  readonly projectId: string;
  readonly description: string;
  readonly status: string;
}

interface BackendApiEnvelope<T> {
  readonly success: boolean;
  readonly data: T;
  readonly message?: string;
}

/**
 * Minimal API client for CPM backend.
 *
 * Uses Playwright's `APIRequestContext` and adds `Authorization` headers.
 */
export class CpmApiClient {
  private readonly request: APIRequestContext;
  private readonly accessToken: string;

  public constructor(request: APIRequestContext, accessToken: string) {
    this.request = request;
    this.accessToken = accessToken;
  }

  public static async login(
    request: APIRequestContext,
    credentials: LoginCredentials,
  ): Promise<{client: CpmApiClient; session: AuthSession}> {
    const response = await request.post('auth/login', {
      data: credentials,
    });

    const session = await CpmApiClient.parseEnvelope<AuthSession>(response);
    return {
      client: new CpmApiClient(request, session.accessToken),
      session,
    };
  }

  public async register(credentials: RegisterCredentials): Promise<AuthSession> {
    const response = await this.request.post('auth/register', {
      data: credentials,
    });

    return CpmApiClient.parseEnvelope<AuthSession>(response);
  }

  public async createProject(payload: CreateProjectPayload): Promise<ProjectDto> {
    const response = await this.request.post('projects', {
      headers: this.authHeaders(),
      data: payload,
    });

    return CpmApiClient.parseEnvelope<ProjectDto>(response);
  }

  public async listProjects(): Promise<ProjectListDto[]> {
    const response = await this.request.get('projects', {
      headers: this.authHeaders(),
    });

    return CpmApiClient.parseEnvelope<ProjectListDto[]>(response);
  }

  public async deleteProject(projectId: string): Promise<void> {
    const response = await this.request.delete(`projects/${projectId}`, {
      headers: this.authHeaders(),
    });

    await CpmApiClient.assertOk(response);
  }

  public async createTask(payload: CreateTaskPayload): Promise<TaskDto> {
    const response = await this.request.post('tasks', {
      headers: this.authHeaders(),
      data: payload,
    });

    return CpmApiClient.parseEnvelope<TaskDto>(response);
  }

  public async listUsers(role?: string): Promise<UserDto[]> {
    const query = role ? `?role=${encodeURIComponent(role)}` : '';
    const response = await this.request.get(`users${query}`, {
      headers: this.authHeaders(),
    });

    return CpmApiClient.parseEnvelope<UserDto[]>(response);
  }

  public async getUserByEmail(email: string): Promise<UserDto> {
    // NOTE: The backend defines `/users/:id` before `/users/email/:email`, which
    // can cause `GET /users/email/...` to be shadowed by the `:id` route.
    // Listing users is slightly heavier but reliable for E2E.
    const users = await this.listUsers();
    const match = users.find(
      (user) => user.email.toLowerCase() === email.trim().toLowerCase(),
    );

    if (!match) {
      throw new Error(`User not found by email: ${email}`);
    }

    return match;
  }

  public async deleteUser(userId: string): Promise<void> {
    const response = await this.request.delete(`users/${userId}`, {
      headers: this.authHeaders(),
    });

    await CpmApiClient.assertOk(response);
  }

  public async deleteTask(taskId: string): Promise<void> {
    const response = await this.request.delete(`tasks/${taskId}`, {
      headers: this.authHeaders(),
    });

    await CpmApiClient.assertOk(response);
  }

  private authHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.accessToken}`,
    };
  }

  private static async assertOk(response: APIResponse): Promise<void> {
    if (response.ok()) return;

    const bodyText = await response.text();
    throw new Error(
      `API request failed: ${response.status()} ${response.statusText()}\n${bodyText}`,
    );
  }

  private static async parseEnvelope<T>(response: APIResponse): Promise<T> {
    await CpmApiClient.assertOk(response);

    const json = (await response.json()) as BackendApiEnvelope<T>;
    if (!json.success) {
      throw new Error(json.message || 'API responded with success=false');
    }
    return json.data;
  }
}
