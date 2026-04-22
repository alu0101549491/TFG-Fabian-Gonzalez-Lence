/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file src/presentation/pages/standings/standings-view/standings-view.component.ts
 * @desc Category standings and bracket progression display.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Component, OnInit, signal, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {StandingService, BracketService, CategoryService, TournamentService} from '@application/services';
import {type StandingDto, type TournamentDto} from '@application/dto';
import {TournamentStateService} from '@presentation/services';
import {EnumFormatPipe} from '@shared/pipes';
import templateHtml from './standings-view.component.html?raw';
import styles from './standings-view.component.css?inline';

/**
 * Grouped standings by bracket/category.
 */
interface StandingGroup {
  bracketId: string;
  categoryId: string;
  categoryName: string;
  bracketType: string;
  standingsCount: number;
  standings: StandingDto[];
}

/**
 * StandingsViewComponent displays tournament standings grouped by category.
 */
@Component({
  selector: 'app-standings-view',
  standalone: true,
  imports: [CommonModule, RouterModule, EnumFormatPipe],
  template: templateHtml,
  styles: [styles],
})
export class StandingsViewComponent implements OnInit {
  /** Services */
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly standingService = inject(StandingService);
  private readonly bracketService = inject(BracketService);
  private readonly categoryService = inject(CategoryService);
  private readonly tournamentService = inject(TournamentService);
  protected readonly tournamentStateService = inject(TournamentStateService);

  /** Standings data */
  public standings = signal<StandingDto[]>([]);

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** Tournament ID */
  private tournamentId = signal<string | null>(null);

  /** Tournament data */
  public tournament = signal<TournamentDto | null>(null);

  /** Grouped standings */
  public groupedStandings = signal<StandingGroup[]>([]);

  /**
   * Initializes component and loads standings.
   */
  public ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const tournamentId = params.get('id');
      if (tournamentId) {
        this.tournamentId.set(tournamentId);
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
      // Fetch tournament data
      const tournamentData = await this.tournamentService.getTournamentById(tournamentId);
      this.tournament.set(tournamentData);
      
      // Set tournament in global state for logo propagation
      this.tournamentStateService.setCurrentTournament(tournamentData);

      // Fetch standings
      const standings = await this.standingService.getStandingsByTournament(tournamentId);
      this.standings.set(standings);

      // Group standings by bracket
      this.groupStandings(standings);

      // Enrich group data with bracket and category information
      await this.enrichGroupData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load standings';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Groups standings by bracket ID.
   *
   * @param standings - Array of standings to group
   */
  private groupStandings(standings: StandingDto[]): void {
    if (standings.length === 0) {
      this.groupedStandings.set([]);
      return;
    }

    // Group by bracket ID
    const groups = new Map<string, StandingGroup>();
    for (const standing of standings) {
      if (!groups.has(standing.bracketId)) {
        groups.set(standing.bracketId, {
          bracketId: standing.bracketId,
          categoryId: '',
          categoryName: 'Loading...',
          bracketType: 'Tournament',
          standingsCount: 0,
          standings: [],
        });
      }
      groups.get(standing.bracketId)!.standings.push(standing);
    }

    // Update counts and sort standings within each group
    for (const group of groups.values()) {
      group.standingsCount = group.standings.length;
      group.standings.sort((a, b) => a.position - b.position);
    }

    this.groupedStandings.set(Array.from(groups.values()));
  }

  /**
   * Enriches grouped standings with bracket and category information.
   */
  private async enrichGroupData(): Promise<void> {
    const groups = this.groupedStandings();
    
    for (const group of groups) {
      try {
        // Fetch bracket information
        const bracket = await this.bracketService.getBracketById(group.bracketId);
        group.categoryId = bracket.categoryId;
        group.bracketType = bracket.bracketType;

        // Fetch category information
        try {
          const category = await this.categoryService.getCategoryById(bracket.categoryId);
          group.categoryName = category.name;
        } catch {
          group.categoryName = `Category ${bracket.categoryId.slice(0, 8)}`;
        }
      } catch (error) {
        console.warn(`Failed to enrich data for bracket ${group.bracketId}:`, error);
      }
    }

    // Update signal with enriched data
    this.groupedStandings.set([...groups]);
  }

  /**
   * Gets CSS class for position badge.
   *
   * @param position - Position number
   * @returns CSS class string
   */
  public getPositionClass(position: number): string {
    if (position === 1) return 'first-place';
    if (position === 2) return 'second-place';
    if (position === 3) return 'third-place';
    return '';
  }

  /**
   * Navigates back to tournament detail.
   */
  public goBack(): void {
    const tournamentId = this.tournamentId();
    if (tournamentId) {
      void this.router.navigate(['/tournaments', tournamentId]);
    } else {
      void this.router.navigate(['/tournaments']);
    }
  }
}
