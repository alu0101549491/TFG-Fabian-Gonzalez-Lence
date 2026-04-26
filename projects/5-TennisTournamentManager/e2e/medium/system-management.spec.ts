/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 22, 2026
 * @file e2e/medium/system-management.spec.ts
 * @desc Medium-priority system-management scenarios for admin filtering flows.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {test, expect} from '../fixtures/auth.fixture';
import {UserManagementPage} from '../fixtures/page-objects/admin/user-management.page';
import {ApiHelper} from '../helpers/api.helper';
import {SeedHelper} from '../helpers/seed.helper';
import {TEST_USERS} from '../fixtures/test-data';

test.describe('System Management - Medium', () => {
  test('SYS-005 should filter users with search, role, and empty-state handling', async ({sysAdminPage}) => {
    const userStatsRoutePattern = /\/api\/users\/stats(?:\?.*)?$/;
    const userListRoutePattern = /\/api\/users(?:\?.*)?$/;

    const users = [
      {
        id: 'usr_admin',
        username: 'system_admin',
        email: 'admin@tennistournament.com',
        firstName: 'System',
        lastName: 'Admin',
        idDocument: '00000000A',
        ranking: null,
        role: 'SYSTEM_ADMIN',
        isActive: true,
        lastLogin: '2026-04-22T10:00:00.000Z',
      },
      {
        id: 'usr_player_1',
        username: 'player_one',
        email: 'player@example.com',
        firstName: 'Player',
        lastName: 'One',
        idDocument: '11111111A',
        ranking: 150,
        role: 'PLAYER',
        isActive: true,
        lastLogin: '2026-04-22T09:45:00.000Z',
      },
      {
        id: 'usr_player_2',
        username: 'maria_lopez',
        email: 'maria@example.com',
        firstName: 'Maria',
        lastName: 'Lopez',
        idDocument: '22222222B',
        ranking: 200,
        role: 'PLAYER',
        isActive: true,
        lastLogin: '2026-04-21T16:30:00.000Z',
      },
      {
        id: 'usr_tournament_admin',
        username: 'tournament_admin',
        email: 'tournament@tennistournament.com',
        firstName: 'Tournament',
        lastName: 'Admin',
        idDocument: '33333333C',
        ranking: null,
        role: 'TOURNAMENT_ADMIN',
        isActive: false,
        lastLogin: null,
      },
    ];

    await sysAdminPage.route(userStatsRoutePattern, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalUsers: users.length,
          activeUsers: users.filter((user) => user.isActive).length,
          systemAdmins: users.filter((user) => user.role === 'SYSTEM_ADMIN').length,
          tournamentAdmins: users.filter((user) => user.role === 'TOURNAMENT_ADMIN').length,
          players: users.filter((user) => user.role === 'PLAYER').length,
        }),
      });
    });

    await sysAdminPage.route(userListRoutePattern, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(users),
      });
    });

    const userManagementPage = new UserManagementPage(sysAdminPage);
    await userManagementPage.goto();

    await userManagementPage.search('player@example.com');
    await userManagementPage.expectUserVisible('player@example.com');

    await userManagementPage.search('');
    await userManagementPage.filterByRole('PLAYER');
    await userManagementPage.search('maria@example.com');
    await userManagementPage.expectUserVisible('maria@example.com');

    await userManagementPage.toggleActiveOnly();
    await userManagementPage.expectUserVisible('maria@example.com');

    await userManagementPage.search('');
    await sysAdminPage.getByLabel(/filter by role/i).selectOption('');
    await sysAdminPage.getByLabel(/show only active users/i).uncheck();
    await userManagementPage.search(`missing-${Date.now()}`);
    await userManagementPage.expectEmptyState();
  });

  test('SYS-001 should grant system admins access to the admin dashboard with role-specific counters', async ({sysAdminPage, participantPage}) => {
    // Sys admin can reach /admin.
    await sysAdminPage.goto('/admin');
    await expect(sysAdminPage.getByRole('heading', {name: /admin/i}).first()).toBeVisible();

    // Dashboard shows system-admin tool section and key stat cards.
    await expect(sysAdminPage.getByText(/Total Tournaments/i)).toBeVisible();
    await expect(sysAdminPage.getByText(/Active Tournaments/i)).toBeVisible();
    await expect(sysAdminPage.getByText(/System Admin Tools/i)).toBeVisible();
    await expect(sysAdminPage.getByRole('button', {name: /Manage Users/i})).toBeVisible();

    // The counter values must be numeric (0 or more).
    const totalText = await sysAdminPage.locator('p').filter({hasText: 'Total Tournaments'}).locator('..').locator('h3').innerText();
    expect(Number(totalText)).toBeGreaterThanOrEqual(0);

    // Participants cannot access /admin — they get redirected.
    await participantPage.goto('/admin');
    await expect(participantPage).toHaveURL(/\/home|\/tournaments|\/login/);
  });

  test('SYS-002 should let system admins create a new user and assign a role', async ({sysAdminPage}) => {
    const apiHelper = await ApiHelper.create();
    const adminSession = await apiHelper.login(TEST_USERS.sysAdmin);
    const suffix = Date.now();
    const newUserEmail = `sys002-${suffix}@tennis-test.com`;

    try {
      const userManagementPage = new UserManagementPage(sysAdminPage);
      await userManagementPage.goto();

      await userManagementPage.createUser({
        username: `sys002user${suffix}`,
        email: newUserEmail,
        firstName: 'Sys',
        lastName: 'UserTwo',
        role: 'PLAYER',
        password: 'SysPass123!',
      });

      // Success: new user row appears in the table.
      await userManagementPage.search(newUserEmail);
      await userManagementPage.expectUserVisible(newUserEmail);

      // Edit: change role to TOURNAMENT_ADMIN.
      await userManagementPage.editFirstVisibleUser();
      const roleSelect = sysAdminPage.locator('select[name="role"], #role').first();
      if (await roleSelect.count() > 0) {
        await roleSelect.selectOption('TOURNAMENT_ADMIN');
        await sysAdminPage.getByRole('button', {name: /save|update/i}).click();
        await expect(sysAdminPage.locator('.alert-success, .success-banner').first()).toBeVisible({timeout: 8_000});
      }
    } finally {
      // Cleanup: delete the created user via API.
      const users = await apiHelper.get<Array<{id: string; email: string}>>('/users', adminSession.token).catch(() => []);
      const created = users.find((user) => user.email === newUserEmail);
      if (created) {
        await apiHelper.delete(`/users/${created.id}`, adminSession.token, true).catch(() => null);
      }
      await apiHelper.dispose();
    }
  });
});