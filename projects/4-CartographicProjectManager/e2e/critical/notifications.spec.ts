/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2026-03-15
 * @file e2e/critical/notifications.spec.ts
 * @desc Critical E2E coverage for optional WhatsApp sandbox notifications.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

// Leave exactly 1 blank line before imports

import {request, type APIRequestContext} from '@playwright/test';

import {test, expect} from '../fixtures/test';
import {CpmApiClient} from '../helpers/api';
import {AUTH_STATE_ADMIN_PATH, getApiBaseUrl} from '../helpers/e2e-paths.ts';
import {uniqueNonce, daysFromToday} from '../helpers/test-data';
import {DEV_ACCOUNTS} from '../helpers/auth';

interface BackendApiEnvelope<T> {
  readonly success: boolean;
  readonly data: T;
  readonly message?: string;
}

/**
 * Clears and reads WhatsApp sandbox outbox for deterministic assertions.
 */
class WhatsAppSandboxApi {
  private readonly apiContext: APIRequestContext;
  private readonly accessToken: string;

  public constructor(apiContext: APIRequestContext, accessToken: string) {
    this.apiContext = apiContext;
    this.accessToken = accessToken;
  }

  private authHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.accessToken}`,
    };
  }

  public async clearOutbox(toUserId: string): Promise<number> {
    const response = await this.apiContext.delete(
      `whatsapp/sandbox/outbox?toUserId=${encodeURIComponent(toUserId)}`,
      {headers: this.authHeaders()},
    );

    const body = (await response.json()) as BackendApiEnvelope<{cleared: number}>;
    return body.data?.cleared ?? 0;
  }

  public async listOutbox(toUserId: string): Promise<Array<any>> {
    const response = await this.apiContext.get(
      `whatsapp/sandbox/outbox?toUserId=${encodeURIComponent(toUserId)}`,
      {headers: this.authHeaders()},
    );

    const body = (await response.json()) as BackendApiEnvelope<Array<any>>;
    return Array.isArray(body.data) ? body.data : [];
  }
}

test.describe('Notifications (critical)', () => {
  async function resolveClientId(adminApi: CpmApiClient): Promise<string> {
    const clients = await adminApi.listUsers('CLIENT');
    const preferred = clients.find(
      (user) => user.email.toLowerCase() === DEV_ACCOUNTS.CLIENT.email.toLowerCase(),
    );
    const fallback = clients[0];
    if (!preferred && !fallback) {
      throw new Error('No CLIENT users available in the database for seeding projects');
    }
    return (preferred || fallback).id;
  }

  test.describe('as admin', () => {
    test.use({storageState: AUTH_STATE_ADMIN_PATH});

    test('NOTIF-008: WhatsApp sandbox message sent on task assignment when enabled',
      async ({page, projectDetailsPage}) => {
        const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

        const {client: adminApi, session: adminSession} = await CpmApiClient.login(
          apiContext,
          DEV_ACCOUNTS.ADMIN,
        );

        const sandboxApi = new WhatsAppSandboxApi(apiContext, adminSession.accessToken);

        const nonce = uniqueNonce('pw-notif-008');
        const clientId = await resolveClientId(adminApi);
        const project = await adminApi.createProject({
          year: new Date().getFullYear(),
          code: `PW-NOTIF-${nonce.slice(-8)}`,
          name: `PW WhatsApp Sandbox ${nonce}`,
          clientId,
          type: 'GIS',
          coordinateX: null,
          coordinateY: null,
          contractDate: daysFromToday(0).toISOString(),
          deliveryDate: daysFromToday(10).toISOString(),
        });

        const description = `PW WhatsApp Task ${nonce.slice(-10)}`;

        try {
          // Enable WhatsApp notifications in Settings (local preference).
          await page.goto('settings');

          const whatsappToggle = page
            .locator('label.checkbox-label', {hasText: 'WhatsApp Notifications (Optional)'})
            .locator('input[type="checkbox"]');
          await whatsappToggle.check();

          await page.getByRole('button', {name: 'Save Preferences'}).click();
          await expect(page.getByText('Notification preferences saved locally')).toBeVisible();

          // Join project real-time room so task events reach the task store.
          await projectDetailsPage.goto(project.id);
          await projectDetailsPage.openTasksTab();

          // Ensure deterministic assertion.
          await sandboxApi.clearOutbox(adminSession.user.id);

          const task = await adminApi.createTask({
            projectId: project.id,
            creatorId: adminSession.user.id,
            assigneeId: adminSession.user.id,
            description,
            status: 'PENDING',
            priority: 'MEDIUM',
            dueDate: daysFromToday(5).toISOString(),
            comments: null,
          });

          // Assert the sandbox outbox receives the notification.
          await expect.poll(async () => {
            const outbox = await sandboxApi.listOutbox(adminSession.user.id);
            return outbox.some((message) => message?.meta?.taskId === task.id);
          }, {timeout: 15_000}).toBe(true);

          const outbox = await sandboxApi.listOutbox(adminSession.user.id);
          const message = outbox.find((entry) => entry?.meta?.taskId === task.id);
          expect(message?.text).toContain(description);
        } finally {
          try {
            await adminApi.deleteProject(project.id);
          } catch {
            // Ignore.
          }
          await apiContext.dispose();
        }
      },
    );
  });
});
