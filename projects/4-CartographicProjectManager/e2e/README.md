# E2E Tests with Playwright

This directory contains end-to-end tests for the Cartographic Project Manager application using Playwright.

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in UI mode (recommended for development)
npm run test:e2e:ui

# Run tests in headed mode (see the browser)
npm run test:e2e:headed

# Show test report
npm run test:e2e:report
```

## Writing Tests

Tests should be placed in this directory with the `.spec.ts` extension.

Example test structure:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    
    // Your test assertions here
    await expect(page).toHaveTitle(/Cartographic/);
  });
});
```

## Configuration

The Playwright configuration is in `playwright.config.ts` at the project root.

- **Base URL**: `http://localhost:5173/4-CartographicProjectManager/` (Vite dev server, subpath)
- **Browsers**: Chromium, Firefox, WebKit
- **Test Directory**: `./e2e`

This project also uses a `globalSetup` hook to generate reusable authenticated
storage states.

By default they are written to an OS temp folder (to avoid committing/scanning
JWTs inside the repo). You can override the location via `PW_AUTH_DIR`.

### Required env vars (E2E accounts)

The E2E suite logs in using seeded dev accounts. Provide the passwords via
environment variables (or `projects/4-CartographicProjectManager/.env`).

- `PW_E2E_ADMIN_PASSWORD`
- `PW_E2E_CLIENT_PASSWORD`
- `PW_E2E_SPECIAL_PASSWORD`

Optional (emails default to seeded ones):

- `PW_E2E_ADMIN_EMAIL`
- `PW_E2E_CLIENT_EMAIL`
- `PW_E2E_SPECIAL_EMAIL`

## Tips

- The `baseURL` is configured, so you can use relative paths: `await page.goto('projects')`
- Tests run in parallel by default
- Use `test.only()` to run a single test during development
- Use `page.pause()` to debug tests interactively
