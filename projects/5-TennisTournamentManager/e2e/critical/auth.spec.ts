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

  test('AUTH-006 should expire inactive sessions after timeout', async ({page}) => {
    test.fixme(true, 'Implemented in the app, but deterministic E2E coverage needs clock control or a shorter timeout in the test environment.');

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_USERS.participant1.email, TEST_USERS.participant1.password);
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
});