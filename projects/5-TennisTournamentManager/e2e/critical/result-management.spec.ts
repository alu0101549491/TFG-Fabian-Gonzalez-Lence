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

import {type Page} from '@playwright/test';
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
  adminToken: string;
  participant1Id: string;
  participant2Id: string;
  participant1Name: string;
  participant1Token: string;
  participant2Token: string;
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
    adminToken: adminSession.token,
    participant1Id: participant1Session.user.id,
    participant2Id: participant2Session.user.id,
    participant1Name: `${participant1Session.user.firstName} ${participant1Session.user.lastName}`,
    participant1Token: participant1Session.token,
    participant2Token: participant2Session.token,
  };
}

/**
 * Opens the My Matches page and retries when the UI surfaces a transient load error.
 *
 * @param page - Authenticated participant page
 */
async function gotoMyMatchesWithRetry(page: Page): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.goto('/my-matches');
    await expect(page.getByRole('heading', {name: /my matches/i})).toBeVisible();

    const loadError = page.getByText(/failed to load matches\. please try again\./i);
    if (!await loadError.isVisible().catch(() => false)) {
      return;
    }
  }

  await expect(page.getByText(/failed to load matches\. please try again\./i)).toBeHidden();
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

  test('MATCH-013 should let participants submit results with optional comments', async ({participantPage}) => {
    const seedContext = await createSeedContext();

    try {
      const commentText = 'Windy conditions on court three during the second set.';
      const courtName = `Comments Court ${Date.now()}`;
      const fixture = await seedContext.seedHelper.createSinglesMatchFixture(
        `MATCH-013 ${Date.now()}`,
        [seedContext.participant1Id, seedContext.participant2Id],
        {
          tournamentStatuses: SEEDED_TOURNAMENT_STATUSES,
          courtName,
          scheduledTime: MATCH_SCHEDULED_TIME,
          matchStatus: 'SCHEDULED',
        },
      );

      await participantPage.addInitScript(() => {
        window.alert = () => undefined;
      });
      await gotoMyMatchesWithRetry(participantPage);

      const matchCard = participantPage.locator('.match-card').filter({hasText: courtName}).first();
      await expect(matchCard.getByRole('button', {name: /enter result/i})).toBeVisible();

      await matchCard.getByRole('button', {name: /enter result/i}).click();
      const resultModal = participantPage.locator('.modal-content').filter({
        has: participantPage.getByRole('heading', {name: /enter match result/i}),
      });
      await expect(resultModal.getByRole('heading', {name: /enter match result/i})).toBeVisible();
      await participantPage.locator('input[name="winnerId"]').first().check();
      await resultModal.locator('.set-row').nth(0).locator('input').nth(0).fill('6');
      await resultModal.locator('.set-row').nth(0).locator('input').nth(1).fill('3');
      await resultModal.locator('.set-row').nth(1).locator('input').nth(0).fill('6');
      await resultModal.locator('.set-row').nth(1).locator('input').nth(1).fill('4');
      await resultModal.locator('#playerComments').fill(commentText);
      await resultModal.getByRole('button', {name: /submit result/i}).click();

      const participantMatches = await seedContext.apiHelper.get<Array<{
        id: string;
        pendingResult?: {
          confirmationStatus: string;
          playerComments?: string | null;
          setScores: string[];
        } | null;
      }>>(
        `/matches?participantId=${seedContext.participant1Id}`,
        seedContext.participant1Token,
      );
      const updatedMatch = participantMatches.find((match) => match.id === fixture.matchId);
      expect(updatedMatch?.pendingResult?.confirmationStatus).toBe('PENDING_CONFIRMATION');
      expect(updatedMatch?.pendingResult?.playerComments).toBe(commentText);
      expect(updatedMatch?.pendingResult?.setScores).toEqual(['6-3', '6-4']);
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });

  test('MATCH-004 should allow opponent confirmation of pending results', async ({secondParticipantPage}) => {
    const seedContext = await createSeedContext();

    try {
      const pendingScoreSummary = '6-1, 3-6, 7-5';
      const fixture = await seedContext.seedHelper.createPendingResultFixture(
        `MATCH-004 ${Date.now()}`,
        [seedContext.participant1Id, seedContext.participant2Id],
        {
          tournamentStatuses: SEEDED_TOURNAMENT_STATUSES,
          courtName: 'Pending Result Court',
          submitterToken: seedContext.participant1Token,
          winnerId: seedContext.participant1Id,
          setScores: ['6-1', '3-6', '7-5'],
          playerComments: 'Pending confirmation seeded by Playwright',
        },
      );

      await secondParticipantPage.addInitScript(() => {
        window.confirm = () => true;
        window.alert = () => undefined;
      });
      await gotoMyMatchesWithRetry(secondParticipantPage);
      const opponentPendingCard = secondParticipantPage.locator('.pending-card').filter({hasText: pendingScoreSummary}).first();
      await expect(opponentPendingCard).toContainText(/action required/i);
      await expect(opponentPendingCard.getByRole('button', {name: /confirm result/i})).toBeVisible();
      await expect(opponentPendingCard.getByRole('button', {name: /dispute result/i})).toBeVisible();

      await opponentPendingCard.getByRole('button', {name: /confirm result/i}).click();

      await expect(secondParticipantPage.locator('.pending-card').filter({hasText: pendingScoreSummary})).toHaveCount(0);
      await expect(secondParticipantPage.locator('.completed-section')).toBeVisible();

      const participantMatches = await seedContext.apiHelper.get<Array<{
        id: string;
        status: string;
        winnerId: string | null;
      }>>(
        `/matches?participantId=${seedContext.participant2Id}`,
        seedContext.participant2Token,
      );
      const updatedMatch = participantMatches.find((match) => match.id === fixture.matchId);
      expect(updatedMatch).toBeDefined();
      expect(updatedMatch?.status).toBe('COMPLETED');
      expect(updatedMatch?.winnerId).toBe(seedContext.participant1Id);
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });

  test('MATCH-005 should let an opponent dispute a pending result', async ({secondParticipantPage}) => {
    const seedContext = await createSeedContext();

    try {
      const pendingScoreSummary = '7-5, 4-6, 6-3';
      const fixture = await seedContext.seedHelper.createPendingResultFixture(
        `MATCH-005 ${Date.now()}`,
        [seedContext.participant1Id, seedContext.participant2Id],
        {
          tournamentStatuses: SEEDED_TOURNAMENT_STATUSES,
          courtName: 'Dispute Result Court',
          submitterToken: seedContext.participant1Token,
          winnerId: seedContext.participant1Id,
          setScores: ['7-5', '4-6', '6-3'],
          playerComments: 'Dispute workflow seeded by Playwright',
        },
      );

      await gotoMyMatchesWithRetry(secondParticipantPage);
      const opponentPendingCard = secondParticipantPage.locator('.pending-card').filter({hasText: pendingScoreSummary}).first();
      await expect(opponentPendingCard.getByRole('button', {name: /dispute result/i})).toBeVisible();

      await opponentPendingCard.getByRole('button', {name: /dispute result/i}).click();
      await expect(secondParticipantPage.getByRole('heading', {name: /dispute match result/i})).toBeVisible();
      await secondParticipantPage.locator('#disputeReason').fill('The submitted tiebreak scores do not match the played sets.');

      const [successDialog] = await Promise.all([
        secondParticipantPage.waitForEvent('dialog'),
        secondParticipantPage.getByRole('button', {name: /submit dispute/i}).click(),
      ]);
      await expect(successDialog.message()).toContain('Result disputed successfully.');
      await successDialog.accept();

      await expect(secondParticipantPage.locator('.pending-card').filter({hasText: pendingScoreSummary})).toHaveCount(0);

      const disputedMatches = await seedContext.apiHelper.get<Array<{matchId: string}>>(
        '/admin/matches/disputed',
        seedContext.adminToken,
      );
      expect(disputedMatches.some((match) => match.matchId === fixture.matchId)).toBeTruthy();
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });

  test('MATCH-014 should let admins record super tiebreak scores on supported matches', async ({tournamentAdminPage}) => {
    const seedContext = await createSeedContext();

    try {
      const fixture = await seedContext.seedHelper.createSinglesMatchFixture(
        `MATCH-014 ${Date.now()}`,
        [seedContext.participant1Id, seedContext.participant2Id],
        {
          tournamentStatuses: SEEDED_TOURNAMENT_STATUSES,
          courtName: 'Super Tiebreak Court',
          scheduledTime: MATCH_SCHEDULED_TIME,
          matchStatus: 'SCHEDULED',
        },
      );
      await seedContext.seedHelper.updateMatch(fixture.matchId!, {
        format: 'SUPER_TIEBREAK',
      });

      const matchPage = new MatchDetailPage(tournamentAdminPage);
      await matchPage.gotoById(fixture.matchId!);
      await expect(tournamentAdminPage.getByText(/super tiebreak/i)).toBeVisible();
      await matchPage.recordSuperTiebreak(seedContext.participant1Name, {
        participant1: 10,
        participant2: 8,
      });

      await matchPage.expectStatus(/completed/i);
      await expect(tournamentAdminPage.getByText(/1-0\(10\)/i)).toBeVisible();

      const participantMatches = await seedContext.apiHelper.get<Array<{
        id: string;
        status: string;
        scores?: Array<{
          player1TiebreakPoints: number | null;
          player2TiebreakPoints: number | null;
        }>;
      }>>(
        `/matches?participantId=${seedContext.participant1Id}`,
        seedContext.participant1Token,
      );
      const updatedMatch = participantMatches.find((match) => match.id === fixture.matchId);
      expect(updatedMatch?.status).toBe('COMPLETED');
      expect(updatedMatch?.scores?.[0]?.player1TiebreakPoints).toBe(10);
      expect(updatedMatch?.scores?.[0]?.player2TiebreakPoints).toBe(8);
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });

  test('MATCH-015 should block marking unscheduled matches as scheduled before assigning date and time', async ({tournamentAdminPage}) => {
    const seedContext = await createSeedContext();

    try {
      const fixture = await seedContext.seedHelper.createSinglesMatchFixture(
        `MATCH-015 ${Date.now()}`,
        [seedContext.participant1Id, seedContext.participant2Id],
        {
          tournamentStatuses: SEEDED_TOURNAMENT_STATUSES,
        },
      );

      const matchPage = new MatchDetailPage(tournamentAdminPage);
      await matchPage.gotoById(fixture.matchId!);
      await matchPage.openStatusModal();
      await matchPage.selectStatus('SCHEDULED');

      const statusModal = matchPage.getStatusModal();
      await expect(statusModal.locator('.warning-box')).toContainText(/schedule the match first/i);

      await matchPage.submitStatusModal();
      await expect(statusModal.locator('.error-alert')).toContainText(/cannot mark match as scheduled without a scheduled date and time/i);

      const matchDetails = await seedContext.apiHelper.get<{status: string}>(
        `/matches/${fixture.matchId}`,
        seedContext.adminToken,
      );
      expect(matchDetails.status).toBe('NOT_SCHEDULED');
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });

  test('MATCH-016 should require winner selection for walkover status updates', async ({tournamentAdminPage}) => {
    const seedContext = await createSeedContext();

    try {
      const fixture = await seedContext.seedHelper.createSinglesMatchFixture(
        `MATCH-016 ${Date.now()}`,
        [seedContext.participant1Id, seedContext.participant2Id],
        {
          tournamentStatuses: SEEDED_TOURNAMENT_STATUSES,
          courtName: 'Walkover Court',
          scheduledTime: MATCH_SCHEDULED_TIME,
          matchStatus: 'SCHEDULED',
        },
      );

      const matchPage = new MatchDetailPage(tournamentAdminPage);
      await matchPage.gotoById(fixture.matchId!);
      await matchPage.openStatusModal();
      await matchPage.selectStatus('WALKOVER');

      const statusModal = matchPage.getStatusModal();
      await expect(statusModal.locator('#winnerId')).toBeVisible();
      await expect(statusModal).toContainText(/required for walkover, retired, and default statuses/i);

      await matchPage.submitStatusModal();
      await expect(statusModal.locator('.error-alert')).toContainText(/cannot mark match as walkover without selecting a winner/i);

      await matchPage.selectStatusWinner(seedContext.participant1Name);
      await matchPage.submitStatusModal();
      await matchPage.expectStatus(/walkover|wo/i);

      const matchDetails = await seedContext.apiHelper.get<{status: string; winnerId: string | null}>(
        `/matches/${fixture.matchId}`,
        seedContext.adminToken,
      );
      expect(matchDetails.status).toBe('WALKOVER');
      expect(matchDetails.winnerId).toBe(seedContext.participant1Id);
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });

  test('MATCH-017 should expose only valid next statuses for scheduled matches', async ({tournamentAdminPage}) => {
    const seedContext = await createSeedContext();

    try {
      const fixture = await seedContext.seedHelper.createSinglesMatchFixture(
        `MATCH-017 ${Date.now()}`,
        [seedContext.participant1Id, seedContext.participant2Id],
        {
          tournamentStatuses: SEEDED_TOURNAMENT_STATUSES,
          courtName: 'Transition Court',
          scheduledTime: MATCH_SCHEDULED_TIME,
          matchStatus: 'SCHEDULED',
        },
      );

      const matchPage = new MatchDetailPage(tournamentAdminPage);
      await matchPage.gotoById(fixture.matchId!);
      await matchPage.openStatusModal();

      const optionValues = await matchPage.getStatusModal().locator('#status option').evaluateAll((options) =>
        options.map((option) => (option as HTMLOptionElement).value),
      );

      expect(optionValues).toEqual(expect.arrayContaining([
        'SCHEDULED',
        'NOT_SCHEDULED',
        'IN_PROGRESS',
        'WALKOVER',
        'CANCELLED',
        'DEFAULT',
        'NOT_PLAYED',
        'BYE',
      ]));
      expect(optionValues).not.toContain('COMPLETED');
      expect(optionValues).not.toContain('RETIRED');
      expect(optionValues).not.toContain('ABANDONED');
      expect(optionValues).not.toContain('DEAD_RUBBER');
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });

  test('MATCH-018 should block scheduling and expose no forward status transitions for bye matches', async ({tournamentAdminPage}) => {
    const seedContext = await createSeedContext();

    try {
      const fixture = await seedContext.seedHelper.createSinglesMatchFixture(
        `MATCH-018 ${Date.now()}`,
        [seedContext.participant1Id, seedContext.participant2Id],
        {
          tournamentStatuses: SEEDED_TOURNAMENT_STATUSES,
          courtName: 'Bye Court',
          scheduledTime: MATCH_SCHEDULED_TIME,
          matchStatus: 'SCHEDULED',
        },
      );
      await seedContext.seedHelper.updateMatch(fixture.matchId!, {
        status: 'BYE',
      });

      const matchPage = new MatchDetailPage(tournamentAdminPage);
      await matchPage.gotoById(fixture.matchId!);

      await matchPage.expectStatus(/bye/i);
      await expect(tournamentAdminPage.getByRole('button', {name: /schedule match/i})).toHaveCount(0);

      await matchPage.openStatusModal();
      const optionValues = await matchPage.getStatusModal().locator('#status option').evaluateAll((options) =>
        options.map((option) => (option as HTMLOptionElement).value),
      );
      expect(optionValues).toEqual(['BYE']);
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });

  test('MATCH-019 should show status guidance and ball-provider clarification on match detail', async ({tournamentAdminPage}) => {
    const seedContext = await createSeedContext();

    try {
      const fixture = await seedContext.seedHelper.createSinglesMatchFixture(
        `MATCH-019 ${Date.now()}`,
        [seedContext.participant1Id, seedContext.participant2Id],
        {
          tournamentStatuses: SEEDED_TOURNAMENT_STATUSES,
          courtName: 'Tooltip Court',
          scheduledTime: MATCH_SCHEDULED_TIME,
          matchStatus: 'SCHEDULED',
        },
      );

      const matchPage = new MatchDetailPage(tournamentAdminPage);
      await matchPage.gotoById(fixture.matchId!);
      await matchPage.openStatusModal();

      const statusModal = matchPage.getStatusModal();
      await expect(statusModal).toContainText(/hover over options to see status descriptions/i);
      await expect(statusModal.locator('#status option[value="SCHEDULED"]')).toHaveAttribute(
        'title',
        /ready to be played/i,
      );
      await expect(statusModal.locator('#status option[value="WALKOVER"]')).toHaveAttribute(
        'title',
        /opponent no-show/i,
      );

      await tournamentAdminPage.locator('.modal-header .close-btn').click();
      await tournamentAdminPage.getByRole('button', {name: /schedule match/i}).click();
      await expect(tournamentAdminPage.getByText(/select who provides balls for this match/i)).toBeVisible();
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });

  test('MATCH-002 should transition a match through key status milestones', async ({tournamentAdminPage}) => {
    const seedContext = await createSeedContext();

    try {
      // 1. Start from a SCHEDULED match.
      const fixture = await seedContext.seedHelper.createSinglesMatchFixture(
        `MATCH-002 ${Date.now()}`,
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
      await matchPage.expectStatus(/scheduled|sched/i);

      // 2. Transition to IN_PROGRESS.
      await matchPage.updateStatus('IN_PROGRESS');
      await matchPage.expectStatus(/in progress|ip/i);

      // 3. Transition to SUSPENDED.
      await matchPage.suspendMatch('E2E rain delay');
      await matchPage.expectStatus(/suspended|susp/i);
      // Ensure any modal overlay is fully dismissed before proceeding.
      await tournamentAdminPage.locator('.modal-overlay').waitFor({state: 'hidden'}).catch(() => {});

      // 4. Resume → back to IN_PROGRESS.
      await matchPage.resumeMatch();
      await expect(tournamentAdminPage.locator('.status-badge').first()).toContainText(/in progress|ip/i);

      // 5. Record scores to reach COMPLETED.
      await matchPage.recordScores(seedContext.participant1Name, VALID_SCORE_SET.sets);
      await expect(tournamentAdminPage.locator('.status-badge').first()).toContainText(/completed|comp/i);
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });
});