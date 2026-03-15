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

  test('PDET-001: project details route loads and shows tabs', async ({projectDetailsPage}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const nonce = uniqueNonce('pw-project-details');
    const code = `PW-${new Date().getFullYear()}-${nonce.slice(-6)}`;

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code,
      name: `PW Details Project ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(7).toISOString(),
    });

    try {
      await projectDetailsPage.goto(project.id);
      await expect(projectDetailsPage.page.getByRole('tab', {name: 'Overview'})).toBeVisible();
      await expect(projectDetailsPage.page.getByRole('tab', {name: 'Tasks'})).toBeVisible();
      await expect(projectDetailsPage.page.getByRole('tab', {name: 'Messages'})).toBeVisible();
      await expect(projectDetailsPage.page.getByRole('tab', {name: 'Files'})).toBeVisible();
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });

  test('PDET-002: finalize project disabled until tasks completed', async ({projectDetailsPage}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const nonce = uniqueNonce('pw-project-finalize-guard');
    const code = `PW-${new Date().getFullYear()}-${nonce.slice(-6)}`;

    const {client: adminApi, session: adminSession} = await CpmApiClient.login(
      apiContext,
      DEV_ACCOUNTS.ADMIN,
    );
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code,
      name: `PW Finalize Guard Project ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(7).toISOString(),
    });

    const description = `PW Task Guard ${nonce.slice(-10)}`;

    const task = await adminApi.createTask({
      projectId: project.id,
      creatorId: adminSession.user.id,
      assigneeId: adminSession.user.id,
      description,
      status: 'PENDING',
      priority: 'HIGH',
      dueDate: daysFromToday(5).toISOString(),
      comments: null,
    });

    try {
      await projectDetailsPage.goto(project.id);
      await projectDetailsPage.openTasksTab();

      const finalizeButton = projectDetailsPage.page
        .locator('.project-summary-actions')
        .getByRole('button', {name: /Finalize/});
      await expect(finalizeButton).toBeVisible();

      const card = projectDetailsPage.taskCardByDescription(description);
      await expect(card).toBeVisible();
      await expect(card.getByText('Pending')).toBeVisible();

      // When there are pending/in-progress tasks, finalization is blocked.
      await expect(finalizeButton).toBeDisabled();
      await expect(finalizeButton).toHaveAttribute('title', 'Complete all tasks before finalizing');

      // Complete the task through the edit modal.
      await card.getByRole('button', {name: 'Task actions'}).click();
      await card.getByRole('button', {name: 'Edit'}).click();

      const editDialog = projectDetailsPage.page.getByRole('dialog', {name: 'Edit Task'});
      await expect(editDialog).toBeVisible();
      await editDialog.getByRole('button', {name: 'In Progress'}).click();
      await editDialog.getByRole('button', {name: 'Apply Status Change'}).click();
      await expect(editDialog).toBeHidden();
      await expect(card.getByText('In Progress')).toBeVisible();

      await card.getByRole('button', {name: 'Task actions'}).click();
      await card.getByRole('button', {name: 'Edit'}).click();
      await expect(editDialog).toBeVisible();
      await editDialog.getByRole('button', {name: 'Performed'}).click();
      await editDialog.getByRole('button', {name: 'Apply Status Change'}).click();
      await expect(editDialog).toBeHidden();
      await expect(card.getByText('Performed')).toBeVisible();

      await card.getByRole('button', {name: 'Task actions'}).click();
      await card.getByRole('button', {name: 'Edit'}).click();
      await expect(editDialog).toBeVisible();
      await editDialog.getByRole('button', {name: 'Completed'}).click();
      await editDialog.getByRole('button', {name: 'Confirm & Complete'}).click();
      await expect(editDialog).toBeHidden();
      await expect(card.getByText('Completed')).toBeVisible();

      // After all tasks are completed, finalization becomes available.
      await expect(finalizeButton).toBeEnabled();
      await expect(finalizeButton).toHaveAttribute('title', 'Finalize project');
    } finally {
      try {
        await adminApi.deleteTask(task.id);
      } catch {
        // Ignore if deleted by cascade.
      }
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });

  test('PDET-003: finalize project succeeds for finalizable project', async ({projectDetailsPage}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const nonce = uniqueNonce('pw-project-finalize-success');
    const code = `PW-${new Date().getFullYear()}-${nonce.slice(-6)}`;

    const {client: adminApi, session: adminSession} = await CpmApiClient.login(
      apiContext,
      DEV_ACCOUNTS.ADMIN,
    );
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code,
      name: `PW Finalize Success Project ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(7).toISOString(),
    });

    const task = await adminApi.createTask({
      projectId: project.id,
      creatorId: adminSession.user.id,
      assigneeId: adminSession.user.id,
      description: `PW Completed Task ${nonce.slice(-10)}`,
      status: 'COMPLETED',
      priority: 'MEDIUM',
      dueDate: daysFromToday(5).toISOString(),
      comments: null,
    });

    try {
      await projectDetailsPage.goto(project.id);

      const finalizeButton = projectDetailsPage.page
        .locator('.project-summary-actions')
        .getByRole('button', {name: /Finalize/});
      await expect(finalizeButton).toBeEnabled();

      await finalizeButton.click();
      const finalizeDialog = projectDetailsPage.page.getByRole('dialog', {name: 'Finalize Project'});
      await expect(finalizeDialog).toBeVisible();
      await expect(finalizeDialog.getByText('✓ All tasks completed')).toBeVisible();

      await finalizeDialog.getByRole('button', {name: 'Finalize Project'}).click();
      await expect(finalizeDialog).toBeHidden();

      await expect(projectDetailsPage.page.locator('.project-summary-status')).toHaveText('Finalized');
      await expect(finalizeButton).toBeHidden();

      // Implemented behavior: messaging input becomes disabled when project is finalized.
      await projectDetailsPage.page.getByRole('tab', {name: 'Messages'}).click();
      await expect(projectDetailsPage.page.getByPlaceholder('Type a message...')).toBeDisabled();
    } finally {
      try {
        await adminApi.deleteTask(task.id);
      } catch {
        // Ignore if deleted by cascade.
      }
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });

  test('PDET-004: tab navigation persists via query param on refresh', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const nonce = uniqueNonce('pw-project-tab');
    const code = `PW-${new Date().getFullYear()}-${nonce.slice(-6)}`;

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code,
      name: `PW Tab Persist ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(7).toISOString(),
    });

    try {
      await page.goto(`projects/${project.id}?tab=files`);
      await expect(page).toHaveURL(new RegExp(`/projects/${project.id}\\?tab=files`));
      await expect(page.getByRole('heading', {name: 'Project Files'})).toBeVisible();

      await page.reload();

      await expect(page).toHaveURL(new RegExp(`/projects/${project.id}\\?tab=files`));
      await expect(page.getByRole('heading', {name: 'Project Files'})).toBeVisible();
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });

  test('PDET-005: invalid project id shows a safe error state (no crash)', async ({page}) => {
    await page.goto('projects/does-not-exist');

    await expect(page.getByRole('heading', {name: 'Project not found'})).toBeVisible();
    await expect(page.getByText('The requested project could not be loaded.')).toBeVisible();
    await expect(page.getByRole('tab', {name: 'Overview'})).toHaveCount(0);

    await page.getByRole('button', {name: 'Go Back'}).click();
    await page.waitForURL((url) => url.pathname.endsWith('/projects'));
    await expect(page.getByRole('button', {name: 'Create new project'})).toBeVisible();
  });

  test('PDET-006: prompts to finalize after completing the last pending task', async ({projectDetailsPage}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const nonce = uniqueNonce('pw-project-auto-finalize');
    const code = `PW-${new Date().getFullYear()}-${nonce.slice(-6)}`;

    const {client: adminApi, session: adminSession} = await CpmApiClient.login(
      apiContext,
      DEV_ACCOUNTS.ADMIN,
    );
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code,
      name: `PW Auto Finalize Prompt ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(7).toISOString(),
    });

    const description = `PW Finalize Prompt Task ${nonce.slice(-10)}`;
    const task = await adminApi.createTask({
      projectId: project.id,
      creatorId: adminSession.user.id,
      assigneeId: adminSession.user.id,
      description,
      status: 'PERFORMED',
      priority: 'MEDIUM',
      dueDate: daysFromToday(5).toISOString(),
      comments: null,
    });

    try {
      await projectDetailsPage.goto(project.id);
      await projectDetailsPage.openTasksTab();

      const card = projectDetailsPage.taskCardByDescription(description);
      await expect(card).toBeVisible();
      await expect(card.locator('.task-card-status')).toHaveText('Performed');

      await card.getByRole('button', {name: 'Task actions'}).click();
      await card.getByRole('button', {name: 'Edit'}).click();

      const editDialog = projectDetailsPage.page.getByRole('dialog', {name: 'Edit Task'});
      await expect(editDialog).toBeVisible();

      await editDialog.getByRole('button', {name: 'Completed'}).click();
      await editDialog.getByRole('button', {name: 'Confirm & Complete'}).click();
      await expect(editDialog).toBeHidden();

      const finalizeDialog = projectDetailsPage.page.getByRole('dialog', {name: 'Finalize Project'});
      await expect(finalizeDialog).toBeVisible();
      await expect(finalizeDialog.getByText('✓ All tasks completed')).toBeVisible();
    } finally {
      try {
        await adminApi.deleteTask(task.id);
      } catch {
        // Ignore if deleted by cascade.
      }
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });
});

test.describe('Projects permissions (critical)', () => {
  test('PROJ-012: special user can create a project (implementation divergence)', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const nonce = uniqueNonce('pw-proj-012');
    const code = `PW-${new Date().getFullYear()}-${nonce.slice(-6)}`;
    const name = `PW Special Project ${nonce}`;

    const specialEmail = `pw-special-${nonce}@example.com`;
    const specialPassword = `pw-special-${nonce}`;

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);

    const specialUser = await adminApi.createUser({
      username: `pw-special-${nonce}`,
      email: specialEmail,
      password: specialPassword,
      role: 'SPECIAL_USER',
    });

    try {
      await page.goto('login');
      await login(page, {email: specialEmail, password: specialPassword});

      await page.goto('projects');
      await expect(page.getByRole('heading', {name: 'Projects', exact: true})).toBeVisible();

      await page.getByRole('button', {name: 'Create new project'}).click();

      const dialog = page.getByRole('dialog');
      await expect(dialog.getByRole('heading', {name: 'Create New Project'})).toBeVisible();

      await dialog.locator('#project-code').fill(code);
      await dialog.locator('#project-year').fill(String(new Date().getFullYear()));
      await dialog.locator('#project-name').fill(name);

      const clientOptions = dialog.locator('#project-client option');
      await expect
        .poll(async () => clientOptions.count(), {timeout: 10_000})
        .toBeGreaterThan(1);
      await dialog.locator('#project-client').selectOption({index: 1});
      await dialog.locator('#project-type').selectOption('GIS');

      await dialog
        .locator('#project-contract-date')
        .fill(toDateInputValue(daysFromToday(0)));
      await dialog
        .locator('#project-delivery-date')
        .fill(toDateInputValue(daysFromToday(7)));

      await dialog.getByRole('button', {name: 'Create Project'}).click();

      await page.waitForURL((url) => url.pathname.includes('/projects/'));
      await expect(page.getByRole('button', {name: 'Go back to projects list'})).toBeVisible();
      await expect(page.getByRole('heading', {name})).toBeVisible();
      await expect(page.locator('main')).toContainText(code);
    } finally {
      await deleteProjectByCode(adminApi, code);
      try {
        await adminApi.deleteUser(specialUser.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });

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

test.describe('Finalized project visibility (critical)', () => {
  test('PROJ-013: finalized projects remain visible and accessible for clients', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const nonce = uniqueNonce('pw-project-finalized');
    const code = `PW-${new Date().getFullYear()}-${nonce.slice(-6)}`;
    const name = `PW Finalized Project ${nonce}`;

    const clientEmail = `pw-finalized-${nonce}@example.com`;
    const clientPassword = `pw-finalized-${nonce}`;
    const clientUsername = `pw-finalized-${nonce}`;

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

    await adminApi.updateProject(project.id, {status: 'FINALIZED'});

    try {
      await page.goto('login');
      await login(page, {email: clientEmail, password: clientPassword});

      await page.goto('projects');
      await expect(page.getByRole('heading', {name: 'Projects'})).toBeVisible();

      await page.getByLabel('Search projects').fill(code);

      const card = page.locator('.project-card').filter({
        has: page.locator('.project-card-code-text', {hasText: code}),
      });
      await expect(card).toBeVisible();
      await expect(card.locator('.project-card-finalized-badge')).toBeVisible();

      await card.click();
      await expect(page.getByRole('button', {name: 'Go back to projects list'})).toBeVisible();
      await expect(page.getByRole('heading', {name})).toBeVisible();
      await expect(page.locator('main')).toContainText(code);
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
