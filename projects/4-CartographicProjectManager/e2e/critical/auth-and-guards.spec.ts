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

import {test, expect} from '@playwright/test';

import {DEV_ACCOUNTS, login} from '../helpers/auth';

test.describe('Auth + route guards (critical)', () => {
  test('redirects unauthenticated user to /login with redirect param', async ({page}) => {
    await page.goto('/projects');

    await expect(page).toHaveURL(/\/login\?redirect=%2Fprojects/);
    await expect(page.getByRole('button', {name: 'Sign In'})).toBeVisible();
  });

  test('logs in and returns to original destination via redirect', async ({page}) => {
    await page.goto('/projects');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fprojects/);

    await login(page, DEV_ACCOUNTS.ADMIN);

    await expect(page).toHaveURL(/\/projects(\?|$)/);
    await expect(page.getByRole('heading', {name: 'Projects'})).toBeVisible();
  });

  test('blocks non-admin user from /backup and redirects to /forbidden', async ({page}) => {
    await login(page, DEV_ACCOUNTS.CLIENT);

    await page.goto('/backup');

    await expect(page).toHaveURL(/\/forbidden(\?|$)/);
    await expect(page.getByRole('heading', {name: 'Access Forbidden'})).toBeVisible();
    await expect(page.getByText("You don't have permission to access this resource.")).toBeVisible();
  });

  test('shows NotFound page for unknown route', async ({page}) => {
    await page.goto('/this-route-does-not-exist');

    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByRole('heading', {name: 'Page Not Found'})).toBeVisible();
  });
});
