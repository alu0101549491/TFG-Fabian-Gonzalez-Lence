/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 19, 2026
 * @file presentation/pages/tournaments/tournament-edit/tournament-edit.component.ts
 * @desc Component for editing existing tournaments with authorization checks.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, OnInit, signal, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {TournamentService} from '@application/services';
import {type UpdateTournamentDto} from '@application/dto';
import {Surface} from '@domain/enumerations/surface';
import {AcceptanceType} from '@domain/enumerations/acceptance-type';
import {RankingSystem} from '@domain/enumerations/ranking-system';
import {TournamentStatus} from '@domain/enumerations/tournament-status';
import {AuthStateService} from '@presentation/services/auth-state.service';
import templateHtml from './tournament-edit.component.html?raw';
import styles from './tournament-edit.component.css?inline';

/**
 * TournamentEditComponent provides a form for editing existing tournaments.
 * Allows organizers to modify tournament details, dates, and registration settings.
 */
@Component({
  selector: 'app-tournament-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: templateHtml,
  styles: [styles],
})
export class TournamentEditComponent implements OnInit {
  /** Services - inject() must be called before other properties */
  private readonly tournamentService = inject(TournamentService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authStateService = inject(AuthStateService);

  /** Tournament ID from route */
  private tournamentId: string | null = null;

  /** Form data -dates are strings from HTML inputs, converted to Date on submit */
  public formData: Omit<UpdateTournamentDto, 'id' | 'startDate' | 'endDate'> & {
    startDate: string;
    endDate: string;
  } = {
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    surface: Surface.HARD,
    maxParticipants: 32,
    registrationFee: 0,
    acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
    rankingSystem: RankingSystem.POINTS_BASED,
    status: TournamentStatus.DRAFT,
  };

  /** Loading state */
  public isLoading = signal(true);

  /** Submitting state */
  public isSubmitting = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** Available surfaces */
  public readonly surfaces = Object.values(Surface);

  /** Available acceptance types */
  public readonly acceptanceTypes = Object.values(AcceptanceType);

  /** Available ranking systems */
  public readonly rankingSystems = Object.values(RankingSystem);

  /** Available tournament statuses */
  public readonly tournamentStatuses = Object.values(TournamentStatus);

  /**
   * Initializes component and loads tournament data.
   */
  public ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.tournamentId = params.get('id');
      if (this.tournamentId) {
        void this.loadTournament();
      }
    });
  }

  /**
   * Loads tournament data for editing.
   */
  private async loadTournament(): Promise<void> {
    if (!this.tournamentId) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const tournament = await this.tournamentService.getTournamentById(this.tournamentId);
      
      // Convert Date objects to ISO string format for date inputs
      this.formData = {
        name: tournament.name,
        description: tournament.description || '',
        startDate: this.formatDateForInput(tournament.startDate),
        endDate: this.formatDateForInput(tournament.endDate),
        location: tournament.location,
        surface: tournament.surface,
        maxParticipants: tournament.maxParticipants,
        registrationFee: tournament.registrationFee,
        acceptanceType: tournament.acceptanceType,
        rankingSystem: tournament.rankingSystem,
        status: tournament.status,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load tournament';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Formats a date for HTML date input (YYYY-MM-DD).
   *
   * @param date - Date to format
   * @returns Formatted date string
   */
  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Handles form submission.
   * Updates the tournament and navigates back to the tournament detail page on success.
   */
  public async onSubmit(): Promise<void> {
    if (!this.tournamentId) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      // Get current user ID
      const currentUser = this.authStateService.getCurrentUser();
      if (!currentUser) {
        throw new Error('You must be logged in to edit a tournament');
      }

      // Prepare the DTO with proper date conversions
      const updateDto: UpdateTournamentDto = {
        id: this.tournamentId,
        name: this.formData.name,
        description: this.formData.description || undefined,
        startDate: new Date(this.formData.startDate),
        endDate: new Date(this.formData.endDate),
        location: this.formData.location,
        surface: this.formData.surface,
        maxParticipants: Number(this.formData.maxParticipants),
        registrationFee: this.formData.registrationFee ? Number(this.formData.registrationFee) : 0,
        acceptanceType: this.formData.acceptanceType,
        rankingSystem: this.formData.rankingSystem,
        status: this.formData.status,
      };

      // Update the tournament
      await this.tournamentService.updateTournament(updateDto, currentUser.id);

      // Navigate back to the tournament detail page with skipLocationChange to force reload
      await this.router.navigate(['/tournaments', this.tournamentId], {
        queryParams: { _t: Date.now() } // Cache-busting timestamp
      });
    } catch (error: unknown) {
      console.error('Error updating tournament:', error);
      
      if (error instanceof Error) {
        this.errorMessage.set(error.message);
      } else {
        this.errorMessage.set('Failed to update tournament. Please try again.');
      }
      
      this.isSubmitting.set(false);
    }
  }

  /**
   * Navigates back to the tournament detail page.
   */
  public goBack(): void {
    if (this.tournamentId) {
      void this.router.navigate(['/tournaments', this.tournamentId]);
    } else {
      void this.router.navigate(['/tournaments']);
    }
  }
}
