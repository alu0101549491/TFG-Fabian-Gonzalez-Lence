/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/fixtures/page-objects/tournament-detail.page.ts
 * @desc Tournament detail page object covering participant, bracket, and quick-action flows.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {expect, type Locator, type Page} from '@playwright/test';
import {BasePage} from './base.page';

/** Page object for `/tournaments/:id`. */
export class TournamentDetailPage extends BasePage {
  public readonly url = '/tournaments';
  public readonly registerButton: Locator;
  public readonly approveAllButton: Locator;
  public readonly rejectAllButton: Locator;

  public constructor(page: Page) {
    super(page);
    this.registerButton = page.getByRole('button', {name: /register now|complete profile to register/i});
    this.approveAllButton = page.getByRole('button', {name: /approve all/i});
    this.rejectAllButton = page.getByRole('button', {name: /reject all/i});
  }

  /**
   * Opens a specific tournament detail page.
   *
   * @param tournamentId - Tournament identifier
   */
  public async gotoById(tournamentId: string): Promise<void> {
    await this.gotoPath(`/tournaments/${tournamentId}`);
  }

  /**
   * Selects a category radio option by visible name.
   *
   * @param categoryName - Visible category label
   */
  public async chooseCategory(categoryName: string): Promise<void> {
    await this.page.locator('span.radio-label').filter({hasText: categoryName}).first().click();
  }

  /** Attempts to register the current user into the selected category. */
  public async registerNow(): Promise<void> {
    await this.registerButton.click();
  }

  /**
   * Changes tournament status through the status dropdown.
   *
   * @param statusValue - Raw status value expected by the select element
   */
  public async changeStatus(statusValue: string): Promise<void> {
    await this.page.locator('select').first().selectOption(statusValue);
    await this.waitForPageLoad();
  }

  /** Opens the edit flow from the tournament detail hero. */
  public async openEdit(): Promise<void> {
    await this.page.getByRole('button', {name: /edit/i}).click();
    await this.waitForPageLoad();
  }

  /** Opens the bracket page through the quick-action cards. */
  public async openBracket(): Promise<void> {
    await this.page.getByRole('button', {name: /view bracket/i}).click();
    await this.waitForPageLoad();
  }

  /** Opens the matches page through the quick-action cards. */
  public async openMatches(): Promise<void> {
    await this.page.getByRole('button', {name: /view matches/i}).click();
    await this.waitForPageLoad();
  }

  /** Opens the standings page through the quick-action cards. */
  public async openStandings(): Promise<void> {
    await this.page.getByRole('button', {name: /view standings/i}).click();
    await this.waitForPageLoad();
  }

  /** Opens the order-of-play management page through the quick-action cards. */
  public async openOrderOfPlay(): Promise<void> {
    await this.page.getByRole('button', {name: /manage schedule/i}).click();
    await this.waitForPageLoad();
  }

  /** Opens the phase-management page through the quick-action cards. */
  public async openPhaseManagement(): Promise<void> {
    await this.page.getByRole('button', {name: /manage phases/i}).click();
    await this.waitForPageLoad();
  }

  /** Approves all pending registrations via the browser confirm dialog. */
  public async approveAllRegistrations(): Promise<void> {
    await this.acceptNextDialog();
    await this.approveAllButton.click();
  }

  /** Rejects all pending registrations via the browser confirm dialog. */
  public async rejectAllRegistrations(): Promise<void> {
    await this.acceptNextDialog();
    await this.rejectAllButton.click();
  }

  /** Approves the first pending registration visible in the participants table. */
  public async approveFirstPendingRegistration(): Promise<void> {
    await this.acceptNextDialog();
    await this.page.getByRole('button', {name: /approve/i}).first().click();
  }

  /** Rejects the first pending registration visible in the participants table. */
  public async rejectFirstPendingRegistration(): Promise<void> {
    await this.acceptNextDialog();
    await this.page.getByRole('button', {name: /reject/i}).first().click();
  }

  /** Promotes the first alternate registration to the main draw. */
  public async promoteFirstAlternate(): Promise<void> {
    await this.acceptNextDialog();
    await this.page.getByRole('button', {name: /promote/i}).first().click();
  }

  /**
   * Verifies that registration is blocked by an incomplete profile.
   */
  public async expectProfileIncompleteWarning(): Promise<void> {
    await expect(this.page.getByText(/profile incomplete/i)).toBeVisible();
  }
}