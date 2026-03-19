/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 19, 2026
 * @file presentation/pages/tournaments/tournament-create/tournament-create.component.ts
 * @desc Component for creating new tournaments with a comprehensive form.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, signal, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {TournamentService} from '@application/services';
import {type CreateTournamentDto} from '@application/dto';
import {Surface} from '@domain/enumerations/surface';
import {AcceptanceType} from '@domain/enumerations/acceptance-type';
import {RankingSystem} from '@domain/enumerations/ranking-system';
import {AuthStateService} from '@presentation/services/auth-state.service';
import templateHtml from './tournament-create.component.html?raw';

/**
 * TournamentCreateComponent provides a form for creating new tournaments.
 * Allows organizers to input tournament details, dates, and registration settings.
 */
@Component({
  selector: 'app-tournament-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: templateHtml,
  styles: [],
})
export class TournamentCreateComponent {
  /** Services - inject() must be called before other properties */
  private readonly tournamentService = inject(TournamentService);
  private readonly router = inject(Router);
  private readonly authStateService = inject(AuthStateService);

  /** Form data - dates are strings from HTML inputs, converted to Date on submit */
  public formData: Omit<CreateTournamentDto, 'startDate' | 'endDate' | 'registrationOpenDate' | 'registrationCloseDate'> & {
    startDate: string;
    endDate: string;
    registrationOpenDate?: string;
    registrationCloseDate?: string;
  } = {
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    surface: Surface.HARD,
    maxParticipants: 32,
    registrationFee: 0,
    currency: 'EUR',
    acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
    rankingSystem: RankingSystem.POINTS_BASED,
    registrationOpenDate: '',
    registrationCloseDate: '',
  };

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

  /**
   * Handles form submission.
   * Creates the tournament and navigates to the tournament list on success.
   */
  public async onSubmit(): Promise<void> {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      // Get current user ID
      const currentUser = this.authStateService.getCurrentUser();
      if (!currentUser) {
        throw new Error('You must be logged in to create a tournament');
      }

      // Prepare the DTO with proper date conversions
      const createDto: CreateTournamentDto = {
        name: this.formData.name,
        description: this.formData.description || undefined,
        startDate: new Date(this.formData.startDate),
        endDate: new Date(this.formData.endDate),
        location: this.formData.location,
        surface: this.formData.surface,
        maxParticipants: Number(this.formData.maxParticipants),
        registrationFee: this.formData.registrationFee ? Number(this.formData.registrationFee) : 0,
        currency: this.formData.currency || 'EUR',
        acceptanceType: this.formData.acceptanceType,
        rankingSystem: this.formData.rankingSystem,
        registrationOpenDate: this.formData.registrationOpenDate
          ? new Date(this.formData.registrationOpenDate)
          : undefined,
        registrationCloseDate: this.formData.registrationCloseDate
          ? new Date(this.formData.registrationCloseDate)
          : undefined,
      };

      // Create the tournament
      await this.tournamentService.createTournament(
        createDto,
        currentUser.id,
      );

      // Navigate back to the tournament list to show the new tournament
      void this.router.navigate(['/tournaments']);
    } catch (error: unknown) {
      console.error('Error creating tournament:', error);
      
      if (error instanceof Error) {
        this.errorMessage.set(error.message);
      } else {
        this.errorMessage.set('Failed to create tournament. Please try again.');
      }
      
      this.isSubmitting.set(false);
    }
  }

  /**
   * Navigates back to the tournament list.
   */
  public goBack(): void {
    void this.router.navigate(['/tournaments']);
  }
}
