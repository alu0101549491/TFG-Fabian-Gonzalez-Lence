/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2026-03-13
 * @file e2e/fixtures/page-objects/project-list.po.ts
 * @desc Page Object Model for the Projects list view.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {expect, type Locator, type Page} from '@playwright/test';

export class ProjectListPage {
  public readonly page: Page;

  public constructor(page: Page) {
    this.page = page;
  }

  public async goto(): Promise<void> {
    await this.page.goto('projects');
    await expect(this.page.getByRole('heading', {name: 'Projects'})).toBeVisible();
  }

  public searchInput(): Locator {
    return this.page.getByLabel('Search projects');
  }

  public projectCardByCode(code: string): Locator {
    return this.page.locator('.project-card').filter({
      has: this.page.locator('.project-card-code-text', {hasText: code}),
    });
  }

  public async filterBySearch(text: string): Promise<void> {
    await this.searchInput().fill(text);
  }

  public async openActionsForProject(code: string): Promise<void> {
    const card = this.projectCardByCode(code);
    await expect(card).toBeVisible();
    await card.getByRole('button', {name: 'Project actions'}).click();
  }

  public async clickEditProject(code: string): Promise<void> {
    await this.openActionsForProject(code);
    await this.page
      .getByRole('button', {name: '✏️ Edit Project', exact: true})
      .click();
    await expect(this.page.getByRole('dialog')).toBeVisible();
  }

  public async clickDeleteProject(code: string): Promise<void> {
    await this.openActionsForProject(code);
    await this.page
      .getByRole('button', {name: '🗑️ Delete Project', exact: true})
      .click();
    await expect(this.page.getByRole('dialog')).toBeVisible();
  }

  public async confirmDeleteInModal(): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await dialog.getByRole('button', {name: 'Delete Project', exact: true}).click();
  }
}
