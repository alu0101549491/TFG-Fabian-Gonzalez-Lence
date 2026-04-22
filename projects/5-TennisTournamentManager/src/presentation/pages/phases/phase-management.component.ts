/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 10, 2026
 * @file src/presentation/pages/phases/phase-management.component.ts
 * @desc Component for multi-phase tournament management (linking, qualifiers, consolation).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {PhaseService} from '../../../application/services/phase.service';
import {TournamentService} from '../../../application/services/tournament.service';
import {BracketService} from '../../../application/services/bracket.service';
import {RegistrationService} from '../../../application/services/registration.service';
import {PartnerInvitationService} from '../../../infrastructure/services/partner-invitation.service';
import {type PhaseDto, type TournamentDto, type BracketDto, type RegistrationDto} from '../../../application/dto';
import {AuthStateService, TournamentStateService} from '@presentation/services';
import {UserRepositoryImpl} from '../../../infrastructure/repositories/user.repository';
import templateHtml from './phase-management.component.html?raw';
import styles from './phase-management.component.css?raw';

/**
 * Interface for phase selection options in dropdowns.
 */
interface PhaseOption {
  phaseId: string;
  phaseName: string;
  bracketId: string;
  bracketName: string;
  tournamentId: string;
  tournamentName: string;
  tournamentType: string; // 'SINGLES' or 'DOUBLES'
  displayLabel: string;
  categoryId?: string;
}

/**
 * Interface for participant selection options in Lucky Loser dropdown.
 */
interface ParticipantOption {
  participantId: string;
  participantName: string;
  registrationId: string;
  seedNumber: number | null;
  acceptanceType: string;
  displayLabel: string;
}

/**
 * Phase Management Component for tournament administrators.
 *
 * Administrative interface for multi-phase tournament operations:
 * - Link qualifying rounds to main draws
 * - Advance top qualifiers from Round Robin
 * - Create consolation brackets
 * - Promote Lucky Losers when participants withdraw
 *
 * **Access**: TOURNAMENT_ADMIN, SYSTEM_ADMIN only
 *
 * @example
 * Route: /tournaments/:tournamentId/phases
 */
@Component({
  selector: 'app-phase-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: templateHtml,
  styles: [styles],
})
export class PhaseManagementComponent implements OnInit {
  private readonly phaseService = inject(PhaseService);
  private readonly tournamentService = inject(TournamentService);
  private readonly bracketService = inject(BracketService);
  private readonly registrationService = inject(RegistrationService);
  private readonly partnerInvitationService = inject(PartnerInvitationService);
  private readonly userRepository = inject(UserRepositoryImpl);
  private readonly authState = inject(AuthStateService);
  protected readonly tournamentStateService = inject(TournamentStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** Current tournament ID from route */
  protected tournamentId = signal<string | null>(null);

  /** Current tournament details */
  protected tournament = signal<any>(null);

  /** Available phases in the tournament */
  protected phases = signal<PhaseDto[]>([]);

  /** All available phase options across all tournaments */
  protected allPhaseOptions = signal<PhaseOption[]>([]);

  /** Filtered source phase options (only from current tournament) */
  protected sourcePhaseOptions = signal<PhaseOption[]>([]);

  /** Filtered target phase options (only from tournaments with admin access) */
  protected targetPhaseOptions = signal<PhaseOption[]>([]);

  /** Withdrawable participants (ACCEPTED players who can be withdrawn for Lucky Loser) */
  protected withdrawableParticipants = signal<ParticipantOption[]>([]);

  /** Loading state */
  protected isLoading = signal<boolean>(true);

  /** Operation in progress */
  protected isProcessing = signal<boolean>(false);

  /** Error message */
  protected error = signal<string | null>(null);

  /** Success message */
  protected success = signal<string | null>(null);

  /** Active tab for operations */
  protected activeTab = signal<'link' | 'advance' | 'consolation' | 'lucky-loser'>('link');

  // Form models for each operation
  protected linkForm = signal({
    sourcePhaseId: '',
    targetPhaseId: '',
  });

  protected advanceForm = signal({
    sourcePhaseId: '',
    targetPhaseId: '',
    qualifierCount: 2, // Default to 2, will be adjusted based on tournament type
    categoryId: '',
  });

  protected consolationForm = signal({
    mainPhaseId: '',
    categoryId: '',
    eliminationRound: 1,
    consolationPhaseId: '', // Track created consolation phase for population
  });

  protected luckyLoserForm = signal({
    withdrawnParticipantId: '',
    phaseId: '',
    categoryId: '',
  });

  /**
   * Initializes component by checking admin permissions and loading data.
   */
  public ngOnInit(): void {
    this.checkAdminAccess();
    this.loadTournamentData();
  }

  /**
   * Check if current user has admin privileges.
   */
  private checkAdminAccess(): void {
    const currentUser = this.authState.getCurrentUser();

    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    const role = currentUser.role;
    if (role !== 'SYSTEM_ADMIN' && role !== 'TOURNAMENT_ADMIN') {
      this.error.set('Access denied: This page is for administrators only.');
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 3000);
    }
  }

  /**
   * Load tournament and phases data.
   */
  private async loadTournamentData(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const id = this.route.snapshot.paramMap.get('tournamentId');
      if (!id) {
        throw new Error('Tournament ID is required');
      }

      this.tournamentId.set(id);

      // Load tournament details
      const tournamentData = await this.tournamentService.getTournamentById(id);
      this.tournament.set(tournamentData);

      // Adjust qualifier count default based on tournament type
      const isDoubles = tournamentData.tournamentType === 'DOUBLES';
      this.advanceForm.update(form => ({
        ...form,
        qualifierCount: isDoubles ? 2 : 4, // Doubles: 2 teams, Singles: 4 players
      }));

      // Load all available phase options for dropdowns
      await this.loadAllPhaseOptions();

      // Load existing phase links and populate forms
      await this.loadExistingPhaseLinks();

      this.isLoading.set(false);
    } catch (err: any) {
      console.error('Failed to load tournament data:', err);
      this.error.set(err.message || 'Failed to load tournament data');
      this.isLoading.set(false);
    }
  }

  /**
   * Load all tournaments, brackets, and phases for dropdown selection.
   */
  private async loadAllPhaseOptions(): Promise<void> {
    try {
      // Fetch all tournaments (unpaginated for admin view)
      const tournamentsResponse = await this.tournamentService.listTournaments(
        {}, // No filters
        {page: 1, pageSize: 1000} // Large page size to get all
      );

      console.log(`Found ${tournamentsResponse.items.length} tournaments:`, tournamentsResponse.items.map(t => t.name));

      const phaseOptions: PhaseOption[] = [];

      // For each tournament, fetch its brackets and phases
      for (const tournament of tournamentsResponse.items) {
        console.log(`Loading brackets for: ${tournament.name} (${tournament.id})`);
        try {
          // Fetch brackets for this tournament
          const brackets = await this.bracketService.getBracketsByTournament(tournament.id);
          console.log(`  Found ${brackets.length} brackets for ${tournament.name}`);

          // For each bracket, fetch phases
          for (const bracket of brackets) {
            console.log(`    Loading phases for bracket: ${bracket.category?.name || 'Main'} (${bracket.id})`);
            try {
              const phases = await this.phaseService.getPhasesByBracket(bracket.id);
              console.log(`      Found ${phases.length} phases:`, phases.map(p => p.name));

              // Create options for each phase
              for (const phase of phases) {
                const bracketName = bracket.category?.name || 'Main Draw';
                const categoryId = bracket.category?.id || (bracket as any).categoryId;

                phaseOptions.push({
                  phaseId: phase.id,
                  phaseName: phase.name,
                  bracketId: bracket.id,
                  bracketName,
                  tournamentId: tournament.id,
                  tournamentName: tournament.name,
                  tournamentType: tournament.tournamentType,
                  displayLabel: `${tournament.name} > ${bracketName} > ${phase.name}`,
                  categoryId,
                });
              }
            } catch (err) {
              console.warn(`Failed to load phases for bracket ${bracket.id}:`, err);
            }
          }
        } catch (err) {
          console.warn(`Failed to load brackets for tournament ${tournament.id}:`, err);
        }
      }

      this.allPhaseOptions.set(phaseOptions);
      console.log(`✅ Loaded ${phaseOptions.length} phase options total`);
      console.log('Phase options:', phaseOptions);

      // Filter source phases to only current tournament
      const currentTournamentId = this.tournamentId();
      const sourceOptions = phaseOptions.filter(p => p.tournamentId === currentTournamentId);
      this.sourcePhaseOptions.set(sourceOptions);
      console.log(`✅ Filtered ${sourceOptions.length} source phase options for current tournament`);

      // Target phases will be filtered based on source phase tournament type
      // Initially show all phases (will be filtered when source is selected)
      this.targetPhaseOptions.set(phaseOptions);
      console.log(`✅ Loaded ${phaseOptions.length} target phase options (will filter by type on source selection)`);
    } catch (err: any) {
      console.error('Failed to load phase options:', err);
      // Don't throw - allow component to continue with empty options
    }
  }

  /**
   * Load existing phase links and populate form fields.
   */
  private async loadExistingPhaseLinks(): Promise<void> {
    try {
      const currentTournamentId = this.tournamentId();
      if (!currentTournamentId) return;

      // Get all brackets for current tournament
      const brackets = await this.bracketService.getBracketsByTournament(currentTournamentId);

      // Collect all phases from these brackets
      const allCurrentPhases: PhaseDto[] = [];
      for (const bracket of brackets) {
        try {
          const phases = await this.phaseService.getPhasesByBracket(bracket.id);
          allCurrentPhases.push(...phases);
        } catch (err) {
          console.warn(`Failed to load phases for bracket ${bracket.id}:`, err);
        }
      }

      // Check if any phase has a nextPhaseId set (existing link)
      const linkedPhase = allCurrentPhases.find(p => p.nextPhaseId);
      if (linkedPhase) {
        console.log('Found existing phase link:', linkedPhase);
        this.linkForm.set({
          sourcePhaseId: linkedPhase.id,
          targetPhaseId: linkedPhase.nextPhaseId!,
        });

        // Filter target phases based on source tournament type (without clearing target selection)
        this.filterTargetPhasesByType(linkedPhase.id);

        // Also populate advance form with the same link
        const targetOption = this.allPhaseOptions().find(opt => opt.phaseId === linkedPhase.nextPhaseId);
        if (targetOption) {
          this.advanceForm.update(form => ({
            ...form,
            sourcePhaseId: linkedPhase.id,
            targetPhaseId: linkedPhase.nextPhaseId!,
            categoryId: targetOption.categoryId || '',
          }));
        }
      }
    } catch (err: any) {
      console.error('Failed to load existing phase links:', err);
      // Don't throw - allow component to continue
    }
  }

  /**
   * Switch between operation tabs.
   *
   * @param tab - Tab identifier
   */
  protected switchTab(tab: 'link' | 'advance' | 'consolation' | 'lucky-loser'): void {
    this.activeTab.set(tab);
    this.clearMessages();
  }

  /**
   * Get appropriate label for qualifier count based on tournament type.
   */
  protected getQualifierLabel(): string {
    const tournament = this.tournament();
    return tournament?.tournamentType === 'DOUBLES' ? 'Number of Team Qualifiers' : 'Number of Qualifiers';
  }

  /**
   * Get appropriate hint text for qualifier count based on tournament type.
   */
  protected getQualifierHint(): string {
    const tournament = this.tournament();
    return tournament?.tournamentType === 'DOUBLES' 
      ? 'How many top teams should advance (e.g., top 2)'
      : 'How many top participants should advance (e.g., top 4)';
  }

  /**
   * Get appropriate button text for qualifier advancement based on tournament type.
   */
  protected getQualifierButtonText(): string {
    const tournament = this.tournament();
    const count = this.advanceForm().qualifierCount;
    return tournament?.tournamentType === 'DOUBLES'
      ? `⬆️ Advance Top ${count} Teams`
      : `⬆️ Advance Top ${count} Qualifiers`;
  }

  /**
   * Filter target phase options when source phase changes.
   * Only shows phases from tournaments with matching tournament type (SINGLES/DOUBLES).
   *
   * @param phaseId - Selected source phase ID
   */
  protected onSourcePhaseChange(phaseId: string): void {
    // Clear target phase selection when source changes
    this.linkForm.update(form => ({
      ...form,
      sourcePhaseId: phaseId,
      targetPhaseId: '',
    }));

    // Filter target options based on tournament type
    this.filterTargetPhasesByType(phaseId);
  }

  /**
   * Filter target phase options based on source phase tournament type.
   * Separated from onSourcePhaseChange to allow reuse without clearing target selection.
   *
   * @param sourcePhaseId - Source phase ID to get tournament type from
   */
  private filterTargetPhasesByType(sourcePhaseId: string): void {
    if (!sourcePhaseId) {
      // No source selected - show all phases
      this.targetPhaseOptions.set(this.allPhaseOptions());
      return;
    }

    // Find the selected source phase to get its tournament type
    const sourcePhase = this.allPhaseOptions().find(p => p.phaseId === sourcePhaseId);
    if (!sourcePhase) {
      console.warn('Source phase not found:', sourcePhaseId);
      this.targetPhaseOptions.set(this.allPhaseOptions());
      return;
    }

    // Filter target phases to only show those from tournaments with matching type
    const compatiblePhases = this.allPhaseOptions().filter(
      p => p.tournamentType === sourcePhase.tournamentType
    );

    this.targetPhaseOptions.set(compatiblePhases);
    console.log(
      `Filtered target phases to ${compatiblePhases.length} ${sourcePhase.tournamentType} tournaments`
    );
  }

  /**
   * Auto-populate advance form when target phase changes.
   *
   * @param phaseId - Selected phase ID
   */
  protected onAdvanceTargetPhaseChange(phaseId: string): void {
    const selectedPhase = this.allPhaseOptions().find(p => p.phaseId === phaseId);
    this.advanceForm.update(form => ({
      ...form,
      targetPhaseId: phaseId,
      categoryId: selectedPhase?.categoryId || '',
    }));
  }

  /**
   * Auto-populate consolation form when main phase changes.
   *
   * @param phaseId - Selected phase ID
   */
  protected onConsolationMainPhaseChange(phaseId: string): void {
    const selectedPhase = this.allPhaseOptions().find(p => p.phaseId === phaseId);
    this.consolationForm.update(form => ({
      ...form,
      mainPhaseId: phaseId,
      categoryId: selectedPhase?.categoryId || '',
    }));
  }

  /**
   * Auto-populate lucky loser form when phase changes.
   * Also loads withdrawable participants for the selected phase/category.
   *
   * @param phaseId - Selected phase ID
   */
  protected async onLuckyLoserPhaseChange(phaseId: string): Promise<void> {
    const selectedPhase = this.allPhaseOptions().find(p => p.phaseId === phaseId);
    this.luckyLoserForm.update(form => ({
      ...form,
      phaseId: phaseId,
      categoryId: selectedPhase?.categoryId || '',
      withdrawnParticipantId: '', // Reset selection
    }));

    // Load accepted participants who can be withdrawn
    if (selectedPhase?.categoryId) {
      await this.loadWithdrawableParticipants(this.tournamentId()!, selectedPhase.categoryId);
    }
  }

  /**
   * Load ACCEPTED participants who can be withdrawn for Lucky Loser promotion.
   * For doubles tournaments, displays both players as "Player1 / Player2".
   * Deduplicates team pairs to show each team only once.
   *
   * @param tournamentId - Tournament ID
   * @param categoryId - Category ID
   */
  private async loadWithdrawableParticipants(tournamentId: string, categoryId: string): Promise<void> {
    try {
      const tournament = this.tournament();
      const isDoubles = tournament?.tournamentType === 'DOUBLES';

      // Fetch all registrations for this tournament
      const allRegistrations = await this.registrationService.getRegistrationsByTournament(tournamentId);

      // Filter to ACCEPTED registrations in this category (exclude WITHDRAWN and ALTERNATES)
      const acceptedRegs = allRegistrations.filter(r =>
        r.categoryId === categoryId &&
        r.status === 'ACCEPTED' &&
        (r.acceptanceType === 'DIRECT_ACCEPTANCE' || r.acceptanceType === 'QUALIFIER' || r.acceptanceType === 'LUCKY_LOSER')
      );

      const participantOptions: ParticipantOption[] = [];

      if (isDoubles) {
        // Track seen teams to avoid duplicates (both players have registrations)
        const seenTeams = new Set<string>();

        // For doubles: fetch both players for each registration
        for (const reg of acceptedRegs) {
          if (!reg.partnerId) continue; // Skip incomplete teams

          // Create a normalized team ID by sorting player IDs alphabetically
          // This ensures we only add each team once regardless of which player's registration we see first
          const teamKey = [reg.participantId, reg.partnerId].sort().join('|');
          if (seenTeams.has(teamKey)) continue; // Already processed this team
          seenTeams.add(teamKey);

          try {
            const player1 = await this.userRepository.findPublicById(reg.participantId);
            const player2 = await this.userRepository.findPublicById(reg.partnerId);

            if (player1 && player2) {
              const player1Name = player1.username || `${player1.firstName} ${player1.lastName}` || player1.email;
              const player2Name = player2.username || `${player2.firstName} ${player2.lastName}` || player2.email;
              const teamName = `${player1Name} / ${player2Name}`;
              const seedInfo = reg.seedNumber ? `Seed #${reg.seedNumber}` : reg.acceptanceType;

              participantOptions.push({
                participantId: reg.participantId, // Keep player1 ID for backend
                participantName: teamName,
                registrationId: reg.id,
                seedNumber: reg.seedNumber,
                acceptanceType: reg.acceptanceType,
                displayLabel: `${teamName} (${seedInfo})`,
              });
            }
          } catch (error) {
            console.warn(`Failed to load doubles team for registration ${reg.id}:`, error);
          }
        }
      } else {
        // For singles: fetch individual users
        for (const reg of acceptedRegs) {
          try {
            const user = await this.userRepository.findPublicById(reg.participantId);
            if (user) {
              const displayName = user.username || `${user.firstName} ${user.lastName}` || user.email;
              const seedInfo = reg.seedNumber ? `Seed #${reg.seedNumber}` : reg.acceptanceType;

              participantOptions.push({
                participantId: reg.participantId,
                participantName: displayName,
                registrationId: reg.id,
                seedNumber: reg.seedNumber,
                acceptanceType: reg.acceptanceType,
                displayLabel: `${displayName} (${seedInfo})`,
              });
            }
          } catch (error) {
            console.warn(`Failed to load user ${reg.participantId}:`, error);
          }
        }
      }

      // Sort by seed number (seeded players first), then by name
      participantOptions.sort((a, b) => {
        if (a.seedNumber && b.seedNumber) return a.seedNumber - b.seedNumber;
        if (a.seedNumber) return -1;
        if (b.seedNumber) return 1;
        return a.participantName.localeCompare(b.participantName);
      });

      this.withdrawableParticipants.set(participantOptions);
      console.log(`Loaded ${participantOptions.length} withdrawable ${isDoubles ? 'teams' : 'participants'}`);
    } catch (error) {
      console.error('Failed to load withdrawable participants:', error);
      this.withdrawableParticipants.set([]);
    }
  }

  /**
   * Link two phases in sequence.
   */
  protected async linkPhases(): Promise<void> {
    this.isProcessing.set(true);
    this.clearMessages();

    try {
      const formData = this.linkForm();

      if (!formData.sourcePhaseId || !formData.targetPhaseId) {
        throw new Error('Both source and target phases are required');
      }

      const result = await this.phaseService.linkPhases({
        sourcePhaseId: formData.sourcePhaseId,
        targetPhaseId: formData.targetPhaseId,
      });

      this.success.set(result.message);
      // Don't reset form - keep selections visible
      await this.loadTournamentData();
    } catch (err: any) {
      this.error.set(err.message || 'Failed to link phases');
    } finally {
      this.isProcessing.set(false);
    }
  }

  /**
   * Advance top qualifiers from Round Robin to next phase.
   */
  protected async advanceQualifiers(): Promise<void> {
    this.isProcessing.set(true);
    this.clearMessages();

    try {
      const formData = this.advanceForm();
      const targetPhaseOption = this.allPhaseOptions().find(option => option.phaseId === formData.targetPhaseId);
      const targetTournamentId = targetPhaseOption?.tournamentId || '';

      if (!formData.sourcePhaseId || !formData.targetPhaseId) {
        throw new Error('Source phase and target phase are required');
      }

      if (!formData.categoryId) {
        throw new Error('Category ID is required');
      }

      if (!targetTournamentId) {
        throw new Error('Could not resolve target tournament from selected phase');
      }

      if (formData.qualifierCount < 1) {
        throw new Error('Qualifier count must be at least 1');
      }

      const result = await this.phaseService.advanceQualifiers({
        sourcePhaseId: formData.sourcePhaseId,
        targetPhaseId: formData.targetPhaseId,
        qualifierCount: formData.qualifierCount,
        tournamentId: targetTournamentId,
        categoryId: formData.categoryId,
      });

      this.success.set(`${result.message}. Qualified: ${result.qualifiedParticipants.length} participants.`);
      // Don't reset form - keep selections visible
      await this.loadTournamentData();
    } catch (err: any) {
      this.error.set(err.message || 'Failed to advance qualifiers');
    } finally {
      this.isProcessing.set(false);
    }
  }

  /**
   * Create consolation draw for eliminated participants.
   */
  protected async createConsolationDraw(): Promise<void> {
    this.isProcessing.set(true);
    this.clearMessages();

    try {
      const formData = this.consolationForm();
      const tournamentId = this.tournamentId();

      if (!formData.mainPhaseId || !tournamentId) {
        throw new Error('Main phase and tournament ID are required');
      }

      if (!formData.categoryId) {
        throw new Error('Category ID is required');
      }

      const result = await this.phaseService.createConsolationDraw({
        mainPhaseId: formData.mainPhaseId,
        tournamentId,
        categoryId: formData.categoryId,
        eliminationRound: formData.eliminationRound || undefined,
      });

      // Store consolation phase ID for population
      this.consolationForm.update(form => ({
        ...form,
        consolationPhaseId: result.consolationPhase.id,
      }));

      this.success.set(`${result.message}. Now populate it with losers from the main phase.`);
      await this.loadTournamentData();
    } catch (err: any) {
      this.error.set(err.message || 'Failed to create consolation draw');
    } finally {
      this.isProcessing.set(false);
    }
  }

  /**
   * Populate consolation draw with losers from completed main phase matches.
   */
  protected async populateConsolationDraw(): Promise<void> {
    this.isProcessing.set(true);
    this.clearMessages();

    try {
      const formData = this.consolationForm();
      const tournamentId = this.tournamentId();

      if (!formData.consolationPhaseId || !tournamentId || !formData.categoryId) {
        throw new Error('Consolation phase ID, tournament ID, and category ID are required');
      }

      const result = await this.phaseService.populateConsolationDraw({
        consolationPhaseId: formData.consolationPhaseId,
        tournamentId,
        categoryId: formData.categoryId,
      });

      this.success.set(`${result.message}. ${result.losersCount} losers added, ${result.matchesCreated} matches created. Refresh bracket to see consolation matches.`);
      this.resetConsolationForm();
      await this.loadTournamentData();
    } catch (err: any) {
      this.error.set(err.message || 'Failed to populate consolation draw');
    } finally {
      this.isProcessing.set(false);
    }
  }

  /**
   * Promote alternate to Lucky Loser when participant withdraws.
   */
  protected async promoteLuckyLoser(): Promise<void> {
    this.isProcessing.set(true);
    this.clearMessages();

    try {
      const formData = this.luckyLoserForm();
      const tournamentId = this.tournamentId();

      if (!formData.withdrawnParticipantId || !formData.phaseId || !tournamentId) {
        throw new Error('Withdrawn participant, phase, and tournament ID are required');
      }

      if (!formData.categoryId) {
        throw new Error('Category ID is required');
      }

      const result = await this.phaseService.promoteLuckyLoser({
        withdrawnParticipantId: formData.withdrawnParticipantId,
        phaseId: formData.phaseId,
        tournamentId,
        categoryId: formData.categoryId,
      });

      if (result.promotedParticipantId) {
        this.success.set(`${result.message}. Promoted participant: ${result.promotedParticipantId}. Refresh the tournament details page to see updated participant list.`);
      } else {
        this.success.set(`${result.message}. Refresh the tournament details page to see updated participant list.`);
      }

      // Reload withdrawable participants to reflect the withdrawn player being removed
      if (formData.phaseId && formData.categoryId) {
        await this.loadWithdrawableParticipants(tournamentId, formData.categoryId);
      }

      // Clear only the withdrawn player selection, keep phase selected
      this.luckyLoserForm.update(form => ({
        ...form,
        withdrawnParticipantId: '',
      }));

      await this.loadTournamentData();
    } catch (err: any) {
      this.error.set(err.message || 'Failed to promote Lucky Loser');
    } finally {
      this.isProcessing.set(false);
    }
  }

  /**
   * Clear success and error messages.
   */
  private clearMessages(): void {
    this.error.set(null);
    this.success.set(null);
  }

  /**
   * Reset link form.
   */
  private resetLinkForm(): void {
    this.linkForm.set({
      sourcePhaseId: '',
      targetPhaseId: '',
    });
  }

  /**
   * Reset advance form.
   */
  private resetAdvanceForm(): void {
    this.advanceForm.update((form) => ({
      ...form,
      sourcePhaseId: '',
      targetPhaseId: '',
      qualifierCount: 4,
    }));
  }

  /**
   * Reset consolation form.
   */
  private resetConsolationForm(): void {
    this.consolationForm.update((form) => ({
      ...form,
      mainPhaseId: '',
      eliminationRound: 1,
      consolationPhaseId: '',
    }));
  }

  /**
   * Reset lucky loser form.
   */
  private resetLuckyLoserForm(): void {
    this.luckyLoserForm.set({
      withdrawnParticipantId: '',
      phaseId: '',
      categoryId: '',
    });
  }

  /**
   * Format date for display.
   *
   * @param date - Date to format
   * @returns Formatted date string
   */
  protected formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
