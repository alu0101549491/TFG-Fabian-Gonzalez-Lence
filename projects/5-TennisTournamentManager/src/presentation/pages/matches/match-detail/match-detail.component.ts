/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file src/presentation/pages/matches/match-detail/match-detail.component.ts
 * @desc Match detail view with live scoring and score history.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Component, OnInit, signal, computed, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterModule, Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {MatchService, BracketService, TournamentService} from '@application/services';
import {type MatchDto} from '@application/dto';
import {MatchStatus} from '@domain/enumerations/match-status';
import {Match} from '@domain/entities/match';
import {UserRole} from '@domain/enumerations/user-role';
import {MatchFormat} from '@domain/enumerations/match-format';
import {AuthStateService} from '@presentation/services/auth-state.service';
import {EnumFormatPipe} from '@shared/pipes';
import {TennisScoreValidator, type TennisSetScore} from '@shared/utils/tennis-score-validator';
import {Court} from '@domain/entities/court';
import {CourtRepositoryImpl} from '@infrastructure/repositories/court.repository';
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
  private readonly courtRepository = inject(CourtRepositoryImpl);

  /** Match data */
  public match = signal<MatchDto | null>(null);

  /** Tournament data */
  public tournament = signal<any | null>(null);

  /** Available courts for the tournament */
  public availableCourts = signal<Court[]>([]);

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

  /** Match participant/admin score-entry check */
  public canRecordScores = signal(false);

  /** Authentication status - updated on init */
  public isAuthenticated = signal(false);

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
    ballProvider: '',
  };

  public statusForm = {
    status: MatchStatus.SCHEDULED,
    winnerId: '',
  };

  public scoresForm = {
    winnerId: '',
    sets: [] as { participant1Score: number; participant2Score: number; tiebreak1: number | null; tiebreak2: number | null }[],
    isRetirement: false,
    retiredParticipantId: '',
  };

  /** Whether the current match uses the super tiebreak format (single tiebreak to 10). */
  public readonly isSuperTiebreakMatch = computed(() => this.match()?.format === MatchFormat.SUPER_TIEBREAK);

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

  /** 
   * Available statuses based on valid transitions from current match status.
   * Filters to show only valid next states instead of all 13 statuses.
   */
  public availableStatuses = computed(() => {
    const match = this.match();
    if (!match) return Object.values(MatchStatus);
    
    const currentStatus = match.status;
    const allStatuses = Object.values(MatchStatus);
    
    // Filter to only show statuses that are valid transitions from current status
    const filteredStatuses = allStatuses.filter(status => 
      Match.isValidTransition(currentStatus, status) || status === currentStatus
    );
    
    // Defensive check: ensure current status is always included
    if (!filteredStatuses.includes(currentStatus)) {
      filteredStatuses.unshift(currentStatus);
    }
    
    return filteredStatuses;
  });

  /** Submitting state */
  public isSubmitting = signal(false);

  /**
   * Gets tooltip text explaining each match status.
   *
   * @param status - The match status
   * @returns Tooltip explanation text
   */
  public getStatusTooltip(status: MatchStatus): string {
    const tooltips: Record<MatchStatus, string> = {
      [MatchStatus.NOT_SCHEDULED]: 'Match created but awaiting schedule details (players, time, court)',
      [MatchStatus.SCHEDULED]: 'Match fully scheduled and ready to be played (TBP)',
      [MatchStatus.IN_PROGRESS]: 'Match currently being played (IP)',
      [MatchStatus.COMPLETED]: 'Match finished with result recorded (CO)',
      [MatchStatus.SUSPENDED]: 'Match temporarily stopped (weather, light, etc.) (SUS)',
      [MatchStatus.WALKOVER]: 'Victory awarded due to opponent no-show (WO)',
      [MatchStatus.RETIRED]: 'Match ended by player retirement during play (RET)',
      [MatchStatus.ABANDONED]: 'Match abandoned without valid result (ABN)',
      [MatchStatus.BYE]: 'Automatic advancement without playing (participant has bye)',
      [MatchStatus.NOT_PLAYED]: 'Match not disputed (NP)',
      [MatchStatus.CANCELLED]: 'Match cancelled by organization (CAN)',
      [MatchStatus.DEFAULT]: 'Disciplinary disqualification (DEF)',
      [MatchStatus.DEAD_RUBBER]: 'Match has no impact on standings (DR)',
    };
    return tooltips[status] || '';
  }

  /**
   * Checks if the selected status requires winner selection.
   * Statuses requiring winner: WALKOVER, RETIRED, DEFAULT.
   *
   * @param status - The match status to check
   * @returns True if winner selection is required
   */
  public statusRequiresWinner(status: MatchStatus): boolean {
    return [MatchStatus.WALKOVER, MatchStatus.RETIRED, MatchStatus.DEFAULT].includes(status);
  }

  /**
   * Creates a TennisScoreValidator configured for the current match format.
   *
   * @returns Configured validator instance
   */
  private getScoreValidator(): TennisScoreValidator {
    const fmt = this.match()?.format as MatchFormat | undefined;
    return new TennisScoreValidator({
      bestOfFive: fmt === MatchFormat.BEST_OF_5_FINAL_SET_TIEBREAK || fmt === MatchFormat.BEST_OF_5_ADVANTAGE,
      allowSuperTiebreak: fmt === MatchFormat.BEST_OF_3_FINAL_SET_TIEBREAK ||
        fmt === MatchFormat.BEST_OF_5_FINAL_SET_TIEBREAK ||
        fmt === MatchFormat.SHORT_SETS ||
        fmt === MatchFormat.FAST4,
    });
  }

  /** Validation errors for score form */
  public scoreValidationErrors = signal<string[]>([]);

  /** Whether this is a doubles match */
  public readonly isDoublesMatch = computed(() => {
    const m = this.match();
    return Boolean(m && (m.participant1TeamId || m.participant2TeamId));
  });

  /**
   * Gets the display name for a participant slot (handles doubles "A / B" format).
   *
   * @param participantNumber - 1 or 2
   * @returns Display name string
   */
  public getParticipantDisplayName(participantNumber: 1 | 2): string {
    const m = this.match();
    if (!m) return 'TBD';
    const team = participantNumber === 1 ? m.participant1Team : m.participant2Team;
    if (team) {
      return `${team.player1.firstName} ${team.player1.lastName} / ${team.player2.firstName} ${team.player2.lastName}`;
    }
    const p = participantNumber === 1 ? m.participant1 : m.participant2;
    if (!p) return 'TBD';
    return `${p.firstName} ${p.lastName}`;
  }

  /**
   * Gets the effective winner slot ID (teamId for doubles, userId for singles).
   *
   * @param participantNumber - 1 or 2
   * @returns ID string to use as winnerId value
   */
  public getWinnerSlotId(participantNumber: 1 | 2): string {
    const m = this.match();
    if (!m) return '';
    if (m.participant1TeamId || m.participant2TeamId) {
      return participantNumber === 1 ? (m.participant1TeamId ?? '') : (m.participant2TeamId ?? '');
    }
    return participantNumber === 1 ? (m.participant1Id ?? '') : (m.participant2Id ?? '');
  }

  /**
   * Initializes component and loads match data.
   */
  public ngOnInit(): void {
    // Check authentication status on init
    this.isAuthenticated.set(this.authStateService.getCurrentUser() !== null);
    
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
      { participant1Score: 0, participant2Score: 0, tiebreak1: null, tiebreak2: null },
      { participant1Score: 0, participant2Score: 0, tiebreak1: null, tiebreak2: null },
      { participant1Score: 0, participant2Score: 0, tiebreak1: null, tiebreak2: null },
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
      console.log('[Match Detail] Loading match with ID:', matchId);
      const match = await this.matchService.getMatchById(matchId);
      console.log('[Match Detail] Match loaded successfully:', {
        matchId: match.id,
        bracketId: match.bracketId,
        status: match.status,
        participant1Id: match.participant1Id,
        participant2Id: match.participant2Id,
        participant1TeamId: match.participant1TeamId,
        participant2TeamId: match.participant2TeamId
      });
      this.match.set(match);

      // Check if user can manage this match
      console.log('[Match Detail] About to check permissions...');
      await this.checkPermissions(match);

      // Pre-fill forms
      if (match.scheduledTime) {
        const date = new Date(match.scheduledTime);
        this.scheduleForm.scheduledDate = date.toISOString().split('T')[0];
        this.scheduleForm.scheduledTime = date.toTimeString().slice(0, 5);
      }
      this.scheduleForm.ballProvider = (match as any).ballProvider ?? '';
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
    console.log('[Match Detail] checkPermissions() called for match:', match.id);
    
    const user = this.authStateService.getCurrentUser();
    console.log('[Match Detail] Current user:', user ? {
      id: user.id,
      role: user.role,
      email: user.email
    } : 'null (not logged in)');
    
    if (!user) {
      console.log('[Match Detail] No user logged in, setting all permissions to false');
      this.isAuthenticated.set(false);
      this.canManageMatch.set(false);
      this.canRecordScores.set(false);
      return;
    }

    // User is authenticated
    this.isAuthenticated.set(true);

    const canRecordScores = this.isMatchParticipant(user.id, match);
    this.canRecordScores.set(canRecordScores);

    // System admins and tournament admins can manage matches
    if (user.role === UserRole.SYSTEM_ADMIN || user.role === UserRole.TOURNAMENT_ADMIN) {
      try {
        console.log('[Match Detail] Checking permissions for match:', {
          matchId: match.id,
          bracketId: match.bracketId,
          userRole: user.role,
          userId: user.id
        });

        // Get bracket to find tournament
        const bracket = await this.bracketService.getBracketById(match.bracketId);
        console.log('[Match Detail] Bracket loaded:', {
          bracketId: bracket.id,
          tournamentId: bracket.tournamentId,
          bracketType: bracket.bracketType
        });

        const tournament = await this.tournamentService.getTournamentById(bracket.tournamentId);
        console.log('[Match Detail] Tournament loaded:', {
          tournamentId: tournament.id,
          organizerId: tournament.organizerId,
          name: tournament.name
        });

        // Store tournament data for date restrictions
        this.tournament.set(tournament);

        // System admins and tournament admins can manage any match
        const canManage = user.role === UserRole.SYSTEM_ADMIN || user.role === UserRole.TOURNAMENT_ADMIN;
        console.log('[Match Detail] Permission result:', {
          canManage,
          isSystemAdmin: user.role === UserRole.SYSTEM_ADMIN,
          isTournamentAdmin: user.role === UserRole.TOURNAMENT_ADMIN,
          isOrganizer: tournament.organizerId === user.id
        });

        this.canManageMatch.set(canManage);
        this.canRecordScores.set(true);
      } catch (error) {
        console.error('[Match Detail] Error checking permissions:', error);
        console.error('[Match Detail] Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          matchBracketId: match.bracketId,
          userRole: user.role
        });
        this.canManageMatch.set(false);
        this.canRecordScores.set(canRecordScores);
      }
    } else {
      console.log('[Match Detail] User role is not SYSTEM_ADMIN or TOURNAMENT_ADMIN:', user.role);
      this.canManageMatch.set(false);
    }
    
    console.log('[Match Detail] Final canManageMatch value:', this.canManageMatch());
  }

  /**
   * Checks whether the current user is one of the match participants.
   *
   * @param userId - User identifier to match
   * @param match - Match details including singles or doubles participants
   * @returns True when the user belongs to the match roster
   */
  private isMatchParticipant(userId: string, match: MatchDto): boolean {
    const participantIds = [
      match.participant1Id,
      match.participant2Id,
      match.participant1?.id,
      match.participant2?.id,
      match.participant1Team?.player1.id,
      match.participant1Team?.player2.id,
      match.participant2Team?.player1.id,
      match.participant2Team?.player2.id,
    ];

    return participantIds.some((participantId) => participantId === userId);
  }

  // Modal management methods

  /**
   * Opens the schedule match modal and loads available courts.
   */
  public async openScheduleModal(): Promise<void> {
    const match = this.match();
    
    // Validate: Cannot schedule BYE matches
    if (match && match.status === MatchStatus.BYE) {
      this.errorMessage.set('Cannot schedule BYE matches. BYE matches are automatic passes and do not require scheduling.');
      return;
    }
    
    this.showScheduleModal.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    
    // Fetch available courts for the tournament
    const tournament = this.tournament();
    if (tournament?.id) {
      try {
        const courts = await this.courtRepository.findByTournamentId(tournament.id);
        this.availableCourts.set(courts);
      } catch (error) {
        console.error('Failed to load courts:', error);
        this.availableCourts.set([]);
      }
    } else {
      // Fallback: try to load tournament from bracket if not already loaded
      const match = this.match();
      if (match?.bracketId) {
        try {
          const bracket = await this.bracketService.getBracketById(match.bracketId);
          const courts = await this.courtRepository.findByTournamentId(bracket.tournamentId);
          this.availableCourts.set(courts);
        } catch (error) {
          console.error('Failed to load courts:', error);
          this.availableCourts.set([]);
        }
      }
    }
  }

  /**
   * Opens the update status modal.
   */
  public openStatusModal(): void {
    this.showStatusModal.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    // Reset form to current match status
    const currentMatch = this.match();
    if (currentMatch) {
      this.statusForm.status = currentMatch.status;
    }
    this.statusForm.winnerId = '';
  }

  /**
   * Opens the record scores modal, resetting the sets form to match the current match format.
   */
  public openScoresModal(): void {
    const m = this.match();
    if (m?.participant1TeamId) {
      this.scoresForm.winnerId = m.participant1TeamId;
    } else if (m?.participant1Id) {
      this.scoresForm.winnerId = m.participant1Id;
    } else if (m?.participant1?.id) {
      this.scoresForm.winnerId = m.participant1.id;
    }

    // Reset sets based on format
    if (this.isSuperTiebreakMatch()) {
      this.scoresForm.sets = [
        { participant1Score: 0, participant2Score: 0, tiebreak1: null, tiebreak2: null },
      ];
    } else {
      this.scoresForm.sets = [
        { participant1Score: 0, participant2Score: 0, tiebreak1: null, tiebreak2: null },
        { participant1Score: 0, participant2Score: 0, tiebreak1: null, tiebreak2: null },
        { participant1Score: 0, participant2Score: 0, tiebreak1: null, tiebreak2: null },
      ];
    }

    this.scoreValidationErrors.set([]);
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
      
      // Get selected court details
      const selectedCourtId = this.scheduleForm.courtId.trim();
      const selectedCourt = this.availableCourts().find(c => c.id === selectedCourtId);
      
      await this.matchService.scheduleMatch(
        this.match()!.id,
        selectedCourtId || null,
        selectedCourt?.name || null,
        dateTime,
        this.scheduleForm.ballProvider.trim() || null
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

      // Validation: SCHEDULED status requires scheduledTime
      if (this.statusForm.status === MatchStatus.SCHEDULED) {
        const match = this.match();
        if (!match?.scheduledTime) {
          throw new Error('Cannot mark match as SCHEDULED without a scheduled date and time. Please schedule the match first using the "Schedule Match" button.');
        }
      }

      // Validation: WO/RET/DEF statuses require winner selection
      if (this.statusRequiresWinner(this.statusForm.status)) {
        if (!this.statusForm.winnerId) {
          throw new Error(`Cannot mark match as ${this.statusForm.status} without selecting a winner. Please select which participant won.`);
        }
      }

      // Validation: COMPLETED status requires scores or winner
      if (this.statusForm.status === MatchStatus.COMPLETED) {
        const match = this.match();
        const hasScores = match?.scores && match.scores.length > 0;
        const hasWinner = match?.winnerId;
        
        if (!hasScores && !hasWinner) {
          throw new Error('Cannot mark match as COMPLETED without recording match results. Please submit scores first using the "Record Scores" button.');
        }
      }

      // Update status (and winner if applicable)
      await this.matchService.updateStatus(
        {
          matchId: this.match()!.id,
          status: this.statusForm.status,
          winnerId: this.statusForm.winnerId || undefined,
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

      console.log('[Match Detail] submitScores() called with form data:', {
        rawSets: this.scoresForm.sets,
        winnerId: this.scoresForm.winnerId,
        isRetirement: this.scoresForm.isRetirement,
      });

      const isSuperTiebreak = this.isSuperTiebreakMatch();

      // Build valid sets array based on match format
      let validSets: { setNumber: number; participant1Games: number; participant2Games: number; tiebreakParticipant1: number | null; tiebreakParticipant2: number | null }[];

      if (isSuperTiebreak) {
        // Super tiebreak format: single tiebreak with point inputs
        const tb1 = this.scoresForm.sets[0]?.tiebreak1 ?? 0;
        const tb2 = this.scoresForm.sets[0]?.tiebreak2 ?? 0;
        if (tb1 === 0 && tb2 === 0) {
          throw new Error('Please enter super tiebreak points for both players');
        }
        const tbMax = Math.max(tb1, tb2);
        const tbMin = Math.min(tb1, tb2);
        if (tbMax < 10) {
          throw new Error('Super tiebreak winner must reach at least 10 points');
        }
        if (tbMax - tbMin < 2) {
          throw new Error('Super tiebreak must be won by at least 2 points');
        }
        const p1Wins = tb1 > tb2;
        validSets = [{
          setNumber: 1,
          participant1Games: p1Wins ? 1 : 0,
          participant2Games: p1Wins ? 0 : 1,
          tiebreakParticipant1: tb1,
          tiebreakParticipant2: tb2,
        }];
      } else {
        // Regular sets with optional per-set tiebreak
        validSets = this.scoresForm.sets
          .filter(set => set.participant1Score > 0 || set.participant2Score > 0)
          .map((set, index) => ({
            setNumber: index + 1,
            participant1Games: set.participant1Score,
            participant2Games: set.participant2Score,
            tiebreakParticipant1: set.tiebreak1 ?? null,
            tiebreakParticipant2: set.tiebreak2 ?? null,
          }));

        if (validSets.length === 0) {
          throw new Error('Please enter at least one set score');
        }

        // Validate tennis scoring rules
        const validation = this.getScoreValidator().validateMatch(validSets);
        console.log('[Match Detail] Score validation result:', validation);
        if (!validation.isValid) {
          this.scoreValidationErrors.set(validation.errors);
          this.errorMessage.set('Invalid tennis score. Please check the errors below and correct the scores.');
          return;
        }
      }

      console.log('[Match Detail] validSets after filtering:', validSets);

      if (!this.scoresForm.winnerId) {
        throw new Error('Please select a winner');
      }

      console.log('[Match Detail] Calling matchService.recordResult with:', {
        matchId: this.match()!.id,
        winnerId: this.scoresForm.winnerId,
        sets: validSets,
        isRetirement: this.scoresForm.isRetirement,
        userId: user.id,
      });

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

      console.log('[Match Detail] recordResult completed successfully');
      this.successMessage.set('Match result recorded successfully');
      this.closeModals();
      await this.loadMatch(this.match()!.id);
      console.log('[Match Detail] Match reloaded after score submission');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to record scores';
      console.error('[Match Detail] submitScores() error:', error);
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
      this.scoresForm.sets.push({ participant1Score: 0, participant2Score: 0, tiebreak1: null, tiebreak2: null });
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
      timeZone: 'UTC',
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
