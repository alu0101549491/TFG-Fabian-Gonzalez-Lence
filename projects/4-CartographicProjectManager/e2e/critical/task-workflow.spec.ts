/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2026-03-13
 * @file e2e/critical/task-workflow.spec.ts
 * @desc Critical E2E coverage for basic task workflow inside a project.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

// Leave exactly 1 blank line before imports

import * as fs from 'node:fs';

import {request} from '@playwright/test';

import {test, expect} from '../fixtures/test';
import {CpmApiClient} from '../helpers/api';
import {
  AUTH_STATE_ADMIN_PATH,
  AUTH_STATE_NON_ADMIN_PATH,
  getApiBaseUrl,
} from '../helpers/e2e-paths.ts';
import {uniqueNonce, daysFromToday} from '../helpers/test-data';
import {DEV_ACCOUNTS} from '../helpers/auth';

test.describe('Tasks workflow (critical)', () => {
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

  function readUserFromStorageState(storageStatePath: string): {id: string; email?: string} {
    const raw = fs.readFileSync(storageStatePath, 'utf-8');
    const parsed = JSON.parse(raw) as {
      origins?: Array<{
        origin?: string;
        localStorage?: Array<{name: string; value: string}>;
      }>;
    };

    const entries = parsed.origins
      ?.flatMap((origin) => origin.localStorage ?? [])
      .filter(Boolean);

    const userEntry = entries?.find((entry) => entry.name === 'cpm_user');
    if (!userEntry) {
      throw new Error(`Missing cpm_user in storageState: ${storageStatePath}`);
    }

    const user = JSON.parse(userEntry.value) as {id?: string; email?: string};
    if (!user.id) {
      throw new Error(`Missing user id inside cpm_user storageState: ${storageStatePath}`);
    }

    return {id: user.id, email: user.email};
  }

  test.describe('as admin', () => {
    test.use({storageState: AUTH_STATE_ADMIN_PATH});

    test('TASK-001: task list filters by status', async ({projectDetailsPage}) => {
      const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

      const {client: adminApi, session: adminSession} = await CpmApiClient.login(
        apiContext,
        DEV_ACCOUNTS.ADMIN,
      );

      const nonce = uniqueNonce('pw-task-001');
      const clientId = await resolveClientId(adminApi);
      const project = await adminApi.createProject({
        year: new Date().getFullYear(),
        code: `PW-TASK-${nonce.slice(-8)}`,
        name: `PW Task Filter ${nonce}`,
        clientId,
        type: 'GIS',
        coordinateX: null,
        coordinateY: null,
        contractDate: daysFromToday(0).toISOString(),
        deliveryDate: daysFromToday(10).toISOString(),
      });

      const pendingDescription = `PW Pending ${nonce.slice(-10)}`;
      const completedDescription = `PW Completed ${nonce.slice(-10)}`;

      const pendingTask = await adminApi.createTask({
        projectId: project.id,
        creatorId: adminSession.user.id,
        assigneeId: adminSession.user.id,
        description: pendingDescription,
        status: 'PENDING',
        priority: 'MEDIUM',
        dueDate: daysFromToday(5).toISOString(),
        comments: null,
      });

      const completedTask = await adminApi.createTask({
        projectId: project.id,
        creatorId: adminSession.user.id,
        assigneeId: adminSession.user.id,
        description: completedDescription,
        status: 'COMPLETED',
        priority: 'LOW',
        dueDate: daysFromToday(3).toISOString(),
        comments: null,
      });

      try {
        await projectDetailsPage.goto(project.id);
        await projectDetailsPage.openTasksTab();

        await expect(projectDetailsPage.taskCardByDescription(pendingDescription)).toBeVisible();
        await expect(projectDetailsPage.taskCardByDescription(completedDescription)).toBeVisible();

        const statusFilter = projectDetailsPage.page.getByLabel('Filter tasks by status');
        await statusFilter.selectOption('COMPLETED');
        await expect(projectDetailsPage.taskCardByDescription(pendingDescription)).toHaveCount(0);
        await expect(projectDetailsPage.taskCardByDescription(completedDescription)).toBeVisible();

        await statusFilter.selectOption('PENDING');
        await expect(projectDetailsPage.taskCardByDescription(pendingDescription)).toBeVisible();
        await expect(projectDetailsPage.taskCardByDescription(completedDescription)).toHaveCount(0);

        await statusFilter.selectOption({label: 'All Tasks'});
        await expect(projectDetailsPage.taskCardByDescription(pendingDescription)).toBeVisible();
        await expect(projectDetailsPage.taskCardByDescription(completedDescription)).toBeVisible();
      } finally {
        try {
          await adminApi.deleteTask(pendingTask.id);
        } catch {
          // Ignore if deleted by cascade.
        }
        try {
          await adminApi.deleteTask(completedTask.id);
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

    test('TASK-002: admin can create a task', async ({projectDetailsPage}) => {
      const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

      const {client: adminApi} = await CpmApiClient.login(
        apiContext,
        DEV_ACCOUNTS.ADMIN,
      );

      const nonce = uniqueNonce('pw-task-002');
      const clientId = await resolveClientId(adminApi);
      const project = await adminApi.createProject({
        year: new Date().getFullYear(),
        code: `PW-TASK-${nonce.slice(-8)}`,
        name: `PW Task Create ${nonce}`,
        clientId,
        type: 'GIS',
        coordinateX: null,
        coordinateY: null,
        contractDate: daysFromToday(0).toISOString(),
        deliveryDate: daysFromToday(10).toISOString(),
      });

      const description = `PW Create ${nonce.slice(-10)}`;

      try {
        await projectDetailsPage.goto(project.id);
        await projectDetailsPage.openTasksTab();

        await projectDetailsPage.clickNewTask();
        await projectDetailsPage.page.locator('#task-description').fill(description);
        await projectDetailsPage.page.locator('#task-assignee').selectOption({index: 1});
        await projectDetailsPage.page.locator('#task-priority').selectOption('HIGH');
        await projectDetailsPage.page
          .locator('#task-due-date')
          .fill(daysFromToday(6).toISOString().slice(0, 10));

        await projectDetailsPage.page.getByRole('button', {name: 'Create Task'}).click();
        await expect(projectDetailsPage.taskCardByDescription(description)).toBeVisible();
      } finally {
        try {
          await adminApi.deleteProject(project.id);
        } catch {
          // Ignore.
        }
        await apiContext.dispose();
      }
    });

    test('TASK-005: edit task updates fields', async ({projectDetailsPage}) => {
      const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

      const {client: adminApi, session: adminSession} = await CpmApiClient.login(
        apiContext,
        DEV_ACCOUNTS.ADMIN,
      );

      const nonce = uniqueNonce('pw-task-005');
      const clientId = await resolveClientId(adminApi);
      const project = await adminApi.createProject({
        year: new Date().getFullYear(),
        code: `PW-TASK-${nonce.slice(-8)}`,
        name: `PW Task Edit ${nonce}`,
        clientId,
        type: 'GIS',
        coordinateX: null,
        coordinateY: null,
        contractDate: daysFromToday(0).toISOString(),
        deliveryDate: daysFromToday(10).toISOString(),
      });

      const originalDescription = `PW Edit Orig ${nonce.slice(-10)}`;
      const updatedDescription = `PW Edit Updated ${nonce.slice(-10)}`;

      const task = await adminApi.createTask({
        projectId: project.id,
        creatorId: adminSession.user.id,
        assigneeId: adminSession.user.id,
        description: originalDescription,
        status: 'PENDING',
        priority: 'LOW',
        dueDate: daysFromToday(5).toISOString(),
        comments: null,
      });

      try {
        await projectDetailsPage.goto(project.id);
        await projectDetailsPage.openTasksTab();

        const originalCard = projectDetailsPage.taskCardByDescription(originalDescription);
        await expect(originalCard).toBeVisible();

        await originalCard.getByRole('button', {name: 'Task actions'}).click();
        await originalCard.getByRole('button', {name: 'Edit'}).click();

        const editDialog = projectDetailsPage.page.getByRole('dialog');
        await expect(editDialog.locator('#edit-task-title')).toBeVisible();

        await editDialog.locator('#task-description').fill(updatedDescription);
        await editDialog.locator('#task-priority').selectOption('HIGH');
        await editDialog.locator('#task-due-date').fill(daysFromToday(7).toISOString().slice(0, 10));

        await editDialog.getByRole('button', {name: 'Update Task'}).click();
        await expect(editDialog).toHaveCount(0);

        await expect(projectDetailsPage.taskCardByDescription(originalDescription)).toHaveCount(0);
        await expect(projectDetailsPage.taskCardByDescription(updatedDescription)).toBeVisible();
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

    test('TASK-004: task form validation shows required field errors', async ({
      projectDetailsPage,
    }) => {
      const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

      const {client: adminApi} = await CpmApiClient.login(
        apiContext,
        DEV_ACCOUNTS.ADMIN,
      );

      const nonce = uniqueNonce('pw-task-004');
      const clientId = await resolveClientId(adminApi);
      const project = await adminApi.createProject({
        year: new Date().getFullYear(),
        code: `PW-TASK-${nonce.slice(-8)}`,
        name: `PW Task Validation ${nonce}`,
        clientId,
        type: 'GIS',
        coordinateX: null,
        coordinateY: null,
        contractDate: daysFromToday(0).toISOString(),
        deliveryDate: daysFromToday(10).toISOString(),
      });

      try {
        await projectDetailsPage.goto(project.id);
        await projectDetailsPage.openTasksTab();
        await projectDetailsPage.clickNewTask();

        const createButton = projectDetailsPage.page.getByRole('button', {name: 'Create Task'});
        await expect(createButton).toBeDisabled();

        // Validation triggers on blur/change; the submit button stays disabled while invalid.
        await projectDetailsPage.page.locator('#task-description').focus();
        await projectDetailsPage.page.locator('#task-description').blur();

        await projectDetailsPage.page.locator('#task-assignee').focus();
        await projectDetailsPage.page.locator('#task-assignee').blur();

        await projectDetailsPage.page.locator('#task-priority').focus();
        await projectDetailsPage.page.locator('#task-priority').blur();

        await projectDetailsPage.page.locator('#task-due-date').focus();
        await projectDetailsPage.page.locator('#task-due-date').blur();

        await expect(projectDetailsPage.page.getByText('Description is required')).toBeVisible();
        await expect(projectDetailsPage.page.getByText('Please select an assignee')).toBeVisible();
        await expect(projectDetailsPage.page.getByText('Please select a priority')).toBeVisible();
        await expect(projectDetailsPage.page.getByText('Due date is required')).toBeVisible();
      } finally {
        try {
          await adminApi.deleteProject(project.id);
        } catch {
          // Ignore.
        }
        await apiContext.dispose();
      }
    });

    test('TASK-008: marking a task PERFORMED shows confirmation controls for completion', async ({
      projectDetailsPage,
    }) => {
      const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

      const {client: adminApi, session: adminSession} = await CpmApiClient.login(
        apiContext,
        DEV_ACCOUNTS.ADMIN,
      );

      const nonce = uniqueNonce('pw-task-008');
      const clientId = await resolveClientId(adminApi);
      const project = await adminApi.createProject({
        year: new Date().getFullYear(),
        code: `PW-TASK-${nonce.slice(-8)}`,
        name: `PW Task Performed ${nonce}`,
        clientId,
        type: 'GIS',
        coordinateX: null,
        coordinateY: null,
        contractDate: daysFromToday(0).toISOString(),
        deliveryDate: daysFromToday(10).toISOString(),
      });

      const description = `PW Performed ${nonce.slice(-10)}`;

      const task = await adminApi.createTask({
        projectId: project.id,
        creatorId: adminSession.user.id,
        assigneeId: adminSession.user.id,
        description,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: daysFromToday(5).toISOString(),
        comments: null,
      });

      try {
        await projectDetailsPage.goto(project.id);
        await projectDetailsPage.openTasksTab();

        const card = projectDetailsPage.taskCardByDescription(description);
        await expect(card).toBeVisible();
        await expect(card.locator('.task-card-status')).toHaveText('In Progress');

        await card.getByRole('button', {name: 'Task actions'}).click();
        await card.getByRole('button', {name: 'Edit'}).click();
        let editDialog = projectDetailsPage.page.getByRole('dialog');
        await expect(editDialog.locator('#edit-task-title')).toBeVisible();

        await editDialog.getByRole('button', {name: 'Performed'}).click();
        await editDialog.getByRole('button', {name: 'Apply Status Change'}).click();
        await expect(editDialog).toHaveCount(0);
        await expect(card.locator('.task-card-status')).toHaveText('Performed');

        await card.getByRole('button', {name: 'Task actions'}).click();
        await card.getByRole('button', {name: 'Edit'}).click();
        editDialog = projectDetailsPage.page.getByRole('dialog');
        await expect(editDialog.locator('#edit-task-title')).toBeVisible();

        await editDialog.getByRole('button', {name: 'Completed'}).click();
        await expect(
          editDialog.getByRole('button', {name: 'Confirm & Complete'}),
        ).toBeVisible();
        await expect(
          editDialog.getByRole('button', {name: 'Reject'}),
        ).toBeVisible();
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

    test('TASK-007: allowed status transitions enforced by UI', async ({projectDetailsPage}) => {
      const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

      const {client: adminApi, session: adminSession} = await CpmApiClient.login(
        apiContext,
        DEV_ACCOUNTS.ADMIN,
      );

      const nonce = uniqueNonce('pw-task-007');
      const clientId = await resolveClientId(adminApi);
      const project = await adminApi.createProject({
        year: new Date().getFullYear(),
        code: `PW-TASK-${nonce.slice(-8)}`,
        name: `PW Task Transitions ${nonce}`,
        clientId,
        type: 'GIS',
        coordinateX: null,
        coordinateY: null,
        contractDate: daysFromToday(0).toISOString(),
        deliveryDate: daysFromToday(10).toISOString(),
      });

      const description = `PW Pending ${nonce.slice(-10)}`;
      const task = await adminApi.createTask({
        projectId: project.id,
        creatorId: adminSession.user.id,
        assigneeId: adminSession.user.id,
        description,
        status: 'PENDING',
        priority: 'MEDIUM',
        dueDate: daysFromToday(5).toISOString(),
        comments: null,
      });

      try {
        await projectDetailsPage.goto(project.id);
        await projectDetailsPage.openTasksTab();

        const card = projectDetailsPage.taskCardByDescription(description);
        await expect(card).toBeVisible();
        await expect(card.locator('.task-card-status')).toHaveText('Pending');

        await card.getByRole('button', {name: 'Task actions'}).click();
        await card.getByRole('button', {name: 'Edit'}).click();

        const editDialog = projectDetailsPage.page.getByRole('dialog');
        await expect(editDialog.locator('#edit-task-title')).toBeVisible();

        // From PENDING, only IN_PROGRESS should be offered.
        await expect(editDialog.getByRole('button', {name: 'In Progress'})).toBeVisible();
        await expect(editDialog.getByRole('button', {name: 'Performed'})).toHaveCount(0);
        await expect(editDialog.getByRole('button', {name: 'Partial'})).toHaveCount(0);
        await expect(editDialog.getByRole('button', {name: 'Completed'})).toHaveCount(0);
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

    test('TASK-010: reject completion keeps task non-completed', async ({projectDetailsPage}) => {
      const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

      const {client: adminApi, session: adminSession} = await CpmApiClient.login(
        apiContext,
        DEV_ACCOUNTS.ADMIN,
      );

      const nonce = uniqueNonce('pw-task-010');
      const clientId = await resolveClientId(adminApi);
      const project = await adminApi.createProject({
        year: new Date().getFullYear(),
        code: `PW-TASK-${nonce.slice(-8)}`,
        name: `PW Task Reject ${nonce}`,
        clientId,
        type: 'GIS',
        coordinateX: null,
        coordinateY: null,
        contractDate: daysFromToday(0).toISOString(),
        deliveryDate: daysFromToday(10).toISOString(),
      });

      const description = `PW Reject ${nonce.slice(-10)}`;
      const task = await adminApi.createTask({
        projectId: project.id,
        creatorId: adminSession.user.id,
        assigneeId: adminSession.user.id,
        description,
        status: 'PERFORMED',
        priority: 'HIGH',
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

        const editDialog = projectDetailsPage.page.getByRole('dialog');
        await expect(editDialog.locator('#edit-task-title')).toBeVisible();

        await editDialog.getByRole('button', {name: 'Completed'}).click();
        await expect(editDialog.getByRole('button', {name: 'Confirm & Complete'})).toBeVisible();
        await expect(editDialog.getByRole('button', {name: 'Reject'})).toBeVisible();

        await editDialog.getByRole('button', {name: 'Reject'}).click();
        await expect(editDialog).toHaveCount(0);

        await expect(card.locator('.task-card-status')).toHaveText('Pending');
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

    test('TASK-013: PERFORMED tasks cannot be advanced without confirmation', async ({projectDetailsPage}) => {
      const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

      const {client: adminApi, session: adminSession} = await CpmApiClient.login(
        apiContext,
        DEV_ACCOUNTS.ADMIN,
      );

      const nonce = uniqueNonce('pw-task-013');
      const clientId = await resolveClientId(adminApi);
      const project = await adminApi.createProject({
        year: new Date().getFullYear(),
        code: `PW-TASK-${nonce.slice(-8)}`,
        name: `PW Task Gate ${nonce}`,
        clientId,
        type: 'GIS',
        coordinateX: null,
        coordinateY: null,
        contractDate: daysFromToday(0).toISOString(),
        deliveryDate: daysFromToday(10).toISOString(),
      });

      const description = `PW Gate ${nonce.slice(-10)}`;
      const task = await adminApi.createTask({
        projectId: project.id,
        creatorId: adminSession.user.id,
        assigneeId: adminSession.user.id,
        description,
        status: 'PERFORMED',
        priority: 'HIGH',
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

        const editDialog = projectDetailsPage.page.getByRole('dialog');
        await expect(editDialog.locator('#edit-task-title')).toBeVisible();

        await editDialog.getByRole('button', {name: 'Completed'}).click();
        await expect(editDialog.getByRole('button', {name: 'Confirm & Complete'})).toBeVisible();
        await expect(editDialog.getByRole('button', {name: 'Reject'})).toBeVisible();

        // Close without confirming/rejecting; status must remain PERFORMED.
        await editDialog.getByRole('button', {name: 'Close modal'}).click();
        await expect(editDialog).toHaveCount(0);
        await expect(card.locator('.task-card-status')).toHaveText('Performed');
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

    test('TASK-009: confirm completion transitions PERFORMED → COMPLETED', async ({
      projectDetailsPage,
    }) => {
      const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

      const {client: adminApi, session: adminSession} = await CpmApiClient.login(
        apiContext,
        DEV_ACCOUNTS.ADMIN,
      );

      const nonce = uniqueNonce('pw-task-009');
      const clientId = await resolveClientId(adminApi);
      const project = await adminApi.createProject({
        year: new Date().getFullYear(),
        code: `PW-TASK-${nonce.slice(-8)}`,
        name: `PW Task Confirm ${nonce}`,
        clientId,
        type: 'GIS',
        coordinateX: null,
        coordinateY: null,
        contractDate: daysFromToday(0).toISOString(),
        deliveryDate: daysFromToday(10).toISOString(),
      });

      const description = `PW Confirm ${nonce.slice(-10)}`;

      const task = await adminApi.createTask({
        projectId: project.id,
        creatorId: adminSession.user.id,
        assigneeId: adminSession.user.id,
        description,
        status: 'PERFORMED',
        priority: 'HIGH',
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
        const editDialog = projectDetailsPage.page.getByRole('dialog');
        await expect(editDialog.locator('#edit-task-title')).toBeVisible();

        await editDialog.getByRole('button', {name: 'Completed'}).click();
        await editDialog.getByRole('button', {name: 'Confirm & Complete'}).click();

        await expect(card.locator('.task-card-status')).toHaveText('Completed');
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

    test('admin can transition a task from Pending to In Progress', async ({projectDetailsPage}) => {
      const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

      const {client: adminApi, session: adminSession} = await CpmApiClient.login(
        apiContext,
        DEV_ACCOUNTS.ADMIN,
      );

      const nonce = uniqueNonce('pw-task');
      const clientId = await resolveClientId(adminApi);
      const project = await adminApi.createProject({
        year: new Date().getFullYear(),
        code: `PW-TASK-${nonce.slice(-8)}`,
        name: `PW Task Project ${nonce}`,
        clientId,
        type: 'GIS',
        coordinateX: null,
        coordinateY: null,
        contractDate: daysFromToday(0).toISOString(),
        deliveryDate: daysFromToday(10).toISOString(),
      });

      const description = `PW Task ${nonce.slice(-10)}`;

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

        const card = projectDetailsPage.taskCardByDescription(description);
        await expect(card).toBeVisible();
        await expect(card.locator('.task-card-status')).toHaveText('Pending');

        await card.getByRole('button', {name: 'Task actions'}).click();
        await card.getByRole('button', {name: 'Edit'}).click();
        const editDialog = projectDetailsPage.page.getByRole('dialog');
        await expect(editDialog.locator('#edit-task-title')).toBeVisible();

        await editDialog.getByRole('button', {name: 'In Progress'}).click();
        await editDialog.getByRole('button', {name: 'Apply Status Change'}).click();
        await expect(editDialog).toHaveCount(0);
        await expect(card.locator('.task-card-status')).toHaveText('In Progress');
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

  test.describe('as non-admin', () => {
    test.use({storageState: AUTH_STATE_NON_ADMIN_PATH});

    test('TASK-003: client creates task and assigns to admin', async ({
      projectDetailsPage,
    }) => {
      const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

      const {client: adminApi} = await CpmApiClient.login(
        apiContext,
        DEV_ACCOUNTS.ADMIN,
      );

      const nonce = uniqueNonce('pw-task-003');
      const nonAdminUser = readUserFromStorageState(AUTH_STATE_NON_ADMIN_PATH);
      const adminUser = await adminApi.getUserByEmail(DEV_ACCOUNTS.ADMIN.email);

      const project = await adminApi.createProject({
        year: new Date().getFullYear(),
        code: `PW-TASK-${nonce.slice(-8)}`,
        name: `PW Client Task Assign ${nonce}`,
        clientId: nonAdminUser.id,
        type: 'GIS',
        coordinateX: null,
        coordinateY: null,
        contractDate: daysFromToday(0).toISOString(),
        deliveryDate: daysFromToday(10).toISOString(),
      });

      const description = `PW Client Create ${nonce.slice(-10)}`;

      try {
        await projectDetailsPage.goto(project.id);
        await projectDetailsPage.openTasksTab();

        await projectDetailsPage.clickNewTask();
        await projectDetailsPage.page.locator('#task-description').fill(description);

        const adminAssigneeOption = projectDetailsPage.page.locator(
          `#task-assignee option[value="${adminUser.id}"]`,
        );
        await expect(adminAssigneeOption).toHaveCount(1);
        await projectDetailsPage.page.locator('#task-assignee').selectOption(adminUser.id);

        await projectDetailsPage.page.locator('#task-priority').selectOption('MEDIUM');
        await projectDetailsPage.page
          .locator('#task-due-date')
          .fill(daysFromToday(7).toISOString().slice(0, 10));

        await projectDetailsPage.page.getByRole('button', {name: 'Create Task'}).click();
        await expect(projectDetailsPage.taskCardByDescription(description)).toBeVisible();
      } finally {
        try {
          await adminApi.deleteProject(project.id);
        } catch {
          // Ignore.
        }
        await apiContext.dispose();
      }
    });

    test('TASK-006: can delete own task but not admin-created task', async ({
      projectDetailsPage,
    }) => {
      const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

      const {client: adminApi, session: adminSession} = await CpmApiClient.login(
        apiContext,
        DEV_ACCOUNTS.ADMIN,
      );

      const nonce = uniqueNonce('pw-task-006');

      const nonAdminUser = readUserFromStorageState(AUTH_STATE_NON_ADMIN_PATH);

      const project = await adminApi.createProject({
        year: new Date().getFullYear(),
        code: `PW-TASK-${nonce.slice(-8)}`,
        name: `PW Task Delete Perms ${nonce}`,
        clientId: nonAdminUser.id,
        type: 'GIS',
        coordinateX: null,
        coordinateY: null,
        contractDate: daysFromToday(0).toISOString(),
        deliveryDate: daysFromToday(10).toISOString(),
      });

      const adminCreatedDescription = `PW Admin Task ${nonce.slice(-10)}`;
      const ownCreatedDescription = `PW Own Task ${nonce.slice(-10)}`;

      const adminTask = await adminApi.createTask({
        projectId: project.id,
        creatorId: adminSession.user.id,
        assigneeId: nonAdminUser.id,
        description: adminCreatedDescription,
        status: 'PENDING',
        priority: 'MEDIUM',
        dueDate: daysFromToday(5).toISOString(),
        comments: null,
      });

      try {
        await projectDetailsPage.goto(project.id);
        await projectDetailsPage.openTasksTab();

        const adminCard = projectDetailsPage.taskCardByDescription(adminCreatedDescription);
        await expect(adminCard).toBeVisible();

        await adminCard.getByRole('button', {name: 'Task actions'}).click();
        await expect(adminCard.getByRole('button', {name: 'Delete'})).toHaveCount(0);
        await adminCard.getByRole('button', {name: 'Task actions'}).click();

        await projectDetailsPage.clickNewTask();
        await projectDetailsPage.page.locator('#task-description').fill(ownCreatedDescription);
        await projectDetailsPage.page.locator('#task-assignee').selectOption({index: 1});
        await projectDetailsPage.page.locator('#task-priority').selectOption('LOW');
        await projectDetailsPage.page
          .locator('#task-due-date')
          .fill(daysFromToday(7).toISOString().slice(0, 10));
        await projectDetailsPage.page.getByRole('button', {name: 'Create Task'}).click();

        const ownCard = projectDetailsPage.taskCardByDescription(ownCreatedDescription);
        await expect(ownCard).toBeVisible();

        await ownCard.getByRole('button', {name: 'Task actions'}).click();
        await ownCard.getByRole('button', {name: 'Delete'}).click();
        await expect(ownCard).toHaveCount(0);
      } finally {
        try {
          await adminApi.deleteTask(adminTask.id);
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
});
