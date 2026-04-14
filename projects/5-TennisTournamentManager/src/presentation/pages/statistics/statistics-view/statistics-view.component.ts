/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/pages/statistics/statistics-view/statistics-view.component.ts
 * @desc Player and tournament statistics dashboard.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, OnInit, signal, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {StatisticsService} from '@application/services';
import {type StatisticsDto, type HeadToHeadDto, type TeamHeadToHeadDto} from '@application/dto';
import {AuthStateService} from '@presentation/services/auth-state.service';
import templateHtml from './statistics-view.component.html?raw';
import stylesCss from './statistics-view.component.css?inline';

/**
 * StatisticsViewComponent displays player and tournament statistics.
 */
@Component({
  selector: 'app-statistics-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: templateHtml,
  styles: [stylesCss],
})
export class StatisticsViewComponent implements OnInit {
  /** Services */
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly statisticsService = inject(StatisticsService);
  private readonly authStateService = inject(AuthStateService);

  /** Statistics data */
  public statistics = signal<StatisticsDto | null>(null);

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** Expose Object.keys to template for surface performance iteration */
  public readonly Object = Object;

  /** Currently expanded opponent ID for H2H panel */
  public expandedH2hOpponentId = signal<string | null>(null);

  /** H2H data map: opponentId → HeadToHeadDto */
  public h2hData = signal<Map<string, HeadToHeadDto>>(new Map());

  /** H2H loading state per opponent */
  public h2hLoading = signal<Set<string>>(new Set());

  /** Currently expanded opponent team ID for team H2H panel */
  public expandedTeamH2hId = signal<string | null>(null);

  /** Team H2H data map: opponentTeamId → TeamHeadToHeadDto */
  public teamH2hData = signal<Map<string, TeamHeadToHeadDto>>(new Map());

  /** Team H2H loading state per opponent team */
  public teamH2hLoading = signal<Set<string>>(new Set());

  /** Current player ID (resolved after login check) */
  private currentParticipantId: string | null = null;

  /**
   * Initializes component and loads statistics.
   */
  public ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      let participantId = params.get('id');
      if (!participantId) {
        const user = this.authStateService.getCurrentUser();
        participantId = user?.id || null;
      }
      if (participantId) {
        this.currentParticipantId = participantId;
        void this.loadStatistics(participantId);
      }
    });
  }

  /**
   * Loads statistics for participant.
   *
   * @param participantId - ID of the participant
   */
  private async loadStatistics(participantId: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const statistics = await this.statisticsService.getParticipantStatistics(participantId);
      this.statistics.set(statistics);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load statistics';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Navigates back to dashboard.
   */
  public goBack(): void {
    void this.router.navigate(['/dashboard']);
  }

  /**
   * Toggles the H2H details panel for a given opponent.
   * Lazily loads H2H data the first time the panel is expanded.
   *
   * @param opponentId - ID of the opponent to show H2H for
   */
  public async toggleH2H(opponentId: string): Promise<void> {
    const current = this.expandedH2hOpponentId();
    if (current === opponentId) {
      // Collapse
      this.expandedH2hOpponentId.set(null);
      return;
    }

    // Expand and load if not already loaded
    this.expandedH2hOpponentId.set(opponentId);
    if (!this.h2hData().has(opponentId) && this.currentParticipantId) {
      const loading = new Set(this.h2hLoading());
      loading.add(opponentId);
      this.h2hLoading.set(loading);

      try {
        const h2h = await this.statisticsService.getHeadToHead(this.currentParticipantId, opponentId) as HeadToHeadDto;
        const map = new Map(this.h2hData());
        map.set(opponentId, h2h);
        this.h2hData.set(map);
      } catch {
        // Silently ignore — panel will show empty state
      } finally {
        const done = new Set(this.h2hLoading());
        done.delete(opponentId);
        this.h2hLoading.set(done);
      }
    }
  }

  /**
   * Returns whether an H2H panel is currently loading for a given opponent.
   *
   * @param opponentId - Opponent ID to check
   * @returns True if the H2H for this opponent is loading
   */
  public isH2HLoading(opponentId: string): boolean {
    return this.h2hLoading().has(opponentId);
  }

  /**
   * Returns H2H data for a given opponent, or null if not yet loaded.
   *
   * @param opponentId - Opponent ID
   * @returns HeadToHeadDto or null
   */
  public getH2H(opponentId: string): HeadToHeadDto | null {
    return this.h2hData().get(opponentId) ?? null;
  }

  /**
   * Toggles the team H2H details panel for a given opponent team.
   * Lazily loads team H2H data the first time the panel is expanded.
   *
   * @param opponentTeamId - ID of the opponent team to show H2H for
   */
  public async toggleTeamH2H(opponentTeamId: string): Promise<void> {
    const current = this.expandedTeamH2hId();
    if (current === opponentTeamId) {
      // Collapse
      this.expandedTeamH2hId.set(null);
      return;
    }

    // Expand and load if not already loaded
    this.expandedTeamH2hId.set(opponentTeamId);
    if (!this.teamH2hData().has(opponentTeamId) && this.currentParticipantId) {
      const loading = new Set(this.teamH2hLoading());
      loading.add(opponentTeamId);
      this.teamH2hLoading.set(loading);

      try {
        const teamH2h = await this.statisticsService.getTeamHeadToHead(this.currentParticipantId, opponentTeamId) as TeamHeadToHeadDto;
        const map = new Map(this.teamH2hData());
        map.set(opponentTeamId, teamH2h);
        this.teamH2hData.set(map);
      } catch {
        // Silently ignore — panel will show empty state
      } finally {
        const done = new Set(this.teamH2hLoading());
        done.delete(opponentTeamId);
        this.teamH2hLoading.set(done);
      }
    }
  }

  /**
   * Returns whether a team H2H panel is currently loading for a given opponent team.
   *
   * @param opponentTeamId - Opponent team ID to check
   * @returns True if the team H2H for this team is loading
   */
  public isTeamH2HLoading(opponentTeamId: string): boolean {
    return this.teamH2hLoading().has(opponentTeamId);
  }

  /**
   * Returns team H2H data for a given opponent team, or null if not yet loaded.
   *
   * @param opponentTeamId - Opponent team ID
   * @returns TeamHeadToHeadDto or null
   */
  public getTeamH2H(opponentTeamId: string): TeamHeadToHeadDto | null {
    return this.teamH2hData().get(opponentTeamId) ?? null;
  }

  /**
   * Navigates to the match details page.
   *
   * @param matchId - ID of the match to view
   */
  public goToMatchDetails(matchId: string): void {
    void this.router.navigate(['/matches', matchId]);
  }
}
