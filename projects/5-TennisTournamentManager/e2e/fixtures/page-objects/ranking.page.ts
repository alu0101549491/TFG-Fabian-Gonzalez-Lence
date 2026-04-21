/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/fixtures/page-objects/ranking.page.ts
 * @desc Global ranking page object.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {expect, type Page} from '@playwright/test';
import {BasePage} from './base.page';

/** Page object for `/rankings`. */
export class RankingPage extends BasePage {
  public readonly url = '/rankings';

  public constructor(page: Page) {
    super(page);
  }

  /**
   * Changes the ranking system selector.
   *
   * @param systemValue - Ranking system value
   */
  public async switchSystem(systemValue: string): Promise<void> {
    await this.page.locator('.system-selector select').selectOption(systemValue);
    await this.waitForPageLoad();
  }

  /**
   * Verifies that a participant appears at a given ranking row.
   *
   * @param participantName - Participant display name
   * @param position - One-based table position
   */
  public async expectPlayerAtPosition(participantName: string, position: number): Promise<void> {
    const row = this.page.locator('.rankings-table tbody tr').nth(position - 1);
    await expect(row).toContainText(participantName);
  }

  /** Verifies whether the ELO column is present. */
  public async expectEloColumnVisible(): Promise<void> {
    // Wait for the rankings table to render then assert the ELO header exists.
    try {
      await this.page.locator('.rankings-table').first().waitFor({ state: 'visible', timeout: 8000 });
    } catch {
      // proceed to allow a clearer assertion failure below
    }

    const header = this.page.locator('th', { hasText: /elo rating/i }).first();
    await header.waitFor({ state: 'visible', timeout: 8000 });
    await expect(header).toBeVisible();
  }
}