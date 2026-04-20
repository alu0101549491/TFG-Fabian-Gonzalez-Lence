/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/fixtures/page-objects/tournament-list.page.ts
 * @desc Tournament list page object with filters and navigation helpers.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {expect, type Locator, type Page} from '@playwright/test';
import {BasePage} from './base.page';

/** Page object for `/tournaments`. */
export class TournamentListPage extends BasePage {
  public readonly url = '/tournaments';
  public readonly searchInput: Locator;
  public readonly statusSelect: Locator;
  public readonly surfaceSelect: Locator;
  public readonly locationInput: Locator;

  public constructor(page: Page) {
    super(page);
    this.searchInput = page.locator('#search');
    this.statusSelect = page.locator('#status');
    this.surfaceSelect = page.locator('#surface');
    this.locationInput = page.locator('#location');
  }

  /**
   * Applies one or more list filters.
   *
   * @param filters - Filter values to set before applying
   */
  public async applyFilters(filters: {
    search?: string;
    status?: string;
    surface?: string;
    location?: string;
  }): Promise<void> {
    if (filters.search !== undefined) {
      await this.searchInput.fill(filters.search);
    }
    if (filters.status !== undefined) {
      await this.statusSelect.selectOption(filters.status);
    }
    if (filters.surface !== undefined) {
      await this.surfaceSelect.selectOption(filters.surface);
    }
    if (filters.location !== undefined) {
      await this.locationInput.fill(filters.location);
    }
    await this.page.getByRole('button', {name: /apply filters/i}).click();
    await this.waitForPageLoad();
  }

  /** Clears all tournament-list filters. */
  public async clearFilters(): Promise<void> {
    await this.page.getByRole('button', {name: /clear filters/i}).click();
    await this.waitForPageLoad();
  }

  /**
   * Opens a tournament card by its visible title.
   *
   * @param name - Tournament title
   */
  public async openTournament(name: string): Promise<void> {
    await this.page.locator('.tournament-card').filter({hasText: name}).first().click();
    await this.waitForPageLoad();
  }

  /**
   * Checks that a tournament card is present.
   *
   * @param name - Tournament title
   */
  public async expectTournamentVisible(name: string): Promise<void> {
    await expect(this.page.locator('.tournament-card').filter({hasText: name}).first()).toBeVisible();
  }
}