/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/helpers/wait.helper.ts
 * @desc Reusable waiting helpers for asynchronous E2E interactions.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {expect, type Locator, type Page} from '@playwright/test';

/**
 * Common waiting primitives shared by page objects and tests.
 */
export class WaitHelper {
  /**
   * Waits for at least one of the provided locators to become visible.
   *
   * @param locators - Candidate locators
   * @param timeout - Timeout in milliseconds
   */
  public static async waitForAnyVisible(
    locators: Locator[],
    timeout: number = 10000,
  ): Promise<void> {
    await expect(async () => {
      for (const locator of locators) {
        if (await locator.isVisible()) {
          return;
        }
      }
      throw new Error('No locator became visible');
    }).toPass({timeout});
  }

  /**
   * Waits for network idleness after a UI action that causes background requests.
   *
   * @param page - Active Playwright page
   */
  public static async waitForNetworkIdle(page: Page): Promise<void> {
    await page.waitForLoadState('networkidle');
  }

  /**
   * Polls an assertion until it passes or times out.
   *
   * @param assertion - Assertion callback
   * @param timeout - Timeout in milliseconds
   */
  public static async expectEventually(
    assertion: () => Promise<void>,
    timeout: number = 10000,
  ): Promise<void> {
    await expect(assertion).toPass({timeout});
  }
}