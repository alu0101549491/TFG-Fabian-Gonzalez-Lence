/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 7, 2026
 * @file src/presentation/pages/announcements/announcement-edit/announcement-edit.component.ts
 * @desc Component for editing tournament announcements (FR47-FR49).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Component, OnInit, signal, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router, ActivatedRoute, RouterModule} from '@angular/router';
import {AnnouncementService} from '@application/services/announcement.service';
import {TournamentService} from '@application/services/tournament.service';
import {CreateAnnouncementDto, TournamentDto} from '@application/dto';
import {AnnouncementType} from '@domain/enumerations/announcement-type';
import templateHtml from './announcement-edit.component.html?raw';
import styles from './announcement-edit.component.css?inline';

/**
 * Component for editing tournament announcements.
 */
@Component({
  selector: 'app-announcement-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: templateHtml,
  styles: [styles],
})
export class AnnouncementEditComponent implements OnInit {
  /** Services */
  private readonly announcementService = inject(AnnouncementService);
  private readonly tournamentService = inject(TournamentService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Announcement ID */
  private announcementId = signal<string>('');

  /** Form data */
  public formData = signal<CreateAnnouncementDto>({
    tournamentId: '',
    type: AnnouncementType.PUBLIC,
    title: '',
    summary: '',
    longText: '',
    tags: [],
    isPinned: false,
    scheduledPublishAt: undefined,
    expirationDate: undefined,
  });

  /** Available announcement types */
  public readonly announcementTypes = Object.values(AnnouncementType);

  /** Common tag options */
  public readonly commonTags = [
    'draw',
    'order-of-play',
    'results',
    'general',
    'schedule',
    'registration',
    'cancellation',
  ];

  /** Selected tags */
  public selectedTags = signal<string[]>([]);

  /** Custom tag input */
  public customTag = signal('');

  /** Loading state */
  public isLoading = signal(true);

  /** Submitting state */
  public isSubmitting = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** Available tournaments */
  public tournaments = signal<TournamentDto[]>([]);

  /** Tournament name */
  public tournamentName = signal<string>('');

  /**
   * Initializes component and loads announcement data.
   */
  public async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.params['id'];
    if (!id) {
      void this.router.navigate(['/tournaments']);
      return;
    }

    this.announcementId.set(id);
    await this.loadTournaments();
    await this.loadAnnouncement(id);
  }

  /**
   * Loads available tournaments.
   */
  private async loadTournaments(): Promise<void> {
    try {
      const tournamentsList = await this.tournamentService.getActiveTournaments();
      this.tournaments.set(tournamentsList);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    }
  }

  /**
   * Loads announcement data.
   *
   * @param id - Announcement ID
   */
  private async loadAnnouncement(id: string): Promise<void> {
    try {
      const announcement = await this.announcementService.getById(id).toPromise();
      if (!announcement) {
        this.errorMessage.set('Announcement not found');
        return;
      }

      this.formData.set({
        tournamentId: announcement.tournamentId,
        type: announcement.type,
        title: announcement.title,
        summary: announcement.summary || '',
        longText: announcement.longText || '',
        tags: announcement.tags || [],
        isPinned: announcement.isPinned,
        scheduledPublishAt: announcement.scheduledPublishAt ? new Date(announcement.scheduledPublishAt) : undefined,
        expirationDate: announcement.expirationDate ? new Date(announcement.expirationDate) : undefined,
      });

      this.selectedTags.set(announcement.tags || []);
    } catch (error: any) {
      console.error('Error loading announcement:', error);
      this.errorMessage.set(error?.error?.message || 'Failed to load announcement');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Toggles tag selection.
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
   * Adds custom tag.
   */
  public addCustomTag(): void {
    const tag = this.customTag().trim().toLowerCase();
    if (tag && !this.selectedTags().includes(tag)) {
      this.selectedTags.update(tags => [...tags, tag]);
      this.customTag.set('');
    }
  }

  /**
   * Removes tag from selection.
   *
   * @param tag - Tag to remove
   */
  public removeTag(tag: string): void {
    this.selectedTags.update(tags => tags.filter(t => t !== tag));
  }

  /**
   * Handles form submission.
   */
  public async onSubmit(): Promise<void> {
    this.errorMessage.set(null);

    // Validation
    const data = this.formData();
    if (!data.title.trim()) {
      this.errorMessage.set('Title is required');
      return;
    }

    this.isSubmitting.set(true);

    try {
      const payload: any = {
        ...data,
        tags: this.selectedTags(),
      };

      console.log('Updating announcement with payload:', payload);
      console.log('Announcement ID:', this.announcementId());
      
      const updated = await this.announcementService.update(this.announcementId(), payload).toPromise();
      console.log('Announcement updated successfully:', updated);
      
      // Navigate back to announcements list with refresh token to force reload
      await this.router.navigate(['/announcements'], {
        queryParams: {tournamentId: data.tournamentId, refresh: Date.now()},
      });
    } catch (error: any) {
      console.error('Error updating announcement:', error);
      this.errorMessage.set(error?.error?.message || 'Failed to update announcement');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /**
   * Updates form field.
   *
   * @param field - Field name
   * @param value - New value
   */
  public updateField(field: keyof CreateAnnouncementDto, value: any): void {
    this.formData.update(data => ({...data, [field]: value}));
  }

  /**
   * Handles scheduled publish date input.
   *
   * @param event - Input event
   */
  public onScheduledPublishAtChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.updateField('scheduledPublishAt', value ? new Date(value) : undefined);
  }

  /**
   * Handles expiration date input.
   *
   * @param event - Input event
   */
  public onExpirationDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.updateField('expirationDate', value ? new Date(value) : undefined);
  }

  /**
   * Formats Date object to datetime-local input format (yyyy-MM-ddThh:mm).
   *
   * @param date - Date to format
   * @returns Formatted string or empty string if date is undefined
   */
  public formatDateForInput(date: Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  /**
   * Gets formatted scheduled publish date for input.
   *
   * @returns Formatted date string
   */
  public getScheduledPublishAt(): string {
    return this.formatDateForInput(this.formData().scheduledPublishAt);
  }

  /**
   * Gets formatted expiration date for input.
   *
   * @returns Formatted date string
   */
  public getExpirationDate(): string {
    return this.formatDateForInput(this.formData().expirationDate);
  }

  /**
   * Cancels editing and navigates back.
   */
  public cancel(): void {
    void this.router.navigate(['/announcements']);
  }

  /**
   * Navigates back to announcements list.
   */
  public goBack(): void {
    void this.router.navigate(['/announcements']);
  }
}
