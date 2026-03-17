/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/pages/matches/match-list/match-list.component.ts
 * @desc Paginated list of matches with real-time status updates (NFR5).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule, ActivatedRoute} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {MatchService} from '@application/services';
import {type MatchDto} from '@application/dto';
import {MatchStatus} from '@domain/enumerations/match-status';

/**
 * MatchListComponent displays a filterable list of matches.
 */
@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './match-list.component.html',
  styles: [],
})
export class MatchListComponent implements OnInit {
  /** List of matches */
  public matches = signal<MatchDto[]>([]);

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** Tournament ID filter */
  public tournamentId: string | null = null;

  /** Status filter */
  public selectedStatus: MatchStatus | null = null;

  /** Available match statuses */
  public readonly statuses = Object.values(MatchStatus);

  /**
   * Creates an instance of MatchListComponent.
   *
   * @param matchService - Match service for data operations
   * @param router - Router for navigation
   * @param route - Activated route for query params
   */
  public constructor(
    private readonly matchService: MatchService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  /**
   * Initializes component and loads matches.
   */
  public ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.tournamentId = params.get('tournamentId');
      void this.loadMatches();
    });
  }

  /**
   * Loads matches based on current filters.
   */
  public async loadMatches(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const matches = await this.matchService.getAllMatches();
      let filtered = matches;

      if (this.selectedStatus) {
        filtered = filtered.filter(m => m.status === this.selectedStatus);
      }

      this.matches.set(filtered);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load matches';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Navigates to match detail page.
   *
   * @param matchId - ID of the match
   */
  public viewMatch(matchId: string): void {
    void this.router.navigate(['/matches', matchId]);
  }

  /**
   * Applies status filter.
   */
  public applyFilter(): void {
    void this.loadMatches();
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
