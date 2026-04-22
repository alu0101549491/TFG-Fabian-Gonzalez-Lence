/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/critical/result-management.spec.ts
 * @desc Critical match scheduling, scoring, dispute, and status-control scenarios.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {test, expect} from '../fixtures/auth.fixture';
import {TEST_USERS, VALID_SCORE_SET} from '../fixtures/test-data';
import {MatchDetailPage} from '../fixtures/page-objects/match-detail.page';
import {ApiHelper} from '../helpers/api.helper';
import {SeedHelper} from '../helpers/seed.helper';

const MATCH_SCHEDULED_TIME = '2026-06-12T10:30:00.000Z';
const SEEDED_TOURNAMENT_STATUSES = ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'DRAW_PENDING'];

async function createSeedContext(): Promise<{
  apiHelper: ApiHelper;
  seedHelper: SeedHelper;
  participant1Id: string;
  participant2Id: string;
  participant1Name: string;
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
    participant1Name: `${participant1Session.user.firstName} ${participant1Session.user.lastName}`,
  };
}

test.describe('Match and Result Management - Critical', () => {
  test('MATCH-001 should let an admin schedule a match with court, date, time, and ball provider', async ({tournamentAdminPage}) => {
    const seedContext = await createSeedContext();

    try {
      const fixture = await seedContext.seedHelper.createSinglesMatchFixture(
        `MATCH-001 ${Date.now()}`,
        [seedContext.participant1Id, seedContext.participant2Id],
        {
          tournamentStatuses: SEEDED_TOURNAMENT_STATUSES,
          courtName: 'Center Court',
        },
      );

      const matchPage = new MatchDetailPage(tournamentAdminPage);
      await matchPage.gotoById(fixture.matchId!);
      await matchPage.scheduleMatch({
        courtLabel: 'Center Court',
        date: '2026-06-12',
        time: '10:30',
        ballProvider: VALID_SCORE_SET.ballProvider,
      });

      await matchPage.expectBallProvider(VALID_SCORE_SET.ballProvider);
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });

  test('MATCH-009 should let an admin record a result directly from match detail', async ({tournamentAdminPage}) => {
    const seedContext = await createSeedContext();

    try {
      const fixture = await seedContext.seedHelper.createSinglesMatchFixture(
        `MATCH-009 ${Date.now()}`,
        [seedContext.participant1Id, seedContext.participant2Id],
        {
          tournamentStatuses: SEEDED_TOURNAMENT_STATUSES,
          courtName: 'Center Court',
          scheduledTime: MATCH_SCHEDULED_TIME,
          matchStatus: 'SCHEDULED',
        },
      );

      const matchPage = new MatchDetailPage(tournamentAdminPage);
      await matchPage.gotoById(fixture.matchId!);
      await matchPage.recordScores(seedContext.participant1Name, VALID_SCORE_SET.sets);

      await expect(tournamentAdminPage.getByText(/final score/i)).toBeVisible();
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });

  test('MATCH-007 should suspend and resume a match while preserving context', async ({tournamentAdminPage}) => {
    const seedContext = await createSeedContext();

    try {
      const fixture = await seedContext.seedHelper.createSinglesMatchFixture(
        `MATCH-007 ${Date.now()}`,
        [seedContext.participant1Id, seedContext.participant2Id],
        {
          tournamentStatuses: SEEDED_TOURNAMENT_STATUSES,
          courtName: 'Center Court',
          scheduledTime: MATCH_SCHEDULED_TIME,
          matchStatus: 'IN_PROGRESS',
          startTime: '2026-06-12T10:35:00.000Z',
        },
      );

      const matchPage = new MatchDetailPage(tournamentAdminPage);
      await matchPage.gotoById(fixture.matchId!);
      await matchPage.suspendMatch('Rain interruption during E2E run');
      await matchPage.expectStatus(/suspended/i);

      await matchPage.resumeMatch({date: '2026-06-13', time: '11:00'});
      await expect(tournamentAdminPage.locator('.status-badge').first()).toContainText(/in progress|ip/i);
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });

  test('MATCH-008 should cancel a match with a reason', async ({tournamentAdminPage}) => {
    const seedContext = await createSeedContext();

    try {
      const fixture = await seedContext.seedHelper.createSinglesMatchFixture(
        `MATCH-008 ${Date.now()}`,
        [seedContext.participant1Id, seedContext.participant2Id],
        {
          tournamentStatuses: SEEDED_TOURNAMENT_STATUSES,
          courtName: 'Center Court',
          scheduledTime: MATCH_SCHEDULED_TIME,
          matchStatus: 'SCHEDULED',
        },
      );

      const matchPage = new MatchDetailPage(tournamentAdminPage);
      await matchPage.gotoById(fixture.matchId!);
      await matchPage.cancelMatch('Severe weather conditions');
      await expect(tournamentAdminPage.locator('.status-badge').first()).toContainText(/cancelled|can/i);
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });

  test('MATCH-011 should let public users filter grouped match lists and open match details', async ({publicPage}) => {
    const seedContext = await createSeedContext();

    try {
      const fixture = await seedContext.seedHelper.createSinglesMatchFixture(
        `MATCH-011 ${Date.now()}`,
        [seedContext.participant1Id, seedContext.participant2Id],
        {
          tournamentStatuses: SEEDED_TOURNAMENT_STATUSES,
          courtName: 'Show Court',
          scheduledTime: MATCH_SCHEDULED_TIME,
          matchStatus: 'SCHEDULED',
        },
      );

      await publicPage.goto(`/matches?tournamentId=${fixture.id}`);
  await expect(publicPage.locator('h1.hero-title')).toHaveText(/matches/i);
      await expect(publicPage.locator('.phase-group').first()).toContainText(fixture.name);

      await publicPage.locator('select').first().selectOption('SCHEDULED');
      const firstMatchCard = publicPage.locator('.match-card').first();
      await expect(firstMatchCard).toBeVisible();
      await firstMatchCard.click();
      await expect(publicPage).toHaveURL(new RegExp(`/matches/${fixture.matchId}(\\?.*)?$`));

      await publicPage.goto(`/matches?tournamentId=${fixture.id}`);
      await publicPage.locator('select').first().selectOption('COMPLETED');
      await expect(publicPage.getByRole('heading', {name: /no matches found/i})).toBeVisible();
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });

  test('MATCH-012 should group personal matches into actionable and completed sections', async ({participantPage}) => {
    const seedContext = await createSeedContext();

    try {
      await seedContext.seedHelper.createSinglesMatchFixture(
        `MATCH-012 Scheduled ${Date.now()}`,
        [seedContext.participant1Id, seedContext.participant2Id],
        {
          tournamentStatuses: SEEDED_TOURNAMENT_STATUSES,
          courtName: 'Action Court',
          scheduledTime: MATCH_SCHEDULED_TIME,
          matchStatus: 'SCHEDULED',
        },
      );

      const completedFixture = await seedContext.seedHelper.createSinglesMatchFixture(
        `MATCH-012 Completed ${Date.now()}`,
        [seedContext.participant1Id, seedContext.participant2Id],
        {
          tournamentStatuses: SEEDED_TOURNAMENT_STATUSES,
          courtName: 'Final Court',
          scheduledTime: MATCH_SCHEDULED_TIME,
          matchStatus: 'SCHEDULED',
        },
      );

      await seedContext.seedHelper.updateMatch(completedFixture.matchId!, {
        status: 'COMPLETED',
        winnerId: seedContext.participant1Id,
        scores: VALID_SCORE_SET.sets.map((set) => ({
          player1Games: set.p1,
          player2Games: set.p2,
        })),
      });

      await participantPage.goto('/my-matches');
      await expect(participantPage.getByRole('heading', {name: /my matches/i})).toBeVisible();
      await expect(participantPage.locator('.uncompleted-section')).toBeVisible();
      await expect(participantPage.locator('.completed-section')).toBeVisible();
      await expect(participantPage.locator('.uncompleted-section').getByRole('button', {name: /enter result/i}).first()).toBeVisible();
      await expect(participantPage.locator('.completed-section .status-badge').first()).toContainText(/completed/i);

      await participantPage.locator('.completed-section').getByRole('button', {name: /view details/i}).first().click();
      await expect(participantPage).toHaveURL(/\/matches\/.+/);
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });

  test('MATCH-004 should allow opponent confirmation of pending results', async ({participantPage, secondParticipantPage}) => {
    test.fixme(true, 'Confirmation flow requires a deterministic pending-result fixture owned by both participant storage states.');

    await participantPage.goto('/my-matches');
    await secondParticipantPage.goto('/my-matches');
  });

  test('MATCH-005 should let an opponent dispute a pending result', async ({secondParticipantPage}) => {
    test.fixme(true, 'Dispute flow requires a deterministic pending-result fixture in the current test environment.');

    await secondParticipantPage.goto('/my-matches');
  });
});