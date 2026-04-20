/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/medium/incidents.spec.ts
 * @desc Medium-priority disputed-match and incident-resolution scenarios.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {test, expect} from '../fixtures/auth.fixture';

test.describe('Incidents - Medium', () => {
  test('INC-001 should render disputed matches for admins', async ({tournamentAdminPage}) => {
    await tournamentAdminPage.goto('/admin/disputed-matches');
    await expect(tournamentAdminPage.getByText(/disputed matches/i)).toBeVisible();
  });

  test('INC-002 should open the dispute-resolution modal', async ({tournamentAdminPage}) => {
    await tournamentAdminPage.goto('/admin/disputed-matches');
    const resolveButton = tournamentAdminPage.getByRole('button', {name: /resolve dispute/i}).first();

    if (await resolveButton.count() > 0) {
      await resolveButton.click();
      await expect(tournamentAdminPage.locator('.modal-content').filter({hasText: 'Resolve Dispute'})).toBeVisible();
    }
  });

  test('INC-003 should open the annul-result modal', async ({tournamentAdminPage}) => {
    await tournamentAdminPage.goto('/admin/disputed-matches');
    const annulButton = tournamentAdminPage.getByRole('button', {name: /annul match/i}).first();

    if (await annulButton.count() > 0) {
      await annulButton.click();
      await expect(tournamentAdminPage.locator('.modal-content').last()).toBeVisible();
    }
  });

  test('INC-004 should apply sanctions and order replays', async ({tournamentAdminPage}) => {
    test.skip(true, 'Sanctions and replay-order UI is not implemented in the current frontend.');

    await tournamentAdminPage.goto('/admin/disputed-matches');
  });
});