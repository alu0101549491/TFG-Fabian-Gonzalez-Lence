/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 13, 2026
 * @file e2e/critical/admin-pages.spec.ts
 * @desc Critical E2E coverage for admin-only pages accessible to administrators.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

// Leave exactly 1 blank line before imports

import {test, expect} from '../fixtures/test';
import {AUTH_STATE_ADMIN_PATH} from '../helpers/e2e-paths.ts';
import {AUTH_STATE_NON_ADMIN_PATH} from '../helpers/e2e-paths.ts';

test.describe('Admin pages (critical)', () => {
  test.use({storageState: AUTH_STATE_ADMIN_PATH});

  test('BACKUP-002: admin can open backup page and see controls', async ({page}) => {
    await page.goto('backup');

    await expect(page.getByRole('heading', {name: 'Backup Management'})).toBeVisible();
    await expect(page.getByRole('button', {name: '+ Create Backup'})).toBeVisible();
    await expect(page.getByLabel('Backup statistics')).toBeVisible();
  });

  test('BACKUP-003: admin can create a manual backup and see it in history', async ({page}) => {
    const backupFilename = 'backup_manual_2026-03-14.json';
    const created = '2026-03-14T10:00:00.000Z';
    const size = 1024;

    let backupListCallCount = 0;

    await page.route('**/backup/schedule', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            frequency: 'weekly',
            time: '02:00',
            retentionDays: 30,
          },
        }),
      });
    });

    await page.route('**/backup/list', async (route) => {
      backupListCallCount += 1;
      const data =
        backupListCallCount === 1
          ? []
          : [
              {
                filename: backupFilename,
                created,
                size,
                type: 'manual',
              },
            ];

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({success: true, data}),
      });
    });

    await page.route('**/backup/create', async (route) => {
      const method = route.request().method();
      if (method === 'OPTIONS') {
        await route.fulfill({status: 204});
        return;
      }

      expect(method).toBe('POST');
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            filename: backupFilename,
            created,
            size,
            type: 'manual',
          },
        }),
      });
    });

    await page.goto('backup');

    await expect(page.getByText('No backup history available.')).toBeVisible();

    await page.getByRole('button', {name: '+ Create Backup'}).click();

    await expect(
      page.getByRole('alert').filter({hasText: 'Backup created successfully.'}),
    ).toBeVisible();

    await expect(page.locator('table.backup-table tbody tr')).toHaveCount(1);
    await expect(page.locator('table.backup-table')).toContainText('Manual');
  });

  test('BACKUP-005: admin can export project data in supported formats', async ({page}) => {
    await page.route('**/backup/schedule', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            frequency: 'weekly',
            time: '02:00',
            retentionDays: 30,
          },
        }),
      });
    });

    await page.route('**/backup/list', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({success: true, data: []}),
      });
    });

    await page.route('**/export/projects?format=excel**', async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        body: 'FAKE_XLSX',
      });
    });

    await page.route('**/export/projects?format=csv**', async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
        },
        body: 'id,name\n1,Project\n',
      });
    });

    await page.route('**/export/projects?format=pdf**', async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
        },
        body: '%PDF-1.4\n%FakePDF\n',
      });
    });

    await page.goto('backup');

    const excelRequest = page.waitForRequest('**/export/projects?format=excel**');
    await page.getByRole('button', {name: /Export as Excel/}).click();
    await excelRequest;
    await expect(
      page.getByRole('alert').filter({hasText: 'Data exported as EXCEL successfully.'}),
    ).toBeVisible();

    const csvRequest = page.waitForRequest('**/export/projects?format=csv**');
    await page.getByRole('button', {name: /Export as CSV/}).click();
    await csvRequest;
    await expect(
      page.getByRole('alert').filter({hasText: 'Data exported as CSV successfully.'}),
    ).toBeVisible();

    const pdfRequest = page.waitForRequest('**/export/projects?format=pdf**');
    await page.getByRole('button', {name: /Export as PDF/}).click();
    await pdfRequest;
    await expect(
      page.getByRole('alert').filter({hasText: 'Data exported as PDF successfully.'}),
    ).toBeVisible();
  });

  test('BACKUP-006: admin can download a backup from history', async ({page}) => {
    const backupFilename = 'backup_manual_2026-03-14.json';
    const created = '2026-03-14T10:00:00.000Z';
    const size = 2048;

    await page.route('**/backup/schedule', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            frequency: 'weekly',
            time: '02:00',
            retentionDays: 30,
          },
        }),
      });
    });

    await page.route('**/backup/list', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              filename: backupFilename,
              created,
              size,
              type: 'manual',
            },
          ],
        }),
      });
    });

    await page.route('**/backup/*/download', async (route) => {
      const method = route.request().method();
      if (method === 'OPTIONS') {
        await route.fulfill({status: 204});
        return;
      }

      expect(method).toBe('GET');
      await route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: 'FAKE_BACKUP_CONTENT',
      });
    });

    await page.goto('backup');

    const encodedFilename = encodeURIComponent(backupFilename);
    const downloadRequest = page.waitForRequest((request) =>
      request.method() === 'GET' &&
      request.url().includes(`/backup/${encodedFilename}/download`),
    );

    await page
      .locator('table.backup-table tbody tr')
      .first()
      .locator('button[title="Download"]')
      .click();

    await downloadRequest;
  });

  test('BACKUP-008: delete backup requires confirmation', async ({page}) => {
    const backupFilename = 'backup_manual_2026-03-14.json';
    const created = '2026-03-14T10:00:00.000Z';
    const size = 2048;

    let backupListCallCount = 0;
    let deleteCallCount = 0;

    await page.route('**/backup/schedule', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            frequency: 'weekly',
            time: '02:00',
            retentionDays: 30,
          },
        }),
      });
    });

    await page.route('**/backup/list', async (route) => {
      backupListCallCount += 1;
      const data =
        backupListCallCount === 1
          ? [
              {
                filename: backupFilename,
                created,
                size,
                type: 'manual',
              },
            ]
          : [];

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({success: true, data}),
      });
    });

    await page.route('**/backup/*', async (route) => {
      const method = route.request().method();
      if (method === 'OPTIONS') {
        await route.fulfill({status: 204});
        return;
      }

      if (method !== 'DELETE') {
        await route.fallback();
        return;
      }

      deleteCallCount += 1;
      await route.fulfill({status: 204});
    });

    await page.goto('backup');
    await expect(page.locator('table.backup-table tbody tr')).toHaveCount(1);

    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('Delete backup');
      await dialog.dismiss();
    });

    await page
      .locator('table.backup-table tbody tr')
      .first()
      .locator('button[title="Delete"]')
      .click();

    await expect(page.locator('table.backup-table tbody tr')).toHaveCount(1);
    expect(deleteCallCount).toBe(0);

    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });

    const encodedFilename = encodeURIComponent(backupFilename);
    const deleteRequest = page.waitForRequest((request) =>
      request.method() === 'DELETE' && request.url().includes(`/backup/${encodedFilename}`),
    );

    await page
      .locator('table.backup-table tbody tr')
      .first()
      .locator('button[title="Delete"]')
      .click();

    await deleteRequest;

    await expect(
      page.getByRole('alert').filter({hasText: 'Backup deleted successfully.'}),
    ).toBeVisible();

    await expect(page.getByText('No backup history available.')).toBeVisible();
    await expect(page.locator('table.backup-table')).toHaveCount(0);
  });

  test('BACKUP-004: admin can configure and save backup schedule', async ({page}) => {
    let scheduleGetCallCount = 0;
    let schedulePutCallCount = 0;

    const initialSchedule = {
      frequency: 'weekly',
      time: '02:00',
      retentionDays: 30,
    };

    const updatedSchedule = {
      frequency: 'daily',
      time: '03:30',
      retentionDays: 45,
    };

    await page.route('**/backup/list', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({success: true, data: []}),
      });
    });

    await page.route('**/backup/schedule', async (route) => {
      const method = route.request().method();
      if (method === 'OPTIONS') {
        await route.fulfill({status: 204});
        return;
      }

      if (method === 'GET') {
        scheduleGetCallCount += 1;
        const data = scheduleGetCallCount === 1 ? initialSchedule : updatedSchedule;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({success: true, data}),
        });
        return;
      }

      if (method === 'PUT') {
        schedulePutCallCount += 1;
        const posted = route.request().postDataJSON() as typeof updatedSchedule;
        expect(posted).toEqual(updatedSchedule);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({success: true, data: updatedSchedule}),
        });
        return;
      }

      await route.fallback();
    });

    await page.goto('backup');

    await expect(page.getByRole('combobox', {name: 'Frequency'})).toHaveValue('weekly');
    await expect(page.getByRole('textbox', {name: 'Backup Time'})).toHaveValue('02:00');
    await expect(page.getByRole('spinbutton', {name: 'Retention Period (days)'})).toHaveValue('30');

    await page.getByRole('combobox', {name: 'Frequency'}).selectOption('daily');
    await page.getByRole('textbox', {name: 'Backup Time'}).fill(updatedSchedule.time);
    await page.getByRole('spinbutton', {name: 'Retention Period (days)'}).fill(String(updatedSchedule.retentionDays));

    await page.getByRole('button', {name: 'Save Schedule'}).click();

    await expect(
      page.getByRole('alert').filter({hasText: 'Schedule configuration saved successfully.'}),
    ).toBeVisible();

    expect(schedulePutCallCount).toBe(1);

    await expect(page.getByRole('combobox', {name: 'Frequency'})).toHaveValue('daily');
    await expect(page.getByRole('textbox', {name: 'Backup Time'})).toHaveValue('03:30');
    await expect(page.getByRole('spinbutton', {name: 'Retention Period (days)'})).toHaveValue('45');
  });

  test('BACKUP-007: restore backup requires confirmation', async ({page}) => {
    const backupFilename = 'backup_manual_2026-03-14.json';
    const created = '2026-03-14T10:00:00.000Z';
    const size = 2048;

    let restorePostCallCount = 0;

    await page.route('**/backup/schedule', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            frequency: 'weekly',
            time: '02:00',
            retentionDays: 30,
          },
        }),
      });
    });

    await page.route('**/backup/list', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              filename: backupFilename,
              created,
              size,
              type: 'manual',
            },
          ],
        }),
      });
    });

    await page.route('**/backup/restore', async (route) => {
      const method = route.request().method();
      if (method === 'OPTIONS') {
        await route.fulfill({status: 204});
        return;
      }

      expect(method).toBe('POST');
      restorePostCallCount += 1;
      expect(route.request().postDataJSON()).toEqual({filename: backupFilename});
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({success: true, data: null}),
      });
    });

    await page.goto('backup');

    await page
      .locator('table.backup-table tbody tr')
      .first()
      .locator('button[title="Restore"]')
      .click();

    await expect(page.getByRole('dialog', {name: 'Confirm Restore'})).toBeVisible();
    await expect(page.getByText('Warning: This will replace all current data with the backup data.')).toBeVisible();

    await page.getByRole('button', {name: 'Cancel'}).click();
    await expect(page.getByRole('dialog', {name: 'Confirm Restore'})).toHaveCount(0);
    expect(restorePostCallCount).toBe(0);

    await page
      .locator('table.backup-table tbody tr')
      .first()
      .locator('button[title="Restore"]')
      .click();

    await expect(page.getByRole('dialog', {name: 'Confirm Restore'})).toBeVisible();

    const restoreRequest = page.waitForRequest('**/backup/restore');
    await page.getByRole('button', {name: 'Restore Backup'}).click();
    await restoreRequest;

    expect(restorePostCallCount).toBe(1);
    await page.waitForLoadState('load');
  });

  test('BACKUP-009: backup/export failures show clear errors', async ({page}) => {
    await page.route('**/backup/schedule', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            frequency: 'weekly',
            time: '02:00',
            retentionDays: 30,
          },
        }),
      });
    });

    await page.route('**/backup/list', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({success: true, data: []}),
      });
    });

    await page.route('**/backup/create', async (route) => {
      const method = route.request().method();
      if (method === 'OPTIONS') {
        await route.fulfill({status: 204});
        return;
      }

      expect(method).toBe('POST');
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Simulated backup failure',
        }),
      });
    });

    await page.route('**/export/projects?format=csv**', async (route) => {
      const method = route.request().method();
      if (method === 'OPTIONS') {
        await route.fulfill({status: 204});
        return;
      }

      expect(method).toBe('GET');
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Simulated export failure',
        }),
      });
    });

    await page.goto('backup');

    await page.getByRole('button', {name: '+ Create Backup'}).click();
    await expect(
      page.getByRole('alert').filter({hasText: 'Failed to create backup.'}),
    ).toBeVisible();

    await page.getByRole('button', {name: /Export as CSV/}).click();
    await expect(
      page
        .getByRole('alert')
        .filter({hasText: 'Failed to export as csv.'}),
    ).toBeVisible();
  });

  test('USERS-002: admin can view user list page', async ({page}) => {
    await page.goto('users');

    await expect(page.getByRole('heading', {name: 'User Management'})).toBeVisible();
    await expect(page.getByLabel('User filters')).toBeVisible();
    await expect(page.getByLabel('User statistics')).toBeVisible();
  });

  test('SET-001: settings page loads current user profile fields', async ({page}) => {
    await page.goto('settings');

    await expect(page.getByRole('heading', {name: 'Settings'})).toBeVisible();

    const storedUser = await page.evaluate(() => {
      const raw =
        window.sessionStorage.getItem('cpm_user') ??
        window.localStorage.getItem('cpm_user');
      return raw
        ? (JSON.parse(raw) as {username: string; email: string; phone: string | null})
        : null;
    });
    expect(storedUser).not.toBeNull();

    await expect(page.locator('#username')).toHaveValue(storedUser!.username);
    await expect(page.locator('#email')).toHaveValue(storedUser!.email);
    await expect(page.locator('#phone')).toHaveValue(storedUser!.phone ?? '');
  });

  test('SET-002: admin can update profile fields', async ({page}) => {
    await page.goto('settings');

    const storedUser = await page.evaluate(() => {
      const raw =
        window.sessionStorage.getItem('cpm_user') ??
        window.localStorage.getItem('cpm_user');
      return raw
        ? (JSON.parse(raw) as {
            id: string;
            username: string;
            email: string;
            role: string;
            phone: string | null;
          })
        : null;
    });
    expect(storedUser).not.toBeNull();

    const updatedUsername = `${storedUser!.username}-updated`;
    const updatedPhone = '+34 600 000 000';

    let updatePutCallCount = 0;

    await page.route('**/api/v1/users/**', async (route) => {
      const method = route.request().method();
      if (method === 'OPTIONS') {
        await route.fulfill({status: 204});
        return;
      }

      if (method !== 'PUT') {
        await route.fallback();
        return;
      }

      updatePutCallCount += 1;
      const payload = route.request().postDataJSON() as Record<string, unknown>;
      expect(payload).toEqual({
        username: updatedUsername,
        email: storedUser!.email,
        phone: updatedPhone,
      });

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: storedUser!.id,
            username: updatedUsername,
            email: storedUser!.email,
            role: storedUser!.role,
            phone: updatedPhone,
            createdAt: '2026-03-14T10:00:00.000Z',
            lastLogin: null,
          },
        }),
      });
    });

    await page.locator('#username').fill(updatedUsername);
    await page.locator('#phone').fill(updatedPhone);

    await page.getByRole('button', {name: 'Save Changes'}).click();

    await expect(
      page
        .getByRole('alert')
        .filter({hasText: 'Account information updated successfully'}),
    ).toBeVisible();

    expect(updatePutCallCount).toBe(1);
  });

  test('SET-003: password mismatch shows a validation error and blocks saving', async ({page}) => {
    await page.goto('settings');

    let updatePutCallCount = 0;
    await page.route('**/api/v1/users/**', async (route) => {
      if (route.request().method() === 'PUT') {
        updatePutCallCount += 1;
      }
      await route.fallback();
    });

    await page.locator('#new-password').fill('password1234');
    await page.locator('#confirm-password').fill('password123');

    await page.getByRole('button', {name: 'Save Changes'}).click();

    await expect(
      page.getByRole('alert').filter({hasText: 'New passwords do not match'}),
    ).toBeVisible();
    expect(updatePutCallCount).toBe(0);
  });

  test('SET-004: toggle notification preferences shows success', async ({page}) => {
    await page.goto('settings');

    await expect(page.getByRole('heading', {name: 'Settings'})).toBeVisible();

    const emailNotifications = page.getByRole('checkbox', {name: 'Email Notifications'});
    await expect(emailNotifications).toBeVisible();

    await emailNotifications.click();

    await page.getByRole('button', {name: 'Save Preferences'}).click();

    await expect(
      page.getByRole('alert').filter({hasText: 'Notification preferences saved locally'}),
    ).toBeVisible();
  });

  test('SET-005: role-specific settings sections visible appropriately (admin)', async ({page}) => {
    await page.goto('settings');

    await expect(page.getByRole('heading', {name: 'Settings'})).toBeVisible();

    await expect(page.getByRole('heading', {name: '⚡ Administration'})).toBeVisible();
    await expect(page.getByRole('button', {name: 'User Management'})).toBeVisible();
    await expect(page.getByRole('button', {name: 'Backup & Export'})).toBeVisible();

    await expect(page.getByRole('heading', {name: '⚠️ Danger Zone'})).toHaveCount(0);
  });

  test('SET-006: invalid email is rejected client-side and blocks update', async ({page}) => {
    await page.goto('settings');

    let updatePutCallCount = 0;
    await page.route('**/api/v1/users/**', async (route) => {
      if (route.request().method() === 'PUT') {
        updatePutCallCount += 1;
      }
      await route.fallback();
    });

    await page.locator('#email').fill('not-an-email');
    await page.getByRole('button', {name: 'Save Changes'}).click();

    await expect(page.locator('#email')).toHaveJSProperty('validity.typeMismatch', true);
    expect(updatePutCallCount).toBe(0);
  });

  test.describe('Settings (non-admin)', () => {
    test.use({storageState: AUTH_STATE_NON_ADMIN_PATH});

    test('SET-005: role-specific settings sections visible appropriately (non-admin)', async ({page}) => {
      await page.goto('settings');

      await expect(page.getByRole('heading', {name: 'Settings'})).toBeVisible();
      await expect(page.getByRole('heading', {name: '⚠️ Danger Zone'})).toBeVisible();
      await expect(page.getByRole('heading', {name: '⚡ Administration'})).toHaveCount(0);

      const roleLabel = (await page.locator('.user-role-badge').innerText()).trim().toUpperCase();
      if (roleLabel === 'CLIENT') {
        await expect(page.getByRole('heading', {name: '📋 Client Preferences'})).toBeVisible();
        await expect(page.getByRole('heading', {name: '⚙️ Collaboration Preferences'})).toHaveCount(0);
        return;
      }

      if (roleLabel === 'SPECIAL USER') {
        await expect(page.getByRole('heading', {name: '⚙️ Collaboration Preferences'})).toBeVisible();
        await expect(page.getByRole('heading', {name: '📋 Client Preferences'})).toHaveCount(0);
        return;
      }

      throw new Error(`Unexpected non-admin role badge: ${roleLabel}`);
    });
  });

  test('USERS-007: user creation modal enforces required/email/min-length validation', async ({page}) => {
    let postCallCount = 0;

    await page.route('**/api/v1/users**', async (route) => {
      const method = route.request().method();
      if (method === 'OPTIONS') {
        await route.fulfill({status: 204});
        return;
      }

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({success: true, data: []}),
        });
        return;
      }

      if (method === 'POST') {
        postCallCount += 1;
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'pw-e2e-user-id',
              username: 'pw-e2e-user',
              email: 'pw-e2e-user@example.com',
              role: 'CLIENT',
              phone: null,
              createdAt: '2026-03-14T10:00:00.000Z',
              lastLogin: null,
            },
          }),
        });
        return;
      }

      await route.fallback();
    });

    await page.goto('users');

    await expect(page.getByRole('heading', {name: 'User Management'})).toBeVisible();

    await page.getByRole('button', {name: 'Create new user'}).click();

    await expect(page.getByRole('dialog', {name: 'Create New User'})).toBeVisible();

    await page.getByRole('button', {name: 'Create User'}).click();

    await expect(page.locator('#username')).toHaveJSProperty('validity.valueMissing', true);
    await expect(page.locator('#email')).toHaveJSProperty('validity.valueMissing', true);
    await expect(page.locator('#password')).toHaveJSProperty('validity.valueMissing', true);
    expect(postCallCount).toBe(0);

    await page.locator('#username').fill('new-user');
    await page.locator('#email').fill('not-an-email');
    await page.locator('#password').fill('password123');
    await page.getByRole('button', {name: 'Create User'}).click();

    await expect(page.locator('#email')).toHaveJSProperty('validity.typeMismatch', true);
    expect(postCallCount).toBe(0);

    await page.locator('#email').fill('new-user@example.com');
    await page.locator('#password').fill('short');
    await page.getByRole('button', {name: 'Create User'}).click();

    await expect(page.locator('#password')).toHaveJSProperty('validity.tooShort', true);
    expect(postCallCount).toBe(0);
  });
});
