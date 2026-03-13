/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 13, 2026
 * @file e2e/medium/users-management.spec.ts
 * @desc Medium-priority E2E coverage for admin user management (create/edit/filters).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

// Leave exactly 1 blank line before imports

import {request, type Page} from '@playwright/test';

import {test, expect} from '../fixtures/test';
import {CpmApiClient} from '../helpers/api';
import {AUTH_STATE_ADMIN_PATH, getApiBaseUrl} from '../helpers/e2e-paths.ts';
import {uniqueNonce} from '../helpers/test-data';
import {DEV_ACCOUNTS} from '../helpers/auth';

test.describe('Users management (medium)', () => {
  test.use({storageState: AUTH_STATE_ADMIN_PATH});

  async function openCreateUserModal(page: Page): Promise<void> {
    await page.goto('users');
    await expect(page.getByRole('heading', {name: 'User Management'})).toBeVisible();
    await page.getByRole('button', {name: 'Create new user'}).click();
    await expect(page.getByRole('dialog', {name: 'Create New User'})).toBeVisible();
  }

  test('USERS-003: create user (admin)', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);

    const nonce = uniqueNonce('pw-users-create');
    const username = `pw-user-${nonce.slice(-6)}`;
    const email = `pw.users.${nonce}@example.com`;
    const password = `pw-${nonce}-Pass123!`;

    let createdUserId: string | null = null;

    try {
      await openCreateUserModal(page);

      const dialog = page.getByRole('dialog', {name: 'Create New User'});
      await dialog.getByLabel(/^Username/i).fill(username);
      await dialog.getByLabel(/^Email/i).fill(email);
      await dialog.getByLabel(/^Password/i).fill(password);
      await dialog.getByLabel(/^Role/i).selectOption('CLIENT');
      await dialog.getByLabel(/^Phone/i).fill('+34 600 000 123');

      await dialog.getByRole('button', {name: 'Create User'}).click();
      await expect(dialog).toHaveCount(0);

      const row = page.locator('tbody tr', {hasText: email});
      await expect(row).toBeVisible();
      await expect(row).toContainText(username);
      await expect(row).toContainText('Client');

      createdUserId = (await adminApi.getUserByEmail(email)).id;
    } finally {
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

  test('USERS-004: edit user role', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);

    const nonce = uniqueNonce('pw-users-edit');
    const username = `pw-edit-${nonce.slice(-6)}`;
    const email = `pw.users.edit.${nonce}@example.com`;
    const password = `pw-${nonce}-Pass123!`;

    let createdUserId: string | null = null;

    try {
      await openCreateUserModal(page);
      const createDialog = page.getByRole('dialog', {name: 'Create New User'});
      await createDialog.getByLabel(/^Username/i).fill(username);
      await createDialog.getByLabel(/^Email/i).fill(email);
      await createDialog.getByLabel(/^Password/i).fill(password);
      await createDialog.getByLabel(/^Role/i).selectOption('CLIENT');
      await createDialog.getByRole('button', {name: 'Create User'}).click();
      await expect(createDialog).toHaveCount(0);

      const row = page.locator('tbody tr', {hasText: email});
      await expect(row).toBeVisible();

      await page.getByRole('button', {name: `Edit ${username}`}).click();
      const editDialog = page.getByRole('dialog', {name: 'Edit User'});
      await expect(editDialog).toBeVisible();
      await editDialog.getByLabel(/^Role/i).selectOption('SPECIAL_USER');
      await editDialog.getByRole('button', {name: 'Save Changes'}).click();
      await expect(editDialog).toHaveCount(0);

      await expect(row).toContainText('Special User');

      createdUserId = (await adminApi.getUserByEmail(email)).id;
    } finally {
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

  test('USERS-005: delete user blocked for self', async ({page}) => {
    await page.goto('users');
    await expect(page.getByRole('heading', {name: 'User Management'})).toBeVisible();

    const deleteSelfButton = page.locator('button[aria-label="Delete Admin User"]');
    await expect(deleteSelfButton).toBeVisible();
    await expect(deleteSelfButton).toBeDisabled();
  });

  test('USERS-006: filters: role, active-only, search', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});
    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);

    const nonce = uniqueNonce('pw-users-filter');
    const username = `pw-filter-${nonce.slice(-6)}`;
    const email = `pw.users.filter.${nonce}@example.com`;
    const password = `pw-${nonce}-Pass123!`;

    let createdUserId: string | null = null;

    try {
      await openCreateUserModal(page);
      const dialog = page.getByRole('dialog', {name: 'Create New User'});
      await dialog.getByLabel(/^Username/i).fill(username);
      await dialog.getByLabel(/^Email/i).fill(email);
      await dialog.getByLabel(/^Password/i).fill(password);
      await dialog.getByLabel(/^Role/i).selectOption('CLIENT');
      await dialog.getByRole('button', {name: 'Create User'}).click();
      await expect(dialog).toHaveCount(0);

      const userRow = page.locator('tbody tr', {hasText: email});
      await expect(userRow).toBeVisible();

      // Search
      const search = page.getByLabel('Search users');
      await search.fill(email.slice(0, 12));
      await expect(userRow).toBeVisible();

      // Role filter
      await page.getByLabel('Filter by role').selectOption('CLIENT');
      await expect(userRow).toBeVisible();
      await expect(page.locator('tbody tr', {hasText: 'admin@cartographic.com'})).toHaveCount(0);

      // Active-only should hide newly created users (no lastLogin), but keep admin.
      await page.getByLabel('Clear all filters').click();
      await page.getByLabel('Show only active users').check();
      await expect(userRow).toHaveCount(0);
      await expect(page.locator('tbody tr', {hasText: 'admin@cartographic.com'})).toBeVisible();

      createdUserId = (await adminApi.getUserByEmail(email)).id;
    } finally {
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
