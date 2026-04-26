/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/critical/draw-generation.spec.ts
 * @desc Critical bracket-generation and bracket-visibility scenarios.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {test, expect} from '../fixtures/auth.fixture';
import {TEST_USERS} from '../fixtures/test-data';
import {BracketPage} from '../fixtures/page-objects/bracket.page';
import {ApiHelper} from '../helpers/api.helper';
import {SeedHelper} from '../helpers/seed.helper';

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

test.describe('Draw Generation - Critical', () => {
  test('DRAW-001 should block bracket generation when fewer than two accepted players exist', async ({tournamentAdminPage}) => {
    const seedContext = await createSeedContext();

    try {
      const tournament = await seedContext.seedHelper.createTournament(`DRAW-001 ${Date.now()}`);
      const categoryId = await seedContext.seedHelper.createSizedCategory(tournament.id, 'Single Accepted Singles', 8);
      await seedContext.seedHelper.updateTournamentStatus(tournament.id, SEEDED_TOURNAMENT_STATUSES);

      const registrationId = await seedContext.seedHelper.registerParticipant(categoryId, seedContext.participant1Id);
      await seedContext.seedHelper.approveRegistration(registrationId);

      await tournamentAdminPage.goto(`/tournaments/${tournament.id}`);

      const toggleButton = tournamentAdminPage.getByRole('button', {name: /generate bracket/i}).first();
      await expect(toggleButton).toBeVisible();
      await toggleButton.click();

      const categorySelect = tournamentAdminPage.locator('select[name="categoryId"]');
      await categorySelect.selectOption({value: categoryId});

      const submitButton = tournamentAdminPage.locator('button[type="submit"]').filter({hasText: /generate bracket/i}).first();
      await expect(submitButton).toBeDisabled();
      await expect(submitButton).toHaveAttribute('title', /need at least 2 accepted participants/i);
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });

  test('DRAW-002 should show bracket details and publish state for an existing bracket', async ({tournamentAdminPage}) => {
    const seedContext = await createSeedContext();

    try {
      const fixture = await seedContext.seedHelper.createSinglesMatchFixture(
        `DRAW-002 ${Date.now()}`,
        [seedContext.participant1Id, seedContext.participant2Id],
        {
          tournamentStatuses: SEEDED_TOURNAMENT_STATUSES,
        },
      );

      const bracketPage = new BracketPage(tournamentAdminPage);
      await bracketPage.gotoById(fixture.bracketId!);
      await bracketPage.expectBracketVisible();
      await expect(tournamentAdminPage.getByText(/bracket information/i)).toBeVisible();

      const publishButton = tournamentAdminPage.getByRole('button', {name: /publish bracket/i});
      if (await publishButton.count() > 0) {
        await expect(publishButton).toBeVisible();
      } else {
        await expect(tournamentAdminPage.getByText(/published/i)).toBeVisible();
      }
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });

  test('DRAW-003 should regenerate a draft bracket when the control is available', async ({tournamentAdminPage}) => {
    const seedContext = await createSeedContext();

    try {
      const fixture = await seedContext.seedHelper.createSinglesMatchFixture(
        `DRAW-003 ${Date.now()}`,
        [seedContext.participant1Id, seedContext.participant2Id],
        {
          tournamentStatuses: SEEDED_TOURNAMENT_STATUSES,
        },
      );

      const bracketPage = new BracketPage(tournamentAdminPage);
      await bracketPage.gotoById(fixture.bracketId!);
      await bracketPage.expectBracketVisible();

      const originalMatchIds = (await seedContext.seedHelper.getMatchesByBracket(fixture.bracketId!))
        .map((match) => String(match.id))
        .join('|');

      await expect(tournamentAdminPage.getByRole('button', {name: /regenerate bracket/i}).first()).toBeVisible();
      await tournamentAdminPage.once('dialog', async (dialog) => dialog.accept());
      await bracketPage.regenerateBracket();

      await expect.poll(async () => {
        const regeneratedMatchIds = (await seedContext.seedHelper.getMatchesByBracket(fixture.bracketId!))
          .map((match) => String(match.id))
          .join('|');
        return regeneratedMatchIds !== originalMatchIds;
      }, {timeout: 10_000}).toBeTruthy();

      await bracketPage.expectBracketVisible();
      await expect(tournamentAdminPage.getByText(/draft/i)).toBeVisible();
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });

  test('DRAW-007 should keep bracket pages read-only for participants', async ({participantPage}) => {
    const seedContext = await createSeedContext();

    try {
      const fixture = await seedContext.seedHelper.createSinglesMatchFixture(
        `DRAW-007 ${Date.now()}`,
        [seedContext.participant1Id, seedContext.participant2Id],
        {
          tournamentStatuses: SEEDED_TOURNAMENT_STATUSES,
          publishBracket: true,
        },
      );

      const bracketPage = new BracketPage(participantPage);
      await bracketPage.gotoById(fixture.bracketId!);
      await bracketPage.expectBracketVisible();
      await bracketPage.expectReadOnlyView();
    } finally {
      await seedContext.seedHelper.cleanAll();
      await seedContext.apiHelper.dispose();
    }
  });

  test('DRAW-008 should expose consolation and lucky loser management tabs in phase management', async ({tournamentAdminPage}) => {
    const apiHelper = await ApiHelper.create();
    const adminSession = await apiHelper.login(TEST_USERS.tournamentAdmin1);
    const seedHelper = new SeedHelper(apiHelper, adminSession);
    const tournament = await seedHelper.createTournament(`DRAW-008 ${Date.now()}`);

    try {
      await tournamentAdminPage.goto(`/tournaments/${tournament.id}/phases`);
      await expect(tournamentAdminPage.locator('h1.phase-title')).toHaveText(/phase management/i);
      await expect(tournamentAdminPage.locator('button.tab', {hasText: /link phases/i})).toBeVisible();
      await expect(tournamentAdminPage.locator('button.tab', {hasText: /advance qualifiers/i})).toBeVisible();

      await tournamentAdminPage.locator('button.tab', {hasText: /consolation draw/i}).click();
      await expect(tournamentAdminPage.getByRole('heading', {name: /create consolation draw/i})).toBeVisible();
      await expect(tournamentAdminPage.getByRole('button', {name: /create consolation draw/i}).last()).toBeDisabled();

      await tournamentAdminPage.locator('button.tab', {hasText: /lucky loser/i}).click();
      await expect(tournamentAdminPage.getByRole('heading', {name: /promote lucky loser/i})).toBeVisible();
      await expect(tournamentAdminPage.getByRole('button', {name: /promote lucky loser/i}).last()).toBeDisabled();
    } finally {
      await seedHelper.cleanAll();
      await apiHelper.dispose();
    }
  });

  test('FDBK-DRAW-003 should support overview creation and phase linking workflows', async ({tournamentAdminPage}) => {
    const apiHelper = await ApiHelper.create();
    const adminSession = await apiHelper.login(TEST_USERS.tournamentAdmin1);
    const seedHelper = new SeedHelper(apiHelper, adminSession);
    const tournament = await seedHelper.createTournament(`FDBK-DRAW-003 ${Date.now()}`);

    try {
      await seedHelper.createSizedCategory(tournament.id, 'Qualifying Singles', 8);
      await seedHelper.createSizedCategory(tournament.id, 'Main Draw Singles', 8);

      await tournamentAdminPage.goto(`/tournaments/${tournament.id}/phases`);
      await expect(tournamentAdminPage.locator('h1.phase-title')).toHaveText(/phase management/i);
      await expect(tournamentAdminPage.getByRole('heading', {name: /phases overview/i})).toBeVisible();
      await expect(tournamentAdminPage.getByRole('button', {name: /create new phase/i})).toBeVisible();

      await tournamentAdminPage.getByRole('button', {name: /create new phase/i}).click();
      await tournamentAdminPage.locator('#phaseName').fill('Qualifying Phase');
      await tournamentAdminPage.locator('#phaseType').selectOption('QUALIFYING');
      await tournamentAdminPage.locator('#categoryId').selectOption({label: 'Qualifying Singles'});
      await tournamentAdminPage.locator('#bracketType').selectOption('ROUND_ROBIN');
      await tournamentAdminPage.getByRole('button', {name: /create phase/i}).click();
      await expect(tournamentAdminPage.getByText(/qualifying phase/i).first()).toBeVisible();

      await tournamentAdminPage.getByRole('button', {name: /create new phase/i}).click();
      await tournamentAdminPage.locator('#phaseName').fill('Main Phase');
      await tournamentAdminPage.locator('#phaseType').selectOption('MAIN');
      await tournamentAdminPage.locator('#categoryId').selectOption({label: 'Main Draw Singles'});
      await tournamentAdminPage.locator('#bracketType').selectOption('SINGLE_ELIMINATION');
      await tournamentAdminPage.getByRole('button', {name: /create phase/i}).click();
      await expect(tournamentAdminPage.getByText(/main phase/i).first()).toBeVisible();

      await tournamentAdminPage.locator('button.tab', {hasText: /link phases/i}).click();
      const sourceSelect = tournamentAdminPage.locator('#linkSourcePhase');
      const targetSelect = tournamentAdminPage.locator('#linkTargetPhase');

      const qualifyingValue = await sourceSelect.locator('option').evaluateAll((options) => {
        const match = (options as HTMLOptionElement[]).find((option) => option.textContent?.includes('Qualifying Phase'));
        return match?.value ?? '';
      });
      const mainValue = await targetSelect.locator('option').evaluateAll((options) => {
        const match = (options as HTMLOptionElement[]).find((option) => option.textContent?.includes('Main Phase'));
        return match?.value ?? '';
      });

      expect(qualifyingValue).toBeTruthy();
      expect(mainValue).toBeTruthy();

      await sourceSelect.selectOption(qualifyingValue);
      await targetSelect.selectOption(mainValue);
      await tournamentAdminPage.locator('form').getByRole('button', {name: /link phases/i}).click();

      await expect(tournamentAdminPage.locator('.alert-success')).toContainText(/linked/i);
      await expect(tournamentAdminPage.locator('#linkSourcePhase')).toHaveValue(qualifyingValue);
      await expect(tournamentAdminPage.locator('#linkTargetPhase')).toHaveValue(mainValue);
    } finally {
      await seedHelper.cleanAll();
      await apiHelper.dispose();
    }
  });
});