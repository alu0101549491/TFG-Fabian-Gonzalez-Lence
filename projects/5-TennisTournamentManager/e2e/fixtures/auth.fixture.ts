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

import path from 'node:path';
import {test as base, type Page} from '@playwright/test';

type AuthFixtures = {
  sysAdminPage: Page;
  tournamentAdminPage: Page;
  participantPage: Page;
  secondParticipantPage: Page;
  publicPage: Page;
};

const AUTH_DIRECTORY = path.join(process.cwd(), 'e2e', '.auth');

/**
 * Extended Playwright fixture set with pre-authenticated contexts.
 */
export const test = base.extend<AuthFixtures>({
  sysAdminPage: async ({browser}, use) => {
    const context = await browser.newContext({
      storageState: path.join(AUTH_DIRECTORY, 'sysadmin.json'),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  tournamentAdminPage: async ({browser}, use) => {
    const context = await browser.newContext({
      storageState: path.join(AUTH_DIRECTORY, 'tournament-admin.json'),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  participantPage: async ({browser}, use) => {
    const context = await browser.newContext({
      storageState: path.join(AUTH_DIRECTORY, 'participant1.json'),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  secondParticipantPage: async ({browser}, use) => {
    const context = await browser.newContext({
      storageState: path.join(AUTH_DIRECTORY, 'participant2.json'),
    });
    const page = await context.newPage();
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