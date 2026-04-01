/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file presentation/pages/dashboard.component.ts
 * @desc User dashboard component with personalized information and quick actions.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, inject, OnInit, signal, computed} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {AuthStateService} from '@presentation/services/auth-state.service';
import {RegistrationService} from '@application/services/registration.service';
import {StatisticsService} from '@application/services/statistics.service';
import {MatchService} from '@application/services/match.service';
import {RegistrationDto} from '@application/dto';
import {StatisticsDto} from '@application/dto/statistics.dto';
import {MatchDto} from '@application/dto/match.dto';
import {UserRole} from '@domain/enumerations/user-role';
import {EnumFormatPipe} from '@shared/pipes';
import {environment} from '../../environments/environment';
import templateHtml from './dashboard.component.html?raw';
import styles from './dashboard.component.css?inline';

/**
 * DashboardComponent - Personalized home page for authenticated users
 * 
 * Displays:
 * - User welcome message
 * - Quick statistics overview
 * - Upcoming matches
 * - Registered tournaments
 * - Personal performance metrics
 * - Quick action buttons
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, EnumFormatPipe],
  template: templateHtml,
  styles: [styles],
})
export class DashboardComponent implements OnInit {
  private readonly authState = inject(AuthStateService);
  private readonly registrationService = inject(RegistrationService);
  private readonly statisticsService = inject(StatisticsService);
  private readonly matchService = inject(MatchService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  /** Current user */
  protected readonly currentUser = computed(() => this.authState.getCurrentUser());

  /** Check if current user is admin */
  protected readonly isAdmin = computed(() => {
    const user = this.currentUser();
    return user?.role === UserRole.SYSTEM_ADMIN || user?.role === UserRole.TOURNAMENT_ADMIN;
  });

  /** Loading state */
  protected readonly isLoading = signal(true);

  /** Error message */
  protected readonly errorMessage = signal<string | null>(null);

  /** User registrations */
  protected readonly registrations = signal<RegistrationDto[]>([]);

  /** User statistics */
  protected readonly statistics = signal<StatisticsDto | null>(null);

  /** Upcoming matches */
  protected readonly upcomingMatches = signal<MatchDto[]>([]);

  /** Disputed matches (for admin view) */
  protected readonly disputedMatches = signal<any[]>([]);

  /** Win percentage computed */
  protected readonly winPercentage = computed(() => {
    const stats = this.statistics();
    if (!stats || !stats.totalMatches) return 0;
    return Math.round((stats.totalWins / stats.totalMatches) * 100);
  });

  /**
   * Component initialization.
   * Loads user's dashboard data.
   */
  public ngOnInit(): void {
    void this.loadDashboardData();
  }

  /**
   * Loads all dashboard data.
   */
  private async loadDashboardData(): Promise<void> {
    const user = this.currentUser();
    if (!user) {
      this.errorMessage.set('Unable to load dashboard: User not authenticated');
      this.isLoading.set(false);
      return;
    }

    try {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      // Load different data based on user role
      if (this.isAdmin()) {
        // Admin users: Load disputed matches
        const disputedResults = await this.loadDisputedMatches().catch((err) => {
          console.warn('Failed to load disputed matches:', err.message);
          return [];
        });
        this.disputedMatches.set(disputedResults);
      } else {
        // Regular players: Load registrations, stats, and matches
        const [registrations, stats, matches] = await Promise.all([
          this.registrationService.getRegistrationsByParticipant(user.id).catch((err) => {
            console.warn('Failed to load registrations:', err.message);
            return [];
          }),
          this.statisticsService.getParticipantStatistics(user.id).catch((err) => {
            console.warn('Failed to load statistics:', err.message);
            return null;
          }),
          this.loadUserMatches(user.id).catch((err) => {
            console.warn('Failed to load matches:', err.message);
            return [];
          }),
        ]);

        this.registrations.set(registrations);
        this.statistics.set(stats);
        this.upcomingMatches.set(matches);
      }
    } catch (error) {
      // This catch should rarely trigger now since individual promises handle their errors
      const message = error instanceof Error ? error.message : 'Failed to load dashboard data';
      this.errorMessage.set(message);
      console.error('Dashboard load error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Loads user's matches.
   * 
   * @param userId - User ID
   * @returns List of matches
   */
  private async loadUserMatches(userId: string): Promise<MatchDto[]> {
    // Get matches where the user is a participant
    const userMatches = await this.matchService.getMatchesByParticipant(userId);
    
    // Filter for upcoming/scheduled matches
    const upcoming = userMatches.filter(
      m => m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS'
    );
    
    // Sort by scheduled time
    return upcoming.sort((a, b) => {
      if (!a.scheduledAt) return 1;
      if (!b.scheduledAt) return -1;
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    });
  }

  /**
   * Formats match scheduled time.
   * 
   * @param time - Scheduled time
   * @returns Formatted time string
   */
  protected formatMatchTime(time: Date | null | undefined): string {
    if (!time) return 'Time TBD';
    
    const date = new Date(time);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Navigate to tournaments page.
   */
  protected goToTournaments(): void {
    void this.router.navigate(['/tournaments']);
  }

  /**
   * Navigate to profile page.
   */
  protected goToProfile(): void {
    void this.router.navigate(['/profile']);
  }

  /**
   * Navigate to specific tournament.
   * 
   * @param tournamentId - Tournament ID
   */
  protected goToTournament(tournamentId: string): void {
    void this.router.navigate(['/tournaments', tournamentId]);
  }

  /**
   * Navigate to specific match.
   * 
   * @param matchId - Match ID
   */
  protected goToMatch(matchId: string): void {
    void this.router.navigate(['/matches', matchId]);
  }

  /**
   * Loads disputed matches for admin users.
   * 
   * @returns List of disputed results
   */
  private async loadDisputedMatches(): Promise<any[]> {
    const token = this.authState.getToken();
    if (!token) return [];

    const response = await this.http.get<any[]>(
      `${environment.apiUrl}/admin/matches/disputed`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ).toPromise();

    return response || [];
  }

  /**
   * Navigate to disputed matches page.
   */
  protected goToDisputedMatches(): void {
    void this.router.navigate(['/admin/disputed-matches']);
  }

  /**
   * Navigate to admin dashboard.
   */
  protected goToAdminDashboard(): void {
    void this.router.navigate(['/admin/dashboard']);
  }

  /**
   * Formats date for display.
   * 
   * @param date - Date to format
   * @returns Formatted date string
   */
  protected formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  /**
   * Gets full name from first and last name.
   * 
   * @param firstName - First name
   * @param lastName - Last name
   * @returns Full name
   */
  protected getFullName(firstName: string, lastName: string): string {
    return `${firstName} ${lastName}`;
  }
}
