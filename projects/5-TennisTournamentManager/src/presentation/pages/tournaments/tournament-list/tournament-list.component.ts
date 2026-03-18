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
import {Router, RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {TournamentService} from '@application/services';
import {type TournamentDto, type TournamentFilterDto, type PaginationDto} from '@application/dto';
import {TournamentStatus} from '@domain/enumerations/tournament-status';
import {Surface} from '@domain/enumerations/surface';
import {AuthStateService} from '@presentation/services/auth-state.service';

/**
 * TournamentListComponent displays a filterable, paginated list of tournaments.
 * Allows users to browse and filter tournaments by status, surface, and location.
 */
@Component({
  selector: 'app-tournament-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container p-lg">
      <div class="flex justify-between items-center mb-lg">
        <h1>Tournaments</h1>
        @if (isAuthenticated()) {
          <button class="btn btn-primary" routerLink="/tournaments/create">
            Create Tournament
          </button>
        }
      </div>

      <!-- Filters Section -->
      <div class="card mb-lg">
        <div class="card-body">
          <h3 class="card-title">Filters</h3>
          <div class="grid gap-md" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
            <div class="form-group">
              <label class="form-label">Search</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="searchQuery"
                placeholder="Search tournaments..."
                (keyup.enter)="applyFilters()"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Status</label>
              <select class="form-control" [(ngModel)]="filters.status" (change)="applyFilters()">
                <option [ngValue]="undefined">All</option>
                @for (status of statuses; track status) {
                  <option [value]="status">{{ status }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Surface</label>
              <select class="form-control" [(ngModel)]="filters.surface" (change)="applyFilters()">
                <option [ngValue]="undefined">All</option>
                @for (surface of surfaces; track surface) {
                  <option [value]="surface">{{ surface }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Location</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="filters.location"
                placeholder="Enter location..."
                (keyup.enter)="applyFilters()"
              />
            </div>
          </div>

          <div class="flex gap-sm mt-md">
            <button class="btn btn-primary" (click)="applyFilters()">Apply Filters</button>
            <button class="btn btn-ghost" (click)="clearFilters()">Clear</button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="text-center p-lg">
          <p>Loading tournaments...</p>
        </div>
      }

      <!-- Error State -->
      @if (errorMessage()) {
        <div class="alert alert-error">
          {{ errorMessage() }}
        </div>
      }

      <!-- Tournament List -->
      @if (!isLoading() && tournaments().length > 0) {
        <div class="grid gap-md" style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));">
          @for (tournament of tournaments(); track tournament.id) {
            <div class="card" (click)="viewTournament(tournament.id)" style="cursor: pointer;">
              <div class="card-header">
                <h3 class="card-title">{{ tournament.name }}</h3>
                <span class="badge badge-{{ tournament.status.toLowerCase() }}">
                  {{ tournament.status }}
                </span>
              </div>
              <div class="card-body">
                <p class="text-sm text-muted mb-sm">{{ tournament.location }}</p>
                <p class="text-sm">
                  <strong>Surface:</strong> {{ tournament.surface }}<br/>
                  <strong>Dates:</strong> {{ formatDate(tournament.startDate) }} - {{ formatDate(tournament.endDate) }}<br/>
                  <strong>Participants:</strong> {{ tournament.maxParticipants }} max<br/>
                  @if (tournament.registrationFee > 0) {
                    <strong>Fee:</strong> {{ tournament.registrationFee }} {{ tournament.currency }}<br/>
                  }
                </p>
              </div>
            </div>
          }
        </div>

        <!-- Pagination -->
        <div class="flex justify-between items-center mt-lg">
          <p class="text-sm text-muted">
            Showing {{ (currentPage - 1) * pageSize + 1 }} - 
            {{ Math.min(currentPage * pageSize, totalCount()) }} of {{ totalCount() }}
          </p>
          <div class="flex gap-sm">
            <button
              class="btn btn-secondary"
              (click)="previousPage()"
              [disabled]="!hasPreviousPage()"
            >
              Previous
            </button>
            <button
              class="btn btn-secondary"
              (click)="nextPage()"
              [disabled]="!hasNextPage()"
            >
              Next
            </button>
          </div>
        </div>
      }

      <!-- Empty State -->
      @if (!isLoading() && !errorMessage() && tournaments().length === 0) {
        <div class="text-center p-lg">
          <p class="text-muted">No tournaments found.</p>
        </div>
      }
    </div>
  `,
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

  /** Tournament service instance */
  private readonly tournamentService = inject(TournamentService);

  /** Router instance */
  private readonly router = inject(Router);

  /** Auth state service instance */
  private readonly authStateService = inject(AuthStateService);

  /**
   * Checks if user is authenticated.
   *
   * @returns True if user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.authStateService.isAuthenticated();
  }

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
