/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 13, 2026
 * @file e2e/medium/dashboard.spec.ts
 * @desc Medium-priority E2E coverage for dashboard widgets and entry points.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

// Leave exactly 1 blank line before imports

import {request, type Page} from '@playwright/test';

import {test, expect} from '../fixtures/test';
import {CpmApiClient} from '../helpers/api';
import {
  AUTH_STATE_ADMIN_PATH,
  AUTH_STATE_NON_ADMIN_PATH,
  getApiBaseUrl,
} from '../helpers/e2e-paths.ts';
import {uniqueNonce, daysFromToday} from '../helpers/test-data';
import {DEV_ACCOUNTS} from '../helpers/auth';

type LocalStorageUser = {
  role?: string;
};

/**
 * Reads the CPM user role from localStorage (set by auth storage state).
 */
async function getCurrentUserRole(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const raw = window.localStorage.getItem('cpm_user');
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as LocalStorageUser;
      return typeof parsed.role === 'string' ? parsed.role : null;
    } catch {
      return null;
    }
  });
}

test.describe('Dashboard (medium)', () => {
  test.describe('admin', () => {
    test.use({storageState: AUTH_STATE_ADMIN_PATH});

    test('DASH-001: loads core widgets', async ({page}) => {
      await page.goto('');

      await expect(page.getByRole('heading', {name: 'Dashboard'})).toBeVisible();
      await expect(page.getByLabel('Project statistics')).toBeVisible();

      await expect(
        page
          .locator('section.dashboard-section.recent-projects')
          .getByRole('heading', {name: 'Recent Projects'}),
      ).toBeVisible();

      await expect(
        page
          .locator('section.dashboard-section.upcoming-deadlines')
          .getByRole('heading', {name: 'Upcoming Deadlines'}),
      ).toBeVisible();

      await expect(
        page
          .locator('section.dashboard-section.recent-notifications')
          .getByRole('heading', {name: 'Recent Activity'}),
      ).toBeVisible();

      await expect(
        page
          .locator('section.dashboard-section.mini-calendar')
          .getByRole('heading', {name: 'Calendar'}),
      ).toBeVisible();
    });

    test('DASH-003: create project entry point is visible for allowed roles', async ({page}) => {
      await page.goto('');
      await expect(page.getByRole('button', {name: 'Create new project'})).toBeVisible();
    });

    test('DASH-004: clicking a recent project navigates to details', async ({page}) => {
      const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
      const nonce = uniqueNonce('pw-dash');

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

      const code = `PW-DASH-${nonce.slice(-8)}`;
      const name = `PW Dashboard Project ${nonce}`;

      const project = await adminApi.createProject({
        year: new Date().getFullYear(),
        code,
        name,
        clientId,
        type: 'GIS',
        coordinateX: null,
        coordinateY: null,
        contractDate: daysFromToday(0).toISOString(),
        deliveryDate: daysFromToday(7).toISOString(),
      });

      try {
        await page.goto('');

        const recentProjects = page.locator('section.dashboard-section.recent-projects');
        const projectCard = recentProjects.locator('article.project-card', {hasText: code});

        await expect(projectCard).toBeVisible();
        await projectCard.click();

        await expect(page).toHaveURL(new RegExp(`/projects/${project.id}(\\?|$)`));
      } finally {
        try {
          await adminApi.deleteProject(project.id);
        } catch {
          // Ignore.
        }
        await apiContext.dispose();
      }
    });
  });

  test.describe('non-admin', () => {
    test.use({storageState: AUTH_STATE_NON_ADMIN_PATH});

    test('DASH-003: create project entry point follows role permissions', async ({page}) => {
      await page.goto('');

      const role = await getCurrentUserRole(page);
      const createButton = page.getByRole('button', {name: 'Create new project'});

      if (role === 'SPECIAL_USER') {
        await expect(createButton).toBeVisible();
        return;
      }

      await expect(createButton).toBeHidden();
    });
  });
});
