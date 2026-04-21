/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/fixtures/page-objects/order-of-play.page.ts
 * @desc Order-of-play page object for schedule generation, court management, and filters.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {expect, type Page} from '@playwright/test';
import {BasePage} from './base.page';

/** Page object for `/order-of-play/:id`. */
export class OrderOfPlayPage extends BasePage {
  public readonly url = '/order-of-play';

  public constructor(page: Page) {
    super(page);
  }

  /**
   * Opens an order-of-play page for a tournament.
   *
   * @param tournamentId - Tournament identifier
   */
  public async gotoForTournament(tournamentId: string): Promise<void> {
    const target = `/order-of-play/${tournamentId}`;
    await this.gotoPath(target);

    // Some browsers or SPA boot sequences may redirect or defer rendering.
    // If the expected heading is not visible, try a tolerant fallback:
    // 1) wait briefly for the page to render; 2) click the header/nav link
    // for Order of Play if available; 3) wait for the URL to match.
    try {
      await this.page.getByText(/scheduling management/i).waitFor({state: 'visible', timeout: 5000});
      return;
    } catch {
      // Try a named nav link (accessible) as a fallback
      try {
        const nav = this.page.getByRole('link', {name: /order of play|order-of-play/i});
        if ((await nav.count()) > 0) {
          await nav.first().click().catch(() => undefined);
          await this.waitForPageLoad();
        } else {
          const alt = this.page.getByText(/order of play/i);
          if ((await alt.count()) > 0) {
            await alt.first().click().catch(() => undefined);
            await this.waitForPageLoad();
          }
        }
      } catch {
        // ignore fallback click failures
      }

      // final attempt: wait for the route to update to the target
      try {
        await this.page.waitForURL(new RegExp(`${target.replace(/[-\\/]/g, '\\$&')}`), {timeout: 10000});
      } catch {
        // leave to caller's assertions to fail with context
      }
    }
  }

  /**
   * Adds a new court using the admin modal.
   *
   * @param name - Court name
   */
  public async addCourt(name: string): Promise<void> {
    await this.page.getByRole('button', {name: /add$/i}).click();
    await this.page.locator('#newCourtName').fill(name);
    await this.page.getByRole('button', {name: /create court|add court|save court/i}).click();
    await this.waitForPageLoad();
  }

  /**
   * Generates a schedule from the currently visible generator inputs.
   */
  public async generateSchedule(): Promise<void> {
    await this.page.getByRole('button', {name: /generate schedule/i}).click();
    await this.waitForPageLoad();
  }

  /** Regenerates an existing schedule. */
  public async regenerateSchedule(): Promise<void> {
    this.page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await this.page.getByRole('button', {name: /regenerate/i}).click();
    await this.waitForPageLoad();
  }

  /**
   * Filters the schedule by date.
   *
   * @param date - ISO date string
   */
  public async filterByDate(date: string): Promise<void> {
    const dateInput = this.page.locator('#admin-date, #date').first();
    await dateInput.fill(date);
    await this.waitForPageLoad();
  }

  /**
   * Filters the schedule by visible court label.
   *
   * @param courtLabel - Court label
   */
  public async filterByCourt(courtLabel: string): Promise<void> {
    await this.page.getByRole('button', {name: new RegExp(courtLabel, 'i')}).click();
    await this.waitForPageLoad();
  }

  /** Verifies that schedule content is visible. */
  public async expectScheduleVisible(): Promise<void> {
    await expect(this.page.locator('.main-content, .schedule-grid, .court-column').first()).toBeVisible();
  }
}