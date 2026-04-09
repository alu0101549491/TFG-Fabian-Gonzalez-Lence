/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/pages/matches/match-detail/match-detail.component.ts
 * @desc Match detail view with live scoring and score history.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, OnInit, signal, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterModule, Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {MatchService, BracketService, TournamentService} from '@application/services';
import {type MatchDto} from '@application/dto';
import {MatchStatus} from '@domain/enumerations/match-status';
import {UserRole} from '@domain/enumerations/user-role';
import {AuthStateService} from '@presentation/services/auth-state.service';
import {EnumFormatPipe} from '@shared/pipes';
import {TennisScoreValidator, type TennisSetScore} from '@shared/utils/tennis-score-validator';
import templateHtml from './match-detail.component.html?raw';
import styles from './match-detail.component.css?raw';

/**
 * MatchDetailComponent displays detailed match information with management actions.
 */
@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, EnumFormatPipe],
  template: templateHtml,
  styles: [styles],
})
export class MatchDetailComponent implements OnInit {
  /** Services */
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly matchService = inject(MatchService);
  private readonly bracketService = inject(BracketService);
  private readonly tournamentService = inject(TournamentService);
  private readonly authStateService = inject(AuthStateService);

  /** Match data */
  public match = signal<MatchDto | null>(null);

  /** Tournament data */
  public tournament = signal<any | null>(null);

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** Success message */
  public successMessage = signal<string | null>(null);

  /** Tournament ID (from query params for back navigation) */
  private tournamentId: string | null = null;

  /** Tournament admin check */
  public canManageMatch = signal(false);

  /** Modal states */
  public showScheduleModal = signal(false);
  public showStatusModal = signal(false);
  public showScoresModal = signal(false);
  public showCancelModal = signal(false);
  public showSuspendModal = signal(false);
  public showResumeModal = signal(false);

  /** Form states */
  public scheduleForm = {
    courtId: '',
    scheduledDate: '',
    scheduledTime: '',
  };

  public statusForm = {
    status: MatchStatus.SCHEDULED,
  };

  public scoresForm = {
    winnerId: '',
    sets: [] as { participant1Score: number; participant2Score: number }[],
    isRetirement: false,
    retiredParticipantId: '',
  };

  public cancelForm = {
    reason: '',
  };

  public suspendForm = {
    suspensionReason: '',
  };

  public resumeForm = {
    scheduledDate: '',
    scheduledTime: '',
  };

  /** Available statuses */
  public readonly availableStatuses = Object.values(MatchStatus);

  /** Submitting state */
  public isSubmitting = signal(false);

  /** Tennis score validator */
  private readonly scoreValidator = new TennisScoreValidator();

  /** Validation errors for score form */
  public scoreValidationErrors = signal<string[]>([]);

  /**
   * Initializes component and loads match data.
   */
  public ngOnInit(): void {
    // Get tournamentId from query params for back navigation
    this.route.queryParamMap.subscribe(params => {
      this.tournamentId = params.get('tournamentId');
    });

    this.route.paramMap.subscribe(params => {
      const matchId = params.get('id');
      if (matchId) {
        void this.loadMatch(matchId);
      }
    });

    // Add some default sets for scoring form
    this.scoresForm.sets = [
      { participant1Score: 0, participant2Score: 0 },
      { participant1Score: 0, participant2Score: 0 },
      { participant1Score: 0, participant2Score: 0 },
    ];
  }

  /**
   * Loads match details and checks permissions.
   *
   * @param matchId - ID of the match
   */
  private async loadMatch(matchId: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const match = await this.matchService.getMatchById(matchId);
      this.match.set(match);

      // Check if user can manage this match
      await this.checkPermissions(match);

      // Pre-fill forms
      if (match.scheduledTime) {
        const date = new Date(match.scheduledTime);
        this.scheduleForm.scheduledDate = date.toISOString().split('T')[0];
        this.scheduleForm.scheduledTime = date.toTimeString().slice(0, 5);
      }
      if (match.courtId) {
        this.scheduleForm.courtId = match.courtId;
      }
      this.statusForm.status = match.status as MatchStatus;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load match';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Checks if current user can manage this match.
   *
   * @param match - The match to check permissions for
   */
  private async checkPermissions(match: MatchDto): Promise<void> {
    const user = this.authStateService.getCurrentUser();
    if (!user) {
      this.canManageMatch.set(false);
      return;
    }

    // System admins and tournament admins can manage matches
    if (user.role === UserRole.SYSTEM_ADMIN || user.role === UserRole.TOURNAMENT_ADMIN) {
      try {
        // Get bracket to find tournament
        const bracket = await this.bracketService.getBracketById(match.bracketId);
        const tournament = await this.tournamentService.getTournamentById(bracket.tournamentId);

        // Store tournament data for date restrictions
        this.tournament.set(tournament);

        // System admins can manage any match
        // Tournament admins can manage matches for tournaments they organize
        this.canManageMatch.set(
          user.role === UserRole.SYSTEM_ADMIN || 
          tournament.organizerId === user.id
        );
      } catch (error) {
        console.error('Error checking permissions:', error);
        this.canManageMatch.set(false);
      }
    } else {
      this.canManageMatch.set(false);
    }
  }

  // Modal management methods

  /**
   * Opens the schedule match modal.
   */
  public openScheduleModal(): void {
    this.showScheduleModal.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  /**
   * Opens the update status modal.
   */
  public openStatusModal(): void {
    this.showStatusModal.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  /**
   * Opens the record scores modal.
   */
  public openScoresModal(): void {
    if (this.match()?.participant1Id) {
      this.scoresForm.winnerId = this.match()!.participant1Id!;
    } else if (this.match()?.participant1?.id) {
      // Fallback: use participant object ID if participant1Id is missing
      this.scoresForm.winnerId = this.match()!.participant1!.id;
    }
    
    this.showScoresModal.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  /**
   * Handles winner selection change (for debugging).
   * 
   * @param participant - Which participant was clicked
   * @param id - The participant ID
   */
  public onWinnerChange(participant: string, id: string): void {
    // Winner selection handled by ngModel binding
  }

  /**
   * Opens the cancel match modal.
   */
  public openCancelModal(): void {
    this.showCancelModal.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  /**
   * Opens the suspend match modal.
   */
  public openSuspendModal(): void {
    this.showSuspendModal.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.suspendForm.suspensionReason = '';
  }

  /**
   * Opens the resume match modal.
   */
  public openResumeModal(): void {
    this.showResumeModal.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    // Populate form with current scheduled time if it exists
    const match = this.match();
    if (match?.scheduledTime) {
      const scheduledDate = new Date(match.scheduledTime);
      this.resumeForm.scheduledDate = scheduledDate.toISOString().split('T')[0]; // YYYY-MM-DD
      this.resumeForm.scheduledTime = scheduledDate.toTimeString().slice(0, 5); // HH:MM
    } else {
      this.resumeForm.scheduledDate = '';
      this.resumeForm.scheduledTime = '';
    }
  }

  /**
   * Closes all modals.
   */
  public closeModals(): void {
    this.showScheduleModal.set(false);
    this.showStatusModal.set(false);
    this.showScoresModal.set(false);
    this.showCancelModal.set(false);
    this.showSuspendModal.set(false);
    this.showResumeModal.set(false);
  }

  // Action handlers

  /**
   * Submits the schedule match form.
   */
  public async submitSchedule(): Promise<void> {
    if (!this.match()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      const dateTime = new Date(`${this.scheduleForm.scheduledDate}T${this.scheduleForm.scheduledTime}`);
      
      // Extract court input - separate courtId (FK) from courtName (free text)
      const courtIdInput = this.scheduleForm.courtId.trim();
      const courtId = courtIdInput && courtIdInput.startsWith('crt_') ? courtIdInput : null;
      const courtName = courtIdInput && !courtIdInput.startsWith('crt_') ? courtIdInput : null;
      
      await this.matchService.scheduleMatch(
        this.match()!.id,
        courtId,
        courtName,
        dateTime
      );

      this.successMessage.set('Match scheduled successfully');
      this.closeModals();
      await this.loadMatch(this.match()!.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to schedule match';
      this.errorMessage.set(message);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /**
   * Submits the update status form.
   */
  public async submitStatus(): Promise<void> {
    if (!this.match()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      const user = this.authStateService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      await this.matchService.updateStatus(
        {
          matchId: this.match()!.id,
          status: this.statusForm.status,
        },
        user.id
      );

      this.successMessage.set('Match status updated successfully');
      this.closeModals();
      await this.loadMatch(this.match()!.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update status';
      this.errorMessage.set(message);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /**
   * Submits the record scores form.
   */
  public async submitScores(): Promise<void> {
    if (!this.match()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.scoreValidationErrors.set([]);

    try {
      const user = this.authStateService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Filter out empty sets and transform to SetScore format
      const validSets = this.scoresForm.sets
        .filter(set => set.participant1Score > 0 || set.participant2Score > 0)
        .map((set, index) => ({
          setNumber: index + 1,
          participant1Games: set.participant1Score,
          participant2Games: set.participant2Score,
          tiebreakParticipant1: null,
          tiebreakParticipant2: null,
        }));

      if (validSets.length === 0) {
        throw new Error('Please enter at least one set score');
      }

      if (!this.scoresForm.winnerId) {
        throw new Error('Please select a winner');
      }

      // Validate tennis scoring rules
      const validation = this.scoreValidator.validateMatch(validSets);
      if (!validation.isValid) {
        this.scoreValidationErrors.set(validation.errors);
        this.errorMessage.set('Invalid tennis score. Please check the errors below and correct the scores.');
        return;
      }

      await this.matchService.recordResult(
        {
          matchId: this.match()!.id,
          winnerId: this.scoresForm.winnerId,
          sets: validSets,
          isRetirement: this.scoresForm.isRetirement,
          retiredParticipantId: this.scoresForm.isRetirement ? this.scoresForm.retiredParticipantId : undefined,
        },
        user.id
      );

      this.successMessage.set('Match result recorded successfully');
      this.closeModals();
      await this.loadMatch(this.match()!.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to record scores';
      this.errorMessage.set(message);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /**
   * Submits the cancel match form.
   */
  public async submitCancel(): Promise<void> {
    if (!this.match()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      const user = this.authStateService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      await this.matchService.cancelMatch(
        this.match()!.id,
        this.cancelForm.reason,
        user.id
      );

      this.successMessage.set('Match cancelled successfully');
      this.closeModals();
await this.loadMatch(this.match()!.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cancel match';
      this.errorMessage.set(message);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /**
   * Submits the suspend match form.
   */
  public async submitSuspend(): Promise<void> {
    if (!this.match()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      if (!this.suspendForm.suspensionReason.trim()) {
        throw new Error('Suspension reason is required');
      }

      await this.matchService.suspendMatch(
        this.match()!.id,
        this.suspendForm.suspensionReason
      );

      this.successMessage.set('Match suspended successfully');
      this.closeModals();
      await this.loadMatch(this.match()!.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to suspend match';
      this.errorMessage.set(message);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /**
   * Submits the resume match action.
   */
  public async submitResume(): Promise<void> {
    if (!this.match()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      // Combine date and time into ISO string if provided
      let scheduledTime: string | undefined = undefined;
      if (this.resumeForm.scheduledDate && this.resumeForm.scheduledTime) {
        scheduledTime = `${this.resumeForm.scheduledDate}T${this.resumeForm.scheduledTime}:00.000Z`;
      }

      await this.matchService.resumeMatch(this.match()!.id, scheduledTime);

      this.successMessage.set('Match resumed successfully');
      this.closeModals();
      await this.loadMatch(this.match()!.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resume match';
      this.errorMessage.set(message);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /**
   * Adds a new set to the scoring form.
   */
  public addSet(): void {
    if (this.scoresForm.sets.length < 5) {
      this.scoresForm.sets.push({ participant1Score: 0, participant2Score: 0 });
    }
  }

  /**
   * Removes a set from the scoring form.
   *
   * @param index - Index of the set to remove
   */
  public removeSet(index: number): void {
    if (this.scoresForm.sets.length > 1) {
      this.scoresForm.sets.splice(index, 1);
    }
  }

  /**
   * Formats date for display.
   *
   * @param date - Date to format
   * @returns Formatted date string
   */
  public formatDate(date: Date | null): string {
    if (!date) return 'Not scheduled';
    return new Date(date).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
    });
  }

  /**
   * Gets minimum allowed date for scheduling (tournament start date).
   *
   * @returns ISO date string or empty string if tournament not loaded
   */
  public getMinScheduleDate(): string {
    const tournament = this.tournament();
    if (!tournament?.startDate) return '';
    return new Date(tournament.startDate).toISOString().split('T')[0];
  }

  /**
   * Gets maximum allowed date for scheduling (tournament end date).
   *
   * @returns ISO date string or empty string if tournament not loaded
   */
  public getMaxScheduleDate(): string {
    const tournament = this.tournament();
    if (!tournament?.endDate) return '';
    return new Date(tournament.endDate).toISOString().split('T')[0];
  }

  /**
   * Gets initials from first and last name.
   *
   * @param firstName - First name
   * @param lastName - Last name
   * @returns Initials (e.g., "JD" for John Doe)
   */
  public getInitials(firstName: string, lastName: string): string {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last;
  }

  /**
   * Checks if application is running in development mode.
   * In dev mode, score recording is allowed even without participants assigned.
   *
   * @returns True if in development mode
   */
  public isDevelopmentMode(): boolean {
    return !window.location.hostname.includes('tennistournament.com') && 
           (window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.'));
  }

  /**
   * Navigates back to matches list.
   */
  public goBack(): void {
    // Preserve tournamentId query param if present
    const queryParams = this.tournamentId ? {tournamentId: this.tournamentId} : {};
    void this.router.navigate(['/matches'], {queryParams});
  }
}
