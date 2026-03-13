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
import {uniqueNonce, daysFromToday, toDateInputValue} from '../helpers/test-data';
import {DEV_ACCOUNTS, login} from '../helpers/auth';

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

async function deleteProjectByCode(adminApi: CpmApiClient, code: string): Promise<void> {
  const projects = await adminApi.listProjects();
  const match = projects.find((project) => project.code === code);
  if (!match) {
    return;
  }
  await adminApi.deleteProject(match.id);
}

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

  test('PROJ-004: admin can create a project from the Projects list', async ({projectListPage}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const nonce = uniqueNonce('pw-project-create');
    const code = `PW-${new Date().getFullYear()}-${nonce.slice(-6)}`;
    const name = `PW Created Project ${nonce}`;

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);
    const clientId = await resolveClientId(adminApi);

    try {
      await projectListPage.goto();

      await projectListPage.page.getByRole('button', {name: 'Create new project'}).click();
      const dialog = projectListPage.page.getByRole('dialog');
      await expect(dialog.getByRole('heading', {name: 'Create New Project'})).toBeVisible();

      await projectListPage.page.locator('#project-code').fill(code);
      await projectListPage.page.locator('#project-year').fill(String(new Date().getFullYear()));
      await projectListPage.page.locator('#project-name').fill(name);

      await projectListPage.page.locator('#project-client').selectOption(clientId);
      await projectListPage.page.locator('#project-type').selectOption('GIS');

      await projectListPage.page
        .locator('#project-contract-date')
        .fill(toDateInputValue(daysFromToday(0)));
      await projectListPage.page
        .locator('#project-delivery-date')
        .fill(toDateInputValue(daysFromToday(7)));

      await projectListPage.page.getByRole('button', {name: 'Create Project'}).click();

      // The app navigates to the new project's details page on success.
      await projectListPage.page.waitForURL((url) => url.pathname.includes('/projects/'));
      await expect(
        projectListPage.page.getByRole('button', {name: 'Go back to projects list'}),
      ).toBeVisible();
      await expect(projectListPage.page.getByRole('heading', {name})).toBeVisible();
      await expect(projectListPage.page.locator('main')).toContainText(code);
    } finally {
      await deleteProjectByCode(adminApi, code);
      await apiContext.dispose();
    }
  });

  test('PROJ-005: create project shows validation errors and blocks submission', async ({projectListPage}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const nonce = uniqueNonce('pw-project-validation');
    const code = `PW-${new Date().getFullYear()}-${nonce.slice(-6)}`;
    const name = `PW Validation Project ${nonce}`;

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);
    const clientId = await resolveClientId(adminApi);

    try {
      await projectListPage.goto();
      await projectListPage.page.getByRole('button', {name: 'Create new project'}).click();

      const createButton = projectListPage.page.getByRole('button', {name: 'Create Project'});
      await expect(createButton).toBeDisabled();

      // Trigger required field validation (client + type).
      await projectListPage.page.locator('#project-client').focus();
      await projectListPage.page.locator('#project-name').click();
      await expect(projectListPage.page.getByText('Please select a client')).toBeVisible();

      await projectListPage.page.locator('#project-type').focus();
      await projectListPage.page.locator('#project-name').click();
      await expect(projectListPage.page.getByText('Please select a project type')).toBeVisible();

      // Fill required fields with an invalid delivery date.
      await projectListPage.page.locator('#project-code').fill(code);
      await projectListPage.page.locator('#project-name').fill(name);
      await projectListPage.page.locator('#project-client').selectOption(clientId);
      await projectListPage.page.locator('#project-type').selectOption('GIS');

      await projectListPage.page
        .locator('#project-contract-date')
        .fill(toDateInputValue(daysFromToday(10)));
      await projectListPage.page
        .locator('#project-delivery-date')
        .fill(toDateInputValue(daysFromToday(5)));

      // Force validation.
      await projectListPage.page.locator('#project-delivery-date').blur();
      await expect(
        projectListPage.page.getByText('Delivery date must be after contract date'),
      ).toBeVisible();
      await expect(createButton).toBeDisabled();

      // Fix delivery date, validation clears and submit becomes enabled.
      await projectListPage.page
        .locator('#project-delivery-date')
        .fill(toDateInputValue(daysFromToday(20)));
      await projectListPage.page.locator('#project-delivery-date').blur();
      await expect(
        projectListPage.page.getByText('Delivery date must be after contract date'),
      ).toBeHidden();
      await expect(createButton).toBeEnabled();
    } finally {
      // Should not have created anything, but keep cleanup defensive.
      await deleteProjectByCode(adminApi, code);
      await apiContext.dispose();
    }
  });

  test('PROJ-010: empty state is friendly and actionable when filters match no projects', async ({projectListPage}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const nonce = uniqueNonce('pw-project-empty');
    const code = `PW-${new Date().getFullYear()}-${nonce.slice(-6)}`;

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code,
      name: `PW Empty State Seed ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(7).toISOString(),
    });

    try {
      await projectListPage.goto();
      await projectListPage.filterBySearch(code);
      await expect(projectListPage.projectCardByCode(code)).toBeVisible();

      // Apply a filter that yields no matches.
      await projectListPage.filterBySearch(`no-match-${nonce}`);

      await expect(projectListPage.page.getByRole('heading', {name: 'No projects match your filters'})).toBeVisible();
      await expect(
        projectListPage.page.getByText(
          "Try adjusting your search or filters to find what you're looking for.",
        ),
      ).toBeVisible();

      // Actionable: clear filters returns the list.
      await projectListPage.page.getByRole('button', {name: 'Clear Filters'}).click();
      await expect(projectListPage.projectCardByCode(code)).toBeVisible();
    } finally {
      await adminApi.deleteProject(project.id);
      await apiContext.dispose();
    }
  });

  test('PROJ-011: cancel create modal leaves data unchanged (no project created)', async ({projectListPage}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const nonce = uniqueNonce('pw-project-cancel-create');
    const code = `PW-${new Date().getFullYear()}-${nonce.slice(-6)}`;
    const name = `PW Cancel Create ${nonce}`;

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);
    const clientId = await resolveClientId(adminApi);

    try {
      await projectListPage.goto();
      await projectListPage.page.getByRole('button', {name: 'Create new project'}).click();
      const dialog = projectListPage.page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      await projectListPage.page.locator('#project-code').fill(code);
      await projectListPage.page.locator('#project-name').fill(name);
      await projectListPage.page.locator('#project-client').selectOption(clientId);
      await projectListPage.page.locator('#project-type').selectOption('GIS');
      await projectListPage.page
        .locator('#project-contract-date')
        .fill(toDateInputValue(daysFromToday(0)));
      await projectListPage.page
        .locator('#project-delivery-date')
        .fill(toDateInputValue(daysFromToday(7)));

      await dialog.getByRole('button', {name: 'Cancel', exact: true}).click();
      await expect(dialog).toBeHidden();

      await projectListPage.filterBySearch(code);
      await expect(projectListPage.projectCardByCode(code)).toBeHidden();

      const projects = await adminApi.listProjects();
      expect(projects.some((p) => p.code === code)).toBe(false);
    } finally {
      // Defensive cleanup in case a project was created unexpectedly.
      await deleteProjectByCode(adminApi, code);
      await apiContext.dispose();
    }
  });

  test('PROJ-011: cancel edit modal leaves project unchanged', async ({projectListPage}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const nonce = uniqueNonce('pw-project-cancel-edit');
    const code = `PW-${new Date().getFullYear()}-${nonce.slice(-6)}`;
    const originalName = `PW Cancel Edit ${nonce}`;

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code,
      name: originalName,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(7).toISOString(),
    });

    try {
      await projectListPage.goto();
      await projectListPage.filterBySearch(code);
      await expect(projectListPage.projectCardByCode(code)).toContainText(originalName);

      await projectListPage.clickEditProject(code);
      const dialog = projectListPage.page.getByRole('dialog');
      await projectListPage.page.locator('#project-name').fill(`${originalName} (not saved)`);
      await dialog.getByRole('button', {name: 'Cancel', exact: true}).click();
      await expect(dialog).toBeHidden();

      await projectListPage.filterBySearch(code);
      await expect(projectListPage.projectCardByCode(code)).toContainText(originalName);

      const projects = await adminApi.listProjects();
      const stored = projects.find((p) => p.code === code);
      expect(stored?.name).toBe(originalName);
    } finally {
      await adminApi.deleteProject(project.id);
      await apiContext.dispose();
    }
  });
});

test.describe('Projects permissions (critical)', () => {
  test('PROJ-009: non-admin cannot see project create/edit/delete controls', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const nonce = uniqueNonce('pw-project-perms');
    const code = `PW-${new Date().getFullYear()}-${nonce.slice(-6)}`;
    const name = `PW Permissions Project ${nonce}`;
    const clientEmail = `pw-client-${nonce}@example.com`;
    const clientPassword = `pw-client-${nonce}`;
    const clientUsername = `pw-client-${nonce}`;

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);
    const clientSession = await adminApi.register({
      username: clientUsername,
      email: clientEmail,
      password: clientPassword,
    });

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code,
      name,
      clientId: clientSession.user.id,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(7).toISOString(),
    });

    try {
      await page.goto('login');
      await login(page, {email: clientEmail, password: clientPassword});

      await page.goto('projects');
      await expect(page.getByRole('heading', {name: 'Projects'})).toBeVisible();

      await expect(page.getByRole('button', {name: 'Create new project'})).toHaveCount(0);

      const card = page.locator('.project-card').filter({
        has: page.locator('.project-card-code-text', {hasText: code}),
      });

      await expect(card).toBeVisible();
      await expect(card.getByRole('button', {name: 'Project actions'})).toHaveCount(0);
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      try {
        await adminApi.deleteUser(clientSession.user.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });
});

test.describe('Projects data isolation (critical)', () => {
  test('PROJ-008: client cannot see other clients\' projects (list + details)', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const nonce = uniqueNonce('pw-project-isolation');
    const codeA = `PW-${new Date().getFullYear()}-${nonce.slice(-6)}-A`;
    const codeB = `PW-${new Date().getFullYear()}-${nonce.slice(-6)}-B`;

    const clientEmailA = `pw-client-a-${nonce}@example.com`;
    const clientPasswordA = `pw-client-a-${nonce}`;
    const clientUsernameA = `pw-client-a-${nonce}`;

    const clientEmailB = `pw-client-b-${nonce}@example.com`;
    const clientPasswordB = `pw-client-b-${nonce}`;
    const clientUsernameB = `pw-client-b-${nonce}`;

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);

    const clientSessionA = await adminApi.register({
      username: clientUsernameA,
      email: clientEmailA,
      password: clientPasswordA,
    });

    const clientSessionB = await adminApi.register({
      username: clientUsernameB,
      email: clientEmailB,
      password: clientPasswordB,
    });

    const projectA = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: codeA,
      name: `PW Client A Project ${nonce}`,
      clientId: clientSessionA.user.id,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(7).toISOString(),
    });

    const projectB = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: codeB,
      name: `PW Client B Project ${nonce}`,
      clientId: clientSessionB.user.id,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(7).toISOString(),
    });

    try {
      await page.goto('login');
      await login(page, {email: clientEmailA, password: clientPasswordA});

      await page.goto('projects');
      await expect(page.getByRole('heading', {name: 'Projects'})).toBeVisible();

      const searchInput = page.getByLabel('Search projects');

      // Client A can see their own project.
      await searchInput.fill(codeA);
      await expect(
        page.locator('.project-card').filter({
          has: page.locator('.project-card-code-text', {hasText: codeA}),
        }),
      ).toBeVisible();

      // Client A cannot see Client B's project.
      await searchInput.fill(codeB);
      await expect(
        page.locator('.project-card').filter({
          has: page.locator('.project-card-code-text', {hasText: codeB}),
        }),
      ).toBeHidden();
      await expect(page.getByRole('heading', {name: 'No projects match your filters'})).toBeVisible();

      // Direct navigation to the other client's details should fail.
      await page.goto(`projects/${projectB.id}`);
      await expect(page.getByRole('heading', {name: 'Project not found'})).toBeVisible();
      await page.getByRole('button', {name: 'Go Back'}).click();
      await expect(page.getByRole('heading', {name: 'Projects'})).toBeVisible();
    } finally {
      try {
        await adminApi.deleteProject(projectA.id);
      } catch {
        // Ignore.
      }
      try {
        await adminApi.deleteProject(projectB.id);
      } catch {
        // Ignore.
      }
      try {
        await adminApi.deleteUser(clientSessionA.user.id);
      } catch {
        // Ignore.
      }
      try {
        await adminApi.deleteUser(clientSessionB.user.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });
});
