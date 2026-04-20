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
import {TournamentDetailPage} from '../fixtures/page-objects/tournament-detail.page';
import {TEST_TOURNAMENTS} from '../fixtures/test-data';

test.describe('Export - Medium', () => {
  test('EXP-001 should expose bracket PDF export', async ({tournamentAdminPage}) => {
    const detailPage = new TournamentDetailPage(tournamentAdminPage);
    await detailPage.gotoById(TEST_TOURNAMENTS.activeKnockout.id);
    await detailPage.openBracket();

    const bracketPage = new BracketPage(tournamentAdminPage);
    await expect(tournamentAdminPage.getByRole('button', {name: /export pdf/i})).toBeVisible();
    await bracketPage.expectBracketVisible();
  });

  test('EXP-002 should expose statistics export buttons for admins', async ({tournamentAdminPage}) => {
    await tournamentAdminPage.goto(`/tournaments/${TEST_TOURNAMENTS.finalized.id}/statistics`);
    await expect(tournamentAdminPage.getByRole('button', {name: /export as pdf/i})).toBeVisible();
    await expect(tournamentAdminPage.getByRole('button', {name: /export as csv/i})).toBeVisible();
  });

  test('EXP-003 should expose ITF CSV and TODS exports', async ({tournamentAdminPage}) => {
    test.fixme(true, 'ITF/TODS export services exist, but the active frontend template does not expose stable UI controls for them.');

    await tournamentAdminPage.goto(`/tournaments/${TEST_TOURNAMENTS.finalized.id}`);
  });

  test('EXP-004 should generate documents and certificates', async ({tournamentAdminPage}) => {
    test.skip(true, 'Document and certificate generation UI is not implemented in the current frontend.');

    await tournamentAdminPage.goto(`/tournaments/${TEST_TOURNAMENTS.finalized.id}`);
  });
});