/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/fixtures/page-objects/notifications.page.ts
 * @desc Notification inbox, bell, and preferences page object.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {expect, type Page} from '@playwright/test';
import {BasePage} from './base.page';

/** Page object for `/notifications` and `/notification-preferences`. */
export class NotificationsPage extends BasePage {
  public readonly url = '/notifications';

  public constructor(page: Page) {
    super(page);
  }

  /** Opens the notification preferences page. */
  public async gotoSettings(): Promise<void> {
    await this.gotoPath('/notification-preferences');
  }

  /**
   * Opens the bell dropdown and parses the unread badge count.
   *
   * @returns Numeric unread badge count
   */
  public async getBadgeCount(): Promise<number> {
    const badge = this.page.locator('.unread-badge').first();
    if (await badge.count() === 0 || !await badge.isVisible()) {
      return 0;
    }
    return Number.parseInt((await badge.innerText()).trim(), 10);
  }

  /**
   * Reads the unread count visible on the inbox hero.
   *
   * @returns Numeric unread count
   */
  public async getUnreadCount(): Promise<number> {
    const statValue = this.page.locator('.hero-stats .stat-item .stat-value').nth(1);
    return Number.parseInt((await statValue.innerText()).trim(), 10);
  }

  /** Marks all unread notifications as read from the inbox page. */
  public async markAllAsRead(): Promise<void> {
    await this.page.getByRole('button', {name: /mark all as read/i}).click();
    await this.waitForPageLoad();
  }

  /** Deletes all read notifications from the inbox page. */
  public async deleteAllRead(): Promise<void> {
    await this.page.getByRole('button', {name: /delete all read/i}).click();
    await this.waitForPageLoad();
  }

  /**
   * Toggles a channel checkbox on the preferences page.
   *
   * @param channelId - Checkbox id
   */
  public async toggleChannel(channelId: string): Promise<void> {
    await this.page.locator(`#${channelId}`).click();
  }

  /**
   * Asserts a channel checkbox state.
   *
   * @param channelId - Checkbox id
   * @param checked - Expected state
   */
  public async expectChannelState(channelId: string, checked: boolean): Promise<void> {
    if (checked) {
      await expect(this.page.locator(`#${channelId}`)).toBeChecked();
      return;
    }
    await expect(this.page.locator(`#${channelId}`)).not.toBeChecked();
  }

  /** Saves notification preferences. */
  public async saveSettings(): Promise<void> {
    await this.page.getByRole('button', {name: /save preferences/i}).click();
    await this.waitForPageLoad();
  }
}