/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/high/bracket-visualization.spec.ts
 * @desc High-priority bracket visualization and export scenarios.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {test, expect} from '../fixtures/auth.fixture';
import {BracketPage} from '../fixtures/page-objects/bracket.page';
import {TournamentDetailPage} from '../fixtures/page-objects/tournament-detail.page';
import {TEST_TOURNAMENTS} from '../fixtures/test-data';

test.describe('Bracket Visualization - High', () => {
  test('DRAW-007 should render the main draw bracket for public users', async ({publicPage}) => {
    const detailPage = new TournamentDetailPage(publicPage);
    await detailPage.gotoById(TEST_TOURNAMENTS.activeKnockout.id);
    await detailPage.openBracket();

    const bracketPage = new BracketPage(publicPage);
    await bracketPage.expectBracketVisible();
  });

  test('EXP-001 should expose a PDF export entry point from the bracket view', async ({tournamentAdminPage}) => {
    const detailPage = new TournamentDetailPage(tournamentAdminPage);
    await detailPage.gotoById(TEST_TOURNAMENTS.activeKnockout.id);
    await detailPage.openBracket();

    await expect(tournamentAdminPage.getByRole('button', {name: /export pdf/i})).toBeVisible();
  });

  test('RESP-003 should keep the bracket page usable on smaller viewports', async ({page}) => {
    await page.setViewportSize({width: 375, height: 812});
    const detailPage = new TournamentDetailPage(page);
    await detailPage.gotoById(TEST_TOURNAMENTS.activeKnockout.id);
    await detailPage.openBracket();

    await expect(page.locator('.bracket-content')).toBeVisible();
  });
});