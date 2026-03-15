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

  test('FILE-003: upload via drag & drop', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-file-003');

    const {client: adminApi, session: adminSession} = await CpmApiClient.login(
      apiContext,
      DEV_ACCOUNTS.ADMIN,
    );
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-FILE-${nonce.slice(-8)}`,
      name: `PW Files DragDrop ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(14).toISOString(),
    });

    const uploadedFileName = `pw-dnd-${nonce.slice(-6)}.pdf`;
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
      if (route.request().method() !== 'POST') {
        await route.fallback();
        return;
      }

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

      const dataTransfer = await page.evaluateHandle((name) => {
        const dt = new DataTransfer();
        dt.items.add(new File(['%PDF-1.4\n%pw\n'], name, {type: 'application/pdf'}));
        return dt;
      }, uploadedFileName);

      await page.dispatchEvent('.file-uploader-dropzone', 'drop', {dataTransfer});

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

  test('FILE-008: cancel upload in progress', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-file-008');

    const {client: adminApi, session: adminSession} = await CpmApiClient.login(
      apiContext,
      DEV_ACCOUNTS.ADMIN,
    );
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-FILE-${nonce.slice(-8)}`,
      name: `PW Files Cancel Upload ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(14).toISOString(),
    });

    const uploadedFileName = `pw-cancel-${nonce.slice(-6)}.pdf`;
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
      if (route.request().method() !== 'POST') {
        await route.fallback();
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 2500));

      try {
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
      } catch {
        // Upload canceled/aborted by the browser.
      }
    });

    try {
      await page.goto(`projects/${project.id}`);
      await expect(page).toHaveURL(new RegExp(`/projects/${project.id}(\\?|$)`));

      await page.getByRole('tab', {name: /^Files/}).click();
      await expect(page.getByRole('heading', {name: 'Project Files'})).toBeVisible();

      await page.locator('.file-uploader input[type="file"]').setInputFiles({
        name: uploadedFileName,
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4\n%pw\n'),
      });

      await expect(page.locator('.file-uploader-queue-title')).toHaveText(/1 file selected/);
      await page.getByRole('button', {name: /Upload 1 file/}).click();

      const uploadingItem = page.locator('.file-uploader-item-uploading').filter({hasText: uploadedFileName});
      await expect(uploadingItem).toBeVisible();

      await uploadingItem.getByRole('button', {name: 'Cancel upload'}).click();

      const canceledErrorText = page.locator('.file-uploader-item-error-text').filter({hasText: 'Upload canceled'});
      await expect(canceledErrorText).toBeVisible();

      const uploadedCard = page.locator('.file-card').filter({hasText: uploadedFileName});
      await expect(uploadedCard).toHaveCount(0);
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

  test('FILE-006: max file queue size (default 10) enforced', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-file-006');

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-FILE-${nonce.slice(-8)}`,
      name: `PW Files Max Queue ${nonce}`,
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

    const files = Array.from({length: 11}, (_, index) => {
      const n = String(index + 1).padStart(2, '0');
      return {
        name: `pw-maxq-${nonce.slice(-6)}-${n}.pdf`,
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4\n%pw\n'),
      };
    });

    try {
      await page.goto(`projects/${project.id}`);
      await expect(page).toHaveURL(new RegExp(`/projects/${project.id}(\\?|$)`));

      await page.getByRole('tab', {name: /^Files/}).click();
      await expect(page.getByRole('heading', {name: 'Project Files'})).toBeVisible();

      await page.locator('.file-uploader input[type="file"]').setInputFiles(files);

      await expect(page.locator('.file-uploader-item')).toHaveCount(10);
      await expect(page.locator('.file-uploader-queue-title')).toContainText('10 files selected');
      await expect(page.getByRole('button', {name: /Upload 10 files/})).toBeVisible();
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });

  test('FILE-007: retry failed upload', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-file-007');

    const {client: adminApi, session: adminSession} = await CpmApiClient.login(
      apiContext,
      DEV_ACCOUNTS.ADMIN,
    );
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-FILE-${nonce.slice(-8)}`,
      name: `PW Files Retry ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(14).toISOString(),
    });

    const uploadedFileName = `pw-retry-${nonce.slice(-6)}.pdf`;
    const uploadedFileId = `pw-file-retry-${nonce.slice(-10)}`;
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

    let uploadAttempts = 0;

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
      if (route.request().method() !== 'POST') {
        await route.fallback();
        return;
      }

      uploadAttempts++;

      if (uploadAttempts === 1) {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({success: false, message: 'Upload failed'}),
        });
        return;
      }

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

      await page.locator('.file-uploader input[type="file"]').setInputFiles({
        name: uploadedFileName,
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4\n%pw\n'),
      });

      await expect(page.getByRole('button', {name: /Upload 1 file/})).toBeVisible();
      await page.getByRole('button', {name: /Upload 1 file/}).click();

      await expect(page.locator('.file-uploader-item-error')).toHaveCount(1);
      await expect(page.locator('.file-uploader-item-retry')).toHaveCount(1);

      await page.locator('.file-uploader-item-retry').click();
      await expect(page.locator('.file-uploader-item-pending')).toHaveCount(1);

      await page.getByRole('button', {name: /Upload 1 file/}).click();
      await expect.poll(() => uploadAttempts).toBe(2);

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

  test('FILE-012: search and sort within file list', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-file-012');

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-FILE-${nonce.slice(-8)}`,
      name: `PW Files Search Sort ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(14).toISOString(),
    });

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
    }> = [
      {
        id: `pw-file-012-bravo-${nonce}`,
        name: `Bravo-${nonce.slice(-4)}.pdf`,
        dropboxPath: `/mock/${project.id}/bravo.pdf`,
        type: 'PDF',
        sizeInBytes: 100,
        uploadedBy: 'pw-uploader',
        uploadedAt: '2026-03-10T10:00:00.000Z',
        projectId: project.id,
        taskId: null,
        messageId: null,
      },
      {
        id: `pw-file-012-charlie-${nonce}`,
        name: `Charlie-${nonce.slice(-4)}.pdf`,
        dropboxPath: `/mock/${project.id}/charlie.pdf`,
        type: 'PDF',
        sizeInBytes: 300,
        uploadedBy: 'pw-uploader',
        uploadedAt: '2026-03-11T10:00:00.000Z',
        projectId: project.id,
        taskId: null,
        messageId: null,
      },
      {
        id: `pw-file-012-alpha-${nonce}`,
        name: `Alpha-${nonce.slice(-4)}.pdf`,
        dropboxPath: `/mock/${project.id}/alpha.pdf`,
        type: 'PDF',
        sizeInBytes: 200,
        uploadedBy: 'pw-uploader',
        uploadedAt: '2026-03-12T10:00:00.000Z',
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
      await page.goto(`projects/${project.id}`);
      await expect(page).toHaveURL(new RegExp(`/projects/${project.id}(\\?|$)`));

      await page.getByRole('tab', {name: /^Files/}).click();
      await expect(page.getByRole('heading', {name: 'Project Files'})).toBeVisible();

      // Ensure grid view (uses .file-card-name).
      await page.getByRole('button', {name: 'Grid view'}).click();

      const cardNames = page.locator('.file-card-name');
      await expect(cardNames).toHaveCount(3);

      // Default sort is Newest First (date-desc): Alpha is newest.
      await expect(cardNames.first()).toHaveText(new RegExp(`^Alpha-${nonce.slice(-4)}\\.pdf$`));

      const search = page.getByPlaceholder('Search files...');
      await search.fill('bravo');
      await expect(cardNames).toHaveCount(1);
      await expect(page.locator('.file-card').first()).toContainText(`Bravo-${nonce.slice(-4)}.pdf`);

      await page.getByRole('button', {name: 'Clear search'}).click();
      await expect(cardNames).toHaveCount(3);

      const sortSelect = page.getByLabel('Sort files');
      await sortSelect.selectOption('name-desc');
      await expect(cardNames.first()).toHaveText(new RegExp(`^Charlie-${nonce.slice(-4)}\\.pdf$`));

      await sortSelect.selectOption('size-asc');
      await expect(cardNames.first()).toHaveText(new RegExp(`^Bravo-${nonce.slice(-4)}\\.pdf$`));
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });

  test('FILE-013: toggle grid/list view preserves content', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-file-013');

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-FILE-${nonce.slice(-8)}`,
      name: `PW Files View Toggle ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(14).toISOString(),
    });

    const alphaName = `Alpha-${nonce.slice(-4)}.pdf`;
    const bravoName = `Bravo-${nonce.slice(-4)}.pdf`;

    const filesForProject = [
      {
        id: `pw-file-013-alpha-${nonce}`,
        name: alphaName,
        dropboxPath: `/mock/${project.id}/alpha.pdf`,
        type: 'PDF',
        sizeInBytes: 123,
        uploadedBy: 'pw-uploader',
        uploadedAt: '2026-03-12T10:00:00.000Z',
        projectId: project.id,
        taskId: null,
        messageId: null,
      },
      {
        id: `pw-file-013-bravo-${nonce}`,
        name: bravoName,
        dropboxPath: `/mock/${project.id}/bravo.pdf`,
        type: 'PDF',
        sizeInBytes: 456,
        uploadedBy: 'pw-uploader',
        uploadedAt: '2026-03-11T10:00:00.000Z',
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
      await page.goto(`projects/${project.id}`);
      await expect(page).toHaveURL(new RegExp(`/projects/${project.id}(\\?|$)`));

      await page.getByRole('tab', {name: /^Files/}).click();
      await expect(page.getByRole('heading', {name: 'Project Files'})).toBeVisible();

      // Grid view.
      await page.getByRole('button', {name: 'Grid view'}).click();
      await expect(page.locator('.file-card')).toHaveCount(2);
      await expect(page.locator('.file-card-name').first()).toHaveText(alphaName);
      await expect(page.locator('.file-card-name').last()).toHaveText(bravoName);

      // List view.
      await page.getByRole('button', {name: 'List view'}).click();
      await expect(page.locator('.file-list-table table')).toBeVisible();
      await expect(page.locator('.file-list-row')).toHaveCount(2);
      await expect(page.locator('.file-list-name').first()).toHaveText(alphaName);
      await expect(page.locator('.file-list-name').last()).toHaveText(bravoName);

      // Back to grid.
      await page.getByRole('button', {name: 'Grid view'}).click();
      await expect(page.locator('.file-card')).toHaveCount(2);
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

  test('FILE-010: preview file opens in a new tab', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-file-010');

    const {client: adminApi, session: adminSession} = await CpmApiClient.login(
      apiContext,
      DEV_ACCOUNTS.ADMIN,
    );
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-FILE-${nonce.slice(-8)}`,
      name: `PW Files Preview ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(14).toISOString(),
    });

    const fileName = `pw-preview-${nonce.slice(-6)}.pdf`;
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

    const expectedPreviewUrl = `https://example.com/pw-preview-${nonce}.html`;
    let previewRequests = 0;

    await page.route(
      new RegExp(`/api/v1/files/${fileId}/preview(\\?.*)?$`),
      async (route) => {
        previewRequests += 1;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              previewUrl: expectedPreviewUrl,
            },
          }),
        });
      },
    );

    await page.context().route(new RegExp(`^${expectedPreviewUrl}$`), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<!doctype html><title>pw-preview</title><h1>pw-preview</h1>',
      });
    });

    try {
      await page.goto(`projects/${project.id}`);
      await expect(page).toHaveURL(new RegExp(`/projects/${project.id}(\\?|$)`));

      await page.getByRole('tab', {name: /^Files/}).click();
      await expect(page.getByRole('heading', {name: 'Project Files'})).toBeVisible();

      const card = page.locator('.file-card').filter({hasText: fileName});
      await expect(card).toBeVisible();

      const [popup] = await Promise.all([
        page.waitForEvent('popup'),
        card.getByRole('button', {name: 'Preview file'}).click(),
      ]);

      await expect(popup).toHaveURL(new RegExp(`pw-preview-${nonce}\\.html$`));
      await expect.poll(() => previewRequests).toBe(1);
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

  test('FILE-014: Sync Dropbox files updates list', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-file-014');

    const {client: adminApi, session: adminSession} = await CpmApiClient.login(
      apiContext,
      DEV_ACCOUNTS.ADMIN,
    );
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-FILE-${nonce.slice(-8)}`,
      name: `PW Files Sync ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(14).toISOString(),
    });

    const nowIso = new Date().toISOString();
    const syncedFileName = `pw-sync-${nonce.slice(-6)}.pdf`;
    const syncedFileId = `pw-file-${nonce.slice(-10)}`;

    let filesForProject: Array<{
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

    await page.route(
      new RegExp(`/api/v1/files/project/${project.id}/sync(\\?.*)?$`),
      async (route) => {
        if (route.request().method() !== 'POST') {
          await route.fallback();
          return;
        }

        filesForProject = [
          {
            id: syncedFileId,
            name: syncedFileName,
            dropboxPath: `/mock/${project.id}/${syncedFileName}`,
            type: 'PDF',
            sizeInBytes: 9,
            uploadedBy: adminSession.user.id,
            uploadedAt: nowIso,
            projectId: project.id,
            taskId: null,
            messageId: null,
          },
        ];

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {synced: 1, skipped: 0, totalFiles: 1},
          }),
        });
      },
    );

    try {
      await page.goto(`projects/${project.id}`);
      await expect(page).toHaveURL(new RegExp(`/projects/${project.id}(\\?|$)`));

      await page.getByRole('tab', {name: /^Files/}).click();
      await expect(page.getByRole('heading', {name: 'Project Files'})).toBeVisible();

      page.once('dialog', async (dialog) => {
        expect(dialog.type()).toBe('alert');
        expect(dialog.message()).toContain('Successfully synced 1 file(s) from Dropbox');
        expect(dialog.message()).toContain('Total files: 1');
        expect(dialog.message()).toContain('Newly synced: 1');
        expect(dialog.message()).toContain('Already in database: 0');
        await dialog.accept();
      });

      await page.getByRole('button', {name: /Sync from Dropbox/}).click();

      const syncedCard = page.locator('.file-card').filter({hasText: syncedFileName});
      await expect(syncedCard).toBeVisible();
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });

  test('FILE-015: Open Dropbox folder action', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-file-015');

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);
    const clientId = await resolveClientId(adminApi);

    const code = `PW-FILE-${nonce.slice(-8)}`;
    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code,
      name: `PW Files Open Dropbox ${nonce}`,
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

      const [popup] = await Promise.all([
        page.waitForEvent('popup'),
        page.getByRole('button', {name: /Open in Dropbox/}).click(),
      ]);

      await expect(popup).toHaveURL(
        new RegExp(
          `dropbox\\.com/(home/.*CartographicProjects/${code}$|login\\?cont=.*CartographicProjects%2F${code}($|&))`,
        ),
      );
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

  test('FILE-016: section selection defaults safely when missing/invalid', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-file-016');

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-FILE-${nonce.slice(-8)}`,
      name: `PW Files Default Section ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(14).toISOString(),
    });

    try {
      // Deep-link to Files tab with a bogus section state (if supported).
      await page.goto(`projects/${project.id}?tab=files&section=INVALID_SECTION`);
      await expect(page).toHaveURL(new RegExp(`/projects/${project.id}(\\?|$)`));

      // Ensure Files tab content is visible.
      await page.getByRole('tab', {name: /^Files/}).click();
      await expect(page.getByRole('heading', {name: 'Project Files'})).toBeVisible();

      const sectionSelect = page.getByLabel('Upload to Section');
      await expect(sectionSelect).toBeVisible();
      await expect(sectionSelect).toHaveValue('ReportAndAnnexes');
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });

  test('FILE-018: upload technical formats (PDF/KML/SHP/images)', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const nonce = uniqueNonce('pw-file-018');

    const {client: adminApi, session: adminSession} = await CpmApiClient.login(
      apiContext,
      DEV_ACCOUNTS.ADMIN,
    );
    const clientId = await resolveClientId(adminApi);

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-FILE-${nonce.slice(-8)}`,
      name: `PW Files Formats ${nonce}`,
      clientId,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(14).toISOString(),
    });

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

    type UploadStub = {
      id: string;
      name: string;
      type: string;
      mimeType: string;
      sizeInBytes: number;
    };

    let nextUpload: UploadStub | null = null;

    await page.route('**/api/v1/files/upload', async (route) => {
      if (!nextUpload) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({success: false, error: 'Unexpected upload request'}),
        });
        return;
      }

      const upload = nextUpload;
      nextUpload = null;

      filesForProject.push({
        id: upload.id,
        name: upload.name,
        dropboxPath: `/mock/${project.id}/${upload.name}`,
        type: upload.type,
        sizeInBytes: upload.sizeInBytes,
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
              id: upload.id,
              name: upload.name,
              type: upload.type,
              sizeInBytes: upload.sizeInBytes,
              uploadedAt: nowIso,
              uploadedBy: adminSession.user.id,
              projectId: project.id,
              dropboxPath: `/mock/${project.id}/${upload.name}`,
              mimeType: upload.mimeType,
            },
          },
        }),
      });
    });

    async function uploadOneFile(params: {
      fileName: string;
      mimeType: string;
      buffer: Buffer;
      fileType: string;
    }): Promise<void> {
      nextUpload = {
        id: `pw-file-${nonce}-${params.fileName}`,
        name: params.fileName,
        type: params.fileType,
        mimeType: params.mimeType,
        sizeInBytes: params.buffer.length,
      };

      await page.locator('.file-uploader input[type="file"]').setInputFiles({
        name: params.fileName,
        mimeType: params.mimeType,
        buffer: params.buffer,
      });

      await expect(page.locator('.file-uploader-queue-title')).toHaveText(/1 file selected/);
      await page.getByRole('button', {name: /Upload 1 file/}).click();

      const uploadedCard = page.locator('.file-card').filter({hasText: params.fileName});
      await expect(uploadedCard).toBeVisible();

      // The uploader keeps the item in the queue after a successful upload.
      // Clear it so each format is tested as a clean 1-file upload.
      await page.getByRole('button', {name: 'Clear all'}).click();
      await expect(page.locator('.file-uploader-queue')).toHaveCount(0);
    }

    try {
      await page.goto(`projects/${project.id}`);
      await expect(page).toHaveURL(new RegExp(`/projects/${project.id}(\\?|$)`));

      await page.getByRole('tab', {name: /^Files/}).click();
      await expect(page.getByRole('heading', {name: 'Project Files'})).toBeVisible();

      await uploadOneFile({
        fileName: `pw-format-${nonce.slice(-6)}.pdf`,
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4\n%pw\n'),
        fileType: 'PDF',
      });

      await uploadOneFile({
        fileName: `pw-format-${nonce.slice(-6)}.kml`,
        mimeType: 'application/vnd.google-earth.kml+xml',
        buffer: Buffer.from('<?xml version="1.0" encoding="UTF-8"?><kml></kml>'),
        fileType: 'KML',
      });

      await uploadOneFile({
        fileName: `pw-format-${nonce.slice(-6)}.shp`,
        mimeType: 'application/octet-stream',
        buffer: Buffer.from('SHP'),
        fileType: 'SHP',
      });

      await uploadOneFile({
        fileName: `pw-format-${nonce.slice(-6)}.png`,
        mimeType: 'image/png',
        buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        fileType: 'IMAGE',
      });
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
        data: {currentUserPermissions?: {canUploadFile?: boolean; canDownloadFile?: boolean; canDelete?: boolean}};
      };
      expect(projectAsSpecialJson.data.currentUserPermissions?.canUploadFile).toBe(false);
      expect(projectAsSpecialJson.data.currentUserPermissions?.canDownloadFile).toBe(false);

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
      await expect(page.getByText("You don't have permission to download files in this project.")).toBeVisible();
      await expect(card.getByRole('button', {name: 'Download file'})).toHaveCount(0);
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
