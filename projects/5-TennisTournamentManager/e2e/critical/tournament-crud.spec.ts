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
import {TournamentDetailPage} from '../fixtures/page-objects/tournament-detail.page';

type TournamentListResponse = Array<{id: string; name: string}>;

function hexToRgb(hexColor: string): string {
  const normalizedHex = hexColor.replace('#', '');
  const red = parseInt(normalizedHex.slice(0, 2), 16);
  const green = parseInt(normalizedHex.slice(2, 4), 16);
  const blue = parseInt(normalizedHex.slice(4, 6), 16);

  return `rgb(${red}, ${green}, ${blue})`;
}

async function expectColorPreview(page: typeof test extends never ? never : any, primaryColor: string, secondaryColor: string): Promise<void> {
  const preview = page.locator('.color-preview');
  await expect(preview).toHaveCSS(
    'background-image',
    new RegExp(`${hexToRgb(primaryColor)}.*${hexToRgb(secondaryColor)}`.replace(/[()]/g, '\\$&')),
  );
}

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
      await expectColorPreview(
        tournamentAdminPage,
        NEW_TOURNAMENT_DATA.valid.primaryColor,
        NEW_TOURNAMENT_DATA.valid.secondaryColor,
      );
      await tournamentAdminPage.locator('#logoUrl').fill(NEW_TOURNAMENT_DATA.valid.logoUrl);

      await tournamentAdminPage.getByRole('button', {name: /create tournament|save tournament|submit/i}).click();
      await expect(tournamentAdminPage).toHaveURL(/\/tournaments$/);
      await listPage.applyFilters({search: uniqueName});
      await listPage.expectTournamentVisible(uniqueName);

      const tournaments = await apiHelper.get<TournamentListResponse>('/tournaments');
      createdTournamentId = tournaments.find((tournament) => tournament.name === uniqueName)?.id ?? null;
    } finally {
      if (createdTournamentId) {
        const adminSession = await apiHelper.login(TEST_USERS.tournamentAdmin1);
        await apiHelper.delete(`/tournaments/${createdTournamentId}`, adminSession.token, true);
      }
      await apiHelper.dispose();
    }
  });

  test('TOURN-003 should edit an existing tournament', async ({tournamentAdminPage}) => {
    const apiHelper = await ApiHelper.create();
    const adminSession = await apiHelper.login(TEST_USERS.tournamentAdmin1);
    const seedHelper = new SeedHelper(apiHelper, adminSession);
    const seeded = await seedHelper.createTournament(`Editable Tournament ${Date.now()}`, {
      primaryColor: '#112233',
      secondaryColor: '#445566',
    });
    const updatedName = `${seeded.name} Updated`;
    const updatedLocation = 'Santa Cruz de Tenerife';
    const updatedPrimaryColor = '#c2410c';
    const updatedSecondaryColor = '#0f766e';

    try {
      await tournamentAdminPage.goto(`/tournaments/${seeded.id}/edit`);
      await expectColorPreview(tournamentAdminPage, '#112233', '#445566');
      await tournamentAdminPage.locator('#name').fill(updatedName);
      await tournamentAdminPage.locator('#location').fill(updatedLocation);
      await tournamentAdminPage.locator('input[name="primaryColorHex"]').fill(updatedPrimaryColor);
      await tournamentAdminPage.locator('input[name="secondaryColorHex"]').fill(updatedSecondaryColor);
      await expectColorPreview(tournamentAdminPage, updatedPrimaryColor, updatedSecondaryColor);
      await tournamentAdminPage.getByRole('button', {name: /save|update/i}).click();

      await expect.poll(async () => {
        const tournament = await apiHelper.get<{
          id: string;
          name: string;
          location: string;
          primaryColor: string;
          secondaryColor: string;
        }>(`/tournaments/${seeded.id}`);

        return `${tournament.name}|${tournament.location}|${tournament.primaryColor}|${tournament.secondaryColor}`;
      }).toBe(`${updatedName}|${updatedLocation}|${updatedPrimaryColor}|${updatedSecondaryColor}`);
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

  test('FDBK-TOURN-004 should auto-create a default category and gate editing by state', async ({tournamentAdminPage, participantPage}) => {
    const apiHelper = await ApiHelper.create();
    const adminSession = await apiHelper.login(TEST_USERS.tournamentAdmin1);
    const seedHelper = new SeedHelper(apiHelper, adminSession);
    const seeded = await seedHelper.createTournament(`Default Category Tournament ${Date.now()}`, {
      maxParticipants: 8,
    });

    try {
      await expect.poll(async () => {
        const categories = await apiHelper.get<Array<{id: string; name: string}>>(`/categories?tournamentId=${seeded.id}`);
        return categories.length;
      }).toBe(0);

      await tournamentAdminPage.goto(`/tournaments/${seeded.id}`);
      await expect(tournamentAdminPage.getByRole('heading', {name: seeded.name})).toBeVisible();
      const categoriesCard = tournamentAdminPage.locator('.categories-card');
      await expect(categoriesCard.getByRole('heading', {name: /categories/i})).toBeVisible();
      await expect(categoriesCard.getByText('Open (Default Category)', {exact: true})).toBeVisible();

      await expect.poll(async () => {
        const categories = await apiHelper.get<Array<{id: string; name: string}>>(`/categories?tournamentId=${seeded.id}`);
        return categories.map((category) => category.name).join('|');
      }).toBe('Open (Default Category)');

      await seedHelper.updateTournamentStatus(seeded.id, 'REGISTRATION_OPEN');

      await participantPage.goto(`/tournaments/${seeded.id}`);
      const registrationForm = participantPage.locator('.registration-form');
      await expect(participantPage.getByRole('heading', {name: /register for tournament/i})).toBeVisible();
      await expect(registrationForm.getByText(/select category/i)).toBeVisible();
      await expect(registrationForm.getByText('Open (Default Category)', {exact: true})).toBeVisible();
      await expect(participantPage.getByText(/no categories available for registration/i)).toHaveCount(0);

      await seedHelper.updateTournamentStatus(seeded.id, ['REGISTRATION_CLOSED', 'DRAW_PENDING', 'IN_PROGRESS']);

      await tournamentAdminPage.goto(`/tournaments/${seeded.id}`);
      const editButton = tournamentAdminPage.locator('.management-bar .action-buttons .action-btn.edit');
      await expect(editButton).toBeVisible();
      await expect(editButton).toBeDisabled();
      await expect(tournamentAdminPage.getByRole('button', {name: /add category/i})).toHaveCount(0);
      await expect(tournamentAdminPage.getByText(/categories locked after registration closes/i)).toBeVisible();

      await tournamentAdminPage.goto(`/tournaments/${seeded.id}/edit`);
      await expect(tournamentAdminPage.getByRole('heading', {name: /tournament locked/i})).toBeVisible();
      await expect(tournamentAdminPage.getByText(/cannot be edited in its current status/i)).toBeVisible();
      await tournamentAdminPage.getByRole('button', {name: /back to tournament/i}).click();
      await expect(tournamentAdminPage).toHaveURL(new RegExp(`/tournaments/${seeded.id}$`));
      await expect(tournamentAdminPage.getByRole('heading', {name: seeded.name})).toBeVisible();
    } finally {
      await seedHelper.cleanAll();
      await apiHelper.dispose();
    }
  });

  test('TOURN-006 should filter tournament list without cross-contaminating results', async ({publicPage}) => {
    const apiHelper = await ApiHelper.create();
    const adminSession = await apiHelper.login(TEST_USERS.tournamentAdmin1);
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

  test('TOURN-009 should render state-driven tournament detail controls for each role', async ({tournamentAdminPage, participantPage, publicPage}) => {
    const apiHelper = await ApiHelper.create();
    const adminSession = await apiHelper.login(TEST_USERS.tournamentAdmin1);
    const seedHelper = new SeedHelper(apiHelper, adminSession);
    const seeded = await seedHelper.createTournament(`State Detail Tournament ${Date.now()}`);
    await seedHelper.createCategory(seeded.id, 'State Detail Singles');

    try {
      const adminDetailPage = new TournamentDetailPage(tournamentAdminPage);
      await adminDetailPage.gotoById(seeded.id);

      await expect(tournamentAdminPage.getByRole('heading', {name: seeded.name})).toBeVisible();
      await expect(tournamentAdminPage.locator('.tournament-meta .status-badge')).toContainText(/draft/i);
      await expect(tournamentAdminPage.locator('.management-bar .action-buttons .action-btn.edit')).toBeVisible();
      await expect(tournamentAdminPage.locator('.management-bar .action-buttons .action-btn.delete')).toBeVisible();
      await expect(tournamentAdminPage.getByText(/change status:/i)).toBeVisible();
      await expect(tournamentAdminPage.getByRole('heading', {name: /^tournament status$/i})).toBeVisible();
      await expect(tournamentAdminPage.getByRole('heading', {name: /tournament regulations/i})).toBeVisible();

      await seedHelper.updateTournamentStatus(seeded.id, 'REGISTRATION_OPEN');

      const participantDetailPage = new TournamentDetailPage(participantPage);
      await participantDetailPage.gotoById(seeded.id);
        await expect(participantPage.locator('.status-card .subtitle')).toHaveText(/registration open/i);
      await expect(participantPage.getByRole('button', {name: /register now|complete profile to register/i})).toBeVisible();
      await expect(participantPage.getByText(/select category/i)).toBeVisible();
      await expect(participantPage.locator('.management-bar .action-buttons .action-btn.edit')).toHaveCount(0);

      await seedHelper.updateTournamentStatus(seeded.id, ['REGISTRATION_CLOSED', 'DRAW_PENDING', 'IN_PROGRESS']);

      await publicPage.goto(`/tournaments/${seeded.id}`);
        await expect(publicPage.locator('.status-card .subtitle')).toHaveText(/in progress/i);
      await expect(publicPage.getByRole('heading', {name: /^tournament status$/i})).toBeVisible();
      await expect(publicPage.getByRole('button', {name: /register|complete profile/i})).toHaveCount(0);
      await expect(publicPage.locator('.management-bar .action-buttons .action-btn.edit')).toHaveCount(0);
    } finally {
      await seedHelper.cleanAll();
      await apiHelper.dispose();
    }
  });

  test('TOURN-010 should let organizers add and delete categories from tournament detail', async ({tournamentAdminPage}) => {
    const apiHelper = await ApiHelper.create();
    const adminSession = await apiHelper.login(TEST_USERS.tournamentAdmin1);
    const seedHelper = new SeedHelper(apiHelper, adminSession);
    const seeded = await seedHelper.createTournament(`Category Manager Tournament ${Date.now()}`);
    const categoryName = `E2E Category ${Date.now()}`;

    try {
      await tournamentAdminPage.goto(`/tournaments/${seeded.id}`);
      await tournamentAdminPage.getByRole('button', {name: /add category/i}).first().click();
      await expect(tournamentAdminPage.getByRole('heading', {name: /add new category/i})).toBeVisible();

      await tournamentAdminPage.locator('input[name="categoryName"]').fill(categoryName);
      await tournamentAdminPage.locator('input[name="maxParticipants"]').fill('8');
      await tournamentAdminPage.locator('select[name="gender"]').selectOption('OPEN');
      await tournamentAdminPage.locator('select[name="ageGroup"]').selectOption('OPEN');
      await tournamentAdminPage.getByRole('button', {name: /add category/i}).last().click();

      const categoryRow = tournamentAdminPage.locator('tbody tr').filter({hasText: categoryName});
      await expect(categoryRow).toBeVisible();

      await tournamentAdminPage.once('dialog', async (dialog) => dialog.accept());
      await categoryRow.getByRole('button', {name: /delete/i}).click();
      await expect(categoryRow).toHaveCount(0);
    } finally {
      await seedHelper.cleanAll();
      await apiHelper.dispose();
    }
  });
});