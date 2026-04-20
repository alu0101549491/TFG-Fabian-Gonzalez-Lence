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

import {mkdir} from 'node:fs/promises';
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
  const projectRoot = config.rootDir;
  const authDirectory = path.join(projectRoot, 'e2e', '.auth');
  await mkdir(authDirectory, {recursive: true});
  const apiBaseUrl = ApiHelper.resolveApiBaseUrl();

  const helper = new ApiHelper(await request.newContext({
    baseURL: apiBaseUrl,
    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  }));

  try {
    try {
      await helper.persistStorageState(TEST_USERS.sysAdmin, path.join(authDirectory, 'sysadmin.json'));
      await helper.persistStorageState(
        TEST_USERS.tournamentAdmin1,
        path.join(authDirectory, 'tournament-admin.json'),
      );
      await helper.persistStorageState(
        TEST_USERS.participant1,
        path.join(authDirectory, 'participant1.json'),
      );
      await helper.persistStorageState(
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