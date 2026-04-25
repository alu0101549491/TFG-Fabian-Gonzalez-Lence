/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file playwright.config.ts
 * @desc Playwright end-to-end configuration for the Tennis Tournament Manager.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {defineConfig, devices} from '@playwright/test';

declare const process: {
	env: Record<string, string | undefined>;
};

const FRONTEND_BASE_URL =
	process.env.BASE_URL ??
	process.env.PLAYWRIGHT_BASE_URL ??
	'http://localhost:4200/5-TennisTournamentManager/';

const BACKEND_BASE_URL =
	process.env.PLAYWRIGHT_API_BASE_URL?.replace(/\/api\/?$/, '') ??
	'http://localhost:3000';

const SHOULD_MANAGE_WEB_SERVERS = process.env.PLAYWRIGHT_SKIP_WEBSERVER !== '1';

/**
 * Central Playwright configuration for all Tennis Tournament Manager E2E suites.
 */
export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: Number(process.env.PLAYWRIGHT_WORKERS ?? (process.env.CI ? '4' : '1')),
	reporter: [
		['html', {outputFolder: 'playwright-report'}],
		['json', {outputFile: 'test-results.json'}],
		['list'],
	],
	globalSetup: './e2e/global-setup.ts',
	globalTeardown: './e2e/global-teardown.ts',
	use: {
		baseURL: FRONTEND_BASE_URL,
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
		actionTimeout: 10000,
		navigationTimeout: 30000,
	},
	projects: [
		{name: 'chromium', use: {...devices['Desktop Chrome']}},
		{name: 'firefox', use: {...devices['Desktop Firefox']}},
		{name: 'webkit', use: {...devices['Desktop Safari']}},
		{name: 'mobile-chrome', use: {...devices['Pixel 5']}},
		{name: 'mobile-safari', use: {...devices['iPhone 12']}},
		{name: 'tablet', use: {...devices['iPad (gen 7)']}},
	],
	webServer: SHOULD_MANAGE_WEB_SERVERS
		? [
				{
					command: 'cd backend && npm run dev',
					url: `${BACKEND_BASE_URL}/api/health`,
					reuseExistingServer: !process.env.CI,
					timeout: 120000,
				},
				{
					command: 'npm run dev',
					url: FRONTEND_BASE_URL,
					reuseExistingServer: !process.env.CI,
					timeout: 120000,
				},
			]
		: undefined,
});
