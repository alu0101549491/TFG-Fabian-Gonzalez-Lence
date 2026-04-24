/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file src/presentation/pages/ranking/ranking-view/ranking-view.component.ts
 * @desc Global ranking table with multi-system support (ELO, points, WTN).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Component, OnInit, signal, computed, inject} from '@angular/core';
import {CommonModule, Location} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {RankingService} from '@application/services';
import {type RankingDto} from '@application/dto';
import {RankingSystem, getRankingSystemDisplayName} from '@domain/enumerations/ranking-system';
import {UserRole} from '@domain/enumerations/user-role';
import {AuthStateService} from '@presentation/services/auth-state.service';
import templateHtml from './ranking-view.component.html?raw';
import componentStyles from './ranking-view.component.css?inline';

/**
 * RankingViewComponent displays global player rankings.
 */
@Component({
  selector: 'app-ranking-view',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: templateHtml,
  styles: [componentStyles],
})
export class RankingViewComponent implements OnInit {
  /** Services */
  private readonly rankingService = inject(RankingService);
  private readonly authStateService = inject(AuthStateService);
  private readonly location = inject(Location);

  /** Rankings data */
  public rankings = signal<RankingDto[]>([]);

  /** Loading state */
  public isLoading = signal(false);

  /** Whether a recalculation is in progress */
  public isRecalculating = signal(false);

  /** Success message for recalculation */
  public recalculateMessage = signal<string | null>(null);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** Selected ranking system */
  public selectedSystem: RankingSystem = RankingSystem.ELO;

  /** Available ranking systems */
  public readonly systems = Object.values(RankingSystem);

  /** Whether the current user is an admin. */
  public readonly isAdmin = computed(() => {
    const user = this.authStateService.getCurrentUser();
    return user?.role === UserRole.SYSTEM_ADMIN || user?.role === UserRole.TOURNAMENT_ADMIN;
  });

  /** Math reference for template usage. */
  public readonly Math = Math;

  /**
   * Gets the display name for a ranking system.
   *
   * @param system - Ranking system enum value
   * @returns User-friendly display name
   */
  public getSystemDisplayName(system: RankingSystem): string {
    return getRankingSystemDisplayName(system);
  }

  /**
   * Initializes component and loads rankings.
   */
  public ngOnInit(): void {
    void this.loadRankings();
  }

  /**
   * Loads rankings for selected system.
   */
  public async loadRankings(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const rankings = await this.rankingService.getRankingsBySystem(this.selectedSystem);
      this.rankings.set(rankings);
    } catch (error) {
      console.error('[Rankings] loadRankings() caught error:', error);
      const message = error instanceof Error ? error.message : 'Failed to load rankings';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Changes ranking system and reloads.
   */
  public changeSystem(): void {
    void this.loadRankings();
  }

  /**
   * Triggers a global ranking recalculation (admin-only).
   * Re-sorts all global rankings by points and updates their positions.
   */
  public async recalculateRankings(): Promise<void> {
    if (!this.isAdmin()) return;

    // Snapshot current positions before recalculating so the Change column
    // reflects movement from this specific recalculation.
    const snapshot = new Map<string, number>();
    for (const ranking of this.rankings()) {
      snapshot.set(ranking.participantId, ranking.position);
    }

    this.isRecalculating.set(true);
    this.recalculateMessage.set(null);
    this.errorMessage.set(null);

    try {
      await this.rankingService.recalculateRankings();
      this.recalculateMessage.set('Rankings recalculated successfully.');
      await this.loadRankings();

      // Apply position change relative to the pre-recalculation snapshot.
      this.rankings.update(current =>
        current.map(r => ({
          ...r,
          positionChange: snapshot.has(r.participantId)
            ? snapshot.get(r.participantId)! - r.position
            : 0,
        })),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to recalculate rankings';
      this.errorMessage.set(message);
    } finally {
      this.isRecalculating.set(false);
      // Auto-clear the success message
      setTimeout(() => this.recalculateMessage.set(null), 4000);
    }
  }

  /**
   * Navigates back to previous page.
   */
  public goBack(): void {
    this.location.back();
  }
}
