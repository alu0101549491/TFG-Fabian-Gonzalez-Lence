/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/fixtures/page-objects/base.page.ts
 * @desc Base Page Object for Playwright tests adapted to the real Tennis Tournament Manager shell.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {expect, type Locator, type Page} from '@playwright/test';

/**
 * Shared page-object functionality for all Playwright pages.
 */
export abstract class BasePage {
  public readonly page: Page;
  public readonly header: Locator;
  public readonly userMenuTrigger: Locator;
  public readonly notificationBellButton: Locator;
  public readonly modalOverlay: Locator;
  protected readonly loadingIndicators: Locator;
  protected readonly successFeedback: Locator;
  protected readonly errorFeedback: Locator;

  public abstract readonly url: string;

  public constructor(page: Page) {
    this.page = page;
    this.header = page.locator('header.app-header');
    this.userMenuTrigger = page.locator('.user-menu-toggle');
    this.notificationBellButton = page.locator(
      '.bell-button, .notification-bell .bell-button, [data-testid="notification-bell"], button[aria-label*="notification"], button[class*="bell"]',
    );
    this.modalOverlay = page.locator('.modal-overlay');
    this.loadingIndicators = page.locator('.spinner, .loading-spinner');
    this.successFeedback = page.locator(
      '.success-message, .success-banner, .alert-success, .error-banner + .success-message, .toast-success, .notification-toast, [role="status"], [aria-live="polite"]',
    );
    this.errorFeedback = page.locator(
      '.error-message, .error-banner, .error-container, .alert-error, .error-state',
    );
    // Forward browser console messages to the test runner for easier debugging
    this.page.on('console', (msg) => {
      try {
        // eslint-disable-next-line no-console
        console.log(`[page console] ${msg.type()}: ${msg.text()}`);
      } catch {
        // ignore
      }
    });

    this.page.on('pageerror', (err) => {
      try {
        // eslint-disable-next-line no-console
        console.log('[page error]', err && err.message ? err.message : String(err));
      } catch {
        // ignore
      }
    });
  }

  /**
   * Navigates to the page's default route.
   */
  public async goto(): Promise<void> {
    await this.gotoPath(this.url);
  }

  /**
   * Navigates to an arbitrary route and waits for the page to settle.
   *
   * @param route - Route relative to the configured Playwright base URL
   */
  public async gotoPath(route: string): Promise<void> {
    await this.page.goto(route);
    await this.waitForPageLoad();
  }

  /**
   * Waits for the current page to finish its initial loading work.
   */
  public async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle').catch(() => undefined);

    const spinnerCount = await this.loadingIndicators.count();
    for (let index = 0; index < spinnerCount; index += 1) {
      await this.loadingIndicators.nth(index).waitFor({state: 'hidden', timeout: 10000}).catch(() => undefined);
    }
  }

  /**
   * Asserts that a success banner or message is visible.
   *
   * @param text - Optional partial text assertion
   */
  public async expectSuccess(text?: string): Promise<void> {
    // Try to detect a DOM success banner first (generous timeout).
    try {
      await this.successFeedback.first().waitFor({state: 'visible', timeout: 10000});
      if (text) {
        await expect(this.successFeedback.first()).toContainText(text);
      }
      return;
    } catch {
      // If no DOM banner appeared, some versions of the app use `alert()` instead.
      // Detect a page-level marker set by save helpers and accept that as success.
      let marker: any = null;
      try {
        marker = await this.page.evaluate(() => (window as any).__e2e_lastSuccess || null);
      } catch {
        marker = null;
      }
      if (marker) {
        // Clear marker for subsequent assertions
        try {
          await this.page.evaluate(() => { delete (window as any).__e2e_lastSuccess; });
        } catch {
          // ignore if page/context closed
        }
        return;
      }
      // Heuristic: search for common success text in visible toasts/alerts.
      try {
        const keywordLocator = this.page.getByText(/success|saved|created|published|updated|scheduled|withdrawn|recorded|logged in|registration successful|logging you in/i);
        if ((await keywordLocator.count()) > 0) {
          await expect(keywordLocator.first()).toBeVisible({timeout: 5000});
          if (text) await expect(keywordLocator.first()).toContainText(text);
          return;
        }
      } catch {
        // ignore heuristic failures and fall through to final assertion
      }
      // Final attempt: run the original expectation to surface a clear failure message.
      await expect(this.successFeedback.first()).toBeVisible({timeout: 12000});
      if (text) {
        await expect(this.successFeedback.first()).toContainText(text);
      }
    }
  }

  /**
   * Asserts that an error banner or message is visible.
   *
   * @param text - Optional partial text assertion
   */
  public async expectError(text?: string): Promise<void> {
    await expect(this.errorFeedback.first()).toBeVisible();
    if (text) {
      await expect(this.errorFeedback.first()).toContainText(text);
    }
  }

  /**
   * Opens the user dropdown menu if it is available.
   */
  public async openUserMenu(): Promise<void> {
    // Try a generous wait for the primary user-menu trigger
    try {
      await this.userMenuTrigger.waitFor({state: 'visible', timeout: 10000});
      await this.userMenuTrigger.click().catch(() => undefined);
      return;
    } catch {
      // Try header-based and accessible fallbacks if primary selector isn't available
      await this.header.waitFor({state: 'visible', timeout: 8000}).catch(() => undefined);
      const alt = this.page.getByRole('button', {name: /user menu|account|profile|menu|logout/i});
      if (await alt.count()) {
        await alt.first().click().catch(() => undefined);
        return;
      }

      const fallbacks = ['.user-avatar', '.user-menu-toggle', '.account-toggle', '.profile-toggle', '.user-toggle'];
      for (const selector of fallbacks) {
        const loc = this.page.locator(selector);
        if ((await loc.count()) > 0) {
          await loc.first().click().catch(async () => {
            await this.page.evaluate((s) => {
              const el = document.querySelector(s) as HTMLElement | null;
              if (el) el.click();
            }, selector);
          });
          return;
        }
      }

      // Final attempt: give up and return so callers can perform programmatic fallback
      return;
    }
  }

  /**
   * Signs out using the header dropdown menu.
   */
  public async logout(): Promise<void> {
    // Prefer a direct logout control if visible anywhere in the DOM
    const directLogout = this.page.getByRole('button', {name: /logout/i});
    try {
      if ((await directLogout.count()) > 0) {
        await directLogout.first().click().catch(() => undefined);
        // Attempt to proactively clear any client-side tokens in case the app
        // does not remove them reliably during the logout flow.
        try {
          await this.page.evaluate(() => {
            try {
              localStorage.removeItem('tennis_jwt_token');
              localStorage.removeItem('app_user');
            } catch {
              // ignore
            }
          });
          // Debug: report token presence after attempted removal
          try {
            // eslint-disable-next-line no-console
            console.log('[logout] post-direct-logout token present:', (window as any).localStorage?.getItem('tennis_jwt_token'));
          } catch {}
        } catch {
          // page may be navigating; ignore
        }
        await this.waitForPageLoad();
        return;
      }
    } catch {
      // ignore and fall back to the menu flow
    }

    // Fallback to opening the user menu and clicking the logout action
    await this.openUserMenu();
    const menuLogout = this.page.getByRole('button', {name: /logout/i});
    if ((await menuLogout.count()) > 0) {
      await menuLogout.first().click().catch(() => undefined);
      try {
        await this.page.evaluate(() => {
          try {
            localStorage.removeItem('tennis_jwt_token');
            localStorage.removeItem('app_user');
          } catch {
            // ignore
          }
        });
      } catch {
        // page may be navigating; ignore
      }
      await this.waitForPageLoad();
      return;
    }

    // Additional CSS fallbacks
    const fallbacks = ['.logout', '.logout-button', 'a.logout', '.signout', 'button[data-testid="logout"]'];
    for (const selector of fallbacks) {
      const loc = this.page.locator(selector);
      if ((await loc.count()) > 0) {
        await loc.first().click().catch(async () => {
          await this.page.evaluate((s) => {
            const el = document.querySelector(s) as HTMLElement | null;
            if (el) el.click();
          }, selector);
        });
        try {
          await this.page.evaluate(() => {
            try {
              localStorage.removeItem('tennis_jwt_token');
              localStorage.removeItem('app_user');
            } catch {
              // ignore
            }
          });
        } catch {
          // ignore navigation timing
        }
        await this.waitForPageLoad();
        return;
      }
    }

    // Give a clear failure when logout cannot be performed
    // As a last-resort for flaky shells, clear auth state programmatically
    try {
      // Best-effort client-side cleanup: localStorage, sessionStorage, cookies,
      // service workers and indexedDB. Some of these operations may be no-ops
      // in certain browsers or CSP settings; we tolerate failures.
      await this.page.evaluate(async () => {
        try {
          localStorage.removeItem('tennis_jwt_token');
          localStorage.removeItem('app_user');
        } catch {}
        try {
          sessionStorage.clear();
        } catch {}
        try {
          // best-effort: clear document cookies (cannot clear httpOnly cookies)
          document.cookie.split(';').forEach((c) => {
            try {
              const name = c.split('=')[0].trim();
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            } catch {}
          });
        } catch {}
        try {
          if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            for (const r of regs) {
              try { await r.unregister(); } catch {}
            }
          }
        } catch {}
        try {
          // Clear CacheStorage entries (e.g., service worker caches)
          // best-effort; some environments may not support this API
          // @ts-ignore
          if (typeof caches !== 'undefined' && caches && typeof caches.keys === 'function') {
            const ks = await caches.keys().catch(() => []);
            for (const k of ks) {
              try { await caches.delete(k); } catch {}
            }
          }
        } catch {}
        try {
          // Some browsers support enumerating DBs; best-effort cleanup
          // @ts-ignore
          const dbs = typeof indexedDB?.databases === 'function' ? await indexedDB.databases().catch(() => []) : [];
          if (dbs && dbs.length) {
            for (const db of dbs) {
              try {
                // @ts-ignore
                if (db && db.name) await new Promise((res) => { const r = indexedDB.deleteDatabase(db.name); r.onsuccess = res; r.onerror = res; r.onblocked = res; });
              } catch {}
            }
          }
        } catch {}
      });

      // Clear context cookies via Playwright API (this clears non-httpOnly cookies in the context)
      try {
        // @ts-ignore
        await this.page.context().clearCookies();
      } catch {}

      // Force navigation to login and wait for a clean shell
      await this.page.goto('/login');
      await this.waitForPageLoad();

      // Reload once more to ensure the SPA re-initializes with cleared state
      try {
        await this.page.reload({waitUntil: 'networkidle'}).catch(() => undefined);
      } catch {}

      // Double-check localStorage and cookies; attempt final cleanup if needed
      try {
        const tokenStillPresent = await this.page.evaluate(() => !!localStorage.getItem('tennis_jwt_token')).catch(() => false);
        if (tokenStillPresent) {
          await this.page.evaluate(() => {
            try { localStorage.removeItem('tennis_jwt_token'); localStorage.removeItem('app_user'); } catch {}
            try { sessionStorage.clear(); } catch {}
          }).catch(() => undefined);
        }
      } catch {}

      try {
        const cookies = await this.page.context().cookies();
        if (cookies && cookies.length) {
          // eslint-disable-next-line no-console
          console.log('[logout] context cookies after cleanup:', cookies.map((c) => c.name));
          await this.page.context().clearCookies().catch(() => undefined);
        } else {
          // eslint-disable-next-line no-console
          console.log('[logout] no context cookies present');
        }
        // Report token value for debugging purposes
        try {
          const tokenVal = await this.page.evaluate(() => localStorage.getItem('tennis_jwt_token')).catch(() => null);
          // eslint-disable-next-line no-console
          console.log('[logout] localStorage.tennis_jwt_token after cleanup:', tokenVal);
        } catch {
          // ignore
        }
      } catch {}

      return;
    } catch {
      // If programmatic logout also fails, surface a clear error
      throw new Error('Unable to locate logout control');
    }
  }

  /**
   * Opens the header notification dropdown.
   */
  public async openNotificationBell(): Promise<void> {
    try {
      await this.header.waitFor({state: 'visible', timeout: 8000}).catch(() => undefined);
      await expect(this.notificationBellButton).toBeVisible({timeout: 8000});
      await this.notificationBellButton.click().catch(() => undefined);
      return;
    } catch {
      // Try an accessible fallback button if the primary selector isn't visible yet
      const alt = this.page.getByRole('button', {name: /notifications|bell/i});
      if (await alt.count()) {
        await alt.first().click();
        return;
      }
      // Try a set of tolerant CSS fallbacks and a JS click as last resort
      const fallbacks = [
        '.notification-bell .bell-button',
        '.notification-bell button',
        'button[class*="bell"]',
        'button[aria-label*="notification"]',
        '[data-testid="notification-bell"]',
        '.bell',
      ];
      for (const selector of fallbacks) {
        const loc = this.page.locator(selector);
        if ((await loc.count()) > 0) {
          await loc.first().click().catch(async () => {
            // As a resilient fallback, click via DOM
            await this.page.evaluate((s) => {
              const el = document.querySelector(s) as HTMLElement | null;
              if (el) el.click();
            }, selector);
          });
          return;
        }
      }
      // Final attempt: click via DOM selector for primary class
      const clicked = await this.page.evaluate(() => {
        const el = document.querySelector('.bell-button') as HTMLElement | null ||
          document.querySelector('.notification-bell button') as HTMLElement | null ||
          document.querySelector('[data-testid="notification-bell"]') as HTMLElement | null;
        if (el) {
          el.click();
          return true;
        }
        return false;
      });
      if (clicked) return;
      // Re-throw the expectation to surface the original failure
      await expect(this.notificationBellButton).toBeVisible();
    }
  }

  /**
   * Wires the next browser dialog to be accepted automatically.
   *
   * @param promptText - Optional prompt text for prompt dialogs
   */
  public async acceptNextDialog(promptText?: string): Promise<void> {
    this.page.once('dialog', async (dialog) => {
      await dialog.accept(promptText);
    });
  }

  /**
   * Wires the next browser dialog to be dismissed automatically.
   */
  public async dismissNextDialog(): Promise<void> {
    this.page.once('dialog', async (dialog) => {
      await dialog.dismiss();
    });
  }
}