/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/helpers/api.helper.ts
 * @desc Lightweight API helper used by Playwright setup and seed routines.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {writeFile} from 'node:fs/promises';
import {type APIRequestContext, request} from '@playwright/test';

/** Minimal authenticated user payload returned by the backend auth endpoints. */
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
}

/** Login payload used by auth setup and authenticated API calls. */
export interface AuthSession {
  token: string;
  user: AuthUser;
}

/** Credentials contract for authenticated helpers. */
export interface Credentials {
  email: string;
  password: string;
}

interface StorageEntry {
  name: string;
  value: string;
}

interface StorageState {
  cookies: Array<Record<string, unknown>>;
  origins: Array<{
    origin: string;
    localStorage: StorageEntry[];
  }>;
}

/**
 * Generic API abstraction for Playwright utilities.
 */
export class ApiHelper {
  private readonly apiContext: APIRequestContext;

  public constructor(apiContext: APIRequestContext) {
    this.apiContext = apiContext;
  }

  /**
   * Resolves the backend API base URL used by seed and login helpers.
   *
   * @returns Backend API base URL
   */
  public static resolveApiBaseUrl(): string {
    return (process.env.PLAYWRIGHT_API_BASE_URL ?? 'http://localhost:3000').replace(/\/api\/?$/, '');
  }

  /**
   * Creates a ready-to-use helper with a default request context.
   *
   * @returns Configured API helper instance
   */
  public static async create(): Promise<ApiHelper> {
    const apiContext = await request.newContext({
      baseURL: ApiHelper.resolveApiBaseUrl(),
      extraHTTPHeaders: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    return new ApiHelper(apiContext);
  }

  /**
   * Disposes the wrapped Playwright API context.
   */
  public async dispose(): Promise<void> {
    await this.apiContext.dispose();
  }

  /**
   * Authenticates a user and returns its session payload.
   *
   * @param credentials - User email/password pair
   * @returns Auth session returned by the backend
   */
  public async login(credentials: Credentials): Promise<AuthSession> {
    return this.post<AuthSession>('/auth/login', credentials, undefined, 200);
  }

  /**
   * Performs a typed GET request.
   *
   * @param path - Relative API path
   * @param token - Optional bearer token
   * @returns Parsed response payload
   */
  public async get<T>(path: string, token?: string): Promise<T> {
    const response = await this.apiContext.get(ApiHelper.withApiPrefix(path), {
      headers: token ? {Authorization: `Bearer ${token}`} : undefined,
    });

    if (!response.ok()) {
      throw new Error(`GET ${path} failed with ${response.status()}: ${await response.text()}`);
    }

    return this.parseJson<T>(response);
  }

  /**
   * Performs a typed POST request.
   *
   * @param path - Relative API path
   * @param body - Request payload
   * @param token - Optional bearer token
   * @param expectedStatus - Expected successful status code
   * @returns Parsed response payload
   */
  public async post<T>(
    path: string,
    body: unknown,
    token?: string,
    expectedStatus: number = 201,
  ): Promise<T> {
    const response = await this.apiContext.post(ApiHelper.withApiPrefix(path), {
      data: body,
      headers: token ? {Authorization: `Bearer ${token}`} : undefined,
    });

    if (response.status() !== expectedStatus) {
      throw new Error(`POST ${path} failed with ${response.status()}: ${await response.text()}`);
    }

    return this.parseJson<T>(response);
  }

  /**
   * Performs a typed PUT request.
   *
   * @param path - Relative API path
   * @param body - Request payload
   * @param token - Bearer token
   * @param expectedStatus - Expected successful status code
   * @returns Parsed response payload
   */
  public async put<T>(
    path: string,
    body: unknown,
    token: string,
    expectedStatus: number = 200,
  ): Promise<T> {
    const response = await this.apiContext.put(ApiHelper.withApiPrefix(path), {
      data: body,
      headers: {Authorization: `Bearer ${token}`},
    });

    if (response.status() !== expectedStatus) {
      throw new Error(`PUT ${path} failed with ${response.status()}: ${await response.text()}`);
    }

    return this.parseJson<T>(response);
  }

  /**
   * Performs a DELETE request and tolerates missing resources when requested.
   *
   * @param path - Relative API path
   * @param token - Bearer token
   * @param allowMissing - Whether 404/400 should be ignored
   */
  public async delete(path: string, token: string, allowMissing: boolean = true): Promise<void> {
    const response = await this.apiContext.delete(ApiHelper.withApiPrefix(path), {
      headers: {Authorization: `Bearer ${token}`},
    });

    if (!response.ok() && (!allowMissing || (response.status() !== 404 && response.status() !== 400))) {
      throw new Error(`DELETE ${path} failed with ${response.status()}: ${await response.text()}`);
    }
  }

  /**
   * Creates and persists a Playwright storage-state file for a user.
   *
   * @param credentials - User email/password pair
   * @param filePath - Destination file path
   */
  public async persistStorageState(credentials: Credentials, filePath: string): Promise<void> {
    const session = await this.login(credentials);
    const storageState = this.buildStorageState(session);
    await writeFile(filePath, JSON.stringify(storageState, null, 2), 'utf8');
  }

  /**
   * Builds the storage-state structure expected by Playwright contexts.
   *
   * @param session - Authenticated user session
   * @returns Playwright-compatible storage-state object
   */
  public buildStorageState(session: AuthSession): StorageState {
    const origin = new URL(
      process.env.BASE_URL ??
        process.env.PLAYWRIGHT_BASE_URL ??
        'http://localhost:4200/5-TennisTournamentManager/',
    ).origin;

    return {
      cookies: [],
      origins: [{
        origin,
        localStorage: [
          {name: 'tennis_jwt_token', value: session.token},
          {name: 'app_user', value: JSON.stringify(session.user)},
        ],
      }],
    };
  }

  /**
   * Parses a JSON response body, tolerating empty bodies.
   *
   * @param response - API response to parse
   * @returns Parsed JSON payload or empty object for empty bodies
   */
  private async parseJson<T>(response: Awaited<ReturnType<APIRequestContext['fetch']>>): Promise<T> {
    const body = await response.text();
    return body ? JSON.parse(body) as T : ({} as T);
  }

  /**
   * Normalizes relative endpoints so they always target the backend `/api` router.
   *
   * @param path - Relative or absolute API path
   * @returns Normalized path rooted under `/api`
   */
  private static withApiPrefix(path: string): string {
    if (path === '/api' || path.startsWith('/api/')) {
      return path;
    }

    return `/api${path.startsWith('/') ? path : `/${path}`}`;
  }
}