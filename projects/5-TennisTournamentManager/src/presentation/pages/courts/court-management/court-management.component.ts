/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 23, 2026
 * @file src/presentation/pages/courts/court-management/court-management.component.ts
 * @desc Component for managing tournament courts (CRUD operations for court names and hours).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Component, OnInit, AfterViewInit, inject, signal, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {CourtRepositoryImpl} from '@infrastructure/repositories/court.repository';
import {TournamentService} from '@application/services/tournament.service';
import {AuthStateService, TournamentStateService} from '@presentation/services';
import {type TournamentDto} from '@application/dto';
import {Court} from '@domain/entities/court';
import {EnumFormatPipe} from '@shared/pipes';
import templateHtml from './court-management.component.html?raw';
import styles from './court-management.component.css?raw';

/**
 * Form data for creating or editing a court.
 */
interface CourtForm {
  /** Display name of the court */
  name: string;
  /** Court opening time in HH:MM format */
  openingTime: string;
  /** Court closing time in HH:MM format */
  closingTime: string;
}

/**
 * Court Management Component for tournament administrators.
 *
 * Provides a full CRUD interface for managing courts within a tournament:
 * - View list of all courts with their details
 * - Add new courts with name and operating hours
 * - Edit existing court names and hours
 * - Delete courts (with confirmation)
 *
 * **Access**: TOURNAMENT_ADMIN, SYSTEM_ADMIN only
 *
 * @example
 * Route: /tournaments/:tournamentId/courts
 */
@Component({
  selector: 'app-court-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, EnumFormatPipe],
  template: templateHtml,
  styles: [styles],
})
export class CourtManagementComponent implements OnInit, AfterViewInit {
  private readonly courtRepository = inject(CourtRepositoryImpl);
  private readonly tournamentService = inject(TournamentService);
  private readonly authStateService = inject(AuthStateService);
  public readonly tournamentStateService = inject(TournamentStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** The tournament ID extracted from the route */
  public readonly tournamentId = signal<string>('');

  /** The tournament data */
  public readonly tournament = signal<TournamentDto | null>(null);

  /** List of courts for the tournament */
  public readonly courts = signal<Court[]>([]);

  /** Loading state for initial data fetch */
  public readonly isLoading = signal<boolean>(true);

  /** Error message for display */
  public readonly error = signal<string | null>(null);

  /** Success message after an operation */
  public readonly successMessage = signal<string | null>(null);

  /** Whether the "Add Court" form is visible */
  public readonly showAddForm = signal<boolean>(false);

  /** The court currently being edited (null = not editing) */
  public readonly editingCourtId = signal<string | null>(null);

  /** Loading state for add/edit operations */
  public readonly isSubmitting = signal<boolean>(false);

  /** Form data for adding a new court */
  public addCourtForm: CourtForm = {
    name: '',
    openingTime: '',
    closingTime: '',
  };

  /** Form data for editing an existing court (keyed by court ID) */
  public editCourtForms: Map<string, CourtForm> = new Map();

  /** Computed: number of courts */
  public readonly courtCount = computed(() => this.courts().length);

  /** @inheritdoc */
  public async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('tournamentId');
    if (!id) {
      void this.router.navigate(['/tournaments']);
      return;
    }
    this.tournamentId.set(id);
    await this.loadData();
  }

  /**
   * @inheritdoc
   * Resets scroll position to top after view initialization to ensure back button is visible.
   */
  public ngAfterViewInit(): void {
    // Use setTimeout to ensure this runs after Angular's router scroll restoration
    setTimeout(() => {
      window.scrollTo({top: 0, behavior: 'instant'});
    }, 0);
  }

  /**
   * Loads tournament and courts data.
   */
  private async loadData(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const [tournament, courts] = await Promise.all([
        this.tournamentService.getTournamentById(this.tournamentId()),
        this.courtRepository.findByTournamentId(this.tournamentId()),
      ]);

      this.tournament.set(tournament);
      this.courts.set(courts);

      if (tournament) {
        this.tournamentStateService.setCurrentTournament(tournament);
      }
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Toggles visibility of the "Add Court" form.
   * Resets form data each time it opens.
   */
  public toggleAddForm(): void {
    const isVisible = !this.showAddForm();
    if (isVisible) {
      this.addCourtForm = {name: '', openingTime: '', closingTime: ''};
    }
    this.showAddForm.set(isVisible);
    this.clearMessages();
  }

  /**
   * Submits the add-court form.
   */
  public async submitAddCourt(): Promise<void> {
    const {name, openingTime, closingTime} = this.addCourtForm;

    if (!name.trim()) {
      this.error.set('Court name is required.');
      return;
    }

    if (!this.validateTimes(openingTime, closingTime)) return;

    this.isSubmitting.set(true);
    this.clearMessages();

    try {
      const user = this.authStateService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      // POST to /api/courts via repository
      const created = await this.courtRepository.save(
        new Court({
          id: '',
          tournamentId: this.tournamentId(),
          name: name.trim(),
          surface: this.tournament()!.surface as import('@domain/enumerations/surface').Surface,
          isAvailable: true,
          openingTime: openingTime || null,
          closingTime: closingTime || null,
        })
      );

      this.courts.update(list => [...list, created]);
      this.showAddForm.set(false);
      this.addCourtForm = {name: '', openingTime: '', closingTime: ''};
      this.successMessage.set(`Court "${created.name}" added successfully.`);
      this.scheduleMessageClear();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to add court');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /**
   * Opens the inline edit form for a court.
   *
   * @param court - The court to edit
   */
  public startEditing(court: Court): void {
    this.editingCourtId.set(court.id);
    this.editCourtForms.set(court.id, {
      name: court.name,
      openingTime: court.openingTime ?? '',
      closingTime: court.closingTime ?? '',
    });
    this.clearMessages();
  }

  /**
   * Cancels the inline edit for a court.
   *
   * @param courtId - The court ID to stop editing
   */
  public cancelEditing(courtId: string): void {
    this.editingCourtId.set(null);
    this.editCourtForms.delete(courtId);
  }

  /**
   * Submits the edit form for a court.
   *
   * @param court - The original court being edited
   */
  public async submitEditCourt(court: Court): Promise<void> {
    const form = this.editCourtForms.get(court.id);
    if (!form) return;

    const {name, openingTime, closingTime} = form;

    if (!name.trim()) {
      this.error.set('Court name is required.');
      return;
    }

    if (!this.validateTimes(openingTime, closingTime)) return;

    this.isSubmitting.set(true);
    this.clearMessages();

    try {
      const updated = await this.courtRepository.update(
        new Court({
          id: court.id,
          tournamentId: court.tournamentId,
          name: name.trim(),
          surface: court.surface,
          isIndoor: court.isIndoor,
          capacity: court.capacity,
          availableSlots: court.availableSlots,
          isAvailable: court.isAvailable,
          openingTime: openingTime || null,
          closingTime: closingTime || null,
        })
      );

      this.courts.update(list =>
        list.map(c => (c.id === court.id ? updated : c))
      );
      this.editingCourtId.set(null);
      this.editCourtForms.delete(court.id);
      this.successMessage.set(`Court "${updated.name}" updated successfully.`);
      this.scheduleMessageClear();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to update court');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /**
   * Deletes a court after user confirmation.
   *
   * @param court - The court to delete
   */
  public async deleteCourt(court: Court): Promise<void> {
    const confirmed = confirm(
      `Are you sure you want to delete court "${court.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    this.clearMessages();

    try {
      await this.courtRepository.delete(court.id);
      this.courts.update(list => list.filter(c => c.id !== court.id));
      this.successMessage.set(`Court "${court.name}" deleted successfully.`);
      this.scheduleMessageClear();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to delete court');
    }
  }

  /**
   * Returns the form data for a court being edited.
   *
   * @param courtId - The court identifier
   * @returns The edit form data or a blank form
   */
  public getEditForm(courtId: string): CourtForm {
    return this.editCourtForms.get(courtId) ?? {name: '', openingTime: '', closingTime: ''};
  }

  /**
   * Formats a time string for display (returns '-' if empty).
   *
   * @param time - Time string in HH:MM format or null
   * @returns Formatted time or '-'
   */
  public formatTime(time: string | null | undefined): string {
    return time ?? '-';
  }

  /**
   * Navigates back to the tournament detail page.
   */
  public goBack(): void {
    void this.router.navigate(['/tournaments', this.tournamentId()]);
  }

  /**
   * Validates opening and closing times are properly formatted and ordered.
   *
   * @param openingTime - The opening time string
   * @param closingTime - The closing time string
   * @returns True if times are valid
   */
  private validateTimes(openingTime: string, closingTime: string): boolean {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

    if (openingTime && !timeRegex.test(openingTime)) {
      this.error.set('Opening time must be in HH:MM format (e.g., 08:00).');
      return false;
    }
    if (closingTime && !timeRegex.test(closingTime)) {
      this.error.set('Closing time must be in HH:MM format (e.g., 22:00).');
      return false;
    }
    if (openingTime && closingTime) {
      const [oh, om] = openingTime.split(':').map(Number);
      const [ch, cm] = closingTime.split(':').map(Number);
      if (ch * 60 + cm <= oh * 60 + om) {
        this.error.set('Closing time must be after opening time.');
        return false;
      }
    }
    return true;
  }

  /**
   * Clears both error and success messages.
   */
  private clearMessages(): void {
    this.error.set(null);
    this.successMessage.set(null);
  }

  /**
   * Clears success message after 4 seconds.
   */
  private scheduleMessageClear(): void {
    setTimeout(() => this.successMessage.set(null), 4000);
  }
}
