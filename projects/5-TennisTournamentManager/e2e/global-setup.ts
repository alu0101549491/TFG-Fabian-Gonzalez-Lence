/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/global-setup.ts
 * @desc Global setup that prepares authenticated storage states for Playwright suites.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {mkdir, readdir, unlink} from 'node:fs/promises';
import path from 'node:path';
import {request, type FullConfig} from '@playwright/test';
import {ApiHelper} from './helpers/api.helper';
import {TEST_USERS} from './fixtures/test-data';

/**
 * Creates deterministic storage states for the most common authenticated actors.
 *
 * @param config - Playwright runtime configuration
 */
export default async function globalSetup(config: FullConfig): Promise<void> {
  const projectRoot = config.rootDir ?? process.cwd();
  // Playwright may set `rootDir` to the `e2e` folder already; handle both cases
  const authDirectory = path.basename(projectRoot) === 'e2e'
    ? path.join(projectRoot, '.auth')
    : path.join(projectRoot, 'e2e', '.auth');
  await mkdir(authDirectory, {recursive: true});
  // Cleanup any leftover lock files from previous runs which can cause
  // locker deadlocks when creating storage-state files.
  try {
    const files = await readdir(authDirectory).catch(() => [] as string[]);
    for (const f of files) {
      if (f.endsWith('.lock')) {
        try {
          await unlink(path.join(authDirectory, f));
        } catch {
          // ignore cleanup errors
        }
      }
    }
  } catch {
    // ignore
  }
  const apiBaseUrl = ApiHelper.resolveApiBaseUrl();

  const helper = new ApiHelper(await request.newContext({
    baseURL: apiBaseUrl,
    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  }));

  try {
    // Helper with retry/backoff for flaky startup or transient errors
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    async function persistWithRetries(credentials: typeof TEST_USERS.sysAdmin, dest: string) {
      const maxAttempts = 6;
      const baseDelay = 500; // ms
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        try {
          // eslint-disable-next-line no-console
          console.log(`[global-setup] Persisting storage-state for ${credentials.email} (attempt ${attempt + 1})`);
          await helper.persistStorageState(credentials, dest);
          // eslint-disable-next-line no-console
          console.log(`[global-setup] Storage-state written to ${dest}`);
          return;
        } catch (err: any) {
          const isLast = attempt + 1 >= maxAttempts;
          // eslint-disable-next-line no-console
          console.warn(`[global-setup] Persist attempt ${attempt + 1} failed for ${credentials.email}: ${err?.message || err}`);
          if (isLast) throw err;
          const jitter = Math.floor(Math.random() * baseDelay);
          const delay = baseDelay * Math.pow(2, attempt) + jitter;
          // eslint-disable-next-line no-await-in-loop
          await sleep(delay);
        }
      }
    }

    try {
      await persistWithRetries(TEST_USERS.sysAdmin, path.join(authDirectory, 'sysadmin.json'));
      await persistWithRetries(
        TEST_USERS.tournamentAdmin1,
        path.join(authDirectory, 'tournament-admin.json'),
      );
      await persistWithRetries(
        TEST_USERS.participant1,
        path.join(authDirectory, 'participant1.json'),
      );
      await persistWithRetries(
        TEST_USERS.participant2,
        path.join(authDirectory, 'participant2.json'),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Failed to prepare Playwright auth storage states against ${apiBaseUrl}/api. ` +
        `Ensure the Tennis backend is running and reachable, or set PLAYWRIGHT_API_BASE_URL. ` +
        `Original error: ${message}`,
      );
    }
  } finally {
    await helper.dispose();
  }
}