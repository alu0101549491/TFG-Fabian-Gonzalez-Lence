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

- **Base URL**: `http://localhost:5173` (Vite dev server)
- **Browsers**: Chromium, Firefox, WebKit
- **Test Directory**: `./e2e`

## Tips

- The `baseURL` is configured, so you can use relative paths: `await page.goto('/')`
- Tests run in parallel by default
- Use `test.only()` to run a single test during development
- Use `page.pause()` to debug tests interactively
