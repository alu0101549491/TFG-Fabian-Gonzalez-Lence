/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/pages/ranking/ranking-view/ranking-view.component.ts
 * @desc Global ranking table with multi-system support (ELO, points, WTN).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, OnInit, signal, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {RankingService} from '@application/services';
import {type RankingDto} from '@application/dto';
import {RankingSystem} from '@domain/enumerations/ranking-system';
import templateHtml from './ranking-view.component.html?raw';

/**
 * RankingViewComponent displays global player rankings.
 */
@Component({
  selector: 'app-ranking-view',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: templateHtml,
  styles: [],
})
export class RankingViewComponent implements OnInit {
  /** Services */
  private readonly rankingService = inject(RankingService);

  /** Rankings data */
  public rankings = signal<RankingDto[]>([]);

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** Selected ranking system */
  public selectedSystem: RankingSystem = RankingSystem.POINTS;

  /** Available ranking systems */
  public readonly systems = Object.values(RankingSystem);

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
}
