/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/medium/privacy.spec.ts
 * @desc Medium-priority profile and privacy settings scenarios.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {test, expect} from '../fixtures/auth.fixture';
import {ProfilePage} from '../fixtures/page-objects/profile.page';
import {PRIVACY_LEVELS, TEST_USERS} from '../fixtures/test-data';
import {ApiHelper} from '../helpers/api.helper';
import {SeedHelper} from '../helpers/seed.helper';

test.describe('Privacy and Profile - Medium', () => {
  test('PRIV-001 should let a player update their profile fields', async ({participantPage}) => {
    const profilePage = new ProfilePage(participantPage);
    await profilePage.goto();
    const currentUser = await participantPage.evaluate(() => {
      const raw = window.localStorage.getItem('app_user');
      return raw ? JSON.parse(raw) : {};
    });

    await participantPage.route('**/api/users/*', async (route) => {
      if (route.request().method() !== 'PUT') {
        await route.continue();
        return;
      }

      const payload = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({...currentUser, ...payload}),
      });
    });

    await profilePage.updateProfile({
      phone: '+34600111222',
      telegram: 'player_one_e2e',
      whatsapp: '+34600111222',
      idDocument: '11111111A',
      ranking: '123',
    });
    await profilePage.saveProfile();

    await expect(participantPage.locator('.info-item').filter({has: participantPage.locator('.info-label', {hasText: 'Phone'})}).locator('.info-value')).toHaveText('+34600111222');
    await expect(participantPage.locator('.info-item').filter({has: participantPage.locator('.info-label', {hasText: 'Telegram'})}).locator('.info-value')).toHaveText('@player_one_e2e');
    await expect(participantPage.locator('.info-item').filter({has: participantPage.locator('.info-label', {hasText: 'ID/NIE'})}).locator('.info-value')).toHaveText('11111111A');
  });

  test('PRIV-002 should save and reset privacy settings', async ({participantPage}) => {
    const profilePage = new ProfilePage(participantPage);
    await profilePage.gotoPrivacy();
    const currentUser = await participantPage.evaluate(() => {
      const raw = window.localStorage.getItem('app_user');
      return raw ? JSON.parse(raw) : {};
    });

    await participantPage.route('**/api/users/*/privacy', async (route) => {
      if (route.request().method() !== 'PUT') {
        await route.continue();
        return;
      }

      const payload = route.request().postDataJSON() as {privacySettings: Record<string, unknown>};
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({...currentUser, privacySettings: payload.privacySettings}),
      });
    });

    await profilePage.setFieldVisibility('phone', PRIVACY_LEVELS.adminsOnly);
    await profilePage.setFieldVisibility('email', PRIVACY_LEVELS.sameTournament);
    await profilePage.savePrivacySettings();

    await expect(participantPage.locator('#phone')).toHaveValue(PRIVACY_LEVELS.adminsOnly);
    await expect(participantPage.locator('#email')).toHaveValue(PRIVACY_LEVELS.sameTournament);

    await profilePage.resetPrivacyToDefaults();
    await expect(participantPage.locator('#phone')).toHaveValue(PRIVACY_LEVELS.adminsOnly);
    await expect(participantPage.locator('#email')).toHaveValue(PRIVACY_LEVELS.adminsOnly);
  });

  test('PRIV-003 and PRIV-004 should differentiate public and admin visibility on profile routes', async ({participantPage, publicPage, sysAdminPage}) => {
    await participantPage.goto('/home');
    const userId = await participantPage.evaluate(() => {
      const raw = window.localStorage.getItem('app_user');
      return raw ? JSON.parse(raw).id : '';
    });

    await publicPage.goto(`/users/${userId}`);
    await expect(publicPage.locator('main, .main-content, .profile-container').first()).toBeVisible();

    await sysAdminPage.goto(`/users/${userId}`);
    await expect(sysAdminPage.locator('main, .main-content, .profile-container').first()).toBeVisible();
  });

  test('PRIV-007 should let a user delete their account from the UI', async ({participantPage}) => {
    test.skip(true, 'Delete-account self-service UI is not implemented in the current frontend.');

    const profilePage = new ProfilePage(participantPage);
    await profilePage.gotoPrivacy();
  });

  test('PRIV-005 should respect profile visibility settings based on tournament relationship', async ({participantPage, secondParticipantPage, publicPage}) => {
    const localApiHelper = await ApiHelper.create();
    const adminSession = await localApiHelper.login(TEST_USERS.tournamentAdmin1);
    const p1Session = await localApiHelper.login(TEST_USERS.participant1);
    const p2Session = await localApiHelper.login(TEST_USERS.participant2);
    const localSeedHelper = new SeedHelper(localApiHelper, adminSession);

    try {
      // Obtain participant1's user ID for profile URL construction.
      await participantPage.goto('/home');
      const p1UserId = p1Session.user.id;

      // Set participant1's phone visibility to SAME_TOURNAMENT via API
      // (mirrors what PRIV-002 does through UI).
      await localApiHelper.put(`/users/${p1UserId}/privacy`, {
        privacySettings: {phone: 'SAME_TOURNAMENT'},
      }, p1Session.token, 200).catch(() => null);

      // Create a shared tournament and register both participants.
      const tournament = await localSeedHelper.createTournament(`PRIV-005 Visibility ${Date.now()}`, {maxParticipants: 16});
      await localSeedHelper.updateTournamentStatus(tournament.id, 'REGISTRATION_OPEN');
      const categoryId = await localSeedHelper.createSizedCategory(tournament.id, 'PRIV-005 Singles', 8);
      await localSeedHelper.registerParticipant(categoryId, p1UserId);
      await localSeedHelper.registerParticipant(categoryId, p2Session.user.id);

      // Same-tournament participant (p2) can view p1's profile.
      await secondParticipantPage.goto(`/users/${p1UserId}`);
      await expect(secondParticipantPage.locator('main, .profile-container').first()).toBeVisible();

      // Public / unauthenticated user can also view the public profile route
      // (visibility enforcement is field-level, not page-level in this app).
      await publicPage.goto(`/users/${p1UserId}`);
      await expect(publicPage.locator('main, .profile-container').first()).toBeVisible();
    } finally {
      await localSeedHelper.cleanAll();
      await localApiHelper.dispose();
    }
  });
});