/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 14, 2026
 * @file e2e/doubles-tournament.spec.ts
 * @desc End-to-end validation for doubles tournament workflows, including invitations, bracket rendering, team result handling, statistics, and dispute review.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {expect, request, test, type APIRequestContext, type Browser, type BrowserContext, type Page} from '@playwright/test';

const API_BASE_URL = process.env.PLAYWRIGHT_API_BASE_URL ?? 'http://localhost:3000';
const ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL ?? 'admin@tennistournament.com';
const ADMIN_PASSWORD = process.env.PLAYWRIGHT_ADMIN_PASSWORD ?? process.env.PW_E2E_ADMIN_PASSWORD ?? 'admin123';
const JWT_STORAGE_KEY = 'tennis_jwt_token';
const USER_STORAGE_KEY = 'app_user';

/** Authenticated user payload returned by the API login and registration flows. */
interface AuthUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
}

/** Session payload containing the bearer token used by the E2E helpers. */
interface AuthSession {
  token: string;
  user: AuthUser;
}

/** Minimal identifiers captured while building one test tournament scenario. */
interface TournamentSeed {
  tournamentId: string;
  categoryId: string;
  courtId?: string;
  bracketId?: string;
  matchId?: string;
  teamAlphaId?: string;
  teamBetaId?: string;
  name: string;
}

/** Shared seeded state used across the doubles workflow scenarios. */
interface SeedState {
  admin: AuthSession;
  player1: AuthSession;
  player2: AuthSession;
  player3: AuthSession;
  player4: AuthSession;
  pendingInvitationTournament: TournamentSeed;
  confirmedTournament: TournamentSeed;
  disputedTournament: TournamentSeed;
  pendingInvitationId: string;
}

/**
 * Normalizes a relative API path so the helpers always target the backend router prefix.
 *
 * @param path - Endpoint path with or without a leading slash
 * @returns API path rooted under `/api`
 */
function withApiPrefix(path: string): string {
  return `/api${path.startsWith('/') ? path : `/${path}`}`;
}

const createdTournamentIds: string[] = [];
const createdUserIds: string[] = [];
let seededState: SeedState;

/**
 * Parses a JSON HTTP response while tolerating empty bodies from helper endpoints.
 *
 * @param response - Playwright API response to parse
 * @returns Parsed response payload or an empty typed object when no body is present
 */
async function parseJson<T>(response: Awaited<ReturnType<APIRequestContext['fetch']>>): Promise<T> {
  const text = await response.text();
  return text ? JSON.parse(text) as T : ({} as T);
}

/**
 * Performs an authenticated API GET and rejects unexpected non-success responses.
 *
 * @param apiContext - Playwright API request context
 * @param path - Endpoint path under the API prefix
 * @param token - Optional bearer token
 * @returns Parsed JSON response body
 */
async function apiGet<T>(
  apiContext: APIRequestContext,
  path: string,
  token?: string,
): Promise<T> {
  const response = await apiContext.get(withApiPrefix(path), {
    headers: token ? {Authorization: `Bearer ${token}`} : undefined,
  });

  if (!response.ok()) {
    throw new Error(`GET ${path} failed with ${response.status()}: ${await response.text()}`);
  }

  return parseJson<T>(response);
}

/**
 * Performs an authenticated API POST and validates the expected response status.
 *
 * @param apiContext - Playwright API request context
 * @param path - Endpoint path under the API prefix
 * @param data - Request body to submit
 * @param token - Optional bearer token
 * @param expectedStatus - Required HTTP status for success
 * @returns Parsed JSON response body
 */
async function apiPost<T>(
  apiContext: APIRequestContext,
  path: string,
  data: unknown,
  token?: string,
  expectedStatus: number = 201,
): Promise<T> {
  const response = await apiContext.post(withApiPrefix(path), {
    data,
    headers: token ? {Authorization: `Bearer ${token}`} : undefined,
  });

  if (response.status() !== expectedStatus) {
    throw new Error(`POST ${path} failed with ${response.status()}: ${await response.text()}`);
  }

  return parseJson<T>(response);
}

/**
 * Performs an authenticated API PUT and validates the expected response status.
 *
 * @param apiContext - Playwright API request context
 * @param path - Endpoint path under the API prefix
 * @param data - Request body to submit
 * @param token - Bearer token for the authenticated actor
 * @param expectedStatus - Required HTTP status for success
 * @returns Parsed JSON response body
 */
async function apiPut<T>(
  apiContext: APIRequestContext,
  path: string,
  data: unknown,
  token: string,
  expectedStatus: number = 200,
): Promise<T> {
  const response = await apiContext.put(withApiPrefix(path), {
    data,
    headers: {Authorization: `Bearer ${token}`},
  });

  if (response.status() !== expectedStatus) {
    throw new Error(`PUT ${path} failed with ${response.status()}: ${await response.text()}`);
  }

  return parseJson<T>(response);
}

/**
 * Deletes a resource while tolerating already-cleaned records during teardown.
 *
 * @param apiContext - Playwright API request context
 * @param path - Endpoint path under the API prefix
 * @param token - Bearer token for the authenticated actor
 * @returns Promise resolved when deletion is accepted or the resource is already gone
 */
async function apiDelete(
  apiContext: APIRequestContext,
  path: string,
  token: string,
): Promise<void> {
  const response = await apiContext.delete(withApiPrefix(path), {
    headers: {Authorization: `Bearer ${token}`},
  });

  if (!response.ok() && response.status() !== 404 && response.status() !== 400) {
    throw new Error(`DELETE ${path} failed with ${response.status()}: ${await response.text()}`);
  }
}

/**
 * Signs in with an existing user account and returns the resulting session.
 *
 * @param apiContext - Playwright API request context
 * @param email - Account email
 * @param password - Account password
 * @returns Authenticated session payload
 */
async function loginUser(
  apiContext: APIRequestContext,
  email: string,
  password: string,
): Promise<AuthSession> {
  return apiPost<AuthSession>(apiContext, '/auth/login', {email, password}, undefined, 200);
}

/**
 * Registers a player account dedicated to the current E2E run.
 *
 * @param apiContext - Playwright API request context
 * @param suffix - Unique suffix to isolate account identities per run
 * @param firstName - Player first name
 * @param lastName - Player last name
 * @returns Authenticated session for the newly created player
 */
async function registerPlayer(
  apiContext: APIRequestContext,
  suffix: string,
  firstName: string,
  lastName: string,
): Promise<AuthSession> {
  const session = await apiPost<AuthSession>(apiContext, '/auth/register', {
    email: `${suffix}.${firstName.toLowerCase()}@doubles-e2e.test`,
    password: 'Password123!',
    firstName,
    lastName,
    username: `${suffix}_${firstName.toLowerCase()}`,
  });

  createdUserIds.push(session.user.id);
  return session;
}

/**
 * Creates and opens a minimal doubles tournament with one playable category.
 *
 * @param apiContext - Playwright API request context
 * @param admin - Authenticated administrator session
 * @param name - Tournament name
 * @returns Seed information used by later workflow helpers
 */
async function createDoublesTournament(
  apiContext: APIRequestContext,
  admin: AuthSession,
  name: string,
): Promise<TournamentSeed> {
  const startDate = new Date('2026-05-20T09:00:00.000Z');
  const endDate = new Date('2026-05-22T18:00:00.000Z');
  const registrationOpenDate = new Date('2026-05-01T09:00:00.000Z');
  const registrationCloseDate = new Date('2026-05-19T18:00:00.000Z');

  const tournament = await apiPost<{id: string}>(
    apiContext,
    '/tournaments',
    {
      name,
      description: `${name} automated doubles validation`,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      registrationOpenDate: registrationOpenDate.toISOString(),
      registrationCloseDate: registrationCloseDate.toISOString(),
      location: 'La Laguna',
      surface: 'HARD',
      facilityType: 'OUTDOOR',
      tournamentType: 'DOUBLES',
      maxParticipants: 4,
      registrationFee: 0,
      currency: 'EUR',
      rankingSystem: 'POINTS_BASED',
    },
    admin.token,
  );

  createdTournamentIds.push(tournament.id);

  await apiPut(apiContext, `/tournaments/${tournament.id}/status`, {status: 'REGISTRATION_OPEN'}, admin.token);

  const category = await apiPost<{id: string}>(
    apiContext,
    '/categories',
    {
      tournamentId: tournament.id,
      name: 'Mixed Doubles Open',
      gender: 'MIXED',
      ageGroup: 'OPEN',
      maxParticipants: 4,
    },
    admin.token,
  );

  return {
    tournamentId: tournament.id,
    categoryId: category.id,
    name,
  };
}

/**
 * Creates a court that can be used to schedule the generated doubles match.
 *
 * @param apiContext - Playwright API request context
 * @param admin - Authenticated administrator session
 * @param tournamentId - Tournament that owns the court
 * @param name - Court name
 * @returns Created court identifier
 */
async function createCourt(
  apiContext: APIRequestContext,
  admin: AuthSession,
  tournamentId: string,
  name: string,
): Promise<string> {
  const court = await apiPost<{id: string}>(
    apiContext,
    '/courts',
    {
      tournamentId,
      name,
      openingTime: '08:00',
      closingTime: '22:00',
    },
    admin.token,
  );

  return court.id;
}

/**
 * Sends a doubles partner invitation between two players in the target tournament.
 *
 * @param apiContext - Playwright API request context
 * @param inviter - Inviting player session
 * @param invitee - Invited player session
 * @param tournament - Target tournament seed data
 * @returns Created invitation identifier
 */
async function sendInvitation(
  apiContext: APIRequestContext,
  inviter: AuthSession,
  invitee: AuthSession,
  tournament: TournamentSeed,
): Promise<string> {
  const response = await apiPost<{invitation: {id: string}}>(
    apiContext,
    '/partner-invitations/send',
    {
      inviteeId: invitee.user.id,
      tournamentId: tournament.tournamentId,
      categoryId: tournament.categoryId,
      message: `Join ${tournament.name}`,
    },
    inviter.token,
  );

  return response.invitation.id;
}

/**
 * Accepts a previously created doubles partner invitation.
 *
 * @param apiContext - Playwright API request context
 * @param invitee - Invited player session
 * @param invitationId - Invitation identifier to accept
 * @returns Promise resolved when the invitation is accepted
 */
async function acceptInvitation(
  apiContext: APIRequestContext,
  invitee: AuthSession,
  invitationId: string,
): Promise<void> {
  await apiPost(apiContext, `/partner-invitations/${invitationId}/accept`, {}, invitee.token, 200);
}

/**
 * Approves every pending registration for the supplied tournament.
 *
 * @param apiContext - Playwright API request context
 * @param admin - Authenticated administrator session
 * @param tournamentId - Tournament whose registrations should be accepted
 * @returns Promise resolved when all registrations have been updated
 */
async function approveTournamentRegistrations(
  apiContext: APIRequestContext,
  admin: AuthSession,
  tournamentId: string,
): Promise<void> {
  const registrations = await apiGet<Array<{id: string}>>(
    apiContext,
    `/registrations?tournamentId=${tournamentId}`,
    admin.token,
  );

  for (const registration of registrations) {
    await apiPut(
      apiContext,
      `/registrations/${registration.id}/status`,
      {
        status: 'ACCEPTED',
        acceptanceType: 'DIRECT_ACCEPTANCE',
      },
      admin.token,
    );
  }
}

/**
 * Generates a bracket and captures the single doubles match identifiers used in the tests.
 *
 * @param apiContext - Playwright API request context
 * @param admin - Authenticated administrator session
 * @param tournament - Target tournament seed data to enrich
 * @returns Promise resolved when bracket and match identifiers have been stored
 */
async function generateBracket(
  apiContext: APIRequestContext,
  admin: AuthSession,
  tournament: TournamentSeed,
): Promise<void> {
  const bracket = await apiPost<{id: string}>(
    apiContext,
    '/brackets',
    {
      tournamentId: tournament.tournamentId,
      categoryId: tournament.categoryId,
      bracketType: 'SINGLE_ELIMINATION',
      size: 2,
      totalRounds: 1,
      structure: null,
      isPublished: false,
    },
    admin.token,
  );

  tournament.bracketId = bracket.id;

  const matches = await apiGet<Array<{id: string; participant1TeamId: string; participant2TeamId: string}>>(
    apiContext,
    `/matches?bracketId=${bracket.id}`,
    admin.token,
  );

  if (matches.length !== 1) {
    throw new Error(`Expected 1 match for ${tournament.name}, received ${matches.length}`);
  }

  tournament.matchId = matches[0].id;
  tournament.teamAlphaId = matches[0].participant1TeamId;
  tournament.teamBetaId = matches[0].participant2TeamId;
}

/**
 * Schedules the generated doubles match on the tournament court.
 *
 * @param apiContext - Playwright API request context
 * @param admin - Authenticated administrator session
 * @param tournament - Tournament seed with court and match identifiers
 * @param scheduledTime - ISO date-time assigned to the match
 * @returns Promise resolved when the match schedule has been updated
 */
async function scheduleMatch(
  apiContext: APIRequestContext,
  admin: AuthSession,
  tournament: TournamentSeed,
  scheduledTime: string,
): Promise<void> {
  if (!tournament.matchId || !tournament.courtId) {
    throw new Error(`Cannot schedule match for ${tournament.name} without matchId and courtId`);
  }

  await apiPut(
    apiContext,
    `/matches/${tournament.matchId}`,
    {
      courtId: tournament.courtId,
      scheduledTime,
      status: 'SCHEDULED',
      ballProvider: 'Wilson',
    },
    admin.token,
  );
}

/**
 * Creates a browser context preloaded with the supplied authenticated session.
 *
 * @param browser - Playwright browser instance
 * @param session - Authenticated API session to inject into local storage
 * @returns Browser context and page ready to use as the authenticated actor
 */
async function createAuthenticatedPage(
  browser: Browser,
  session: AuthSession,
): Promise<{context: BrowserContext; page: Page}> {
  const context = await browser.newContext();
  await context.addInitScript(
    ({token, user, jwtStorageKey, userStorageKey}) => {
      localStorage.setItem(jwtStorageKey, token);
      localStorage.setItem(userStorageKey, JSON.stringify(user));
    },
    {
      token: session.token,
      user: session.user,
      jwtStorageKey: JWT_STORAGE_KEY,
      userStorageKey: USER_STORAGE_KEY,
    },
  );

  const page = await context.newPage();
  return {context, page};
}

test.describe('Doubles Tournament Workflow', () => {
  test.beforeAll(async () => {
    const apiContext = await request.newContext({baseURL: API_BASE_URL});
    const suffix = `dbl${Date.now().toString(36)}`;

    const admin = await loginUser(apiContext, ADMIN_EMAIL, ADMIN_PASSWORD);
    const player1 = await registerPlayer(apiContext, suffix, 'Alice', 'Ace');
    const player2 = await registerPlayer(apiContext, suffix, 'Bea', 'Backhand');
    const player3 = await registerPlayer(apiContext, suffix, 'Cara', 'Cross');
    const player4 = await registerPlayer(apiContext, suffix, 'Dana', 'Drop');

    const pendingInvitationTournament = await createDoublesTournament(apiContext, admin, `${suffix}-pending`);
    const confirmedTournament = await createDoublesTournament(apiContext, admin, `${suffix}-confirmed`);
    const disputedTournament = await createDoublesTournament(apiContext, admin, `${suffix}-disputed`);

    pendingInvitationTournament.courtId = await createCourt(apiContext, admin, pendingInvitationTournament.tournamentId, 'Court Pending');
    confirmedTournament.courtId = await createCourt(apiContext, admin, confirmedTournament.tournamentId, 'Court Confirmed');
    disputedTournament.courtId = await createCourt(apiContext, admin, disputedTournament.tournamentId, 'Court Disputed');

    const pendingInvitationId = await sendInvitation(apiContext, player1, player2, pendingInvitationTournament);

    const confirmedInvitationAlpha = await sendInvitation(apiContext, player1, player2, confirmedTournament);
    const confirmedInvitationBeta = await sendInvitation(apiContext, player3, player4, confirmedTournament);
    await acceptInvitation(apiContext, player2, confirmedInvitationAlpha);
    await acceptInvitation(apiContext, player4, confirmedInvitationBeta);
    await approveTournamentRegistrations(apiContext, admin, confirmedTournament.tournamentId);
    await generateBracket(apiContext, admin, confirmedTournament);
    await scheduleMatch(apiContext, admin, confirmedTournament, '2026-05-20T09:00:00.000Z');

    const disputedInvitationAlpha = await sendInvitation(apiContext, player1, player2, disputedTournament);
    const disputedInvitationBeta = await sendInvitation(apiContext, player3, player4, disputedTournament);
    await acceptInvitation(apiContext, player2, disputedInvitationAlpha);
    await acceptInvitation(apiContext, player4, disputedInvitationBeta);
    await approveTournamentRegistrations(apiContext, admin, disputedTournament.tournamentId);
    await generateBracket(apiContext, admin, disputedTournament);
    await scheduleMatch(apiContext, admin, disputedTournament, '2026-05-21T09:00:00.000Z');

    seededState = {
      admin,
      player1,
      player2,
      player3,
      player4,
      pendingInvitationTournament,
      confirmedTournament,
      disputedTournament,
      pendingInvitationId,
    };

    await apiContext.dispose();
  });

  test.afterAll(async () => {
    const apiContext = await request.newContext({baseURL: API_BASE_URL});

    try {
      if (seededState?.admin) {
        for (const tournamentId of createdTournamentIds.reverse()) {
          await apiDelete(apiContext, `/tournaments/${tournamentId}`, seededState.admin.token);
        }

        for (const userId of createdUserIds.reverse()) {
          await apiDelete(apiContext, `/users/${userId}`, seededState.admin.token);
        }
      }
    } finally {
      await apiContext.dispose();
    }
  });

  test('renders doubles creation, invitation, bracket, scheduling, scoring, and my matches UI', async ({browser}) => {
    const adminPageState = await createAuthenticatedPage(browser, seededState.admin);
    const inviteePageState = await createAuthenticatedPage(browser, seededState.player2);
    const playerPageState = await createAuthenticatedPage(browser, seededState.player1);

    try {
      await adminPageState.page.goto('/tournaments/create');
      await expect(adminPageState.page.getByRole('heading', {name: /create tournament/i})).toBeVisible();
      await expect(adminPageState.page.locator('#tournamentType')).toContainText('Doubles');

      await inviteePageState.page.goto('/my-invitations');
      await expect(inviteePageState.page.getByRole('heading', {name: /partner invitations/i})).toBeVisible();
      await expect(inviteePageState.page.getByRole('link', {name: seededState.pendingInvitationTournament.name})).toBeVisible();
      await expect(inviteePageState.page.getByRole('button', {name: /accept/i})).toBeVisible();

      await adminPageState.page.goto(`/brackets/${seededState.confirmedTournament.bracketId}`);
      await expect(adminPageState.page.locator('h1')).toContainText('Tournament Bracket', {timeout: 15000});
      await expect(adminPageState.page.getByText('Alice Ace / Bea Backhand')).toBeVisible({timeout: 15000});
      await expect(adminPageState.page.getByText('Cara Cross / Dana Drop')).toBeVisible({timeout: 15000});

      await playerPageState.page.goto('/my-matches');
      await expect(playerPageState.page.getByRole('heading', {name: /my matches/i})).toBeVisible();
      await expect(playerPageState.page.getByText('Alice Ace / Bea Backhand')).toBeVisible();
      await expect(playerPageState.page.getByText('Cara Cross / Dana Drop')).toBeVisible();
      await expect(playerPageState.page.getByText('Court Confirmed')).toBeVisible();

      await adminPageState.page.goto(`/matches/${seededState.confirmedTournament.matchId}`);
      await expect(adminPageState.page.getByRole('heading', {name: /match details/i})).toBeVisible();
      await adminPageState.page.getByRole('button', {name: /schedule match/i}).click();
      await expect(adminPageState.page.getByRole('heading', {name: /schedule match/i})).toBeVisible();
      await expect(adminPageState.page.locator('#courtId')).toContainText('Court Confirmed');
      await adminPageState.page.getByRole('button', {name: /^cancel$/i}).click();

      await adminPageState.page.getByRole('button', {name: /record scores/i}).click();
      await expect(adminPageState.page.getByRole('heading', {name: /record match scores/i})).toBeVisible();
      await expect(adminPageState.page.getByText('Alice Ace / Bea Backhand')).toBeVisible();
      await expect(adminPageState.page.getByText('Cara Cross / Dana Drop')).toBeVisible();
      await adminPageState.page.getByRole('button', {name: /^cancel$/i}).click();
    } finally {
      await adminPageState.context.close();
      await inviteePageState.context.close();
      await playerPageState.context.close();
    }
  });

  test('enforces teammate confirmation restrictions and surfaces doubles statistics and dispute UI', async ({browser}) => {
    const apiContext = await request.newContext({baseURL: API_BASE_URL});

    try {
      const confirmedSubmitResponse = await apiContext.post(
        withApiPrefix(`/matches/${seededState.confirmedTournament.matchId}/result`),
        {
          data: {
            winnerId: seededState.confirmedTournament.teamAlphaId,
            setScores: ['6-4', '6-3'],
            player1Games: 12,
            player2Games: 7,
            playerComments: 'Confirmed doubles result',
          },
          headers: {Authorization: `Bearer ${seededState.player1.token}`},
        },
      );
      expect(confirmedSubmitResponse.status()).toBe(201);

      const teammateConfirmResponse = await apiContext.post(
        withApiPrefix(`/matches/${seededState.confirmedTournament.matchId}/result/confirm`),
        {
          data: {},
          headers: {Authorization: `Bearer ${seededState.player2.token}`},
        },
      );
      expect(teammateConfirmResponse.status()).toBe(403);
      await expect(teammateConfirmResponse.text()).resolves.toContain("Cannot confirm your teammate's result");

      const opponentConfirmResponse = await apiContext.post(
        withApiPrefix(`/matches/${seededState.confirmedTournament.matchId}/result/confirm`),
        {
          data: {},
          headers: {Authorization: `Bearer ${seededState.player3.token}`},
        },
      );
      expect(opponentConfirmResponse.status()).toBe(200);

      const disputedSubmitResponse = await apiContext.post(
        withApiPrefix(`/matches/${seededState.disputedTournament.matchId}/result`),
        {
          data: {
            winnerId: seededState.disputedTournament.teamAlphaId,
            setScores: ['7-5', '6-4'],
            player1Games: 13,
            player2Games: 9,
            playerComments: 'Result requires review',
          },
          headers: {Authorization: `Bearer ${seededState.player1.token}`},
        },
      );
      expect(disputedSubmitResponse.status()).toBe(201);

      const teammateDisputeResponse = await apiContext.post(
        withApiPrefix(`/matches/${seededState.disputedTournament.matchId}/result/dispute`),
        {
          data: {disputeReason: 'Teammate should not be able to dispute'},
          headers: {Authorization: `Bearer ${seededState.player2.token}`},
        },
      );
      expect(teammateDisputeResponse.status()).toBe(403);
      await expect(teammateDisputeResponse.text()).resolves.toContain("Cannot dispute your teammate's result");

      const opponentDisputeResponse = await apiContext.post(
        withApiPrefix(`/matches/${seededState.disputedTournament.matchId}/result/dispute`),
        {
          data: {disputeReason: 'Opponent disputes the submitted score'},
          headers: {Authorization: `Bearer ${seededState.player3.token}`},
        },
      );
      expect(opponentDisputeResponse.status()).toBe(200);

      const playerStatisticsState = await createAuthenticatedPage(browser, seededState.player1);
      const adminDisputeState = await createAuthenticatedPage(browser, seededState.admin);

      try {
        await playerStatisticsState.page.goto('/statistics');
        await expect(playerStatisticsState.page.getByRole('heading', {name: /player statistics/i})).toBeVisible();
        await expect(playerStatisticsState.page.getByRole('heading', {name: /doubles team matchup history/i})).toBeVisible();
        await expect(playerStatisticsState.page.getByText('Cara Cross / Dana Drop')).toBeVisible();
        await playerStatisticsState.page.getByRole('button', {name: /view match history/i}).click();
        await expect(playerStatisticsState.page.getByText('6-4, 6-3')).toBeVisible();
        await expect(playerStatisticsState.page.getByText(seededState.confirmedTournament.name)).toBeVisible();

        await adminDisputeState.page.goto('/admin/disputed-matches');
        await expect(adminDisputeState.page.getByRole('heading', {name: /disputed matches/i})).toBeVisible();
        await expect(adminDisputeState.page.getByRole('heading', {name: 'Alice Ace / Bea Backhand'}).first()).toBeVisible();
        await expect(adminDisputeState.page.getByRole('heading', {name: 'Cara Cross / Dana Drop'}).first()).toBeVisible();
        await expect(adminDisputeState.page.getByText('Opponent disputes the submitted score').first()).toBeVisible();

        const resolveResponse = await apiContext.put(
          withApiPrefix(`/admin/matches/${seededState.disputedTournament.matchId}/result/resolve`),
          {
            data: {
              winnerId: seededState.disputedTournament.teamAlphaId,
              setScores: ['7-5', '6-4'],
              resolutionNotes: 'Validated by automated doubles dispute flow',
            },
            headers: {Authorization: `Bearer ${seededState.admin.token}`},
          },
        );
        expect(resolveResponse.status()).toBe(200);
      } finally {
        await playerStatisticsState.context.close();
        await adminDisputeState.context.close();
      }
    } finally {
      await apiContext.dispose();
    }
  });
});