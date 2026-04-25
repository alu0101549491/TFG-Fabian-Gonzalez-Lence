/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/fixtures/page-objects/announcements.page.ts
 * @desc Announcements list and creation page object.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {expect, type Page} from '@playwright/test';
import {BasePage} from './base.page';

/** Page object for announcement-related routes. */
export class AnnouncementsPage extends BasePage {
  public readonly url = '/announcements';

  public constructor(page: Page) {
    super(page);
  }

  /** Searches announcements with the list-page search box. */
  public async search(query: string): Promise<void> {
    await this.page.locator('.search-input').fill(query);
  }

  /**
   * Filters the announcement list by a tag button.
   *
   * @param tag - Visible tag label
   */
  public async filterByTag(tag: string): Promise<void> {
    await this.page.getByRole('button', {name: new RegExp(tag, 'i')}).click();
  }

  /** Clears active announcement filters. */
  public async clearFilters(): Promise<void> {
    await this.page.getByRole('button', {name: /clear filters/i}).click();
  }

  /** Opens the announcement-create route. */
  public async gotoCreate(): Promise<void> {
    await this.gotoPath('/announcements/create');
  }

  /**
   * Creates an announcement through the create page.
   *
   * @param values - Announcement input values
   */
  public async createAnnouncement(values: {
    tournamentId: string;
    title: string;
    summary?: string;
    longText?: string;
    visibility?: 'PUBLIC' | 'PRIVATE';
    pin?: boolean;
    tags?: string[];
  }): Promise<void> {
    const tournamentSelect = this.page.locator('#tournament');
    await tournamentSelect.waitFor({state: 'visible'});
    const isTournamentLocked = await tournamentSelect.isDisabled();
    if (!isTournamentLocked) {
      await tournamentSelect.selectOption(values.tournamentId);
    }
    await this.page.locator('#title').fill(values.title);
    if (values.summary) {
      await this.page.locator('#summary').fill(values.summary);
    }
    if (values.longText) {
      await this.page.locator('#longText').fill(values.longText);
    }
    if (values.visibility) {
      await this.page.locator('#type').selectOption(values.visibility);
    }
    if (values.pin) {
      await this.page.locator('.form-checkbox').check();
    }
    for (const tag of values.tags ?? []) {
      await this.page.getByRole('button', {name: new RegExp(tag, 'i')}).click();
    }
    await this.page.getByRole('button', {name: /create announcement/i}).click();
    await this.waitForPageLoad();
  }

  /** Opens the first visible announcement detail modal. */
  public async openFirstAnnouncement(): Promise<void> {
    await this.page.locator('.announcement-card').first().click();
  }

  /**
   * Asserts that an announcement card with the given title is visible.
   *
   * @param title - Announcement title
   */
  public async expectAnnouncementVisible(title: string): Promise<void> {
    const announcementCard = this.page.locator('.announcement-card').filter({hasText: title}).first();

    for (let attempt = 0; attempt < 3; attempt += 1) {
      if (await announcementCard.isVisible().catch(() => false)) {
        return;
      }

      const hasTransientError = await this.errorFeedback
        .filter({hasText: /failed to load announcements|request failed with status code 429|too many requests/i})
        .first()
        .isVisible()
        .catch(() => false);

      if (!hasTransientError) {
        break;
      }

      await this.page.reload({waitUntil: 'domcontentloaded'});
      await this.waitForPageLoad();
    }

    await expect(announcementCard).toBeVisible();
  }
}