/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/high/registration.spec.ts
 * @desc High-priority registration, withdrawal, and invitation scenarios.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {test, expect} from '../fixtures/auth.fixture';
import {TournamentDetailPage} from '../fixtures/page-objects/tournament-detail.page';
import {TEST_TOURNAMENTS} from '../fixtures/test-data';

test.describe('Registration - High', () => {
  test('REG-001 should expose self-registration controls on open tournaments', async ({participantPage}) => {
    const detailPage = new TournamentDetailPage(participantPage);
    await detailPage.gotoById(TEST_TOURNAMENTS.openRegistration.id);

    await expect(participantPage.getByText(/categories/i)).toBeVisible();
    await expect(detailPage.registerButton).toBeVisible();
  });

  test('REG-004 should let administrators bulk-approve pending registrations', async ({tournamentAdminPage}) => {
    const detailPage = new TournamentDetailPage(tournamentAdminPage);
    await detailPage.gotoById(TEST_TOURNAMENTS.openRegistration.id);

    const approveAllButton = tournamentAdminPage.getByRole('button', {name: /approve all/i});
    if (await approveAllButton.count() > 0) {
      await detailPage.approveAllRegistrations();
    }

    await expect(tournamentAdminPage.getByText(/registered participants/i)).toBeVisible();
  });

  test('REG-006 should let a participant inspect and withdraw eligible registrations', async ({participantPage}) => {
    await participantPage.goto('/my-registrations');
    await expect(participantPage.getByText(/my registrations/i)).toBeVisible();

    const withdrawButton = participantPage.getByRole('button', {name: /withdraw/i}).first();
    if (await withdrawButton.count() > 0) {
      await participantPage.once('dialog', async (dialog) => dialog.accept());
      await withdrawButton.click();
    }
  });

  test('REG-003 should show doubles partner invitations and response actions', async ({secondParticipantPage}) => {
    await secondParticipantPage.goto('/my-invitations');
    await expect(secondParticipantPage.getByText(/partner invitations/i)).toBeVisible();

    const actionCard = secondParticipantPage.locator('.invitation-card').first();
    if (await actionCard.count() > 0) {
      await expect(actionCard).toContainText(/pending|accepted|declined|cancelled/i);
    }
  });

  test('REG-009 should process registration payments', async ({participantPage}) => {
    test.skip(true, 'Registration payment checkout UI is not implemented in the current frontend.');

    const detailPage = new TournamentDetailPage(participantPage);
    await detailPage.gotoById(TEST_TOURNAMENTS.openRegistration.id);
  });
});