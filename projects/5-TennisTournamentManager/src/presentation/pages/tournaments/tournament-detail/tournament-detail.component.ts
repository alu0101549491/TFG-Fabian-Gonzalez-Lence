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

import {Component, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {TournamentService, RegistrationService} from '@application/services';
import {type TournamentDto} from '@application/dto';
import {AuthStateService} from '@presentation/services/auth-state.service';

/**
 * TournamentDetailComponent displays comprehensive information about a tournament.
 * Shows tournament details, registration status, and navigation to brackets/matches.
 */
@Component({
  selector: 'app-tournament-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tournament-detail.component.html',
  styles: [],
})
export class TournamentDetailComponent implements OnInit {
  /** Tournament data */
  public tournament = signal<TournamentDto | null>(null);

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** Registration status */
  public isRegistered = signal(false);

  /** Tournament ID from route */
  private tournamentId: string | null = null;

  /**
   * Creates an instance of TournamentDetailComponent.
   *
   * @param route - Activated route to get tournament ID
   * @param router - Router for navigation
   * @param tournamentService - Tournament service for data operations
   * @param registrationService - Registration service for checking status
   * @param authStateService - Auth state service for user info
   */
  public constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly tournamentService: TournamentService,
    private readonly registrationService: RegistrationService,
    private readonly authStateService: AuthStateService,
  ) {}

  /**
   * Initializes component and loads tournament data.
   */
  public ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
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
      await this.checkRegistrationStatus();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load tournament';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
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

    try {
      await this.registrationService.createRegistration({
        tournamentId: this.tournamentId,
        participantId: user.id,
      });
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
   * Checks if user is authenticated.
   *
   * @returns True if user is logged in
   */
  public isAuthenticated(): boolean {
    return this.authStateService.isAuthenticated();
  }
}
