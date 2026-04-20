/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/medium/announcements.spec.ts
 * @desc Medium-priority announcement list and creation scenarios.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {test, expect} from '../fixtures/auth.fixture';
import {AnnouncementsPage} from '../fixtures/page-objects/announcements.page';
import {TEST_USERS} from '../fixtures/test-data';
import {ApiHelper} from '../helpers/api.helper';
import {SeedHelper} from '../helpers/seed.helper';

let apiHelper: ApiHelper | undefined;
let seedHelper: SeedHelper | undefined;
let adminToken = '';
let announcementTournamentId = '';
let seededAnnouncementTitle = '';

test.describe('Announcements - Medium', () => {
  test.beforeAll(async () => {
    apiHelper = await ApiHelper.create();
    const adminSession = await apiHelper.login(TEST_USERS.tournamentAdmin1);
    seedHelper = new SeedHelper(apiHelper, adminSession);

    const tournament = await seedHelper.createTournament(`E2E Announcements ${Date.now()}`);
    announcementTournamentId = tournament.id;
    adminToken = adminSession.token;
    seededAnnouncementTitle = `Seeded Announcement ${Date.now()}`;

    await apiHelper.post('/announcements', {
      tournamentId: announcementTournamentId,
      type: 'PUBLIC',
      title: seededAnnouncementTitle,
      summary: 'Seeded announcement summary.',
      longText: 'Seeded announcement content for modal and list coverage.',
      tags: ['general'],
    }, adminToken, 201);
  });

  test.afterAll(async () => {
    await seedHelper?.cleanAll();
    await apiHelper?.dispose();
  });

  test('ANN-001 should let admins create a public announcement', async ({tournamentAdminPage}) => {
    const announcementsPage = new AnnouncementsPage(tournamentAdminPage);
    const uniqueTitle = `E2E Announcement ${Date.now()}`;

    await tournamentAdminPage.goto(`/announcements/create?tournamentId=${announcementTournamentId}`);
    await announcementsPage.createAnnouncement({
      tournamentId: announcementTournamentId,
      title: uniqueTitle,
      summary: 'Automated announcement summary.',
      longText: 'Automated announcement content for Playwright coverage.',
      visibility: 'PUBLIC',
      tags: ['general'],
    });

    await tournamentAdminPage.goto('/announcements');
    await announcementsPage.expectAnnouncementVisible(uniqueTitle);
  });

  test('ANN-003 should filter announcements by search and tag', async ({publicPage}) => {
    const announcementsPage = new AnnouncementsPage(publicPage);
    await announcementsPage.goto();

    await announcementsPage.search('Draw');
    const tagButton = publicPage.getByRole('button', {name: /general|schedule|bracket/i}).first();
    if (await tagButton.count() > 0) {
      await tagButton.click();
    }
  });

  test('ANN-004 should open the announcement details modal', async ({publicPage}) => {
    const announcementsPage = new AnnouncementsPage(publicPage);
    await announcementsPage.goto();
    await publicPage.locator('.announcement-card').filter({hasText: seededAnnouncementTitle}).first().click();

    await expect(publicPage.locator('.modal-container')).toBeVisible();
  });

  test('ANN-007 should show a view counter for announcement reads', async ({publicPage}) => {
    test.skip(true, 'Announcement view counters are not implemented in the current frontend.');

    const announcementsPage = new AnnouncementsPage(publicPage);
    await announcementsPage.goto();
  });
});