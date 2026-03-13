/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 13, 2026
 * @file e2e/critical/files-tab.spec.ts
 * @desc Critical E2E coverage for the Files tab section visibility and base rendering.
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

test.describe('Files tab (critical)', () => {
  test.use({storageState: AUTH_STATE_ADMIN_PATH});

  async function resolveClientId(adminApi: CpmApiClient): Promise<string> {
    const clients = await adminApi.listUsers('CLIENT');
    const preferred = clients.find(
      (user) => user.email.toLowerCase() === DEV_ACCOUNTS.CLIENT.email.toLowerCase(),
    );
    const fallback = clients[0];
    if (!preferred && !fallback) {
      throw new Error('No CLIENT users available in the database for seeding projects');
    }
    return (preferred || fallback).id;
  }

  test('FILE-001: files tab shows sections and file list renders', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-file-001');

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);
    const clientId = await resolveClientId(adminApi);

    const code = `PW-FILE-${nonce.slice(-8)}`;

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code,
      name: `PW Files Project ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(14).toISOString(),
    });

    try {
      await page.goto(`projects/${project.id}`);
      await expect(page).toHaveURL(new RegExp(`/projects/${project.id}(\\?|$)`));

      await page.getByRole('tab', {name: /^Files$/}).click();
      await expect(page.getByRole('heading', {name: 'Project Files'})).toBeVisible();

      const sectionSelect = page.getByLabel('Upload to Section');
      await expect(sectionSelect).toBeVisible();

      const optionTexts = await sectionSelect.locator('option').allTextContents();
      expect(optionTexts).toEqual(
        expect.arrayContaining(['ReportAndAnnexes', 'Plans', 'Specifications', 'Budget']),
      );

      await expect(page.getByPlaceholder('Search files...')).toBeVisible();
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
