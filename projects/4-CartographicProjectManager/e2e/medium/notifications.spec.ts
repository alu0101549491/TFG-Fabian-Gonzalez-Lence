/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 13, 2026
 * @file e2e/medium/notifications.spec.ts
 * @desc Medium-priority E2E coverage for the notifications view shell.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

// Leave exactly 1 blank line before imports

import {test, expect} from '../fixtures/test';
import {AUTH_STATE_ADMIN_PATH} from '../helpers/e2e-paths.ts';

test.describe('Notifications (medium)', () => {
  test.use({storageState: AUTH_STATE_ADMIN_PATH});

  test('NOTIF-001: notifications page loads (list or empty state)', async ({page}) => {
    await page.goto('notifications');

    await expect(
      page.getByRole('heading', {name: 'Notifications', level: 1}),
    ).toBeVisible();

    const hasEmptyState = await page.getByRole('heading', {name: 'No Notifications'}).isVisible();
    if (hasEmptyState) {
      await expect(page.getByText("You're all caught up! New notifications will appear here.")).toBeVisible();
      return;
    }

    // If notifications exist, at least the container should render.
    await expect(page.locator('.notifications-container')).toBeVisible();
  });
});
