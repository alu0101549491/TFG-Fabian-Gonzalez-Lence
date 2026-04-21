/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/low/responsive.spec.ts
 * @desc Low-priority responsive layout smoke scenarios.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {test, expect} from '../fixtures/auth.fixture';
import {TEST_USERS} from '../fixtures/test-data';
import {ApiHelper} from '../helpers/api.helper';
import {SeedHelper} from '../helpers/seed.helper';

let apiHelper: ApiHelper | undefined;
let seedHelper: SeedHelper | undefined;
let scheduledTournamentId = '';

test.describe('Responsive - Low', () => {
  test.beforeAll(async () => {
    apiHelper = await ApiHelper.create();
    const adminSession = await apiHelper.login(TEST_USERS.tournamentAdmin1);
    const participant1 = await apiHelper.login(TEST_USERS.participant1);
    const participant2 = await apiHelper.login(TEST_USERS.participant2);
    seedHelper = new SeedHelper(apiHelper, adminSession);

    const fixture = await seedHelper.createSinglesMatchFixture(
      `E2E Responsive ${Date.now()}`,
      [participant1.user.id, participant2.user.id],
      {
        courtName: 'Responsive Court',
        scheduledTime: '2026-06-01T10:00:00.000Z',
        matchStatus: 'SCHEDULED',
      },
    );

    scheduledTournamentId = fixture.id;
  });

  test.afterAll(async () => {
    await seedHelper?.cleanAll();
    await apiHelper?.dispose();
  });

  test('RESP-001 should keep the landing and login pages usable on narrow screens', async ({page}) => {
    await page.setViewportSize({width: 375, height: 667});
    await page.goto('/home');
    await expect(page.locator('.hero-title').first()).toBeVisible();

    await page.goto('/login');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('RESP-002 should keep tournament list and order-of-play pages usable on mobile widths', async ({publicPage}) => {
    await publicPage.setViewportSize({width: 390, height: 844});
    await publicPage.goto('/tournaments');
    await expect(publicPage.locator('.tournament-card').first()).toBeVisible();

    await publicPage.goto(`/order-of-play/${scheduledTournamentId}`);
    await expect(publicPage.locator('.main-content').first()).toBeVisible();
  });

  test('RESP-004 should keep dashboard navigation visible on tablet widths', async ({participantPage}) => {
    await participantPage.setViewportSize({width: 768, height: 1024});
    await participantPage.goto('/home');
    await expect(participantPage.locator('header.app-header')).toBeVisible();
  });
});