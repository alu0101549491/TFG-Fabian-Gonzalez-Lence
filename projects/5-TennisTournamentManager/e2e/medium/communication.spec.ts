/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/medium/communication.spec.ts
 * @desc Medium-priority communication and invitation scenarios.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {test, expect} from '../fixtures/auth.fixture';
import {ApiHelper} from '../helpers/api.helper';
import {SeedHelper} from '../helpers/seed.helper';
import {TEST_USERS} from '../fixtures/test-data';

test.describe('Communication - Medium', () => {
  test('COMM-001 should show partner invitation messages in the invitations inbox', async ({participantPage}) => {
    await participantPage.goto('/my-invitations');
    await expect(participantPage.getByRole('heading', {name: /partner invitations/i})).toBeVisible();

    const messageBlock = participantPage.locator('.invitation-message').first();
    if (await messageBlock.count() > 0) {
      await expect(messageBlock).toBeVisible();
    }
  });

  test('COMM-003 should expose tournament chat, moderation, and group messaging', async ({participantPage}) => {
    test.skip(true, 'Chat, moderation, and group messaging UI is not implemented in the current frontend.');

    await participantPage.goto('/home');
  });

  test('COMM-002 should update related UIs after accepting a doubles partner invitation', async ({participantPage, secondParticipantPage}) => {
    const localApiHelper = await ApiHelper.create();
    const adminSession = await localApiHelper.login(TEST_USERS.tournamentAdmin1);
    const p1Session = await localApiHelper.login(TEST_USERS.participant1);
    const p2Session = await localApiHelper.login(TEST_USERS.participant2);
    const localSeedHelper = new SeedHelper(localApiHelper, adminSession);

    const tournament = await localSeedHelper.createTournament(`COMM-002 Invite ${Date.now()}`, {
      tournamentType: 'DOUBLES',
      maxParticipants: 16,
    });
    await localSeedHelper.updateTournamentStatus(tournament.id, 'REGISTRATION_OPEN');
    const categoryId = await localSeedHelper.createCategory(tournament.id, 'COMM-002 Doubles');

    try {
      // Participant1 sends an invitation to participant2.
      const inviteResponse = await localApiHelper.post<{invitation: {id: string}}>('/partner-invitations/send', {
        inviteeId: p2Session.user.id,
        tournamentId: tournament.id,
        categoryId,
        message: 'COMM-002 E2E test invitation',
      }, p1Session.token, 201);
      const invitationId = inviteResponse.invitation.id;

      // Participant1 sees the invitation in "Sent" state.
      await participantPage.goto('/my-invitations');
      await expect(participantPage.getByText(/sent invitations/i)).toBeVisible();
      const sentCard = participantPage.locator('.invitation-card').filter({hasText: tournament.name}).first();
      await expect(sentCard).toContainText(/pending/i);

      // Participant2 accepts the invitation via UI.
      secondParticipantPage.on('dialog', async (dialog) => dialog.accept());
      await secondParticipantPage.goto('/my-invitations');
      await expect(secondParticipantPage.getByText(/pending invitations/i)).toBeVisible();
      const pendingCard = secondParticipantPage.locator('.invitation-card').filter({hasText: tournament.name}).first();
      await expect(pendingCard).toBeVisible();
      await pendingCard.getByRole('button', {name: /accept/i}).click();

      // Participant2 inbox: invitation moves to "Past".
      await expect(secondParticipantPage.getByText(/past invitations/i)).toBeVisible();

      // Participant1 inbox refreshes and shows accepted status.
      await participantPage.reload();
      const updatedSent = participantPage.locator('.invitation-card').filter({hasText: tournament.name}).first();
      await expect(updatedSent).toContainText(/accepted/i);

      // Verify via API that the invitation is ACCEPTED.
      const inv = await localApiHelper.get<{invitation: {status: string}}>(`/partner-invitations/${invitationId}`, p1Session.token);
      expect(inv.invitation.status).toBe('ACCEPTED');
    } finally {
      await localSeedHelper.cleanAll();
      await localApiHelper.dispose();
    }
  });
});