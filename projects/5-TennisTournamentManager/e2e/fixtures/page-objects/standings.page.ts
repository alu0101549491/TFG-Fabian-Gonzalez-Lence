/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/fixtures/page-objects/standings.page.ts
 * @desc Standings page object for grouped standings assertions.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {expect, type Page} from '@playwright/test';
import {BasePage} from './base.page';

/** Parsed standings row used by tests. */
export interface StandingsRow {
  participantName: string;
  points: number;
  position: number;
}

/** Page object for `/standings/:id`. */
export class StandingsPage extends BasePage {
  public readonly url = '/standings';

  public constructor(page: Page) {
    super(page);
  }

  /**
   * Opens the standings view for a tournament.
   *
   * @param tournamentId - Tournament identifier
   */
  public async gotoForTournament(tournamentId: string): Promise<void> {
    await this.gotoPath(`/standings/${tournamentId}`);
  }

  /**
   * Reads all visible standings rows.
   *
   * @returns Parsed table rows
   */
  public async getRows(): Promise<StandingsRow[]> {
    const rows = this.page.locator('.standing-row');
    const count = await rows.count();
    const values: StandingsRow[] = [];

    for (let index = 0; index < count; index += 1) {
      const row = rows.nth(index);
      const cells = row.locator('td');
      const participantName = (await cells.nth(1).innerText()).trim();
      const points = Number.parseInt((await cells.nth(7).innerText()).trim(), 10);
      values.push({
        participantName,
        points,
        position: index + 1,
      });
    }

    return values;
  }

  /**
   * Asserts that a participant is rendered at a given position.
   *
   * @param participantName - Visible participant name
   * @param position - Expected position
   */
  public async expectPlayerAtPosition(participantName: string, position: number): Promise<void> {
    const row = this.page.locator('.standing-row').nth(position - 1);
    await expect(row).toContainText(participantName);
  }
}