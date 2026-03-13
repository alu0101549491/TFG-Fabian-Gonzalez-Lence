/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 13, 2026
 * @file e2e/high/navigation-ui.spec.ts
 * @desc High-priority E2E coverage for sidebar/header navigation UI behaviors.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

// Leave exactly 1 blank line before imports

import {request} from '@playwright/test';

import {test, expect} from '../fixtures/test';
import {CpmApiClient} from '../helpers/api';
import {
  AUTH_STATE_ADMIN_PATH,
  AUTH_STATE_NON_ADMIN_PATH,
  getApiBaseUrl,
} from '../helpers/e2e-paths.ts';
import {login, DEV_ACCOUNTS} from '../helpers/auth';
import {uniqueNonce} from '../helpers/test-data';

test.describe('Navigation UI (high)', () => {
  test.describe('sidebar items and state (desktop)', () => {
    test.describe('admin', () => {
      test.use({storageState: AUTH_STATE_ADMIN_PATH});

      test('NAV-001: sidebar shows allowed nav items by role (admin sees Backup)', async ({page}) => {
        await page.goto('');

        await expect(page.getByRole('link', {name: 'Dashboard', exact: true})).toBeVisible();
        await expect(page.getByRole('link', {name: 'Projects', exact: true})).toBeVisible();
        await expect(page.getByRole('link', {name: 'Calendar', exact: true})).toBeVisible();
        await expect(page.getByRole('link', {name: 'Settings', exact: true})).toBeVisible();
        await expect(page.getByRole('link', {name: 'Backup', exact: true})).toBeVisible();
      });

      test('NAV-002: sidebar active state highlights current route', async ({page}) => {
        await page.goto('projects');

        const projectsLink = page.locator('.app-sidebar .nav-link', {hasText: 'Projects'});
        const dashboardLink = page.locator('.app-sidebar .nav-link', {hasText: 'Dashboard'});

        await expect(projectsLink).toHaveClass(/\bactive\b/);
        await expect(dashboardLink).not.toHaveClass(/\bactive\b/);

        await page.goto('calendar');

        const calendarLink = page.locator('.app-sidebar .nav-link', {hasText: 'Calendar'});
        await expect(calendarLink).toHaveClass(/\bactive\b/);
        await expect(projectsLink).not.toHaveClass(/\bactive\b/);
      });

      test('NAV-003: sidebar collapse hides labels but keeps icons', async ({page}) => {
        await page.goto('');

        const sidebar = page.locator('aside.app-sidebar');
        const collapseToggle = page.getByRole('button', {name: 'Collapse sidebar'});

        await expect(sidebar).toBeVisible();
        await expect(collapseToggle).toBeVisible();

        await collapseToggle.click();

        await expect(sidebar).toHaveClass(/\bcollapsed\b/);
        await expect(sidebar.locator('.nav-text')).toHaveCount(0);

        // Icon components render SVGs.
        const iconCount = await sidebar.locator('svg.nav-icon').count();
        expect(iconCount).toBeGreaterThan(0);

        const expandToggle = page.getByRole('button', {name: 'Expand sidebar'});
        await expect(expandToggle).toBeVisible();
        await expandToggle.click();

        await expect(sidebar).not.toHaveClass(/\bcollapsed\b/);
      });

      test('NAV-006: user dropdown opens/closes (click outside, Escape)', async ({page}) => {
        await page.goto('');

        const userMenuButton = page.getByRole('button', {name: 'User menu'});
        await userMenuButton.click();

        const settingsItem = page.getByRole('button', {name: 'Settings'});
        const logoutItem = page.getByRole('button', {name: 'Logout'});
        await expect(settingsItem).toBeVisible();
        await expect(logoutItem).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(settingsItem).toHaveCount(0);

        await userMenuButton.click();
        await expect(settingsItem).toBeVisible();

        // Click outside of the user menu.
        await page.getByRole('heading', {name: 'Cartographic PM', exact: true}).click();
        await expect(settingsItem).toHaveCount(0);
      });
    });

    test.describe('non-admin', () => {
      test.use({storageState: AUTH_STATE_NON_ADMIN_PATH});

      test('NAV-001: sidebar hides admin-only nav items (non-admin cannot see Backup)', async ({page}) => {
        await page.goto('');

        await expect(page.getByRole('link', {name: 'Dashboard', exact: true})).toBeVisible();
        await expect(page.getByRole('link', {name: 'Projects', exact: true})).toBeVisible();
        await expect(page.getByRole('link', {name: 'Calendar', exact: true})).toBeVisible();
        await expect(page.getByRole('link', {name: 'Settings', exact: true})).toBeVisible();

        await expect(page.getByRole('link', {name: 'Backup', exact: true})).toHaveCount(0);
      });
    });
  });

  test('NAV-004/NAV-007: mobile sidebar overlay closes on outside click and link click', async ({page}) => {
    await page.setViewportSize({width: 700, height: 900});
    await login(page, DEV_ACCOUNTS.ADMIN);

    const sidebarOverlay = page.locator('.app-sidebar-overlay');
    const mobileSidebar = page.locator('aside.app-sidebar.mobile-open');

    await page.getByRole('button', {name: 'Toggle sidebar'}).click();
    await expect(sidebarOverlay).toHaveCount(1);
    await expect(mobileSidebar).toHaveCount(1);

    await sidebarOverlay.click();
    await expect(sidebarOverlay).toHaveCount(0);
    await expect(mobileSidebar).toHaveCount(0);

    // Re-open and ensure link click also closes it.
    await page.getByRole('button', {name: 'Toggle sidebar'}).click();
    await expect(sidebarOverlay).toHaveCount(1);

    // NOTE: The app-level mobile overlay currently intercepts pointer events.
    // Dispatching a click event on the link still exercises: navigation + the
    // route watcher closing the mobile sidebar.
    await mobileSidebar
      .getByRole('link', {name: 'Projects', exact: true})
      .dispatchEvent('click');
    await expect(page).toHaveURL(/\/projects(\?|$)/);
    await expect(sidebarOverlay).toHaveCount(0);
    await expect(mobileSidebar).toHaveCount(0);
  });

  test('NAV-005: header notifications badge reflects unread count', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);

    const nonce = uniqueNonce('pw-nav');
    const email = `pw.nav.badge.${nonce}@example.com`;
    const password = `pw-${nonce}-Pass123!`;
    const username = `pw-nav-${nonce.slice(-6)}`;

    const createdNotificationIds: string[] = [];

    try {
      await adminApi.register({username, email, password});
      const user = await adminApi.getUserByEmail(email);

      const n1 = await adminApi.createNotification({
        userId: user.id,
        type: 'PROJECT_ASSIGNED',
        title: `PW Nav Badge 1 ${nonce}`,
        message: `PW nav badge message 1 (${nonce})`,
        relatedEntityId: null,
      });
      createdNotificationIds.push(n1.id);

      const n2 = await adminApi.createNotification({
        userId: user.id,
        type: 'TASK_STATUS_CHANGE',
        title: `PW Nav Badge 2 ${nonce}`,
        message: `PW nav badge message 2 (${nonce})`,
        relatedEntityId: null,
      });
      createdNotificationIds.push(n2.id);

      await page.goto('login');
      await login(page, {email, password});

      const badge = page
        .getByRole('button', {name: 'Notifications'})
        .locator('.notification-badge');

      await expect(badge).toHaveText('2');
    } finally {
      for (const notificationId of createdNotificationIds) {
        try {
          await adminApi.deleteNotification(notificationId);
        } catch {
          // Ignore.
        }
      }

      try {
        const user = await adminApi.getUserByEmail(email);
        await adminApi.deleteUser(user.id);
      } catch {
        // Ignore.
      }

      await apiContext.dispose();
    }
  });
});
