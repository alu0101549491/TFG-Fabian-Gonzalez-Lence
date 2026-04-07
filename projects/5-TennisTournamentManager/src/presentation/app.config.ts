/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file presentation/app.config.ts
 * @desc Angular application configuration with providers for routing, HTTP, and zone change detection.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {type ApplicationConfig, provideZoneChangeDetection, isDevMode} from '@angular/core';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {APP_BASE_HREF} from '@angular/common';
import {routes} from './app.routes';
import {authInterceptor} from './interceptors/auth.interceptor';
import {errorInterceptor} from './interceptors/error.interceptor';

/**
 * Application-wide configuration.
 * Registers providers for routing, HTTP client with interceptors,
 * and zone-based change detection.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_BASE_HREF, 
      useValue: isDevMode() ? '/' : '/5-TennisTournamentManager/'
    },
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor]),
    ),
  ],
};
