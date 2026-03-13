/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 13, 2026
 * @file e2e/critical/auth-and-guards.spec.ts
 * @desc Critical E2E smoke coverage for authentication and route guards
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {test, expect, type Page} from '@playwright/test';

import {DEV_ACCOUNTS, login, register} from '../helpers/auth';

async function loginAsNonAdmin(page: Page): Promise<void> {
  const candidates = [DEV_ACCOUNTS.CLIENT, DEV_ACCOUNTS.SPECIAL];
  for (const credentials of candidates) {
    try {
      await login(page, credentials);
      return;
    } catch {
      // Try next candidate.
    }
  }

  const fallbackEmail =
    process.env.PW_E2E_NON_ADMIN_EMAIL || 'pw-e2e-non-admin@example.com';
  const fallbackPassword =
    process.env.PW_E2E_NON_ADMIN_PASSWORD || 'pw-e2e-non-admin';
  const fallbackUsername =
    process.env.PW_E2E_NON_ADMIN_USERNAME || 'pw-e2e-non-admin';

  try {
    await login(page, {email: fallbackEmail, password: fallbackPassword});
    return;
  } catch {
    // Try creating it if it doesn't exist.
  }

  try {
    await register(page, {
      username: fallbackUsername,
      email: fallbackEmail,
      password: fallbackPassword,
    });
    return;
  } catch {
    // If registration failed due to duplication or transient UI errors, try login again.
  }

  await login(page, {email: fallbackEmail, password: fallbackPassword});
}

test.describe('Auth + route guards (critical)', () => {
  test('logs in successfully (admin) and lands on dashboard', async ({page}) => {
    await page.goto('login');

    await login(page, DEV_ACCOUNTS.ADMIN);

    await expect(page).toHaveURL(/\/(\?|$)/);
    await expect(page.getByRole('heading', {name: 'Dashboard', exact: true})).toBeVisible();
    await expect(page.getByRole('link', {name: 'Projects', exact: true})).toBeVisible();
  });

  test('redirects unauthenticated user to /login with redirect param', async ({page}) => {
    await page.goto('projects');

    await expect(page).toHaveURL(/\/login\?redirect=(%2Fprojects|\/projects)/);
    await expect(page.getByRole('button', {name: 'Sign In'})).toBeVisible();
  });

  test('logs in and returns to original destination via redirect', async ({page}) => {
    await page.goto('projects');
    await expect(page).toHaveURL(/\/login\?redirect=(%2Fprojects|\/projects)/);

    await login(page, DEV_ACCOUNTS.ADMIN);

    await expect(page).toHaveURL(/\/projects(\?|$)/);
    await expect(page.getByRole('heading', {name: 'Projects'})).toBeVisible();
  });

  test('redirects authenticated user away from guest-only routes (/login, /register)', async ({page}) => {
    await login(page, DEV_ACCOUNTS.ADMIN);

    await page.goto('login');
    await expect.poll(() => page.url()).not.toContain('/login');
    await expect(page.getByRole('heading', {name: 'Dashboard'})).toBeVisible();

    await page.goto('register');
    await expect.poll(() => page.url()).not.toContain('/register');
    await expect(page.getByRole('heading', {name: 'Dashboard'})).toBeVisible();
  });

  test('shows error and stays on /login for invalid credentials', async ({page}) => {
    await page.goto('login');

    await page.getByLabel('Email').fill('pw-e2e-invalid@example.com');
    await page.getByLabel('Password', {exact: true}).fill('pw-e2e-invalid');
    await page.getByRole('button', {name: 'Sign In'}).click();

    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/invalid|unauthoriz|incorrect/i);
    await expect(page).toHaveURL(/\/login(\?|$)/);
    await expect(page.getByRole('heading', {name: 'Dashboard'})).not.toBeVisible();
  });

  test('preserves authenticated session after refresh', async ({page}) => {
    await login(page, DEV_ACCOUNTS.ADMIN);

    await page.goto('projects');
    await expect(page.getByRole('heading', {name: 'Projects'})).toBeVisible();

    await page.reload();

    await expect(page).not.toHaveURL(/\/login(\?|$)/);
    await expect(page.getByRole('heading', {name: 'Projects'})).toBeVisible();
  });

  test('ignores unsafe redirect query after login (open redirect hardening)', async ({page}) => {
    await page.goto('login?redirect=https://example.com');
    await expect(page).toHaveURL(/\/login\?redirect=/);

    await login(page, DEV_ACCOUNTS.ADMIN);

    await expect(page).not.toHaveURL(/example\.com/);
    await expect(page.getByRole('heading', {name: 'Dashboard', exact: true})).toBeVisible();
  });

  test('blocks non-admin user from /backup and redirects to /forbidden', async ({page}) => {
    await loginAsNonAdmin(page);

    await page.goto('backup');

    await expect(page).toHaveURL(/\/forbidden(\?|$)/);
    await expect(page.getByRole('heading', {name: 'Access Forbidden'})).toBeVisible();
    await expect(page.getByText("You don't have permission to access this resource.")).toBeVisible();
  });

  test('blocks non-admin user from /users and redirects to /forbidden', async ({page}) => {
    await loginAsNonAdmin(page);

    await page.goto('users');

    await expect(page).toHaveURL(/\/forbidden(\?|$)/);
    await expect(page.getByRole('heading', {name: 'Access Forbidden'})).toBeVisible();
    await expect(page.getByText("You don't have permission to access this resource.")).toBeVisible();
  });

  test('shows NotFound page for unknown route', async ({page}) => {
    await page.goto('this-route-does-not-exist');

    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByRole('heading', {name: 'Page Not Found'})).toBeVisible();
  });
});
