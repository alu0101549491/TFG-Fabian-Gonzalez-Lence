/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2026-03-13
 * @file e2e/setup/global-setup.ts
 * @desc Global Playwright setup that generates authenticated storage states.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

import {type FullConfig, type Page} from '@playwright/test';
import {chromium} from 'playwright';

import {DEV_ACCOUNTS, login, register} from '../helpers/auth';
import {
  AUTH_STATE_ADMIN_PATH,
  AUTH_STATE_NON_ADMIN_PATH,
  getUiBaseUrl,
} from '../helpers/e2e-paths.ts';

const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'cpm_access_token',
  REFRESH_TOKEN: 'cpm_refresh_token',
  USER: 'cpm_user',
  EXPIRES_AT: 'cpm_expires_at',
} as const;

async function persistSessionAuthToLocalStorage(page: Page): Promise<void> {
  await page.evaluate((keys) => {
    for (const key of Object.values(keys)) {
      const value = window.sessionStorage.getItem(key);
      if (value !== null) {
        window.localStorage.setItem(key, value);
      }
    }
  }, AUTH_STORAGE_KEYS);
}

async function loginAsNonAdmin(page: Page): Promise<void> {
  const candidates = [DEV_ACCOUNTS.CLIENT, DEV_ACCOUNTS.SPECIAL];
  for (const credentials of candidates) {
    try {
      await login(page, credentials);
      return;
    } catch {
      // Try next candidate.
    }
  }

  const fallbackEmail =
    process.env.PW_E2E_NON_ADMIN_EMAIL || 'pw-e2e-non-admin@example.com';
  const fallbackPassword =
    process.env.PW_E2E_NON_ADMIN_PASSWORD || 'pw-e2e-non-admin';
  const fallbackUsername =
    process.env.PW_E2E_NON_ADMIN_USERNAME || 'pw-e2e-non-admin';

  try {
    await login(page, {email: fallbackEmail, password: fallbackPassword});
    return;
  } catch {
    // Try creating it if it doesn't exist.
  }

  try {
    await register(page, {
      username: fallbackUsername,
      email: fallbackEmail,
      password: fallbackPassword,
    });
    return;
  } catch {
    // If registration failed due to duplication or transient UI errors, try login again.
  }

  await login(page, {email: fallbackEmail, password: fallbackPassword});
}

export default async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = getUiBaseUrl(config);

  fs.mkdirSync(path.dirname(AUTH_STATE_ADMIN_PATH), {recursive: true});

  const browser = await chromium.launch();

  try {
    // Admin state
    {
      const page = await browser.newPage({baseURL});
      await page.goto('login');
      await login(page, DEV_ACCOUNTS.ADMIN);
      await persistSessionAuthToLocalStorage(page);
      await page.context().storageState({path: AUTH_STATE_ADMIN_PATH});
      await page.close();
    }

    // Non-admin state
    {
      const page = await browser.newPage({baseURL});
      await page.goto('login');
      await loginAsNonAdmin(page);
      await persistSessionAuthToLocalStorage(page);
      await page.context().storageState({path: AUTH_STATE_NON_ADMIN_PATH});
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
