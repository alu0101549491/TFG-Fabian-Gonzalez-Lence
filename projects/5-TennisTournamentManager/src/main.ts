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

// Register Service Worker for PWA support
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/5-TennisTournamentManager/service-worker.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered:', registration.scope);
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error);
      });
  });
}

