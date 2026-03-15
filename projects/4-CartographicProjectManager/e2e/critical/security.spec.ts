/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2026-03-13
 * @file e2e/critical/security.spec.ts
 * @desc Critical E2E security checks (data isolation and unauthorized access).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

// Leave exactly 1 blank line before imports

import {request} from '@playwright/test';

import {test, expect} from '../fixtures/test';
import {CpmApiClient} from '../helpers/api';
import {AUTH_STATE_NON_ADMIN_PATH, getApiBaseUrl} from '../helpers/e2e-paths.ts';
import {uniqueNonce, daysFromToday} from '../helpers/test-data';
import {DEV_ACCOUNTS} from '../helpers/auth';

test.describe('Security (critical)', () => {
  test.describe('Forbidden route', () => {
    test.use({storageState: AUTH_STATE_NON_ADMIN_PATH});

    test('SEC-002: direct access to /forbidden renders access denied page', async ({page}) => {
      await page.goto('forbidden');

      await expect(page.getByRole('heading', {name: 'Access Forbidden'})).toBeVisible();
      await expect(page.getByText("You don't have permission to access this resource.")).toBeVisible();
      await expect(page.getByRole('button', {name: 'Go Back'})).toBeVisible();
    });
  });

  test('SEC-003: client cannot access another client’s project details by URL', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);

    const nonce = uniqueNonce('pw-sec-003');

    const clientA = await adminApi.register({
      username: `pw-sec-a-${nonce.slice(-8)}`,
      email: `pw-sec-a-${nonce}@example.com`,
      password: `pw-sec-${nonce}`,
    });

    const clientB = await adminApi.register({
      username: `pw-sec-b-${nonce.slice(-8)}`,
      email: `pw-sec-b-${nonce}@example.com`,
      password: `pw-sec-${nonce}`,
    });

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-SEC-${nonce.slice(-8)}`,
      name: `PW Security Isolation ${nonce}`,
      clientId: clientB.user.id,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(10).toISOString(),
    });

    try {
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await page.addInitScript(
        ({accessToken, refreshToken, user, expiresAt: expiresAtValue}) => {
          window.sessionStorage.setItem('cpm_access_token', accessToken);
          window.sessionStorage.setItem('cpm_refresh_token', refreshToken);
          window.sessionStorage.setItem('cpm_user', JSON.stringify(user));
          window.sessionStorage.setItem('cpm_expires_at', expiresAtValue);
        },
        {
          accessToken: clientA.accessToken,
          refreshToken: clientA.refreshToken,
          user: clientA.user,
          expiresAt,
        },
      );

      await page.goto(`projects/${project.id}`);
      await expect(page).toHaveURL(new RegExp(`/projects/${project.id}(\\?|$)`));

      // The app intentionally enforces project authorization server-side; the UI should fail closed.
      await expect(page.getByRole('heading', {name: 'Project not found'})).toBeVisible();
      await expect(page.getByRole('button', {name: 'Go Back'})).toBeVisible();
      await expect(page.getByRole('tab')).toHaveCount(0);
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      try {
        await adminApi.deleteUser(clientA.user.id);
      } catch {
        // Ignore.
      }
      try {
        await adminApi.deleteUser(clientB.user.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });

  test('SEC-004: special user permission restrictions', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const {client: adminApi, session: adminSession} = await CpmApiClient.login(
      apiContext,
      DEV_ACCOUNTS.ADMIN,
    );

    const nonce = uniqueNonce('pw-sec-004');

    const client = await adminApi.register({
      username: `pw-sec-004-client-${nonce.slice(-6)}`,
      email: `pw-sec-004-client-${nonce}@example.com`,
      password: `pw-sec-${nonce}`,
    });

    const specialEmail = `pw-sec-004-su-${nonce}@example.com`;
    const specialPassword = `pw-sec-${nonce}`;

    const specialUser = await adminApi.createUser({
      username: `pw-sec-004-su-${nonce.slice(-6)}`,
      email: specialEmail,
      password: specialPassword,
      role: 'SPECIAL_USER',
    });

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-SEC-${nonce.slice(-8)}`,
      name: `PW Special User Permissions ${nonce}`,
      clientId: client.user.id,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(10).toISOString(),
    });

    // Seed a task assigned to the special user so task cards render.
    const task = await adminApi.createTask({
      projectId: project.id,
      creatorId: adminSession.user.id,
      assigneeId: specialUser.id,
      description: `PW SEC-004 Task ${nonce}`,
      status: 'PENDING',
      priority: 'MEDIUM',
      dueDate: daysFromToday(5).toISOString(),
      comments: null,
    });

    // Grant VIEW-only permissions: can view project/messages, but cannot edit tasks, send messages, upload, or download files.
    const addSpecialUserResponse = await apiContext.post(`projects/${project.id}/special-users`, {
      headers: {
        Authorization: `Bearer ${adminSession.accessToken}`,
      },
      data: {
        userId: specialUser.id,
        permissions: ['VIEW'],
      },
    });
    expect(addSpecialUserResponse.ok()).toBeTruthy();

    // Stub a deterministic files list so we can assert download actions are hidden.
    const fileName = `pw-sec-004-${nonce.slice(-6)}.pdf`;
    const nowIso = new Date().toISOString();
    await page.route(new RegExp(`/api/v1/projects/${project.id}/files(\\?.*)?$`), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: `pw-sec-004-file-${nonce.slice(-10)}`,
              name: fileName,
              dropboxPath: `/mock/${project.id}/${fileName}`,
              type: 'PDF',
              sizeInBytes: 9,
              uploadedBy: adminSession.user.id,
              uploadedAt: nowIso,
              projectId: project.id,
              taskId: null,
              messageId: null,
            },
          ],
        }),
      });
    });

    try {
      const {session: specialSession} = await CpmApiClient.login(apiContext, {
        email: specialEmail,
        password: specialPassword,
      });

      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await page.addInitScript(
        ({accessToken, refreshToken, user, expiresAt: expiresAtValue}) => {
          window.sessionStorage.setItem('cpm_access_token', accessToken);
          window.sessionStorage.setItem('cpm_refresh_token', refreshToken);
          window.sessionStorage.setItem('cpm_user', JSON.stringify(user));
          window.sessionStorage.setItem('cpm_expires_at', expiresAtValue);
        },
        {
          accessToken: specialSession.accessToken,
          refreshToken: specialSession.refreshToken,
          user: specialSession.user,
          expiresAt,
        },
      );

      await page.goto(`projects/${project.id}`);
      await expect(page).toHaveURL(new RegExp(`/projects/${project.id}(\\?|$)`));

      // Tasks: restricted actions disabled + feedback shown.
      await page.getByRole('tab', {name: /^Tasks/}).click();
      await expect(page.getByText("You don't have permission to modify tasks in this project.")).toBeVisible();
      await expect(page.getByRole('button', {name: '+ New Task'})).toHaveCount(0);

      const taskCard = page.locator('.task-card').filter({hasText: task.description});
      await expect(taskCard).toBeVisible();
      await expect(taskCard.getByLabel('Task actions')).toHaveCount(0);

      // Messages: sending blocked + feedback shown.
      await page.getByRole('tab', {name: /^Messages/}).click();
      await expect(page.getByText("You don't have permission to send messages in this project.")).toBeVisible();
      await expect(page.locator('.message-input-textarea')).toBeDisabled();

      // Files: upload/download blocked + feedback shown.
      await page.getByRole('tab', {name: /^Files/}).click();
      await expect(page.getByText("You don't have permission to upload files in this project.")).toBeVisible();
      await expect(page.getByText("You don't have permission to download files in this project.")).toBeVisible();
      await expect(page.getByLabel('Upload to Section')).toHaveCount(0);

      const fileCard = page.locator('.file-card').filter({hasText: fileName});
      await expect(fileCard).toBeVisible();
      await expect(fileCard.getByRole('button', {name: 'Download file'})).toHaveCount(0);
    } finally {
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
        await adminApi.deleteUser(client.user.id);
      } catch {
        // Ignore.
      }
      try {
        await adminApi.deleteUser(specialUser.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });
});
