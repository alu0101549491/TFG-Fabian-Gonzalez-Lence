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
    await expect(secondParticipantPage.getByText(/partner invitations/i)).toBeVisible();

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
});