/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2026-03-13
 * @file e2e/critical/messaging.spec.ts
 * @desc Critical E2E coverage for project messaging.
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

test.describe('Messaging (critical)', () => {
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

  test('MSG-001: message list renders (empty state)', async ({projectDetailsPage}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const {client: adminApi} = await CpmApiClient.login(
      apiContext,
      DEV_ACCOUNTS.ADMIN,
    );

    const nonce = uniqueNonce('pw-msg-001');
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-MSG-${nonce.slice(-8)}`,
      name: `PW Messaging ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(10).toISOString(),
    });

    try {
      await projectDetailsPage.goto(project.id);
      await projectDetailsPage.page.getByRole('tab', {name: 'Messages'}).click();
      await expect(projectDetailsPage.page.locator('.message-list')).toBeVisible();
      await expect(projectDetailsPage.page.getByText('No messages yet')).toBeVisible();
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });

  test('MSG-002: send message (text) via Enter', async ({projectDetailsPage}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const {client: adminApi} = await CpmApiClient.login(
      apiContext,
      DEV_ACCOUNTS.ADMIN,
    );

    const nonce = uniqueNonce('pw-msg-002');
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-MSG-${nonce.slice(-8)}`,
      name: `PW Messaging Send ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(10).toISOString(),
    });

    const messageText = `PW message ${nonce.slice(-8)}`;

    try {
      await projectDetailsPage.goto(project.id);
      await projectDetailsPage.page.getByRole('tab', {name: 'Messages'}).click();

      const textarea = projectDetailsPage.page.getByPlaceholder('Type a message...');
      await textarea.fill(messageText);
      await textarea.press('Enter');

      await expect(projectDetailsPage.page.locator('.message-text').filter({hasText: messageText})).toBeVisible();
      await expect(projectDetailsPage.page.locator('.message-list-date-separator')).toBeVisible();
      await expect(textarea).toHaveValue('');
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });

  test('MSG-010: cannot send empty/whitespace-only message', async ({projectDetailsPage}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const {client: adminApi} = await CpmApiClient.login(
      apiContext,
      DEV_ACCOUNTS.ADMIN,
    );

    const nonce = uniqueNonce('pw-msg-010');
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-MSG-${nonce.slice(-8)}`,
      name: `PW Messaging Empty ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(10).toISOString(),
    });

    try {
      await projectDetailsPage.goto(project.id);
      await projectDetailsPage.page.getByRole('tab', {name: 'Messages'}).click();

      await expect(projectDetailsPage.page.getByText('No messages yet')).toBeVisible();
      await expect(projectDetailsPage.page.locator('.message-text')).toHaveCount(0);

      const textarea = projectDetailsPage.page.getByPlaceholder('Type a message...');
      await textarea.fill('   ');
      await textarea.press('Enter');

      await expect(projectDetailsPage.page.getByText('No messages yet')).toBeVisible();
      await expect(projectDetailsPage.page.locator('.message-text')).toHaveCount(0);
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });

  test('MSG-006: messaging disabled when project is FINALIZED', async ({projectDetailsPage}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const {client: adminApi} = await CpmApiClient.login(
      apiContext,
      DEV_ACCOUNTS.ADMIN,
    );

    const nonce = uniqueNonce('pw-msg-006');
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-MSG-${nonce.slice(-8)}`,
      name: `PW Messaging Finalized ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(10).toISOString(),
    });

    try {
      await adminApi.updateProject(project.id, {status: 'FINALIZED'});

      await projectDetailsPage.goto(project.id);
      await projectDetailsPage.page.getByRole('tab', {name: 'Messages'}).click();

      const textarea = projectDetailsPage.page.getByPlaceholder('Type a message...');
      await expect(textarea).toBeDisabled();

      const sendButton = projectDetailsPage.page.locator('.message-input-send-btn');
      await expect(sendButton).toBeDisabled();
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });

  test('MSG-007: unread messages become “read” after viewing (spec FR15/FR17)', async ({
    projectListPage,
    projectDetailsPage,
  }) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);

    const nonce = uniqueNonce('pw-msg-007');
    const email = `pw-msg-007-${nonce}@example.com`;
    const password = `pw-msg-007-${nonce}`;
    const username = `pw-msg-007-${nonce}`;

    let createdUserId: string | null = null;
    const registered = await adminApi.register({username, email, password});
    createdUserId = registered.user.id;

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-MSG-${nonce.slice(-8)}`,
      name: `PW Messaging Read ${nonce}`,
      clientId: createdUserId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(10).toISOString(),
    });

    try {
      const clientApi = new CpmApiClient(apiContext, registered.accessToken);
      await clientApi.createMessage({
        projectId: project.id,
        content: `PW unread ${nonce}`,
      });

      // Verify unread indicator is visible in project summaries.
      await projectListPage.goto();
      await projectListPage.filterBySearch(project.code);

      const card = projectListPage.projectCardByCode(project.code);
      await expect(card).toBeVisible();
      await expect(card.locator('.project-card-counter-primary')).toBeVisible();
      await expect(card.locator('.project-card-counter-primary')).toContainText('1');

      // Open project and view messages tab: this triggers markAllAsRead.
      await card.click();
      await expect(projectDetailsPage.page).toHaveURL(new RegExp(`/projects/${project.id}(\\?|$)`));

      const markReadResponse = projectDetailsPage.page.waitForResponse((response) => {
        return (
          response.request().method() === 'POST' &&
          response.url().includes(`/projects/${project.id}/messages/mark-read`) &&
          response.ok()
        );
      });

      await projectDetailsPage.page.getByRole('tab', {name: 'Messages'}).click();
      await markReadResponse;

      // Return to list and confirm unread counter is cleared.
      await projectDetailsPage.page.getByRole('button', {name: 'Go back to projects list'}).click();
      await expect(projectDetailsPage.page).toHaveURL(/\/projects(\?|$)/);

      await projectListPage.filterBySearch(project.code);
      const cardAfter = projectListPage.projectCardByCode(project.code);
      await expect(cardAfter).toBeVisible();
      await expect(cardAfter.locator('.project-card-counter-primary')).toHaveCount(0);
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      if (createdUserId) {
        try {
          await adminApi.deleteUser(createdUserId);
        } catch {
          // Ignore.
        }
      }
      await apiContext.dispose();
    }
  });
});
