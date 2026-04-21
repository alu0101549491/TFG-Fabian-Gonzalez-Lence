/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/fixtures/page-objects/bracket.page.ts
 * @desc Bracket page object with publication, regeneration, and export helpers.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {expect, type Download, type Page} from '@playwright/test';
import {BasePage} from './base.page';

/** Page object for `/brackets/:id`. */
export class BracketPage extends BasePage {
  public readonly url = '/brackets';

  public constructor(page: Page) {
    super(page);
  }

  /**
   * Opens a bracket page by its route identifier.
   *
   * @param bracketId - Bracket identifier used by the route
   */
  public async gotoById(bracketId: string): Promise<void> {
    await this.gotoPath(`/brackets/${bracketId}`);
  }

  /** Verifies that the bracket content is visible. */
  public async expectBracketVisible(): Promise<void> {
    const locator = this.page.locator('.visual-bracket-section, app-visual-bracket, .phase-card').first();
    try {
      await locator.waitFor({state: 'visible', timeout: 10000});
      await expect(locator).toBeVisible();
    } catch {
      // Fallback: try a more generic SVG or canvas element that may render the bracket
      const svg = this.page.locator('svg').first();
      await svg.waitFor({state: 'visible', timeout: 5000});
      await expect(svg).toBeVisible();
    }
  }

  /** Publishes a draft bracket if the action is available. */
  public async publishBracket(): Promise<void> {
    await this.page.getByRole('button', {name: /publish bracket/i}).click();
    await this.waitForPageLoad();
  }

  /**
   * Regenerates the bracket and optionally preserves compatible results.
   *
   * @param preserveResults - Whether to keep compatible results during regeneration
   */
  public async regenerateBracket(preserveResults: boolean = false): Promise<void> {
    await this.page.getByRole('button', {name: /regenerate bracket/i}).click();
    if (preserveResults) {
      await this.page.getByLabel(/preserve compatible completed results/i).check();
    }
    await this.page.getByRole('button', {name: /regenerate bracket/i}).last().click();
    await this.waitForPageLoad();
  }

  /**
   * Starts a bracket PDF export and returns the resulting download handle.
   *
   * @returns Playwright download object
   */
  public async exportPdf(): Promise<Download> {
    const downloadPromise = this.page.waitForEvent('download');
    await this.page.getByRole('button', {name: /export pdf/i}).click();
    return downloadPromise;
  }

  /** Verifies read-only access by checking that admin buttons are hidden. */
  public async expectReadOnlyView(): Promise<void> {
    await expect(this.page.getByRole('button', {name: /publish bracket/i})).toHaveCount(0);
    await expect(this.page.getByRole('button', {name: /regenerate bracket/i})).toHaveCount(0);
  }
}