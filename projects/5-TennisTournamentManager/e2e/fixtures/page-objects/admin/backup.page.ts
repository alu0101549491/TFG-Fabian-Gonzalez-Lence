/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/fixtures/page-objects/admin/backup.page.ts
 * @desc Placeholder page object for pending backup-management routes.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {type Page} from '@playwright/test';
import {BasePage} from '../base.page';

/** Page object for a future `/admin/backup` route. */
export class BackupPage extends BasePage {
  public readonly url = '/admin/backup';

  public constructor(page: Page) {
    super(page);
  }
}