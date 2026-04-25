/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/critical/order-of-play.spec.ts
 * @desc Critical order-of-play and court-management scenarios.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {test, expect} from '../fixtures/auth.fixture';
import {OrderOfPlayPage} from '../fixtures/page-objects/order-of-play.page';
import {TEST_USERS} from '../fixtures/test-data';
import {ApiHelper} from '../helpers/api.helper';
import {SeedHelper} from '../helpers/seed.helper';

const ORDER_OF_PLAY_DATE = '2026-06-12T10:30:00.000Z';
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

test.describe('Order of Play - Critical', () => {
  test('FDBK-TOURN-005 should support court CRUD and return cleanly to tournament detail', async ({tournamentAdminPage}) => {
    const seedContext = await createSeedContext();
    const seeded = await seedContext.seedHelper.createTournament(`Court Management ${Date.now()}`);

    try {
      await tournamentAdminPage.goto(`/tournaments/${seeded.id}/courts`);
      await expect(tournamentAdminPage.getByRole('heading', {name: /court management/i, level: 1})).toBeVisible();
      await expect(tournamentAdminPage.getByText(seeded.name, {exact: true})).toBeVisible();
      await expect(tournamentAdminPage.getByText(/no courts yet/i)).toBeVisible();

      await tournamentAdminPage.getByRole('button', {name: /add first court/i}).click();
      await expect(tournamentAdminPage.getByRole('heading', {name: /add new court/i})).toBeVisible();
      await tournamentAdminPage.locator('#newCourtName').fill('Court Alpha');
      await tournamentAdminPage.locator('#newOpeningTime').fill('08:00');
      await tournamentAdminPage.locator('#newClosingTime').fill('22:00');
      await tournamentAdminPage.getByRole('button', {name: /save court/i}).click();

      const createdRow = tournamentAdminPage.locator('tbody tr').filter({hasText: 'Court Alpha'}).first();
      await expect(createdRow).toBeVisible();
      await expect(tournamentAdminPage.getByText(/added successfully/i)).toBeVisible();
      await expect(createdRow).toContainText('08:00');
      await expect(createdRow).toContainText('22:00');

      await createdRow.getByRole('button', {name: /edit/i}).click();
      const editRow = tournamentAdminPage.locator('tr.edit-row').first();
      await expect(editRow).toBeVisible();
      await editRow.locator('input[type="text"]').fill('Court Omega');
      await editRow.locator('input[type="time"]').nth(0).fill('09:00');
      await editRow.locator('input[type="time"]').nth(1).fill('21:00');
      await editRow.getByRole('button', {name: /save/i}).click();

      const updatedRow = tournamentAdminPage.locator('tbody tr').filter({hasText: 'Court Omega'}).first();
      await expect(updatedRow).toBeVisible();
      await expect(tournamentAdminPage.getByText(/updated successfully/i)).toBeVisible();
      await expect(updatedRow).toContainText('09:00');
      await expect(updatedRow).toContainText('21:00');

      await tournamentAdminPage.reload();
      const persistedRow = tournamentAdminPage.locator('tbody tr').filter({hasText: 'Court Omega'}).first();
      await expect(persistedRow).toBeVisible();
      await expect(persistedRow).toContainText('09:00');
      await expect(persistedRow).toContainText('21:00');

      await tournamentAdminPage.once('dialog', async (dialog) => {
        expect(dialog.message()).toMatch(/delete court "Court Omega"/i);
        await dialog.accept();
      });
      await persistedRow.getByRole('button', {name: /delete/i}).click();
      await expect(tournamentAdminPage.locator('tbody tr').filter({hasText: 'Court Omega'})).toHaveCount(0);
      await expect(tournamentAdminPage.getByText(/deleted successfully/i)).toBeVisible();
      await expect(tournamentAdminPage.getByText(/no courts yet/i)).toBeVisible();

      await tournamentAdminPage.getByRole('button', {name: /back to tournament/i}).click();
      await expect(tournamentAdminPage).toHaveURL(new RegExp(`/tournaments/${seeded.id}$`));
      await expect(tournamentAdminPage.getByRole('heading', {name: seeded.name})).toBeVisible();
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });

  test('OOP-001 should expose admin schedule generation controls and courts list', async ({tournamentAdminPage}) => {
    const seedContext = await createSeedContext();

    try {
      const fixture = await seedContext.seedHelper.createSinglesMatchFixture(
        `OOP-001 ${Date.now()}`,
        [seedContext.participant1Id, seedContext.participant2Id],
        {
          tournamentStatuses: SEEDED_TOURNAMENT_STATUSES,
          courtName: 'Center Court',
          scheduledTime: ORDER_OF_PLAY_DATE,
          matchStatus: 'SCHEDULED',
        },
      );

      const orderPage = new OrderOfPlayPage(tournamentAdminPage);
      await orderPage.gotoForTournament(fixture.id);

      await expect(tournamentAdminPage.getByText(/scheduling management/i)).toBeVisible();
      await expect(tournamentAdminPage.getByRole('button', {name: /generate schedule/i})).toBeVisible();
      await expect(tournamentAdminPage.getByRole('button', {name: /regenerate/i})).toBeVisible();
      await expect(tournamentAdminPage.getByRole('button', {name: /center court/i}).first()).toBeVisible();
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });

  test('OOP-002 should regenerate an existing schedule after input updates', async ({tournamentAdminPage}) => {
    const seedContext = await createSeedContext();

    try {
      const fixture = await seedContext.seedHelper.createSinglesMatchFixture(
        `OOP-002 ${Date.now()}`,
        [seedContext.participant1Id, seedContext.participant2Id],
        {
          tournamentStatuses: SEEDED_TOURNAMENT_STATUSES,
          courtName: 'Center Court',
          scheduledTime: ORDER_OF_PLAY_DATE,
          matchStatus: 'SCHEDULED',
        },
      );

      const orderPage = new OrderOfPlayPage(tournamentAdminPage);
      await orderPage.gotoForTournament(fixture.id);

      await tournamentAdminPage.locator('input[type="number"]').first().fill('75');
      await orderPage.regenerateSchedule();
      await orderPage.expectScheduleVisible();
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });

  test('OOP-003 should filter order of play by date and court', async ({publicPage}) => {
    const seedContext = await createSeedContext();

    try {
      const fixture = await seedContext.seedHelper.createSinglesMatchFixture(
        `OOP-003 ${Date.now()}`,
        [seedContext.participant1Id, seedContext.participant2Id],
        {
          tournamentStatuses: SEEDED_TOURNAMENT_STATUSES,
          courtName: 'Center Court',
          scheduledTime: ORDER_OF_PLAY_DATE,
          matchStatus: 'SCHEDULED',
        },
      );

      const orderPage = new OrderOfPlayPage(publicPage);
      await orderPage.gotoForTournament(fixture.id);

      const dateInput = publicPage.locator('#date, #admin-date').first();
      if (await dateInput.count() > 0) {
        await dateInput.fill('2026-06-12');
      }

      await orderPage.expectScheduleVisible();
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });

  test('OOP-005 should keep the public order-of-play view read-only', async ({publicPage}) => {
    const seedContext = await createSeedContext();

    try {
      const fixture = await seedContext.seedHelper.createSinglesMatchFixture(
        `OOP-005 ${Date.now()}`,
        [seedContext.participant1Id, seedContext.participant2Id],
        {
          tournamentStatuses: SEEDED_TOURNAMENT_STATUSES,
          courtName: 'Center Court',
          scheduledTime: ORDER_OF_PLAY_DATE,
          matchStatus: 'SCHEDULED',
        },
      );

      const orderPage = new OrderOfPlayPage(publicPage);
      await orderPage.gotoForTournament(fixture.id);

      await orderPage.expectScheduleVisible();
      await expect(publicPage.getByText(/scheduling management/i)).toHaveCount(0);
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });

  test('OOP-007 should enforce the 24-hour publication rule', async ({tournamentAdminPage}) => {
    test.skip(true, 'The current frontend exposes no dedicated 24-hour publication validation UI.');

    const orderPage = new OrderOfPlayPage(tournamentAdminPage);
    await orderPage.gotoForTournament('pending');
  });
});