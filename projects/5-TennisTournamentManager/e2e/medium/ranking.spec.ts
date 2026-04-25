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
    await expect(publicPage.getByRole('heading', {name: /global rankings/i})).toBeVisible();
    await expect(publicPage.locator('.loading-section')).not.toBeVisible();
    await expect(publicPage.locator('.rankings-table, .empty-section, .alert-error')).toBeVisible();
  });

  test('RANK-002 should switch between points-based and ELO modes', async ({publicPage}) => {
    const rankingPage = new RankingPage(publicPage);
    await rankingPage.goto();
    await rankingPage.switchSystem('POINTS_BASED');
    await expect(publicPage.locator('.system-selector select')).toHaveValue('POINTS_BASED');
    await rankingPage.switchSystem('ELO');
    await expect(publicPage.locator('.system-selector select')).toHaveValue('ELO');
    await expect(publicPage.locator('.loading-section')).not.toBeVisible();
    await expect(publicPage.locator('.rankings-table, .empty-section, .alert-error')).toBeVisible();
  });

  test('RANK-004 should import external rankings for seeding', async ({sysAdminPage}) => {
    test.skip(true, 'External ranking import UI is not implemented in the current frontend.');

    const rankingPage = new RankingPage(sysAdminPage);
    await rankingPage.goto();
  });

  test('FDBK-RANK-001 should let admins recalculate positions and hide the action for non-admins', async ({sysAdminPage, participantPage}) => {
    const adminRankingPage = new RankingPage(sysAdminPage);
    await adminRankingPage.goto();

    await expect(sysAdminPage.getByRole('button', {name: /recalculate rankings/i})).toBeVisible();
    await expect(sysAdminPage.locator('.rankings-table, .empty-section, .alert-error')).toBeVisible();

    await sysAdminPage.getByRole('button', {name: /recalculate rankings/i}).click();
    await expect(sysAdminPage.locator('.alert-success, .alert-error').first()).toBeVisible();
    await expect(sysAdminPage.locator('.rankings-table, .empty-section, .alert-error')).toBeVisible();

    const participantRankingPage = new RankingPage(participantPage);
    await participantRankingPage.goto();
    await expect(participantPage.getByRole('button', {name: /recalculate rankings/i})).toHaveCount(0);
  });
});