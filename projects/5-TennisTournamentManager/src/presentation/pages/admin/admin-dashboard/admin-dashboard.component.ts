/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/pages/admin/admin-dashboard/admin-dashboard.component.ts
 * @desc Administrator dashboard for tournament management, user moderation, and system monitoring.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, OnInit, signal, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {TournamentService} from '@application/services';
import {type TournamentDto} from '@application/dto';
import {AuthStateService} from '@presentation/services/auth-state.service';
import {UserRole} from '@domain/enumerations/user-role';
import {EnumFormatPipe} from '@shared/pipes';
import templateHtml from './admin-dashboard.component.html?raw';

/**
 * AdminDashboardComponent provides administrative oversight and management tools.
 */
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, EnumFormatPipe],
  template: templateHtml,
  styles: [],
})
export class AdminDashboardComponent implements OnInit {
  /** Services */
  private readonly tournamentService = inject(TournamentService);
  private readonly authStateService = inject(AuthStateService);
  private readonly router = inject(Router);

  /** Recent tournaments */
  public recentTournaments = signal<TournamentDto[]>([]);

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** Stats */
  public totalTournaments = signal(0);
  public activeTournaments = signal(0);

  /**
   * Initializes component and verifies admin access.
   */
  public ngOnInit(): void {
    const user = this.authStateService.getCurrentUser();
    if (!user || user.role !== UserRole.ADMIN) {
      void this.router.navigate(['/']);
      return;
    }

    void this.loadDashboardData();
  }

  /**
   * Loads dashboard statistics and data.
   */
  private async loadDashboardData(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const active = await this.tournamentService.getActiveTournaments();
      this.activeTournaments.set(active.length);
      this.recentTournaments.set(active.slice(0, 5));
      
      // Would normally fetch total count from API
      this.totalTournaments.set(active.length);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load dashboard data';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Navigates to tournament management.
   */
  public manageTournaments(): void {
    void this.router.navigate(['/tournaments']);
  }

  /**
   * Navigates to user management.
   */
  public manageUsers(): void {
    // Would navigate to user management page
    alert('User management feature coming soon');
  }

  /**
   * Formats date for display.
   *
   * @param date - Date to format
   * @returns Formatted date string
   */
  public formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
