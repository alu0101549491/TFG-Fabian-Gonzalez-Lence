/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file e2e/example.spec.ts
 * @desc Example E2E test — validates that the application loads correctly.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {test, expect} from '@playwright/test';

test.describe('Application Smoke Test', () => {
  test('should load the landing page', async ({page}) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Tennis Tournament Manager/);
  });
});
