/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2026-03-13
 * @file e2e/tools/cleanup-e2e-artifacts.ts
 * @desc One-off cleanup tool that deletes Playwright-created users and projects from the CPM backend.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {request} from '@playwright/test';

import {CpmApiClient, type ProjectListDto, type UserDto} from '../helpers/api';
import {DEV_ACCOUNTS} from '../helpers/auth';
import {getApiBaseUrl} from '../helpers/e2e-paths.ts';

const TEST_USERNAME_PREFIXES = ['pw-', 'client-pw-'] as const;
const TEST_EMAIL_SUFFIX = '@example.com';

function isPlaywrightUser(user: Pick<UserDto, 'username' | 'email'>): boolean {
  if (!user.email.endsWith(TEST_EMAIL_SUFFIX)) return false;
  return TEST_USERNAME_PREFIXES.some((prefix) => user.username.startsWith(prefix));
}

function isE2eProject(project: Pick<ProjectListDto, 'code' | 'name'>): boolean {
  const code = project.code || '';
  const name = project.name || '';
  return (
    code.startsWith('PW-') ||
    code.startsWith('PW-TASK-') ||
    name.startsWith('PW Project ') ||
    name.startsWith('PW Task Project ')
  );
}

async function main(): Promise<void> {
  const apiContext = await request.newContext({baseURL: getApiBaseUrl()});

  try {
    const {client: adminApi} = await CpmApiClient.login(apiContext, DEV_ACCOUNTS.ADMIN);

    const projects = await adminApi.listProjects();
    const projectsToDelete = projects.filter(isE2eProject);

    for (const project of projectsToDelete) {
      try {
        await adminApi.deleteProject(project.id);
        // eslint-disable-next-line no-console
        console.log(`[cleanup] Deleted project: ${project.code} (${project.id})`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`[cleanup] Failed to delete project ${project.code} (${project.id}):`, error);
      }
    }

    const users = await adminApi.listUsers();
    const protectedEmails = new Set<string>([
      DEV_ACCOUNTS.ADMIN.email,
      DEV_ACCOUNTS.CLIENT.email,
      DEV_ACCOUNTS.SPECIAL.email,
    ]);

    const usersToDelete = users.filter(
      (user) => isPlaywrightUser(user) && !protectedEmails.has(user.email),
    );

    for (const user of usersToDelete) {
      try {
        await adminApi.deleteUser(user.id);
        // eslint-disable-next-line no-console
        console.log(`[cleanup] Deleted user: ${user.email} (${user.id})`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`[cleanup] Failed to delete user ${user.email} (${user.id}):`, error);
      }
    }

    // eslint-disable-next-line no-console
    console.log(
      `[cleanup] Done. Deleted ${projectsToDelete.length} projects and ${usersToDelete.length} users.`,
    );
  } finally {
    await apiContext.dispose();
  }
}

// eslint-disable-next-line no-void
void main();
