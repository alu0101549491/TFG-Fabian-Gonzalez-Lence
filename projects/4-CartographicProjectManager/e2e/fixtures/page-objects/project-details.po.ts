/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2026-03-13
 * @file e2e/fixtures/page-objects/project-details.po.ts
 * @desc Page Object Model for the Project details view (tabs + tasks).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {expect, type Locator, type Page} from '@playwright/test';

export class ProjectDetailsPage {
  public readonly page: Page;

  public constructor(page: Page) {
    this.page = page;
  }

  public async goto(projectId: string): Promise<void> {
    await this.page.goto(`projects/${projectId}`);
    await expect(this.page.getByRole('button', {name: 'Go back to projects list'})).toBeVisible();
  }

  public async openTasksTab(): Promise<void> {
    await this.page.getByRole('tab', {name: 'Tasks'}).click();
    await expect(this.page.getByRole('heading', {name: 'Tasks', exact: true})).toBeVisible();
  }

  public async clickNewTask(): Promise<void> {
    await this.page
      .locator('#tasks-panel .panel-actions')
      .getByRole('button', {name: '+ New Task'})
      .click();
    const dialog = this.page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('#create-task-title')).toBeVisible();
  }

  public taskCardByDescription(description: string): Locator {
    return this.page.locator('.task-card').filter({hasText: description});
  }
}
