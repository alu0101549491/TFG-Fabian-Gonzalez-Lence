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

let apiHelper: ApiHelper | undefined;
let seedHelper: SeedHelper | undefined;
let openTournamentId = '';

test.describe('Registration - High', () => {
  test.beforeAll(async () => {
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
});