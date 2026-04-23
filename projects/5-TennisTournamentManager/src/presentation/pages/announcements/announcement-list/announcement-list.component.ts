/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file src/presentation/pages/announcements/announcement-list/announcement-list.component.ts
 * @desc Public announcements board for tournament-wide communications (FR47-FR49).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Component, OnInit, signal, inject, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, RouterModule, Router} from '@angular/router';
import {AnnouncementService} from '@application/services/announcement.service';
import {TournamentService} from '@application/services';
import {AuthStateService, TournamentStateService} from '@presentation/services';
import {type AnnouncementDto, type TournamentDto} from '@application/dto';
import {UserRole} from '@domain/enumerations/user-role';
import {AnnouncementType} from '@domain/enumerations/announcement-type';
import templateHtml from './announcement-list.component.html?raw';
import styles from './announcement-list.component.css?inline';

/**
 * AnnouncementListComponent displays tournament announcements with filtering and search.
 */
@Component({
  selector: 'app-announcement-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: templateHtml,
  styles: [styles],
})
export class AnnouncementListComponent implements OnInit {
  /** Services */
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly announcementService = inject(AnnouncementService);
  private readonly tournamentService = inject(TournamentService);
  private readonly authStateService = inject(AuthStateService);
  protected readonly tournamentStateService = inject(TournamentStateService);

  /** All announcements */
  private allAnnouncements = signal<AnnouncementDto[]>([]);

  /** Filtered announcements */
  public announcements = computed(() => {
    let filtered = this.allAnnouncements();

    // Filter by selected tags
    const tags = this.selectedTags();
    if (tags.length > 0) {
      filtered = filtered.filter(a => 
        a.tags && a.tags.some(tag => tags.includes(tag))
      );
    }

    // Filter by search query
    const search = this.searchQuery().toLowerCase();
    if (search) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(search) ||
        (a.summary && a.summary.toLowerCase().includes(search)) ||
        (a.longText && a.longText.toLowerCase().includes(search)) ||
        (a.content && a.content.toLowerCase().includes(search))
      );
    }

    return filtered;
  });

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** Search query */
  public searchQuery = signal('');

  /** Selected tags filter */
  public selectedTags = signal<string[]>([]);

  /** Available tags (from all announcements) */
  public availableTags = computed(() => {
    const tagSet = new Set<string>();
    this.allAnnouncements().forEach(a => {
      if (a.tags) {
        a.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  });

  /** Current user */
  private currentUser = signal(this.authStateService.getCurrentUser());

  /** Check if user is admin */
  public isAdmin = computed(() => {
    const user = this.currentUser();
    return user && (user.role === UserRole.SYSTEM_ADMIN || user.role === UserRole.TOURNAMENT_ADMIN);
  });

  /** Tournament ID filter */
  public tournamentId = signal<string | null>(null);

  /** Tournament data */
  public tournament = signal<TournamentDto | null>(null);

  /** Announcement ID to open automatically after loading, if requested. */
  private announcementId = signal<string | null>(null);

  /** Show announcement details modal */
  public showDetailsModal = signal(false);

  /** Selected announcement for details view */
  public selectedAnnouncement = signal<AnnouncementDto | null>(null);

  /**
   * Initializes component and loads announcements.
   */
  public ngOnInit(): void {
    console.log('AnnouncementList ngOnInit called');
    this.route.queryParamMap.subscribe((params: any) => {
      const tournamentId = params.get('tournamentId');
      const announcementId = params.get('id');
      console.log('Query params changed, tournamentId:', tournamentId);

      this.tournamentId.set(tournamentId);
      this.announcementId.set(announcementId);
      void this.loadAnnouncements();
    });
  }

  /**
   * Loads announcements with optional filters.
   */
  private async loadAnnouncements(): Promise<void> {
    console.log('Loading announcements with tournamentId:', this.tournamentId());
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      // Load tournament data if tournamentId is present
      const tournamentId = this.tournamentId();
      if (tournamentId) {
        try {
          const tournamentData = await this.tournamentService.getTournamentById(tournamentId);
          this.tournament.set(tournamentData);
          this.tournamentStateService.setCurrentTournament(tournamentData);
        } catch (tournamentError) {
          console.warn('Could not load tournament data:', tournamentError);
          // Continue loading announcements even if tournament load fails
        }
      } else {
        this.tournament.set(null);
        this.tournamentStateService.clearCurrentTournament();
      }

      const filters: any = {};
      if (tournamentId) {
        filters.tournamentId = tournamentId;
      }

      console.log('Calling announcementService.getAll with filters:', filters);
      const announcements = await this.announcementService.getAll(filters).toPromise();
      console.log('Announcements loaded:', announcements);
      this.allAnnouncements.set(announcements || []);

      const requestedAnnouncementId = this.announcementId();
      if (requestedAnnouncementId) {
        const selectedAnnouncement = (announcements || []).find(
          (announcement) => announcement.id === requestedAnnouncementId
        );

        if (selectedAnnouncement) {
          this.openAnnouncementDetails(selectedAnnouncement);
        }
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
      const message = error instanceof Error ? error.message : 'Failed to load announcements';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Toggles tag filter.
   *
   * @param tag - Tag to toggle
   */
  public toggleTag(tag: string): void {
    const current = this.selectedTags();
    if (current.includes(tag)) {
      this.selectedTags.set(current.filter(t => t !== tag));
    } else {
      this.selectedTags.set([...current, tag]);
    }
  }

  /**
   * Clears all filters.
   */
  public clearFilters(): void {
    this.searchQuery.set('');
    this.selectedTags.set([]);
  }

  /**
   * Navigates to create announcement page.
   */
  public createAnnouncement(): void {
    const params = this.tournamentId() ? {tournamentId: this.tournamentId()} : {};
    void this.router.navigate(['/announcements/create'], {queryParams: params});
  }

  /**
   * Navigates to edit announcement page.
   *
   * @param id - Announcement ID
   */
  public editAnnouncement(id: string): void {
    void this.router.navigate(['/announcements/edit', id]);
  }

  /**
   * Navigates back to previous page.
   * If viewing tournament-specific announcements, navigate to tournament details.
   * Otherwise, navigate to home.
   */
  public goBack(): void {
    const tournamentId = this.tournamentId();
    if (tournamentId) {
      void this.router.navigate(['/tournaments', tournamentId]);
    } else {
      void this.router.navigate(['/']);
    }
  }

  /**
   * Deletes an announcement.
   *
   * @param id - Announcement ID
   */
  public async deleteAnnouncement(id: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      await this.announcementService.delete(id).toPromise();
      await this.loadAnnouncements();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete announcement';
      alert(message);
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
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Gets type badge class.
   *
   * @param type - Announcement type
   * @returns CSS class
   */
  public getTypeBadge(type: AnnouncementType): string {
    return type === AnnouncementType.PUBLIC ? 'badge-public' : 'badge-private';
  }

  /**
   * Gets type label.
   *
   * @param type - Announcement type
   * @returns Label string
   */
  public getTypeLabel(type: AnnouncementType): string {
    return type === AnnouncementType.PUBLIC ? 'Public' : 'Private';
  }

  /**
   * Opens announcement details modal.
   *
   * @param announcement - Announcement to display
   * @param event - Click event (optional, to stop propagation)
   */
  public openAnnouncementDetails(announcement: AnnouncementDto, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedAnnouncement.set(announcement);
    this.showDetailsModal.set(true);
  }

  /**
   * Closes announcement details modal.
   */
  public closeDetailsModal(): void {
    this.showDetailsModal.set(false);
    this.selectedAnnouncement.set(null);
  }

  /**
   * Handles edit button click from modal.
   *
   * @param id - Announcement ID
   * @param event - Click event
   */
  public editAnnouncementFromModal(id: string, event: Event): void {
    event.stopPropagation();
    this.closeDetailsModal();
    this.editAnnouncement(id);
  }

  /**
   * Handles delete button click from modal.
   *
   * @param id - Announcement ID
   * @param event - Click event
   */
  public async deleteAnnouncementFromModal(id: string, event: Event): Promise<void> {
    event.stopPropagation();
    this.closeDetailsModal();
    await this.deleteAnnouncement(id);
  }
}
