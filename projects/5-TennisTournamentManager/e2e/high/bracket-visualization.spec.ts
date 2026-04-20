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

test.describe('Bracket Visualization - High', () => {
  test.beforeAll(async () => {
    apiHelper = await ApiHelper.create();
    const adminSession = await apiHelper.login(TEST_USERS.tournamentAdmin1);
    const participant1 = await apiHelper.login(TEST_USERS.participant1);
    const participant2 = await apiHelper.login(TEST_USERS.participant2);
    seedHelper = new SeedHelper(apiHelper, adminSession);

    const fixture = await seedHelper.createSinglesMatchFixture(
      `E2E Bracket ${Date.now()}`,
      [participant1.user.id, participant2.user.id],
      {publishBracket: true},
    );

    bracketId = fixture.bracketId ?? '';
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