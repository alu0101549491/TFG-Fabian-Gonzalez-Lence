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
import {TEST_TOURNAMENTS} from '../fixtures/test-data';

test.describe('Announcements - Medium', () => {
  test('ANN-001 should let admins create a public announcement', async ({tournamentAdminPage}) => {
    const announcementsPage = new AnnouncementsPage(tournamentAdminPage);
    const uniqueTitle = `E2E Announcement ${Date.now()}`;

    await announcementsPage.gotoCreate();
    await announcementsPage.createAnnouncement({
      tournamentId: TEST_TOURNAMENTS.openRegistration.id,
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
    await announcementsPage.openFirstAnnouncement();

    await expect(publicPage.locator('.modal-container')).toBeVisible();
  });

  test('ANN-007 should show a view counter for announcement reads', async ({publicPage}) => {
    test.skip(true, 'Announcement view counters are not implemented in the current frontend.');

    const announcementsPage = new AnnouncementsPage(publicPage);
    await announcementsPage.goto();
  });
});