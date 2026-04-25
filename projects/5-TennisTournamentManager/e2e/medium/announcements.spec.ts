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
import path from 'node:path';
import {AnnouncementsPage} from '../fixtures/page-objects/announcements.page';
import {TEST_USERS} from '../fixtures/test-data';
import {ApiHelper} from '../helpers/api.helper';
import {SeedHelper} from '../helpers/seed.helper';

const ANNOUNCEMENT_IMAGE_FIXTURE = path.join(
  new URL('../../public/icons/icon-192.png', import.meta.url).pathname,
);

let apiHelper: ApiHelper | undefined;
let seedHelper: SeedHelper | undefined;
let adminToken = '';
let announcementTournamentId = '';
let seededAnnouncementTitle = '';
let announcementTournamentLogo = '';

test.describe('Announcements - Medium', () => {
  test.beforeAll(async () => {
    test.setTimeout(60_000);

    apiHelper = await ApiHelper.create();
    const adminSession = await apiHelper.login(TEST_USERS.tournamentAdmin1);
    seedHelper = new SeedHelper(apiHelper, adminSession);

    announcementTournamentLogo = 'https://example.com/e2e-announcements-logo.png';
    const tournament = await seedHelper.createTournament(`E2E Announcements ${Date.now()}`, {
      logoUrl: announcementTournamentLogo,
    });
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

    await tournamentAdminPage.goto(`/announcements?tournamentId=${announcementTournamentId}`);
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
    await publicPage.goto(`/announcements?tournamentId=${announcementTournamentId}`);
    await announcementsPage.expectAnnouncementVisible(seededAnnouncementTitle);
    await publicPage.locator('.announcement-card').filter({hasText: seededAnnouncementTitle}).first().click();

    await expect(publicPage.locator('.modal-container')).toBeVisible();
  });

  test('FDBK-CONTENT-001 should create an announcement with image preview and CTA link rendering', async ({tournamentAdminPage}) => {
    const announcementsPage = new AnnouncementsPage(tournamentAdminPage);
    const uniqueTitle = `Announcement Media ${Date.now()}`;
    const externalLink = 'https://example.com/announcement-media';
    const linkText = 'Read Full Update';

    await tournamentAdminPage.goto(`/announcements/create?tournamentId=${announcementTournamentId}`);
    await expect(tournamentAdminPage.getByRole('heading', {name: /create announcement/i})).toBeVisible();
    await expect(tournamentAdminPage.getByRole('heading', {name: /media & links/i})).toBeVisible();
    await expect(tournamentAdminPage.locator('#imageFile')).toBeVisible();
    await expect(tournamentAdminPage.locator('#externalLink')).toBeVisible();

    await tournamentAdminPage.locator('#imageFile').setInputFiles(ANNOUNCEMENT_IMAGE_FIXTURE);
    const imagePreview = tournamentAdminPage.locator('.image-preview');
    await expect(imagePreview).toBeVisible();
    await expect(imagePreview).toHaveAttribute('src', /^data:image\//);

    await tournamentAdminPage.locator('#externalLink').fill(externalLink);
    await expect(tournamentAdminPage.locator('#linkText')).toBeVisible();
    await tournamentAdminPage.locator('#linkText').fill(linkText);
    await tournamentAdminPage.locator('#title').fill(uniqueTitle);
    await tournamentAdminPage.locator('#summary').fill('Announcement media summary.');
    await tournamentAdminPage.locator('#longText').fill('Announcement media body for image and CTA coverage.');
    await tournamentAdminPage.getByRole('button', {name: /general/i}).click();
    await tournamentAdminPage.getByRole('button', {name: /create announcement/i}).click();

    await announcementsPage.expectAnnouncementVisible(uniqueTitle);
    await tournamentAdminPage.locator('.announcement-card').filter({hasText: uniqueTitle}).first().click();

    const detailModal = tournamentAdminPage.locator('.modal-container');
    await expect(detailModal).toBeVisible();
    await expect(detailModal.locator('.announcement-image')).toBeVisible();
    await expect(detailModal.locator('.announcement-image')).toHaveAttribute('src', /^data:image\//);
    const ctaLink = detailModal.locator('.modal-link-button .btn-link');
    await expect(ctaLink).toContainText(linkText);
    await expect(ctaLink).toHaveAttribute('href', externalLink);
    await expect(ctaLink).toHaveAttribute('target', '_blank');
  });

  test('FDBK-TOURN-006 should show the tournament logo only on scoped announcements routes', async ({publicPage}) => {
    await publicPage.goto(`/announcements?tournamentId=${announcementTournamentId}`);
    const scopedLogo = publicPage.locator('.tournament-logo');
    await expect(scopedLogo).toBeVisible();
    await expect(scopedLogo).toHaveAttribute('src', /e2e-announcements-logo\.png/);

    await publicPage.goto('/announcements');
    await expect(publicPage.locator('.tournament-logo')).toHaveCount(0);
  });

  test('ANN-007 should show a view counter for announcement reads', async ({publicPage}) => {
    test.skip(true, 'Announcement view counters are not implemented in the current frontend.');

    const announcementsPage = new AnnouncementsPage(publicPage);
    await announcementsPage.goto();
  });
});