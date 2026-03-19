/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/pages/statistics/statistics-view/statistics-view.component.ts
 * @desc Player and tournament statistics dashboard.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, OnInit, signal, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {StatisticsService} from '@application/services';
import {type StatisticsDto} from '@application/dto';
import {AuthStateService} from '@presentation/services/auth-state.service';
import templateHtml from './statistics-view.component.html?raw';

/**
 * StatisticsViewComponent displays player and tournament statistics.
 */
@Component({
  selector: 'app-statistics-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: templateHtml,
  styles: [],
})
export class StatisticsViewComponent implements OnInit {
  /** Services */
  private readonly route = inject(ActivatedRoute);
  private readonly statisticsService = inject(StatisticsService);
  private readonly authStateService = inject(AuthStateService);

  /** Statistics data */
  public statistics = signal<StatisticsDto | null>(null);

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /**
   * Initializes component and loads statistics.
   */
  public ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      let participantId = params.get('id');
      if (!participantId) {
        const user = this.authStateService.getCurrentUser();
        participantId = user?.id || null;
      }
      if (participantId) {
        void this.loadStatistics(participantId);
      }
    });
  }

  /**
   * Loads statistics for participant.
   *
   * @param participantId - ID of the participant
   */
  private async loadStatistics(participantId: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const statistics = await this.statisticsService.getStatisticsByParticipant(participantId);
      this.statistics.set(statistics);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load statistics';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
