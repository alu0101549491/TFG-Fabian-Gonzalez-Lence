/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/critical/tournament-crud.spec.ts
 * @desc Critical tournament creation, editing, and authorization scenarios.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {test, expect} from '../fixtures/auth.fixture';
import {ApiHelper} from '../helpers/api.helper';
import {SeedHelper} from '../helpers/seed.helper';
import {NEW_TOURNAMENT_DATA, TEST_TOURNAMENTS, TEST_USERS} from '../fixtures/test-data';
import {TournamentListPage} from '../fixtures/page-objects/tournament-list.page';

type TournamentListResponse = Array<{id: string; name: string}>;

test.describe('Tournament CRUD - Critical', () => {
  test('TOURN-001 should validate dates and create a tournament successfully', async ({tournamentAdminPage}) => {
    const uniqueName = `${NEW_TOURNAMENT_DATA.valid.name} ${Date.now()}`;
    const apiHelper = await ApiHelper.create();
    let createdTournamentId: string | null = null;

    try {
      const listPage = new TournamentListPage(tournamentAdminPage);

      await tournamentAdminPage.goto('/tournaments/create');

      await tournamentAdminPage.locator('#name').fill(NEW_TOURNAMENT_DATA.invalidDates.name);
      await tournamentAdminPage.locator('#location').fill(NEW_TOURNAMENT_DATA.invalidDates.location);
      await tournamentAdminPage.locator('#startDate').fill(NEW_TOURNAMENT_DATA.invalidDates.startDate);
      await tournamentAdminPage.locator('#endDate').fill(NEW_TOURNAMENT_DATA.invalidDates.endDate);
      await expect(tournamentAdminPage.getByText(/end date cannot be before start date/i)).toBeVisible();

      await tournamentAdminPage.locator('#name').fill(uniqueName);
      await tournamentAdminPage.locator('#location').fill(NEW_TOURNAMENT_DATA.valid.location);
      await tournamentAdminPage.locator('#surface').selectOption(NEW_TOURNAMENT_DATA.valid.surface);
      await tournamentAdminPage.locator('#facilityType').selectOption(NEW_TOURNAMENT_DATA.valid.facilityType);
      await tournamentAdminPage.locator('#tournamentType').selectOption(NEW_TOURNAMENT_DATA.valid.tournamentType);
      await tournamentAdminPage.locator('#maxParticipants').fill(String(NEW_TOURNAMENT_DATA.valid.maxParticipants));
      await tournamentAdminPage.locator('#rankingSystem').selectOption(NEW_TOURNAMENT_DATA.valid.rankingSystem);
      await tournamentAdminPage.locator('#startDate').fill('2026-06-10');
      await tournamentAdminPage.locator('#endDate').fill('2026-06-12');
      await tournamentAdminPage.locator('#registrationOpenDate').fill('2026-05-20');
      await tournamentAdminPage.locator('#registrationCloseDate').fill('2026-06-09');
      await tournamentAdminPage.locator('#registrationFee').fill(NEW_TOURNAMENT_DATA.valid.registrationFee);
      await tournamentAdminPage.locator('#currency').fill(NEW_TOURNAMENT_DATA.valid.currency);
      await tournamentAdminPage.locator('#regulations').fill(NEW_TOURNAMENT_DATA.valid.regulations);
      await tournamentAdminPage.locator('#primaryColor').fill(NEW_TOURNAMENT_DATA.valid.primaryColor);
      await tournamentAdminPage.locator('#secondaryColor').fill(NEW_TOURNAMENT_DATA.valid.secondaryColor);
      await tournamentAdminPage.locator('input[name="primaryColorHex"]').fill(NEW_TOURNAMENT_DATA.valid.primaryColor);
      await tournamentAdminPage.locator('input[name="secondaryColorHex"]').fill(NEW_TOURNAMENT_DATA.valid.secondaryColor);
      await tournamentAdminPage.locator('#logoUrl').fill(NEW_TOURNAMENT_DATA.valid.logoUrl);

      await tournamentAdminPage.getByRole('button', {name: /create tournament|save tournament|submit/i}).click();
      await expect(tournamentAdminPage).toHaveURL(/\/tournaments$/);
      await listPage.applyFilters({search: uniqueName});
      await listPage.expectTournamentVisible(uniqueName);

      const tournaments = await apiHelper.get<TournamentListResponse>('/tournaments');
      createdTournamentId = tournaments.find((tournament) => tournament.name === uniqueName)?.id ?? null;
    } finally {
      if (createdTournamentId) {
        const adminSession = (await apiHelper.getCachedSession(TEST_USERS.tournamentAdmin1.email)) ??
          await apiHelper.login(TEST_USERS.tournamentAdmin1);
        await apiHelper.delete(`/tournaments/${createdTournamentId}`, adminSession.token, true);
      }
      await apiHelper.dispose();
    }
  });

  test('TOURN-003 should edit an existing tournament', async ({tournamentAdminPage}) => {
    const apiHelper = await ApiHelper.create();
    const adminSession = (await apiHelper.getCachedSession(TEST_USERS.tournamentAdmin1.email)) ??
      await apiHelper.login(TEST_USERS.tournamentAdmin1);
    const seedHelper = new SeedHelper(apiHelper, adminSession);
    const seeded = await seedHelper.createTournament(`Editable Tournament ${Date.now()}`);

    try {
      await tournamentAdminPage.goto(`/tournaments/${seeded.id}/edit`);
      await tournamentAdminPage.locator('#name').fill(`${seeded.name} Updated`);
      await tournamentAdminPage.locator('#location').fill('Santa Cruz de Tenerife');
      await tournamentAdminPage.getByRole('button', {name: /save|update/i}).click();

      await expect(tournamentAdminPage).toHaveURL(new RegExp(`/tournaments/${seeded.id}`));
      await expect(tournamentAdminPage.getByText(/updated/i)).toBeVisible();
    } finally {
      await seedHelper.cleanAll();
      await apiHelper.dispose();
    }
  });

  test('TOURN-004 should deny unauthorized edit access', async ({publicPage, participantPage}) => {
    await publicPage.goto(`/tournaments/${TEST_TOURNAMENTS.openRegistration.id}/edit`);
    await expect(publicPage).toHaveURL(/\/login/);

    await participantPage.goto(`/tournaments/${TEST_TOURNAMENTS.openRegistration.id}/edit`);
    await expect(participantPage).toHaveURL(/\/tournaments/);
  });

  test('TOURN-006 should filter tournament list without cross-contaminating results', async ({publicPage}) => {
    const apiHelper = await ApiHelper.create();
    const adminSession = (await apiHelper.getCachedSession(TEST_USERS.tournamentAdmin1.email)) ??
      await apiHelper.login(TEST_USERS.tournamentAdmin1);
    const seedHelper = new SeedHelper(apiHelper, adminSession);
    const activeKnockoutName = `Active Knockout Tournament ${Date.now()}`;
    const activeRoundRobinName = `Active Round Robin Tournament ${Date.now()}`;
    const localTournamentName = `La Laguna Tournament ${Date.now()}`;

    const activeKnockout = await seedHelper.createTournament(activeKnockoutName, {
      location: 'Santa Cruz de Tenerife',
    });
    const activeRoundRobin = await seedHelper.createTournament(activeRoundRobinName, {
      location: 'Puerto de la Cruz',
    });
    const localTournament = await seedHelper.createTournament(localTournamentName, {
      location: 'La Laguna',
    });

    await seedHelper.updateTournamentStatus(activeKnockout.id, [
      'REGISTRATION_OPEN',
      'REGISTRATION_CLOSED',
      'DRAW_PENDING',
      'IN_PROGRESS',
    ]);
    await seedHelper.updateTournamentStatus(activeRoundRobin.id, [
      'REGISTRATION_OPEN',
      'REGISTRATION_CLOSED',
      'DRAW_PENDING',
      'IN_PROGRESS',
    ]);

    const listPage = new TournamentListPage(publicPage);
    try {
      await listPage.goto();
      await listPage.applyFilters({status: 'IN_PROGRESS'});
      await listPage.expectTournamentVisible(activeKnockoutName);
      await listPage.expectTournamentVisible(activeRoundRobinName);

      await listPage.clearFilters();
      await listPage.applyFilters({search: localTournamentName});
      await listPage.expectTournamentVisible(localTournamentName);
    } finally {
      await seedHelper.cleanAll();
      await apiHelper.dispose();
    }
  });
});