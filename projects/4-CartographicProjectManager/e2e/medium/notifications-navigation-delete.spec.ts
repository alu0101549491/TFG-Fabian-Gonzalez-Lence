/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 13, 2026
 * @file e2e/medium/notifications-navigation-delete.spec.ts
 * @desc Deterministic E2E coverage for notification navigation and deletion.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

// Leave exactly 1 blank line before imports

import {request} from '@playwright/test';

import {test, expect} from '../fixtures/test';
import {CpmApiClient} from '../helpers/api';
import {AUTH_STATE_ADMIN_PATH, getApiBaseUrl} from '../helpers/e2e-paths.ts';
import {uniqueNonce, daysFromToday} from '../helpers/test-data';
import {DEV_ACCOUNTS} from '../helpers/auth';

test.describe('Notifications navigation + delete (medium)', () => {
  test.use({storageState: AUTH_STATE_ADMIN_PATH});

  test('NOTIF-007: navigate to related entity from notification', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-notif-nav');

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);

    let clientId: string;
    {
      const clients = await adminApi.listUsers('CLIENT');
      const preferred = clients.find(
        (user) => user.email.toLowerCase() === DEV_ACCOUNTS.CLIENT.email.toLowerCase(),
      );
      const fallback = clients[0];
      if (!preferred && !fallback) {
        throw new Error('No CLIENT users available in the database for seeding projects');
      }
      clientId = (preferred || fallback).id;
    }

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-NOTIF-NAV-${nonce.slice(-8)}`,
      name: `PW Notifications Nav Project ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(10).toISOString(),
    });

    const title = `PW Navigate Notification ${nonce}`;
    let notificationId: string | null = null;

    try {
      const created = await adminApi.createNotification({
        type: 'PROJECT_ASSIGNED',
        title,
        message: `PW navigate from notification (${nonce})`,
        relatedEntityId: project.id,
      });
      notificationId = created.id;

      await page.goto('notifications');
      await expect(page.getByRole('heading', {name: 'Notifications', level: 1})).toBeVisible();

      const item = page.locator('article.notification-item', {hasText: title});
      await expect(item).toBeVisible();

      await item.click();

      await expect(page).toHaveURL(new RegExp(`/projects/${project.id}(\\?|$)`));
      await expect(page.getByRole('heading', {name: 'Project Details'})).toBeVisible();
    } finally {
      if (notificationId) {
        try {
          await adminApi.deleteNotification(notificationId);
        } catch {
          // Ignore.
        }
      }
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });

  test('NOTIF-005: delete notification removes it from the list', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-notif-del');

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);

    const title = `PW Delete Notification ${nonce}`;
    let notificationId: string | null = null;

    try {
      const created = await adminApi.createNotification({
        type: 'TASK_STATUS_CHANGE',
        title,
        message: `PW delete notification (${nonce})`,
        relatedEntityId: null,
      });
      notificationId = created.id;

      await page.goto('notifications');
      await expect(page.getByRole('heading', {name: 'Notifications', level: 1})).toBeVisible();

      const item = page.locator('article.notification-item', {hasText: title});
      await expect(item).toBeVisible();

      const deleteButton = item.locator('button[aria-label="Delete notification"]');
      await expect(deleteButton).toHaveCount(1);

      await item.hover();
      await deleteButton.click();

      await expect(item).toHaveCount(0);
    } finally {
      if (notificationId) {
        try {
          await adminApi.deleteNotification(notificationId);
        } catch {
          // Ignore: the UI delete path may have already removed it.
        }
      }
      await apiContext.dispose();
    }
  });
});
