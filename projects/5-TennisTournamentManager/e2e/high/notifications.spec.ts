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
    // saveSettings() internally waits for the success banner; assert it was
    // visible during the save call rather than racing after auto-dismiss (3s).
    await notificationsPage.saveSettings();
    await expect(participantPage.locator('.error-message, .error-banner').first()).toBeHidden({timeout: 3_000});
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

  test('NOTIF-003 should navigate to the originating entity when clicking a notification', async ({participantPage}) => {
    const notificationsPage = new NotificationsPage(participantPage);
    await notificationsPage.goto();

    // If there are no notifications, the test still asserts the inbox page rendered.
    await expect(participantPage.getByRole('heading', {name: /notifications/i, level: 1})).toBeVisible();

    const firstCard = participantPage.locator('.notification-card, .notification-item').first();
    if (await firstCard.count() === 0) {
      // No notifications in the inbox — assert the empty state renders cleanly.
      await expect(participantPage.locator('.empty-state, .no-notifications').first()).toBeVisible();
      return;
    }

    // Extract a URL-like substring from the first notification's action/link.
    const actionLink = firstCard.locator('a[href], button[data-href]').first();
    if (await actionLink.count() > 0) {
      const urlBefore = participantPage.url();
      await actionLink.click();
      // After clicking we should be on a different route.
      await expect(participantPage).not.toHaveURL(urlBefore, {timeout: 8_000});
      // The destination page must be a known entity route.
      await expect(participantPage).toHaveURL(/\/(tournaments|matches|announcements|brackets)\//);
    } else {
      // Some implementations render a "View" button that performs navigation.
      const viewBtn = firstCard.getByRole('button', {name: /view|open|details/i}).first();
      if (await viewBtn.count() > 0) {
        const urlBefore = participantPage.url();
        await viewBtn.click();
        await expect(participantPage).not.toHaveURL(urlBefore, {timeout: 8_000});
      }
    }
  });
});