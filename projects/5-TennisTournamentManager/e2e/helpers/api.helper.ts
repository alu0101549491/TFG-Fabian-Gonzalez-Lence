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

import {writeFile, readdir, readFile, mkdir, access, unlink} from 'node:fs/promises';
import path from 'node:path';
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
    // First, attempt to reuse any precomputed Playwright storage-state files
    // created by the global setup. This avoids triggering concurrent /auth/login
    // requests from parallel workers which can hit backend rate limits.
    const cached = await this.loadSessionFromAuthFilesByEmail(credentials.email);
    if (cached) {
      // eslint-disable-next-line no-console
      console.log('[ApiHelper] Reusing cached session for', credentials.email);
      return cached;
    }

    // Use a filesystem lock to serialize logins for the same email across
    // test worker processes. This lets one process perform the login and
    // persist a Playwright storage-state file other processes can reuse.
    const authDir = path.resolve(process.cwd(), 'e2e', '.auth');
    const candidate = path.join(authDir, `${credentials.email.replace(/[@.]/g, '_')}.json`);
    await mkdir(authDir, {recursive: true}).catch(() => undefined);

    const lockPath = `${candidate}.lock`;
    const waitTimeout = 25_000; // ms
    const pollInterval = 200; // ms

    // Try to acquire lock atomically
    let haveLock = false;
    try {
      await writeFile(lockPath, String(process.pid), {flag: 'wx'});
      haveLock = true;
    } catch {
      haveLock = false;
    }

    if (haveLock) {
      try {
        const session = await this.post<AuthSession>('/auth/login', credentials, undefined, 200);
        // eslint-disable-next-line no-console
        console.log('[ApiHelper] Performed login for', credentials.email);
        try {
          const storageState = this.buildStorageState(session);
          await writeFile(candidate, JSON.stringify(storageState, null, 2), 'utf8');
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('[ApiHelper] Failed to persist storage-state', err);
        }
        return session;
      } finally {
        try {
          await unlink(lockPath);
        } catch {
          // ignore
        }
      }
    }

    // Wait for locker to produce the storage-state file and reuse it
    const start = Date.now();
    while (Date.now() - start < waitTimeout) {
      try {
        await access(candidate);
        const cached2 = await this.loadSessionFromAuthFilesByEmail(credentials.email);
        if (cached2) return cached2;
      } catch {
        // Still waiting for locker
        // eslint-disable-next-line no-await-in-loop
        await ApiHelper.sleep(pollInterval);
      }
    }

    // Timeout: try to acquire lock and perform login ourselves
    try {
      await writeFile(lockPath, String(process.pid), {flag: 'wx'});
      haveLock = true;
    } catch {
      haveLock = false;
    }

    if (haveLock) {
      try {
        const session = await this.post<AuthSession>('/auth/login', credentials, undefined, 200);
        // eslint-disable-next-line no-console
        console.log('[ApiHelper] Performed login for', credentials.email);
        try {
          const storageState = this.buildStorageState(session);
          await writeFile(candidate, JSON.stringify(storageState, null, 2), 'utf8');
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('[ApiHelper] Failed to persist storage-state', err);
        }
        return session;
      } finally {
        try {
          await unlink(lockPath);
        } catch {
          // ignore
        }
      }
    }

    // As a last resort, attempt the login request directly (this will
    // re-use the generic POST retry/backoff behavior and may still fail).
    // eslint-disable-next-line no-console
    console.log('[ApiHelper] Falling back to direct login for', credentials.email);
    return this.post<AuthSession>('/auth/login', credentials, undefined, 200);
  }

  /**
   * Attempts to locate a persisted Playwright storage-state file under
   * `e2e/.auth` matching the supplied email and reconstruct an AuthSession
   * from its localStorage entries. Returns null when no match is found.
   */
  private async loadSessionFromAuthFilesByEmail(email: string): Promise<AuthSession | null> {
    try {
      const authDir = path.resolve(process.cwd(), 'e2e', '.auth');
      // Fast path: check the canonical candidate filename first to avoid
      // scanning the whole directory in common cases.
      const candidate = path.join(authDir, `${email.replace(/[@.]/g, '_')}.json`);
      try {
        const content = await readFile(candidate, 'utf8').catch(() => null);
        if (content) {
          const parsed = JSON.parse(content);
          const origins = Array.isArray(parsed.origins) ? parsed.origins : [];
          for (const origin of origins) {
            const localStorage = Array.isArray(origin.localStorage) ? origin.localStorage : [];
            const appUser = localStorage.find((e: any) => e && e.name === 'app_user');
            const token = localStorage.find((e: any) => e && e.name === 'tennis_jwt_token');
            if (appUser && token) {
              try {
                const user = JSON.parse(String(appUser.value));
                const tokenValue = String(token.value);
                if (user && user.email === email) {
                  // quick expiry check
                  const parts = tokenValue.split('.');
                  if (parts.length === 3) {
                    try {
                      const payload = parts[1];
                      let padded = payload.replace(/-/g, '+').replace(/_/g, '/');
                      while (padded.length % 4) padded += '=';
                      const decoded = Buffer.from(padded, 'base64').toString('utf8');
                      const parsedPayload = JSON.parse(decoded);
                      const exp = parsedPayload.exp as number | undefined;
                      if (typeof exp === 'number') {
                        const now = Math.floor(Date.now() / 1000);
                        if (exp < now + 15) {
                          // expired/near-expiry
                          return null;
                        }
                      }
                    } catch {
                      // ignore decode issues
                    }
                  }
                  return {token: tokenValue, user} as AuthSession;
                }
              } catch {
                // ignore parse errors
              }
            }
          }
        }
      } catch {
        // ignore candidate read errors and fall back to scanning directory
      }

      const files = await readdir(authDir).catch(() => [] as string[]);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        const content = await readFile(path.join(authDir, file), 'utf8').catch(() => null);
        if (!content) continue;
        let parsed: any;
        try {
          parsed = JSON.parse(content);
        } catch {
          continue;
        }

        const origins = Array.isArray(parsed.origins) ? parsed.origins : [];
        for (const origin of origins) {
          const localStorage = Array.isArray(origin.localStorage) ? origin.localStorage : [];
          const appUser = localStorage.find((e: any) => e && e.name === 'app_user');
          const token = localStorage.find((e: any) => e && e.name === 'tennis_jwt_token');
          if (appUser && token) {
            try {
              const user = JSON.parse(String(appUser.value));
              const tokenValue = String(token.value);

              // If the token is a JWT, try to decode expiry and avoid returning
              // expired tokens (adds a small safety margin).
              const parts = tokenValue.split('.');
              if (parts.length === 3) {
                try {
                  const payload = parts[1];
                  let padded = payload.replace(/-/g, '+').replace(/_/g, '/');
                  while (padded.length % 4) padded += '=';
                  const decoded = Buffer.from(padded, 'base64').toString('utf8');
                  const parsed = JSON.parse(decoded);
                  const exp = parsed.exp as number | undefined;
                  if (typeof exp === 'number') {
                    const now = Math.floor(Date.now() / 1000);
                    // consider token expired if within 15s of expiry
                    if (exp < now + 15) {
                      // token is expired or about to expire; skip this file
                      continue;
                    }
                  }
                } catch {
                  // ignore decode errors and proceed
                }
              }

              if (user && user.email === email) {
                return {token: tokenValue, user} as AuthSession;
              }
            } catch {
              // continue searching
            }
          }
        }
      }
    } catch {
      // ignore any FS errors and fallback to normal login
    }
    return null;
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
    const maxRetries = 6;
    const baseDelay = 500; // ms

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const response = await this.apiContext.post(ApiHelper.withApiPrefix(path), {
        data: body,
        headers: token ? {Authorization: `Bearer ${token}`} : undefined,
      });

      if (response.status() === expectedStatus) {
        return this.parseJson<T>(response);
      }

      // Retry on 429 (rate limiting) with exponential backoff
      if (response.status() === 429 && attempt < maxRetries) {
        // Add a small random jitter to avoid thundering-herd retries across workers
        const jitter = Math.floor(Math.random() * baseDelay);
        const delay = baseDelay * Math.pow(2, attempt) + jitter;
        // eslint-disable-next-line no-await-in-loop
        await ApiHelper.sleep(delay);
        // try again
        // eslint-disable-next-line no-continue
        continue;
      }

      throw new Error(`POST ${path} failed with ${response.status()}: ${await response.text()}`);
    }

    throw new Error(`POST ${path} failed after ${maxRetries} retries`);
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
   * Simple sleep helper for retry backoff.
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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