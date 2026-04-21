/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 9, 2026
 * @file src/presentation/pages/tournaments/tournament-statistics/tournament-statistics.component.ts
 * @desc Tournament-wide statistics view showing participants, matches, and performance metrics.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Component, OnInit, signal, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {StatisticsService, ExportService} from '@application/services';
import {type TournamentStatisticsDto} from '@application/dto';
import {ExportFormat} from '@domain/enumerations/export-format';
import {AuthStateService} from '@presentation/services/auth-state.service';
import templateHtml from './tournament-statistics.component.html?raw';
import stylesCss from './tournament-statistics.component.css?inline';

/**
 * TournamentStatisticsComponent displays comprehensive tournament-wide statistics.
 * Shows total participants, match distribution, top performers, and export options (FR46).
 */
@Component({
  selector: 'app-tournament-statistics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: templateHtml,
  styles: [stylesCss],
})
export class TournamentStatisticsComponent implements OnInit {
  /** Services */
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly statisticsService = inject(StatisticsService);
  private readonly exportService = inject(ExportService);
  private readonly authStateService = inject(AuthStateService);

  /** Tournament statistics data */
  public statistics = signal<TournamentStatisticsDto | null>(null);

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** Tournament ID from route */
  private tournamentId: string | null = null;

  /**
   * Initializes component and loads tournament statistics.
   */
  public ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.tournamentId = params.get('id');
      if (this.tournamentId) {
        void this.loadStatistics(this.tournamentId);
      }
    });
  }

  /**
   * Loads tournament statistics.
   *
   * @param tournamentId - ID of the tournament
   */
  private async loadStatistics(tournamentId: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const statistics = await this.statisticsService.getDetailedTournamentStatistics(tournamentId);
      this.statistics.set(statistics);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load tournament statistics';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Navigates back to tournament detail page.
   */
  public goBack(): void {
    if (this.tournamentId) {
      void this.router.navigate(['/tournaments', this.tournamentId]);
    } else {
      void this.router.navigate(['/tournaments']);
    }
  }

  /**
   * Checks if current user is an admin (for export functionality).
   *
   * @returns True if user has admin privileges
   */
  public isAdmin(): boolean {
    const user = this.authStateService.getCurrentUser();
    return user?.role === 'SYSTEM_ADMIN' || user?.role === 'TOURNAMENT_ADMIN';
  }

  /**
   * Exports tournament statistics to PDF format.
   */
  public async exportToPDF(): Promise<void> {
    if (!this.isAdmin()) {
      alert('Export functionality is only available for administrators');
      return;
    }

    const stats = this.statistics();
    if (!stats) {
      alert('No statistics available to export');
      return;
    }

    try {
      const result = await this.exportService.exportTournamentStatistics(
        stats,
        ExportFormat.PDF
      );

      if (result.success) {
        this.exportService.downloadExportResult(result);
      } else {
        alert(`Failed to export statistics: ${result.error || 'Unknown error'}`);
        console.error('Export error details:', result.errorDetails);
      }
    } catch (error) {
      alert('Failed to export statistics');
      console.error(error);
    }
  }

  /**
   * Exports tournament statistics to Excel format.
   */
  public async exportToExcel(): Promise<void> {
    if (!this.isAdmin()) {
      alert('Export functionality is only available for administrators');
      return;
    }

    const stats = this.statistics();
    if (!stats) {
      alert('No statistics available to export');
      return;
    }

    try {
      const result = await this.exportService.exportTournamentStatistics(
        stats,
        ExportFormat.EXCEL
      );

      if (result.success) {
        this.exportService.downloadExportResult(result);
      } else {
        alert(`Failed to export statistics: ${result.error || 'Unknown error'}`);
        console.error('Export error details:', result.errorDetails);
      }
    } catch (error) {
      alert('Failed to export statistics');
      console.error(error);
    }
  }

  /**
   * Calculates completion percentage.
   *
   * @returns Percentage of completed matches
   */
  public getCompletionPercentage(): number {
    const stats = this.statistics();
    if (!stats || stats.totalMatches === 0) return 0;
    return (stats.completedMatches / stats.totalMatches) * 100;
  }
}
