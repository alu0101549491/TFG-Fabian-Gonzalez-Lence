/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2026-03-13
 * @file e2e/fixtures/test.ts
 * @desc Shared Playwright fixtures for CPM E2E tests (POM wiring).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

// Leave exactly 1 blank line before imports

import {test as base, expect} from '@playwright/test';

import {ProjectListPage} from './page-objects/project-list.po';
import {ProjectDetailsPage} from './page-objects/project-details.po';

export interface PageObjects {
  readonly projectListPage: ProjectListPage;
  readonly projectDetailsPage: ProjectDetailsPage;
}

export const test = base.extend<PageObjects>({
  projectListPage: async ({page}, use) => {
    await use(new ProjectListPage(page));
  },

  projectDetailsPage: async ({page}, use) => {
    await use(new ProjectDetailsPage(page));
  },
});

export {expect};
