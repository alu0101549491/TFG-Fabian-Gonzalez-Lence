/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/pages/brackets/bracket-view/bracket-view.component.ts
 * @desc Interactive bracket visualization (single-elimination, round-robin, group stages).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {BracketService} from '@application/services';
import {type BracketDto, type PhaseDto} from '@application/dto';

/**
 * BracketViewComponent displays tournament bracket structure.
 */
@Component({
  selector: 'app-bracket-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bracket-view.component.html',
  styles: [],
})
export class BracketViewComponent implements OnInit {
  /** Bracket data */
  public bracket = signal<BracketDto | null>(null);

  /** Bracket phases */
  public phases = signal<PhaseDto[]>([]);

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /**
   * Creates an instance of BracketViewComponent.
   *
   * @param route - Activated route to get tournament ID
   * @param bracketService - Bracket service for data operations
   */
  public constructor(
    private readonly route: ActivatedRoute,
    private readonly bracketService: BracketService,
  ) {}

  /**
   * Initializes component and loads bracket data.
   */
  public ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const tournamentId = params.get('id');
      if (tournamentId) {
        void this.loadBracket(tournamentId);
      }
    });
  }

  /**
   * Loads bracket for tournament.
   *
   * @param tournamentId - ID of the tournament
   */
  private async loadBracket(tournamentId: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const brackets = await this.bracketService.getBracketsByTournament(tournamentId);
      if (brackets.length > 0) {
        this.bracket.set(brackets[0]);
        const phases = await this.bracketService.getPhasesByBracket(brackets[0].id);
        this.phases.set(phases);
      } else {
        this.errorMessage.set('No bracket found for this tournament');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load bracket';
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
  public formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
