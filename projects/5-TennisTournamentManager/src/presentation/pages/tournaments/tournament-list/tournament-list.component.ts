/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/pages/tournaments/tournament-list/tournament-list.component.ts
 * @desc Displays a paginated list of tournaments with filtering and sorting.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {TournamentService} from '@application/services';
import {type TournamentDto, type TournamentFilterDto, type PaginationDto} from '@application/dto';
import {TournamentStatus} from '@domain/enumerations/tournament-status';
import {Surface} from '@domain/enumerations/surface';

/**
 * TournamentListComponent displays a filterable, paginated list of tournaments.
 * Allows users to browse and filter tournaments by status, surface, and location.
 */
@Component({
  selector: 'app-tournament-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './tournament-list.component.html',
  styles: [],
})
export class TournamentListComponent implements OnInit {
  /** List of tournaments */
  public tournaments = signal<TournamentDto[]>([]);

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** Total tournament count */
  public totalCount = signal(0);

  /** Current page */
  public currentPage = 1;

  /** Items per page */
  public pageSize = 10;

  /** Filter criteria */
  public filters: TournamentFilterDto = {};

  /** Search query */
  public searchQuery = '';

  /** Available tournament statuses */
  public readonly statuses = Object.values(TournamentStatus);

  /** Available surfaces */
  public readonly surfaces = Object.values(Surface);

  /**
   * Creates an instance of TournamentListComponent.
   *
   * @param tournamentService - Tournament service for data operations
   * @param router - Router for navigation
   */
  public constructor(
    private readonly tournamentService: TournamentService,
    private readonly router: Router,
  ) {}

  /**
   * Initializes component and loads tournament data.
   */
  public ngOnInit(): void {
    void this.loadTournaments();
  }

  /**
   * Loads tournaments with current filters and pagination.
   */
  public async loadTournaments(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const pagination: PaginationDto = {
        page: this.currentPage,
        limit: this.pageSize,
      };

      const filter: TournamentFilterDto = {
        ...this.filters,
        search: this.searchQuery || undefined,
      };

      const response = await this.tournamentService.listTournaments(filter, pagination);
      this.tournaments.set(response.data);
      this.totalCount.set(response.total);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load tournaments';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Applies filters and reloads tournament list.
   */
  public applyFilters(): void {
    this.currentPage = 1;
    void this.loadTournaments();
  }

  /**
   * Clears all filters and reloads.
   */
  public clearFilters(): void {
    this.filters = {};
    this.searchQuery = '';
    this.currentPage = 1;
    void this.loadTournaments();
  }

  /**
   * Navigates to tournament detail page.
   *
   * @param tournamentId - ID of the tournament
   */
  public viewTournament(tournamentId: string): void {
    void this.router.navigate(['/tournaments', tournamentId]);
  }

  /**
   * Goes to next page.
   */
  public nextPage(): void {
    if (this.currentPage * this.pageSize < this.totalCount()) {
      this.currentPage++;
      void this.loadTournaments();
    }
  }

  /**
   * Goes to previous page.
   */
  public previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      void this.loadTournaments();
    }
  }

  /**
   * Checks if there is a next page.
   *
   * @returns True if next page exists
   */
  public hasNextPage(): boolean {
    return this.currentPage * this.pageSize < this.totalCount();
  }

  /**
   * Checks if there is a previous page.
   *
   * @returns True if previous page exists
   */
  public hasPreviousPage(): boolean {
    return this.currentPage > 1;
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
