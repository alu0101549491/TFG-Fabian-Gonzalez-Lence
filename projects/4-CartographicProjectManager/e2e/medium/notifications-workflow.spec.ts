/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 13, 2026
 * @file e2e/medium/notifications-workflow.spec.ts
 * @desc Deterministic E2E coverage for notifications listing and read actions.
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

test.describe('Notifications workflow (medium)', () => {
  test('NOTIF-001/003/004: lists notifications and supports mark read actions', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);
    const nonce = uniqueNonce('pw-notif');

    const userEmail = `pw.notif.workflow.${nonce}@example.com`;
    const userPassword = `pw-${nonce}-Pass123!`;
    const username = `pw-notif-workflow-${nonce.slice(-6)}`;

    await register(page, {
      username,
      email: userEmail,
      password: userPassword,
    });

    const user = await adminApi.getUserByEmail(userEmail);

    const title1 = `PW Notification 1 ${nonce}`;
    const title2 = `PW Notification 2 ${nonce}`;

    const createdNotificationIds: string[] = [];

    try {
      const notification1 = await adminApi.createNotification({
        userId: user.id,
        type: 'PROJECT_ASSIGNED',
        title: title1,
        message: `PW test notification message 1 (${nonce})`,
        relatedEntityId: null,
      });
      createdNotificationIds.push(notification1.id);

      const notification2 = await adminApi.createNotification({
        userId: user.id,
        type: 'TASK_STATUS_CHANGE',
        title: title2,
        message: `PW test notification message 2 (${nonce})`,
        relatedEntityId: null,
      });
      createdNotificationIds.push(notification2.id);

      await page.goto('notifications');

      await expect(page.getByRole('heading', {name: 'Notifications', level: 1})).toBeVisible();

      const markAllButton = page.locator('button[aria-label="Mark all as read"]');
      await expect(markAllButton).toBeVisible();

      const item1 = page.locator('article.notification-item', {hasText: title1});
      const item2 = page.locator('article.notification-item', {hasText: title2});

      await expect(item1).toBeVisible();
      await expect(item2).toBeVisible();

      const item1MarkReadButton = item1.locator('button[aria-label="Mark as read"]');
      const item2MarkReadButton = item2.locator('button[aria-label="Mark as read"]');

      await expect(item1MarkReadButton).toHaveCount(1);
      await expect(item2MarkReadButton).toHaveCount(1);

      // NOTIF-003: mark single notification as read.
      await item1.hover();
      await item1MarkReadButton.click();
      await expect(item1MarkReadButton).toHaveCount(0);

      // NOTIF-004: mark all as read.
      await markAllButton.click();
      await expect(item2MarkReadButton).toHaveCount(0);
    } finally {
      for (const notificationId of createdNotificationIds) {
        try {
          await adminApi.deleteNotification(notificationId);
        } catch {
          // Ignore.
        }
      }
      try {
        await adminApi.deleteUser(user.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });
});
