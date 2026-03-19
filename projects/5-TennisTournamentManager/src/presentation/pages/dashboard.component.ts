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
import {AuthStateService} from '@presentation/services/auth-state.service';
import {RegistrationService} from '@application/services/registration.service';
import {StatisticsService} from '@application/services/statistics.service';
import {MatchService} from '@application/services/match.service';
import {RegistrationDto} from '@application/dto';
import {StatisticsDto} from '@application/dto/statistics.dto';
import {MatchDto} from '@application/dto/match.dto';

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
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <!-- Welcome Header -->
      <header class="dashboard-header">
        <div class="welcome-section">
          <h1 class="welcome-title">
            Welcome back, {{ currentUser()?.firstName || 'Player' }}! 👋
          </h1>
          <p class="welcome-subtitle">
            Here's what's happening with your tournaments
          </p>
        </div>
        
        <div class="quick-actions">
          <button (click)="goToTournaments()" class="btn btn-primary">
            <span class="btn-icon">🏆</span>
            <span>Browse Tournaments</span>
          </button>
          <button (click)="goToProfile()" class="btn btn-secondary">
            <span class="btn-icon">👤</span>
            <span>My Profile</span>
          </button>
        </div>
      </header>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="loading-container">
          <div class="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      }

      <!-- Error State -->
      @if (errorMessage()) {
        <div class="error-banner">
          <span class="error-icon">⚠️</span>
          <span>{{ errorMessage() }}</span>
        </div>
      }

      <!-- Dashboard Content -->
      @if (!isLoading()) {
        <!-- Stats Overview -->
        <section class="stats-grid">
          <div class="stat-card tournaments">
            <div class="stat-icon">🏆</div>
            <div class="stat-content">
              <div class="stat-value">{{ registrations().length }}</div>
              <div class="stat-label">Tournaments</div>
              <div class="stat-sublabel">Registered</div>
            </div>
          </div>

          <div class="stat-card matches">
            <div class="stat-icon">🎾</div>
            <div class="stat-content">
              <div class="stat-value">{{ upcomingMatches().length }}</div>
              <div class="stat-label">Matches</div>
              <div class="stat-sublabel">Upcoming</div>
            </div>
          </div>

          <div class="stat-card wins">
            <div class="stat-icon">🏅</div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics()?.totalWins || 0 }}</div>
              <div class="stat-label">Wins</div>
              <div class="stat-sublabel">Total</div>
            </div>
          </div>

          <div class="stat-card percentage">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <div class="stat-value">{{ winPercentage() }}%</div>
              <div class="stat-label">Win Rate</div>
              <div class="stat-sublabel">Overall</div>
            </div>
          </div>
        </section>

        <!-- Main Content Grid -->
        <div class="content-grid">
          <!-- Upcoming Matches -->
          <section class="dashboard-card upcoming-matches-card">
            <div class="card-header">
              <h2>
                <span class="card-icon">🎾</span>
                Upcoming Matches
              </h2>
              <a routerLink="/matches" class="card-link">View all</a>
            </div>
            
            <div class="card-body">
              @if (upcomingMatches().length === 0) {
                <div class="empty-state">
                  <span class="empty-icon">🗓️</span>
                  <p>No upcoming matches</p>
                  <small>Your scheduled matches will appear here</small>
                </div>
              } @else {
                <div class="matches-list">
                  @for (match of upcomingMatches().slice(0, 5); track match.id) {
                    <div class="match-item" (click)="goToMatch(match.id)">
                      <div class="match-info">
                        <div class="match-court">Court {{ match.courtId || 'TBD' }}</div>
                        <div class="match-time">
                          {{ formatMatchTime(match.scheduledAt) }}
                        </div>
                      </div>
                      <div class="match-status">
                        <span class="status-badge" [class]="match.status?.toLowerCase()">
                          {{ match.status }}
                        </span>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </section>

          <!-- My Tournaments -->
          <section class="dashboard-card tournaments-card">
            <div class="card-header">
              <h2>
                <span class="card-icon">🏆</span>
                My Tournaments
              </h2>
              <a routerLink="/tournaments" class="card-link">View all</a>
            </div>
            
            <div class="card-body">
              @if (registrations().length === 0) {
                <div class="empty-state">
                  <span class="empty-icon">🎾</span>
                  <p>No tournament registrations</p>
                  <small>Register for a tournament to get started</small>
                  <button (click)="goToTournaments()" class="btn btn-sm btn-primary" style="margin-top: 1rem;">
                    Browse Tournaments
                  </button>
                </div>
              } @else {
                <div class="tournaments-list">
                  @for (registration of registrations().slice(0, 5); track registration.id) {
                    <div class="tournament-item" (click)="goToTournament(registration.tournamentId)">
                      <div class="tournament-info">
                        <div class="tournament-name">{{ registration.tournamentId }}</div>
                        <div class="tournament-category">{{ registration.categoryId }}</div>
                      </div>
                      <div class="tournament-status">
                        <span class="status-badge" [class]="registration.status?.toLowerCase()">
                          {{ registration.status }}
                        </span>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </section>

          <!-- Performance Stats -->
          <section class="dashboard-card stats-card">
            <div class="card-header">
              <h2>
                <span class="card-icon">📊</span>
                Performance Overview
              </h2>
              <a routerLink="/statistics" class="card-link">View details</a>
            </div>
            
            <div class="card-body">
              @if (statistics()) {
                <div class="performance-stats">
                  <div class="perf-stat">
                    <div class="perf-label">Matches Played</div>
                    <div class="perf-value">{{ statistics()!.totalMatches || 0 }}</div>
                  </div>
                  <div class="perf-stat">
                    <div class="perf-label">Wins / Losses</div>
                    <div class="perf-value">
                      {{ statistics()!.totalWins || 0 }} / {{ statistics()!.totalLosses || 0 }}
                    </div>
                  </div>
                  <div class="perf-stat">
                    <div class="perf-label">Current Streak</div>
                    <div class="perf-value">
                      {{ statistics()!.currentWinStreak || 0 }} wins
                    </div>
                  </div>
                  <div class="perf-stat">
                    <div class="perf-label">Best Streak</div>
                    <div class="perf-value">
                      {{ statistics()!.bestWinStreak || 0 }} wins
                    </div>
                  </div>
                  <div class="perf-stat">
                    <div class="perf-label">Sets Won</div>
                    <div class="perf-value">{{ statistics()!.totalSetsWon || 0 }}</div>
                  </div>
                  <div class="perf-stat">
                    <div class="perf-label">Games Won</div>
                    <div class="perf-value">{{ statistics()!.totalGamesWon || 0 }}</div>
                  </div>
                </div>
              } @else {
                <div class="empty-state">
                  <span class="empty-icon">📈</span>
                  <p>No statistics available</p>
                  <small>Play matches to build your statistics</small>
                </div>
              }
            </div>
          </section>

          <!-- Quick Links -->
          <section class="dashboard-card quick-links-card">
            <div class="card-header">
              <h2>
                <span class="card-icon">⚡</span>
                Quick Links
              </h2>
            </div>
            
            <div class="card-body">
              <div class="quick-links-grid">
                <a routerLink="/tournaments/browse" class="quick-link-item">
                  <span class="quick-link-icon">🔍</span>
                  <span class="quick-link-text">Browse Tournaments</span>
                </a>
                <a routerLink="/matches" class="quick-link-item">
                  <span class="quick-link-icon">📅</span>
                  <span class="quick-link-text">My Matches</span>
                </a>
                <a routerLink="/standings" class="quick-link-item">
                  <span class="quick-link-icon">🏅</span>
                  <span class="quick-link-text">Standings</span>
                </a>
                <a routerLink="/rankings" class="quick-link-item">
                  <span class="quick-link-icon">📊</span>
                  <span class="quick-link-text">Rankings</span>
                </a>
                <a routerLink="/profile" class="quick-link-item">
                  <span class="quick-link-icon">👤</span>
                  <span class="quick-link-text">My Profile</span>
                </a>
                <a routerLink="/settings" class="quick-link-item">
                  <span class="quick-link-icon">⚙️</span>
                  <span class="quick-link-text">Settings</span>
                </a>
              </div>
            </div>
          </section>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: var(--spacing-xl);
      min-height: 100vh;
      background: var(--color-background);
    }

    /* Header */
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-2xl);
      gap: var(--spacing-lg);
      flex-wrap: wrap;
    }

    .welcome-section {
      flex: 1;
      min-width: 300px;
    }

    .welcome-title {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-xs);
    }

    .welcome-subtitle {
      font-size: var(--font-size-md);
      color: var(--color-text-secondary);
    }

    .quick-actions {
      display: flex;
      gap: var(--spacing-md);
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-2xl);
    }

    .stat-card {
      background: var(--color-white);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-lg);
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--color-border);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .stat-icon {
      font-size: 2.5rem;
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--border-radius-md);
      background: var(--color-background);
    }

    .stat-card.tournaments .stat-icon {
      background: #fff3e0;
    }

    .stat-card.matches .stat-icon {
      background: #e3f2fd;
    }

    .stat-card.wins .stat-icon {
      background: #e8f5e9;
    }

    .stat-card.percentage .stat-icon {
      background: #f3e5f5;
    }

    .stat-content {
      flex: 1;
    }

    .stat-value {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      line-height: 1;
      margin-bottom: var(--spacing-xs);
    }

    .stat-label {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }

    .stat-sublabel {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    /* Content Grid */
    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: var(--spacing-lg);
    }

    .dashboard-card {
      background: var(--color-white);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--color-border);
      overflow: hidden;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--color-border);
      background: var(--color-background);
    }

    .card-header h2 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin: 0;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .card-icon {
      font-size: 1.25rem;
    }

    .card-link {
      font-size: var(--font-size-sm);
      color: var(--color-primary);
      text-decoration: none;
      font-weight: var(--font-weight-medium);
    }

    .card-link:hover {
      text-decoration: underline;
    }

    .card-body {
      padding: var(--spacing-lg);
    }

    /* Empty States */
    .empty-state {
      text-align: center;
      padding: var(--spacing-2xl) var(--spacing-lg);
      color: var(--color-text-secondary);
    }

    .empty-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: var(--spacing-md);
      opacity: 0.5;
    }

    .empty-state p {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-medium);
      margin-bottom: var(--spacing-xs);
      color: var(--color-text-primary);
    }

    .empty-state small {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    /* Matches List */
    .matches-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .match-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      border-radius: var(--border-radius-md);
      background: var(--color-background);
      cursor: pointer;
      transition: background 0.2s;
    }

    .match-item:hover {
      background: var(--color-border);
    }

    .match-info {
      flex: 1;
    }

    .match-court {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-xs);
    }

    .match-time {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    /* Tournaments List */
    .tournaments-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .tournament-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      border-radius: var(--border-radius-md);
      background: var(--color-background);
      cursor: pointer;
      transition: background 0.2s;
    }

    .tournament-item:hover {
      background: var(--color-border);
    }

    .tournament-info {
      flex: 1;
    }

    .tournament-name {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-xs);
    }

    .tournament-category {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    /* Status Badges */
    .status-badge {
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-badge.accepted {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .status-badge.pending {
      background: #fff3e0;
      color: #f57c00;
    }

    .status-badge.scheduled {
      background: #e3f2fd;
      color: #1976d2;
    }

    /* Performance Stats */
    .performance-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-md);
    }

    .perf-stat {
      padding: var(--spacing-md);
      background: var(--color-background);
      border-radius: var(--border-radius-md);
      text-align: center;
    }

    .perf-label {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-xs);
    }

    .perf-value {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
    }

    /* Quick Links */
    .quick-links-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-sm);
    }

    .quick-link-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      background: var(--color-background);
      border-radius: var(--border-radius-md);
      text-decoration: none;
      color: var(--color-text-primary);
      font-weight: var(--font-weight-medium);
      transition: background 0.2s, transform 0.2s;
    }

    .quick-link-item:hover {
      background: var(--color-border);
      transform: translateX(4px);
    }

    .quick-link-icon {
      font-size: 1.5rem;
    }

    .quick-link-text {
      font-size: var(--font-size-sm);
    }

    /* Loading */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-3xl);
      color: var(--color-text-secondary);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--color-border);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: var(--spacing-md);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Error */
    .error-banner {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      background: #ffebee;
      border: 1px solid #ef5350;
      border-radius: var(--border-radius-md);
      color: #c62828;
      margin-bottom: var(--spacing-lg);
    }

    .error-icon {
      font-size: 1.25rem;
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      border: none;
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
    }

    .btn-primary {
      background: var(--color-primary);
      color: var(--color-white);
    }

    .btn-primary:hover {
      background: var(--color-primary-dark);
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }

    .btn-secondary {
      background: var(--color-white);
      color: var(--color-primary);
      border: 2px solid var(--color-primary);
    }

    .btn-secondary:hover {
      background: var(--color-primary);
      color: var(--color-white);
    }

    .btn-sm {
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: var(--font-size-xs);
    }

    .btn-icon {
      font-size: 1.25rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .dashboard-container {
        padding: var(--spacing-md);
      }

      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .quick-actions {
        width: 100%;
        flex-direction: column;
      }

      .quick-actions .btn {
        width: 100%;
        justify-content: center;
      }

      .content-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .performance-stats {
        grid-template-columns: 1fr;
      }

      .quick-links-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly authState = inject(AuthStateService);
  private readonly registrationService = inject(RegistrationService);
  private readonly statisticsService = inject(StatisticsService);
  private readonly matchService = inject(MatchService);
  private readonly router = inject(Router);

  /** Current user */
  protected readonly currentUser = computed(() => this.authState.getCurrentUser());

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

      // Load data in parallel - each service failure returns empty/null data instead of crashing
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
}
