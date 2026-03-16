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

import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';

/**
 * Root component of the Tennis Tournament Manager application.
 * Provides the main layout shell and router outlet for navigation.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <main class="app-container">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
  `],
})
export class AppComponent {
  public readonly title = 'Tennis Tournament Manager';
}
