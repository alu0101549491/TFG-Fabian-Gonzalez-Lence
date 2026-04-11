/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file presentation/app.component.ts
 * @desc Root application component. Contains the main layout and router outlet.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, OnInit, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {HeaderComponent} from './components/header/header.component';
import {SessionInactivityService} from '@application/services/session-inactivity.service';

/**
 * Root component of the Tennis Tournament Manager application.
 * Provides the main layout shell and router outlet for navigation.
 * Initializes the 30-minute session inactivity auto-logout (NFR12).
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <app-header></app-header>
    <main class="app-container">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .app-container {
      min-height: calc(100vh - 64px);
      padding-top: 72px;
      display: flex;
      flex-direction: column;
    }
  `],
})
export class AppComponent implements OnInit {
  public readonly title = 'Tennis Tournament Manager';
  private readonly sessionInactivity = inject(SessionInactivityService);

  /** @inheritdoc */
  public ngOnInit(): void {
    // NFR12: Start session inactivity tracking — auto-logout after 30 min of no activity
    this.sessionInactivity.start();
  }
}
