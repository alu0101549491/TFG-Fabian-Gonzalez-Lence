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
    await this.gotoPath(`/order-of-play/${tournamentId}`);
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