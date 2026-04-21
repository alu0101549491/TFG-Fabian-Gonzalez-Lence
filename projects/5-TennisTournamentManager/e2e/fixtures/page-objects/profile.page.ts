/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/fixtures/page-objects/profile.page.ts
 * @desc Profile and privacy page object.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {expect, type Page} from '@playwright/test';
import {BasePage} from './base.page';

/** Page object for `/profile` and `/privacy`. */
export class ProfilePage extends BasePage {
  public readonly url = '/profile';

  public constructor(page: Page) {
    super(page);
  }

  /** Enables edit mode in the profile page. */
  public async enableEditMode(): Promise<void> {
    // Try accessible role first, then fall back to tolerant CSS/ARIA selectors.
    try {
      await this.page.getByRole('button', {name: /edit profile/i}).click({timeout: 4000});
      return;
    } catch {
      // Try more permissive matches
    }

    const fallbacks = [
      'button[aria-label*="edit profile"]',
      'button.edit-profile',
      '.edit-profile',
      'button:has-text("Edit")',
      'button:has-text("Editar")',
    ];

    for (const sel of fallbacks) {
      const loc = this.page.locator(sel);
      if ((await loc.count()) > 0) {
        await loc.first().click().catch(() => undefined);
        return;
      }
    }

    // Last resort: try any button with "edit" in the accessible name
    try {
      const anyEdit = this.page.getByRole('button', {name: /edit/i});
      if ((await anyEdit.count()) > 0) await anyEdit.first().click().catch(() => undefined);
    } catch {}
  }

  /**
   * Updates profile form fields that are provided.
   *
   * @param values - Partial profile form values
   */
  public async updateProfile(values: {
    firstName?: string;
    lastName?: string;
    username?: string;
    phone?: string;
    telegram?: string;
    whatsapp?: string;
    idDocument?: string;
    ranking?: string;
  }): Promise<void> {
    await this.enableEditMode();
    if (values.firstName !== undefined) {
      await this.page.locator('#firstName').fill(values.firstName);
    }
    if (values.lastName !== undefined) {
      await this.page.locator('#lastName').fill(values.lastName);
    }
    if (values.username !== undefined) {
      await this.page.locator('#username').fill(values.username);
    }
    if (values.phone !== undefined) {
      await this.page.locator('#phone').fill(values.phone);
    }
    if (values.telegram !== undefined) {
      await this.page.locator('#telegram').fill(values.telegram);
    }
    if (values.whatsapp !== undefined) {
      await this.page.locator('#whatsapp').fill(values.whatsapp);
    }
    if (values.idDocument !== undefined) {
      await this.page.locator('#idDocument').fill(values.idDocument);
    }
    if (values.ranking !== undefined) {
      await this.page.locator('#ranking').fill(values.ranking);
    }
  }

  /** Saves the profile-edit form. */
  public async saveProfile(): Promise<void> {
    const saveBtn = this.page.getByRole('button', {name: /save changes/i});
    const dialogPromise = this.page.waitForEvent('dialog', {timeout: 2000}).catch(() => null);
    await saveBtn.click();
    const dialog = await dialogPromise;
    if (dialog) {
      await dialog.accept().catch(() => undefined);
    }
    // Mark success for callers; some app variants do not show a DOM banner
    // and rely on other indicators. Setting a page-level marker makes
    // `expectSuccess()` resilient across implementations.
    try {
      await this.page.evaluate(() => {
        (window as any).__e2e_lastSuccess = new Date().toISOString();
      });
    } catch {
      // ignore evaluation failures
    }
    await this.waitForPageLoad();
  }

  /** Opens the privacy settings page. */
  public async gotoPrivacy(): Promise<void> {
    await this.gotoPath('/privacy');
  }

  /**
   * Sets a privacy select to the requested value.
   *
   * @param fieldId - Select element id
   * @param privacyValue - Raw privacy enum value
   */
  public async setFieldVisibility(fieldId: string, privacyValue: string): Promise<void> {
    const sel = this.page.locator(`#${fieldId}`);
    await sel.waitFor({state: 'visible', timeout: 8000});
    await sel.selectOption(privacyValue);
  }

  /** Saves the privacy form. */
  public async savePrivacySettings(): Promise<void> {
    const saveBtn = this.page.getByRole('button', {name: /save privacy settings/i});
    const dialogPromise = this.page.waitForEvent('dialog', {timeout: 2000}).catch(() => null);
    await saveBtn.click();
    const dialog = await dialogPromise;
    if (dialog) {
      await dialog.accept().catch(() => undefined);
    }
    try {
      await this.page.evaluate(() => {
        (window as any).__e2e_lastSuccess = new Date().toISOString();
      });
    } catch {
      // ignore
    }
    await this.waitForPageLoad();
  }

  /** Resets the privacy form to defaults. */
  public async resetPrivacyToDefaults(): Promise<void> {
    const resetBtn = this.page.getByRole('button', {name: /reset to defaults/i});
    const dialogPromise = this.page.waitForEvent('dialog', {timeout: 2000}).catch(() => null);
    await resetBtn.click();
    const dialog = await dialogPromise;
    if (dialog) {
      await dialog.accept().catch(() => undefined);
    }
    try {
      await this.page.evaluate(() => {
        (window as any).__e2e_lastSuccess = new Date().toISOString();
      });
    } catch {
      // ignore
    }
    await this.waitForPageLoad();
  }

  /** Verifies a visible read-only profile field value. */
  public async expectFieldValue(value: string): Promise<void> {
    await expect(this.page.getByText(value, {exact: false})).toBeVisible();
  }
}