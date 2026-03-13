/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 13, 2026
 * @file e2e/critical/admin-pages.spec.ts
 * @desc Critical E2E coverage for admin-only pages accessible to administrators.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

// Leave exactly 1 blank line before imports

import {test, expect} from '../fixtures/test';
import {AUTH_STATE_ADMIN_PATH} from '../helpers/e2e-paths.ts';

test.describe('Admin pages (critical)', () => {
  test.use({storageState: AUTH_STATE_ADMIN_PATH});

  test('BACKUP-002: admin can open backup page and see controls', async ({page}) => {
    await page.goto('backup');

    await expect(page.getByRole('heading', {name: 'Backup Management'})).toBeVisible();
    await expect(page.getByRole('button', {name: '+ Create Backup'})).toBeVisible();
    await expect(page.getByLabel('Backup statistics')).toBeVisible();
  });

  test('USERS-002: admin can view user list page', async ({page}) => {
    await page.goto('users');

    await expect(page.getByRole('heading', {name: 'User Management'})).toBeVisible();
    await expect(page.getByLabel('User filters')).toBeVisible();
    await expect(page.getByLabel('User statistics')).toBeVisible();
  });
});
