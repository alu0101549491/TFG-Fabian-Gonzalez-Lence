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
    setScores: ['', '', ''],
    player1Games: 0,
    player2Games: 0,
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

      // Fetch all matches and filter for current user
      const allMatches = await this.matchService.getMatches();
      
      // Filter matches where user is a participant
      const myMatches = allMatches.filter(
        match => match.participant1Id === userId || match.participant2Id === userId
      );

      // Enhance with additional info
      const enhanced: EnhancedMatch[] = myMatches.map(match => {
        const isParticipant1 = match.participant1Id === userId;
        const opponentId = isParticipant1 ? match.participant2Id : match.participant1Id;
        const opponentName = isParticipant1 
          ? (match.participant2 as any)?.username || 'TBD'
          : (match.participant1 as any)?.username || 'TBD';

        return {
          ...match,
          participant1Name: (match.participant1 as any)?.username || 'TBD',
          participant2Name: (match.participant2 as any)?.username || 'TBD',
          tournamentName: 'Tournament', // TODO: Fetch tournament name
          isMyTurn: match.status === MatchStatus.SCHEDULED,
          opponentId,
          opponentName,
        };
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
      setScores: ['', '', ''],
      player1Games: 0,
      player2Games: 0,
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

    // Filter out empty set scores
    const setScores = form.setScores.filter(score => score.trim() !== '');
    if (setScores.length === 0) {
      this.errorMessage.set('Please enter at least one set score');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      // Call backend to submit result
      await this.matchService.submitMatchResult(match.id, {
        winnerId: form.winnerId,
        setScores,
        player1Games: form.player1Games,
        player2Games: form.player2Games,
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
   * Updates set score at index.
   *
   * @param index - Set index (0-based)
   * @param score - Score string (e.g., "6-4")
   */
  public updateSetScore(index: number, score: string): void {
    this.resultForm.update(form => {
      const newScores = [...form.setScores];
      newScores[index] = score;
      return {...form, setScores: newScores};
    });
  }
}
