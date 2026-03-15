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

  test('MSG-003: Shift+Enter inserts newline (no send)', async ({projectDetailsPage}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const {client: adminApi} = await CpmApiClient.login(
      apiContext,
      DEV_ACCOUNTS.ADMIN,
    );

    const nonce = uniqueNonce('pw-msg-003');
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-MSG-${nonce.slice(-8)}`,
      name: `PW Messaging ShiftEnter ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(10).toISOString(),
    });

    const page = projectDetailsPage.page;

    try {
      await projectDetailsPage.goto(project.id);
      await page.getByRole('tab', {name: 'Messages'}).click();

      // The view auto-scrolls to bottom shortly after activating the Messages tab.
      // Wait it out so our forced scroll state doesn't get overridden.
      await page.waitForTimeout(300);

      await expect(page.getByText('No messages yet')).toBeVisible();
      await expect(page.locator('.message-text')).toHaveCount(0);

      const textarea = page.getByPlaceholder('Type a message...');
      await textarea.fill('Line 1');
      await textarea.press('Shift+Enter');
      await textarea.type('Line 2');

      await expect(textarea).toHaveValue('Line 1\nLine 2');

      // Ensure Shift+Enter did not trigger sending.
      await page.waitForTimeout(200);
      await expect(page.locator('.message-text')).toHaveCount(0);
      await expect(page.getByText('No messages yet')).toBeVisible();
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });

  test('MSG-008: new messages indicator appears when scrolled up and jumps to latest', async ({projectDetailsPage}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const {client: adminApi} = await CpmApiClient.login(
      apiContext,
      DEV_ACCOUNTS.ADMIN,
    );

    const nonce = uniqueNonce('pw-msg-008');
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-MSG-${nonce.slice(-8)}`,
      name: `PW Messaging Indicator ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(10).toISOString(),
    });

    // Seed enough messages to ensure the list is scrollable.
      const tallPayload = 'x'.repeat(400);
      for (let i = 1; i <= 30; i++) {
      await adminApi.createMessage({
        projectId: project.id,
          content: `Seed ${i} ${nonce.slice(-6)} ${tallPayload}`,
      });
    }

    const page = projectDetailsPage.page;
    const finalMessage = `PW new message ${nonce.slice(-8)}`;

    try {
      await projectDetailsPage.goto(project.id);
      await page.getByRole('tab', {name: 'Messages'}).click();

      const messagesContainer = page.locator('.message-list-messages');
      await expect(messagesContainer).toBeVisible();

      // Sanity check: the list should be scrollable (otherwise the indicator cannot be meaningfully tested).
        await expect
          .poll(async () => messagesContainer.evaluate((el) => el.scrollHeight - el.clientHeight), {
            timeout: 5_000,
          })
          .toBeGreaterThan(200);

        // ProjectDetailsView may auto-scroll to bottom after marking messages as read.
        // Wait until we're at the bottom (or close to it) before forcing a scroll-up state.
        await expect
          .poll(
            async () =>
              messagesContainer.evaluate(
                (el) => el.scrollHeight - el.scrollTop - el.clientHeight,
              ),
            {timeout: 5_000},
          )
          .toBeLessThan(60);

      // Force the user away from the bottom so the next message triggers the indicator.
      await messagesContainer.evaluate((el) => {
        el.scrollTop = 0;
        el.dispatchEvent(new Event('scroll'));
      });

      await page.waitForTimeout(100);

      const indicator = page.getByRole('button', {name: 'New messages'});
      await expect(indicator).toHaveCount(0);

      const textarea = page.getByPlaceholder('Type a message...');
      await textarea.fill(finalMessage);
      await textarea.press('Enter');

      // The new message is appended, but because we are not at the bottom, a jump indicator should appear.
      await expect(indicator).toBeVisible({timeout: 5_000});

      await indicator.click();
      await expect(indicator).toHaveCount(0);
      await expect(page.locator('.message-text').filter({hasText: finalMessage})).toBeVisible();
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });

  test('MSG-005: drag & drop attachments into message input', async ({projectDetailsPage}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const {client: adminApi} = await CpmApiClient.login(
      apiContext,
      DEV_ACCOUNTS.ADMIN,
    );

    const nonce = uniqueNonce('pw-msg-005');
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-MSG-${nonce.slice(-8)}`,
      name: `PW Messaging DragDrop ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(10).toISOString(),
    });

    const page = projectDetailsPage.page;

    try {
      await projectDetailsPage.goto(project.id);
      await page.getByRole('tab', {name: 'Messages'}).click();

      const dataTransfer = await page.evaluateHandle((suffix) => {
        const dt = new DataTransfer();

        for (let i = 1; i <= 6; i++) {
          dt.items.add(
            new File([`%PDF-1.4\n%pw-${i}\n`], `pw-drop-${suffix}-${i}.pdf`, {
              type: 'application/pdf',
            }),
          );
        }

        return dt;
      }, nonce.slice(-6));

      await page.dispatchEvent('.message-input', 'drop', {dataTransfer});

      // Drag & drop should add files, but must respect maxFiles=5.
      await expect(page.locator('.message-input-file')).toHaveCount(5);
      await expect(page.locator('.message-input-attach-btn')).toBeDisabled();
      await expect(page.locator('.message-input-attach-btn')).toHaveAttribute(
        'title',
        /Maximum 5 files/,
      );
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });

  test('MSG-004: send message with attachments (max 5)', async ({projectDetailsPage}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const {client: adminApi, session: adminSession} = await CpmApiClient.login(
      apiContext,
      DEV_ACCOUNTS.ADMIN,
    );

    const nonce = uniqueNonce('pw-msg-004');
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-MSG-${nonce.slice(-8)}`,
      name: `PW Messaging Attach ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(10).toISOString(),
    });

    const page = projectDetailsPage.page;

    const uploadedFilesForProject: Array<{
      id: string;
      name: string;
      dropboxPath: string;
      type: string;
      sizeInBytes: number;
      uploadedBy: string;
      uploadedAt: string;
      projectId: string;
      taskId: string | null;
      messageId: string | null;
    }> = [];

    const uploadedFileIds: string[] = [];
    let messageCreateBody: null | {
      projectId?: string;
      senderId?: string;
      content?: string;
      fileIds?: string[];
    } = null;

    const nowIso = new Date().toISOString();

    await page.route(
      new RegExp(`/api/v1/projects/${project.id}/files(\\?.*)?$`),
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({success: true, data: uploadedFilesForProject}),
        });
      },
    );

    await page.route('**/api/v1/files/upload', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback();
        return;
      }

      const nextIndex = uploadedFileIds.length + 1;
      const uploadedFileId = `pw-msg-004-file-${nonce}-${nextIndex}`;
      const uploadedFileName = `pw-attach-${nonce}-${nextIndex}.pdf`;

      uploadedFileIds.push(uploadedFileId);
      uploadedFilesForProject.push({
        id: uploadedFileId,
        name: uploadedFileName,
        dropboxPath: `/mock/${project.id}/${uploadedFileName}`,
        type: 'PDF',
        sizeInBytes: 9,
        uploadedBy: adminSession.user.id,
        uploadedAt: nowIso,
        projectId: project.id,
        taskId: null,
        messageId: null,
      });

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            file: {
              id: uploadedFileId,
              name: uploadedFileName,
              type: 'PDF',
              sizeInBytes: 9,
              uploadedAt: nowIso,
              uploadedBy: adminSession.user.id,
              projectId: project.id,
              dropboxPath: `/mock/${project.id}/${uploadedFileName}`,
              mimeType: 'application/pdf',
            },
          },
        }),
      });
    });

    await page.route(new RegExp('/api/v1/messages(\\?.*)?$'), async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback();
        return;
      }

      const bodyText = route.request().postData() || '{}';
      messageCreateBody = JSON.parse(bodyText) as {
        projectId?: string;
        senderId?: string;
        content?: string;
        fileIds?: string[];
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: `pw-msg-004-${nonce}`,
            projectId: messageCreateBody?.projectId ?? project.id,
            senderId: messageCreateBody?.senderId ?? adminSession.user.id,
            content: messageCreateBody?.content ?? '📎 File attachment',
            sentAt: nowIso,
            fileIds: messageCreateBody?.fileIds ?? [],
            readByUserIds: [adminSession.user.id],
            type: 'TEXT',
            sender: {
              id: adminSession.user.id,
              username: adminSession.user.username,
              email: adminSession.user.email,
              role: adminSession.user.role,
            },
          },
        }),
      });
    });

    try {
      await projectDetailsPage.goto(project.id);
      await page.getByRole('tab', {name: 'Messages'}).click();

      const fileInput = page.locator('.message-input-file-input');

      await fileInput.setInputFiles([
        {name: `pw-a-${nonce}-1.pdf`, mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%pw\n')},
        {name: `pw-a-${nonce}-2.pdf`, mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%pw\n')},
        {name: `pw-a-${nonce}-3.pdf`, mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%pw\n')},
        {name: `pw-a-${nonce}-4.pdf`, mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%pw\n')},
        {name: `pw-a-${nonce}-5.pdf`, mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%pw\n')},
      ]);

      await expect(page.locator('.message-input-file')).toHaveCount(5);
      await expect(page.locator('.message-input-attach-btn')).toBeDisabled();
      await expect(page.locator('.message-input-attach-btn')).toHaveAttribute('title', /Maximum 5 files/);

      // Attempt adding a 6th file: it should be blocked (no additional previews added).
      await fileInput.setInputFiles({
        name: `pw-a-${nonce}-6.pdf`,
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4\n%pw\n'),
      });
      await expect(page.locator('.message-input-file')).toHaveCount(5);

      // Send with attachments only (empty content triggers default "📎 File attachment" content).
      await expect(page.getByPlaceholder('Type a message...')).toHaveValue('');
      await page.locator('.message-input-send-btn').click();

      await expect(page.locator('.message-input-file')).toHaveCount(0);
      await expect(page.getByPlaceholder('Type a message...')).toHaveValue('');

      await expect.poll(() => uploadedFileIds.length).toBe(5);
      await expect.poll(() => (messageCreateBody ? 1 : 0)).toBe(1);

      if (!messageCreateBody) {
        throw new Error('Expected message create request body to be captured.');
      }

      const captured = messageCreateBody as any;

      expect(captured.projectId).toBe(project.id);
      expect(captured.content).toBe('📎 File attachment');
      expect((captured.fileIds as unknown[] | undefined)?.length).toBe(5);
      expect(new Set((captured.fileIds as string[] | undefined) ?? [])).toEqual(new Set(uploadedFileIds));
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

  test('MSG-011: message send failure shows error and allows retry (network failure)', async ({projectDetailsPage}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const {client: adminApi} = await CpmApiClient.login(
      apiContext,
      DEV_ACCOUNTS.ADMIN,
    );

    const nonce = uniqueNonce('pw-msg-011');
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-MSG-${nonce.slice(-8)}`,
      name: `PW Messaging Retry ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(10).toISOString(),
    });

    const page = projectDetailsPage.page;
    const messageText = `PW retry ${nonce.slice(-8)}`;
    let postAttempts = 0;

    await page.route(new RegExp('/api/v1/messages(\\?.*)?$'), async (route) => {
      const method = route.request().method();
      if (method === 'OPTIONS') {
        await route.fulfill({status: 204});
        return;
      }

      if (method !== 'POST') {
        await route.fallback();
        return;
      }

      postAttempts += 1;

      if (postAttempts === 1) {
        await route.abort('failed');
        return;
      }

      await route.fallback();
    });

    try {
      await projectDetailsPage.goto(project.id);
      await page.getByRole('tab', {name: 'Messages'}).click();

      await expect(page.getByText('No messages yet')).toBeVisible();

      const textarea = page.getByPlaceholder('Type a message...');
      await textarea.fill(messageText);

      page.once('dialog', async (dialog) => {
        expect(dialog.type()).toBe('alert');
        expect(dialog.message()).toContain('Failed to send message');
        await dialog.accept();
      });

      await textarea.press('Enter');

      await expect.poll(() => postAttempts).toBe(1);
      await expect(page.locator('.message-text').filter({hasText: messageText})).toHaveCount(0);
      await expect(page.getByText('No messages yet')).toBeVisible();

      // Retry: retype message (input is cleared on send).
      await expect(textarea).toHaveValue('');
      await textarea.fill(messageText);
      await textarea.press('Enter');

      await expect.poll(() => postAttempts).toBe(2);
      await expect(
        page.locator('.message-text').filter({hasText: messageText}),
      ).toBeVisible({timeout: 15_000});
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
