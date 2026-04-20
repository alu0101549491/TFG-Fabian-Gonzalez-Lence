/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/medium/ranking.spec.ts
 * @desc Medium-priority global ranking scenarios.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {test, expect} from '../fixtures/auth.fixture';
import {RankingPage} from '../fixtures/page-objects/ranking.page';

test.describe('Ranking - Medium', () => {
  test('RANK-001 should show the global ranking table', async ({publicPage}) => {
    const rankingPage = new RankingPage(publicPage);
    await rankingPage.goto();

    await expect(publicPage.locator('.rankings-table')).toBeVisible();
  });

  test('RANK-002 should switch between points-based and ELO modes', async ({publicPage}) => {
    const rankingPage = new RankingPage(publicPage);
    await rankingPage.goto();
    await rankingPage.switchSystem('ELO');

    await rankingPage.expectEloColumnVisible();
  });

  test('RANK-004 should import external rankings for seeding', async ({sysAdminPage}) => {
    test.skip(true, 'External ranking import UI is not implemented in the current frontend.');

    const rankingPage = new RankingPage(sysAdminPage);
    await rankingPage.goto();
  });
});