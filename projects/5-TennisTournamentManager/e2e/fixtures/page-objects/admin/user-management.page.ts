/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/fixtures/page-objects/admin/user-management.page.ts
 * @desc System-admin user-management page object.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {expect, type Page} from '@playwright/test';
import {BasePage} from '../base.page';

/** Page object for `/admin/users`. */
export class UserManagementPage extends BasePage {
  public readonly url = '/admin/users';

  public constructor(page: Page) {
    super(page);
  }

  /** Searches the user table. */
  public async search(query: string): Promise<void> {
    await this.page.getByRole('searchbox').fill(query);
  }

  /**
   * Filters by role.
   *
   * @param roleValue - Raw role enum value
   */
  public async filterByRole(roleValue: string): Promise<void> {
    await this.page.getByLabel(/filter by role/i).selectOption(roleValue);
  }

  /** Toggles the active-only checkbox filter. */
  public async toggleActiveOnly(): Promise<void> {
    await this.page.getByLabel(/show only active users/i).check();
  }

  /** Clears all visible user filters. */
  public async clearFilters(): Promise<void> {
    await this.page.getByRole('button', {name: /clear filters/i}).click();
  }

  /**
   * Creates a new user from the modal form.
   *
   * @param values - Create-user form values
   */
  public async createUser(values: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
    password: string;
  }): Promise<void> {
    await this.page.getByRole('button', {name: /new user/i}).click();
    const createUserModal = this.page.locator('.modal-content, .modal-container').filter({hasText: /create new user|create user/i}).first();
    await expect(createUserModal).toBeVisible();

    await createUserModal.locator('#username').fill(values.username);
    await createUserModal.locator('#email').fill(values.email);
    await createUserModal.locator('#firstName').fill(values.firstName);
    await createUserModal.locator('#lastName').fill(values.lastName);
    await createUserModal.locator('#role').selectOption(values.role);
    if (values.phone) {
      await createUserModal.locator('#phone').fill(values.phone);
    }
    await createUserModal.locator('#password').fill(values.password);
    await createUserModal.getByRole('button', {name: /create new user|create user/i}).click();
    await this.waitForPageLoad();
  }

  /** Opens the first matching edit action in the user table. */
  public async editFirstVisibleUser(): Promise<void> {
    await this.page.getByRole('button', {name: /edit/i}).first().click();
  }

  /** Deletes the first deletable visible user. */
  public async deleteFirstVisibleUser(): Promise<void> {
    await this.page.getByRole('button', {name: /delete/i}).first().click();
    await this.waitForPageLoad();
  }

  /**
   * Asserts that the user list contains a given identifier.
   *
   * @param text - Username, name, or email text
   */
  public async expectUserVisible(text: string): Promise<void> {
    const usersTable = this.page.locator('.users-table').filter({hasText: text});

    for (let attempt = 0; attempt < 3; attempt += 1) {
      if (await usersTable.isVisible().catch(() => false)) {
        return;
      }

      const hasTransientError = await this.errorFeedback
        .filter({hasText: /failed to load users|request failed with status code 429|too many requests/i})
        .first()
        .isVisible()
        .catch(() => false);

      if (!hasTransientError) {
        break;
      }

      await this.page.reload({waitUntil: 'domcontentloaded'});
      await this.waitForPageLoad();
    }

    await expect(usersTable).toBeVisible();
  }

  /** Asserts that the page is showing its no-results empty state. */
  public async expectEmptyState(): Promise<void> {
    await expect(this.page.getByText(/no users found/i)).toBeVisible();
  }
}