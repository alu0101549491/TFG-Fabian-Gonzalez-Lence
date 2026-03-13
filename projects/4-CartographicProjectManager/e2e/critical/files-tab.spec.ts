/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 13, 2026
 * @file e2e/critical/files-tab.spec.ts
 * @desc Critical E2E coverage for the Files tab section visibility and base rendering.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

// Leave exactly 1 blank line before imports

import {request} from '@playwright/test';

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {test, expect} from '../fixtures/test';
import {CpmApiClient} from '../helpers/api';
import {
  AUTH_STATE_ADMIN_PATH,
  getApiBaseUrl,
} from '../helpers/e2e-paths.ts';
import {uniqueNonce, daysFromToday} from '../helpers/test-data';
import {DEV_ACCOUNTS} from '../helpers/auth';

test.describe('Files tab (critical)', () => {
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

  test('FILE-001: files tab shows sections and file list renders', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-file-001');

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);
    const clientId = await resolveClientId(adminApi);

    const code = `PW-FILE-${nonce.slice(-8)}`;

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code,
      name: `PW Files Project ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(14).toISOString(),
    });

    try {
      await page.goto(`projects/${project.id}`);
      await expect(page).toHaveURL(new RegExp(`/projects/${project.id}(\\?|$)`));

      await page.getByRole('tab', {name: /^Files/}).click();
      await expect(page.getByRole('heading', {name: 'Project Files'})).toBeVisible();

      const sectionSelect = page.getByLabel('Upload to Section');
      await expect(sectionSelect).toBeVisible();

      const optionTexts = await sectionSelect.locator('option').allTextContents();
      expect(optionTexts).toEqual(
        expect.arrayContaining(['ReportAndAnnexes', 'Plans', 'Specifications', 'Budget']),
      );

      await expect(page.getByPlaceholder('Search files...')).toBeVisible();
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });

  test('FILE-002: upload file via browse', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-file-002');

    const {client: adminApi, session: adminSession} = await CpmApiClient.login(
      apiContext,
      DEV_ACCOUNTS.ADMIN,
    );
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-FILE-${nonce.slice(-8)}`,
      name: `PW Files Upload ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(14).toISOString(),
    });

    const uploadedFileName = `pw-upload-${nonce.slice(-6)}.pdf`;
    const uploadedFileId = `pw-file-${nonce.slice(-10)}`;
    const nowIso = new Date().toISOString();

    const filesForProject: Array<{
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

    await page.route(
      new RegExp(`/api/v1/projects/${project.id}/files(\\?.*)?$`),
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({success: true, data: filesForProject}),
        });
      },
    );

    await page.route('**/api/v1/files/upload', async (route) => {
      filesForProject.push({
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

    try {
      await page.goto(`projects/${project.id}`);
      await expect(page).toHaveURL(new RegExp(`/projects/${project.id}(\\?|$)`));

      await page.getByRole('tab', {name: /^Files/}).click();
      await expect(page.getByRole('heading', {name: 'Project Files'})).toBeVisible();

      await expect(page.getByLabel('Upload to Section')).toBeVisible();

      await page.locator('.file-uploader input[type="file"]').setInputFiles({
        name: uploadedFileName,
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4\n%pw\n'),
      });

      await expect(page.locator('.file-uploader-queue-title')).toHaveText(/1 file selected/);

      await page.getByRole('button', {name: /Upload 1 file/}).click();

      const uploadedCard = page.locator('.file-card').filter({hasText: uploadedFileName});
      await expect(uploadedCard).toBeVisible();
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });

  test('FILE-004: upload validation rejects file too large', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-file-004');

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-FILE-${nonce.slice(-8)}`,
      name: `PW Files Too Large ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(14).toISOString(),
    });

    await page.route(
      new RegExp(`/api/v1/projects/${project.id}/files(\\?.*)?$`),
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({success: true, data: []}),
        });
      },
    );

    const oversizedFilename = `pw-too-large-${nonce}-${Date.now()}.pdf`;
    const oversizedFilePath = path.join(os.tmpdir(), oversizedFilename);

    try {
      await page.goto(`projects/${project.id}`);
      await expect(page).toHaveURL(new RegExp(`/projects/${project.id}(\\?|$)`));

      await page.getByRole('tab', {name: /^Files/}).click();
      await expect(page.getByRole('heading', {name: 'Project Files'})).toBeVisible();

      await fs.writeFile(oversizedFilePath, 'pw');
      await fs.truncate(oversizedFilePath, 50 * 1024 * 1024 + 1);

      await page.locator('.file-uploader input[type="file"]').setInputFiles(oversizedFilePath);

      await expect(page.locator('.file-uploader-queue-title')).toHaveText(/1 file selected/);

      const item = page.locator('.file-uploader-item').filter({hasText: oversizedFilename});
      await expect(item).toHaveClass(/file-uploader-item-error/);
      await expect(item).toContainText(/File exceeds .* limit/);

      await expect(page.getByRole('button', {name: /Upload 1 file/})).toHaveCount(0);
    } finally {
      try {
        await fs.unlink(oversizedFilePath);
      } catch {
        // Ignore.
      }
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });

  test('FILE-005: upload validation rejects disallowed extension', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-file-005');

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-FILE-${nonce.slice(-8)}`,
      name: `PW Files Bad Ext ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(14).toISOString(),
    });

    await page.route(
      new RegExp(`/api/v1/projects/${project.id}/files(\\?.*)?$`),
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({success: true, data: []}),
        });
      },
    );

    const disallowedName = `pw-disallowed-${nonce.slice(-6)}.exe`;

    try {
      await page.goto(`projects/${project.id}`);
      await expect(page).toHaveURL(new RegExp(`/projects/${project.id}(\\?|$)`));

      await page.getByRole('tab', {name: /^Files/}).click();
      await expect(page.getByRole('heading', {name: 'Project Files'})).toBeVisible();

      await page.locator('.file-uploader input[type="file"]').setInputFiles({
        name: disallowedName,
        mimeType: 'application/octet-stream',
        buffer: Buffer.from('pw'),
      });

      await expect(page.locator('.file-uploader-queue-title')).toHaveText(/1 file selected/);

      const item = page.locator('.file-uploader-item').filter({hasText: disallowedName});
      await expect(item).toHaveClass(/file-uploader-item-error/);
      await expect(item).toContainText('File type not supported');

      await expect(page.getByRole('button', {name: /Upload 1 file/})).toHaveCount(0);
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });

  test('FILE-009: download file from list', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-file-009');

    const {client: adminApi, session: adminSession} = await CpmApiClient.login(
      apiContext,
      DEV_ACCOUNTS.ADMIN,
    );
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-FILE-${nonce.slice(-8)}`,
      name: `PW Files Download ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(14).toISOString(),
    });

    const fileName = `pw-download-${nonce.slice(-6)}.pdf`;
    const fileId = `pw-file-${nonce.slice(-10)}`;
    const nowIso = new Date().toISOString();

    const filesForProject = [
      {
        id: fileId,
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
    ];

    await page.route(
      new RegExp(`/api/v1/projects/${project.id}/files(\\?.*)?$`),
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({success: true, data: filesForProject}),
        });
      },
    );

    const expectedDownloadUrl = 'https://example.com/';

    await page.route(
      new RegExp(`/api/v1/files/${fileId}/download(\\?.*)?$`),
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              downloadUrl: expectedDownloadUrl,
              filename: fileName,
              expiresAt: new Date(Date.now() + 60_000).toISOString(),
            },
          }),
        });
      },
    );

    try {
      await page.goto(`projects/${project.id}`);
      await expect(page).toHaveURL(new RegExp(`/projects/${project.id}(\\?|$)`));

      await page.getByRole('tab', {name: /^Files/}).click();
      await expect(page.getByRole('heading', {name: 'Project Files'})).toBeVisible();

      const card = page.locator('.file-card').filter({hasText: fileName});
      await expect(card).toBeVisible();

      const [popup] = await Promise.all([
        page.waitForEvent('popup'),
        card.getByRole('button', {name: 'Download file'}).click(),
      ]);

      await expect(popup).toHaveURL(/example\.com/);
      await popup.close();
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });

  test('FILE-011: delete file requires confirmation and removes entry', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-file-011');

    const {client: adminApi, session: adminSession} = await CpmApiClient.login(
      apiContext,
      DEV_ACCOUNTS.ADMIN,
    );
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-FILE-${nonce.slice(-8)}`,
      name: `PW Files Delete ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(14).toISOString(),
    });

    const fileName = `pw-delete-${nonce.slice(-6)}.pdf`;
    const fileId = `pw-file-${nonce.slice(-10)}`;
    const nowIso = new Date().toISOString();

    let filesForProject = [
      {
        id: fileId,
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
    ];

    await page.route(
      new RegExp(`/api/v1/projects/${project.id}/files(\\?.*)?$`),
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({success: true, data: filesForProject}),
        });
      },
    );

    await page.route(
      new RegExp(`/api/v1/files/${fileId}(?:\\?.*)?$`),
      async (route) => {
        if (route.request().method() !== 'DELETE') {
          await route.fallback();
          return;
        }

        filesForProject = [];

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({success: true, data: null, message: 'File deleted successfully'}),
        });
      },
    );

    try {
      await page.goto(`projects/${project.id}`);
      await expect(page).toHaveURL(new RegExp(`/projects/${project.id}(\\?|$)`));

      await page.getByRole('tab', {name: /^Files/}).click();
      await expect(page.getByRole('heading', {name: 'Project Files'})).toBeVisible();

      const card = page.locator('.file-card').filter({hasText: fileName});
      await expect(card).toBeVisible();

      page.once('dialog', async (dialog) => {
        expect(dialog.type()).toBe('confirm');
        expect(dialog.message()).toContain(fileName);
        await dialog.accept();
      });

      await card.getByRole('button', {name: 'Delete file'}).click();

      await expect(card).toHaveCount(0);
      await expect(page.getByText('No files uploaded yet')).toBeVisible();
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

test.describe('Files tab (critical permissions)', () => {
  test('FILE-017: non-authorized user cannot upload/delete files', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-file-017');

    const {client: adminApi, session: adminSession} = await CpmApiClient.login(
      apiContext,
      DEV_ACCOUNTS.ADMIN,
    );

    const clients = await adminApi.listUsers('CLIENT');
    const preferredClient = clients.find(
      (user) => user.email.toLowerCase() === DEV_ACCOUNTS.CLIENT.email.toLowerCase(),
    );
    const clientUser = preferredClient ?? clients[0];
    if (!clientUser) {
      throw new Error('No CLIENT users available in the database for FILE-017');
    }

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-FILE-${nonce.slice(-8)}`,
      name: `PW Files Perms ${nonce}`,
      clientId: clientUser.id,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(14).toISOString(),
    });

    const specialUsername = `pw-special-${nonce.slice(-8)}`;
    const specialEmail = `pw-special-${nonce.slice(-8)}@example.com`;
    const specialPassword = `pw-special-${nonce.slice(-8)}`;

    const createSpecialResponse = await apiContext.post('users', {
      headers: {
        Authorization: `Bearer ${adminSession.accessToken}`,
      },
      data: {
        username: specialUsername,
        email: specialEmail,
        password: specialPassword,
        role: 'SPECIAL_USER',
      },
    });
    expect(createSpecialResponse.ok()).toBeTruthy();
    const createSpecialJson = (await createSpecialResponse.json()) as {
      success: boolean;
      data: {id: string; email: string; username: string; role: string};
    };
    const specialUserId = createSpecialJson.data.id;

    const addSpecialUserResponse = await apiContext.post(`projects/${project.id}/special-users`, {
      headers: {
        Authorization: `Bearer ${adminSession.accessToken}`,
      },
      data: {
        userId: specialUserId,
        permissions: ['VIEW'],
      },
    });
    expect(addSpecialUserResponse.ok()).toBeTruthy();

    const permissionsResponse = await apiContext.get(
      `projects/${project.id}/special-users/${specialUserId}/permissions`,
      {
        headers: {
          Authorization: `Bearer ${adminSession.accessToken}`,
        },
      },
    );
    expect(permissionsResponse.ok()).toBeTruthy();
    const permissionsJson = (await permissionsResponse.json()) as {
      success: boolean;
      data: {permissions: string[]};
    };
    expect(permissionsJson.data.permissions).toEqual(['VIEW']);

    const fileName = `pw-perms-${nonce.slice(-6)}.pdf`;
    const fileId = `pw-file-${nonce.slice(-10)}`;
    const nowIso = new Date().toISOString();

    const filesForProject = [
      {
        id: fileId,
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
    ];

    await page.route(
      new RegExp(`/api/v1/projects/${project.id}/files(\\?.*)?$`),
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({success: true, data: filesForProject}),
        });
      },
    );

    try {
      const {session: specialSession} = await CpmApiClient.login(apiContext, {
        email: specialEmail,
        password: specialPassword,
      });

      const projectAsSpecialResponse = await apiContext.get(`projects/${project.id}`, {
        headers: {
          Authorization: `Bearer ${specialSession.accessToken}`,
        },
      });
      expect(projectAsSpecialResponse.ok()).toBeTruthy();
      const projectAsSpecialJson = (await projectAsSpecialResponse.json()) as {
        success: boolean;
        data: {currentUserPermissions?: {canUploadFile?: boolean; canDelete?: boolean}};
      };
      expect(projectAsSpecialJson.data.currentUserPermissions?.canUploadFile).toBe(false);

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

      await page.getByRole('tab', {name: /^Files/}).click();
      await expect(page.getByRole('heading', {name: 'Project Files'})).toBeVisible();

      await expect(page.getByLabel('Upload to Section')).toHaveCount(0);

      const card = page.locator('.file-card').filter({hasText: fileName});
      await expect(card).toBeVisible();
      await expect(card.getByRole('button', {name: 'Download file'})).toBeVisible();
      await expect(card.getByRole('button', {name: 'Delete file'})).toHaveCount(0);
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      try {
        await adminApi.deleteUser(specialUserId);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });
});
