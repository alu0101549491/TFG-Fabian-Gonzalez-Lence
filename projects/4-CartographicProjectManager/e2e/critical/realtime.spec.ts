/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2026-03-14
 * @file e2e/critical/realtime.spec.ts
 * @desc Critical E2E coverage for real-time synchronization scenarios.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

// Leave exactly 1 blank line before imports

import {request} from '@playwright/test';

import {test, expect} from '../fixtures/test';
import {CpmApiClient} from '../helpers/api';
import {login} from '../helpers/auth';
import {AUTH_STATE_ADMIN_PATH, getApiBaseUrl} from '../helpers/e2e-paths';
import {daysFromToday, uniqueNonce} from '../helpers/test-data';
import {DEV_ACCOUNTS} from '../helpers/auth';

test.describe('Real-time (critical)', () => {
  test('RT-001: new message appears in other session without refresh', async ({browser}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);

    const nonce = uniqueNonce('pw-rt-001');

    const clientEmail = `pw-rt-client-${nonce}@example.com`;
    const clientPassword = `pw-rt-client-${nonce}`;

    const clientUser = await adminApi.createUser({
      username: `pw-rt-client-${nonce}`,
      email: clientEmail,
      password: clientPassword,
      role: 'CLIENT',
    });

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-RT-${nonce.slice(-8)}`,
      name: `PW Real-time ${nonce}`,
      clientId: clientUser.id,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(7).toISOString(),
    });

    const messageText = `PW RT message ${nonce.slice(-8)}`;

    const adminContext = await browser.newContext({storageState: AUTH_STATE_ADMIN_PATH});
    const clientContext = await browser.newContext();

    try {
      const adminPage = await adminContext.newPage();
      await adminPage.goto(`projects/${project.id}`);
      await adminPage.getByRole('tab', {name: 'Messages'}).click();
      await expect(adminPage.locator('.message-list')).toBeVisible();

      const clientPage = await clientContext.newPage();
      await clientPage.goto('login');
      await login(clientPage, {email: clientEmail, password: clientPassword});
      await clientPage.goto(`projects/${project.id}`);
      await clientPage.getByRole('tab', {name: 'Messages'}).click();
      await expect(clientPage.locator('.message-list')).toBeVisible();

      // Ensure both sessions have joined the project room before sending.
      await clientPage.waitForTimeout(500);

      const textarea = adminPage.getByPlaceholder('Type a message...');
      await textarea.fill(messageText);
      await textarea.press('Enter');

      await expect(adminPage.locator('.message-text').filter({hasText: messageText})).toBeVisible();

      // No reload/navigation: the client should see the new message arrive.
      await expect(clientPage.locator('.message-text').filter({hasText: messageText})).toBeVisible({timeout: 10_000});
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }

      try {
        await adminApi.deleteUser(clientUser.id);
      } catch {
        // Ignore.
      }

      await apiContext.dispose();
      await adminContext.close();
      await clientContext.close();
    }
  });

  test('RT-002: task status change appears in other session without refresh', async ({browser}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const {client: adminApi, session: adminSession} = await CpmApiClient.login(
      apiContext,
      DEV_ACCOUNTS.ADMIN,
    );

    const nonce = uniqueNonce('pw-rt-002');

    const clientEmail = `pw-rt-client-${nonce}@example.com`;
    const clientPassword = `pw-rt-client-${nonce}`;

    const clientUser = await adminApi.createUser({
      username: `pw-rt-client-${nonce}`,
      email: clientEmail,
      password: clientPassword,
      role: 'CLIENT',
    });

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-RT-${nonce.slice(-8)}`,
      name: `PW Real-time Tasks ${nonce}`,
      clientId: clientUser.id,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(7).toISOString(),
    });

    const taskDescription = `PW RT task ${nonce.slice(-8)}`;
    await adminApi.createTask({
      projectId: project.id,
      creatorId: adminSession.user.id,
      assigneeId: adminSession.user.id,
      description: taskDescription,
      status: 'PENDING',
      priority: 'MEDIUM',
      dueDate: daysFromToday(6).toISOString(),
      comments: null,
    });

    const adminContext = await browser.newContext({storageState: AUTH_STATE_ADMIN_PATH});
    const clientContext = await browser.newContext();

    try {
      const adminPage = await adminContext.newPage();
      await adminPage.goto(`projects/${project.id}`);
      await adminPage.getByRole('tab', {name: 'Tasks'}).click();

      const adminTaskCard = adminPage.locator('.task-card').filter({hasText: taskDescription});
      await expect(adminTaskCard).toBeVisible();
      await expect(adminTaskCard.locator('.task-card-status')).toHaveText('Pending');

      const clientPage = await clientContext.newPage();
      await clientPage.goto('login');
      await login(clientPage, {email: clientEmail, password: clientPassword});
      await clientPage.goto(`projects/${project.id}`);
      await clientPage.getByRole('tab', {name: 'Tasks'}).click();

      const clientTaskCard = clientPage.locator('.task-card').filter({hasText: taskDescription});
      await expect(clientTaskCard).toBeVisible();

      // Ensure both sessions have joined the project room before changing status.
      await clientPage.waitForTimeout(500);

      await adminTaskCard.locator('button.task-card-status-btn', {hasText: 'In Progress'}).click();
      await expect(adminTaskCard.locator('.task-card-status')).toHaveText('In Progress');

      // No reload/navigation: the client should see the updated status arrive.
      await expect(clientTaskCard.locator('.task-card-status')).toHaveText('In Progress', {
        timeout: 10_000,
      });
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }

      try {
        await adminApi.deleteUser(clientUser.id);
      } catch {
        // Ignore.
      }

      await apiContext.dispose();
      await adminContext.close();
      await clientContext.close();
    }
  });

  test('RT-004: file upload appears in other session without refresh', async ({browser}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);

    const nonce = uniqueNonce('pw-rt-004');

    const clientEmail = `pw-rt-client-${nonce}@example.com`;
    const clientPassword = `pw-rt-client-${nonce}`;

    const clientUser = await adminApi.createUser({
      username: `pw-rt-client-${nonce}`,
      email: clientEmail,
      password: clientPassword,
      role: 'CLIENT',
    });

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-RT-${nonce.slice(-8)}`,
      name: `PW Real-time Files ${nonce}`,
      clientId: clientUser.id,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(7).toISOString(),
    });

    const uploadedFileName = `pw-rt-file-${nonce.slice(-6)}.pdf`;

    const adminContext = await browser.newContext({storageState: AUTH_STATE_ADMIN_PATH});
    const clientContext = await browser.newContext();

    try {
      const adminPage = await adminContext.newPage();
      await adminPage.goto(`projects/${project.id}`);
      await adminPage.getByRole('tab', {name: /^Files/}).click();
      await expect(adminPage.getByRole('heading', {name: 'Project Files'})).toBeVisible();

      const clientPage = await clientContext.newPage();
      await clientPage.goto('login');
      await login(clientPage, {email: clientEmail, password: clientPassword});
      await clientPage.goto(`projects/${project.id}`);
      await clientPage.getByRole('tab', {name: /^Files/}).click();
      await expect(clientPage.getByRole('heading', {name: 'Project Files'})).toBeVisible();

      // Ensure both sessions have joined the project room before uploading.
      await clientPage.waitForTimeout(750);

      await adminPage.locator('.file-uploader input[type="file"]').setInputFiles({
        name: uploadedFileName,
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4\n%pw-rt-004\n'),
      });

      await expect(adminPage.locator('.file-uploader-queue-title')).toHaveText(/1 file selected/);
      await adminPage.getByRole('button', {name: /Upload 1 file/}).click();

      const adminUploadedCard = adminPage
        .locator('.file-card')
        .filter({hasText: uploadedFileName});
      await expect(adminUploadedCard).toBeVisible({timeout: 15_000});

      // No reload/navigation: the client should see the file appear.
      const clientUploadedCard = clientPage
        .locator('.file-card')
        .filter({hasText: uploadedFileName});
      await expect(clientUploadedCard).toBeVisible({timeout: 15_000});
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }

      try {
        await adminApi.deleteUser(clientUser.id);
      } catch {
        // Ignore.
      }

      await apiContext.dispose();
      await adminContext.close();
      await clientContext.close();
    }
  });

  test('RT-003: notification appears after new message without refresh', async ({browser}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);

    const nonce = uniqueNonce('pw-rt-003');

    const clientEmail = `pw-rt-client-${nonce}@example.com`;
    const clientPassword = `pw-rt-client-${nonce}`;

    const clientUser = await adminApi.createUser({
      username: `pw-rt-client-${nonce}`,
      email: clientEmail,
      password: clientPassword,
      role: 'CLIENT',
    });

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-RT-${nonce.slice(-8)}`,
      name: `PW Real-time Notifications ${nonce}`,
      clientId: clientUser.id,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(7).toISOString(),
    });

    const messageText = `PW RT-003 message ${nonce.slice(-8)}`;

    const adminContext = await browser.newContext({storageState: AUTH_STATE_ADMIN_PATH});
    const clientContext = await browser.newContext();

    try {
      const adminPage = await adminContext.newPage();
      await adminPage.goto(`projects/${project.id}`);
      await adminPage.getByRole('tab', {name: 'Messages'}).click();
      await expect(adminPage.locator('.message-list')).toBeVisible();

      const clientPage = await clientContext.newPage();
      await clientPage.goto('login');
      await login(clientPage, {email: clientEmail, password: clientPassword});

      // Join the project room so real-time message events arrive.
      await clientPage.goto(`projects/${project.id}`);
      await expect(clientPage.getByRole('tab', {name: /^Overview/})).toBeVisible();

      // Ensure both sessions have joined the project room before sending.
      await clientPage.waitForTimeout(750);

      const textarea = adminPage.getByPlaceholder('Type a message...');
      await textarea.fill(messageText);
      await textarea.press('Enter');

      await expect(adminPage.locator('.message-text').filter({hasText: messageText})).toBeVisible();

      // No reload/navigation: the client should see a notification created from unread messages.
      await clientPage.getByRole('button', {name: 'Notifications'}).click();
      await expect(clientPage.getByRole('heading', {name: 'Notifications'})).toBeVisible();

      const newMessagesNotification = clientPage
        .locator('.notification-item')
        .filter({hasText: 'Nuevos mensajes'});
      await expect(newMessagesNotification).toBeVisible({timeout: 15_000});
      await expect(newMessagesNotification).toContainText('sin leer');
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }

      try {
        await adminApi.deleteUser(clientUser.id);
      } catch {
        // Ignore.
      }

      await apiContext.dispose();
      await adminContext.close();
      await clientContext.close();
    }
  });

  test('MSG-009: typing indicator shown during other user typing', async ({browser}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);

    const nonce = uniqueNonce('pw-msg-009');

    const clientEmail = `pw-rt-client-${nonce}@example.com`;
    const clientPassword = `pw-rt-client-${nonce}`;

    const clientUser = await adminApi.createUser({
      username: `pw-rt-client-${nonce}`,
      email: clientEmail,
      password: clientPassword,
      role: 'CLIENT',
    });

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-RT-${nonce.slice(-8)}`,
      name: `PW Real-time Typing ${nonce}`,
      clientId: clientUser.id,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(7).toISOString(),
    });

    const adminContext = await browser.newContext({storageState: AUTH_STATE_ADMIN_PATH});
    const clientContext = await browser.newContext();

    try {
      const adminPage = await adminContext.newPage();
      await adminPage.goto(`projects/${project.id}`);
      await adminPage.getByRole('tab', {name: 'Messages'}).click();
      await expect(adminPage.locator('.message-list')).toBeVisible();

      const clientPage = await clientContext.newPage();
      await clientPage.goto('login');
      await login(clientPage, {email: clientEmail, password: clientPassword});
      await clientPage.goto(`projects/${project.id}`);
      await clientPage.getByRole('tab', {name: 'Messages'}).click();
      await expect(clientPage.locator('.message-list')).toBeVisible();

      // Wait until the admin session observes the client as online in this room.
      await expect(adminPage.locator('.presence-indicator')).toContainText('Online now: 1', {
        timeout: 10_000,
      });

      const adminTypingIndicator = adminPage.locator('.typing-indicator');
      await expect(adminTypingIndicator).toBeHidden();

      const clientTextarea = clientPage.getByPlaceholder('Type a message...');
      await clientTextarea.click();
      await clientTextarea.type('typing...', {delay: 50});

      await expect(adminTypingIndicator).toBeVisible({timeout: 10_000});

      // Stop typing by blurring the textarea.
      await clientTextarea.blur();
      await expect(adminTypingIndicator).toBeHidden({timeout: 10_000});
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }

      try {
        await adminApi.deleteUser(clientUser.id);
      } catch {
        // Ignore.
      }

      await apiContext.dispose();
      await adminContext.close();
      await clientContext.close();
    }
  });

  test('RT-005: presence indicator updates when another session disconnects', async ({browser}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);

    const nonce = uniqueNonce('pw-rt-005');

    const clientEmail = `pw-rt-client-${nonce}@example.com`;
    const clientPassword = `pw-rt-client-${nonce}`;

    const clientUser = await adminApi.createUser({
      username: `pw-rt-client-${nonce}`,
      email: clientEmail,
      password: clientPassword,
      role: 'CLIENT',
    });

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-RT-${nonce.slice(-8)}`,
      name: `PW Real-time Presence ${nonce}`,
      clientId: clientUser.id,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(7).toISOString(),
    });

    const adminContext = await browser.newContext({storageState: AUTH_STATE_ADMIN_PATH});
    const clientContext = await browser.newContext();

    try {
      const adminPage = await adminContext.newPage();
      await adminPage.goto(`projects/${project.id}`);
      await adminPage.getByRole('tab', {name: 'Messages'}).click();
      await expect(adminPage.locator('.message-list')).toBeVisible();

      const presenceIndicator = adminPage.locator('.presence-indicator');
      await expect(presenceIndicator).toBeHidden();

      const clientPage = await clientContext.newPage();
      await clientPage.goto('login');
      await login(clientPage, {email: clientEmail, password: clientPassword});
      await clientPage.goto(`projects/${project.id}`);
      await clientPage.getByRole('tab', {name: 'Messages'}).click();
      await expect(clientPage.locator('.message-list')).toBeVisible();

      // Ensure both sessions have joined the project room.
      await clientPage.waitForTimeout(750);

      // Admin should see the other session online.
      await expect(presenceIndicator).toBeVisible({timeout: 10_000});
      await expect(presenceIndicator).toHaveText('Online now: 1');

      // Closing the client context should trigger a disconnect and update presence.
      await clientContext.close();
      await expect(presenceIndicator).toBeHidden({timeout: 10_000});
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }

      try {
        await adminApi.deleteUser(clientUser.id);
      } catch {
        // Ignore.
      }

      await apiContext.dispose();
      await adminContext.close();
      try {
        await clientContext.close();
      } catch {
        // Ignore.
      }
    }
  });
});
