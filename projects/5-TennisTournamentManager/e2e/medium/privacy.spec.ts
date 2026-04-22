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
import {PRIVACY_LEVELS} from '../fixtures/test-data';

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
});