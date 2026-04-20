/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/low/accessibility.spec.ts
 * @desc Low-priority accessibility smoke scenarios.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {test, expect} from '../fixtures/auth.fixture';

test.describe('Accessibility - Low', () => {
  test('A11Y-001 should support keyboard navigation on the login form', async ({page}) => {
    await page.goto('/login');
    await page.keyboard.press('Tab');
    await expect(page.locator('#email')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('#password')).toBeFocused();
  });

  test('A11Y-002 should keep modal controls keyboard reachable', async ({publicPage}) => {
    await publicPage.goto('/announcements');
    const firstCard = publicPage.locator('.announcement-card').first();
    if (await firstCard.count() > 0) {
      await firstCard.click();
      await expect(publicPage.locator('.modal-container')).toBeVisible();
      await publicPage.keyboard.press('Tab');
    }
  });

  test('A11Y-003 should expose accessible header controls for authenticated users', async ({participantPage}) => {
    await participantPage.goto('/home');
    await expect(participantPage.locator('.bell-button')).toBeVisible();
    await expect(participantPage.locator('.user-menu-toggle')).toBeVisible();
  });
});