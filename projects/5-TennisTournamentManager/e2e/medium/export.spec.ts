/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/medium/export.spec.ts
 * @desc Medium-priority export and reporting scenarios.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {test, expect} from '../fixtures/auth.fixture';
import {BracketPage} from '../fixtures/page-objects/bracket.page';
import {TEST_USERS} from '../fixtures/test-data';
import {ApiHelper} from '../helpers/api.helper';
import {SeedHelper} from '../helpers/seed.helper';

let apiHelper: ApiHelper | undefined;
let seedHelper: SeedHelper | undefined;
let bracketId = '';
let statisticsTournamentId = '';

test.describe('Export - Medium', () => {
  test.beforeAll(async () => {
    apiHelper = await ApiHelper.create();
    const adminSession = (await apiHelper.getCachedSession(TEST_USERS.tournamentAdmin1.email)) ??
      await apiHelper.login(TEST_USERS.tournamentAdmin1);
    const participant1 = (await apiHelper.getCachedSession(TEST_USERS.participant1.email)) ??
      await apiHelper.login(TEST_USERS.participant1);
    const participant2 = (await apiHelper.getCachedSession(TEST_USERS.participant2.email)) ??
      await apiHelper.login(TEST_USERS.participant2);
    seedHelper = new SeedHelper(apiHelper, adminSession);

    const fixture = await seedHelper.createSinglesMatchFixture(
      `E2E Export ${Date.now()}`,
      [participant1.user.id, participant2.user.id],
      {publishBracket: true},
    );

    if (fixture.matchId && fixture.participantIds?.[0]) {
      await seedHelper.updateMatch(fixture.matchId, {
        status: 'COMPLETED',
        winnerId: fixture.participantIds[0],
        scores: [{player1Games: 6, player2Games: 3}, {player1Games: 6, player2Games: 4}],
      });
    }

    bracketId = fixture.bracketId ?? '';
    statisticsTournamentId = fixture.id;
  });

  test.afterAll(async () => {
    await seedHelper?.cleanAll();
    await apiHelper?.dispose();
  });

  test('EXP-001 should expose bracket PDF export', async ({tournamentAdminPage}) => {
    const bracketPage = new BracketPage(tournamentAdminPage);
    await bracketPage.gotoById(bracketId);
    await expect(tournamentAdminPage.getByRole('button', {name: /export pdf/i})).toBeVisible();
    await bracketPage.expectBracketVisible();
  });

  test('EXP-002 should expose statistics export buttons for admins', async ({tournamentAdminPage}) => {
    await tournamentAdminPage.goto(`/tournaments/${statisticsTournamentId}/statistics`);
    await expect(tournamentAdminPage.getByRole('button', {name: /export as pdf/i})).toBeVisible();
    await expect(tournamentAdminPage.getByRole('button', {name: /export as csv/i})).toBeVisible();
  });

  test('EXP-003 should expose ITF CSV and TODS exports', async ({tournamentAdminPage}) => {
    test.fixme(true, 'ITF/TODS export services exist, but the active frontend template does not expose stable UI controls for them.');

    await tournamentAdminPage.goto(`/tournaments/${statisticsTournamentId}`);
  });

  test('EXP-004 should generate documents and certificates', async ({tournamentAdminPage}) => {
    test.skip(true, 'Document and certificate generation UI is not implemented in the current frontend.');

    await tournamentAdminPage.goto(`/tournaments/${statisticsTournamentId}`);
  });
});