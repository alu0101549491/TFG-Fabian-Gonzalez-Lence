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
import {FacilityType} from '@domain/enumerations/facility-type';
import {TournamentType} from '@domain/enumerations/tournament-type';
import {RankingSystem} from '@domain/enumerations/ranking-system';
import {AuthStateService} from '@presentation/services/auth-state.service';
import {EnumFormatPipe} from '@shared/pipes';
import templateHtml from './tournament-create.component.html?raw';
import styles from './tournament-create.component.css?inline';

/**
 * TournamentCreateComponent provides a form for creating new tournaments.
 * Allows organizers to input tournament details, dates, and registration settings.
 */
@Component({
  selector: 'app-tournament-create',
  standalone: true,
  imports: [CommonModule, FormsModule, EnumFormatPipe],
  template: templateHtml,
  styles: [styles],
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
    facilityType: FacilityType.OUTDOOR,
    regulations: '',
    primaryColor: '#2563eb',
    secondaryColor: '#10b981',
    logoUrl: '',
    tournamentType: TournamentType.SINGLES,
    maxParticipants: 32,
    registrationFee: 0,
    currency: 'EUR',
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

  /** Available facility types */
  public readonly facilityTypes = Object.values(FacilityType);

  /** Available tournament types */
  public readonly tournamentTypes = Object.values(TournamentType);

  /** Available ranking systems */
  public readonly rankingSystems = Object.values(RankingSystem);

  /**
   * Validates date ranges to ensure logical consistency.
   *
   * @returns Error message if validation fails, null if valid
   */
  public validateDates(): string | null {
    const {startDate, endDate, registrationOpenDate, registrationCloseDate} = this.formData;

    // Check if end date is before start date
    if (startDate && endDate && endDate < startDate) {
      return 'End date cannot be before start date';
    }

    // Check if registration close is before registration open
    if (registrationOpenDate && registrationCloseDate && registrationCloseDate < registrationOpenDate) {
      return 'Registration close date cannot be before registration open date';
    }

    // Check if registration dates overlap with tournament dates
    if (registrationOpenDate && startDate && registrationOpenDate >= startDate) {
      return 'Registration must open before the tournament starts';
    }

    if (registrationCloseDate && startDate && registrationCloseDate > startDate) {
      return 'Registration must close before or on the tournament start date';
    }

    return null;
  }

  /**
   * Handles form submission.
   * Creates the tournament and navigates to the tournament list on success.
   */
  public async onSubmit(): Promise<void> {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      // Validate dates
      const dateValidationError = this.validateDates();
      if (dateValidationError) {
        this.errorMessage.set(dateValidationError);
        this.isSubmitting.set(false);
        return;
      }

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
        tournamentType: this.formData.tournamentType,
        maxParticipants: Number(this.formData.maxParticipants),
        registrationFee: this.formData.registrationFee ? Number(this.formData.registrationFee) : 0,
        currency: this.formData.currency || 'EUR',
        rankingSystem: this.formData.rankingSystem,
        regulations: this.formData.regulations?.trim() || undefined,
        primaryColor: this.formData.primaryColor,
        secondaryColor: this.formData.secondaryColor,
        logoUrl: this.formData.logoUrl?.trim() || undefined,
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
      
      // Extract error message from Axios error response or use generic message
      let message = 'Failed to create tournament. Please try again.';
      
      if (error && typeof error === 'object') {
        const axiosError = error as {response?: {data?: {message?: string; error?: string}}};
        if (axiosError.response?.data?.message) {
          message = axiosError.response.data.message;
        } else if (axiosError.response?.data?.error) {
          message = axiosError.response.data.error;
        } else if (error instanceof Error) {
          message = error.message;
        }
      }
      
      this.errorMessage.set(message);
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
