# E2E TEST IMPLEMENTATION - PLAYWRIGHT TEST GENERATION

## OBJECTIVE
You are a Senior QA Automation Engineer Agent specialized in Playwright. Your task is to implement comprehensive E2E tests based on the test scenarios documented in Phase 1. Generate production-ready Playwright test files following best practices.

## PROJECT CONTEXT

**Project:** Cartographic Project Manager (CPM)
**Testing Framework:** Playwright
**Language:** TypeScript
**Application URL:** http://localhost:5173

## INPUT DOCUMENT

Read and follow the test scenarios documented at:
`docs/testing/E2E_TEST_SCENARIOS.md`

## OUTPUT STRUCTURE

Generate test files in the following structure:
```
e2e/
├── playwright.config.ts           # Playwright configuration
├── global-setup.ts                # Global setup (auth, seeding)
├── global-teardown.ts             # Global teardown (cleanup)
├── fixtures/
│   ├── test-data.ts               # Test data constants
│   ├── auth.fixture.ts            # Authentication fixtures
│   └── page-objects/              # Page Object Models
│       ├── base.page.ts
│       ├── login.page.ts
│       ├── dashboard.page.ts
│       ├── project-list.page.ts
│       ├── project-details.page.ts
│       ├── calendar.page.ts
│       ├── notifications.page.ts
│       └── backup.page.ts
├── helpers/
│   ├── api.helper.ts              # API helper for setup/teardown
│   └── wait.helper.ts             # Custom wait utilities
├── critical/
│   ├── auth.spec.ts
│   ├── project-crud.spec.ts
│   └── task-workflow.spec.ts
├── high/
│   ├── messaging.spec.ts
│   ├── file-management.spec.ts
│   └── navigation.spec.ts
├── medium/
│   ├── calendar.spec.ts
│   ├── notifications.spec.ts
│   └── responsive.spec.ts
└── low/
    ├── edge-cases.spec.ts
    └── accessibility.spec.ts
```

## IMPLEMENTATION STANDARDS

### 1. Playwright Configuration

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
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile browsers
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
    // Tablet
    {
      name: 'tablet',
      use: { ...devices['iPad (gen 7)'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

### 2. Page Object Model Pattern

```typescript
// e2e/fixtures/page-objects/base.page.ts
import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;
  
  // Common elements
  readonly header: Locator;
  readonly sidebar: Locator;
  readonly loadingSpinner: Locator;
  readonly toastContainer: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.header = page.locator('[data-testid="app-header"]');
    this.sidebar = page.locator('[data-testid="app-sidebar"]');
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    this.toastContainer = page.locator('.toast-container');
  }
  
  abstract readonly url: string;
  
  async goto(): Promise<void> {
    await this.page.goto(this.url);
    await this.waitForPageLoad();
  }
  
  async waitForPageLoad(): Promise<void> {
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 30000 });
  }
  
  async waitForToast(type: 'success' | 'error' | 'warning' | 'info'): Promise<Locator> {
    const toast = this.toastContainer.locator(`.toast-${type}`);
    await toast.waitFor({ state: 'visible' });
    return toast;
  }
  
  async expectToastMessage(type: 'success' | 'error', message: string): Promise<void> {
    const toast = await this.waitForToast(type);
    await expect(toast).toContainText(message);
  }
  
  async dismissToast(): Promise<void> {
    await this.toastContainer.locator('.toast-close').first().click();
  }
  
  async navigateViaSidebar(itemName: string): Promise<void> {
    await this.sidebar.getByRole('link', { name: itemName }).click();
  }
  
  async logout(): Promise<void> {
    await this.header.getByRole('button', { name: /user menu/i }).click();
    await this.page.getByRole('menuitem', { name: /logout/i }).click();
  }
}
```

```typescript
// e2e/fixtures/page-objects/login.page.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly url = '/login';
  
  // Locators
  readonly logo: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly passwordToggle: Locator;
  
  constructor(page: Page) {
    super(page);
    this.logo = page.locator('.login-logo');
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.rememberMeCheckbox = page.getByLabel('Remember me');
    this.submitButton = page.getByRole('button', { name: /sign in/i });
    this.errorMessage = page.locator('.login-error');
    this.passwordToggle = page.locator('.login-password-toggle');
  }
  
  async login(email: string, password: string, rememberMe = false): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    
    if (rememberMe) {
      await this.rememberMeCheckbox.check();
    }
    
    await this.submitButton.click();
  }
  
  async expectLoginSuccess(): Promise<void> {
    await this.page.waitForURL('/');
    await expect(this.page).toHaveURL('/');
  }
  
  async expectLoginError(message?: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }
  
  async togglePasswordVisibility(): Promise<void> {
    await this.passwordToggle.click();
  }
  
  async expectPasswordVisible(): Promise<void> {
    await expect(this.passwordInput).toHaveAttribute('type', 'text');
  }
  
  async expectPasswordHidden(): Promise<void> {
    await expect(this.passwordInput).toHaveAttribute('type', 'password');
  }
  
  async expectSubmitDisabled(): Promise<void> {
    await expect(this.submitButton).toBeDisabled();
  }
}
```

```typescript
// e2e/fixtures/page-objects/dashboard.page.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  readonly url = '/';
  
  // Locators
  readonly welcomeMessage: Locator;
  readonly statsCards: Locator;
  readonly totalProjectsStat: Locator;
  readonly pendingTasksStat: Locator;
  readonly unreadMessagesStat: Locator;
  readonly overdueProjectsStat: Locator;
  readonly recentProjectsSection: Locator;
  readonly upcomingDeadlinesSection: Locator;
  readonly newProjectButton: Locator;
  readonly miniCalendar: Locator;
  
  constructor(page: Page) {
    super(page);
    this.welcomeMessage = page.locator('.dashboard-welcome');
    this.statsCards = page.locator('.dashboard-stat-card');
    this.totalProjectsStat = page.locator('[data-testid="stat-total-projects"]');
    this.pendingTasksStat = page.locator('[data-testid="stat-pending-tasks"]');
    this.unreadMessagesStat = page.locator('[data-testid="stat-unread-messages"]');
    this.overdueProjectsStat = page.locator('[data-testid="stat-overdue-projects"]');
    this.recentProjectsSection = page.locator('.dashboard-recent-projects');
    this.upcomingDeadlinesSection = page.locator('.dashboard-deadlines');
    this.newProjectButton = page.getByRole('button', { name: /new project/i });
    this.miniCalendar = page.locator('.calendar-widget-mini');
  }
  
  async expectWelcomeMessage(username: string): Promise<void> {
    await expect(this.welcomeMessage).toContainText(`Welcome back, ${username}`);
  }
  
  async getStatValue(statName: 'projects' | 'tasks' | 'messages' | 'overdue'): Promise<number> {
    const statLocators = {
      projects: this.totalProjectsStat,
      tasks: this.pendingTasksStat,
      messages: this.unreadMessagesStat,
      overdue: this.overdueProjectsStat,
    };
    
    const text = await statLocators[statName].locator('.dashboard-stat-value').textContent();
    return parseInt(text || '0', 10);
  }
  
  async clickNewProject(): Promise<void> {
    await this.newProjectButton.click();
  }
  
  async expectNewProjectButtonVisible(): Promise<void> {
    await expect(this.newProjectButton).toBeVisible();
  }
  
  async expectNewProjectButtonHidden(): Promise<void> {
    await expect(this.newProjectButton).not.toBeVisible();
  }
  
  async clickRecentProject(projectCode: string): Promise<void> {
    await this.recentProjectsSection
      .locator('.project-card')
      .filter({ hasText: projectCode })
      .click();
  }
  
  async expectRecentProjectsCount(count: number): Promise<void> {
    await expect(this.recentProjectsSection.locator('.project-card')).toHaveCount(count);
  }
}
```

```typescript
// e2e/fixtures/page-objects/project-list.page.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class ProjectListPage extends BasePage {
  readonly url = '/projects';
  
  // Locators
  readonly searchInput: Locator;
  readonly statusFilter: Locator;
  readonly typeFilter: Locator;
  readonly sortSelect: Locator;
  readonly newProjectButton: Locator;
  readonly projectCards: Locator;
  readonly emptyState: Locator;
  readonly clearFiltersButton: Locator;
  
  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByPlaceholder('Search projects');
    this.statusFilter = page.locator('[data-testid="filter-status"]');
    this.typeFilter = page.locator('[data-testid="filter-type"]');
    this.sortSelect = page.locator('.filter-select').last();
    this.newProjectButton = page.getByRole('button', { name: /new project/i });
    this.projectCards = page.locator('.project-card, [data-testid="project-card"]');
    this.emptyState = page.locator('.projects-empty');
    this.clearFiltersButton = page.locator('.filter-clear');
  }
  
  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500); // Debounce
  }
  
  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
  }
  
  async filterByStatus(status: string): Promise<void> {
    await this.statusFilter.selectOption(status);
  }
  
  async filterByType(type: string): Promise<void> {
    await this.typeFilter.selectOption(type);
  }
  
  async sortBy(option: string): Promise<void> {
    await this.sortSelect.selectOption(option);
  }
  
  async clearFilters(): Promise<void> {
    await this.clearFiltersButton.click();
  }
  
  async getProjectCount(): Promise<number> {
    return await this.projectCards.count();
  }
  
  async expectProjectCount(count: number): Promise<void> {
    await expect(this.projectCards).toHaveCount(count);
  }
  
  async expectEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
  }
  
  async clickProject(projectCode: string): Promise<void> {
    await this.projectCards.filter({ hasText: projectCode }).click();
  }
  
  async clickNewProject(): Promise<void> {
    await this.newProjectButton.click();
  }
  
  async openProjectMenu(projectCode: string): Promise<void> {
    const card = this.projectCards.filter({ hasText: projectCode });
    await card.locator('[data-testid="project-menu-trigger"]').click();
  }
  
  async editProject(projectCode: string): Promise<void> {
    await this.openProjectMenu(projectCode);
    await this.page.getByRole('menuitem', { name: /edit/i }).click();
  }
  
  async deleteProject(projectCode: string): Promise<void> {
    await this.openProjectMenu(projectCode);
    await this.page.getByRole('menuitem', { name: /delete/i }).click();
  }
  
  async confirmDelete(): Promise<void> {
    await this.page.getByRole('button', { name: /delete/i }).click();
  }
  
  async cancelDelete(): Promise<void> {
    await this.page.getByRole('button', { name: /cancel/i }).click();
  }
}
```

### 3. Authentication Fixture

```typescript
// e2e/fixtures/auth.fixture.ts
import { test as base, Page } from '@playwright/test';
import { LoginPage } from './page-objects/login.page';
import { TEST_USERS } from './test-data';

// Extend base test with authentication
export const test = base.extend<{
  adminPage: Page;
  clientPage: Page;
  authenticatedPage: Page;
}>({
  // Admin authenticated page
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'e2e/.auth/admin.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  
  // Client authenticated page
  clientPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'e2e/.auth/client.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  
  // Generic authenticated page (can be configured)
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'e2e/.auth/admin.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

// Global setup for auth state
export async function globalAuthSetup(): Promise<void> {
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch();
  
  // Setup admin auth state
  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  const adminLogin = new LoginPage(adminPage);
  await adminLogin.goto();
  await adminLogin.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
  await adminLogin.expectLoginSuccess();
  await adminContext.storageState({ path: 'e2e/.auth/admin.json' });
  await adminContext.close();
  
  // Setup client auth state
  const clientContext = await browser.newContext();
  const clientPage = await clientContext.newPage();
  const clientLogin = new LoginPage(clientPage);
  await clientLogin.goto();
  await clientLogin.login(TEST_USERS.client1.email, TEST_USERS.client1.password);
  await clientLogin.expectLoginSuccess();
  await clientContext.storageState({ path: 'e2e/.auth/client.json' });
  await clientContext.close();
  
  await browser.close();
}

export { expect } from '@playwright/test';
```

### 4. Test Data

```typescript
// e2e/fixtures/test-data.ts
export const TEST_USERS = {
  admin: {
    email: 'admin@test.com',
    password: 'AdminPass123!',
    name: 'Admin User',
    role: 'ADMINISTRATOR',
  },
  client1: {
    email: 'client1@test.com',
    password: 'ClientPass123!',
    name: 'Client One',
    role: 'CLIENT',
  },
  client2: {
    email: 'client2@test.com',
    password: 'ClientPass123!',
    name: 'Client Two',
    role: 'CLIENT',
  },
  special: {
    email: 'special@test.com',
    password: 'SpecialPass123!',
    name: 'Special User',
    role: 'SPECIAL_USER',
  },
} as const;

export const TEST_PROJECTS = {
  active: {
    code: 'CART-2024-001',
    name: 'Test Project Active',
    status: 'ACTIVE',
    clientEmail: TEST_USERS.client1.email,
  },
  inProgress: {
    code: 'CART-2024-002',
    name: 'Test Project Progress',
    status: 'IN_PROGRESS',
    clientEmail: TEST_USERS.client1.email,
  },
  pendingReview: {
    code: 'CART-2024-003',
    name: 'Test Project Review',
    status: 'PENDING_REVIEW',
    clientEmail: TEST_USERS.client2.email,
  },
  finalized: {
    code: 'CART-2024-004',
    name: 'Test Project Finalized',
    status: 'FINALIZED',
    clientEmail: TEST_USERS.client2.email,
  },
  overdue: {
    code: 'CART-2024-005',
    name: 'Test Project Overdue',
    status: 'ACTIVE',
    clientEmail: TEST_USERS.client1.email,
    isOverdue: true,
  },
} as const;

export const INVALID_CREDENTIALS = {
  wrongPassword: {
    email: TEST_USERS.admin.email,
    password: 'WrongPassword123!',
  },
  invalidEmail: {
    email: 'invalid-email',
    password: 'AnyPassword123!',
  },
  nonExistentUser: {
    email: 'nonexistent@test.com',
    password: 'AnyPassword123!',
  },
} as const;

export const NEW_PROJECT_DATA = {
  valid: {
    name: 'E2E Test New Project',
    type: 'RESIDENTIAL',
    contractDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    longitude: '-15.4134',
    latitude: '28.0997',
  },
  invalidDates: {
    name: 'Invalid Date Project',
    type: 'COMMERCIAL',
    contractDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    deliveryDate: new Date().toISOString().split('T')[0], // Before contract
  },
} as const;
```

### 5. Test Implementation Examples

```typescript
// e2e/critical/auth.spec.ts
import { test, expect } from '../fixtures/auth.fixture';
import { LoginPage } from '../fixtures/page-objects/login.page';
import { DashboardPage } from '../fixtures/page-objects/dashboard.page';
import { TEST_USERS, INVALID_CREDENTIALS } from '../fixtures/test-data';

test.describe('Authentication - Critical', () => {
  test.describe('AUTH-001: Successful Login', () => {
    test('should login with valid admin credentials', async ({ page }) => {
      const loginPage = new LoginPage(page);
      const dashboardPage = new DashboardPage(page);
      
      await loginPage.goto();
      await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
      await loginPage.expectLoginSuccess();
      
      await dashboardPage.expectWelcomeMessage(TEST_USERS.admin.name);
    });
    
    test('should login with valid client credentials', async ({ page }) => {
      const loginPage = new LoginPage(page);
      const dashboardPage = new DashboardPage(page);
      
      await loginPage.goto();
      await loginPage.login(TEST_USERS.client1.email, TEST_USERS.client1.password);
      await loginPage.expectLoginSuccess();
      
      await dashboardPage.expectWelcomeMessage(TEST_USERS.client1.name);
    });
  });
  
  test.describe('AUTH-002: Invalid Email Format', () => {
    test('should show validation error for invalid email', async ({ page }) => {
      const loginPage = new LoginPage(page);
      
      await loginPage.goto();
      await loginPage.login(INVALID_CREDENTIALS.invalidEmail.email, INVALID_CREDENTIALS.invalidEmail.password);
      
      // Should not redirect
      await expect(page).toHaveURL('/login');
      // Validation error should be shown (either HTML5 or custom)
    });
  });
  
  test.describe('AUTH-003: Wrong Password', () => {
    test('should show error message for wrong password', async ({ page }) => {
      const loginPage = new LoginPage(page);
      
      await loginPage.goto();
      await loginPage.login(
        INVALID_CREDENTIALS.wrongPassword.email,
        INVALID_CREDENTIALS.wrongPassword.password
      );
      
      await loginPage.expectLoginError('Invalid email or password');
      await expect(page).toHaveURL('/login');
    });
  });
  
  test.describe('AUTH-004: Empty Fields', () => {
    test('should disable submit button when fields are empty', async ({ page }) => {
      const loginPage = new LoginPage(page);
      
      await loginPage.goto();
      await loginPage.expectSubmitDisabled();
    });
    
    test('should disable submit when only email is filled', async ({ page }) => {
      const loginPage = new LoginPage(page);
      
      await loginPage.goto();
      await loginPage.emailInput.fill(TEST_USERS.admin.email);
      await loginPage.expectSubmitDisabled();
    });
  });
  
  test.describe('AUTH-005: Remember Me', () => {
    test('should persist session when remember me is checked', async ({ page, context }) => {
      const loginPage = new LoginPage(page);
      
      await loginPage.goto();
      await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password, true);
      await loginPage.expectLoginSuccess();
      
      // Get storage state
      const storage = await context.storageState();
      expect(storage.cookies.length).toBeGreaterThan(0);
    });
  });
  
  test.describe('AUTH-006: Logout', () => {
    test('should logout and redirect to login', async ({ adminPage }) => {
      const dashboardPage = new DashboardPage(adminPage);
      const loginPage = new LoginPage(adminPage);
      
      await dashboardPage.goto();
      await dashboardPage.logout();
      
      await expect(adminPage).toHaveURL('/login');
    });
  });
  
  test.describe('AUTH-008: Protected Routes', () => {
    test('should redirect to login when accessing protected route unauthenticated', async ({ page }) => {
      // Clear any existing auth
      await page.context().clearCookies();
      
      await page.goto('/projects');
      await expect(page).toHaveURL(/\/login/);
      
      await page.goto('/calendar');
      await expect(page).toHaveURL(/\/login/);
      
      await page.goto('/backup');
      await expect(page).toHaveURL(/\/login/);
    });
  });
});
```

```typescript
// e2e/critical/project-crud.spec.ts
import { test, expect } from '../fixtures/auth.fixture';
import { ProjectListPage } from '../fixtures/page-objects/project-list.page';
import { DashboardPage } from '../fixtures/page-objects/dashboard.page';
import { TEST_PROJECTS, NEW_PROJECT_DATA, TEST_USERS } from '../fixtures/test-data';

test.describe('Project CRUD - Critical', () => {
  test.describe('PROJ-001: Create Project - Happy Path', () => {
    test('admin can create a new project', async ({ adminPage }) => {
      const projectListPage = new ProjectListPage(adminPage);
      
      await projectListPage.goto();
      await projectListPage.clickNewProject();
      
      // Fill form
      await adminPage.getByLabel('Project Name').fill(NEW_PROJECT_DATA.valid.name);
      await adminPage.getByLabel('Client').selectOption({ label: TEST_USERS.client1.name });
      await adminPage.getByLabel('Type').selectOption(NEW_PROJECT_DATA.valid.type);
      await adminPage.getByLabel('Contract Date').fill(NEW_PROJECT_DATA.valid.contractDate);
      await adminPage.getByLabel('Delivery Date').fill(NEW_PROJECT_DATA.valid.deliveryDate);
      
      // Submit
      await adminPage.getByRole('button', { name: /create project/i }).click();
      
      // Verify success
      await expect(adminPage.locator('.toast-success')).toBeVisible();
      await expect(projectListPage.projectCards.filter({ hasText: NEW_PROJECT_DATA.valid.name })).toBeVisible();
    });
  });
  
  test.describe('PROJ-004: View Project List - Admin sees all', () => {
    test('admin sees all projects', async ({ adminPage }) => {
      const projectListPage = new ProjectListPage(adminPage);
      
      await projectListPage.goto();
      
      // Admin should see all test projects
      const count = await projectListPage.getProjectCount();
      expect(count).toBeGreaterThanOrEqual(5);
    });
  });
  
  test.describe('PROJ-005: View Project List - Client sees own only', () => {
    test('client sees only their projects', async ({ clientPage }) => {
      const projectListPage = new ProjectListPage(clientPage);
      
      await projectListPage.goto();
      
      // Client 1 should only see their 3 projects
      await projectListPage.expectProjectCount(3);
      
      // Should not see Client 2's projects
      await expect(projectListPage.projectCards.filter({ hasText: TEST_PROJECTS.pendingReview.code })).not.toBeVisible();
    });
  });
  
  test.describe('PROJ-006: Search Functionality', () => {
    test('should filter projects by search term', async ({ adminPage }) => {
      const projectListPage = new ProjectListPage(adminPage);
      
      await projectListPage.goto();
      
      // Search by project code
      await projectListPage.search(TEST_PROJECTS.active.code);
      await projectListPage.expectProjectCount(1);
      await expect(projectListPage.projectCards.first()).toContainText(TEST_PROJECTS.active.code);
      
      // Clear and verify all returned
      await projectListPage.clearSearch();
      const count = await projectListPage.getProjectCount();
      expect(count).toBeGreaterThan(1);
    });
    
    test('should show empty state for no results', async ({ adminPage }) => {
      const projectListPage = new ProjectListPage(adminPage);
      
      await projectListPage.goto();
      await projectListPage.search('NONEXISTENT-PROJECT-XYZ');
      
      await projectListPage.expectEmptyState();
    });
  });
  
  test.describe('PROJ-016: Delete Project', () => {
    test('admin can delete project with confirmation', async ({ adminPage }) => {
      const projectListPage = new ProjectListPage(adminPage);
      
      await projectListPage.goto();
      
      // Get initial count
      const initialCount = await projectListPage.getProjectCount();
      
      // Find a deletable project and delete it
      await projectListPage.deleteProject(TEST_PROJECTS.active.code);
      
      // Verify confirmation dialog
      await expect(adminPage.getByText(/are you sure/i)).toBeVisible();
      
      // Cancel first
      await projectListPage.cancelDelete();
      await projectListPage.expectProjectCount(initialCount);
      
      // Now actually delete
      await projectListPage.deleteProject(TEST_PROJECTS.active.code);
      await projectListPage.confirmDelete();
      
      // Verify deleted
      await expect(adminPage.locator('.toast-success')).toBeVisible();
      await projectListPage.expectProjectCount(initialCount - 1);
    });
  });
  
  test.describe('PROJ-017: Client Cannot Delete', () => {
    test('client does not see delete option', async ({ clientPage }) => {
      const projectListPage = new ProjectListPage(clientPage);
      
      await projectListPage.goto();
      
      // Open menu on client's project
      await projectListPage.openProjectMenu(TEST_PROJECTS.inProgress.code);
      
      // Delete option should not be visible
      await expect(clientPage.getByRole('menuitem', { name: /delete/i })).not.toBeVisible();
    });
  });
});
```

```typescript
// e2e/critical/task-workflow.spec.ts
import { test, expect } from '../fixtures/auth.fixture';
import { ProjectDetailsPage } from '../fixtures/page-objects/project-details.page';
import { TEST_PROJECTS } from '../fixtures/test-data';

test.describe('Task Workflow - Critical', () => {
  test.describe('TASK-009: Status Transition PENDING → IN_PROGRESS', () => {
    test('assignee can change task status to in progress', async ({ clientPage }) => {
      const projectDetails = new ProjectDetailsPage(clientPage);
      
      await projectDetails.goto(TEST_PROJECTS.inProgress.code);
      await projectDetails.switchToTab('tasks');
      
      // Find pending task
      const pendingTask = projectDetails.taskCard.filter({ has: clientPage.locator('.task-status-pending') }).first();
      await expect(pendingTask).toBeVisible();
      
      // Change status
      await pendingTask.locator('[data-testid="status-change-btn"]').click();
      await clientPage.getByRole('button', { name: /in progress/i }).click();
      
      // Verify status changed
      await expect(pendingTask.locator('.task-status-in-progress')).toBeVisible();
    });
  });
  
  test.describe('TASK-019: Admin Confirms Task', () => {
    test('admin can confirm a performed task', async ({ adminPage }) => {
      const projectDetails = new ProjectDetailsPage(adminPage);
      
      await projectDetails.goto(TEST_PROJECTS.inProgress.code);
      await projectDetails.switchToTab('tasks');
      
      // Find performed task
      const performedTask = projectDetails.taskCard.filter({ has: adminPage.locator('.task-status-performed') }).first();
      
      if (await performedTask.isVisible()) {
        await performedTask.locator('[data-testid="confirm-task-btn"]').click();
        
        // Add feedback (optional)
        await adminPage.getByLabel('Feedback').fill('Great work!');
        await adminPage.getByRole('button', { name: /confirm/i }).click();
        
        // Verify completed
        await expect(adminPage.locator('.toast-success')).toBeVisible();
      }
    });
  });
  
  test.describe('TASK-023: Admin Rejects Task', () => {
    test('admin can reject a performed task with reason', async ({ adminPage }) => {
      const projectDetails = new ProjectDetailsPage(adminPage);
      
      await projectDetails.goto(TEST_PROJECTS.inProgress.code);
      await projectDetails.switchToTab('tasks');
      
      // Find performed task
      const performedTask = projectDetails.taskCard.filter({ has: adminPage.locator('.task-status-performed') }).first();
      
      if (await performedTask.isVisible()) {
        await performedTask.locator('[data-testid="reject-task-btn"]').click();
        
        // Enter required reason
        await adminPage.getByLabel('Rejection Reason').fill('Needs revision on section A');
        await adminPage.getByRole('button', { name: /reject/i }).click();
        
        // Verify back to pending
        await expect(adminPage.locator('.toast-success')).toBeVisible();
      }
    });
  });
});
```

```typescript
// e2e/high/messaging.spec.ts
import { test, expect } from '../fixtures/auth.fixture';
import { ProjectDetailsPage } from '../fixtures/page-objects/project-details.page';
import { TEST_PROJECTS } from '../fixtures/test-data';

test.describe('Messaging - High Priority', () => {
  test.describe('MSG-001: Send Text Message', () => {
    test('user can send a text message', async ({ adminPage }) => {
      const projectDetails = new ProjectDetailsPage(adminPage);
      
      await projectDetails.goto(TEST_PROJECTS.active.code);
      await projectDetails.switchToTab('messages');
      
      const testMessage = `Test message ${Date.now()}`;
      
      await projectDetails.messageInput.fill(testMessage);
      await projectDetails.sendMessageButton.click();
      
      // Verify message appears
      await expect(projectDetails.messageList.locator('.message-bubble').last()).toContainText(testMessage);
    });
  });
  
  test.describe('MSG-002: Send Message with Attachment', () => {
    test('user can send message with file attachment', async ({ adminPage }) => {
      const projectDetails = new ProjectDetailsPage(adminPage);
      
      await projectDetails.goto(TEST_PROJECTS.active.code);
      await projectDetails.switchToTab('messages');
      
      // Attach file
      const fileInput = adminPage.locator('input[type="file"]');
      await fileInput.setInputFiles('./e2e/fixtures/test-file.pdf');
      
      // Verify file preview
      await expect(projectDetails.filePreview).toBeVisible();
      
      // Send
      await projectDetails.messageInput.fill('Message with attachment');
      await projectDetails.sendMessageButton.click();
      
      // Verify message with attachment
      const lastMessage = projectDetails.messageList.locator('.message-bubble').last();
      await expect(lastMessage).toContainText('Message with attachment');
      await expect(lastMessage.locator('.message-file')).toBeVisible();
    });
  });
  
  test.describe('MSG-006: Real-time Message Reception', () => {
    test('messages appear in real-time without refresh', async ({ browser }) => {
      // Create two separate contexts for two users
      const adminContext = await browser.newContext({ storageState: 'e2e/.auth/admin.json' });
      const clientContext = await browser.newContext({ storageState: 'e2e/.auth/client.json' });
      
      const adminPage = await adminContext.newPage();
      const clientPage = await clientContext.newPage();
      
      const projectCode = TEST_PROJECTS.active.code;
      
      // Both users open the same project messages
      const adminDetails = new ProjectDetailsPage(adminPage);
      const clientDetails = new ProjectDetailsPage(clientPage);
      
      await adminDetails.goto(projectCode);
      await adminDetails.switchToTab('messages');
      
      await clientDetails.goto(projectCode);
      await clientDetails.switchToTab('messages');
      
      // Admin sends a message
      const testMessage = `Real-time test ${Date.now()}`;
      await adminDetails.messageInput.fill(testMessage);
      await adminDetails.sendMessageButton.click();
      
      // Client should see the message without refresh
      await expect(clientDetails.messageList.locator('.message-bubble').last()).toContainText(testMessage, {
        timeout: 10000,
      });
      
      // Cleanup
      await adminContext.close();
      await clientContext.close();
    });
  });
});
```

```typescript
// e2e/medium/responsive.spec.ts
import { test, expect, devices } from '@playwright/test';
import { LoginPage } from '../fixtures/page-objects/login.page';
import { DashboardPage } from '../fixtures/page-objects/dashboard.page';
import { TEST_USERS } from '../fixtures/test-data';

test.describe('Responsive Design - Medium Priority', () => {
  test.describe('RESP-001: Mobile Login', () => {
    test.use({ ...devices['iPhone 12'] });
    
    test('login works correctly on mobile viewport', async ({ page }) => {
      const loginPage = new LoginPage(page);
      
      await loginPage.goto();
      
      // Verify layout is mobile-friendly
      await expect(loginPage.logo).toBeVisible();
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      
      // Perform login
      await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
      await loginPage.expectLoginSuccess();
    });
  });
  
  test.describe('RESP-002: Mobile Sidebar', () => {
    test.use({ ...devices['iPhone 12'] });
    
    test('sidebar is hidden by default and opens via hamburger', async ({ page }) => {
      // Login first
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
      await loginPage.expectLoginSuccess();
      
      const dashboardPage = new DashboardPage(page);
      
      // Sidebar should be hidden on mobile
      await expect(dashboardPage.sidebar).not.toBeVisible();
      
      // Hamburger menu should be visible
      const hamburgerButton = page.locator('[data-testid="mobile-menu-toggle"]');
      await expect(hamburgerButton).toBeVisible();
      
      // Open sidebar
      await hamburgerButton.click();
      await expect(dashboardPage.sidebar).toBeVisible();
      
      // Click overlay to close
      await page.locator('.app-sidebar-overlay').click();
      await expect(dashboardPage.sidebar).not.toBeVisible();
    });
  });
  
  test.describe('RESP-003: Tablet Layout', () => {
    test.use({ ...devices['iPad (gen 7)'] });
    
    test('tablet layout displays correctly', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
      await loginPage.expectLoginSuccess();
      
      const dashboardPage = new DashboardPage(page);
      
      // Stats cards should be in 2-column grid on tablet
      await expect(dashboardPage.statsCards).toHaveCount(4);
      
      // All sections should be visible
      await expect(dashboardPage.recentProjectsSection).toBeVisible();
      await expect(dashboardPage.upcomingDeadlinesSection).toBeVisible();
    });
  });
});
```

```typescript
// e2e/low/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { LoginPage } from '../fixtures/page-objects/login.page';
import { DashboardPage } from '../fixtures/page-objects/dashboard.page';
import { TEST_USERS } from '../fixtures/test-data';

test.describe('Accessibility - Low Priority', () => {
  test.describe('A11Y-001: Keyboard Navigation', () => {
    test('can navigate login form with keyboard only', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      
      // Tab to email
      await page.keyboard.press('Tab');
      await expect(loginPage.emailInput).toBeFocused();
      
      // Tab to password
      await page.keyboard.press('Tab');
      await expect(loginPage.passwordInput).toBeFocused();
      
      // Tab to remember me
      await page.keyboard.press('Tab');
      await expect(loginPage.rememberMeCheckbox).toBeFocused();
      
      // Tab to submit
      await page.keyboard.press('Tab');
      await expect(loginPage.submitButton).toBeFocused();
    });
    
    test('can login using only keyboard', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      
      // Type email
      await loginPage.emailInput.focus();
      await page.keyboard.type(TEST_USERS.admin.email);
      
      // Tab to password and type
      await page.keyboard.press('Tab');
      await page.keyboard.type(TEST_USERS.admin.password);
      
      // Tab to submit and press Enter
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab'); // Skip remember me
      await page.keyboard.press('Enter');
      
      await loginPage.expectLoginSuccess();
    });
  });
  
  test.describe('A11Y-002: Axe Accessibility Audit', () => {
    test('login page should have no accessibility violations', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      expect(results.violations).toEqual([]);
    });
    
    test('dashboard should have no accessibility violations', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
      await loginPage.expectLoginSuccess();
      
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .exclude('.mini-calendar') // May have known issues
        .analyze();
      
      expect(results.violations).toEqual([]);
    });
  });
  
  test.describe('A11Y-003: Focus Management', () => {
    test('focus is trapped in modal dialogs', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
      await loginPage.expectLoginSuccess();
      
      // Open create project modal
      await page.getByRole('button', { name: /new project/i }).click();
      
      // First focusable element should be focused
      const modalFirstInput = page.locator('.modal-content').getByRole('textbox').first();
      await expect(modalFirstInput).toBeFocused();
      
      // Tab through all elements - should stay within modal
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');
      }
      
      // Should still be in modal
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toHaveCount(1);
      const isInModal = await focusedElement.evaluate((el) => {
        return el.closest('.modal-content') !== null;
      });
      expect(isInModal).toBe(true);
      
      // Escape closes modal
      await page.keyboard.press('Escape');
      await expect(page.locator('.modal-content')).not.toBeVisible();
    });
  });
});
```

## IMPLEMENTATION CHECKLIST

For each test scenario from the E2E_TEST_SCENARIOS.md document:

- [ ] Create or update appropriate Page Object Model
- [ ] Implement test in correct priority folder
- [ ] Use proper fixtures and test data
- [ ] Add descriptive test names matching scenario IDs
- [ ] Include all verification steps from scenario
- [ ] Handle async operations properly
- [ ] Add proper error messages for failures
- [ ] Ensure test isolation (no dependencies on other tests)
- [ ] Add appropriate timeouts where needed
- [ ] Document any deviations from scenario

## OUTPUT SUMMARY

After implementation, generate a summary document at:
`docs/testing/E2E_TEST_IMPLEMENTATION_SUMMARY.md`

Including:
- Total tests implemented
- Tests per priority level
- Page Objects created
- Test data defined
- Known issues or limitations
- Coverage gaps (if any)
- Instructions for running tests

## COMMANDS

```bash
# Run all tests
npx playwright test

# Run critical tests only
npx playwright test e2e/critical/

# Run with UI
npx playwright test --ui

# Run specific browser
npx playwright test --project=chromium

# Generate report
npx playwright show-report
```

Begin implementing the tests following the E2E_TEST_SCENARIOS.md document.