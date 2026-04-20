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
import {mkdir, writeFile, access, unlink, readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
  storageStateFile?: string,
): Promise<{context: BrowserContext; page: Page}> {
  const authDir = path.resolve(__dirname, '..', '.auth');
  const candidate = storageStateFile ?? path.join(authDir, `${credentials.email.replace(/[@.]/g, '_')}.json`);

  // If a precomputed storage state exists (created by globalSetup), verify
  // it belongs to the requested credentials before reusing it.
  try {
    await access(candidate);
    try {
      const raw = await readFile(candidate, 'utf8');
      const parsed = JSON.parse(raw);
      const origins = Array.isArray(parsed.origins) ? parsed.origins : [];
      let foundEmail: string | null = null;
      for (const origin of origins) {
        const localStorage = Array.isArray(origin.localStorage) ? origin.localStorage : [];
        const appUser = localStorage.find((e: any) => e && e.name === 'app_user');
        if (appUser) {
          try {
            const user = JSON.parse(String(appUser.value));
            if (user && user.email) {
              foundEmail = user.email;
              break;
            }
          } catch {
            // ignore parse errors and continue
          }
        }
      }

      if (foundEmail === credentials.email) {
        // Log reuse for easier debugging in CI/test runs
        // eslint-disable-next-line no-console
        console.log(`[auth.fixture] Reusing storage-state ${candidate} for ${credentials.email}`);

        // Inspect the parsed storage-state file for a token value and attempt
        // to decode any JWT expiry to avoid reusing expired sessions.
        try {
          let tokenValue: string | null = null;
          for (const origin of origins) {
            const localStorage = Array.isArray(origin.localStorage) ? origin.localStorage : [];
            const tokenEntry = localStorage.find((e: any) => e && e.name === 'tennis_jwt_token');
            if (tokenEntry && tokenEntry.value) {
              tokenValue = String(tokenEntry.value);
              break;
            }
          }

          if (!tokenValue) {
            // eslint-disable-next-line no-console
            console.log(`[auth.fixture] Storage-state ${candidate} has no tennis_jwt_token; recreating for ${credentials.email}`);
          } else {
            // If token appears to be a JWT, attempt to decode expiry and skip
            // reuse when the token is expired or about to expire.
            let expired = false;
            const parts = tokenValue.split('.');
            if (parts.length === 3) {
              try {
                const payload = parts[1];
                let padded = payload.replace(/-/g, '+').replace(/_/g, '/');
                while (padded.length % 4) padded += '=';
                const decoded = Buffer.from(padded, 'base64').toString('utf8');
                const parsedPayload = JSON.parse(decoded);
                const exp = parsedPayload.exp as number | undefined;
                if (typeof exp === 'number') {
                  const now = Math.floor(Date.now() / 1000);
                  if (exp < now + 15) expired = true;
                }
              } catch {
                // ignore decode errors and assume token is usable
              }
            }

            if (!expired) {
              // Token present and not expired — create the context and return it.
              const context = await browser.newContext({storageState: candidate});
              const page = await context.newPage();
              return {context, page};
            }

            // eslint-disable-next-line no-console
            console.log(`[auth.fixture] Storage-state ${candidate} contains expired token; recreating for ${credentials.email}`);
          }
        } catch (err) {
          // If anything goes wrong parsing the file, fall through to recreate
          // eslint-disable-next-line no-console
          console.log(`[auth.fixture] Error inspecting storage-state ${candidate}; recreating for ${credentials.email}`, err);
        }
      }
      // If the stored file does not match the expected email, fall through
      // to the lock/login flow so a fresh, correct storage-state is created.
    } catch {
      // If we can't read/parse the candidate file, proceed to recreate it.
    }
  } catch {
    // If missing, use a filesystem lock so only one worker performs the API login.
    const lockPath = `${candidate}.lock`;
    const waitTimeout = 60_000; // 60s
    const pollInterval = 250; // ms

    // Ensure auth directory exists before trying to create lock
    await mkdir(path.dirname(candidate), {recursive: true});

    // Local sleep helper
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    let haveLock = false;
    try {
      // Try to acquire the lock atomically
      try {
        await writeFile(lockPath, String(process.pid), {flag: 'wx'});
        haveLock = true;
      } catch {
        haveLock = false;
      }

      if (haveLock) {
        // eslint-disable-next-line no-console
        console.log(`[auth.fixture] Acquired lock and performing login for ${credentials.email}`);
        const apiHelper = await ApiHelper.create();
        try {
          const session = await apiHelper.login(credentials);
          const storageState = apiHelper.buildStorageState(session);
          await writeFile(candidate, JSON.stringify(storageState, null, 2), 'utf8');

          const context = await browser.newContext({storageState: candidate});
          const page = await context.newPage();
          return {context, page};
        } finally {
          await apiHelper.dispose();
        }
      }

      // Wait for the locker to finish and create the storage file
      const start = Date.now();
      while (Date.now() - start < waitTimeout) {
        try {
          await access(candidate);
          // eslint-disable-next-line no-console
          console.log(`[auth.fixture] Detected storage-state ${candidate} created by locker`);
          const context = await browser.newContext({storageState: candidate});
          const page = await context.newPage();
          return {context, page};
        } catch {
          // file still missing, wait a bit
          // eslint-disable-next-line no-await-in-loop
          await sleep(pollInterval);
        }
      }

      // Timeout: attempt to take the lock one last time and perform login
      try {
        await writeFile(lockPath, String(process.pid), {flag: 'wx'});
        haveLock = true;
      } catch {
        haveLock = false;
      }

      if (haveLock) {
        // eslint-disable-next-line no-console
        console.log(`[auth.fixture] Timeout fallback: acquired lock and performing login for ${credentials.email}`);
        const apiHelper = await ApiHelper.create();
        try {
          const session = await apiHelper.login(credentials);
          const storageState = apiHelper.buildStorageState(session);
          await writeFile(candidate, JSON.stringify(storageState, null, 2), 'utf8');

          const context = await browser.newContext({storageState: candidate});
          const page = await context.newPage();
          return {context, page};
        } finally {
          await apiHelper.dispose();
        }
      }

      throw new Error(
        `Failed to obtain storage-state ${candidate} after waiting ${waitTimeout}ms. ` +
        `Ensure Playwright globalSetup ran and the backend is reachable, or run tests with fewer workers.`
      );
    } finally {
      // Remove lock if we acquired it
      if (haveLock) {
        try {
          await unlink(lockPath);
        } catch {
          // ignore
        }
      }
    }
  }
}

/**
 * Extended Playwright fixture set with pre-authenticated contexts.
 */
export const test = base.extend<AuthFixtures>({
  sysAdminPage: async ({browser}, use) => {
    const file = path.resolve(__dirname, '..', '.auth', 'sysadmin.json');
    const {context, page} = await createAuthenticatedPage(browser, TEST_USERS.sysAdmin, file);
    await use(page);
    await context.close();
  },
  tournamentAdminPage: async ({browser}, use) => {
    const file = path.resolve(__dirname, '..', '.auth', 'tournament-admin.json');
    const {context, page} = await createAuthenticatedPage(browser, TEST_USERS.tournamentAdmin1, file);
    await use(page);
    await context.close();
  },
  participantPage: async ({browser}, use) => {
    const file = path.resolve(__dirname, '..', '.auth', 'participant1.json');
    const {context, page} = await createAuthenticatedPage(browser, TEST_USERS.participant1, file);
    await use(page);
    await context.close();
  },
  secondParticipantPage: async ({browser}, use) => {
    const file = path.resolve(__dirname, '..', '.auth', 'participant2.json');
    const {context, page} = await createAuthenticatedPage(browser, TEST_USERS.participant2, file);
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