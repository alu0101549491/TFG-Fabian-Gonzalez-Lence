/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/pages/announcements/announcement-list/announcement-list.component.ts
 * @desc Public announcements board for tournament-wide communications.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {type AnnouncementDto} from '@application/dto';

/**
 * AnnouncementListComponent displays tournament announcements.
 */
@Component({
  selector: 'app-announcement-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './announcement-list.component.html',
  styles: [],
})
export class AnnouncementListComponent implements OnInit {
  /** Announcements list */
  public announcements = signal<AnnouncementDto[]>([]);

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /**
   * Creates an instance of AnnouncementListComponent.
   *
   * @param route - Activated route to get tournament ID
   * @param http - HTTP client for API calls
   */
  public constructor(
    private readonly route: ActivatedRoute,
    private readonly http: HttpClient,
  ) {}

  /**
   * Initializes component and loads announcements.
   */
  public ngOnInit(): void {
    this.route.queryParamMap.subscribe((params: any) => {
      const tournamentId = params.get('tournamentId');
      void this.loadAnnouncements(tournamentId);
    });
  }

  /**
   * Loads announcements, optionally filtered by tournament.
   *
   * @param tournamentId - Optional tournament ID filter
   */
  private async loadAnnouncements(tournamentId: string | null): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      // Using HttpClient directly since there's no AnnouncementService
      const url = tournamentId 
        ? `/api/announcements?tournamentId=${tournamentId}`
        : '/api/announcements';
      
      const announcements = await this.http.get<AnnouncementDto[]>(url).toPromise();
      this.announcements.set(announcements || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load announcements';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Formats date for display.
   *
   * @param date - Date to format
   * @returns Formatted date string
   */
  public formatDate(date: Date | null): string {
    if (!date) return 'Not published';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
