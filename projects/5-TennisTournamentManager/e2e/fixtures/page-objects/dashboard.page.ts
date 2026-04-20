/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/fixtures/page-objects/dashboard.page.ts
 * @desc Dashboard and landing-page page object.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {expect, type Page} from '@playwright/test';
import {BasePage} from './base.page';

/** Page object for the `/home` route. */
export class DashboardPage extends BasePage {
  public readonly url = '/home';

  public constructor(page: Page) {
    super(page);
  }

  /**
   * Verifies the logged-out landing page CTA set.
   */
  public async expectGuestLanding(): Promise<void> {
    await expect(this.page.getByText(/browse tournaments/i)).toBeVisible();
    await expect(this.page.getByText(/create account/i)).toBeVisible();
    await expect(this.page.getByText(/sign in/i)).toBeVisible();
  }

  /**
   * Verifies that an authenticated dashboard shell is displayed.
   *
   * @param expectedText - Role-specific text expected on the page
   */
  public async expectAuthenticatedDashboard(expectedText: string): Promise<void> {
    await expect(this.notificationBellButton).toBeVisible();
    await expect(this.page.getByText(expectedText)).toBeVisible();
  }
}