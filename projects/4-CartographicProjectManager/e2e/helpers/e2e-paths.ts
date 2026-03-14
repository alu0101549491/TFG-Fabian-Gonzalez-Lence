/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2026-03-13
 * @file e2e/helpers/e2e-paths.ts
 * @desc Centralized paths and URL helpers for Playwright E2E.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import os from 'node:os';
import path from 'node:path';

import type {FullConfig} from '@playwright/test';

const DEFAULT_AUTH_DIR = path.join(os.tmpdir(), 'cpm-playwright-auth');

/**
 * Directory where Playwright stores authenticated storage states.
 *
 * Defaults to an OS temp directory to avoid committing/scanning JWTs inside the repo.
 * Can be overridden via `PW_AUTH_DIR`.
 */
export const AUTH_DIR = process.env.PW_AUTH_DIR || DEFAULT_AUTH_DIR;

export const AUTH_STATE_ADMIN_PATH = path.join(AUTH_DIR, 'admin.json');

export const AUTH_STATE_NON_ADMIN_PATH = path.join(AUTH_DIR, 'non-admin.json');

export const DEFAULT_UI_BASE_URL =
  'http://localhost:5173/4-CartographicProjectManager/';

export const DEFAULT_API_BASE_URL = 'http://localhost:3000/api/v1/';

/**
 * Derives the UI base URL from Playwright config/env.
 */
export function getUiBaseUrl(config: FullConfig): string {
  const baseUrlFromConfig = config.projects[0]?.use?.baseURL;
  const baseUrl =
    (typeof baseUrlFromConfig === 'string' && baseUrlFromConfig) ||
    process.env.PLAYWRIGHT_BASE_URL ||
    DEFAULT_UI_BASE_URL;

  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

/**
 * Backend API base URL.
 */
export function getApiBaseUrl(): string {
  const baseUrl = process.env.PW_API_BASE_URL || DEFAULT_API_BASE_URL;
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}
