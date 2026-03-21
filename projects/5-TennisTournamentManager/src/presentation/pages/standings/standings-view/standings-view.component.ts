/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/pages/standings/standings-view/standings-view.component.ts
 * @desc Category standings and bracket progression display.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, OnInit, signal, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {StandingService} from '@application/services';
import {type StandingDto} from '@application/dto';
import templateHtml from './standings-view.component.html?raw';

/**
 * StandingsViewComponent displays tournament standings.
 */
@Component({
  selector: 'app-standings-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: templateHtml,
  styles: [],
})
export class StandingsViewComponent implements OnInit {
  /** Services */
  private readonly route = inject(ActivatedRoute);
  private readonly standingService = inject(StandingService);

  /** Standings data */
  public standings = signal<StandingDto[]>([]);

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /**
   * Initializes component and loads standings.
   */
  public ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const tournamentId = params.get('id');
      if (tournamentId) {
        void this.loadStandings(tournamentId);
      }
    });
  }

  /**
   * Loads standings for tournament.
   *
   * @param tournamentId - ID of the tournament
   */
  private async loadStandings(tournamentId: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const standings = await this.standingService.getStandingsByTournament(tournamentId);
      this.standings.set(standings);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load standings';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
