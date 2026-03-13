/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2026-03-13
 * @file e2e/setup/global-teardown.ts
 * @desc Global teardown hook for Playwright E2E (cleans up Playwright-created users).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {request} from '@playwright/test';

import {CpmApiClient} from '../helpers/api';
import {DEV_ACCOUNTS} from '../helpers/auth';
import {getApiBaseUrl} from '../helpers/e2e-paths.ts';

const TEST_USERNAME_PREFIXES = ['pw-', 'client-pw-'] as const;
const TEST_EMAIL_SUFFIX = '@example.com';

function isPlaywrightUser(user: {username: string; email: string}): boolean {
  if (!user.email.endsWith(TEST_EMAIL_SUFFIX)) return false;
  return TEST_USERNAME_PREFIXES.some((prefix) => user.username.startsWith(prefix));
}

export default async function globalTeardown(): Promise<void> {
  const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

  try {
    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);
    const users = await adminApi.listUsers();

    const fallbackEmail =
      process.env.PW_E2E_NON_ADMIN_EMAIL || 'pw-e2e-non-admin@example.com';

    const protectedEmails = new Set<string>([
      DEV_ACCOUNTS.ADMIN.email,
      DEV_ACCOUNTS.CLIENT.email,
      DEV_ACCOUNTS.SPECIAL.email,
      fallbackEmail,
    ]);

    const candidates = users.filter(
      (user) => isPlaywrightUser(user) && !protectedEmails.has(user.email),
    );

    for (const user of candidates) {
      try {
        await adminApi.deleteUser(user.id);
      } catch (error) {
        // Best-effort cleanup: never fail the suite because a user could not be deleted.
        // eslint-disable-next-line no-console
        console.warn(`[e2e teardown] Failed to delete user ${user.email}:`, error);
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[e2e teardown] Cleanup skipped due to error:', error);
  } finally {
    await apiContext.dispose();
  }
}
