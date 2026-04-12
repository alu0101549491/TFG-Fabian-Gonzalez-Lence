/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/pages/brackets/bracket-view/bracket-view.component.ts
 * @desc Interactive bracket visualization (single-elimination, round-robin, group stages).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, OnInit, signal, computed, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {BracketService, TournamentService, MatchService} from '@application/services';
import {ExportService} from '@application/services/export.service';
import {type BracketDto, type PhaseDto, type TournamentDto, type MatchDto} from '@application/dto';
import {AuthStateService} from '@presentation/services/auth-state.service';
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
  private readonly exportService = inject(ExportService);

  /** Tournament ID */
  private tournamentId = '';

  /** Tournament data */
  public tournament = signal<TournamentDto | null>(null);

  /** Bracket data */
  public bracket = signal<BracketDto | null>(null);

  /** Bracket phases */
  public phases = signal<PhaseDto[]>([]);

  /** Bracket matches */
  public matches = signal<MatchDto[]>([]);

  /** Main draw phases (order < 100) */
  public mainPhases = computed(() => 
    this.phases().filter(p => p.order < 100)
  );

  /** Main draw matches (round < 100) */
  public mainMatches = computed(() => 
    this.matches().filter(m => m.round < 100)
  );

  /** Consolation phases (order >= 100) */
  public consolationPhases = computed(() => 
    this.phases().filter(p => p.order >= 100)
  );

  /** Consolation matches (round >= 100) */
  public consolationMatches = computed(() => 
    this.matches().filter(m => m.round >= 100)
  );

  /**
   * Returns the matches that belong to a specific consolation phase.
   *
   * @param phaseId - Consolation phase identifier
   * @returns Matches scoped to the provided phase
   */
  public getConsolationMatchesByPhase(phaseId: string): MatchDto[] {
    return this.consolationMatches().filter(m => m.phaseId === phaseId);
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
      const tournamentId = params.get('id');
      if (tournamentId) {
        this.tournamentId = tournamentId;
        void this.loadData(tournamentId);
      }
    });
  }

  /**
   * Loads tournament and bracket data.
   *
   * @param tournamentId - ID of the tournament
   */
  private async loadData(tournamentId: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      // Load tournament and bracket in parallel
      const [tournament] = await Promise.all([
        this.tournamentService.getTournamentById(tournamentId),
        this.loadBracket(tournamentId),
      ]);
      this.tournament.set(tournament);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load data';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Loads bracket for tournament.
   *
   * @param tournamentId - ID of the tournament
   */
  private async loadBracket(tournamentId: string): Promise<void> {
    try {
      const brackets = await this.bracketService.getBracketsByTournament(tournamentId);
      if (brackets.length > 0) {
        this.bracket.set(brackets[0]);
        
        // Load phases and matches in parallel
        const [phases, matches] = await Promise.all([
          this.bracketService.getPhases(brackets[0].id),
          this.matchService.getMatchesByBracket(brackets[0].id),
        ]);
        
        this.phases.set(phases);
        this.matches.set(matches);
      }
    } catch (error) {
      // Bracket not found is not an error - it's expected if no bracket generated yet
      console.log('No bracket found for tournament');
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
   */
  public goBack(): void {
    void this.router.navigate(['/tournaments', this.tournamentId]);
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
