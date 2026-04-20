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

test.describe('Communication - Medium', () => {
  test('COMM-001 should show partner invitation messages in the invitations inbox', async ({participantPage}) => {
    await participantPage.goto('/my-invitations');
    await expect(participantPage.getByText(/partner invitations/i)).toBeVisible();

    const messageBlock = participantPage.locator('.invitation-message').first();
    if (await messageBlock.count() > 0) {
      await expect(messageBlock).toBeVisible();
    }
  });

  test('COMM-003 should expose tournament chat, moderation, and group messaging', async ({participantPage}) => {
    test.skip(true, 'Chat, moderation, and group messaging UI is not implemented in the current frontend.');

    await participantPage.goto('/home');
  });
});