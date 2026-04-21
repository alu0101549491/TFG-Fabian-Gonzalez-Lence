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

