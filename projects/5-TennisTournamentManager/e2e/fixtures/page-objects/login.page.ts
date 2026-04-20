/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/fixtures/page-objects/login.page.ts
 * @desc Login page object for the Tennis Tournament Manager.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {expect, type Locator, type Page} from '@playwright/test';
import {BasePage} from './base.page';

/**
 * Page object for `/login`.
 */
export class LoginPage extends BasePage {
  public readonly url = '/login';
  public readonly emailInput: Locator;
  public readonly passwordInput: Locator;
  public readonly submitButton: Locator;

  public constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.getByRole('button', {name: /log(?:ging)? in|login/i});
  }

  /**
   * Performs a UI login.
   *
   * @param email - Account email
   * @param password - Account password
   */
  public async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Checks that the register link is available.
   */
  public async expectRegisterLink(): Promise<void> {
    await expect(this.page.getByRole('link', {name: /register here/i})).toBeVisible();
  }
}