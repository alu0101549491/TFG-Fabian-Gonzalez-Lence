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

  /** Matches grouped by status */
  public groupedMatches = computed(() => {
    const matches = this.matches();
    const tbpMatches = matches.filter(m => m.status === MatchStatus.SCHEDULED);
    const completedMatches = matches.filter(m => m.status === MatchStatus.COMPLETED);
    const otherMatches = matches.filter(m => 
      m.status !== MatchStatus.SCHEDULED && 
      m.status !== MatchStatus.COMPLETED
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
        const isParticipant1 = match.participant1Id === userId;
        const opponentId = isParticipant1 ? match.participant2Id : match.participant1Id;
        
        // Format participant names from firstName and lastName
        const participant1Name = match.participant1
          ? `${match.participant1.firstName} ${match.participant1.lastName}`.trim()
          : 'TBD';
        const participant2Name = match.participant2
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
      this.errorMessage.set('Failed to submit result. Please try again.');
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

    const confirm = window.confirm(
      `Confirm this result?\n\nWinner: ${match.pendingResult.winnerId === match.participant1Id ? match.participant1Name : match.participant2Name}\nScores: ${match.pendingResult.setScores.join(', ')}`
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
}
