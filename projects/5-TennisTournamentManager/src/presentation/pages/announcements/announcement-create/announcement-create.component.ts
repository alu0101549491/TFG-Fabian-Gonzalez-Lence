/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 7, 2026
 * @file src/presentation/pages/announcements/announcement-create/announcement-create.component.ts
 * @desc Component for creating tournament announcements (FR47-FR49).
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
import templateHtml from './announcement-create.component.html?raw';
import styles from './announcement-create.component.css?inline';

/**
 * Component for creating tournament announcements.
 */
@Component({
  selector: 'app-announcement-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: templateHtml,
  styles: [styles],
})
export class AnnouncementCreateComponent implements OnInit {
  /** Services */
  private readonly announcementService = inject(AnnouncementService);
  private readonly tournamentService = inject(TournamentService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

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

  /** Image preview URL */
  public imagePreview = signal<string | null>(null);

  /** Link text for external link */
  public linkText = signal('');

  /** Loading state */
  public isSubmitting = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** Tournament name for display */
  public tournamentName = signal<string>('');

  /** Available tournaments */
  public tournaments = signal<TournamentDto[]>([]);

  /** Loading tournaments */
  public isLoadingTournaments = signal(false);

  /**
   * Initializes component.
   */
  public async ngOnInit(): Promise<void> {
    const tournamentId = this.route.snapshot.queryParams['tournamentId'];
    
    // Require tournamentId - redirect to tournaments if missing
    if (!tournamentId) {
      console.warn('No tournamentId provided, redirecting to tournaments');
      this.errorMessage.set('Tournament ID is required to create announcements');
      void this.router.navigate(['/tournaments']);
      return;
    }
    
    this.formData.update(data => ({...data, tournamentId}));
    await this.loadTournaments();
  }

  /**
   * Loads available tournaments.
   */
  private async loadTournaments(): Promise<void> {
    this.isLoadingTournaments.set(true);
    try {
      const tournamentsList = await this.tournamentService.getActiveTournaments();
      this.tournaments.set(tournamentsList);
    } catch (error) {
      console.error('Error loading tournaments:', error);
      this.errorMessage.set('Failed to load tournaments');
    } finally {
      this.isLoadingTournaments.set(false);
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

    if (!data.tournamentId) {
      this.errorMessage.set('Tournament is required');
      return;
    }

    this.isSubmitting.set(true);

    try {
      const payload: CreateAnnouncementDto = {
        ...data,
        tags: this.selectedTags(),
        linkText: this.linkText() || undefined,
      };

      console.log('Creating announcement with payload:', payload);
      const created = await this.announcementService.create(payload).toPromise();
      console.log('Announcement created successfully:', created);
      
      // Navigate back to announcements list
      await this.router.navigate(['/announcements'], {
        queryParams: {tournamentId: data.tournamentId, refresh: Date.now()},
      });
    } catch (error: any) {
      console.error('Error creating announcement:', error);
      this.errorMessage.set(error?.error?.message || 'Failed to create announcement');
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
   * Handles image file selection and preview.
   *
   * @param event - File input change event
   */
  public onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) {
      this.imagePreview.set(null);
      this.updateField('imageUrl', '');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.errorMessage.set('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.errorMessage.set('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      this.imagePreview.set(dataUrl);
      // In a real implementation, you would upload to a server/CDN
      // For now, we'll store the data URL (not recommended for production)
      this.updateField('imageUrl', dataUrl);
    };
    reader.readAsDataURL(file);
  }

  /**
   * Clears selected image.
   */
  public clearImage(): void {
    this.imagePreview.set(null);
    this.updateField('imageUrl', '');
    // Reset file input
    const fileInput = document.getElementById('imageFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Handles external link URL change.
   *
   * @param event - Input event
   */
  public onLinkUrlChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.updateField('externalLink', value);
  }

  /**
   * Updates link text.
   *
   * @param text - Link display text
   */
  public updateLinkText(text: string): void {
    this.linkText.set(text);
  }

  /**
   * Cancels creation and navigates back.
   */
  public cancel(): void {
    const tournamentId = this.formData().tournamentId;
    void this.router.navigate(['/announcements'], {
      queryParams: tournamentId ? {tournamentId} : {},
    });
  }

  /**
   * Navigates back to announcements list.
   */
  public goBack(): void {
    void this.router.navigate(['/announcements']);
  }
}
