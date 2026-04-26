/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/critical/auth.spec.ts
 * @desc Critical authentication scenarios for the Tennis Tournament Manager.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {test, expect} from '../fixtures/auth.fixture';
import {LoginPage} from '../fixtures/page-objects/login.page';
import {DashboardPage} from '../fixtures/page-objects/dashboard.page';
import {TEST_USERS} from '../fixtures/test-data';
import {ApiHelper} from '../helpers/api.helper';

test.describe('Authentication - Critical', () => {
  test('AUTH-001 should login with valid role credentials', async ({page}) => {
    const cases = [
      TEST_USERS.sysAdmin,
      TEST_USERS.tournamentAdmin1,
      TEST_USERS.participant1,
    ];

    for (const user of cases) {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(user.email, user.password);
      await expect(page).toHaveURL(/\/home$/);
      await expect(page.locator('header.app-header')).toBeVisible();
      await expect(page.locator('.user-menu-toggle')).toBeVisible();

      const dashboardPage = new DashboardPage(page);
      await dashboardPage.logout();
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('AUTH-003 should show validation and authentication errors for invalid login attempts', async ({page}) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.submitButton.click();
    await expect(page.locator('.form-error').first()).toBeVisible();

    await loginPage.emailInput.fill('unknown@tennis-test.com');
    await loginPage.passwordInput.fill('WrongPassword123!');
    await loginPage.submitButton.click();

    await expect(page.locator('.alert-error, .error-container, .error-message').first()).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('AUTH-004 should redirect public users away from protected routes', async ({publicPage}) => {
    const protectedRoutes = ['/profile', '/notifications', '/my-matches', '/admin', '/admin/users'];

    for (const route of protectedRoutes) {
      await publicPage.goto(route);
      await expect(publicPage).toHaveURL(/\/login/);
    }
  });

  test('AUTH-005 should clear authenticated state after logout', async ({participantPage}) => {
    const dashboardPage = new DashboardPage(participantPage);
    await dashboardPage.goto();
    await dashboardPage.logout();

    await expect(participantPage).toHaveURL(/\/login/);
    expect(await participantPage.evaluate(() => localStorage.getItem('tennis_jwt_token'))).toBeNull();
    expect(await participantPage.evaluate(() => localStorage.getItem('app_user'))).toBeNull();

    await participantPage.goBack();
    await participantPage.goto('/profile');
    await expect(participantPage).toHaveURL(/\/login/);
  });

  test('DASH-005 should show the player dashboard overview and quick actions', async ({participantPage}) => {
    const dashboardPage = new DashboardPage(participantPage);
    await dashboardPage.goto();
    await dashboardPage.expectParticipantOverview();

    await participantPage.getByRole('button', {name: /my profile/i}).click();
    await expect(participantPage).toHaveURL(/\/profile$/);

    await participantPage.goto('/home');
    await participantPage.getByRole('button', {name: /my statistics/i}).click();
    await expect(participantPage).toHaveURL(/\/statistics$/);
  });

  test('FDBK-NAV-003 should render live role-aware dashboard counters for admin roles', async ({sysAdminPage, tournamentAdminPage}) => {
    await sysAdminPage.goto('/home');
    await expect(sysAdminPage.getByText(/^Disputed$/)).toBeVisible();
    await expect(sysAdminPage.getByText(/^Active$/)).toBeVisible();
    await expect(sysAdminPage.getByText(/^Total$/)).toBeVisible();
    await expect(sysAdminPage.getByText(/^Managed$/)).toBeVisible();
    await expect(sysAdminPage.locator('.stats-grid .stat-card')).toHaveCount(4);
    await expect(sysAdminPage.locator('.stats-grid .stat-card .stat-value').nth(2)).toHaveText(/\d+/);

    await tournamentAdminPage.goto('/home');
    await expect(tournamentAdminPage.getByText(/^Disputed$/)).toBeVisible();
    await expect(tournamentAdminPage.getByText(/^Active$/)).toBeVisible();
    await expect(tournamentAdminPage.getByText(/^Managed$/)).toBeVisible();
    await expect(tournamentAdminPage.getByText(/^Total$/)).toHaveCount(0);
    await expect(tournamentAdminPage.locator('.stats-grid .stat-card')).toHaveCount(3);
    await expect(tournamentAdminPage.locator('.stats-grid .stat-card .stat-value').nth(2)).toHaveText(/\d+/);
  });

  test('AUTH-006 should expire inactive sessions after timeout', async ({page}) => {
    await page.addInitScript(() => {
      const realSetInterval = window.setInterval.bind(window);
      window.setInterval = ((handler: TimerHandler, timeout?: number, ...args: any[]) => {
        const adjustedTimeout = timeout === 60_000 ? 25 : timeout;
        return realSetInterval(handler, adjustedTimeout, ...args);
      }) as typeof window.setInterval;
    });

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_USERS.participant1.email, TEST_USERS.participant1.password);

    await expect(page).toHaveURL(/\/home$/);

    await page.evaluate(() => {
      localStorage.setItem('ttm_last_activity', String(Date.now() - (31 * 60 * 1000)));
    });

    await expect(page).toHaveURL(/\/login(?:\?.*reason=session_expired)?$/, {timeout: 5_000});
  });

  test('AUTH-007 should expose password recovery flow', async ({page}) => {
    test.skip(true, 'Password recovery route and UI are not implemented in the current frontend.');

    const loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('AUTH-008 should temporarily lock the account after repeated failed logins', async ({page}) => {
    test.skip(true, 'Lockout feedback and lockout UI are not implemented in the current frontend.');

    const loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('AUTH-009 should refresh expiring JWT sessions', async ({page}) => {
    test.skip(true, 'Refresh-token flow is not implemented in the current frontend.');

    const loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('AUTH-002 should register a new account with GDPR consent and redirect to home', async ({page}) => {
    const apiHelper = await ApiHelper.create();
    const suffix = Date.now();
    const newUser = {
      email: `e2e-reg-${suffix}@tennis-test.com`,
      username: `e2ereg${suffix}`,
      firstName: 'E2E',
      lastName: 'Registrant',
      password: 'E2EPassword123!',
    };

    try {
      await page.goto('/register');
      await expect(page.getByRole('heading', {name: /create account|register/i})).toBeVisible();

      await page.locator('#firstName').fill(newUser.firstName);
      await page.locator('#lastName').fill(newUser.lastName);
      await page.locator('#username').fill(newUser.username);
      await page.locator('#email').fill(newUser.email);
      await page.locator('#phone').fill('+34600000001');
      await page.locator('#password').fill(newUser.password);
      await page.locator('#confirmPassword').fill(newUser.password);
      await page.locator('#gdprConsent').check();

      await page.getByRole('button', {name: /create account|register|sign up/i}).click();

      await expect(page).toHaveURL(/\/home$/, {timeout: 10_000});
      await expect(page.locator('header.app-header')).toBeVisible();
    } finally {
      const adminSession = await apiHelper.login(TEST_USERS.sysAdmin).catch(() => null);
      if (adminSession) {
        const users = await apiHelper.get<Array<{id: string; email: string}>>('/users', adminSession.token).catch(() => []);
        const created = users.find((user) => user.email === newUser.email);
        if (created) {
          await apiHelper.delete(`/users/${created.id}`, adminSession.token, true).catch(() => null);
        }
      }
      await apiHelper.dispose();
    }
  });

  test('DASH-001 should render guest landing page CTAs and navigate correctly', async ({publicPage}) => {
    const dashboardPage = new DashboardPage(publicPage);
    await dashboardPage.goto();
    await dashboardPage.expectGuestLanding();

    await publicPage.getByText(/browse tournaments/i).first().click();
    await expect(publicPage).toHaveURL(/\/tournaments$/);

    await publicPage.goto('/home');
    await publicPage.getByText(/create account/i).first().click();
    await expect(publicPage).toHaveURL(/\/register$/);

    await publicPage.goto('/home');
    await publicPage.getByText(/sign in/i).first().click();
    await expect(publicPage).toHaveURL(/\/login$/);
  });

  test('DASH-002 should render authenticated dashboard with role-specific content', async ({participantPage, tournamentAdminPage, sysAdminPage}) => {
    const participantDash = new DashboardPage(participantPage);
    await participantDash.goto();
    await participantDash.expectParticipantOverview();

    await tournamentAdminPage.goto('/home');
    await expect(tournamentAdminPage.getByText(/^Managed$/)).toBeVisible();
    await expect(tournamentAdminPage.getByText(/^Active$/)).toBeVisible();
    await expect(tournamentAdminPage.locator('.stats-grid .stat-card')).toHaveCount(3);

    await sysAdminPage.goto('/home');
    await expect(sysAdminPage.getByText(/^Total$/)).toBeVisible();
    await expect(sysAdminPage.locator('.stats-grid .stat-card')).toHaveCount(4);
  });

  test('DASH-003 should show notification bell and user menu navigation links', async ({participantPage}) => {
    const dashboardPage = new DashboardPage(participantPage);
    await dashboardPage.goto();

    await expect(dashboardPage.notificationBellButton).toBeVisible();
    await dashboardPage.notificationBellButton.click();
    await expect(participantPage.locator('.notification-dropdown')).toBeVisible();
    // Click the overlay backdrop to dismiss the notification dropdown
    await participantPage.locator('app-notification-bell .dropdown-overlay').click();
    await expect(participantPage.locator('.notification-dropdown')).not.toBeVisible();

    await dashboardPage.userMenuTrigger.click();
    await expect(participantPage.locator('.user-dropdown, .dropdown-menu').first()).toBeVisible();

    await participantPage.goto('/my-registrations');
    await expect(participantPage.getByRole('heading', {name: /my registrations/i})).toBeVisible();

    await participantPage.goto('/my-invitations');
    await expect(participantPage.getByRole('heading', {name: /partner invitations/i})).toBeVisible();
  });
});