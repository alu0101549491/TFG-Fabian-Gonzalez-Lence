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
import {TEST_USERS} from '../fixtures/test-data';
import {ApiHelper} from '../helpers/api.helper';
import {SeedHelper} from '../helpers/seed.helper';

let apiHelper: ApiHelper | undefined;
let seedHelper: SeedHelper | undefined;
let bracketId = '';
let highlightedParticipantName = '';

test.describe('Bracket Visualization - High', () => {
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    apiHelper = await ApiHelper.create();
    const adminSession = await apiHelper.login(TEST_USERS.tournamentAdmin1);
    const participant1 = await apiHelper.login(TEST_USERS.participant1);
    const participant2 = await apiHelper.login(TEST_USERS.participant2);
    seedHelper = new SeedHelper(apiHelper, adminSession);

    const timestamp = Date.now();
    const participant3 = await seedHelper.createPlayer(`bracket_c_${timestamp}`);

    const tournament = await seedHelper.createTournament(`E2E Bracket ${timestamp}`, {
      maxParticipants: 4,
      tournamentType: 'SINGLES',
    });
    const categoryId = await seedHelper.createSizedCategory(tournament.id, 'Bracket Feedback Singles', 4);

    await seedHelper.updateTournamentStatus(tournament.id, 'REGISTRATION_OPEN');

    const registration1 = await seedHelper.registerParticipant(categoryId, participant1.user.id);
    await seedHelper.approveRegistration(registration1, 'DIRECT_ACCEPTANCE');

    const registration2 = await seedHelper.registerParticipant(categoryId, participant2.user.id);
    await seedHelper.approveRegistration(registration2, 'WILD_CARD');

    const registration3 = await seedHelper.registerParticipant(categoryId, participant3.user.id);
    await seedHelper.approveRegistration(registration3, 'QUALIFIER');

    await seedHelper.updateTournamentStatus(tournament.id, ['REGISTRATION_CLOSED', 'DRAW_PENDING']);

    bracketId = await seedHelper.createBracket(tournament.id, categoryId, 3);
    await seedHelper.publishBracket(bracketId);

    highlightedParticipantName = `${participant1.user.firstName} ${participant1.user.lastName}`;
  });

  test.afterAll(async () => {
    await seedHelper?.cleanAll();
    await apiHelper?.dispose();
  });

  test('DRAW-007 should render the main draw bracket for public users', async ({publicPage}) => {
    const bracketPage = new BracketPage(publicPage);
    await bracketPage.gotoById(bracketId);
    await bracketPage.expectBracketVisible();
  });

  test('FDBK-DRAW-001 should distinguish BYE from TBD and show bracket feedback badges', async ({publicPage}) => {
    const bracketPage = new BracketPage(publicPage);
    await bracketPage.gotoById(bracketId);
    await bracketPage.expectBracketVisible();

    await expect(publicPage.locator('.seed-badge').first()).toBeVisible();
    await expect(publicPage.locator('.acceptance-badge').first()).toBeVisible();
    await expect(publicPage.locator('text=BYE').first()).toBeVisible();
    await expect(publicPage.locator('text=TBD').first()).toBeVisible();
    await expect(publicPage.locator('.format-badge').first()).toContainText(/best of 3/i);

    const profileLink = publicPage.getByRole('link', {name: highlightedParticipantName}).first();
    await expect(profileLink).toHaveAttribute('href', /\/users\//);
  });

  test('EXP-001 should expose a PDF export entry point from the bracket view', async ({tournamentAdminPage}) => {
    const bracketPage = new BracketPage(tournamentAdminPage);
    await bracketPage.gotoById(bracketId);

    await expect(tournamentAdminPage.getByRole('button', {name: /export pdf/i})).toBeVisible();
  });

  test('RESP-003 should keep the bracket page usable on smaller viewports', async ({page}) => {
    await page.setViewportSize({width: 375, height: 812});
    const bracketPage = new BracketPage(page);
    await bracketPage.gotoById(bracketId);

    await expect(page.locator('.bracket-content')).toBeVisible();
  });
});