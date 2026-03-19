/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/pages/tournaments/tournament-detail/tournament-detail.component.ts
 * @desc Tournament detail view with tabs for info, categories, brackets, and order of play.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, OnInit, signal, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {combineLatest} from 'rxjs';
import {TournamentService, RegistrationService} from '@application/services';
import {type TournamentDto, type RegistrationDto} from '@application/dto';
import {AuthStateService} from '@presentation/services/auth-state.service';
import {type Category} from '@domain/entities/category';
import {CategoryRepositoryImpl} from '@infrastructure/repositories/category.repository';
import {UserRepositoryImpl} from '@infrastructure/repositories/user.repository';
import {type User} from '@domain/entities/user';
import {UserRole} from '@domain/enumerations/user-role';
import {TournamentStatus} from '@domain/enumerations/tournament-status';
import templateHtml from './tournament-detail-new.component.html?raw';
import styles from './tournament-detail-new.component.css?raw';

/**
 * TournamentDetailComponent displays comprehensive information about a tournament.
 * Shows tournament details, registration status, and navigation to brackets/matches.
 */
@Component({
  selector: 'app-tournament-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: templateHtml,
  styles: [styles],
})
export class TournamentDetailComponent implements OnInit {
  /** Services - inject() must be called before other properties */
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tournamentService = inject(TournamentService);
  private readonly registrationService = inject(RegistrationService);
  private readonly authStateService = inject(AuthStateService);
  private readonly categoryRepository = inject(CategoryRepositoryImpl);
  private readonly userRepository = inject(UserRepositoryImpl);

  /** Tournament data */
  public tournament = signal<TournamentDto | null>(null);

  /** Tournament categories */
  public categories = signal<Category[]>([]);

  /** Registered players with their details */
  public registeredPlayers = signal<Array<{user: User; registration: RegistrationDto}>>([]);

  /** Selected category ID for registration */
  public selectedCategoryId = signal<string | null>(null);

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** Registration status */
  public isRegistered = signal(false);

  /** Tournament ID from route */
  private tournamentId: string | null = null;

  /**
   * Initializes component and loads tournament data.
   */
  public ngOnInit(): void {
    // Combine both paramMap and queryParamMap to reload on any change
    combineLatest([
      this.route.paramMap,
      this.route.queryParamMap
    ]).subscribe(([params]) => {
      this.tournamentId = params.get('id');
      if (this.tournamentId) {
        void this.loadTournament();
      }
    });
  }

  /**
   * Loads tournament details.
   */
  private async loadTournament(): Promise<void> {
    if (!this.tournamentId) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const tournament = await this.tournamentService.getTournamentById(this.tournamentId);
      this.tournament.set(tournament);
      
      // Load tournament categories
      const categories = await this.categoryRepository.findByTournamentId(this.tournamentId);
      this.categories.set(categories);
      
      // Auto-select first category if only one exists
      if (categories.length === 1) {
        this.selectedCategoryId.set(categories[0].id);
      }
      
      // Load registered players
      await this.loadPlayers();
      
      await this.checkRegistrationStatus();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load tournament';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Loads the list of registered players for this tournament.
   */
  private async loadPlayers(): Promise<void> {
    if (!this.tournamentId) return;

    try {
      // Fetch all registrations for this tournament
      const registrations = await this.registrationService.getRegistrationsByTournament(this.tournamentId);
      
      // Fetch user details for each registration
      const playersWithDetails = await Promise.all(
        registrations.map(async (registration) => {
          try {
            const user = await this.userRepository.findById(registration.participantId);
            return user ? { user, registration } : null;
          } catch (error) {
            console.error(`Failed to load user ${registration.participantId}:`, error);
            return null;
          }
        })
      );
      
      // Filter out any null entries (users that couldn't be loaded)
      const validPlayers = playersWithDetails.filter((p): p is {user: User; registration: RegistrationDto} => p !== null);
      
      this.registeredPlayers.set(validPlayers);
    } catch (error) {
      console.error('Failed to load registered players:', error);
      // Don't set error message - player list is optional info
    }
  }

  /**
   * Checks if current user is registered for this tournament.
   */
  private async checkRegistrationStatus(): Promise<void> {
    if (!this.tournamentId) return;
    
    const user = this.authStateService.getCurrentUser();
    if (!user) return;

    try {
      const registrations = await this.registrationService.getRegistrationsByParticipant(user.id);
      const registered = registrations.some(reg => reg.tournamentId === this.tournamentId);
      this.isRegistered.set(registered);
    } catch (error) {
      // Silently fail - registration status is optional info
      console.error('Failed to check registration status:', error);
    }
  }

  /**
   * Navigates to bracket view for this tournament.
   */
  public viewBracket(): void {
    if (this.tournamentId) {
      void this.router.navigate(['/brackets', this.tournamentId]);
    }
  }

  /**
   * Navigates to matches view for this tournament.
   */
  public viewMatches(): void {
    if (this.tournamentId) {
      void this.router.navigate(['/matches'], { queryParams: { tournamentId: this.tournamentId } });
    }
  }

  /**
   * Navigates to standings view for this tournament.
   */
  public viewStandings(): void {
    if (this.tournamentId) {
      void this.router.navigate(['/standings', this.tournamentId]);
    }
  }

  /**
   * Handles tournament registration.
   */
  public async registerForTournament(): Promise<void> {
    if (!this.tournamentId) return;

    const user = this.authStateService.getCurrentUser();
    if (!user) {
      void this.router.navigate(['/login']);
      return;
    }

    const categoryId = this.selectedCategoryId();
    if (!categoryId) {
      alert('Please select a category to register for');
      return;
    }

    try {
      await this.registrationService.registerParticipant(
        {
          tournamentId: this.tournamentId,
          categoryId: categoryId,
        },
        user.id
      );
      this.isRegistered.set(true);
      alert('Successfully registered for tournament!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      alert(message);
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
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Gets the category name for a given category ID.
   *
   * @param categoryId - The category identifier
   * @returns Category name or 'Unknown Category'
   */
  public getCategoryName(categoryId: string): string {
    const category = this.categories().find(c => c.id === categoryId);
    return category?.name || 'Unknown Category';
  }

  /**
   * Checks if user is authenticated.
   *
   * @returns True if user is logged in
   */
  public isAuthenticated(): boolean {
    return this.authStateService.isAuthenticated();
  }

  /**
   * Checks if current user can edit/delete this tournament.
   * Returns true if user is the tournament organizer or a tournament admin.
   *
   * @returns True if user has permission to modify tournament
   */
  public canManageTournament(): boolean {
    const user = this.authStateService.getCurrentUser();
    const tournament = this.tournament();
    
    if (!user || !tournament) return false;

    // Tournament organizer can manage
    if (tournament.organizerId === user.id) return true;

    // System admins and tournament admins can manage
    return user.role === UserRole.SYSTEM_ADMIN || user.role === UserRole.TOURNAMENT_ADMIN;
  }

  /**
   * Navigates to tournament edit page.
   */
  public editTournament(): void {
    if (!this.tournamentId) return;
    void this.router.navigate(['/tournaments', this.tournamentId, 'edit']);
  }

  /**
   * Deletes the tournament after confirmation.
   */
  public async deleteTournament(): Promise<void> {
    if (!this.tournamentId) return;

    const tournament = this.tournament();
    const user = this.authStateService.getCurrentUser();
    
    if (!tournament || !user) return;

    const confirmed = confirm(
      `Are you sure you want to delete "${tournament.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await this.tournamentService.deleteTournament(this.tournamentId, user.id);
      alert('Tournament deleted successfully');
      void this.router.navigate(['/tournaments']);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete tournament';
      alert(message);
    }
  }

  /**
   * Gets the available status transitions for the current tournament status.
   * 
   * @returns Array of allowed status transitions
   */
  public getAvailableStatusTransitions(): TournamentStatus[] {
    const tournament = this.tournament();
    if (!tournament) return [];

    const validTransitions: Record<TournamentStatus, TournamentStatus[]> = {
      [TournamentStatus.DRAFT]: [TournamentStatus.REGISTRATION_OPEN, TournamentStatus.CANCELLED],
      [TournamentStatus.REGISTRATION_OPEN]: [TournamentStatus.REGISTRATION_CLOSED, TournamentStatus.CANCELLED],
      [TournamentStatus.REGISTRATION_CLOSED]: [TournamentStatus.DRAW_PENDING, TournamentStatus.CANCELLED],
      [TournamentStatus.DRAW_PENDING]: [TournamentStatus.IN_PROGRESS, TournamentStatus.CANCELLED],
      [TournamentStatus.IN_PROGRESS]: [TournamentStatus.FINALIZED, TournamentStatus.CANCELLED],
      [TournamentStatus.FINALIZED]: [],
      [TournamentStatus.CANCELLED]: [],
    };

    return validTransitions[tournament.status as TournamentStatus] || [];
  }

  /**
   * Changes the tournament status.
   * 
   * @param newStatus - The new status to set
   */
  public async changeStatus(newStatus: TournamentStatus): Promise<void> {
    if (!this.tournamentId) return;

    const user = this.authStateService.getCurrentUser();
    if (!user) return;

    const tournament = this.tournament();
    if (!tournament) return;

    const confirmed = confirm(
      `Change tournament status from ${tournament.status} to ${newStatus}?`
    );

    if (!confirmed) return;

    this.isLoading.set(true);
    try {
      await this.tournamentService.updateStatus(this.tournamentId, newStatus, user.id);
      alert('Tournament status updated successfully');
      await this.loadTournament(); // Reload to show updated status
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update tournament status';
      alert(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Formats status enum for display.
   * 
   * @param status - Status enum value
   * @returns Formatted status string
   */
  public formatStatus(status: TournamentStatus): string {
    return status.replace(/_/g, ' ');
  }

  /**
   * Gets a description for the current tournament status.
   * 
   * @returns Status description with context
   */
  public getStatusDescription(): string {
    const tournament = this.tournament();
    if (!tournament) return '';

    const descriptions: Record<TournamentStatus, string> = {
      [TournamentStatus.DRAFT]: 'Tournament is in draft mode. Setup categories and details before opening registration.',
      [TournamentStatus.REGISTRATION_OPEN]: 'Tournament is accepting player registrations. Players can register for available categories.',
      [TournamentStatus.REGISTRATION_CLOSED]: 'Registration period has ended. Preparing tournament draw and brackets.',
      [TournamentStatus.DRAW_PENDING]: 'Tournament draw is being prepared. Matches will be scheduled soon.',
      [TournamentStatus.IN_PROGRESS]: 'Tournament is currently active. Matches are being played.',
      [TournamentStatus.FINALIZED]: 'Tournament has concluded. All matches have been completed and results are final.',
      [TournamentStatus.CANCELLED]: 'Tournament has been cancelled and will not proceed.',
    };

    return descriptions[tournament.status as TournamentStatus] || 'Status information not available.';
  }

  /**
   * Gets the icon/emoji for the current status.
   * 
   * @returns Status icon
   */
  public getStatusIcon(): string {
    const tournament = this.tournament();
    if (!tournament) return '📋';

    const icons: Record<TournamentStatus, string> = {
      [TournamentStatus.DRAFT]: '📝',
      [TournamentStatus.REGISTRATION_OPEN]: '✅',
      [TournamentStatus.REGISTRATION_CLOSED]: '🔒',
      [TournamentStatus.DRAW_PENDING]: '🔀',
      [TournamentStatus.IN_PROGRESS]: '🎾',
      [TournamentStatus.FINALIZED]: '🏆',
      [TournamentStatus.CANCELLED]: '❌',
    };

    return icons[tournament.status as TournamentStatus] || '📋';
  }

  /**
   * Gets action items or next steps for the current status.
   * 
   * @returns Array of action items
   */
  public getStatusActions(): string[] {
    const tournament = this.tournament();
    if (!tournament) return [];

    const actions: Record<TournamentStatus, string[]> = {
      [TournamentStatus.DRAFT]: [
        'Configure tournament categories',
        'Set up courts and facilities',
        'Review tournament details',
        'Open registration when ready',
      ],
      [TournamentStatus.REGISTRATION_OPEN]: [
        'Monitor player registrations',
        'Answer player inquiries',
        'Close registration when capacity reached or deadline passes',
      ],
      [TournamentStatus.REGISTRATION_CLOSED]: [
        'Review registered participants',
        'Prepare tournament draw',
        'Schedule match times',
      ],
      [TournamentStatus.DRAW_PENDING]: [
        'Finalize bracket assignments',
        'Notify participants of match schedules',
        'Begin tournament play',
      ],
      [TournamentStatus.IN_PROGRESS]: [
        'Record match results',
        'Update bracket progress',
        'Monitor tournament schedule',
      ],
      [TournamentStatus.FINALIZED]: [
        'Review tournament results',
        'Archive tournament data',
        'Prepare certificates or awards',
      ],
      [TournamentStatus.CANCELLED]: [
        'Notify all registered participants',
        'Process refunds if applicable',
      ],
    };

    return actions[tournament.status as TournamentStatus] || [];
  }
}
