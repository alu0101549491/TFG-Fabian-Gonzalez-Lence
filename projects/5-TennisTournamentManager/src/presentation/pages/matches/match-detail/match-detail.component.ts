/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/pages/matches/match-detail/match-detail.component.ts
 * @desc Match detail view with live scoring and score history.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, OnInit, signal, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {MatchService} from '@application/services';
import {type MatchDto} from '@application/dto';
import {EnumFormatPipe} from '@shared/pipes';
import templateHtml from './match-detail.component.html?raw';

/**
 * MatchDetailComponent displays detailed match information.
 */
@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, EnumFormatPipe],
  template: templateHtml,
  styles: [],
})
export class MatchDetailComponent implements OnInit {
  /** Services */
  private readonly route = inject(ActivatedRoute);
  private readonly matchService = inject(MatchService);

  /** Match data */
  public match = signal<MatchDto | null>(null);

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /**
   * Initializes component and loads match data.
   */
  public ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const matchId = params.get('id');
      if (matchId) {
        void this.loadMatch(matchId);
      }
    });
  }

  /**
   * Loads match details.
   *
   * @param matchId - ID of the match
   */
  private async loadMatch(matchId: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const match = await this.matchService.getMatchById(matchId);
      this.match.set(match);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load match';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Formats date for display.
   *
   * @param date - Date to format
   * @returns Formatted date string
   */
  public formatDate(date: Date | null): string {
    if (!date) return 'Not scheduled';
    return new Date(date).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
    });
  }
}
