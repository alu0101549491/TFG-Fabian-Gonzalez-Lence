/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2026-03-13
 * @file e2e/high/navigation.spec.ts
 * @desc High-priority E2E coverage for basic navigation and logout.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

// Leave exactly 1 blank line before imports

import {test, expect} from '../fixtures/test';
import {AUTH_STATE_ADMIN_PATH} from '../helpers/e2e-paths.ts';

test.describe('Navigation (high)', () => {
  test.use({storageState: AUTH_STATE_ADMIN_PATH});

  test('sidebar routes work and logout returns to login', async ({page}) => {
    await page.goto('');
    await expect(page.getByRole('heading', {name: 'Dashboard'})).toBeVisible();

    await page.getByRole('link', {name: 'Projects', exact: true}).click();
    await expect(page).toHaveURL(/\/projects(\?|$)/);
    await expect(page.getByRole('heading', {name: 'Projects'})).toBeVisible();

    await page.getByRole('link', {name: 'Calendar', exact: true}).click();
    await expect(page).toHaveURL(/\/calendar(\?|$)/);
    await expect(page.getByRole('heading', {name: 'Project Calendar'})).toBeVisible();

    await page.getByRole('button', {name: 'User menu'}).click();
    await expect(page.getByRole('button', {name: 'Logout'})).toBeVisible();

    await page.getByRole('button', {name: 'Logout'}).click();
    await expect(page).toHaveURL(/\/login(\?|$)/);
    await expect(page.getByRole('button', {name: 'Sign In'})).toBeVisible();
  });
});
