# E2E TEST IMPLEMENTATION - PLAYWRIGHT TEST GENERATION

## OBJECTIVE
You are a Senior QA Automation Engineer Agent specialized in Playwright.
Your task is to implement comprehensive E2E tests for the **Tennis Tournament
Manager (TENNIS)** application based on the test scenarios documented in
Phase 1. Generate production-ready Playwright test files following best
practices.

---

## PROJECT CONTEXT

**Project:** Tennis Tournament Manager (TENNIS)
**Testing Framework:** Playwright
**Language:** TypeScript 5.x
**Application URL:** http://localhost:4200
**Framework:** Angular (Vite build, port 4200)

---

## INPUT DOCUMENT

Read and implement every scenario defined in:
`/projects/5-TennisTournamentManager/docs/testing/E2E_TEST_SCENARIOS.md`

Also scan the codebase at:
`/projects/5-TennisTournamentManager/src/presentation/`
to verify `data-testid` attributes, component selector names, Angular route
paths, and actual form field labels before writing locators.

---

## OUTPUT STRUCTURE

Generate all files under:
`/projects/5-TennisTournamentManager/e2e/`

```
e2e/
├── playwright.config.ts
├── global-setup.ts
├── global-teardown.ts
├── fixtures/
│   ├── test-data.ts
│   ├── auth.fixture.ts
│   └── page-objects/
│       ├── base.page.ts
│       ├── login.page.ts
│       ├── dashboard.page.ts
│       ├── tournament-list.page.ts
│       ├── tournament-detail.page.ts
│       ├── bracket.page.ts
│       ├── match-detail.page.ts
│       ├── order-of-play.page.ts
│       ├── standings.page.ts
│       ├── announcements.page.ts
│       ├── notifications.page.ts
│       ├── ranking.page.ts
│       ├── profile.page.ts
│       └── admin/
│           ├── user-management.page.ts
│           ├── system.page.ts
│           └── backup.page.ts
├── helpers/
│   ├── api.helper.ts
│   ├── wait.helper.ts
│   └── seed.helper.ts
├── critical/
│   ├── auth.spec.ts
│   ├── tournament-crud.spec.ts
│   ├── draw-generation.spec.ts
│   ├── result-management.spec.ts
│   └── order-of-play.spec.ts
├── high/
│   ├── registration.spec.ts
│   ├── standings.spec.ts
│   ├── notifications.spec.ts
│   └── bracket-visualization.spec.ts
├── medium/
│   ├── announcements.spec.ts
│   ├── privacy.spec.ts
│   ├── ranking.spec.ts
│   ├── export.spec.ts
│   ├── incidents.spec.ts
│   └── communication.spec.ts
└── low/
    ├── edge-cases.spec.ts
    ├── accessibility.spec.ts
    └── responsive.spec.ts
```

---

## PLAYWRIGHT CONFIGURATION

```typescript
// e2e/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['list'],
  ],

  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:4200',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
    { name: 'tablet', use: { ...devices['iPad (gen 7)'] } },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

---

## IMPLEMENTATION STANDARDS

### 1. Page Object Model

Every page object must extend `BasePage` and follow this pattern:

```typescript
// e2e/fixtures/page-objects/base.page.ts
import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;
  readonly header: Locator;
  readonly sidebar: Locator;
  readonly loadingSpinner: Locator;
  readonly toastContainer: Locator;
  readonly confirmDialog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header       = page.locator('[data-testid="app-header"]');
    this.sidebar      = page.locator('[data-testid="app-sidebar"]');
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    this.toastContainer = page.locator('[data-testid="toast-container"]');
    this.confirmDialog  = page.locator('[data-testid="confirm-dialog"]');
  }

  abstract readonly url: string;

  async goto(): Promise<void> {
    await this.page.goto(this.url);
    await this.waitForPageLoad();
  }

  async waitForPageLoad(): Promise<void> {
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 30000 });
  }

  async expectToast(type: 'success' | 'error' | 'warning', text?: string): Promise<void> {
    const toast = this.toastContainer.locator(`[data-testid="toast-${type}"]`);
    await expect(toast).toBeVisible({ timeout: 5000 });
    if (text) await expect(toast).toContainText(text);
  }

  async confirmAction(): Promise<void> {
    await this.confirmDialog.getByRole('button', { name: /confirm|yes|delete/i }).click();
  }

  async cancelAction(): Promise<void> {
    await this.confirmDialog.getByRole('button', { name: /cancel|no/i }).click();
  }

  async logout(): Promise<void> {
    await this.header.locator('[data-testid="user-menu-trigger"]').click();
    await this.page.getByRole('menuitem', { name: /logout/i }).click();
  }

  async navigateTo(section: string): Promise<void> {
    await this.sidebar.getByRole('link', { name: section }).click();
    await this.waitForPageLoad();
  }
}
```

Key pages to implement with domain-specific locators:

**`TournamentListPage`** — locators for tournament cards, status badges,
  search input, status filter, draw-type filter, new-tournament button,
  per-card actions (edit, delete, finalize).

**`TournamentDetailPage`** — tab switcher (Overview / Brackets / OrderOfPlay
  / Standings / Announcements / Participants), bracket type selector,
  participant list, stats summary cards.

**`BracketPage`** — bracket visualization container, match slots, seed
  badges, Bye indicators, group tables (Round Robin), phase link arrows,
  generate/regenerate buttons, seeding modal.

**`MatchDetailPage`** — set score inputs (configurable number of sets per
  FR28), match state selector (12 states), ball provider field, player
  comments field, confirm/dispute buttons, suspension controls.

**`OrderOfPlayPage`** — court columns, time slot grid, scheduled match cards,
  reschedule drag target, publish button, 24h validation message, real-time
  update indicator.

**`StandingsPage`** — standings table rows (rank, player, MW, ML, sets, games,
  points/ratio), tiebreak indicator, toggle between points/ratio/ELO view,
  auto-update WebSocket indicator.

**`AnnouncementsPage`** — announcement cards, tag filter chips, pin
  indicator, public/private badge, create/edit/delete actions, schedule
  future publication datepicker, view counter.

**`NotificationsPage`** — notification list grouped by date, unread badge on
  bell icon, mark-read button, channel config panel (in-app/email/Telegram/
  web push checkboxes), event-type checkboxes, frequency selector.

**`ProfilePage`** — field-level privacy dropdowns (4 levels each), avatar
  upload, GDPR download data button, GDPR delete account button.

**Admin pages** — user management table with role assignment, visual
  customization (color pickers, logo upload), backup history table,
  restore button.

### 2. Authentication Fixture

```typescript
// e2e/fixtures/auth.fixture.ts
import { test as base, Page, BrowserContext } from '@playwright/test';
import { LoginPage } from './page-objects/login.page';
import { TEST_USERS } from './test-data';

type AuthFixtures = {
  sysAdminPage: Page;
  tournamentAdminPage: Page;
  participantPage: Page;
  secondParticipantPage: Page;
  publicPage: Page;  // unauthenticated
};

export const test = base.extend<AuthFixtures>({
  sysAdminPage: async ({ browser }, use) => {
    const ctx = await browser.newContext({
      storageState: 'e2e/.auth/sysadmin.json',
    });
    await use(await ctx.newPage());
    await ctx.close();
  },
  tournamentAdminPage: async ({ browser }, use) => {
    const ctx = await browser.newContext({
      storageState: 'e2e/.auth/tournament-admin.json',
    });
    await use(await ctx.newPage());
    await ctx.close();
  },
  participantPage: async ({ browser }, use) => {
    const ctx = await browser.newContext({
      storageState: 'e2e/.auth/participant1.json',
    });
    await use(await ctx.newPage());
    await ctx.close();
  },
  secondParticipantPage: async ({ browser }, use) => {
    const ctx = await browser.newContext({
      storageState: 'e2e/.auth/participant2.json',
    });
    await use(await ctx.newPage());
    await ctx.close();
  },
  publicPage: async ({ page }, use) => {
    await page.context().clearCookies();
    await use(page);
  },
});

export { expect } from '@playwright/test';
```

### 3. Test Data

```typescript
// e2e/fixtures/test-data.ts
export const TEST_USERS = {
  sysAdmin: {
    email: 'sysadmin@tennis-test.com',
    password: 'SysAdmin123!',
    name: 'System Admin',
    role: 'SYSTEM_ADMIN',
  },
  tournamentAdmin1: {
    email: 'admin1@tennis-test.com',
    password: 'TAdmin123!',
    name: 'Tournament Admin One',
    role: 'TOURNAMENT_ADMIN',
  },
  tournamentAdmin2: {
    email: 'admin2@tennis-test.com',
    password: 'TAdmin123!',
    name: 'Tournament Admin Two',
    role: 'TOURNAMENT_ADMIN',
  },
  participant1: {
    email: 'player1@tennis-test.com',
    password: 'Player123!',
    name: 'Player One',
    role: 'PARTICIPANT',
    ranking: 150,
  },
  participant2: {
    email: 'player2@tennis-test.com',
    password: 'Player123!',
    name: 'Player Two',
    role: 'PARTICIPANT',
    ranking: 200,
  },
  participant3: {
    email: 'player3@tennis-test.com',
    password: 'Player123!',
    name: 'Player Three',
    role: 'PARTICIPANT',
    ranking: 250,
  },
} as const;

export const TEST_TOURNAMENTS = {
  openRegistration: {
    id: 'T-001',
    name: 'Open Registration Tournament',
    status: 'REGISTRATION_OPEN',
    drawType: 'SINGLE_ELIMINATION',
    adminEmail: TEST_USERS.tournamentAdmin1.email,
  },
  activeKnockout: {
    id: 'T-002',
    name: 'Active Knockout Tournament',
    status: 'IN_PROGRESS',
    drawType: 'SINGLE_ELIMINATION',
    adminEmail: TEST_USERS.tournamentAdmin1.email,
  },
  activeRoundRobin: {
    id: 'T-003',
    name: 'Active Round Robin Tournament',
    status: 'IN_PROGRESS',
    drawType: 'ROUND_ROBIN',
    adminEmail: TEST_USERS.tournamentAdmin2.email,
  },
  finalized: {
    id: 'T-004',
    name: 'Finalized Tournament',
    status: 'FINALIZED',
    drawType: 'SINGLE_ELIMINATION',
    adminEmail: TEST_USERS.tournamentAdmin1.email,
  },
  draft: {
    id: 'T-005',
    name: 'Draft Tournament',
    status: 'DRAFT',
    drawType: 'MATCH_PLAY',
    adminEmail: TEST_USERS.tournamentAdmin2.email,
  },
} as const;

export const MATCH_STATES = [
  'TBP', 'IP', 'SUS', 'CO', 'RET', 'WO',
  'ABN', 'BYE', 'NP', 'CAN', 'DEF', 'DR',
] as const;

export const ENTRY_STATES = [
  'OA', 'DA', 'SE', 'JE', 'QU', 'LL', 'WC', 'ALT', 'WD',
] as const;

export const NEW_TOURNAMENT_DATA = {
  valid: {
    name: 'E2E Test Tournament',
    surface: 'CLAY',
    facilityType: 'OUTDOOR',
    maxQuota: 16,
    tournamentType: 'SINGLES',
    courts: [{ name: 'Central Court' }, { name: 'Court 2' }],
  },
  invalidDates: {
    name: 'Bad Dates Tournament',
    // endDate before startDate — should trigger validation
  },
} as const;

export const NEW_TOURNAMENT_ADMIN_VALID_SET = {
  sets: [{ p1: 6, p2: 3 }, { p1: 6, p2: 4 }],
  state: 'CO',
  balls: 'player1',
  comments: 'E2E test result',
};
```

### 4. Seed Helper

```typescript
// e2e/helpers/seed.helper.ts
/**
 * API-based seed helper for creating and cleaning test data.
 * Calls the backend REST API directly — faster than UI interactions.
 * Requires a seeding endpoint or direct DB access configured in the
 * test environment.
 */
export class SeedHelper {
  private readonly baseUrl: string;
  private readonly adminToken: string;

  constructor(baseUrl: string, adminToken: string) {
    this.baseUrl = baseUrl;
    this.adminToken = adminToken;
  }

  async seedAll(): Promise<void> {
    await this.seedUsers();
    await this.seedTournaments();
    await this.seedRegistrations();
    await this.seedBrackets();
    await this.seedMatches();
    await this.seedAnnouncements();
    await this.seedNotifications();
  }

  async cleanAll(): Promise<void> { /* ... */ }

  private async post(path: string, body: unknown): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.adminToken}`,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`Seed failed: ${path} ${response.status}`);
    return response.json();
  }

  private async seedUsers(): Promise<void> { /* ... */ }
  private async seedTournaments(): Promise<void> { /* ... */ }
  private async seedRegistrations(): Promise<void> { /* ... */ }
  private async seedBrackets(): Promise<void> { /* ... */ }
  private async seedMatches(): Promise<void> { /* ... */ }
  private async seedAnnouncements(): Promise<void> { /* ... */ }
  private async seedNotifications(): Promise<void> { /* ... */ }
}
```

### 5. Critical Test Examples

The following examples illustrate the expected implementation style. Apply
the same pattern to EVERY scenario in the E2E_TEST_SCENARIOS.md document.

```typescript
// e2e/critical/auth.spec.ts
import { test, expect } from '../fixtures/auth.fixture';
import { LoginPage } from '../fixtures/page-objects/login.page';
import { DashboardPage } from '../fixtures/page-objects/dashboard.page';
import { TEST_USERS } from '../fixtures/test-data';

test.describe('Authentication — Critical', () => {

  test.describe('AUTH-001: Successful login', () => {
    for (const [role, user] of Object.entries(TEST_USERS)) {
      test(`should login as ${role}`, async ({ page }) => {
        const login = new LoginPage(page);
        await login.goto();
        await login.login(user.email, user.password);
        await expect(page).toHaveURL('/');
        const dashboard = new DashboardPage(page);
        await dashboard.expectWelcomeMessage(user.name);
      });
    }
  });

  test.describe('AUTH-008: Protected routes without auth', () => {
    const protectedRoutes = [
      '/tournaments', '/tournaments/T-001', '/ranking',
      '/notifications', '/profile', '/admin/users',
    ];
    for (const route of protectedRoutes) {
      test(`should redirect ${route} to /login`, async ({ publicPage }) => {
        await publicPage.goto(route);
        await expect(publicPage).toHaveURL(/\/login/);
      });
    }
  });

  test.describe('AUTH-009: Session timeout', () => {
    test('should redirect to login after 30 min inactivity', async ({ page }) => {
      // Implemented by manipulating the JWT expiry or mocking time
      // Mark as [REQUIRES BACKEND CONFIG] if not testable in isolation
    });
  });

  test.describe('AUTH-010: 5 failed attempts lockout', () => {
    test('should lock account for 15 min after 5 wrong passwords', async ({ page }) => {
      const login = new LoginPage(page);
      await login.goto();
      for (let i = 0; i < 5; i++) {
        await login.login(TEST_USERS.participant1.email, 'WrongPassword!');
        await expect(page).toHaveURL('/login');
      }
      await login.expectLockoutMessage();
    });
  });
});
```

```typescript
// e2e/critical/draw-generation.spec.ts
import { test, expect } from '../fixtures/auth.fixture';
import { TournamentDetailPage } from '../fixtures/page-objects/tournament-detail.page';
import { BracketPage } from '../fixtures/page-objects/bracket.page';
import { TEST_TOURNAMENTS } from '../fixtures/test-data';

test.describe('Draw Generation — Critical', () => {

  test.describe('DRAW-001: Generate Knockout draw', () => {
    test('admin generates 8-player knockout with seeds and Byes', async ({ tournamentAdminPage }) => {
      const detail = new TournamentDetailPage(tournamentAdminPage);
      await detail.goto(TEST_TOURNAMENTS.openRegistration.id);
      await detail.switchToTab('brackets');

      const bracket = new BracketPage(tournamentAdminPage);
      await bracket.clickGenerateBracket();
      await bracket.selectDrawType('SINGLE_ELIMINATION');
      await bracket.setSeedCount(4);
      await bracket.clickGenerate();

      await bracket.expectBracketVisible();
      await bracket.expectSeedBadgeAt(1, 1);   // Seed 1 top
      await bracket.expectSeedBadgeAt(2, 8);   // Seed 2 bottom
      await bracket.expectMatchCount(7);         // 8-player bracket = 7 matches
    });
  });

  test.describe('DRAW-002: Generate Round Robin draw', () => {
    test('admin generates 2-group round robin from 8 players', async ({ tournamentAdminPage }) => {
      const bracket = new BracketPage(tournamentAdminPage);
      await bracket.gotoForTournament(TEST_TOURNAMENTS.activeRoundRobin.id);
      await bracket.clickGenerateBracket();
      await bracket.selectDrawType('ROUND_ROBIN');
      await bracket.setGroupCount(2);
      await bracket.clickGenerate();

      await bracket.expectGroupCount(2);
      await bracket.expectGroupSize(0, 4);
      await bracket.expectGroupSize(1, 4);
      // 4-player group = 6 matches; 2 groups = 12 matches total
      await bracket.expectMatchCount(12);
    });
  });

  test.describe('DRAW-003: Bye assignment for odd participants', () => {
    test('system inserts rotating Bye for odd Round Robin group', async ({ tournamentAdminPage }) => {
      const bracket = new BracketPage(tournamentAdminPage);
      // Tournament pre-seeded with 5 players in 1 group
      await bracket.gotoForTournament(TEST_TOURNAMENTS.openRegistration.id);
      await bracket.clickGenerateBracket();
      await bracket.selectDrawType('ROUND_ROBIN');
      await bracket.setGroupCount(1);
      await bracket.clickGenerate();

      await bracket.expectByePresent();
    });
  });

  test.describe('DRAW-008: Participant cannot modify bracket', () => {
    test('participant sees bracket but has no generate/modify buttons', async ({ participantPage }) => {
      const bracket = new BracketPage(participantPage);
      await bracket.gotoForTournament(TEST_TOURNAMENTS.activeKnockout.id);

      await expect(bracket.generateButton).not.toBeVisible();
      await expect(bracket.modifyButton).not.toBeVisible();
      await bracket.expectBracketVisible();  // but can view
    });
  });
});
```

```typescript
// e2e/critical/result-management.spec.ts
import { test, expect } from '../fixtures/auth.fixture';
import { MatchDetailPage } from '../fixtures/page-objects/match-detail.page';
import { TEST_USERS, NEW_TOURNAMENT_ADMIN_VALID_SET } from '../fixtures/test-data';

test.describe('Match & Result Management — Critical', () => {

  test.describe('MATCH-001: Participant enters result', () => {
    test('participant enters sets and result is pending confirmation', async ({ participantPage }) => {
      const match = new MatchDetailPage(participantPage);
      // Use a known match ID in TBP state from test seed
      await match.goto('MATCH-T002-001');

      await match.enterSetScore(0, { p1: 6, p2: 3 });
      await match.enterSetScore(1, { p1: 6, p2: 4 });
      await match.selectMatchState('CO');
      await match.enterBallProvider('player1');
      await match.submitResult();

      await match.expectStatus('Pending Confirmation');
      await match.expectToast('success', 'Result recorded');
    });
  });

  test.describe('MATCH-002: Opponent confirms result', () => {
    test('confirming result updates standings automatically', async ({
      participantPage, secondParticipantPage,
    }) => {
      const matchP1 = new MatchDetailPage(participantPage);
      await matchP1.goto('MATCH-T002-001');
      await matchP1.enterAndSubmitResult();

      const matchP2 = new MatchDetailPage(secondParticipantPage);
      await matchP2.goto('MATCH-T002-001');
      await matchP2.confirmResult();

      await matchP2.expectStatus('Completed');
      // Standings should update via WebSocket — check standings page
    });
  });

  test.describe('MATCH-003: All 12 match states display', () => {
    for (const state of ['TBP','IP','SUS','CO','RET','WO','ABN','BYE','NP','CAN','DEF','DR']) {
      test(`state ${state} displays correct badge`, async ({ tournamentAdminPage }) => {
        const match = new MatchDetailPage(tournamentAdminPage);
        await match.gotoMatchWithState(state);
        await match.expectStateBadge(state);
      });
    }
  });

  test.describe('MATCH-006: Match suspension and resumption', () => {
    test('admin suspends match, score is saved, resumes correctly', async ({ tournamentAdminPage }) => {
      const match = new MatchDetailPage(tournamentAdminPage);
      await match.goto('MATCH-T002-002');
      await match.enterPartialScore({ p1: 6, p2: 3 }, { p1: 3, p2: 3 });
      await match.suspendMatch('Rain');

      await match.expectStatus('SUS');
      await match.expectSavedScore({ set1: '6-3', set2: '3-3' });

      await match.resumeMatch();
      await match.expectStatus('IP');
      await match.expectSavedScore({ set1: '6-3', set2: '3-3' });
    });
  });
});
```

```typescript
// e2e/high/standings.spec.ts
import { test, expect } from '../fixtures/auth.fixture';
import { StandingsPage } from '../fixtures/page-objects/standings.page';
import { TEST_TOURNAMENTS } from '../fixtures/test-data';

test.describe('Standings & Statistics — High', () => {

  test.describe('STAND-001: Point-based standings', () => {
    test('standings show correct points after confirmed results', async ({ participantPage }) => {
      const standings = new StandingsPage(participantPage);
      await standings.gotoForTournament(TEST_TOURNAMENTS.activeRoundRobin.id);
      await standings.switchToPointsView();

      await standings.expectPlayerAtPosition(TEST_USERS.participant1.name, 1);
      await standings.expectPoints(TEST_USERS.participant1.name, 9); // 3 wins × 3 pts
    });
  });

  test.describe('STAND-003: Tiebreak criteria applied sequentially', () => {
    test('set ratio breaks tie between two players with equal points', async ({ participantPage }) => {
      const standings = new StandingsPage(participantPage);
      await standings.gotoForTournament(TEST_TOURNAMENTS.activeRoundRobin.id);

      // Two players tied on points — the one with better set ratio should be higher
      const rows = await standings.getRows();
      const tiedRows = rows.filter(r => r.points === rows[1].points);
      if (tiedRows.length >= 2) {
        expect(tiedRows[0].setRatio).toBeGreaterThanOrEqual(tiedRows[1].setRatio);
      }
    });
  });

  test.describe('STAND-005: Real-time standings update', () => {
    test('standings update within 5 seconds of result confirmation', async ({
      browser,
    }) => {
      const adminCtx = await browser.newContext({ storageState: 'e2e/.auth/tournament-admin.json' });
      const participantCtx = await browser.newContext({ storageState: 'e2e/.auth/participant1.json' });

      const adminPage = await adminCtx.newPage();
      const participantPage = await participantCtx.newPage();

      const standings = new StandingsPage(participantPage);
      await standings.gotoForTournament(TEST_TOURNAMENTS.activeRoundRobin.id);
      const initialPosition = await standings.getPosition(TEST_USERS.participant1.name);

      // Admin records a result that changes standings
      const match = new (await import('../fixtures/page-objects/match-detail.page')).MatchDetailPage(adminPage);
      await match.goto('MATCH-T003-001');
      await match.enterAndSubmitResultAsAdmin();

      // Wait up to 5 seconds for WebSocket update (NFR5)
      await expect(async () => {
        const newPosition = await standings.getPosition(TEST_USERS.participant1.name);
        expect(newPosition).not.toBe(initialPosition);
      }).toPass({ timeout: 5000 });

      await adminCtx.close();
      await participantCtx.close();
    });
  });
});
```

```typescript
// e2e/high/notifications.spec.ts
import { test, expect } from '../fixtures/auth.fixture';
import { NotificationsPage } from '../fixtures/page-objects/notifications.page';

test.describe('Notifications — High', () => {

  test.describe('NOTIF-001: In-app badge count', () => {
    test('badge shows correct unread count', async ({ participantPage }) => {
      const notifications = new NotificationsPage(participantPage);
      await notifications.goto();
      const badgeCount = await notifications.getBadgeCount();
      const unreadCount = await notifications.getUnreadCount();
      expect(badgeCount).toBe(unreadCount);
    });
  });

  test.describe('NOTIF-005: Configure notification channels', () => {
    test('participant can toggle email and web push channels', async ({ participantPage }) => {
      const notifications = new NotificationsPage(participantPage);
      await notifications.gotoSettings();

      await notifications.toggleChannel('email');
      await notifications.expectChannelState('email', false);
      await notifications.toggleChannel('email');
      await notifications.expectChannelState('email', true);

      await notifications.toggleChannel('webPush');
      await notifications.saveSettings();
      await notifications.expectToast('success');

      // Reload and verify persisted
      await participantPage.reload();
      await notifications.gotoSettings();
      await notifications.expectChannelState('webPush', false);
    });
  });
});
```

```typescript
// e2e/medium/privacy.spec.ts
import { test, expect } from '../fixtures/auth.fixture';
import { ProfilePage } from '../fixtures/page-objects/profile.page';
import { TEST_USERS } from '../fixtures/test-data';

test.describe('Privacy & Profile — Medium', () => {

  test.describe('PRIV-001: Field-level visibility', () => {
    test('phone number hidden from public when set to "only admins"', async ({
      participantPage, publicPage,
    }) => {
      // Participant sets phone to "only admins"
      const profile = new ProfilePage(participantPage);
      await profile.goto();
      await profile.setFieldVisibility('phone', 'ONLY_ADMINS');
      await profile.savePrivacySettings();
      await profile.expectToast('success');

      // Public views participant profile
      await publicPage.goto(`/players/${TEST_USERS.participant1.email}`);
      await expect(publicPage.locator('[data-testid="profile-phone"]')).not.toBeVisible();
    });
  });

  test.describe('PRIV-004: Admin always sees full profile', () => {
    test('sysadmin sees phone even when set to only admins', async ({
      sysAdminPage,
    }) => {
      await sysAdminPage.goto(`/players/${TEST_USERS.participant1.email}`);
      await expect(sysAdminPage.locator('[data-testid="profile-phone"]')).toBeVisible();
    });
  });
});
```

---

## IMPLEMENTATION CHECKLIST

For each scenario in `E2E_TEST_SCENARIOS.md`:

- [ ] Page Object Model created or updated with domain-specific locators
- [ ] Test in correct priority folder with scenario ID in test name
- [ ] Correct fixture used (sysAdminPage / tournamentAdminPage / participantPage / publicPage)
- [ ] All verification steps from scenario implemented
- [ ] Async operations use `await` and appropriate `waitFor` calls
- [ ] Test data references `test-data.ts` constants — no magic strings
- [ ] Test is fully isolated (no dependency on execution order)
- [ ] `data-testid` attributes verified against actual Angular templates
- [ ] Real-time scenarios use multi-context browser approach
- [ ] Scenarios marked `[PENDING IMPLEMENTATION]` use `test.skip()` with reason

---

## OUTPUT SUMMARY

After implementation, generate:
`/projects/5-TennisTournamentManager/docs/testing/E2E_TEST_IMPLEMENTATION_SUMMARY.md`

Including:
- Total tests implemented / skipped (pending implementation)
- Tests per priority level
- Page Objects created and their locator count
- Test data seed requirements
- Known gaps or limitations
- Run instructions

---

## RUN COMMANDS

```bash
# Install Playwright
npx playwright install

# Run all tests
npx playwright test

# Run critical tests only
npx playwright test e2e/critical/

# Run with interactive UI
npx playwright test --ui

# Run specific browser
npx playwright test --project=chromium

# Run specific spec
npx playwright test e2e/critical/draw-generation.spec.ts

# Generate HTML report
npx playwright show-report

# Run mobile tests
npx playwright test --project=mobile-chrome

# Debug mode
npx playwright test --debug
```
