/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 25, 2026
 * @file e2e/high/navigation-feedback.spec.ts
 * @desc High-priority navigation feedback scenarios for header discoverability and contextual back navigation.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {type Page} from '@playwright/test';
import {test, expect} from '../fixtures/auth.fixture';
import {ApiHelper} from '../helpers/api.helper';
import {SeedHelper} from '../helpers/seed.helper';
import {TEST_USERS} from '../fixtures/test-data';

const MATCH_SCHEDULED_TIME = '2026-06-12T10:30:00.000Z';
const SEEDED_TOURNAMENT_STATUSES = ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'DRAW_PENDING'];

async function createSeedContext(): Promise<{
  apiHelper: ApiHelper;
  seedHelper: SeedHelper;
  participant1Id: string;
  participant2Id: string;
  participant2Name: string;
}> {
  const apiHelper = await ApiHelper.create();
  const adminSession = await apiHelper.login({
    email: TEST_USERS.tournamentAdmin1.email,
    password: TEST_USERS.tournamentAdmin1.password,
  });
  const participant1Session = await apiHelper.login({
    email: TEST_USERS.participant1.email,
    password: TEST_USERS.participant1.password,
  });
  const participant2Session = await apiHelper.login({
    email: TEST_USERS.participant2.email,
    password: TEST_USERS.participant2.password,
  });

  return {
    apiHelper,
    seedHelper: new SeedHelper(apiHelper, adminSession),
    participant1Id: participant1Session.user.id,
    participant2Id: participant2Session.user.id,
    participant2Name: `${participant2Session.user.firstName} ${participant2Session.user.lastName}`,
  };
}

/**
 * Opens the My Matches page and retries when the UI surfaces a transient load error.
 *
 * @param page - Authenticated participant page
 */
async function gotoMyMatchesWithRetry(page: Page): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.goto('/my-matches');

    const pageLoaded = await page
      .getByRole('heading', {name: /my matches/i})
      .isVisible()
      .catch(() => false);
    const blankPage = await page.locator('body').innerText().then(text => text.trim().length === 0).catch(() => false);

    if (!pageLoaded && blankPage) {
      await page.reload({waitUntil: 'domcontentloaded'});
      continue;
    }

    await expect(page.getByRole('heading', {name: /my matches/i})).toBeVisible();

    const loadError = page.getByText(/failed to load matches\. please try again\./i);
    if (!await loadError.isVisible().catch(() => false)) {
      return;
    }

    await page.reload({waitUntil: 'domcontentloaded'});
  }

  await expect(page.getByText(/failed to load matches\. please try again\./i)).toBeHidden();
}

async function gotoTournamentWithRetry(page: Page, tournamentId: string): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.goto(`/tournaments/${tournamentId}`);

    const headingVisible = await page.locator('h1').first().isVisible().catch(() => false);
    const blankPage = await page.locator('body').innerText().then(text => text.trim().length === 0).catch(() => false);
    const rateLimitError = await page.getByText(/request failed with status code 429|too many requests/i).isVisible().catch(() => false);

    if (headingVisible && !rateLimitError) {
      return;
    }

    if (blankPage || rateLimitError) {
      await page.reload({waitUntil: 'domcontentloaded'});
    }
  }

  await expect(page.locator('h1').first()).toBeVisible();
}

test.describe('Navigation Feedback - High', () => {
  test('FDBK-NAV-001 should expose primary header links according to the authenticated role', async ({participantPage, tournamentAdminPage, sysAdminPage}) => {
    await participantPage.goto('/home');
    const participantNav = participantPage.locator('header.app-header nav');
    await expect(participantNav.getByRole('link', {name: /tournaments/i})).toBeVisible();
    await expect(participantNav.getByRole('link', {name: /my matches/i})).toBeVisible();
    await expect(participantNav.getByRole('link', {name: /statistics/i})).toBeVisible();

    await participantNav.getByRole('link', {name: /tournaments/i}).click();
    await expect(participantPage).toHaveURL(/\/tournaments$/);
    await participantNav.getByRole('link', {name: /my matches/i}).click();
    await expect(participantPage).toHaveURL(/\/my-matches$/);
    await participantNav.getByRole('link', {name: /statistics/i}).click();
    await expect(participantPage).toHaveURL(/\/statistics$/);

    for (const adminPage of [tournamentAdminPage, sysAdminPage]) {
      await adminPage.goto('/home');
      const adminNav = adminPage.locator('header.app-header nav');
      await expect(adminNav.getByRole('link', {name: /tournaments/i})).toBeVisible();
      await expect(adminNav.getByRole('link', {name: /statistics/i})).toBeVisible();
      await expect(adminNav.getByRole('link', {name: /my matches/i})).toHaveCount(0);
    }
  });

  test('FDBK-NAV-002 should preserve contextual back navigation between My Matches, user profiles, and statistics', async ({participantPage}) => {
    test.setTimeout(90_000);
    const seedContext = await createSeedContext();

    try {
      const courtName = `Navigation Court ${Date.now()}`;
      await seedContext.seedHelper.createSinglesMatchFixture(
        `FDBK-NAV-002 ${Date.now()}`,
        [seedContext.participant1Id, seedContext.participant2Id],
        {
          tournamentStatuses: SEEDED_TOURNAMENT_STATUSES,
          courtName,
          scheduledTime: MATCH_SCHEDULED_TIME,
          matchStatus: 'SCHEDULED',
        },
      );

      await gotoMyMatchesWithRetry(participantPage);
      const matchCard = participantPage.locator('.match-card').filter({hasText: courtName}).first();
      await expect(matchCard.getByRole('link', {name: seedContext.participant2Name})).toBeVisible();

      await matchCard.getByRole('link', {name: seedContext.participant2Name}).click();
      await expect(participantPage).toHaveURL(/\/users\//);
      await expect(participantPage.getByRole('heading', {name: new RegExp(seedContext.participant2Name, 'i')})).toBeVisible();

      await participantPage.getByRole('button', {name: /view statistics/i}).click();
      await expect(participantPage).toHaveURL(/\/statistics\//);
      await expect(participantPage.getByRole('heading', {name: /player statistics/i})).toBeVisible();

      await participantPage.locator('.statistics-container .back-btn').click();
      await expect(participantPage).toHaveURL(/\/users\//);
      await expect(participantPage.getByRole('button', {name: /go back/i})).toBeVisible();

      await participantPage.getByRole('button', {name: /go back/i}).click();
      await expect(participantPage).toHaveURL(/\/my-matches$/);
      await expect(participantPage.getByRole('heading', {name: /my matches/i})).toBeVisible();
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });

  test('FDBK-STATS-001 should preserve tournament branding on contextual statistics routes only', async ({participantPage}) => {
    test.setTimeout(90_000);
    const seedContext = await createSeedContext();

    try {
      const fixture = await seedContext.seedHelper.createSinglesMatchFixture(
        `FDBK-STATS-001 ${Date.now()}`,
        [seedContext.participant1Id, seedContext.participant2Id],
        {
          tournamentOptions: {
            logoUrl: 'https://example.com/e2e-stats-logo.png',
          },
        },
      );

      await gotoTournamentWithRetry(participantPage, fixture.id);
      const participantLink = participantPage.locator(`a[href="/users/${seedContext.participant2Id}"]`).first();
      await expect(participantLink).toBeVisible();

      await participantLink.click();
      await expect(participantPage).toHaveURL(/\/users\//);
      await participantPage.getByRole('button', {name: /view statistics/i}).click();

      await expect(participantPage).toHaveURL(new RegExp(`/statistics/${seedContext.participant2Id}.*tournamentId=${fixture.id}`));
      await expect(participantPage.locator('.statistics-container .tournament-logo')).toBeVisible();
      await expect(participantPage.locator('.statistics-container .tournament-logo')).toHaveAttribute('src', /e2e-stats-logo\.png/);

      await participantPage.goto('/statistics');
      await expect(participantPage).toHaveURL(/\/statistics$/);
      await expect(participantPage.locator('.statistics-container .tournament-logo')).toHaveCount(0);
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });
});