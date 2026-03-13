/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 13, 2026
 * @file e2e/medium/notifications-empty-state.spec.ts
 * @desc Deterministic E2E coverage for notifications empty state.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

// Leave exactly 1 blank line before imports

import {request} from '@playwright/test';

import {test, expect} from '../fixtures/test';
import {CpmApiClient} from '../helpers/api';
import {getApiBaseUrl} from '../helpers/e2e-paths.ts';
import {uniqueNonce} from '../helpers/test-data';
import {DEV_ACCOUNTS, register} from '../helpers/auth';

test.describe('Notifications empty state (medium)', () => {
  test('NOTIF-009: notifications empty state', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-notif-empty');
    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);

    const userEmail = `pw.notif.empty.${nonce}@example.com`;
    const userPassword = `pw-${nonce}-Pass123!`;
    const username = `pw-notif-empty-${nonce.slice(-6)}`;

    await register(page, {
      username,
      email: userEmail,
      password: userPassword,
    });

    const user = await adminApi.getUserByEmail(userEmail);

    try {
      await page.goto('notifications');

      await expect(page.getByRole('heading', {name: 'Notifications', level: 1})).toBeVisible();

      await expect(
        page.getByRole('heading', {name: 'No Notifications', level: 2, exact: true}),
      ).toBeVisible();
      await expect(
        page.getByRole('heading', {name: 'No notifications yet', level: 4, exact: true}),
      ).toBeVisible();
      await expect(page.getByText("You're all caught up! New notifications will appear here.")).toBeVisible();

      await expect(page.locator('article.notification-item')).toHaveCount(0);
      await expect(page.getByRole('button', {name: 'Mark All as Read'})).toHaveCount(0);
    } finally {
      try {
        await adminApi.deleteUser(user.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });
});
