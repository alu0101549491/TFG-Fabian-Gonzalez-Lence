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
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import {ApiHelper, type Credentials} from '../helpers/api.helper';
import {TEST_USERS} from './test-data';

function findRepoRoot(startDir: string): string {
  let cur = startDir;
  const root = path.parse(cur).root;
  while (true) {
    if (existsSync(path.join(cur, 'package.json'))) return cur;
    if (cur === root) return process.cwd();
    cur = path.dirname(cur);
  }
}

function getAuthBaseDir(): string {
  try {
    const repoRoot = findRepoRoot(__dirname);
    return path.resolve(repoRoot, 'e2e', '.auth');
  } catch {
    return path.resolve(__dirname, '..', '.auth');
  }
}

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
  const authDir = getAuthBaseDir();
  const candidate = storageStateFile ?? path.join(authDir, `${credentials.email.replace(/[@.]/g, '_')}.json`);

  // Ensure auth directory exists
  await mkdir(path.dirname(candidate), {recursive: true}).catch(() => undefined);

  const appUrl = process.env.BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4200/5-TennisTournamentManager/';

  // Attempt to reuse an existing storage-state if it belongs to the requested
  // credentials and the JWT inside (if present) is not expired.
  try {
    const raw = await readFile(candidate, 'utf8');
    const parsed = JSON.parse(raw);
    const origins = Array.isArray(parsed.origins) ? parsed.origins : [];
    let foundEmail: string | null = null;
    let tokenValue: string | null = null;
    let parsedUser: any = null;

    for (const origin of origins) {
      const localStorage = Array.isArray(origin.localStorage) ? origin.localStorage : [];
      const appUser = localStorage.find((e: any) => e && e.name === 'app_user');
      if (appUser) {
        try {
          const user = JSON.parse(String(appUser.value));
          if (user && user.email) {
            foundEmail = user.email;
            parsedUser = user;
            // continue scanning for token
          }
        } catch {
          // ignore parse errors and continue
        }
      }

      const tokenEntry = localStorage.find((e: any) => e && e.name === 'tennis_jwt_token');
      if (tokenEntry && tokenEntry.value) {
        tokenValue = String(tokenEntry.value);
      }
    }

    if (foundEmail === credentials.email) {
      // Log reuse for easier debugging in CI/test runs
      // eslint-disable-next-line no-console
      console.log(`[auth.fixture] Reusing storage-state ${candidate} for ${credentials.email}`);

        if (!tokenValue) {
          // eslint-disable-next-line no-console
          console.log(`[auth.fixture] Storage-state ${candidate} has no tennis_jwt_token; will recreate for ${credentials.email}`);
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
            // Navigate to the app origin so localStorage access in the page
            // reflects the same origin as the stored entries. This makes the
            // subsequent presence check reliable instead of evaluating on
            // about:blank which may return false negatives.
            try {
              await page.goto(appUrl, {waitUntil: 'domcontentloaded'}).catch(() => undefined);
            } catch {
              // ignore navigation failures
            }

            // Ensure localStorage is set for the actual origin regardless of storage-state origin mismatch.
            // Use a one-time page evaluate rather than a persistent init script to avoid
            // re-inserting tokens after an explicit logout.
            if (tokenValue && parsedUser) {
              await page.evaluate((t, u) => {
                try { window.localStorage.setItem('tennis_jwt_token', t); } catch {}
                try { window.localStorage.setItem('app_user', JSON.stringify(u)); } catch {}
              }, tokenValue, parsedUser).catch(() => undefined);
            }
            try {
              const present = await page.evaluate(() => !!localStorage.getItem('tennis_jwt_token')).catch(() => false);
              // eslint-disable-next-line no-console
              console.log(`[auth.fixture] Returning context for ${credentials.email}; token present: ${present}`);
            } catch {
              // ignore
            }
            return {context, page};
          }

        // eslint-disable-next-line no-console
        console.log(`[auth.fixture] Storage-state ${candidate} contains expired token; will recreate for ${credentials.email}`);
      }
    }
  } catch {
    // Read/access failed — we'll proceed to login flow below.
  }

  // At this point we need to perform a login and create a fresh storage-state.
  const lockPath = `${candidate}.lock`;
  // Reduce wait timeout to fall back faster when lockers stall; globalSetup
  // should normally pre-create files so this path is rarely used.
  const waitTimeout = 10_000; // 10s
  const pollInterval = 100; // ms

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
        try {
          await page.goto(appUrl, {waitUntil: 'domcontentloaded'}).catch(() => undefined);
        } catch {
          // ignore navigation failures
        }
        if (session) {
          await page.evaluate((t, u) => {
            try { window.localStorage.setItem('tennis_jwt_token', t); } catch {}
            try { window.localStorage.setItem('app_user', JSON.stringify(u)); } catch {}
          }, session.token, session.user).catch(() => undefined);
        }
        return {context, page};
      } finally {
        await apiHelper.dispose();
      }
    }

    // Wait for the locker to finish and create the storage file
      const start = Date.now();
      let tokenVal: string | null = null;
      let userVal: any = null;
      while (Date.now() - start < waitTimeout) {
        try {
          const raw2 = await readFile(candidate, 'utf8');
          const parsed2 = JSON.parse(raw2);
          const origins2 = Array.isArray(parsed2.origins) ? parsed2.origins : [];
          for (const origin2 of origins2) {
            const localStorage2 = Array.isArray(origin2.localStorage) ? origin2.localStorage : [];
            const t = localStorage2.find((e: any) => e && e.name === 'tennis_jwt_token');
            const u = localStorage2.find((e: any) => e && e.name === 'app_user');
            if (t && t.value) tokenVal = String(t.value);
            if (u && u.value) {
              try {
                userVal = JSON.parse(String(u.value));
              } catch {
                userVal = String(u.value);
              }
            }
          }

          if (!tokenVal && !userVal) {
            // file might be partially written; wait and retry
            // eslint-disable-next-line no-await-in-loop
            await sleep(pollInterval);
            continue;
          }

          // We have parsed values — create context and inject the values on the page
          // (one-time evaluate) rather than via a persistent init script.
          // eslint-disable-next-line no-console
          console.log(`[auth.fixture] Detected storage-state ${candidate} created by locker`);
          const context = await browser.newContext({storageState: candidate});
          const page = await context.newPage();
          try {
            await page.goto(appUrl, {waitUntil: 'domcontentloaded'}).catch(() => undefined);
          } catch {
            // ignore navigation failures
          }
          if (tokenVal) {
            await page.evaluate((t, u) => {
              try { window.localStorage.setItem('tennis_jwt_token', t); } catch {}
              try { window.localStorage.setItem('app_user', JSON.stringify(u)); } catch {}
            }, tokenVal, userVal).catch(() => undefined);
          }
          try {
            const present = await page.evaluate(() => !!localStorage.getItem('tennis_jwt_token')).catch(() => false);
            // eslint-disable-next-line no-console
            console.log(`[auth.fixture] Returning context (from locker) for ${credentials.email}; token present: ${present}`);
          } catch {
            // ignore
          }
          return {context, page};
        } catch {
          // file still missing or not valid JSON yet
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
        try {
          await page.goto(appUrl, {waitUntil: 'domcontentloaded'}).catch(() => undefined);
        } catch {
          // ignore navigation failures
        }
        if (session) {
          await page.evaluate((t, u) => {
            try { window.localStorage.setItem('tennis_jwt_token', t); } catch {}
            try { window.localStorage.setItem('app_user', JSON.stringify(u)); } catch {}
          }, session.token, session.user).catch(() => undefined);
        }
        try {
          const present = await page.evaluate(() => !!localStorage.getItem('tennis_jwt_token')).catch(() => false);
          // eslint-disable-next-line no-console
          console.log(`[auth.fixture] Returning context (fallback) for ${credentials.email}; token present: ${present}`);
        } catch {
          // ignore
        }
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

/**
 * Extended Playwright fixture set with pre-authenticated contexts.
 */
export const test = base.extend<AuthFixtures>({
  sysAdminPage: async ({browser}, use) => {
    const file = path.join(getAuthBaseDir(), 'sysadmin.json');
    const result = await createAuthenticatedPage(browser, TEST_USERS.sysAdmin, file);
    if (!result) throw new Error('[auth.fixture] createAuthenticatedPage returned undefined for sysAdmin');
    const {context, page} = result;
    await use(page);
    await context.close();
  },
  tournamentAdminPage: async ({browser}, use) => {
    const file = path.join(getAuthBaseDir(), 'tournament-admin.json');
    const result = await createAuthenticatedPage(browser, TEST_USERS.tournamentAdmin1, file);
    if (!result) throw new Error('[auth.fixture] createAuthenticatedPage returned undefined for tournamentAdmin');
    const {context, page} = result;
    await use(page);
    await context.close();
  },
    participantPage: async ({browser}, use) => {
      const file = path.join(getAuthBaseDir(), 'participant1.json');
      const result = await createAuthenticatedPage(browser, TEST_USERS.participant1, file);
      if (!result) {
        throw new Error('[auth.fixture] createAuthenticatedPage returned undefined');
      }
      const {context, page} = result;
      await use(page);
      await context.close();
  },
  secondParticipantPage: async ({browser}, use) => {
    const file = path.join(getAuthBaseDir(), 'participant2.json');
    const result = await createAuthenticatedPage(browser, TEST_USERS.participant2, file);
    if (!result) throw new Error('[auth.fixture] createAuthenticatedPage returned undefined for secondParticipant');
    const {context, page} = result;
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