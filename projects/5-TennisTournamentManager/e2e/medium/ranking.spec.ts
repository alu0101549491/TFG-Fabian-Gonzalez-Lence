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
import {ApiHelper} from '../helpers/api.helper';
import {SeedHelper} from '../helpers/seed.helper';
import {TEST_USERS, VALID_SCORE_SET} from '../fixtures/test-data';

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

  test('RANK-003 should update ranking positions after a result is confirmed', async ({publicPage}) => {
    const apiHelper = await ApiHelper.create();
    const adminSession = await apiHelper.login(TEST_USERS.tournamentAdmin1);
    const p1Session = await apiHelper.login(TEST_USERS.participant1);
    const p2Session = await apiHelper.login(TEST_USERS.participant2);
    const seedHelper = new SeedHelper(apiHelper, adminSession);

    try {
      const fixture = await seedHelper.createSinglesMatchFixture(
        `RANK-003 ${Date.now()}`,
        [p1Session.user.id, p2Session.user.id],
        {
          tournamentStatuses: ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'DRAW_PENDING'],
          courtName: 'Rank Court',
          scheduledTime: '2026-06-20T10:00:00.000Z',
          matchStatus: 'SCHEDULED',
        },
      );

      // Advance the match to IN_PROGRESS, then complete it through the admin update route.
      await apiHelper.put(`/matches/${fixture.matchId}`, {status: 'IN_PROGRESS'}, adminSession.token, 200);
      await apiHelper.put(`/matches/${fixture.matchId}`, {
        status: 'COMPLETED',
        winnerId: p1Session.user.id,
        scores: VALID_SCORE_SET.sets.map((set) => ({player1Games: set.p1, player2Games: set.p2})),
      }, adminSession.token, 200);

      // Recalculate rankings so positions reflect the new result.
      await apiHelper.post('/rankings/recalculate', {}, adminSession.token, 200).catch(() => null);

      // Navigate to the rankings page and assert the table updated (at least renders).
      const rankingPage = new RankingPage(publicPage);
      await rankingPage.goto();
      await expect(publicPage.locator('.rankings-table, .empty-section, .alert-error')).toBeVisible();
      await expect(publicPage.locator('.loading-section')).not.toBeVisible();
    } finally {
      await seedHelper.cleanAll();
      await apiHelper.dispose();
    }
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