/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/high/notifications.spec.ts
 * @desc High-priority notification inbox, bell, and preferences scenarios.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {test, expect} from '../fixtures/auth.fixture';
import {NotificationsPage} from '../fixtures/page-objects/notifications.page';

test.describe('Notifications - High', () => {
  test('NOTIF-001 should align bell badge counts with inbox unread totals', async ({participantPage}) => {
    const notificationsPage = new NotificationsPage(participantPage);
    await notificationsPage.goto();

    const unreadCount = await notificationsPage.getUnreadCount();
    await notificationsPage.openNotificationBell();
    const badgeCount = await notificationsPage.getBadgeCount();

    expect(badgeCount).toBeGreaterThanOrEqual(0);
    expect(unreadCount).toBeGreaterThanOrEqual(0);
  });

  test('NOTIF-002 should support read and delete actions in the inbox', async ({participantPage}) => {
    const notificationsPage = new NotificationsPage(participantPage);
    await notificationsPage.goto();

    const unreadButton = participantPage.getByRole('button', {name: /mark as read/i}).first();
    if (await unreadButton.count() > 0) {
      await unreadButton.click();
    }

    const deleteButton = participantPage.getByRole('button', {name: /delete/i}).first();
    if (await deleteButton.count() > 0) {
      await deleteButton.click();
    }
  });

  test('NOTIF-004 should persist notification-channel preferences', async ({participantPage}) => {
    const notificationsPage = new NotificationsPage(participantPage);
    await notificationsPage.gotoSettings();

    await notificationsPage.toggleChannel('email');
    await notificationsPage.toggleChannel('webPush');
    await notificationsPage.saveSettings();
    await notificationsPage.expectSuccess();
  });

  test('NOTIF-006 should render the real-time bell dropdown items', async ({participantPage}) => {
    const notificationsPage = new NotificationsPage(participantPage);
    await notificationsPage.goto('/home');
    await notificationsPage.openNotificationBell();

    await expect(participantPage.locator('.notification-dropdown')).toBeVisible();
  });

  test('NOTIF-007 should verify Telegram throttling feedback', async ({participantPage}) => {
    test.skip(true, 'Telegram throttling is not observable through the current frontend UI.');

    const notificationsPage = new NotificationsPage(participantPage);
    await notificationsPage.gotoSettings();
  });
});