/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 13, 2026
 * @file e2e/medium/calendar.spec.ts
 * @desc Medium-priority E2E coverage for calendar navigation to project details.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

// Leave exactly 1 blank line before imports

import {request} from '@playwright/test';

import {test, expect} from '../fixtures/test';
import {CpmApiClient} from '../helpers/api';
import {AUTH_STATE_ADMIN_PATH, getApiBaseUrl} from '../helpers/e2e-paths.ts';
import {uniqueNonce, daysFromToday} from '../helpers/test-data';
import {DEV_ACCOUNTS, login} from '../helpers/auth';

function calendarDayLabelPrefix(date: Date): string {
  const weekdayNamesFull = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const weekday = weekdayNamesFull[date.getDay()];
  const month = monthNames[date.getMonth()];
  const dayNum = date.getDate();
  const year = date.getFullYear();
  return `${weekday}, ${month} ${dayNum}, ${year}`;
}

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

function getCrossMonthTaskWindow(): {dueDate: Date; deliveryDate: Date} {
  const now = new Date();

  let dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 12, 0, 0, 0);
  let deliveryDate = new Date(now.getFullYear(), now.getMonth() + 1, 1, 12, 0, 0, 0);

  if (dueDate <= now) {
    dueDate = new Date(now.getFullYear(), now.getMonth() + 2, 0, 12, 0, 0, 0);
    deliveryDate = new Date(now.getFullYear(), now.getMonth() + 2, 1, 12, 0, 0, 0);
  }

  return {dueDate, deliveryDate};
}

function getCurrentMonthVisibleDate(offsetDays = 0): Date {
  const now = new Date();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const visibleDay = Math.min(now.getDate() + offsetDays, lastDayOfMonth);
  return new Date(now.getFullYear(), now.getMonth(), visibleDay, 12, 0, 0, 0);
}

test.describe('Calendar (medium)', () => {
  test.use({storageState: AUTH_STATE_ADMIN_PATH});

  async function registerIsolatedClient(
    adminApi: CpmApiClient,
    nonce: string,
  ): Promise<{email: string; password: string; userId: string}> {
    const email = `pw-e2e-cal-${nonce.slice(-8)}@example.com`;
    const password = `pw-e2e-${nonce.slice(-10)}`;
    const username = `pw-e2e-${nonce.slice(-6)}`;

    const session = await adminApi.register({
      username,
      email,
      password,
    });

    return {email, password, userId: session.user.id};
  }

  test('CAL-001: calendar view loads project deliveries and task deadlines', async ({browser}) => {
    test.setTimeout(90_000);
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-cal-001');

    const {client: adminApi, session} = await CpmApiClient.login(
      apiContext,
      DEV_ACCOUNTS.ADMIN,
    );

    const isolatedClient = await registerIsolatedClient(adminApi, nonce);
    const code = `PW-CAL-${nonce.slice(-8)}`;
    const deliveryDate = daysFromToday(1);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code,
      name: `PW Calendar Project ${nonce}`,
      clientId: isolatedClient.userId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      // Ensure it appears in the current month view.
      deliveryDate: deliveryDate.toISOString(),
    });

    const taskDescription = `PW-TASK-${nonce.slice(-6)}`;
    const task = await adminApi.createTask({
      projectId: project.id,
      creatorId: session.user.id,
      assigneeId: isolatedClient.userId,
      description: taskDescription,
      status: 'PENDING',
      priority: 'MEDIUM',
      dueDate: deliveryDate.toISOString(),
      comments: null,
    });

    const baseURL =
      (test.info().project.use.baseURL as string | undefined) ||
      'http://localhost:5173/4-CartographicProjectManager/';
    const context = await browser.newContext({
      baseURL,
      // Important: this test suite sets an admin storageState; override it so we can
      // UI-login as an isolated client in this ad-hoc context.
      storageState: {cookies: [], origins: []},
    });
    const page = await context.newPage();

    try {
      await login(page, {email: isolatedClient.email, password: isolatedClient.password});
      await page.goto('calendar');
      await expect(page.getByRole('heading', {name: 'Project Calendar'})).toBeVisible();

      await expect(
        page.locator('button.calendar-item.calendar-project', {hasText: code}),
      ).toBeVisible({timeout: 15_000});

      await expect(
        page.locator('button.calendar-item.calendar-task', {hasText: taskDescription}),
      ).toBeVisible({timeout: 30_000});
    } finally {
      await context.close().catch(() => null);
      try {
        await adminApi.deleteTask(task.id);
      } catch {
        // Ignore.
      }
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      try {
        await adminApi.deleteUser(isolatedClient.userId);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });

  test('CAL-002: changing month reloads calendar data', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-cal-002');

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);

    const clientId = await resolveClientId(adminApi);
    const code = `PW-CALM-${nonce.slice(-8)}`;

    const today = new Date();
    const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 15);

    const project = await adminApi.createProject({
      year: nextMonthDate.getFullYear(),
      code,
      name: `PW Calendar Next Month ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: nextMonthDate.toISOString(),
    });

    try {
      await page.goto('calendar');
      await expect(page.getByRole('heading', {name: 'Project Calendar'})).toBeVisible();

      await expect(
        page.locator('button.calendar-item.calendar-project', {hasText: code}),
      ).toHaveCount(0);

      await page.getByRole('button', {name: 'Next month'}).click();
      await expect(
        page.locator('button.calendar-item.calendar-project', {hasText: code}),
      ).toBeVisible();
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });

  test('CAL-005: selecting a date shows projects for that date', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-cal-005');

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);

    const clientId = await resolveClientId(adminApi);
    const code = `PW-CALD-${nonce.slice(-8)}`;
    const deliveryDate = daysFromToday(2);
    const deliveryDateOnly = new Date(
      deliveryDate.getFullYear(),
      deliveryDate.getMonth(),
      deliveryDate.getDate(),
    );

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code,
      name: `PW Calendar Date Select ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: deliveryDate.toISOString(),
    });

    try {
      await page.goto('calendar');
      await expect(page.getByRole('heading', {name: 'Project Calendar'})).toBeVisible();

      const datePrefix = calendarDayLabelPrefix(deliveryDateOnly);
      await page.getByRole('button', {name: new RegExp(`^${datePrefix}`)}).click();

      const details = page.locator('.date-details');
      await expect(details).toBeVisible();
      await expect(details.locator('.projects-on-date')).toContainText(code);
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });

  test('CAL-004: clicking a calendar task navigates to project tasks with task focused', async ({browser}) => {
    test.setTimeout(90_000);
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-cal-004');
    const {dueDate, deliveryDate} = getCrossMonthTaskWindow();

    const {client: adminApi, session} = await CpmApiClient.login(
      apiContext,
      DEV_ACCOUNTS.ADMIN,
    );

    const isolatedClient = await registerIsolatedClient(adminApi, nonce);
    const code = `PW-CALT-${nonce.slice(-8)}`;

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code,
      name: `PW Calendar Task Focus ${nonce}`,
      clientId: isolatedClient.userId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: deliveryDate.toISOString(),
    });

    const taskDescription = `PW-TASK-${nonce.slice(-6)}`;
    const task = await adminApi.createTask({
      projectId: project.id,
      creatorId: session.user.id,
      assigneeId: isolatedClient.userId,
      description: taskDescription,
      status: 'PENDING',
      priority: 'MEDIUM',
      dueDate: dueDate.toISOString(),
      comments: null,
    });

    const baseURL =
      (test.info().project.use.baseURL as string | undefined) ||
      'http://localhost:5173/4-CartographicProjectManager/';
    const context = await browser.newContext({
      baseURL,
      // Important: this test suite sets an admin storageState; override it so we can
      // UI-login as an isolated client in this ad-hoc context.
      storageState: {cookies: [], origins: []},
    });
    const page = await context.newPage();

    try {
      await login(page, {email: isolatedClient.email, password: isolatedClient.password});
      await page.goto('calendar');
      await expect(page.getByRole('heading', {name: 'Project Calendar'})).toBeVisible();

      const taskButton = page.locator('button.calendar-item.calendar-task', {
        hasText: taskDescription,
      });
      await expect(taskButton).toBeVisible({timeout: 30_000});

      await taskButton.click();

      await page.waitForURL(
        (url) =>
          url.pathname.endsWith(`/projects/${project.id}`) &&
          url.searchParams.get('tab') === 'tasks' &&
          url.searchParams.get('taskId') === task.id,
      );

      await expect(page.getByRole('heading', {name: 'Task Details'})).toBeVisible();
      await expect(
        page.getByRole('dialog', {name: 'Task Details'}).getByText(taskDescription),
      ).toBeVisible();
    } finally {
      await context.close().catch(() => null);
      try {
        await adminApi.deleteTask(task.id);
      } catch {
        // Ignore.
      }
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      try {
        await adminApi.deleteUser(isolatedClient.userId);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });

  test('CAL-003: clicking a calendar project navigates to project details', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-cal');

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

    const code = `PW-CAL-${nonce.slice(-8)}`;

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code,
      name: `PW Calendar Project ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      // Ensure it appears in the current month view.
      deliveryDate: daysFromToday(1).toISOString(),
    });

    try {
      await page.goto('calendar');
      await expect(page.getByRole('heading', {name: 'Project Calendar'})).toBeVisible();

      const projectButton = page.locator('button.calendar-item.calendar-project', {hasText: code});
      await expect(projectButton).toBeVisible();

      await projectButton.click();
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

test.describe('Calendar (client isolation)', () => {
  test('CAL-006: client calendar only shows client-visible projects', async ({browser}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-cal-006');
    const visibleDeliveryDateA = getCurrentMonthVisibleDate(0);
    const visibleDeliveryDateB = getCurrentMonthVisibleDate(1);

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);

    const clientAEmail = `pw-e2e-client-a-${nonce.slice(-8)}@example.com`;
    const clientAPassword = `pw-e2e-a-${nonce.slice(-8)}`;
    const clientAUsername = `pw-e2e-a-${nonce.slice(-6)}`;

    const clientBEmail = `pw-e2e-client-b-${nonce.slice(-8)}@example.com`;
    const clientBPassword = `pw-e2e-b-${nonce.slice(-8)}`;
    const clientBUsername = `pw-e2e-b-${nonce.slice(-6)}`;

    const clientASession = await adminApi.register({
      username: clientAUsername,
      email: clientAEmail,
      password: clientAPassword,
    });

    const clientBSession = await adminApi.register({
      username: clientBUsername,
      email: clientBEmail,
      password: clientBPassword,
    });

    const codeA = `PW-CALA-${nonce.slice(-6)}`;
    const codeB = `PW-CALB-${nonce.slice(-6)}`;

    const projectA = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: codeA,
      name: `PW Client A Project ${nonce}`,
      clientId: clientASession.user.id,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: visibleDeliveryDateA.toISOString(),
      deliveryDate: visibleDeliveryDateA.toISOString(),
    });

    const projectB = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: codeB,
      name: `PW Client B Project ${nonce}`,
      clientId: clientBSession.user.id,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: visibleDeliveryDateB.toISOString(),
      deliveryDate: visibleDeliveryDateB.toISOString(),
    });

    const baseURL =
      (test.info().project.use.baseURL as string | undefined) ||
      'http://localhost:5173/4-CartographicProjectManager/';

    const context = await browser.newContext({
      baseURL,
      // This file often runs with an admin default storageState; ensure we start logged-out
      // so we can UI-login as Client A.
      storageState: {cookies: [], origins: []},
    });
    const page = await context.newPage();

    try {
      await login(page, {email: clientAEmail, password: clientAPassword});

      await expect(page.getByRole('link', {name: 'Calendar'})).toBeVisible();
      await page.getByRole('link', {name: 'Calendar'}).click();
      await expect(page.getByRole('heading', {name: 'Project Calendar'})).toBeVisible();

      await expect(
        page.locator('button.calendar-item.calendar-project', {hasText: codeA}),
      ).toBeVisible({timeout: 15_000});
      await expect(
        page.locator('button.calendar-item.calendar-project', {hasText: codeB}),
      ).toHaveCount(0);
    } finally {
      await context.close();

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
        await adminApi.deleteUser(clientASession.user.id);
      } catch {
        // Ignore.
      }
      try {
        await adminApi.deleteUser(clientBSession.user.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });
});
