/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 13, 2026
 * @file e2e/medium/projects-filter-sort.spec.ts
 * @desc Deterministic E2E coverage for projects list search, filters, and sorting.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

// Leave exactly 1 blank line before imports

import {request} from '@playwright/test';

import {test, expect} from '../fixtures/test';
import {CpmApiClient, type ProjectDto} from '../helpers/api';
import {AUTH_STATE_ADMIN_PATH, getApiBaseUrl} from '../helpers/e2e-paths.ts';
import {daysFromToday, uniqueNonce} from '../helpers/test-data';
import {DEV_ACCOUNTS} from '../helpers/auth';

async function seedClientId(adminApi: CpmApiClient): Promise<string> {
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

async function cleanupProjects(adminApi: CpmApiClient, projects: ProjectDto[]): Promise<void> {
  for (const project of projects) {
    try {
      // Some backends forbid deleting finalized projects; ensure we can delete.
      await adminApi.updateProject(project.id, {status: 'ACTIVE'});
    } catch {
      // Ignore.
    }

    try {
      await adminApi.deleteProject(project.id);
    } catch {
      // Ignore.
    }
  }
}

test.describe('Projects list filtering and sorting (medium)', () => {
  test.use({storageState: AUTH_STATE_ADMIN_PATH});

  test('PROJ-002/003: search, filter by status/type, and sort projects deterministically', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);

    const nonce = uniqueNonce('pw-proj-list');
    const clientId = await seedClientId(adminApi);

    const createdProjects: ProjectDto[] = [];

    const year = new Date().getFullYear();

    try {
      const projectA = await adminApi.createProject({
        year,
        code: `PW-${nonce}-A`,
        name: `PW Project Alpha ${nonce}`,
        clientId,
        type: 'GIS',
        coordinateX: null,
        coordinateY: null,
        contractDate: daysFromToday(0).toISOString(),
        deliveryDate: daysFromToday(10).toISOString(),
      });
      createdProjects.push(projectA);

      const projectB = await adminApi.createProject({
        year,
        code: `PW-${nonce}-B`,
        name: `PW Project Beta ${nonce}`,
        clientId,
        type: 'CADASTRE',
        coordinateX: null,
        coordinateY: null,
        contractDate: daysFromToday(0).toISOString(),
        deliveryDate: daysFromToday(9).toISOString(),
      });
      createdProjects.push(projectB);

      const projectC = await adminApi.createProject({
        year,
        code: `PW-${nonce}-C`,
        name: `PW Project Gamma ${nonce}`,
        clientId,
        type: 'GIS',
        coordinateX: null,
        coordinateY: null,
        contractDate: daysFromToday(0).toISOString(),
        deliveryDate: daysFromToday(8).toISOString(),
      });
      createdProjects.push(projectC);

      // Make one project finalized so the status filter is deterministic.
      await adminApi.updateProject(projectB.id, {status: 'FINALIZED'});

      await page.goto('projects');
      await expect(page.getByRole('heading', {name: 'Projects'})).toBeVisible();

      const searchInput = page.getByLabel('Search projects');
      const statusSelect = page.getByLabel('Filter by status');
      const typeSelect = page.getByLabel('Filter by type');
      const sortSelect = page.getByLabel('Sort projects');

      // Narrow the view to only our seeded projects.
      await searchInput.fill(nonce);

      const grid = page.locator('.projects-grid');
      await expect(grid).toBeVisible();

      const cardA = page.locator('article.project-card', {hasText: projectA.code});
      const cardB = page.locator('article.project-card', {hasText: projectB.code});
      const cardC = page.locator('article.project-card', {hasText: projectC.code});

      await expect(cardA).toBeVisible();
      await expect(cardB).toBeVisible();
      await expect(cardC).toBeVisible();

      // PROJ-002: search filters project list.
      await searchInput.fill(`${nonce}-A`);
      await expect(cardA).toBeVisible();
      await expect(cardB).toBeHidden();
      await expect(cardC).toBeHidden();

      // Reset search.
      await searchInput.fill(nonce);

      // PROJ-003: filter by type.
      await typeSelect.selectOption('GIS');
      await expect(cardA).toBeVisible();
      await expect(cardC).toBeVisible();
      await expect(cardB).toBeHidden();

      // PROJ-003: filter by status (Finalized).
      await typeSelect.selectOption('');
      await statusSelect.selectOption({label: 'Finalized'});
      await expect(cardB).toBeVisible();
      await expect(cardA).toBeHidden();
      await expect(cardC).toBeHidden();

      // Clear status filter.
      await statusSelect.selectOption({label: 'All Statuses'});
      await expect(cardA).toBeVisible();
      await expect(cardB).toBeVisible();
      await expect(cardC).toBeVisible();

      // PROJ-003: sort order.
      await sortSelect.selectOption('code');

      const codesInOrder = await page
        .locator('.projects-grid .project-card-code-text')
        .allTextContents();

      const relevantCodes = codesInOrder
        .map((code) => code.trim())
        .filter((code) => code.includes(nonce));

      expect(relevantCodes).toEqual([projectA.code, projectB.code, projectC.code]);

      await sortSelect.selectOption('name');

      const namesInOrder = await page
        .locator('.projects-grid .project-card-title')
        .allTextContents();

      const relevantNames = namesInOrder
        .map((name) => name.trim())
        .filter((name) => name.includes(nonce));

      expect(relevantNames).toEqual([projectA.name, projectB.name, projectC.name]);
    } finally {
      await cleanupProjects(adminApi, createdProjects);
      await apiContext.dispose();
    }
  });
});
