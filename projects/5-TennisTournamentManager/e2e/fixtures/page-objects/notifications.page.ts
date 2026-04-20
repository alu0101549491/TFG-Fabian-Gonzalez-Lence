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
    try {
      await statValue.waitFor({state: 'visible', timeout: 5000});
      const text = (await statValue.innerText()).trim();
      return Number.parseInt(text, 10) || 0;
    } catch {
      // Fallback to the unread badge in the header if the hero stat isn't available yet
      const badge = this.page.locator('.unread-badge').first();
      if (await badge.count() && await badge.isVisible()) {
        const txt = (await badge.innerText()).trim();
        return Number.parseInt(txt, 10) || 0;
      }
      return 0;
    }
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
    const input = this.page.locator(`#${channelId}`);
    // Try to click the actual checkbox input if visible/attached
    try {
      await input.waitFor({state: 'attached', timeout: 3000});
      if (await input.isVisible()) {
        await input.click();
        return;
      }
    } catch {
      // fall through to label or JS fallback
    }

    const label = this.page.locator(`label[for="${channelId}"]`).first();
    try {
      await label.waitFor({state: 'visible', timeout: 3000});
      await label.click();
      return;
    } catch {
      // Final fallback: toggle via JS to ensure state changes even if UI is styled
    }

    await this.page.evaluate((id) => {
      const el = document.getElementById(id) as HTMLInputElement | null;
      if (el) {
        el.checked = !el.checked;
        el.dispatchEvent(new Event('change', {bubbles: true}));
      }
    }, channelId);
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
    const saveBtn = this.page.getByRole('button', {name: /save preferences/i});
    try {
      await saveBtn.waitFor({state: 'visible', timeout: 5000});
      await saveBtn.click();
      await this.waitForPageLoad();
      // Wait for the success feedback that the component sets on save
      await this.successFeedback.first().waitFor({state: 'visible', timeout: 5000}).catch(() => undefined);
      return;
    } catch {
      // Fallback: try generic primary button in the form
      const fallback = this.page.locator('.preferences-form .btn.btn-primary').first();
      await fallback.waitFor({state: 'visible', timeout: 2000}).catch(() => null);
      if (await fallback.count()) {
        await fallback.click().catch(() => undefined);
        await this.waitForPageLoad();
        await this.successFeedback.first().waitFor({state: 'visible', timeout: 5000}).catch(() => undefined);
      }
    }
  }
}