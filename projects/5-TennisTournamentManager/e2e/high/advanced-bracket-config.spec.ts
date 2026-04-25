/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 24, 2026
 * @file e2e/high/advanced-bracket-config.spec.ts
 * @desc Feature 30 — Advanced Bracket Configuration E2E tests.
 *       Verifies the Advanced Options collapsible section within the bracket
 *       generation form: seeding strategy, consolation bracket, bye assignment,
 *       players-per-group, and end-to-end bracket generation with advanced options.
 *
 * Setup strategy:
 *   - Creates 4 transient E2E players via the registration API.
 *   - Creates a tournament and advances it through
 *     REGISTRATION_OPEN → REGISTRATION_CLOSED → DRAW_PENDING.
 *   - Registers and approves all 4 players in the single category so the
 *     "Generate Bracket" button becomes available.
 *   - Tests run serially to guarantee teardown ordering and to let the last
 *     test (ADV-005) actually submit the form without blocking the earlier ones.
 *
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {test, expect} from '../fixtures/auth.fixture';
import {type Page, type Locator} from '@playwright/test';
import {TEST_USERS} from '../fixtures/test-data';
import {ApiHelper} from '../helpers/api.helper';
import {SeedHelper} from '../helpers/seed.helper';

// ---------------------------------------------------------------------------
// Helper: locate a radio option label within a named radio group.
// ---------------------------------------------------------------------------
// Angular uses [value]="expr" (property binding) which does NOT always reflect
// as the HTML `value` attribute. We therefore locate radios by their wrapping
// <label> text rather than the CSS attribute selector [value="..."].
// ---------------------------------------------------------------------------

/**
 * Returns a Locator for the `<label>` element that wraps a radio inside a
 * named group (`<input name="groupName" type="radio">`).
 *
 * @param page - Playwright page.
 * @param groupName - The static `name` attribute of the radio inputs.
 * @param labelText - Visible text (string or regex) inside the target label.
 * @returns Locator for the matching `<label>`.
 */
function radioLabel(page: Page, groupName: string, labelText: string | RegExp): Locator {
  return page
    .locator('label')
    .filter({has: page.locator(`input[name="${groupName}"]`)})
    .filter({hasText: labelText});
}

/**
 * Returns a Locator for the `<input>` inside the matching label so its
 * checked state can be asserted with `toBeChecked()`.
 *
 * @param page - Playwright page.
 * @param groupName - The static `name` attribute of the radio inputs.
 * @param labelText - Visible text (string or regex) inside the target label.
 * @returns Locator for the `<input>` within the matching label.
 */
function radioInput(page: Page, groupName: string, labelText: string | RegExp): Locator {
  return radioLabel(page, groupName, labelText).locator('input');
}

// ---------------------------------------------------------------------------
// Module-level seed references — populated in beforeAll, consumed in tests.
// ---------------------------------------------------------------------------
let apiHelper: ApiHelper | undefined;
let seedHelper: SeedHelper | undefined;
let tournamentId = '';
let categoryId = '';

async function gotoTournamentDetailWithRetry(page: Page): Promise<void> {
  const rateLimitError = page
    .locator('.error-container, .alert-error, .error-message, .error-banner')
    .filter({hasText: /request failed with status code 429|too many requests/i})
    .first();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.goto(`/tournaments/${tournamentId}`);
    await page.waitForURL(`**\/tournaments\/${tournamentId}**`);

    if (!(await rateLimitError.isVisible().catch(() => false))) {
      return;
    }

    await page.reload({waitUntil: 'domcontentloaded'});
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Navigates to the tournament detail page, opens the "Generate Bracket" form,
 * and expands the "Advanced Options" <details> section.
 *
 * Call this at the start of every test that needs the Advanced Options panel.
 *
 * @param page - Playwright page object of the authenticated admin browser.
 */
async function openFormWithAdvancedOptions(page: Page): Promise<void> {
  const rateLimitError = page
    .locator('.error-container, .alert-error, .error-message, .error-banner')
    .filter({hasText: /request failed with status code 429|too many requests/i})
    .first();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await gotoTournamentDetailWithRetry(page);

    // Wait for either a content card or an error banner to appear so we know
    // the Angular API call has completed (avoids false "no error" check).
    await page.waitForSelector('.info-card, .error-banner', {timeout: 10_000}).catch(() => undefined);

    // Re-check for 429 after the page content has had time to load.
    if (await rateLimitError.isVisible().catch(() => false)) {
      await page.reload({waitUntil: 'domcontentloaded'});
      continue;
    }

    const bracketGenerationCard = page.locator('.info-card').filter({hasText: /bracket generation/i}).first();
    const categorySelect = page.locator('select[name="categoryId"]').first();

    if (await categorySelect.isVisible().catch(() => false)) {
      break;
    }

    const generateBracketButton = bracketGenerationCard
      .getByRole('button', {name: /generate bracket/i})
      .first();
    const closeBracketButton = bracketGenerationCard
      .getByRole('button', {name: /close/i})
      .first();

    await expect(generateBracketButton).toBeVisible({timeout: 10_000});
    await generateBracketButton.click();

    await closeBracketButton.waitFor({state: 'visible', timeout: 3_000}).catch(() => undefined);

    if (await categorySelect.isVisible().catch(() => false)) {
      break;
    }

    if (await rateLimitError.isVisible().catch(() => false)) {
      await page.reload({waitUntil: 'domcontentloaded'});
      continue;
    }

    await page.reload({waitUntil: 'domcontentloaded'});
  }

  // The bracket generation form should now be visible.
  const categorySelect = page.locator('select[name="categoryId"]').first();
  await expect(categorySelect).toBeVisible({timeout: 8_000});

  // Expand the Advanced Options <details> element.
  const advancedOptionsSummary = page.locator('details.advanced-options-details summary');
  await expect(advancedOptionsSummary).toBeVisible({timeout: 5_000});
  await advancedOptionsSummary.click();

  // Confirm the section is now open.
  await expect(page.locator('details.advanced-options-details[open]')).toBeVisible({timeout: 3_000});
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

test.describe.serial('Feature 30: Advanced Bracket Configuration', () => {
  // -------------------------------------------------------------------------
  // Data seeding — runs once before the whole suite.
  // -------------------------------------------------------------------------
  test.beforeAll(async () => {
    apiHelper = await ApiHelper.create();
    const adminSession = await apiHelper.login(TEST_USERS.tournamentAdmin1);
    seedHelper = new SeedHelper(apiHelper, adminSession);

    // Create 4 unique transient players so we have enough participants for all
    // bracket-type combinations (Single Elimination, Round Robin, etc.).
    const ts = Date.now();
    const p1 = await seedHelper.createPlayer(`adv1_${ts}`);
    const p2 = await seedHelper.createPlayer(`adv2_${ts}`);
    const p3 = await seedHelper.createPlayer(`adv3_${ts}`);
    const p4 = await seedHelper.createPlayer(`adv4_${ts}`);

    // Create tournament (initially DRAFT).
    const tournament = await seedHelper.createTournament(
      `ADV-BRACKET E2E ${ts}`,
      {maxParticipants: 8, tournamentType: 'SINGLES'},
    );
    tournamentId = tournament.id;

    // Create the category that the bracket generation form will target.
    categoryId = await seedHelper.createSizedCategory(tournamentId, 'Open Singles', 8);

    // Open registration so players can be enrolled.
    await seedHelper.updateTournamentStatus(tournamentId, 'REGISTRATION_OPEN');

    // Register and approve each player sequentially to avoid rate-limit issues.
    for (const player of [p1, p2, p3, p4]) {
      const registrationId = await seedHelper.registerParticipant(categoryId, player.user.id);
      await seedHelper.approveRegistration(registrationId);
    }

    // Advance to DRAW_PENDING — the status required for bracket generation.
    await seedHelper.updateTournamentStatus(tournamentId, [
      'REGISTRATION_CLOSED',
      'DRAW_PENDING',
    ]);
  });

  // -------------------------------------------------------------------------
  // Teardown — runs once after all tests complete.
  // -------------------------------------------------------------------------
  test.afterAll(async () => {
    await seedHelper?.cleanAll();
    await apiHelper?.dispose();
  });

  // -------------------------------------------------------------------------
  // ADV-001: Advanced Options section is collapsible and expands
  // Manual test guide: Feature 30, Part 1
  // -------------------------------------------------------------------------
  test('ADV-001 Advanced Options section is present and expands on click', async ({tournamentAdminPage}) => {
    await gotoTournamentDetailWithRetry(tournamentAdminPage);

    // Open the bracket generation form via the header toggle button.
    const generateBracketBtn = tournamentAdminPage.getByRole('button', {name: /generate bracket/i}).first();
    await expect(generateBracketBtn).toBeVisible({timeout: 10_000});
    await generateBracketBtn.click();

    // Confirm the bracket generation form is now shown.
    await expect(tournamentAdminPage.locator('form').first()).toBeVisible({timeout: 8_000});

    // Locate the Advanced Options <details> element.
    const advancedDetails = tournamentAdminPage.locator('details.advanced-options-details');
    await expect(advancedDetails).toBeVisible();

    // The <summary> must be visible and carry the expected label.
    const summary = advancedDetails.locator('summary');
    await expect(summary).toBeVisible();
    await expect(summary).toContainText('Advanced Options');

    // Initially it should be collapsed (no 'open' attribute on <details>).
    await expect(tournamentAdminPage.locator('details.advanced-options-details:not([open])')).toBeVisible();

    // Clicking the summary must expand the section.
    await summary.click();
    await expect(tournamentAdminPage.locator('details.advanced-options-details[open]')).toBeVisible();

    // After expansion, the Seeding Strategy radios must be accessible.
    await expect(radioLabel(tournamentAdminPage, 'seedingStrategy', 'None')).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // ADV-002: Seeding Strategy options and their description texts
  // Manual test guide: Feature 30, Part 2
  // -------------------------------------------------------------------------
  test('ADV-002 Seeding Strategy radio options update the description text', async ({tournamentAdminPage}) => {
    await openFormWithAdvancedOptions(tournamentAdminPage);

    // Default state is NONE — description must reflect no seeding.
    await expect(tournamentAdminPage.getByText(/No seeding applied/i)).toBeVisible();

    // Select "Top Seeded" and verify updated description.
    await radioLabel(tournamentAdminPage, 'seedingStrategy', 'Top Seeded').click();
    await expect(
      tournamentAdminPage.getByText(/Registered ranking is used to place top seeds in the draw/i),
    ).toBeVisible();

    // Select "Random" and verify updated description.
    await radioLabel(tournamentAdminPage, 'seedingStrategy', 'Random').click();
    await expect(
      tournamentAdminPage.getByText(/Participants are placed in the draw at random/i),
    ).toBeVisible();

    // Return to "None" and verify default description is restored.
    await radioLabel(tournamentAdminPage, 'seedingStrategy', 'None').click();
    await expect(tournamentAdminPage.getByText(/No seeding applied/i)).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // ADV-003: Consolation Bracket and Bye Assignment are gated to Single Elimination
  // Manual test guide: Feature 30, Part 3
  // -------------------------------------------------------------------------
  test('ADV-003 Consolation and Bye Assignment controls visible only for Single Elimination', async ({tournamentAdminPage}) => {
    await openFormWithAdvancedOptions(tournamentAdminPage);

    // Explicitly pick Single Elimination to ensure deterministic starting state.
    await radioLabel(tournamentAdminPage, 'bracketType', /Single Elimination/i).click();

    // --- Consolation Bracket section must be present ---
    await expect(
      tournamentAdminPage.locator('input[name="consolationType"]').first(),
    ).toBeVisible();
    // The "Consolation Bracket" label text must be visible.
    await expect(
      tournamentAdminPage.getByText(/Consolation Bracket/i).first(),
    ).toBeVisible();

    // Select "Consolation" and verify its description.
    await radioLabel(tournamentAdminPage, 'consolationType', 'Consolation').click();
    await expect(
      tournamentAdminPage.getByText(/Players losing in the first round compete in a consolation bracket/i),
    ).toBeVisible();

    // Select "Double Elimination" and verify its description.
    await radioLabel(tournamentAdminPage, 'consolationType', /Double Elimination/).click();
    await expect(
      tournamentAdminPage.getByText(/Players can lose once and continue in the losers' bracket/i),
    ).toBeVisible();

    // Reset consolation to None (use nth(0) because there is also a seeding-strategy "None").
    await radioLabel(tournamentAdminPage, 'consolationType', 'None').click();
    await expect(
      tournamentAdminPage.getByText(/No consolation bracket; eliminated players exit the tournament/i),
    ).toBeVisible();

    // --- Bye Assignment section must also be present for Single Elimination ---
    await expect(
      tournamentAdminPage.locator('input[name="byeAssignment"]').first(),
    ).toBeVisible();
    await expect(
      tournamentAdminPage.getByText(/Bye Assignment/i).first(),
    ).toBeVisible();

    // Both bye-assignment options must exist.
    await expect(
      radioLabel(tournamentAdminPage, 'byeAssignment', /Top Seeds get Byes/),
    ).toBeVisible();
    await expect(
      radioLabel(tournamentAdminPage, 'byeAssignment', /Random Byes/),
    ).toBeVisible();

    // --- Switch to Round Robin — both sections must disappear ---
    await radioLabel(tournamentAdminPage, 'bracketType', /Round Robin/i).click();
    await expect(tournamentAdminPage.locator('input[name="consolationType"]')).toHaveCount(0);
    await expect(tournamentAdminPage.locator('input[name="byeAssignment"]')).toHaveCount(0);
  });

  // -------------------------------------------------------------------------
  // ADV-004: Players per Group appears only for Round Robin
  // Manual test guide: Feature 30, Part 4
  // -------------------------------------------------------------------------
  test('ADV-004 Players per Group control visible only for Round Robin', async ({tournamentAdminPage}) => {
    await openFormWithAdvancedOptions(tournamentAdminPage);

    // Single Elimination (default) — group-size radios must NOT be present.
    await radioLabel(tournamentAdminPage, 'bracketType', /Single Elimination/i).click();
    await expect(tournamentAdminPage.locator('input[name="groupSize"]')).toHaveCount(0);

    // Switch to Round Robin — four group-size options (3, 4, 6, 8) must appear.
    await radioLabel(tournamentAdminPage, 'bracketType', /Round Robin/i).click();
    const groupSizeRadios = tournamentAdminPage.locator('input[name="groupSize"]');
    await expect(groupSizeRadios).toHaveCount(4);

    // Verify each expected size label is present.
    for (const size of ['3', '4', '6', '8']) {
      await expect(
        radioLabel(tournamentAdminPage, 'groupSize', size),
      ).toBeVisible();
    }

    // Select group size 6 — description must reference the chosen value.
    await radioLabel(tournamentAdminPage, 'groupSize', '6').click();
    await expect(
      tournamentAdminPage.getByText(/Each group will contain up to 6 players/i),
    ).toBeVisible();

    // Verify group-size selector disappears when switching back to Single Elimination.
    await radioLabel(tournamentAdminPage, 'bracketType', /Single Elimination/i).click();
    await expect(tournamentAdminPage.locator('input[name="groupSize"]')).toHaveCount(0);
  });

  // -------------------------------------------------------------------------
  // ADV-005: Bracket generates successfully with advanced options; form resets
  // Manual test guide: Feature 30, Part 5
  // -------------------------------------------------------------------------
  test('ADV-005 Bracket generates with advanced options and form defaults reset on success', async ({tournamentAdminPage}) => {
    await openFormWithAdvancedOptions(tournamentAdminPage);

    // Select the category created during seeding.
    await tournamentAdminPage.locator('select[name="categoryId"]').selectOption({value: categoryId});
    // Wait for the participant-count confirmation to appear (ensures data loaded).
    await expect(
      tournamentAdminPage.getByText(/accepted participant\(s\) - Ready to generate bracket/i),
    ).toBeVisible({timeout: 8_000});

    // Configure: Single Elimination + Top Seeded + Consolation + Top Seeds get Byes.
    await radioLabel(tournamentAdminPage, 'bracketType', /Single Elimination/i).click();
    await radioLabel(tournamentAdminPage, 'matchFormat', /Pro Set/i).click();
    await radioLabel(tournamentAdminPage, 'seedingStrategy', 'Top Seeded').click();
    await radioLabel(tournamentAdminPage, 'consolationType', 'Consolation').click();
    await radioLabel(tournamentAdminPage, 'byeAssignment', /Top Seeds get Byes/).click();

    // Accept the confirmation dialog (confirm()) and any subsequent success alert.
    // dialog.dismiss() on a confirm() returns false, which aborts generation.
    tournamentAdminPage.on('dialog', async (dialog) => dialog.accept());

    // Click the form's submit button.
    await tournamentAdminPage.locator('button[type="submit"]').click();

    // The app must navigate to the newly generated bracket view.
    await tournamentAdminPage.waitForURL(/\/brackets\//i, {timeout: 15_000});

    // Bracket content must be visible in the new route.
    await expect(
      tournamentAdminPage.locator('.visual-bracket-section, app-visual-bracket, .phase-card').first(),
    ).toBeVisible({timeout: 10_000});
    await expect(tournamentAdminPage.locator('.format-badge').first()).toContainText(/pro set/i);

    // --- Verify form defaults reset after success ---
    // Navigate back to the tournament detail and re-open the generation form.
    await gotoTournamentDetailWithRetry(tournamentAdminPage);

    const generateBracketBtn = tournamentAdminPage.getByRole('button', {name: /generate bracket/i}).first();
    await expect(generateBracketBtn).toBeVisible({timeout: 10_000});
    await generateBracketBtn.click();

    // Expand Advanced Options again.
    const advancedOptionsSummary = tournamentAdminPage.locator('details.advanced-options-details summary');
    await expect(advancedOptionsSummary).toBeVisible({timeout: 5_000});
    await advancedOptionsSummary.click();

    // Seeding strategy must be reset to NONE.
    await expect(radioInput(tournamentAdminPage, 'seedingStrategy', 'Top Seeded')).not.toBeChecked();
    await expect(radioInput(tournamentAdminPage, 'seedingStrategy', 'None')).toBeChecked();

    // Consolation must be reset to NONE.
    await expect(radioInput(tournamentAdminPage, 'consolationType', 'Consolation')).not.toBeChecked();
    await expect(radioInput(tournamentAdminPage, 'consolationType', 'None')).toBeChecked();
  });
});
