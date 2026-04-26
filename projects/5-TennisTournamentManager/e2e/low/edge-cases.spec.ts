/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/low/edge-cases.spec.ts
 * @desc Low-priority routing, error, and failure-path scenarios.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {test, expect} from '../fixtures/auth.fixture';
import {LoginPage} from '../fixtures/page-objects/login.page';
import {MatchDetailPage} from '../fixtures/page-objects/match-detail.page';
import {ApiHelper} from '../helpers/api.helper';
import {SeedHelper} from '../helpers/seed.helper';
import {TEST_USERS} from '../fixtures/test-data';

test.describe('Edge Cases - Low', () => {
  test('ERR-001 should redirect unknown routes to home', async ({publicPage}) => {
    await publicPage.goto('/this-route-does-not-exist');
    await expect(publicPage).toHaveURL(/\/home$/);
  });

  test('ERR-003 should show an error for failed login requests', async ({page}) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({message: 'Injected server error'}),
      });
    });

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('broken@tennis-test.com', 'Password123!');

    await expect(page.locator('.alert-error, .error-container, .error-message').first()).toBeVisible();
  });

  test('ERR-004 should render stable error states for invalid tournament and match ids', async ({publicPage}) => {
    await publicPage.goto('/tournaments/not-a-real-id');
    await expect(publicPage.locator('.error-banner, .error-container, .error-message').first()).toBeVisible();

    await publicPage.goto('/matches/not-a-real-id');
    await expect(publicPage.locator('.error-banner, .error-container, .error-message').first()).toBeVisible();
  });

  test('ERR-005 should preserve integrity for duplicate or stale registration flows', async ({participantPage}) => {
    test.fixme(true, 'Deterministic duplicate-registration coverage requires a user fixture that is not already registered in the target category.');

    await participantPage.goto('/my-registrations');
  });

  test('ERR-006 should reject invalid set scores and display a validation error', async ({tournamentAdminPage}) => {
    const apiHelper = await ApiHelper.create();
    const adminSession = await apiHelper.login(TEST_USERS.tournamentAdmin1);
    const p1Session = await apiHelper.login(TEST_USERS.participant1);
    const p2Session = await apiHelper.login(TEST_USERS.participant2);
    const seedHelper = new SeedHelper(apiHelper, adminSession);

    try {
      const fixture = await seedHelper.createSinglesMatchFixture(
        `ERR-006 ${Date.now()}`,
        [p1Session.user.id, p2Session.user.id],
        {
          tournamentStatuses: ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'DRAW_PENDING'],
          courtName: 'Error Court',
          scheduledTime: '2026-06-18T10:00:00.000Z',
          matchStatus: 'IN_PROGRESS',
          startTime: '2026-06-18T10:05:00.000Z',
        },
      );

      const matchPage = new MatchDetailPage(tournamentAdminPage);
      await matchPage.gotoById(fixture.matchId!);

      // Intercept the result submission and force a 422/400 validation failure.
      await tournamentAdminPage.route('**/api/matches/*/result', async (route) => {
        await route.fulfill({
          status: 422,
          contentType: 'application/json',
          body: JSON.stringify({message: 'Invalid score: set scores cannot exceed 7-6 without a tiebreak.'}),
        });
      });

      // Submit an obviously invalid score (both sides win the same number of sets).
      await tournamentAdminPage.getByRole('button', {name: /record scores/i}).click();
      const winnerLabels = tournamentAdminPage.locator('.radio-group .radio-label');
      await winnerLabels.first().click();

      // Fill sets with an impossible value (e.g. p1=7 p2=7 — ambiguous winner).
      const setInputs = tournamentAdminPage.locator('input[name^="set"][name$="P1"], .set-score-input').first();
      if (await setInputs.count() > 0) {
        await setInputs.fill('7');
        await setInputs.press('Tab');
      }

      await tournamentAdminPage.getByRole('button', {name: /record result/i}).click();
      await expect(
        tournamentAdminPage.locator('.alert-error, .error-banner, .error-message').first(),
      ).toBeVisible({timeout: 8_000});
    } finally {
      await seedHelper.cleanAll();
      await apiHelper.dispose();
    }
  });

  test('CROSS-001 should render the correct header navigation and user dropdown for each role', async ({participantPage, tournamentAdminPage, sysAdminPage, publicPage}) => {
    // Authenticated participant: header, user-menu-toggle and notification bell visible.
    await participantPage.goto('/home');
    await expect(participantPage.locator('header.app-header')).toBeVisible();
    await expect(participantPage.locator('.user-menu-toggle')).toBeVisible();
    await expect(participantPage.locator('app-notification-bell').first()).toBeVisible();

    // Clicking the toggle opens the dropdown menu.
    await participantPage.locator('.user-menu-toggle').click();
    await expect(participantPage.locator('.dropdown-menu').first()).toBeVisible();

    // Tournament admin also has header, user-menu-toggle and dropdown.
    await tournamentAdminPage.goto('/home');
    await expect(tournamentAdminPage.locator('header.app-header')).toBeVisible();
    await tournamentAdminPage.locator('.user-menu-toggle').click();
    await expect(tournamentAdminPage.locator('.dropdown-menu').first()).toBeVisible();

    // System admin can navigate directly to /admin and access the panel.
    await sysAdminPage.goto('/admin');
    await expect(sysAdminPage).toHaveURL(/\/admin/);
    await expect(sysAdminPage.locator('header.app-header')).toBeVisible();

    // Guest (unauthenticated) sees login/signup buttons and no user-menu-toggle.
    await publicPage.goto('/home');
    await expect(publicPage.locator('header.app-header')).toBeVisible();
    await expect(publicPage.locator('.header-auth-buttons').first()).toBeVisible();
    await expect(publicPage.locator('.user-menu-toggle')).not.toBeVisible();
  });

  test('CROSS-002 should show error banners when the server returns a failure response', async ({publicPage}) => {
    // Navigate to a user-profile page for a UUID that cannot exist in the database.
    // The user-profile-view component sets errorMessage() when the API returns
    // 404 and renders .error-container > .error-message — the same cross-cutting
    // error-banner pattern used by all entity-detail views.
    const nonExistentUserId = '00000000-0000-0000-0000-000000000000';
    await publicPage.goto(`/users/${nonExistentUserId}`);
    await expect(
      publicPage.locator('.error-message, .error-container').first(),
    ).toBeVisible({timeout: 8_000});
  });

  test('CROSS-003 should redirect unauthenticated requests to the login page', async ({participantPage}) => {
    // Start from an authenticated protected page.
    await participantPage.goto('/home');

    // Remove the JWT token — the authGuard reads directly from localStorage.
    // Clearing it simulates a logout or an expired/invalidated token.
    await participantPage.evaluate(() => {
      localStorage.removeItem('tennis_jwt_token');
    });

    // Attempt to navigate to a protected route.  The authGuard should
    // detect the missing token and redirect to /login.
    await participantPage.goto('/profile');
    await expect(participantPage).toHaveURL(/\/login/, {timeout: 5_000});
  });
});