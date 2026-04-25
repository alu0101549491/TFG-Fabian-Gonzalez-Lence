/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/high/standings.spec.ts
 * @desc High-priority standings and statistics scenarios.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {test, expect} from '../fixtures/auth.fixture';
import {StandingsPage} from '../fixtures/page-objects/standings.page';
import {ApiHelper} from '../helpers/api.helper';
import {SeedHelper} from '../helpers/seed.helper';

interface SeededMatchSummary {
  id: string;
  player1Id: string;
  player2Id: string;
}

function buildWinningScores(winnerId: string, match: SeededMatchSummary): Array<{player1Games: number; player2Games: number}> {
  const winnerIsPlayer1 = match.player1Id === winnerId;

  return winnerIsPlayer1
    ? [{player1Games: 6, player2Games: 3}, {player1Games: 6, player2Games: 4}]
    : [{player1Games: 3, player2Games: 6}, {player1Games: 4, player2Games: 6}];
}

let apiHelper: ApiHelper | undefined;
let seedHelper: SeedHelper | undefined;
let standingsTournamentId = '';

test.describe('Standings - High', () => {
  test.beforeAll(async () => {
    test.setTimeout(90_000);
    apiHelper = await ApiHelper.create();
    const adminSession = await apiHelper.login({
      email: 'tournament@tennistournament.com',
      password: process.env.PLAYWRIGHT_TOURNAMENT_ADMIN_PASSWORD ?? process.env.PW_E2E_TOURNAMENT_ADMIN_PASSWORD ?? 'tourney123',
    });
    seedHelper = new SeedHelper(apiHelper, adminSession);

    const suffix = `${Date.now()}`;
    const players = [
      await seedHelper.createPlayer(`standings-a-${suffix}`),
      await seedHelper.createPlayer(`standings-b-${suffix}`),
      await seedHelper.createPlayer(`standings-c-${suffix}`),
      await seedHelper.createPlayer(`standings-d-${suffix}`),
    ];

    const tournament = await seedHelper.createTournament(`E2E Standings ${suffix}`, {
      maxParticipants: players.length,
    });
    const categoryId = await seedHelper.createSizedCategory(tournament.id, 'Mixed Open Round Robin', players.length);

    for (const player of players) {
      const registrationId = await seedHelper.registerParticipant(categoryId, player.user.id);
      await seedHelper.approveRegistration(registrationId);
    }

    const bracketId = await seedHelper.createBracket(tournament.id, categoryId, players.length, 'ROUND_ROBIN');
    const matches = await seedHelper.getMatchesByBracket(bracketId);
    const playableMatches = matches
      .map((match) => {
        const player1Id = typeof match.player1Id === 'string'
          ? match.player1Id
          : typeof match.participant1Id === 'string'
            ? match.participant1Id
            : '';
        const player2Id = typeof match.player2Id === 'string'
          ? match.player2Id
          : typeof match.participant2Id === 'string'
            ? match.participant2Id
            : '';

        if (typeof match.id !== 'string' || !player1Id || !player2Id) {
          return null;
        }

        return {id: match.id, player1Id, player2Id};
      })
      .filter((match): match is SeededMatchSummary => match !== null);

    const anchorId = playableMatches[0]?.player1Id;
    if (!anchorId) {
      throw new Error('No round-robin matches were generated for standings seeding');
    }

    const anchorMatches = playableMatches.filter((match) => match.player1Id === anchorId || match.player2Id === anchorId).slice(0, 2);
    const extraMatch = playableMatches.find((match) => match.player1Id !== anchorId && match.player2Id !== anchorId);

    for (const match of anchorMatches) {
      await seedHelper.updateMatch(match.id, {
        status: 'COMPLETED',
        winnerId: anchorId,
        scores: buildWinningScores(anchorId, match),
      });
    }

    if (extraMatch) {
      await seedHelper.updateMatch(extraMatch.id, {
        status: 'COMPLETED',
        winnerId: extraMatch.player1Id,
        scores: buildWinningScores(extraMatch.player1Id, extraMatch),
      });
    }

    standingsTournamentId = tournament.id;
  });

  test.afterAll(async () => {
    await seedHelper?.cleanAll();
    await apiHelper?.dispose();
  });

  test('STAND-001 should render grouped standings for tournaments with classification data', async ({participantPage}) => {
    const standingsPage = new StandingsPage(participantPage);
    await standingsPage.gotoForTournament(standingsTournamentId);

    await expect(participantPage.getByRole('heading', {name: /standings/i})).toBeVisible();
    await expect(participantPage.locator('.standings-card').first()).toBeVisible();
  });

  test('STAND-002 should expose updated standings rows after results are confirmed', async ({participantPage}) => {
    const standingsPage = new StandingsPage(participantPage);
    await standingsPage.gotoForTournament(standingsTournamentId);

    const rows = await standingsPage.getRows();
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].position).toBe(1);
  });

  test('STAND-006 should show set and game ratio information for each row', async ({publicPage}) => {
    const standingsPage = new StandingsPage(publicPage);
    await standingsPage.gotoForTournament(standingsTournamentId);

    const firstRow = publicPage.locator('.standing-row').first();
    await expect(firstRow.locator('.stat-ratio').first()).toBeVisible();
    await expect(firstRow.locator('.stat-ratio').nth(1)).toBeVisible();
  });

  test('STAND-008 should render tournament statistics overview, leaderboards, and admin exports', async ({publicPage, tournamentAdminPage}) => {
    await publicPage.goto(`/tournaments/${standingsTournamentId}/statistics`);
    await expect(publicPage.getByRole('heading', {name: /tournament statistics/i})).toBeVisible();
    await expect(publicPage.locator('.stat-label-large').filter({hasText: /^Participants$/})).toBeVisible();
    await expect(publicPage.getByRole('heading', {name: /^Tournament Progress$/})).toBeVisible();
    await expect(publicPage.getByRole('heading', {name: /^Result Distribution$/})).toBeVisible();
    await expect(publicPage.getByRole('heading', {name: /^Top Performers$/})).toBeVisible();
    await expect(publicPage.getByRole('heading', {name: /^Most Active Participants$/})).toBeVisible();
    await expect(publicPage.getByRole('heading', {name: /^Rankings by Category$/})).toBeVisible();
    await expect(publicPage.getByRole('button', {name: /export as pdf/i})).toHaveCount(0);

    await tournamentAdminPage.goto(`/tournaments/${standingsTournamentId}/statistics`);
    await expect(tournamentAdminPage.getByText(/export statistics/i)).toBeVisible();
    await expect(tournamentAdminPage.getByRole('button', {name: /export as pdf/i})).toBeVisible();
    await expect(tournamentAdminPage.getByRole('button', {name: /export as csv/i})).toBeVisible();
  });

  test('STAND-007 should expose head-to-head and split ratio views', async ({publicPage}) => {
    test.skip(true, 'Dedicated head-to-head and split classification UI is not implemented in the current frontend.');

    const standingsPage = new StandingsPage(publicPage);
    await standingsPage.gotoForTournament(standingsTournamentId);
  });
});