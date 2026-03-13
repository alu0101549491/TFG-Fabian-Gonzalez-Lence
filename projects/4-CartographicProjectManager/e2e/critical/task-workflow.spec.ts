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

import {request} from '@playwright/test';

import {test, expect} from '../fixtures/test';
import {CpmApiClient} from '../helpers/api';
import {AUTH_STATE_ADMIN_PATH, getApiBaseUrl} from '../helpers/e2e-paths.ts';
import {uniqueNonce, daysFromToday} from '../helpers/test-data';
import {DEV_ACCOUNTS} from '../helpers/auth';

test.describe('Tasks workflow (critical)', () => {
  test.use({storageState: AUTH_STATE_ADMIN_PATH});

  test('admin can transition a task from Pending to In Progress', async ({projectDetailsPage}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const {client: adminApi, session: adminSession} = await CpmApiClient.login(
      apiContext,
      DEV_ACCOUNTS.ADMIN,
    );

    const nonce = uniqueNonce('pw-task');

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
      await expect(card.getByText('Pending')).toBeVisible();

      await card.getByRole('button', {name: '→ In Progress'}).click();
      await expect(card.getByText('In Progress')).toBeVisible();
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
