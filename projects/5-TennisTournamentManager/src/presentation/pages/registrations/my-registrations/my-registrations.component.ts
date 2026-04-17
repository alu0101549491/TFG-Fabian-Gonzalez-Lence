/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 30, 2026
 * @file src/presentation/pages/registrations/my-registrations/my-registrations.component.ts
 * @desc Player's registration management page - view and withdraw from tournaments
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Component, OnInit, signal, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {RegistrationService} from '@application/services';
import {type RegistrationDto} from '@application/dto';
import {AuthStateService} from '@presentation/services/auth-state.service';
import {RegistrationStatus} from '@domain/enumerations/registration-status';
import {AcceptanceType} from '@domain/enumerations/acceptance-type';
import {EnumFormatPipe} from '@shared/pipes';
import templateHtml from './my-registrations.component.html?raw';
import styles from './my-registrations.component.css?inline';

/**
 * Interface for registration with tournament details
 */
interface RegistrationWithDetails extends RegistrationDto {
  tournamentName?: string;
  categoryName?: string;
}

/**
 * MyRegistrationsComponent allows players to view and manage their tournament registrations.
 * Players can view their registration status and withdraw from tournaments.
 */
@Component({
  selector: 'app-my-registrations',
  standalone: true,
  imports: [CommonModule, RouterModule, EnumFormatPipe],
  template: templateHtml,
  styles: [styles],
})
export class MyRegistrationsComponent implements OnInit {
  /** Services */
  private readonly registrationService = inject(RegistrationService);
  private readonly authStateService = inject(AuthStateService);
  private readonly router = inject(Router);

  /** User's registrations */
  public registrations = signal<RegistrationWithDetails[]>([]);

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** Withdrawal in progress */
  public isWithdrawing = signal(false);

  /** RegistrationStatus enum for template */
  public  readonly RegistrationStatus = RegistrationStatus;

  /** AcceptanceType enum for template */
  public readonly AcceptanceType = AcceptanceType;

  /**
   * Initializes component and loads user's registrations.
   */
  public ngOnInit(): void {
    void this.loadMyRegistrations();
  }

  /**
   * Loads the current user's registrations.
   */
  private async loadMyRegistrations(): Promise<void> {
    const currentUser = this.authStateService.getCurrentUser();
    if (!currentUser) {
      this.errorMessage.set('You must be logged in to view your registrations');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const registrations = await this.registrationService.getRegistrationsByParticipant(currentUser.id);
      
      // Enrich with tournament and category names
      const enrichedRegistrations: RegistrationWithDetails[] = registrations.map(reg => ({
        ...reg,
        tournamentName: reg.tournament?.name || 'Unknown Tournament',
        categoryName: reg.category?.name || 'Unknown Category',
      }));

      this.registrations.set(enrichedRegistrations);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load registrations';
      this.errorMessage.set(message);
      console.error('Error loading registrations:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Withdraws from a tournament registration.
   *
   * @param registrationId - The registration ID to withdraw
   * @param tournamentName - Tournament name for confirmation message
   * @param categoryName - Category name for confirmation message
   */
  public async withdrawFromTournament(registrationId: string, tournamentName: string, categoryName: string): Promise<void> {
    const confirmed = confirm(
      `Withdraw from ${tournamentName} - ${categoryName}?\n\n` +
      `• Your status will change to WITHDRAWN\n` +
      `• If you're holding a spot, the next alternate may be promoted\n` +
      `• You can re-register later if needed`
    );
    
    if (!confirmed) return;

    const currentUser = this.authStateService.getCurrentUser();
    if (!currentUser) {
      alert('You must be logged in to perform this action');
      return;
    }

    this.isWithdrawing.set(true);

    try {
      await this.registrationService.updateStatus(
        {
          registrationId,
          status: RegistrationStatus.WITHDRAWN,
        },
        currentUser.id
      );

      alert(`✅ Successfully withdrawn from ${tournamentName} - ${categoryName}`);
      
      // Reload registrations to show updated status
      await this.loadMyRegistrations();
    } catch (error) {
      let message = 'Failed to withdraw from tournament.';
      
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
      
      console.error('Withdrawal error:', error);
      alert(`Error: ${message}`);
    } finally {
      this.isWithdrawing.set(false);
    }
  }

  /**
   * Checks if a registration can be withdrawn.
   * Can withdraw if status is PENDING or ACCEPTED.
   *
   * @param registration - The registration to check
   * @returns True if withdrawal is allowed
   */
  public canWithdraw(registration: RegistrationWithDetails): boolean {
    return registration.status === RegistrationStatus.PENDING ||
           registration.status === RegistrationStatus.ACCEPTED;
  }

  /**
   * Gets the CSS class for status badge based on registration status and acceptance type.
   *
   * @param registration - The registration
   * @returns CSS class name for badge styling
   */
  public getStatusBadgeClass(registration: RegistrationWithDetails): string {
    if (registration.status === RegistrationStatus.ACCEPTED) {
      if (registration.acceptanceType === AcceptanceType.ALTERNATE) {
        return 'status-alternate';
      }
      if (registration.acceptanceType === AcceptanceType.LUCKY_LOSER) {
        return 'status-lucky-loser';
      }
      return 'status-accepted';
    }
    
    switch (registration.status) {
      case RegistrationStatus.PENDING:
        return 'status-pending';
      case RegistrationStatus.REJECTED:
        return 'status-rejected';
      case RegistrationStatus.WITHDRAWN:
        return 'status-withdrawn';
      case RegistrationStatus.CANCELLED:
        return 'status-cancelled';
      default:
        return '';
    }
  }

  /**
   * Gets the display text for status badge based on registration status and acceptance type.
   *
   * @param registration - The registration
   * @returns Display text for badge
   */
  public getStatusText(registration: RegistrationWithDetails): string {
    if (registration.status === RegistrationStatus.ACCEPTED) {
      if (registration.acceptanceType === AcceptanceType.ALTERNATE) {
        return 'Alternate';
      }
      if (registration.acceptanceType === AcceptanceType.LUCKY_LOSER) {
        return 'Lucky Loser';
      }
      return 'Accepted';
    }
    
    return registration.status;
  }

  /**
   * Navigates back to the home page.
   */
  public goBack(): void {
    void this.router.navigate(['/']);
  }
}
