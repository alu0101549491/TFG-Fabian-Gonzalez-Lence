/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 22, 2026
 * @file src/presentation/services/tournament-state.service.ts
 * @desc Angular injectable service for managing shared tournament state across components.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Injectable, signal, computed} from '@angular/core';
import {type TournamentDto} from '@application/dto';

/**
 * Service for managing the current tournament state.
 *
 * Provides shared access to tournament data across multiple components,
 * particularly for displaying tournament logos and context in subpages
 * (brackets, matches, phases).
 *
 * @example
 * ```typescript
 * // In tournament detail component
 * this.tournamentState.setCurrentTournament(tournament);
 *
 * // In bracket component
 * const logoUrl = this.tournamentState.currentTournamentLogo();
 * ```
 */
@Injectable({providedIn: 'root'})
export class TournamentStateService {
  /** Current tournament signal */
  private readonly _currentTournament = signal<TournamentDto | null>(null);

  /** Public read-only access to current tournament */
  public readonly currentTournament = this._currentTournament.asReadonly();

  /** Computed property for tournament logo URL */
  public readonly currentTournamentLogo = computed(() => {
    const tournament = this._currentTournament();
    return tournament?.logoUrl ?? null;
  });

  /** Computed property for tournament name */
  public readonly currentTournamentName = computed(() => {
    const tournament = this._currentTournament();
    return tournament?.name ?? null;
  });

  /** Computed property for tournament ID */
  public readonly currentTournamentId = computed(() => {
    const tournament = this._currentTournament();
    return tournament?.id ?? null;
  });

  /**
   * Sets the current tournament.
   *
   * @param tournament - Tournament data to set as current
   */
  public setCurrentTournament(tournament: TournamentDto | null): void {
    this._currentTournament.set(tournament);
  }

  /**
   * Clears the current tournament.
   */
  public clearCurrentTournament(): void {
    this._currentTournament.set(null);
  }
}
