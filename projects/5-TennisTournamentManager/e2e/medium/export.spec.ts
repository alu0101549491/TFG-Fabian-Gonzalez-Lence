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
import {readFile} from 'node:fs/promises';
import {BracketPage} from '../fixtures/page-objects/bracket.page';
import {TEST_USERS} from '../fixtures/test-data';
import {ApiHelper} from '../helpers/api.helper';
import {SeedHelper} from '../helpers/seed.helper';

let apiHelper: ApiHelper | undefined;
let seedHelper: SeedHelper | undefined;
let bracketId = '';
let statisticsTournamentId = '';
let statisticsCategoryName = '';
let tournamentLogoUrl = '';

test.describe('Export - Medium', () => {
  test.describe('Active Export Scenarios', () => {
    test.beforeAll(async () => {
      test.setTimeout(240000);

      apiHelper = await ApiHelper.create();
      const adminSession = await apiHelper.login(TEST_USERS.tournamentAdmin1);
      const participant1 = await apiHelper.login(TEST_USERS.participant1);
      const participant2 = await apiHelper.login(TEST_USERS.participant2);
      seedHelper = new SeedHelper(apiHelper, adminSession);

      tournamentLogoUrl = 'https://example.com/e2e-export-logo.png';
      const tournament = await seedHelper.createTournament(`E2E Export ${Date.now()}`, {
        maxParticipants: 8,
        logoUrl: tournamentLogoUrl,
      });
      statisticsCategoryName = 'Export Singles';
      const categoryId = await seedHelper.createSizedCategory(tournament.id, statisticsCategoryName, 8);
      const registrationIds = [
        await seedHelper.registerParticipant(categoryId, participant1.user.id),
        await seedHelper.registerParticipant(categoryId, participant2.user.id),
      ];

      for (const registrationId of registrationIds) {
        await seedHelper.approveRegistration(registrationId);
      }

      bracketId = await seedHelper.createBracket(tournament.id, categoryId, 2);
      statisticsTournamentId = tournament.id;
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
      await expect(tournamentAdminPage.getByRole('heading', {name: /tournament statistics/i})).toBeVisible();
      await expect(tournamentAdminPage.getByRole('heading', {name: /export statistics/i})).toBeVisible();
      await expect(tournamentAdminPage.getByRole('button', {name: /export as pdf/i})).toBeVisible();
      await expect(tournamentAdminPage.getByRole('button', {name: /export as csv/i})).toBeVisible();
    });

    test('FDBK-EXP-001 should export tournament statistics PDF with the improved template content', async ({tournamentAdminPage}) => {
      await tournamentAdminPage.goto(`/tournaments/${statisticsTournamentId}/statistics`);
      await expect(tournamentAdminPage.getByRole('heading', {name: /tournament statistics/i})).toBeVisible();
      await expect(tournamentAdminPage.getByRole('heading', {name: /export statistics/i})).toBeVisible();

      const downloadPromise = tournamentAdminPage.waitForEvent('download');
      await tournamentAdminPage.getByRole('button', {name: /export as pdf/i}).click();
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toMatch(new RegExp(`Tournament_Statistics_${statisticsTournamentId}_.*\\.pdf$`));
      const downloadPath = await download.path();
      expect(downloadPath).not.toBeNull();
      const pdfBuffer = await readFile(downloadPath!);
      const pdfText = pdfBuffer.toString('latin1');

      expect(pdfText).toContain('Tournament Statistics');
      expect(pdfText).toContain('Match Status Distribution');
      expect(pdfText).toContain('Category Breakdown');
      expect(pdfText).toContain(statisticsCategoryName);
    });

    test('FDBK-TOURN-006 should show the tournament logo only on scoped matches routes', async ({publicPage}) => {
      await publicPage.goto(`/matches?tournamentId=${statisticsTournamentId}`);
      await expect(publicPage.getByText(/loading matches/i)).toHaveCount(0);
      const scopedLogo = publicPage.locator('.tournament-logo');
      await expect(scopedLogo).toBeVisible();
      await expect(scopedLogo).toHaveAttribute('src', /e2e-export-logo\.png/);

      await publicPage.goto('/matches');
      await expect(publicPage.locator('.tournament-logo')).toHaveCount(0);
    });
  });

  test('EXP-003 should expose ITF CSV and TODS exports', async ({tournamentAdminPage}) => {
    test.fixme(true, 'ITF/TODS export services exist, but the active frontend template does not expose stable UI controls for them.');

    await tournamentAdminPage.goto('/tournaments');
  });

  test('EXP-004 should generate documents and certificates', async ({tournamentAdminPage}) => {
    test.skip(true, 'Document and certificate generation UI is not implemented in the current frontend.');

    await tournamentAdminPage.goto('/tournaments');
  });
});