/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/fixtures/auth.fixture.ts
 * @desc Shared Playwright fixtures for authenticated and unauthenticated browser contexts.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {test as base, type Browser, type BrowserContext, type Page} from '@playwright/test';
import {ApiHelper, type Credentials} from '../helpers/api.helper';
import {TEST_USERS} from './test-data';

type AuthFixtures = {
  sysAdminPage: Page;
  tournamentAdminPage: Page;
  participantPage: Page;
  secondParticipantPage: Page;
  publicPage: Page;
};

async function createAuthenticatedPage(
  browser: Browser,
  credentials: Credentials,
): Promise<{context: BrowserContext; page: Page}> {
  const apiHelper = await ApiHelper.create();

  try {
    const session = await apiHelper.login(credentials);
    const context = await browser.newContext({
      storageState: apiHelper.buildStorageState(session),
    });
    const page = await context.newPage();
    return {context, page};
  } finally {
    await apiHelper.dispose();
  }
}

/**
 * Extended Playwright fixture set with pre-authenticated contexts.
 */
export const test = base.extend<AuthFixtures>({
  sysAdminPage: async ({browser}, use) => {
    const {context, page} = await createAuthenticatedPage(browser, TEST_USERS.sysAdmin);
    await use(page);
    await context.close();
  },
  tournamentAdminPage: async ({browser}, use) => {
    const {context, page} = await createAuthenticatedPage(browser, TEST_USERS.tournamentAdmin1);
    await use(page);
    await context.close();
  },
  participantPage: async ({browser}, use) => {
    const {context, page} = await createAuthenticatedPage(browser, TEST_USERS.participant1);
    await use(page);
    await context.close();
  },
  secondParticipantPage: async ({browser}, use) => {
    const {context, page} = await createAuthenticatedPage(browser, TEST_USERS.participant2);
    await use(page);
    await context.close();
  },
  publicPage: async ({browser}, use) => {
    const context = await browser.newContext({
      storageState: {cookies: [], origins: []},
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export {expect} from '@playwright/test';