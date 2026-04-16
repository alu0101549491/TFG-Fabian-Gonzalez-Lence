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

import {Component, OnInit, signal, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule, ActivatedRoute} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {TournamentService, BracketService} from '@application/services';
import {type TournamentDto, type TournamentFilterDto, type PaginationDto} from '@application/dto';
import {TournamentStatus} from '@domain/enumerations/tournament-status';
import {Surface} from '@domain/enumerations/surface';
import {UserRole} from '@domain/enumerations/user-role';
import {AuthStateService} from '@presentation/services/auth-state.service';
import {EnumFormatPipe} from '@shared/pipes';
import templateHtml from './tournament-list.component.html?raw';
import styles from './tournament-list.component.css?inline';

/**
 * TournamentListComponent displays a filterable, paginated list of tournaments.
 * Allows users to browse and filter tournaments by status, surface, and location.
 */
@Component({
  selector: 'app-tournament-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, EnumFormatPipe],
  template: templateHtml,
  styles: [styles],
})
export class TournamentListComponent implements OnInit {
  /** Services - inject() must be called before other properties */
  private readonly tournamentService = inject(TournamentService);
  private readonly bracketService = inject(BracketService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authStateService = inject(AuthStateService);

  /** Navigation intent from query params (e.g., 'brackets', 'standings') */
  private navigationIntent: string | null = null;

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

  /** Math object for template use */
  public readonly Math = Math;

  /**
   * Checks if user is authenticated.
   *
   * @returns True if user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.authStateService.isAuthenticated();
  }

  /**
   * Checks if the current user is a tournament administrator.
   *
   * @returns True if user has TOURNAMENT_ADMIN or SYSTEM_ADMIN role
   */
  public isTournamentAdmin(): boolean {
    const user = this.authStateService.getCurrentUser();
    return user?.role === UserRole.TOURNAMENT_ADMIN || user?.role === UserRole.SYSTEM_ADMIN;
  }

  /**
   * Initializes component and loads tournament data.
   */
  public ngOnInit(): void {
    // Check for navigation intent from query params
    this.route.queryParams.subscribe(params => {
      this.navigationIntent = params['intent'] || null;
    });
    
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
      this.tournaments.set(response.items);
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
   * Navigates to tournament detail, brackets, or standings based on navigation intent.
   *
   * @param tournamentId - ID of the tournament
   */
  public async viewTournament(tournamentId: string): Promise<void> {
    if (this.navigationIntent === 'brackets') {
      // Fetch brackets for this tournament
      try {
        const brackets = await this.bracketService.getBracketsByTournament(tournamentId);
        
        if (brackets.length > 0) {
          // Navigate to the first bracket
          void this.router.navigate(['/brackets', brackets[0].id]);
        } else {
          // No brackets exist yet - navigate to tournament detail and show message
          alert('No brackets available for this tournament yet. Brackets will be created when the tournament starts.');
          void this.router.navigate(['/tournaments', tournamentId]);
        }
      } catch (error) {
        console.error('Failed to load brackets:', error);
        alert('Failed to load brackets. Please try again.');
      }
    } else if (this.navigationIntent === 'standings') {
      void this.router.navigate(['/standings', tournamentId]);
    } else {
      void this.router.navigate(['/tournaments', tournamentId]);
    }
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

  /**
   * Navigates back to the home page.
   */
  public goBack(): void {
    void this.router.navigate(['/']);
  }
}
