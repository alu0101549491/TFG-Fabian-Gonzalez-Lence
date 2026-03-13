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

import {type Page} from '@playwright/test';

/**
 * Credentials for logging into the CPM UI.
 */
export interface Credentials {
  readonly email: string;
  readonly password: string;
}

/**
 * Credentials for registering a new user through the CPM UI.
 */
export interface RegisterCredentials {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly phone?: string;
}

/**
 * Known dev accounts displayed by the CPM login page.
 */
export const DEV_ACCOUNTS = {
  ADMIN: {email: 'admin@cartographic.com', password: 'REDACTED'},
  CLIENT: {email: 'client@example.com', password: 'REDACTED'},
  SPECIAL: {email: 'special@cartographic.com', password: 'REDACTED'},
} as const satisfies Record<string, Credentials>;

async function waitForAuthOutcome(page: Page): Promise<void> {
  const errorAlert = page.locator('[role="alert"]');

  await Promise.race([
    page.waitForURL((url) => !url.pathname.endsWith('/login'), {timeout: 10_000}),
    errorAlert.waitFor({state: 'visible', timeout: 10_000}),
  ]);

  if (page.url().includes('/login')) {
    const message = (await errorAlert.isVisible())
      ? (await errorAlert.innerText()).trim()
      : 'Login did not complete (still on /login)';
    throw new Error(message);
  }
}

/**
 * Logs in through the UI and waits until the app navigates away from `/login`.
 *
 * @param page Playwright page.
 * @param credentials Login credentials.
 */
export async function login(page: Page, credentials: Credentials): Promise<void> {
  if (!page.url().includes('/login')) {
    await page.goto('login');
  }

  await page.getByLabel('Email').fill(credentials.email);
  await page.getByLabel('Password', {exact: true}).fill(credentials.password);

  await page.getByRole('button', {name: 'Sign In'}).click();

  await waitForAuthOutcome(page);
}

/**
 * Registers a new user through the UI. On success, the app auto-logs in and
 * navigates away from `/register`.
 */
export async function register(page: Page, credentials: RegisterCredentials): Promise<void> {
  await page.goto('register');

  await page.getByLabel('Username *', {exact: true}).fill(credentials.username);
  await page.getByLabel('Email *', {exact: true}).fill(credentials.email);
  await page.getByLabel('Password *', {exact: true}).fill(credentials.password);
  await page
    .getByLabel('Confirm Password *', {exact: true})
    .fill(credentials.password);

  if (credentials.phone) {
    await page.getByLabel('Phone (Optional)', {exact: true}).fill(credentials.phone);
  }

  await page.getByRole('button', {name: 'Create Account'}).click();

  const errorAlert = page.locator('[role="alert"]');
  await Promise.race([
    page.waitForURL((url) => !url.pathname.endsWith('/register'), {timeout: 15_000}),
    errorAlert.waitFor({state: 'visible', timeout: 15_000}),
  ]);

  if (page.url().includes('/register')) {
    const message = (await errorAlert.isVisible())
      ? (await errorAlert.innerText()).trim()
      : 'Registration did not complete (still on /register)';
    throw new Error(message);
  }
}
