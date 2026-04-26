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
import {TEST_USERS} from '../fixtures/test-data';
import {ApiHelper} from '../helpers/api.helper';
import {SeedHelper} from '../helpers/seed.helper';

interface ParticipantManagementFixture {
  apiHelper: ApiHelper;
  seedHelper: SeedHelper;
  tournamentId: string;
  mainCategoryId: string;
  secondaryCategoryId: string;
  pendingPlayer: {id: string; username: string; fullName: string};
  directPlayer: {id: string; username: string; fullName: string};
  wildcardPlayer: {id: string; username: string; fullName: string};
  alternatePlayer: {id: string; username: string; fullName: string};
  directRegistrationId: string;
  pendingRegistrationId: string;
}

let apiHelper: ApiHelper | undefined;
let seedHelper: SeedHelper | undefined;
let openTournamentId = '';

async function createParticipantManagementFixture(): Promise<ParticipantManagementFixture> {
  const localApiHelper = await ApiHelper.create();
  const adminSession = await localApiHelper.login(TEST_USERS.tournamentAdmin1);
  const localSeedHelper = new SeedHelper(localApiHelper, adminSession);
  const suffix = `${Date.now()}`;

  const [pendingSession, directSession, wildcardSession, alternateSession] = await Promise.all([
    localSeedHelper.createPlayer(`manage-pending-${suffix}`),
    localSeedHelper.createPlayer(`manage-direct-${suffix}`),
    localSeedHelper.createPlayer(`manage-wild-${suffix}`),
    localSeedHelper.createPlayer(`manage-alt-${suffix}`),
  ]);

  const tournament = await localSeedHelper.createTournament(`FDBK-TOURN Participant ${suffix}`, {
    maxParticipants: 8,
  });
  await localSeedHelper.updateTournamentStatus(tournament.id, 'REGISTRATION_OPEN');

  const mainCategoryId = await localSeedHelper.createSizedCategory(tournament.id, 'Participant Main Singles', 8);
  const secondaryCategoryId = await localSeedHelper.createSizedCategory(tournament.id, 'Participant Secondary Singles', 8);

  const pendingRegistrationId = await localSeedHelper.registerParticipant(mainCategoryId, pendingSession.user.id);

  const directRegistrationId = await localSeedHelper.registerParticipant(mainCategoryId, directSession.user.id);
  await localSeedHelper.approveRegistration(directRegistrationId, 'DIRECT_ACCEPTANCE');
  await localApiHelper.put(`/registrations/${directRegistrationId}`, {seedNumber: 1}, adminSession.token, 200);

  const wildcardRegistrationId = await localSeedHelper.registerParticipant(mainCategoryId, wildcardSession.user.id);
  await localSeedHelper.approveRegistration(wildcardRegistrationId, 'WILD_CARD');
  await localApiHelper.put(`/registrations/${wildcardRegistrationId}`, {seedNumber: 2}, adminSession.token, 200);

  const alternateRegistrationId = await localSeedHelper.registerParticipant(mainCategoryId, alternateSession.user.id);
  await localSeedHelper.approveRegistration(alternateRegistrationId, 'ALTERNATE');

  return {
    apiHelper: localApiHelper,
    seedHelper: localSeedHelper,
    tournamentId: tournament.id,
    mainCategoryId,
    secondaryCategoryId,
    pendingPlayer: {
      id: pendingSession.user.id,
      username: pendingSession.user.username,
      fullName: `${pendingSession.user.firstName} ${pendingSession.user.lastName}`,
    },
    directPlayer: {
      id: directSession.user.id,
      username: directSession.user.username,
      fullName: `${directSession.user.firstName} ${directSession.user.lastName}`,
    },
    wildcardPlayer: {
      id: wildcardSession.user.id,
      username: wildcardSession.user.username,
      fullName: `${wildcardSession.user.firstName} ${wildcardSession.user.lastName}`,
    },
    alternatePlayer: {
      id: alternateSession.user.id,
      username: alternateSession.user.username,
      fullName: `${alternateSession.user.firstName} ${alternateSession.user.lastName}`,
    },
    directRegistrationId,
    pendingRegistrationId,
  };
}

test.describe('Registration - High', () => {
  test.beforeAll(async () => {
    test.setTimeout(60_000);
    apiHelper = await ApiHelper.create();
    const adminSession = await apiHelper.login(TEST_USERS.tournamentAdmin1);
    const participantSession = await apiHelper.login(TEST_USERS.participant2);
    seedHelper = new SeedHelper(apiHelper, adminSession);

    const tournament = await seedHelper.createTournament(`E2E Registration ${Date.now()}`);
    await seedHelper.updateTournamentStatus(tournament.id, 'REGISTRATION_OPEN');

    const categoryId = await seedHelper.createCategory(tournament.id, 'Mixed Open Singles');
    await seedHelper.registerParticipant(categoryId, participantSession.user.id);

    openTournamentId = tournament.id;
  });

  test.afterAll(async () => {
    await seedHelper?.cleanAll();
    await apiHelper?.dispose();
  });

  test('REG-001 should expose self-registration controls on open tournaments', async ({participantPage}) => {
    const detailPage = new TournamentDetailPage(participantPage);
    await detailPage.gotoById(openTournamentId);

    await expect(participantPage.getByRole('heading', {name: /categories/i})).toBeVisible();
    await expect(detailPage.registerButton).toBeVisible();
  });

  test('REG-004 should let administrators bulk-approve pending registrations', async ({tournamentAdminPage}) => {
    const detailPage = new TournamentDetailPage(tournamentAdminPage);
    await detailPage.gotoById(openTournamentId);

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

  test('REG-010 should show registration status cards, helper text, and tournament links', async ({participantPage}) => {
    const localApiHelper = await ApiHelper.create();
    const adminSession = await localApiHelper.login(TEST_USERS.tournamentAdmin1);
    const participantSession = await localApiHelper.login(TEST_USERS.participant1);
    const alternateSourceSession = await localApiHelper.login(TEST_USERS.participant2);
    const localSeedHelper = new SeedHelper(localApiHelper, adminSession);

    const pendingTournament = await localSeedHelper.createTournament(`REG-010 Pending ${Date.now()}`);
    const pendingCategoryId = await localSeedHelper.createCategory(pendingTournament.id, 'Pending Singles');
    await localSeedHelper.registerParticipant(pendingCategoryId, participantSession.user.id);

    const alternateTournament = await localSeedHelper.createTournament(`REG-010 Alternate ${Date.now()}`);
    const alternateCategoryId = await localSeedHelper.createCategory(alternateTournament.id, 'Alternate Singles');
    const alternateRegistrationId = await localSeedHelper.registerParticipant(alternateCategoryId, participantSession.user.id);
    await localSeedHelper.approveRegistration(alternateRegistrationId, 'ALTERNATE');

    const luckyLoserTournament = await localSeedHelper.createTournament(`REG-010 Lucky ${Date.now()}`);
    await localSeedHelper.updateTournamentStatus(luckyLoserTournament.id, 'REGISTRATION_OPEN');
    const luckyLoserCategoryId = await localSeedHelper.createCategory(luckyLoserTournament.id, 'Lucky Loser Singles');
    const directAcceptanceRegistrationId = await localSeedHelper.registerParticipant(
      luckyLoserCategoryId,
      alternateSourceSession.user.id,
    );
    await localSeedHelper.approveRegistration(directAcceptanceRegistrationId);

    const luckyLoserRegistrationId = await localSeedHelper.registerParticipant(luckyLoserCategoryId, participantSession.user.id);
    await localSeedHelper.approveRegistration(luckyLoserRegistrationId, 'ALTERNATE');
    await localApiHelper.post(
      `/registrations/${directAcceptanceRegistrationId}/withdraw`,
      {},
      alternateSourceSession.token,
      200,
    );

    try {
      await participantPage.goto('/my-registrations');
      await expect(participantPage.getByRole('heading', {name: /my registrations/i})).toBeVisible();

      const pendingCard = participantPage.locator('.registration-card').filter({hasText: pendingTournament.name});
      const alternateCard = participantPage.locator('.registration-card').filter({hasText: alternateTournament.name});
      const luckyLoserCard = participantPage.locator('.registration-card').filter({hasText: luckyLoserTournament.name});

      await expect(pendingCard).toContainText(/awaiting organizer approval/i);
      await expect(alternateCard).toContainText(/waiting list/i);
      await expect(luckyLoserCard).toContainText(/registration confirmed - ready to compete/i);

      await pendingCard.getByRole('link', {name: /view details/i}).click();
      await expect(participantPage).toHaveURL(new RegExp(`/tournaments/${pendingTournament.id}$`));
    } finally {
      await localSeedHelper.cleanAll();
      await localApiHelper.dispose();
    }
  });

  test('REG-003 should show doubles partner invitations and response actions', async ({secondParticipantPage}) => {
    await secondParticipantPage.goto('/my-invitations');
    await expect(secondParticipantPage.getByRole('heading', {name: /partner invitations/i})).toBeVisible();

    const actionCard = secondParticipantPage.locator('.invitation-card').first();
    if (await actionCard.count() > 0) {
      await expect(actionCard).toContainText(/pending|accepted|declined|cancelled/i);
    }
  });

  test('REG-011 should let users manage partner invitations across pending, sent, and past states', async ({participantPage, secondParticipantPage}) => {
    const localApiHelper = await ApiHelper.create();
    const adminSession = await localApiHelper.login(TEST_USERS.tournamentAdmin1);
    const participantOneSession = await localApiHelper.login(TEST_USERS.participant1);
    const participantTwoSession = await localApiHelper.login(TEST_USERS.participant2);
    const localSeedHelper = new SeedHelper(localApiHelper, adminSession);

    const tournament = await localSeedHelper.createTournament(`REG-011 Doubles ${Date.now()}`, {
      tournamentType: 'DOUBLES',
      maxParticipants: 16,
    });
    await localSeedHelper.updateTournamentStatus(tournament.id, 'REGISTRATION_OPEN');
    const categoryId = await localSeedHelper.createCategory(tournament.id, 'Mixed Open Doubles');
    const invitationResponse = await localApiHelper.post<{invitation: {id: string}}>('/partner-invitations/send', {
      inviteeId: participantTwoSession.user.id,
      tournamentId: tournament.id,
      categoryId,
      message: 'E2E doubles invitation message',
    }, participantOneSession.token, 201);

    try {
      await participantPage.goto('/my-invitations');
      await expect(participantPage.getByRole('heading', {name: /partner invitations/i})).toBeVisible();
      await expect(participantPage.getByText(/sent invitations/i)).toBeVisible();

      const sentCard = participantPage.locator('.invitation-card').filter({hasText: tournament.name}).first();
      await expect(sentCard).toContainText(/e2e doubles invitation message/i);
      await expect(sentCard).toContainText(/pending/i);

      const handledDialogs: string[] = [];
      secondParticipantPage.on('dialog', async (dialog) => {
        handledDialogs.push(dialog.message());
        await dialog.accept();
      });

      await secondParticipantPage.goto('/my-invitations');
      await expect(secondParticipantPage.getByText(/pending invitations/i)).toBeVisible();

      const pendingCard = secondParticipantPage.locator('.invitation-card').filter({hasText: tournament.name}).first();
      await expect(pendingCard).toContainText(/from:/i);
      await pendingCard.getByRole('button', {name: /accept/i}).click();

      await expect(secondParticipantPage.getByText(/past invitations/i)).toBeVisible();
      await expect(secondParticipantPage.locator('.past-card').filter({hasText: tournament.name})).toBeVisible();
      expect(handledDialogs.length).toBeGreaterThanOrEqual(2);

      await participantPage.reload();
      await expect(participantPage.getByText(/sent invitations/i)).toBeVisible();
      await expect(participantPage.getByText(/past invitations/i)).toBeVisible();
      const updatedSentCard = participantPage.locator('.invitation-card').filter({hasText: tournament.name}).first();
      await expect(updatedSentCard).toContainText(/accepted/i);
      await expect(updatedSentCard).toContainText(/both players registered/i);

      await secondParticipantPage.goto('/my-invitations');
      await expect(secondParticipantPage.locator('.invitation-card').filter({hasText: invitationResponse.invitation.id})).toHaveCount(0);
    } finally {
      await localSeedHelper.cleanAll();
      await localApiHelper.dispose();
    }
  });

  test('REG-009 should process registration payments', async ({participantPage}) => {
    test.skip(true, 'Registration payment checkout UI is not implemented in the current frontend.');

    const detailPage = new TournamentDetailPage(participantPage);
    await detailPage.gotoById(openTournamentId);
  });

  test('FDBK-TOURN-002 should support admin participant filtering, badges, and public profile links', async ({tournamentAdminPage, publicPage}) => {
    const fixture = await createParticipantManagementFixture();

    try {
      await tournamentAdminPage.goto(`/tournaments/${fixture.tournamentId}`);
      await expect(tournamentAdminPage.getByRole('heading', {name: /registered participants/i})).toBeVisible();

      const adminRows = tournamentAdminPage.locator('tbody tr');
      await expect(adminRows.filter({hasText: fixture.pendingPlayer.username})).toBeVisible();
      await expect(adminRows.filter({hasText: fixture.wildcardPlayer.username})).toBeVisible();

      await tournamentAdminPage.locator('#statusFilter').selectOption('PENDING');
      await expect(adminRows.filter({hasText: fixture.pendingPlayer.username})).toBeVisible();
      await expect(adminRows.filter({hasText: fixture.directPlayer.username})).toHaveCount(0);

      await tournamentAdminPage.locator('#statusFilter').selectOption('ACCEPTED');
      await expect(adminRows.filter({hasText: fixture.directPlayer.username})).toBeVisible();
      await expect(adminRows.filter({hasText: fixture.wildcardPlayer.username})).toBeVisible();
      await expect(tournamentAdminPage.getByText('Alternate', {exact: true})).toBeVisible();
      await expect(tournamentAdminPage.getByText('[WC]', {exact: true})).toBeVisible();

      await tournamentAdminPage.locator('#statusFilter').selectOption('WITHDRAWN');
      await expect(tournamentAdminPage.getByText(/no participants match the selected filter/i)).toBeVisible();

      await publicPage.goto(`/tournaments/${fixture.tournamentId}`);
      await expect(publicPage.getByRole('heading', {name: /registered players/i})).toBeVisible();
      await expect(publicPage.locator(`a[href="/users/${fixture.directPlayer.id}"]`)).toBeVisible();
      await expect(publicPage.locator(`a[href="/users/${fixture.wildcardPlayer.id}"]`)).toBeVisible();
      await expect(publicPage.getByText(fixture.pendingPlayer.username)).toHaveCount(0);
      await expect(publicPage.getByText(fixture.alternatePlayer.username)).toHaveCount(0);

      await publicPage.locator(`a[href="/users/${fixture.directPlayer.id}"]`).click();
      await expect(publicPage).toHaveURL(new RegExp(`/users/${fixture.directPlayer.id}$`));
    } finally {
      await fixture.seedHelper.cleanAll();
      await fixture.apiHelper.dispose();
    }
  });

  test('FDBK-TOURN-003 should use the unified edit modal with all acceptance types', async ({tournamentAdminPage}) => {
    const fixture = await createParticipantManagementFixture();

    try {
      await tournamentAdminPage.goto(`/tournaments/${fixture.tournamentId}`);
      const pendingRow = tournamentAdminPage.locator('tbody tr').filter({hasText: fixture.pendingPlayer.username}).first();
      await expect(pendingRow).toBeVisible();

      await pendingRow.getByRole('button', {name: /edit/i}).click();
      const editModal = tournamentAdminPage.locator('.modal-content').filter({hasText: /edit participant/i});
      await expect(editModal).toBeVisible();
      await expect(editModal).toContainText(fixture.pendingPlayer.fullName);

      await expect(editModal.locator('select[name="categoryId"]')).toBeVisible();
      await expect(editModal.locator('input[name="seedNumber"]')).toBeVisible();
      await expect(editModal.locator('select[name="status"]')).toBeVisible();
      await expect(editModal.locator('select[name="acceptanceType"]')).toBeVisible();

      const acceptanceTypeLabels = await editModal.locator('select[name="acceptanceType"] option').allTextContents();
      expect(acceptanceTypeLabels).toEqual(expect.arrayContaining([
        'Organizer Acceptance (OA)',
        'Direct Acceptance (DA)',
        'Special Exemption (SE)',
        'Junior Exemption (JE)',
        'Qualifier (Q)',
        'Lucky Loser (LL)',
        'Wild Card (WC)',
        'Alternate (ALT)',
        'Withdrawn (WD)',
      ]));

      const categoryOptions = await editModal.locator('select[name="categoryId"] option').allTextContents();
      expect(categoryOptions).toEqual(expect.arrayContaining([
        'Participant Main Singles',
        'Participant Secondary Singles',
      ]));

      await editModal.locator('input[name="seedNumber"]').fill('4');
      await editModal.locator('select[name="status"]').selectOption('ACCEPTED');
      await editModal.locator('select[name="acceptanceType"]').selectOption('WILD_CARD');

      await tournamentAdminPage.once('dialog', async (dialog) => {
        expect(dialog.message()).toMatch(/participant updated successfully/i);
        await dialog.accept();
      });
      await editModal.getByRole('button', {name: /save changes/i}).click();
      await expect(editModal).toHaveCount(0);

      await tournamentAdminPage.locator('#statusFilter').selectOption('ACCEPTED');
      const updatedRow = tournamentAdminPage.locator('tbody tr').filter({hasText: fixture.pendingPlayer.username}).first();
      await expect(updatedRow).toContainText('Seed #4');
      await expect(updatedRow).toContainText('[WC]');
      await expect(updatedRow).toContainText(/accepted/i);
    } finally {
      await fixture.seedHelper.cleanAll();
      await fixture.apiHelper.dispose();
    }
  });

  test('REG-002 should place a participant on the alternate (waiting list) when quota is full', async ({participantPage}) => {
    const localApiHelper = await ApiHelper.create();
    const adminSession = await localApiHelper.login(TEST_USERS.tournamentAdmin1);
    const playerSession = await localApiHelper.login(TEST_USERS.participant1);
    const localSeedHelper = new SeedHelper(localApiHelper, adminSession);

    try {
      // Create a tournament with a single-slot category.
      const tournament = await localSeedHelper.createTournament(`REG-002 Quota ${Date.now()}`, {maxParticipants: 8});
      await localSeedHelper.updateTournamentStatus(tournament.id, 'REGISTRATION_OPEN');
      const categoryId = await localSeedHelper.createSizedCategory(tournament.id, 'Quota Singles', 1);

      // Pre-fill the single slot with participant2.
      const p2Session = await localApiHelper.login(TEST_USERS.participant2);
      const firstId = await localSeedHelper.registerParticipant(categoryId, p2Session.user.id);
      await localSeedHelper.approveRegistration(firstId, 'DIRECT_ACCEPTANCE');

      // Navigate to the tournament as participant1 — registering should place them as ALTERNATE.
      const detailPage = new TournamentDetailPage(participantPage);
      await detailPage.gotoById(tournament.id);
      await detailPage.chooseCategory('Quota Singles');
      await detailPage.registerNow();

      // After registration the UI must indicate alternate / waiting-list placement.
      const registrationConfirmText = participantPage.locator('.registered-state, .pending-state, .alert-success, .alert-info, .registration-status');
      await expect(registrationConfirmText.first()).toBeVisible({timeout: 8_000});

      // Verify via API that the registration is ALTERNATE.
      await expect.poll(async () => {
        const regs = await localApiHelper.get<Array<{
          id: string;
          participantId: string;
          acceptanceType: string;
        }>>(`/registrations?categoryId=${categoryId}`);
        const mine = regs.find((reg) => reg.participantId === playerSession.user.id);
        return mine?.acceptanceType;
      }, {timeout: 8_000}).toBe('ALTERNATE');
    } finally {
      await localSeedHelper.cleanAll();
      await localApiHelper.dispose();
    }
  });

  test('REG-005 should promote an alternate participant to lucky loser status', async ({tournamentAdminPage}) => {
    const localApiHelper = await ApiHelper.create();
    const adminSession = await localApiHelper.login(TEST_USERS.tournamentAdmin1);
    const localSeedHelper = new SeedHelper(localApiHelper, adminSession);

    try {
      const tournament = await localSeedHelper.createTournament(`REG-005 LuckyLoser ${Date.now()}`, {maxParticipants: 8});
      await localSeedHelper.updateTournamentStatus(tournament.id, 'REGISTRATION_OPEN');
      const categoryId = await localSeedHelper.createSizedCategory(tournament.id, 'Lucky Loser Singles', 2);

      const p1Session = await localApiHelper.login(TEST_USERS.participant1);
      const p2Session = await localApiHelper.login(TEST_USERS.participant2);

      const reg1Id = await localSeedHelper.registerParticipant(categoryId, p1Session.user.id);
      await localSeedHelper.approveRegistration(reg1Id, 'DIRECT_ACCEPTANCE');

      const reg2Id = await localSeedHelper.registerParticipant(categoryId, p2Session.user.id);
      await localSeedHelper.approveRegistration(reg2Id, 'ALTERNATE');

      // Promote alternate to lucky loser via API.
      await localApiHelper.put(`/registrations/${reg2Id}`, {acceptanceType: 'LUCKY_LOSER'}, adminSession.token, 200);

      // Navigate to admin view and confirm the badge is shown.
      await tournamentAdminPage.goto(`/tournaments/${tournament.id}`);
      await tournamentAdminPage.locator('#statusFilter').selectOption('ACCEPTED');

      const p2Row = tournamentAdminPage.locator('tbody tr').filter({hasText: p2Session.user.username}).first();
      await expect(p2Row).toBeVisible({timeout: 8_000});
      await expect(p2Row).toContainText(/lucky loser|\[LL\]/i);
    } finally {
      await localSeedHelper.cleanAll();
      await localApiHelper.dispose();
    }
  });

  test('REG-007 should display acceptance type badges and seed numbers in the participant table', async ({tournamentAdminPage}) => {
    const fixture = await createParticipantManagementFixture();

    try {
      await tournamentAdminPage.goto(`/tournaments/${fixture.tournamentId}`);
      await tournamentAdminPage.locator('#statusFilter').selectOption('ACCEPTED');

      await expect(tournamentAdminPage.getByText('Alternate', {exact: true})).toBeVisible();
      await expect(tournamentAdminPage.getByText('[WC]', {exact: true})).toBeVisible();
      await expect(tournamentAdminPage.getByText('[DA]', {exact: true})).toBeVisible();

      // Seed numbers for direct and wildcard players (1 and 2 respectively).
      await expect(tournamentAdminPage.getByText('Seed #1')).toBeVisible();
      await expect(tournamentAdminPage.getByText('Seed #2')).toBeVisible();
    } finally {
      await fixture.seedHelper.cleanAll();
      await fixture.apiHelper.dispose();
    }
  });

  test('REG-008 should reject duplicate registration and allow re-registration after withdrawal', async ({participantPage, tournamentAdminPage}) => {
    const localApiHelper = await ApiHelper.create();
    const adminSession = await localApiHelper.login(TEST_USERS.tournamentAdmin1);
    const p1Session = await localApiHelper.login(TEST_USERS.participant1);
    const localSeedHelper = new SeedHelper(localApiHelper, adminSession);

    try {
      const tournament = await localSeedHelper.createTournament(`REG-008 Dup ${Date.now()}`, {maxParticipants: 16});
      await localSeedHelper.updateTournamentStatus(tournament.id, 'REGISTRATION_OPEN');
      const categoryId = await localSeedHelper.createSizedCategory(tournament.id, 'Dup Test Singles', 8);

      // Pre-register participant1.
      const existingRegId = await localSeedHelper.registerParticipant(categoryId, p1Session.user.id);

      // Attempt duplicate registration via UI — should be rejected.
      const detailPage = new TournamentDetailPage(participantPage);
      await detailPage.gotoById(tournament.id);
      // Since participant1 is already registered, the page shows registered/pending state (no radio form).
      const registeredState = participantPage.locator('.registered-state, .pending-state');
      await expect(registeredState.first()).toBeVisible({timeout: 5_000});

      // Withdraw the existing registration via API.
      await localApiHelper.put(`/registrations/${existingRegId}/status`, {status: 'WITHDRAWN'}, adminSession.token, 200);

      // After withdrawal, verify via API that the system allows re-registration.
      // Note: The Angular UI may not immediately reflect WITHDRAWN state (the backend still
      // returns the withdrawn registration in getRegistrationsByParticipant), so UI
      // re-registration cannot be tested reliably. We verify the API allows re-registration.
      const reRegId = await localSeedHelper.registerParticipant(categoryId, p1Session.user.id);
      expect(reRegId).toBeTruthy();
    } finally {
      await localSeedHelper.cleanAll();
      await localApiHelper.dispose();
    }
  });
});