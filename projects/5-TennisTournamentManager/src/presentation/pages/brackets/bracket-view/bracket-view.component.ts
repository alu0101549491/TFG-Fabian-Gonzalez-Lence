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

import {Component, OnInit, signal, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {BracketService, TournamentService} from '@application/services';
import {type BracketDto, type PhaseDto, type TournamentDto} from '@application/dto';
import {AuthStateService} from '@presentation/services/auth-state.service';
import {UserRole} from '@domain/enumerations/user-role';
import {EnumFormatPipe} from '@shared/pipes';
import templateHtml from './bracket-view.component.html?raw';
import styles from './bracket-view.component.css?raw';

/**
 * BracketViewComponent displays tournament bracket structure.
 */
@Component({
  selector: 'app-bracket-view',
  standalone: true,
  imports: [CommonModule, RouterModule, EnumFormatPipe],
  template: templateHtml,
  styles: [styles],
})
export class BracketViewComponent implements OnInit {
  /** Services */
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bracketService = inject(BracketService);
  private readonly tournamentService = inject(TournamentService);
  private readonly authStateService = inject(AuthStateService);

  /** Tournament ID */
  private tournamentId = '';

  /** Tournament data */
  public tournament = signal<TournamentDto | null>(null);

  /** Bracket data */
  public bracket = signal<BracketDto | null>(null);

  /** Bracket phases */
  public phases = signal<PhaseDto[]>([]);

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** Publishing state */
  public isPublishing = signal(false);

  /** Regenerating state */
  public isRegenerating = signal(false);

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
        const phases = await this.bracketService.getPhases(brackets[0].id);
        this.phases.set(phases);
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
      user.roles.includes(UserRole.TOURNAMENT_ADMIN) ||
      user.roles.includes(UserRole.SYSTEM_ADMIN)
    );
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
      await this.bracketService.publishBracket(bracket.id, currentUser.id);
      alert('Bracket published successfully!');
      await this.loadBracket(this.tournamentId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to publish bracket';
      alert(`Error: ${message}`);
    } finally {
      this.isPublishing.set(false);
    }
  }

  /**
   * Regenerates the bracket structure.
   */
  public async regenerateBracket(): Promise<void> {
    const bracket = this.bracket();
    if (!bracket) return;

    const confirmed = confirm(
      'Regenerate bracket?\n\n' +
      'WARNING: This will reset all matches and pairings. This action cannot be undone.'
    );
    if (!confirmed) return;

    const currentUser = this.authStateService.getCurrentUser();
    if (!currentUser) {
      alert('You must be logged in to perform this action');
      return;
    }

    this.isRegenerating.set(true);

    try {
      await this.bracketService.regenerateBracket(bracket.id, currentUser.id);
      alert('Bracket regenerated successfully!');
      await this.loadBracket(this.tournamentId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to regenerate bracket';
      alert(`Error: ${message}`);
    } finally {
      this.isRegenerating.set(false);
    }
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
