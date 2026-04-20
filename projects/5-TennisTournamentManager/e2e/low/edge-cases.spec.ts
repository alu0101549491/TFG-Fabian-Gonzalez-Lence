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
});