/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2026-03-13
 * @file e2e/critical/security.spec.ts
 * @desc Critical E2E security checks (data isolation and unauthorized access).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

// Leave exactly 1 blank line before imports

import {request} from '@playwright/test';

import {test, expect} from '../fixtures/test';
import {CpmApiClient} from '../helpers/api';
import {getApiBaseUrl} from '../helpers/e2e-paths.ts';
import {uniqueNonce, daysFromToday} from '../helpers/test-data';
import {DEV_ACCOUNTS} from '../helpers/auth';

test.describe('Security (critical)', () => {
  test('SEC-003: client cannot access another client’s project details by URL', async ({page}) => {
    const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);

    const nonce = uniqueNonce('pw-sec-003');

    const clientA = await adminApi.register({
      username: `pw-sec-a-${nonce.slice(-8)}`,
      email: `pw-sec-a-${nonce}@example.com`,
      password: `pw-sec-${nonce}`,
    });

    const clientB = await adminApi.register({
      username: `pw-sec-b-${nonce.slice(-8)}`,
      email: `pw-sec-b-${nonce}@example.com`,
      password: `pw-sec-${nonce}`,
    });

    const project = await adminApi.createProject({
      year: new Date().getFullYear(),
      code: `PW-SEC-${nonce.slice(-8)}`,
      name: `PW Security Isolation ${nonce}`,
      clientId: clientB.user.id,
      type: 'GIS',
      coordinateX: null,
      coordinateY: null,
      contractDate: daysFromToday(0).toISOString(),
      deliveryDate: daysFromToday(10).toISOString(),
    });

    try {
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await page.addInitScript(
        ({accessToken, refreshToken, user, expiresAt: expiresAtValue}) => {
          window.sessionStorage.setItem('cpm_access_token', accessToken);
          window.sessionStorage.setItem('cpm_refresh_token', refreshToken);
          window.sessionStorage.setItem('cpm_user', JSON.stringify(user));
          window.sessionStorage.setItem('cpm_expires_at', expiresAtValue);
        },
        {
          accessToken: clientA.accessToken,
          refreshToken: clientA.refreshToken,
          user: clientA.user,
          expiresAt,
        },
      );

      await page.goto(`projects/${project.id}`);
      await expect(page).toHaveURL(new RegExp(`/projects/${project.id}(\\?|$)`));

      // The app intentionally enforces project authorization server-side; the UI should fail closed.
      await expect(page.getByRole('heading', {name: 'Project not found'})).toBeVisible();
      await expect(page.getByRole('button', {name: 'Go Back'})).toBeVisible();
      await expect(page.getByRole('tab')).toHaveCount(0);
    } finally {
      try {
        await adminApi.deleteProject(project.id);
      } catch {
        // Ignore.
      }
      try {
        await adminApi.deleteUser(clientA.user.id);
      } catch {
        // Ignore.
      }
      try {
        await adminApi.deleteUser(clientB.user.id);
      } catch {
        // Ignore.
      }
      await apiContext.dispose();
    }
  });
});
