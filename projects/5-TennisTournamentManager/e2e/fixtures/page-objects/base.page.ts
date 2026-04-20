/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/fixtures/page-objects/base.page.ts
 * @desc Base Page Object for Playwright tests adapted to the real Tennis Tournament Manager shell.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {expect, type Locator, type Page} from '@playwright/test';

/**
 * Shared page-object functionality for all Playwright pages.
 */
export abstract class BasePage {
  public readonly page: Page;
  public readonly header: Locator;
  public readonly userMenuTrigger: Locator;
  public readonly notificationBellButton: Locator;
  public readonly modalOverlay: Locator;
  protected readonly loadingIndicators: Locator;
  protected readonly successFeedback: Locator;
  protected readonly errorFeedback: Locator;

  public abstract readonly url: string;

  public constructor(page: Page) {
    this.page = page;
    this.header = page.locator('header.app-header');
    this.userMenuTrigger = page.locator('.user-menu-toggle');
    this.notificationBellButton = page.locator('.bell-button');
    this.modalOverlay = page.locator('.modal-overlay');
    this.loadingIndicators = page.locator('.spinner, .loading-spinner');
    this.successFeedback = page.locator(
      '.success-message, .success-banner, .alert-success, .error-banner + .success-message',
    );
    this.errorFeedback = page.locator(
      '.error-message, .error-banner, .error-container, .alert-error, .error-state',
    );
  }

  /**
   * Navigates to the page's default route.
   */
  public async goto(): Promise<void> {
    await this.gotoPath(this.url);
  }

  /**
   * Navigates to an arbitrary route and waits for the page to settle.
   *
   * @param route - Route relative to the configured Playwright base URL
   */
  public async gotoPath(route: string): Promise<void> {
    await this.page.goto(route);
    await this.waitForPageLoad();
  }

  /**
   * Waits for the current page to finish its initial loading work.
   */
  public async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle').catch(() => undefined);

    const spinnerCount = await this.loadingIndicators.count();
    for (let index = 0; index < spinnerCount; index += 1) {
      await this.loadingIndicators.nth(index).waitFor({state: 'hidden', timeout: 10000}).catch(() => undefined);
    }
  }

  /**
   * Asserts that a success banner or message is visible.
   *
   * @param text - Optional partial text assertion
   */
  public async expectSuccess(text?: string): Promise<void> {
    await expect(this.successFeedback.first()).toBeVisible();
    if (text) {
      await expect(this.successFeedback.first()).toContainText(text);
    }
  }

  /**
   * Asserts that an error banner or message is visible.
   *
   * @param text - Optional partial text assertion
   */
  public async expectError(text?: string): Promise<void> {
    await expect(this.errorFeedback.first()).toBeVisible();
    if (text) {
      await expect(this.errorFeedback.first()).toContainText(text);
    }
  }

  /**
   * Opens the user dropdown menu if it is available.
   */
  public async openUserMenu(): Promise<void> {
    await expect(this.userMenuTrigger).toBeVisible();
    await this.userMenuTrigger.click();
  }

  /**
   * Signs out using the header dropdown menu.
   */
  public async logout(): Promise<void> {
    await this.openUserMenu();
    await this.page.getByRole('button', {name: /logout/i}).click();
    await this.waitForPageLoad();
  }

  /**
   * Opens the header notification dropdown.
   */
  public async openNotificationBell(): Promise<void> {
    await expect(this.notificationBellButton).toBeVisible();
    await this.notificationBellButton.click();
  }

  /**
   * Wires the next browser dialog to be accepted automatically.
   *
   * @param promptText - Optional prompt text for prompt dialogs
   */
  public async acceptNextDialog(promptText?: string): Promise<void> {
    this.page.once('dialog', async (dialog) => {
      await dialog.accept(promptText);
    });
  }

  /**
   * Wires the next browser dialog to be dismissed automatically.
   */
  public async dismissNextDialog(): Promise<void> {
    this.page.once('dialog', async (dialog) => {
      await dialog.dismiss();
    });
  }
}