/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 31, 2026
 * @file presentation/pages/matches/my-matches/my-matches.component.ts
 * @desc Component for participants to view and submit results for their matches (FR24).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, OnInit, signal, inject, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {MatchService} from '@application/services';
import {AuthStateService} from '@presentation/services/auth-state.service';
import {type MatchDto} from '@application/dto';
import {MatchStatus} from '@domain/enumerations/match-status';
import {EnumFormatPipe} from '@shared/pipes';
import templateHtml from './my-matches.component.html?raw';
import styles from './my-matches.component.css?inline';

/**
 * Enhanced match with participant names and tournament info.
 */
interface EnhancedMatch extends MatchDto {
  participant1Name: string | null;
  participant2Name: string | null;
  tournamentName: string;
  isMyTurn: boolean;
  opponentId: string | null;
  opponentName: string | null;
  pendingResult?: {
    id: string;
    submittedBy: string;
    winnerId: string;
    setScores: string[];
    confirmationStatus: string;
  } | null;
}

/**
 * MyMatchesComponent displays matches for the current participant.
 */
@Component({
  selector: 'app-my-matches',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, EnumFormatPipe],
  template: templateHtml,
  styles: [styles],
})
export class MyMatchesComponent implements OnInit {
  /** Services */
  private readonly matchService = inject(MatchService);
  private readonly authService = inject(AuthStateService);
  private readonly router = inject(Router);

  /** Current user ID */
  private readonly currentUserId = computed<string | undefined>(() => {
    const user = this.authService.getCurrentUser();
    return user?.id;
  });

  /** List of enhanced matches */
  public matches = signal<EnhancedMatch[]>([]);

  /**
   * Matches grouped by status into three categories.
   * 
   * - **toBePlayed**: Active/pending matches (NOT_SCHEDULED, SCHEDULED, IN_PROGRESS, SUSPENDED)
   *   These are matches that haven't reached a final state yet.
   * 
   * - **completed**: Final matches with confirmed results (COMPLETED, WALKOVER, RETIRED, etc.)
   *   These are matches that have reached a terminal state and won't change.
   * 
   * - **other**: Edge cases or unknown statuses (should be empty in normal operation)
   */
  public groupedMatches = computed(() => {
    const matches = this.matches();
    
    // Uncompleted matches: active, pending, or in-progress states
    // These matches can still transition to other states
    const uncompletedStatuses = [
      MatchStatus.NOT_SCHEDULED,
      MatchStatus.SCHEDULED,
      MatchStatus.IN_PROGRESS,
      MatchStatus.SUSPENDED,
    ];
    
    // Completed matches: final states with confirmed results
    // These matches have reached a terminal state (won't change)
    const completedStatuses = [
      MatchStatus.COMPLETED,
      MatchStatus.WALKOVER,
      MatchStatus.RETIRED,
      MatchStatus.ABANDONED,
      MatchStatus.BYE,
      MatchStatus.NOT_PLAYED,
      MatchStatus.CANCELLED,
      MatchStatus.DEFAULT,
      MatchStatus.DEAD_RUBBER,
    ];
    
    const tbpMatches = matches.filter(m => uncompletedStatuses.includes(m.status));
    const completedMatches = matches.filter(m => completedStatuses.includes(m.status));
    const otherMatches = matches.filter(m => 
      !uncompletedStatuses.includes(m.status) && 
      !completedStatuses.includes(m.status)
    );

    return {
      toBePlayed: tbpMatches,
      completed: completedMatches,
      other: otherMatches,
    };
  });

  /** Matches with pending results requiring confirmation */
  public pendingMatches = computed(() => {
    const toBePlayed = this.groupedMatches().toBePlayed;
    const pending = toBePlayed.filter(m => m.pendingResult);
    return pending;
  });

  /** Matches to be played without pending results */
  public toBePlayedWithoutPending = computed(() => {
    const toBePlayed = this.groupedMatches().toBePlayed;
    return toBePlayed.filter(m => !m.pendingResult);
  });

  /** Uncompleted matches (to be played + pending) for new section layout */
  public uncompletedMatches = computed(() => {
    return [...this.toBePlayedWithoutPending(), ...this.pendingMatches()];
  });

  /** Completed matches (matches with final confirmed results) */
  public completedMatches = computed(() => {
    return this.groupedMatches().completed;
  });

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** Show result entry modal */
  public showResultModal = signal(false);

  /** Match for result entry */
  public selectedMatch = signal<EnhancedMatch | null>(null);

  /** Result form data */
  public resultForm = signal({
    winnerId: '',
    sets: [
      { participant1Score: 0, participant2Score: 0 },
      { participant1Score: 0, participant2Score: 0 },
      { participant1Score: 0, participant2Score: 0 },
    ] as { participant1Score: number; participant2Score: number }[],
    playerComments: '',
  });

  /** Available match statuses for result entry */
  public readonly resultStatuses = [
    {value: MatchStatus.COMPLETED, label: 'Completed (CO)'},
    {value: MatchStatus.RETIRED, label: 'Retired (RET)'},
  ];

  /**
   * Initializes component and loads user's matches.
   */
  public async ngOnInit(): Promise<void> {
    await this.loadMyMatches();
  }

  /**
   * Loads matches for the current participant.
   */
  private async loadMyMatches(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const userId = this.currentUserId();
      if (!userId) {
        this.errorMessage.set('User not authenticated');
        return;
      }

      // Fetch matches where current user is a participant
      const myMatches = await this.matchService.getMatchesByParticipant(userId);

      // Enhance with additional info
      const enhanced: EnhancedMatch[] = myMatches.map(match => {
        const isDoubles = Boolean(match.participant1TeamId || match.participant2TeamId);
        const isParticipant1 = isDoubles
          ? (match.participant1Team?.player1.id === userId || match.participant1Team?.player2?.id === userId)
          : match.participant1Id === userId;
        const opponentId = isParticipant1
          ? (isDoubles ? (match.participant2TeamId ?? null) : match.participant2Id)
          : (isDoubles ? (match.participant1TeamId ?? null) : match.participant1Id);
        
        // Format participant names from team or individual
        const participant1Name = match.participant1Team
          ? `${match.participant1Team.player1.firstName} ${match.participant1Team.player1.lastName} / ${match.participant1Team.player2.firstName} ${match.participant1Team.player2.lastName}`
          : match.participant1
          ? `${match.participant1.firstName} ${match.participant1.lastName}`.trim()
          : 'TBD';
        const participant2Name = match.participant2Team
          ? `${match.participant2Team.player1.firstName} ${match.participant2Team.player1.lastName} / ${match.participant2Team.player2.firstName} ${match.participant2Team.player2.lastName}`
          : match.participant2
          ? `${match.participant2.firstName} ${match.participant2.lastName}`.trim()
          : 'TBD';
        
        const opponentName = isParticipant1 ? participant2Name : participant1Name;

        const enhanced = {
          ...match,
          participant1Name,
          participant2Name,
          tournamentName: 'Tournament', // TODO: Fetch tournament name
          isMyTurn: match.status === MatchStatus.SCHEDULED,
          opponentId,
          opponentName,
          pendingResult: (match as any).pendingResult || null,
        };

        return enhanced;
      });

      this.matches.set(enhanced);
    } catch (error) {
      console.error('Error loading matches:', error);
      this.errorMessage.set('Failed to load matches. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Opens the result entry modal for a match.
   *
   * @param match - The match to enter result for
   */
  public openResultModal(match: EnhancedMatch): void {
    this.selectedMatch.set(match);
    this.resultForm.set({
      winnerId: '',
      sets: [
        { participant1Score: 0, participant2Score: 0 },
        { participant1Score: 0, participant2Score: 0 },
        { participant1Score: 0, participant2Score: 0 },
      ],
      playerComments: '',
    });
    this.showResultModal.set(true);
  }

  /**
   * Closes the result entry modal.
   */
  public closeResultModal(): void {
    this.showResultModal.set(false);
    this.selectedMatch.set(null);
  }

  /**
   * Submits the match result (FR24).
   */
  public async submitResult(): Promise<void> {
    const match = this.selectedMatch();
    const form = this.resultForm();

    if (!match || !form.winnerId) {
      this.errorMessage.set('Please select a winner');
      return;
    }

    // Convert sets array to setScores string array format
    const validSets = form.sets
      .filter(set => set.participant1Score > 0 || set.participant2Score > 0)
      .map(set => `${set.participant1Score}-${set.participant2Score}`);

    if (validSets.length === 0) {
      this.errorMessage.set('Please enter at least one set score');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      // Call backend to submit result
      await this.matchService.submitMatchResult(match.id, {
        winnerId: form.winnerId,
        setScores: validSets,
        player1Games: 0, // Not used with new set format
        player2Games: 0, // Not used with new set format
        playerComments: form.playerComments || undefined,
      });

      // Close modal and reload matches
      this.closeResultModal();
      await this.loadMyMatches();

      // Show success message
      alert('Result submitted successfully! Waiting for opponent confirmation.');
    } catch (error) {
      console.error('Error submitting result:', error);
      
      // Don't reload matches on error - keep them visible
      // Parse error message from backend
      let errorMsg = 'Failed to submit result. Please try again.';
      
      // Check if error has response data (AxiosError structure)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        const responseData = axiosError.response?.data;
        
        // Check for backend error messages
        if (responseData?.error && typeof responseData.error === 'string') {
          const backendError = responseData.error;
          
          // Match status not scheduled
          if (backendError.includes('NOT_SCHEDULED')) {
            errorMsg = 'Cannot submit results: this match has not been scheduled yet. Please wait for the tournament administrator to schedule it.';
          }
          // Match already completed
          else if (backendError.includes('COMPLETED') || backendError.includes('already has a confirmed result')) {
            errorMsg = 'Cannot submit results: this match already has a confirmed result.';
          }
          // Match in progress
          else if (backendError.includes('IN_PROGRESS')) {
            errorMsg = 'Cannot submit results: this match is currently in progress.';
          }
          // Tennis score validation errors - format as list with helpful guidance
          else if (backendError.includes('Invalid tennis score') || backendError.includes('Set is incomplete') || backendError.includes('Match is incomplete')) {
            // Split multiple validation errors (separated by semicolons) and format
            const errors = backendError
              .replace('Invalid tennis score: ', '')
              .split('; ')
              .map(err => err.trim())
              .filter(err => err.length > 0);
            
            // Build user-friendly error message with tennis rules explanation
            let errorLines = ['❌ Invalid Tennis Score\n'];
            
            errors.forEach(err => {
              errorLines.push('• ' + err);
            });
            
            // Add helpful guidance about tennis scoring rules
            errorLines.push('\n📖 Tennis Scoring Rules:');
            
            if (backendError.includes('Set is incomplete') || backendError.includes('at least 6 games')) {
              errorLines.push('• A set is won by the first player to win 6 games with a margin of 2 (e.g., 6-4, 6-3, 6-0)');
              errorLines.push('• If tied 6-6, a tiebreak is played (7-6)');
              errorLines.push('• If one player has 6 or 7, the other must have at least 4 games');
            }
            
            if (backendError.includes('Match is incomplete') || backendError.includes('2 sets')) {
              errorLines.push('• A match is won when a player wins 2 sets (best of 3)');
              errorLines.push('• Valid match scores: 2-0 or 2-1');
            }
            
            errorLines.push('\n✅ Example valid scores: 6-4, 6-3 | 3-6, 6-2, 6-1 | 7-6, 6-4');
            
            errorMsg = errorLines.join('\n');
          }
          // Generic status error
          else if (backendError.includes('Cannot submit results for match in status')) {
            errorMsg = `Cannot submit results: ${backendError}`;
          }
          // Fallback: show any backend error message
          else {
            errorMsg = backendError;
          }
        }
      }
      
      this.errorMessage.set(errorMsg);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Navigates to match detail page.
   *
   * @param matchId - The match ID
   */
  public viewMatchDetail(matchId: string): void {
    void this.router.navigate(['/matches', matchId]);
  }

  /**
   * Navigates back to the dashboard.
   */
  public goBack(): void {
    void this.router.navigate(['/']);
  }

  /**
   * Gets initials from first and last name for avatar display.
   *
   * @param firstName - The first name
   * @param lastName - The last name
   * @returns The initials (e.g., "JD" for John Doe)
   */
  public getInitials(firstName: string, lastName: string): string {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last;
  }

  /**
   * Adds a new set to the result form.
   */
  public addSet(): void {
    this.resultForm.update(form => {
      if (form.sets.length < 5) {
        return {
          ...form,
          sets: [...form.sets, { participant1Score: 0, participant2Score: 0 }],
        };
      }
      return form;
    });
  }

  /**
   * Removes a set from the result form.
   *
   * @param index - Index of the set to remove
   */
  public removeSet(index: number): void {
    this.resultForm.update(form => {
      if (form.sets.length > 1) {
        const newSets = [...form.sets];
        newSets.splice(index, 1);
        return { ...form, sets: newSets };
      }
      return form;
    });
  }

  /**
   * Updates winner selection based on participant choice.
   *
   * @param participantId - The selected winner's ID
   */
  public selectWinner(participantId: string): void {
    this.resultForm.update(form => ({
      ...form,
      winnerId: participantId,
    }));
  }

  /**
   * Confirms a pending match result (FR25).
   *
   * @param match - The match with pending result
   */
  public async confirmResult(match: EnhancedMatch): Promise<void> {
    if (!match.pendingResult) {
      return;
    }

    const userId = this.currentUserId();
    if (!userId) {
      this.errorMessage.set('User not authenticated');
      return;
    }

    // Verify user is not the submitter
    if (match.pendingResult.submittedBy === userId) {
      this.errorMessage.set('You cannot confirm your own result');
      return;
    }

    const winnerName = match.participant1TeamId || match.participant2TeamId
      ? (match.pendingResult.winnerId === match.participant1TeamId ? match.participant1Name : match.participant2Name)
      : (match.pendingResult.winnerId === match.participant1Id ? match.participant1Name : match.participant2Name);
    const confirm = window.confirm(
      `Confirm this result?\n\nWinner: ${winnerName}\nScores: ${match.pendingResult.setScores.join(', ')}`
    );

    if (!confirm) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await this.matchService.confirmMatchResult(match.id);
      alert('Result confirmed successfully!');
      await this.loadMyMatches();
    } catch (error) {
      console.error('Error confirming result:', error);
      this.errorMessage.set('Failed to confirm result. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  /** Show dispute modal */
  public showDisputeModal = signal(false);

  /** Match for dispute */
  public disputeMatch = signal<EnhancedMatch | null>(null);

  /** Dispute reason */
  public disputeReason = signal('');

  /**
   * Opens the dispute modal.
   *
   * @param match - The match with pending result
   */
  public openDisputeModal(match: EnhancedMatch): void {
    if (!match.pendingResult) {
      return;
    }

    const userId = this.currentUserId();
    if (!userId) {
      this.errorMessage.set('User not authenticated');
      return;
    }

    // Verify user is not the submitter
    if (match.pendingResult.submittedBy === userId) {
      this.errorMessage.set('You cannot dispute your own result');
      return;
    }

    this.disputeMatch.set(match);
    this.disputeReason.set('');
    this.showDisputeModal.set(true);
  }

  /**
   * Closes the dispute modal.
   */
  public closeDisputeModal(): void {
    this.showDisputeModal.set(false);
    this.disputeMatch.set(null);
    this.disputeReason.set('');
  }

  /**
   * Submits a dispute for a pending result (FR26).
   */
  public async submitDispute(): Promise<void> {
    const match = this.disputeMatch();
    const reason = this.disputeReason();

    if (!match || !reason.trim()) {
      this.errorMessage.set('Please provide a reason for disputing');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await this.matchService.disputeMatchResult(match.id, reason);
      alert('Result disputed successfully. An administrator will review it.');
      this.closeDisputeModal();
      await this.loadMyMatches();
    } catch (error) {
      console.error('Error disputing result:', error);
      this.errorMessage.set('Failed to dispute result. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Checks if the current user needs to confirm a result.
   *
   * @param match - The match to check
   * @returns True if user needs to confirm
   */
  public needsConfirmation(match: EnhancedMatch): boolean {
    const userId = this.currentUserId();
    if (!userId || !match.pendingResult) {
      return false;
    }

    // User needs to confirm if they're not the submitter
    return match.pendingResult.submittedBy !== userId;
  }

  /**
   * Checks if the current user is waiting for confirmation.
   *
   * @param match - The match to check
   * @returns True if user is waiting
   */
  public isWaitingForConfirmation(match: EnhancedMatch): boolean {
    const userId = this.currentUserId();
    if (!userId || !match.pendingResult) {
      return false;
    }

    // User is waiting if they submitted the result
    return match.pendingResult.submittedBy === userId;
  }

  /**
   * Checks if a result can be submitted for this match.
   * Results can only be submitted for SCHEDULED matches.
   *
   * @param match - The match to check
   * @returns True if results can be submitted
   */
  public canSubmitResult(match: EnhancedMatch): boolean {
    // Only SCHEDULED matches can have results submitted
    return match.status === MatchStatus.SCHEDULED;
  }

  /**
   * Gets a user-friendly message explaining why results can't be submitted.
   *
   * @param match - The match to check
   * @returns Message explaining the restriction
   */
  public getCannotSubmitReason(match: EnhancedMatch): string {
    switch (match.status) {
      case MatchStatus.NOT_SCHEDULED:
        return 'This match has not been scheduled yet';
      case MatchStatus.IN_PROGRESS:
        return 'This match is currently in progress';
      case MatchStatus.SUSPENDED:
        return 'This match is suspended';
      case MatchStatus.COMPLETED:
        return 'This match is already completed';
      default:
        return 'Results cannot be submitted for this match';
    }
  }
}
