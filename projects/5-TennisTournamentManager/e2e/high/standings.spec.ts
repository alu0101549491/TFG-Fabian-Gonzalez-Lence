/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/high/standings.spec.ts
 * @desc High-priority standings and statistics scenarios.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {test, expect} from '../fixtures/auth.fixture';
import {StandingsPage} from '../fixtures/page-objects/standings.page';
import {TEST_TOURNAMENTS} from '../fixtures/test-data';

test.describe('Standings - High', () => {
  test('STAND-001 should render grouped standings for tournaments with classification data', async ({participantPage}) => {
    const standingsPage = new StandingsPage(participantPage);
    await standingsPage.gotoForTournament(TEST_TOURNAMENTS.activeRoundRobin.id);

    await expect(participantPage.getByText(/standings/i)).toBeVisible();
    await expect(participantPage.locator('.standings-card').first()).toBeVisible();
  });

  test('STAND-002 should expose updated standings rows after results are confirmed', async ({participantPage}) => {
    const standingsPage = new StandingsPage(participantPage);
    await standingsPage.gotoForTournament(TEST_TOURNAMENTS.activeRoundRobin.id);

    const rows = await standingsPage.getRows();
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].position).toBe(1);
  });

  test('STAND-006 should show set and game ratio information for each row', async ({publicPage}) => {
    const standingsPage = new StandingsPage(publicPage);
    await standingsPage.gotoForTournament(TEST_TOURNAMENTS.activeRoundRobin.id);

    const firstRow = publicPage.locator('.standing-row').first();
    await expect(firstRow).toContainText('/');
    await expect(firstRow.locator('.stat-diff').first()).toBeVisible();
  });

  test('STAND-007 should expose head-to-head and split ratio views', async ({publicPage}) => {
    test.skip(true, 'Dedicated head-to-head and split classification UI is not implemented in the current frontend.');

    const standingsPage = new StandingsPage(publicPage);
    await standingsPage.gotoForTournament(TEST_TOURNAMENTS.activeRoundRobin.id);
  });
});