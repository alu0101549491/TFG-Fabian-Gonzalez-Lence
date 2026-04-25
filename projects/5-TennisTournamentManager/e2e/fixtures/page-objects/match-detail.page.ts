/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/fixtures/page-objects/match-detail.page.ts
 * @desc Match-detail page object with scheduling, score-entry, and status-control helpers.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {expect, type Locator, type Page} from '@playwright/test';
import {BasePage} from './base.page';

/** Set score payload used by score-entry helpers. */
export interface SetScore {
  p1: number;
  p2: number;
}

/** Page object for `/matches/:id`. */
export class MatchDetailPage extends BasePage {
  public readonly url = '/matches';

  public constructor(page: Page) {
    super(page);
  }

  /**
   * Opens a specific match-detail page.
   *
   * @param matchId - Match identifier
   */
  public async gotoById(matchId: string): Promise<void> {
    await this.gotoPath(`/matches/${matchId}`);
  }

  /**
   * Schedules a match with date/time/court/ball provider values.
   *
   * @param values - Schedule payload
   */
  public async scheduleMatch(values: {
    courtLabel?: string;
    date: string;
    time: string;
    ballProvider?: string;
  }): Promise<void> {
    await this.page.getByRole('button', {name: /schedule match/i}).click();
    if (values.courtLabel) {
      const optionValue = await this.page
        .locator('#courtId option')
        .filter({hasText: values.courtLabel})
        .first()
        .getAttribute('value');

      if (optionValue) {
        await this.page.locator('#courtId').selectOption(optionValue);
      }
    }
    await this.page.locator('#scheduledDate').fill(values.date);
    await this.page.locator('#scheduledTime').fill(values.time);
    if (values.ballProvider) {
      await this.page.locator('#ballProvider').fill(values.ballProvider);
    }
    await this.page.getByRole('button', {name: /schedule match/i}).last().click();
    await this.waitForPageLoad();
  }

  /**
   * Records scores from the admin score-entry modal.
   *
   * @param winnerName - Visible label for the winning side
   * @param sets - Set scores to record
   */
  public async recordScores(winnerName: string, sets: SetScore[]): Promise<void> {
    await this.page.getByRole('button', {name: /record scores/i}).click();
    await this.page.locator('.radio-group .radio-label').filter({hasText: winnerName}).first().click();
    await this.fillSetScores(sets);
    await this.page.getByRole('button', {name: /record result/i}).click();
    await this.waitForPageLoad();
  }

  /**
   * Records a result for matches that use the single super-tiebreak format.
   *
   * @param winnerName - Visible label for the winning side
   * @param points - Super-tiebreak points for each participant
   */
  public async recordSuperTiebreak(
    winnerName: string,
    points: {participant1: number; participant2: number},
  ): Promise<void> {
    await this.page.getByRole('button', {name: /record scores/i}).click();
    await this.page.locator('.radio-group .radio-label').filter({hasText: winnerName}).first().click();
    await this.page.locator('input[name="superTbP1"]').fill(String(points.participant1));
    await this.page.locator('input[name="superTbP2"]').fill(String(points.participant2));
    await this.page.getByRole('button', {name: /record result/i}).click();
    await this.waitForPageLoad();
  }

  /**
   * Updates the match status using the status modal.
   *
   * @param statusValue - Raw enum value expected by the status select
   */
  public async updateStatus(statusValue: string): Promise<void> {
    await this.openStatusModal();
    const statusModal = this.getStatusModal();
    await statusModal.locator('select').first().selectOption(statusValue);
    await statusModal.getByRole('button', {name: /update status/i}).click();
    await this.waitForPageLoad();
  }

  /**
   * Opens the update-status modal.
   */
  public async openStatusModal(): Promise<void> {
    await this.page.getByRole('button', {name: /update status/i}).click();
    await expect(this.getStatusModal()).toBeVisible();
  }

  /**
   * Selects a status value in the update-status modal.
   *
   * @param statusValue - Raw enum value expected by the select
   */
  public async selectStatus(statusValue: string): Promise<void> {
    await this.getStatusModal().locator('#status').selectOption(statusValue);
  }

  /**
   * Selects the visible winner label in the update-status modal.
   *
   * @param winnerLabel - Visible participant label
   */
  public async selectStatusWinner(winnerLabel: string): Promise<void> {
    await this.getStatusModal().locator('#winnerId').selectOption({label: winnerLabel});
  }

  /**
   * Submits the update-status modal without assuming it will succeed.
   */
  public async submitStatusModal(): Promise<void> {
    await this.getStatusModal().getByRole('button', {name: /update status/i}).click();
  }

  /**
   * Suspends the current match.
   *
   * @param reason - Suspension reason
   */
  public async suspendMatch(reason: string): Promise<void> {
    await this.page.getByRole('button', {name: /suspend match/i}).click();
    await this.page.locator('#suspensionReason').fill(reason);
    await this.page.getByRole('button', {name: /suspend match/i}).last().click();
    await this.waitForPageLoad();
  }

  /**
   * Resumes the current match, optionally with a new date/time.
   *
   * @param values - Optional scheduling overrides
   */
  public async resumeMatch(values?: {date?: string; time?: string}): Promise<void> {
    await this.page.getByRole('button', {name: /resume match/i}).click();
    if (values?.date) {
      await this.page.locator('#resumeScheduledDate').fill(values.date);
    }
    if (values?.time) {
      await this.page.locator('#resumeScheduledTime').fill(values.time);
    }
    await this.page.getByRole('button', {name: /resume match/i}).last().click();
    await this.waitForPageLoad();
  }

  /**
   * Cancels the current match.
   *
   * @param reason - Cancellation reason
   */
  public async cancelMatch(reason: string): Promise<void> {
    await this.page.getByRole('button', {name: /cancel match/i}).click();
    await this.page.locator('#reason').fill(reason);
    await this.page.getByRole('button', {name: /^cancel match$/i}).last().click();
    await this.waitForPageLoad();
  }

  /**
   * Verifies that the visible match-status badge contains a value.
   *
   * @param expected - Expected badge text
   */
  public async expectStatus(expected: string | RegExp): Promise<void> {
    await expect(this.page.locator('.status-badge').first()).toContainText(expected);
  }

  /**
   * Verifies the visible ball provider value.
   *
   * @param expected - Expected ball provider text
   */
  public async expectBallProvider(expected: string): Promise<void> {
    await expect(this.page.getByText(expected)).toBeVisible();
  }

  /**
   * Returns the active update-status modal locator.
   *
   * @returns Status modal locator
   */
  public getStatusModal(): Locator {
    return this.page.locator('.modal-content').filter({hasText: 'Update Match Status'}).first();
  }

  private async fillSetScores(sets: SetScore[]): Promise<void> {
    const setRows = this.page.locator('.set-row');
    for (let index = 0; index < sets.length; index += 1) {
      if (index > 0 && index >= await setRows.count()) {
        await this.page.getByRole('button', {name: /add set/i}).click();
      }
      const row = this.page.locator('.set-row').nth(index);
      const inputs = row.locator('input[type="number"]');
      await inputs.nth(0).fill(String(sets[index].p1));
      await inputs.nth(1).fill(String(sets[index].p2));
    }
  }
}