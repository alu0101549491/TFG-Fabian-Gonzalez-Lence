/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2026-03-13
 * @file e2e/critical/project-crud.spec.ts
 * @desc Critical E2E coverage for project CRUD flows.
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

test.describe('Projects CRUD (critical)', () => {
  test.use({storageState: AUTH_STATE_ADMIN_PATH});

  test('admin can view, edit, and delete a project', async ({projectListPage}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const nonce = uniqueNonce('pw-project');

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

    const code = `PW-${new Date().getFullYear()}-${nonce.slice(-6)}`;
    const originalName = `PW Project ${nonce}`;

    const contractDate = daysFromToday(0).toISOString();
    const deliveryDate = daysFromToday(7).toISOString();

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code,
      name: originalName,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate,
      deliveryDate,
    });

    try {
      await projectListPage.goto();
      await projectListPage.filterBySearch(code);

      const card = projectListPage.projectCardByCode(code);
      await expect(card).toBeVisible();
      await expect(card).toContainText(originalName);

      // Edit
      const updatedName = `${originalName} (updated)`;
      await projectListPage.clickEditProject(code);
      await projectListPage
        .page
        .locator('#project-name')
        .fill(updatedName);
      await projectListPage.page.getByRole('button', {name: 'Update Project'}).click();
      await expect(projectListPage.page.getByRole('dialog')).toBeHidden();

      await projectListPage.filterBySearch(code);
      await expect(projectListPage.projectCardByCode(code)).toContainText(updatedName);

      // Delete
      await projectListPage.clickDeleteProject(code);
      await projectListPage.confirmDeleteInModal();
      await expect(projectListPage.projectCardByCode(code)).toBeHidden();
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore: the UI delete path may have already removed it.
      }
      await apiContext.dispose();
    }
  });
});
