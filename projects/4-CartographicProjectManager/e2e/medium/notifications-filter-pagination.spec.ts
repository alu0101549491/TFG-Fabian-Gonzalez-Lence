/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 13, 2026
 * @file e2e/medium/notifications-filter-pagination.spec.ts
 * @desc Deterministic E2E coverage for notifications filtering and pagination.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

// Leave exactly 1 blank line before imports

import {request, expect as baseExpect} from '@playwright/test';

import {test, expect} from '../fixtures/test';
import {CpmApiClient} from '../helpers/api';
import {getApiBaseUrl} from '../helpers/e2e-paths.ts';
import {uniqueNonce} from '../helpers/test-data';
import {DEV_ACCOUNTS, register} from '../helpers/auth';

test.describe('Notifications filters + pagination (medium)', () => {
  test('NOTIF-002: filter notifications by type and unread', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-notif-filter');

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);

    const userEmail = `pw.notif.filter.${nonce}@example.com`;
    const userPassword = `pw-${nonce}-Pass123!`;
    const username = `pw-notif-filter-${nonce.slice(-6)}`;

    await register(page, {
      username,
      email: userEmail,
      password: userPassword,
    });

    const user = await adminApi.getUserByEmail(userEmail);

    const messageTitle = `PW Filter Message ${nonce}`;
    const taskTitle = `PW Filter Task ${nonce}`;
    const projectTitle = `PW Filter Project ${nonce}`;

    const createdIds: string[] = [];

    try {
      createdIds.push(
        (await adminApi.createNotification({
          userId: user.id,
          type: 'NEW_MESSAGE',
          title: messageTitle,
          message: `PW message notif (${nonce})`,
          relatedEntityId: null,
        })).id,
      );

      createdIds.push(
        (await adminApi.createNotification({
          userId: user.id,
          type: 'TASK_STATUS_CHANGE',
          title: taskTitle,
          message: `PW task notif (${nonce})`,
          relatedEntityId: null,
        })).id,
      );

      createdIds.push(
        (await adminApi.createNotification({
          userId: user.id,
          type: 'PROJECT_ASSIGNED',
          title: projectTitle,
          message: `PW project notif (${nonce})`,
          relatedEntityId: null,
        })).id,
      );

      await page.goto('notifications');
      await expect(page.getByRole('heading', {name: 'Notifications', level: 1})).toBeVisible();

      const filterSelect = page.getByLabel('Filter notifications');
      await expect(filterSelect).toBeVisible();

      const messageItem = page.locator('article.notification-item', {hasText: messageTitle});
      const taskItem = page.locator('article.notification-item', {hasText: taskTitle});
      const projectItem = page.locator('article.notification-item', {hasText: projectTitle});

      await expect(messageItem).toBeVisible();
      await expect(taskItem).toBeVisible();
      await expect(projectItem).toBeVisible();

      await filterSelect.selectOption('task');
      await expect(taskItem).toBeVisible();
      await expect(messageItem).toHaveCount(0);
      await expect(projectItem).toHaveCount(0);

      await filterSelect.selectOption('message');
      await expect(page.locator('article.notification-item', {hasText: messageTitle})).toBeVisible();
      await expect(page.locator('article.notification-item', {hasText: taskTitle})).toHaveCount(0);
      await expect(page.locator('article.notification-item', {hasText: projectTitle})).toHaveCount(0);

      await filterSelect.selectOption('project');
      await expect(page.locator('article.notification-item', {hasText: projectTitle})).toBeVisible();
      await expect(page.locator('article.notification-item', {hasText: taskTitle})).toHaveCount(0);
      await expect(page.locator('article.notification-item', {hasText: messageTitle})).toHaveCount(0);

      await filterSelect.selectOption('all');
      await expect(page.locator('article.notification-item', {hasText: messageTitle})).toBeVisible();
      await expect(page.locator('article.notification-item', {hasText: taskTitle})).toBeVisible();
      await expect(page.locator('article.notification-item', {hasText: projectTitle})).toBeVisible();

      await page.locator('article.notification-item', {hasText: messageTitle}).click();

      // Wait until it becomes read (unread class removed), then apply unread filter.
      await baseExpect
        .poll(async () => {
          const classAttr = await page
            .locator('article.notification-item', {hasText: messageTitle})
            .getAttribute('class');
          return classAttr?.includes('notification-item-unread') ?? false;
        })
        .toBeFalsy();

      await filterSelect.selectOption('unread');
      await expect(page.locator('article.notification-item', {hasText: messageTitle})).toHaveCount(0);
      await expect(page.locator('article.notification-item', {hasText: taskTitle})).toBeVisible();
      await expect(page.locator('article.notification-item', {hasText: projectTitle})).toBeVisible();
    } finally {
      for (const id of createdIds) {
        try {
          await adminApi.deleteNotification(id);
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

  test('NOTIF-006: load more pagination reveals older notifications', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-notif-page');

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);

    const userEmail = `pw.notif.page.${nonce}@example.com`;
    const userPassword = `pw-${nonce}-Pass123!`;
    const username = `pw-notif-page-${nonce.slice(-6)}`;

    await register(page, {
      username,
      email: userEmail,
      password: userPassword,
    });

    const user = await adminApi.getUserByEmail(userEmail);

    const createdIds: string[] = [];
    const titles: string[] = [];

    try {
      // Store pagination limit is 20; create 25 to force 2 pages.
      for (let i = 1; i <= 25; i++) {
        const title = `PW Page ${String(i).padStart(2, '0')} ${nonce}`;
        titles.push(title);
        const created = await adminApi.createNotification({
          userId: user.id,
          type: 'TASK_STATUS_CHANGE',
          title,
          message: `PW pagination (${nonce})`,
          relatedEntityId: null,
        });
        createdIds.push(created.id);
      }

      const oldestTitle = titles[0];

      await page.goto('notifications');
      await expect(page.getByRole('heading', {name: 'Notifications', level: 1})).toBeVisible();

      await expect(page.locator('article.notification-item', {hasText: titles[24]})).toBeVisible();
      await expect(page.locator('article.notification-item', {hasText: oldestTitle})).toHaveCount(0);

      const list = page.locator('div.notification-list-content');
      await expect(list).toBeVisible();

      await list.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });

      await expect(
        page.locator('article.notification-item', {hasText: oldestTitle}),
      ).toBeVisible({timeout: 15_000});
    } finally {
      for (const id of createdIds) {
        try {
          await adminApi.deleteNotification(id);
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
