/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/critical/draw-generation.spec.ts
 * @desc Critical bracket-generation and bracket-visibility scenarios.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {test, expect} from '../fixtures/auth.fixture';
import {TEST_USERS} from '../fixtures/test-data';
import {BracketPage} from '../fixtures/page-objects/bracket.page';
import {ApiHelper} from '../helpers/api.helper';
import {SeedHelper} from '../helpers/seed.helper';

const SEEDED_TOURNAMENT_STATUSES = ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'DRAW_PENDING'];

async function createSeedContext(): Promise<{
  apiHelper: ApiHelper;
  seedHelper: SeedHelper;
  participant1Id: string;
  participant2Id: string;
}> {
  const apiHelper = await ApiHelper.create();
  const adminSession = await apiHelper.login({
    email: TEST_USERS.tournamentAdmin1.email,
    password: TEST_USERS.tournamentAdmin1.password,
  });
  const participant1Session = await apiHelper.login({
    email: TEST_USERS.participant1.email,
    password: TEST_USERS.participant1.password,
  });
  const participant2Session = await apiHelper.login({
    email: TEST_USERS.participant2.email,
    password: TEST_USERS.participant2.password,
  });

  return {
    apiHelper,
    seedHelper: new SeedHelper(apiHelper, adminSession),
    participant1Id: participant1Session.user.id,
    participant2Id: participant2Session.user.id,
  };
}

test.describe('Draw Generation - Critical', () => {
  test('DRAW-001 should block bracket generation when fewer than two accepted players exist', async () => {
    test.fixme(
      true,
      'The routed tournament detail page does not currently expose bracket-generation controls; this scenario remains pending until that UI is wired into the active route.',
    );
  });

  test('DRAW-002 should show bracket details and publish state for an existing bracket', async ({tournamentAdminPage}) => {
    const seedContext = await createSeedContext();

    try {
      const fixture = await seedContext.seedHelper.createSinglesMatchFixture(
        `DRAW-002 ${Date.now()}`,
        [seedContext.participant1Id, seedContext.participant2Id],
        {
          tournamentStatuses: SEEDED_TOURNAMENT_STATUSES,
        },
      );

      const bracketPage = new BracketPage(tournamentAdminPage);
      await bracketPage.gotoById(fixture.bracketId!);
      await bracketPage.expectBracketVisible();
      await expect(tournamentAdminPage.getByText(/bracket information/i)).toBeVisible();

      const publishButton = tournamentAdminPage.getByRole('button', {name: /publish bracket/i});
      if (await publishButton.count() > 0) {
        await expect(publishButton).toBeVisible();
      } else {
        await expect(tournamentAdminPage.getByText(/published/i)).toBeVisible();
      }
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });

  test('DRAW-003 should regenerate a draft bracket when the control is available', async () => {
    test.fixme(true, 'Reliable regeneration coverage requires a seeded draft bracket with existing matches and a known route identifier.');
  });

  test('DRAW-007 should keep bracket pages read-only for participants', async ({participantPage}) => {
    const seedContext = await createSeedContext();

    try {
      const fixture = await seedContext.seedHelper.createSinglesMatchFixture(
        `DRAW-007 ${Date.now()}`,
        [seedContext.participant1Id, seedContext.participant2Id],
        {
          tournamentStatuses: SEEDED_TOURNAMENT_STATUSES,
          publishBracket: true,
        },
      );

      const bracketPage = new BracketPage(participantPage);
      await bracketPage.gotoById(fixture.bracketId!);
      await bracketPage.expectBracketVisible();
      await bracketPage.expectReadOnlyView();
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });

  test('DRAW-008 should cover consolation and compass draw management', async () => {
    test.skip(true, 'Consolation and compass draw UI is not implemented in the current frontend.');
  });
});