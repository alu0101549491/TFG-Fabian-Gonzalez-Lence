/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/main.ts
 * @desc Application entry point. Bootstraps the Angular application with standalone component architecture.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import './styles/variables.css';
import './styles/reset.css';
import './styles/global.css';
import './styles/components.css';
import './styles/responsive.css';

// Import Zone.js for Angular change detection
import 'zone.js';

// Import Angular JIT compiler for runtime compilation
import '@angular/compiler';

import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './presentation/app.component';
import {appConfig} from './presentation/app.config';

/**
 * Handles chunk-load failures that occur when a stale service worker serves an
 * old main bundle referencing lazy-chunk filenames that no longer exist on the
 * server after a redeployment.
 *
 * When detected, all SW registrations are unregistered and all caches are
 * cleared so the next reload fetches fresh assets from the network.
 * A `sessionStorage` flag prevents infinite reload loops in case the server
 * itself is serving a broken build.
 */
const CHUNK_RELOAD_KEY = 'ttm_chunk_reload_attempted';

window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  const message: string = (event.reason as { message?: string })?.message ?? '';
  if (!message.includes('Failed to fetch dynamically imported module')) return;

  // Prevent infinite reload loops
  if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
    console.error('[TTM] Chunk load failed even after cache clear — aborting reload.', event.reason);
    return;
  }

  console.warn('[TTM] Stale chunk detected — clearing SW caches and reloading…');
  sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');

  const cleanup: Array<Promise<unknown>> = [];

  // Unregister all service workers
  if ('serviceWorker' in navigator) {
    cleanup.push(
      navigator.serviceWorker.getRegistrations().then((regs) =>
        Promise.all(regs.map((r) => r.unregister()))
      )
    );
  }

  // Clear all SW-managed caches
  if ('caches' in window) {
    cleanup.push(
      caches.keys().then((keys) =>
        Promise.all(keys.map((k) => caches.delete(k)))
      )
    );
  }

  Promise.allSettled(cleanup).then(() => window.location.reload());
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err: unknown) => console.error(err));

// Register Service Worker for PWA support (NFR8)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Use import.meta.env.BASE_URL so the SW is registered at the correct scope
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker.register(swUrl)
      .then((registration) => {
        console.log('[PWA] Service Worker registered:', registration.scope);
        // Clear the chunk-reload guard once a healthy SW is in place
        sessionStorage.removeItem(CHUNK_RELOAD_KEY);

        // Refresh when a new version activates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New version available — reload to update.');
              }
            });
          }
        });
      })
      .catch((error) => {
        console.warn('[PWA] Service Worker registration failed:', error);
      });
  });
}

