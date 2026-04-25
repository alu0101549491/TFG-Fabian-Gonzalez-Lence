/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file src/presentation/pages/brackets/bracket-view/bracket-view.component.ts
 * @desc Interactive bracket visualization (single-elimination, round-robin, group stages).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Component, OnInit, signal, computed, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {BracketService, TournamentService, MatchService} from '@application/services';
import {ExportService} from '@application/services/export.service';
import {type BracketDto, type PhaseDto, type TournamentDto, type MatchDto} from '@application/dto';
import {AuthStateService, TournamentStateService} from '@presentation/services';
import {UserRole} from '@domain/enumerations/user-role';
import {EnumFormatPipe} from '@shared/pipes';
import {VisualBracketComponent} from '@presentation/components/visual-bracket/visual-bracket.component';
import templateHtml from './bracket-view.component.html?raw';
import styles from './bracket-view.component.css?raw';

/**
 * BracketViewComponent displays tournament bracket structure.
 */
@Component({
  selector: 'app-bracket-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, EnumFormatPipe, VisualBracketComponent],
  template: templateHtml,
  styles: [styles],
})
export class BracketViewComponent implements OnInit {
  /** Services */
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bracketService = inject(BracketService);
  private readonly tournamentService = inject(TournamentService);
  private readonly matchService = inject(MatchService);
  private readonly authStateService = inject(AuthStateService);
  protected readonly tournamentStateService = inject(TournamentStateService);
  private readonly exportService = inject(ExportService);

  /** Bracket ID */
  private bracketId = '';

  /** Tournament data */
  public tournament = signal<TournamentDto | null>(null);

  /** Bracket data */
  public bracket = signal<BracketDto | null>(null);

  /** Bracket phases */
  public phases = signal<PhaseDto[]>([]);

  /** Bracket matches */
  public matches = signal<MatchDto[]>([]);

  /** Main draw phases (order < 100, excluding qualifying) */
  public mainPhases = computed(() => 
    this.phases().filter(p => p.order < 100 && p.phaseType !== 'QUALIFYING')
  );

  /** Main draw matches (round < 100, excluding qualifying) */
  public mainMatches = computed(() => {
    const qualPhaseIds = new Set(this.qualifyingPhases().map(p => p.id));
    return this.matches().filter(m => m.round < 100 && !qualPhaseIds.has(m.phaseId));
  });

  /** Consolation phases (order >= 100) */
  public consolationPhases = computed(() => 
    this.phases().filter(p => p.order >= 100)
  );

  /** Consolation matches (round >= 100) */
  public consolationMatches = computed(() => 
    this.matches().filter(m => m.round >= 100)
  );

  /** Qualifying phases (phaseType === 'QUALIFYING') */
  public qualifyingPhases = computed(() => 
    this.phases().filter(p => p.phaseType === 'QUALIFYING')
  );

  /** Qualifying matches (from qualifying phases) */
  public qualifyingMatches = computed(() => {
    const qualPhaseIds = new Set(this.qualifyingPhases().map(p => p.id));
    return this.matches().filter(m => qualPhaseIds.has(m.phaseId));
  });

  /**
   * Returns the matches that belong to a specific consolation phase.
   *
   * @param phaseId - Consolation phase identifier
   * @returns Matches scoped to the provided phase
   */
  public getConsolationMatchesByPhase(phaseId: string): MatchDto[] {
    return this.consolationMatches().filter(m => m.phaseId === phaseId);
  }

  /**
   * Returns the matches that belong to a specific qualifying phase.
   *
   * @param phaseId - Qualifying phase identifier
   * @returns Matches scoped to the provided phase
   */
  public getQualifyingMatchesByPhase(phaseId: string): MatchDto[] {
    return this.qualifyingMatches().filter(m => m.phaseId === phaseId);
  }

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** Publishing state */
  public isPublishing = signal(false);

  /** Regenerating state */
  public isRegenerating = signal(false);

  /** Show regenerate confirmation modal */
  public showRegenerateModal = signal(false);

  /** Preserve completed results when regenerating the bracket */
  public regenerateKeepResults = signal(false);

  /**
   * Initializes component and loads bracket data.
   */
  public ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const bracketId = params.get('id');
      if (bracketId) {
        this.bracketId = bracketId;
        void this.loadData(bracketId);
      }
    });
  }

  /**
   * Loads tournament and bracket data.
   *
   * @param bracketId - ID of the bracket
   */
  private async loadData(bracketId: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      // Load bracket first to get tournament ID
      const bracket = await this.bracketService.getBracketById(bracketId);
      this.bracket.set(bracket);

      // Load tournament
      const tournament = await this.tournamentService.getTournamentById(bracket.tournamentId);
      this.tournament.set(tournament);

      // Load ALL brackets from the tournament to include qualifying/consolation brackets
      const allBrackets = await this.bracketService.getBracketsByTournament(bracket.tournamentId);

      // Load phases from ALL brackets (main, qualifying, consolation)
      const allPhasesPromises = allBrackets.map(b => this.bracketService.getPhases(b.id));
      const phasesArrays = await Promise.all(allPhasesPromises);
      const allPhases = phasesArrays.flat();

      // Load matches from ALL brackets
      const allMatchesPromises = allBrackets.map(b => this.matchService.getMatchesByBracket(b.id));
      const matchesArrays = await Promise.all(allMatchesPromises);
      const allMatches = matchesArrays.flat();

      this.phases.set(allPhases);
      this.matches.set(allMatches);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load data';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Checks if current user can manage this tournament.
   *
   * @returns True if user is tournament organizer or admin
   */
  public canManageTournament(): boolean {
    const user = this.authStateService.getCurrentUser();
    if (!user) return false;

    const tournament = this.tournament();
    if (!tournament) return false;

    return (
      user.id === tournament.organizerId ||
      user.role === UserRole.TOURNAMENT_ADMIN ||
      user.role === UserRole.SYSTEM_ADMIN
    );
  }

  /**
   * Exports bracket as PDF document.
   */
  public async exportBracketToPDF(): Promise<void> {
    const bracket = this.bracket();
    if (!bracket) return;

    try {
      await this.exportService.exportBracketToPDF(bracket.id);
    } catch (error) {
      console.error('Bracket export failed:', error);
      alert('Failed to export bracket as PDF');
    }
  }

  /**
   * Publishes the bracket to make it visible to participants.
   */
  public async publishBracket(): Promise<void> {
    const bracket = this.bracket();
    if (!bracket) return;

    const confirmed = confirm(
      'Publish this bracket?\n\n' +
      'This will make the bracket visible to all participants and send notifications.'
    );
    if (!confirmed) return;

    const currentUser = this.authStateService.getCurrentUser();
    if (!currentUser) {
      alert('You must be logged in to perform this action');
      return;
    }

    this.isPublishing.set(true);

    try {
      const updatedBracket = await this.bracketService.publishBracket(bracket.id, currentUser.id);
      // Update the bracket signal with the fresh data from the server
      this.bracket.set(updatedBracket);
      alert('Bracket published successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to publish bracket';
      alert(`Error: ${message}`);
    } finally {
      this.isPublishing.set(false);
    }
  }

  /**
   * Checks if bracket has any completed matches.
   *
   * @returns True if there are matches with results
   */
  public hasCompletedMatches(): boolean {
    const matches = this.matches();
    return matches.some(m => m.winnerId !== null && m.winnerId !== undefined);
  }

  /**
   * Shows the regenerate bracket confirmation modal.
   */
  public showRegenerateConfirmation(): void {
    this.regenerateKeepResults.set(this.hasCompletedMatches());
    this.showRegenerateModal.set(true);
  }

  /**
   * Hides the regenerate bracket confirmation modal.
   */
  public hideRegenerateModal(): void {
    this.showRegenerateModal.set(false);
    this.regenerateKeepResults.set(false);
  }

  /**
   * Executes the bracket regeneration with selected options.
   */
  public async executeRegenerateBracket(): Promise<void> {
    const bracket = this.bracket();
    if (!bracket) return;

    const currentUser = this.authStateService.getCurrentUser();
    if (!currentUser) {
      alert('You must be logged in to perform this action');
      return;
    }

    const keepResults = this.regenerateKeepResults();

    // Hide modal and start regeneration
    this.hideRegenerateModal();
    this.isRegenerating.set(true);

    try {
      const updatedBracket = await this.bracketService.regenerateBracket(
        bracket.id,
        currentUser.id,
        keepResults
      );
      // Update the bracket signal with the fresh data from the server
      this.bracket.set(updatedBracket);
      alert('Bracket regenerated successfully with updated seeds!');
      
      // Reload phases and matches as they have been regenerated
      const [phases, matches] = await Promise.all([
        this.bracketService.getPhases(updatedBracket.id),
        this.matchService.getMatchesByBracket(updatedBracket.id),
      ]);
      
      this.phases.set(phases);
      this.matches.set(matches);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to regenerate bracket';
      alert(`Error: ${message}`);
    } finally {
      this.isRegenerating.set(false);
    }
  }

  /**
   * Navigates to matches page filtered by this bracket.
   */
  public viewMatches(): void {
    const bracket = this.bracket();
    if (!bracket) return;
    
    void this.router.navigate(['/matches'], {
      queryParams: {bracketId: bracket.id}
    });
  }

  /**
   * Navigates back to tournament detail page.
   * Falls back to bracket's tournamentId if tournament signal is not yet loaded,
   * and ultimately falls back to the tournament list if no context is available.
   */
  public goBack(): void {
    const tournament = this.tournament();
    if (tournament) {
      void this.router.navigate(['/tournaments', tournament.id]);
    } else {
      const bracket = this.bracket();
      if (bracket) {
        void this.router.navigate(['/tournaments', bracket.tournamentId]);
      } else {
        void this.router.navigate(['/tournaments']);
      }
    }
  }

  /**
   * Formats date for display.
   *
   * @param date - Date to format
   * @returns Formatted date string
   */
  public formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
