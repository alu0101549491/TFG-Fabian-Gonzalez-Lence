/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 13, 2026
 * @file e2e/helpers/auth.ts
 * @desc Playwright authentication helpers for CPM E2E tests
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {expect, type Page} from '@playwright/test';

/**
 * Credentials for logging into the CPM UI.
 */
export interface Credentials {
  readonly email: string;
  readonly password: string;
}

/**
 * Known dev accounts displayed by the CPM login page.
 */
export const DEV_ACCOUNTS = {
  ADMIN: {email: 'admin@cartographic.com', password: 'REDACTED'},
  CLIENT: {email: 'client@example.com', password: 'REDACTED'},
  SPECIAL: {email: 'special@cartographic.com', password: 'REDACTED'},
} as const satisfies Record<string, Credentials>;

/**
 * Logs in through the UI and waits until the app navigates away from `/login`.
 *
 * @param page Playwright page.
 * @param credentials Login credentials.
 */
export async function login(page: Page, credentials: Credentials): Promise<void> {
  await page.goto('/login');

  await page.getByLabel('Email').fill(credentials.email);
  await page.getByLabel('Password').fill(credentials.password);

  await page.getByRole('button', {name: 'Sign In'}).click();

  await expect(page).not.toHaveURL(/\/login(\?|$)/);
}
