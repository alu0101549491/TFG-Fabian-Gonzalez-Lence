/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 10, 2026
 * @file src/application/services/phase.service.ts
 * @desc Service for managing multi-phase tournaments and phase linking operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Injectable, inject, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {type PhaseDto} from '@application/dto';

/**
 * DTO for linking two phases in sequence.
 */
export interface LinkPhasesDto {
  /** ID of the source phase (qualifying, round robin, etc.) */
  sourcePhaseId: string;
  /** ID of the target phase (main draw, knockout, etc.) */
  targetPhaseId: string;
}

/**
 * DTO for advancing qualifiers from Round Robin to next phase.
 */
export interface AdvanceQualifiersDto {
  /** ID of the source phase (Round Robin). */
  sourcePhaseId: string;
  /** ID of the target phase (next round/bracket). */
  targetPhaseId: string;
  /** Number of top qualifiers to advance. */
  qualifierCount: number;
  /** ID of the tournament. */
  tournamentId: string;
  /** ID of the target category. */
  categoryId: string;
}

/**
 * DTO for creating consolation draws.
 */
export interface CreateConsolationDrawDto {
  /** ID of the main phase. */
  mainPhaseId: string;
  /** Tournament ID. */
  tournamentId: string;
  /** Category ID. */
  categoryId: string;
  /** Round from which losers enter consolation (optional). */
  eliminationRound?: number;
}

/**
 * DTO for populating consolation draws with losers.
 */
export interface PopulateConsolationDrawDto {
  /** ID of the consolation phase. */
  consolationPhaseId: string;
  /** Tournament ID. */
  tournamentId: string;
  /** Category ID. */
  categoryId: string;
}

/**
 * DTO for Lucky Loser promotion.
 */
export interface PromoteLuckyLoserDto {
  /** ID of the withdrawn participant. */
  withdrawnParticipantId: string;
  /** ID of the phase. */
  phaseId: string;
  /** ID of the tournament. */
  tournamentId: string;
  /** ID of the category. */
  categoryId: string;
}

/**
 * Service for managing tournament phases and multi-phase operations.
 *
 * Handles:
 * - Phase linking (qualifying → main → consolation)
 * - Qualifier advancement from Round Robin
 * - Consolation draw creation
 * - Lucky Loser promotion
 *
 * @example
 * ```typescript
 * // Link qualifying phase to main draw
 * await phaseService.linkPhases({

 *   targetPhaseId: 'main-draw-1'
 * });
 *
 * // Advance top 4 from Round Robin
 * await phaseService.advanceQualifiers({
 *   sourcePhaseId: 'rr-group-a',
 *   targetPhaseId: 'knockout-r16',
 *   qualifierCount: 4,
 *   tournamentId: 'tournament-123',
 *   categoryId: 'mens-singles'
 * });
 * ```
 */
@Injectable({providedIn: 'root'})
export class PhaseService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/phases`;

  /** Loading state for async operations */
  public readonly loading = signal(false);

  /** Error message from last operation */
  public readonly error = signal<string | null>(null);

  /**
   * Link two phases in sequence (source → target).
   *
   * Validates phase sequence and updates the source phase's nextPhaseId property.
   *
   * @param data - Link phases DTO
   * @returns Promise resolving to result with both phases
   * @throws Error if phases don't exist or create a cycle
   */
  public async linkPhases(data: LinkPhasesDto): Promise<{
    message: string;
    sourcePhase: PhaseDto;
    targetPhase: PhaseDto;
  }> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const result = await this.http
        .post<{message: string; sourcePhase: PhaseDto; targetPhase: PhaseDto}>(
          `${this.apiUrl}/link`,
          data
        )
        .toPromise();

      if (!result) {
        throw new Error('Failed to link phases');
      }

      return result;
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'Failed to link phases';
      this.error.set(errorMessage);
      throw new Error(errorMessage);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Advance top qualifiers from Round Robin to next phase.
   *
   * Queries standings, identifies top N participants, creates registrations
   * in the target phase with AcceptanceType.QUALIFIER.
   *
   * @param data - Qualifier advancement parameters
   * @returns Promise resolving to array of qualified participant IDs
   * @throws Error if standings incomplete or participants already registered
   */
  public async advanceQualifiers(data: AdvanceQualifiersDto): Promise<{
    message: string;
    qualifiedParticipants: string[];
    registrations: any[];
  }> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const result = await this.http
        .post<{message: string; qualifiedParticipants: string[]; registrations: any[]}>(
          `${this.apiUrl}/advance-qualifiers`,
          data
        )
        .toPromise();

      if (!result) {
        throw new Error('Failed to advance qualifiers');
      }

      return result;
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'Failed to advance qualifiers';
      this.error.set(errorMessage);
      throw new Error(errorMessage);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Create consolation draw for eliminated participants.
   *
   * Identifies losers from the main phase and generates a consolation bracket.
   *
   * @param data - Consolation draw creation parameters
   * @returns Promise resolving to created consolation phase
   * @throws Error if main phase not found or consolation already exists
   */
  public async createConsolationDraw(data: CreateConsolationDrawDto): Promise<{
    message: string;
    consolationPhase: PhaseDto;
    note: string;
  }> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const result = await this.http
        .post<{message: string; consolationPhase: PhaseDto; note: string}>(
          `${this.apiUrl}/consolation`,
          data
        )
        .toPromise();

      if (!result) {
        throw new Error('Failed to create consolation draw');
      }

      return result;
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'Failed to create consolation draw';
      this.error.set(errorMessage);
      throw new Error(errorMessage);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Populate consolation draw with losers from main phase.
   *
   * Identifies losers from completed matches in the main phase,
   * creates registrations for them, and generates consolation bracket matches.
   *
   * @param data - Populate consolation draw parameters
   * @returns Promise resolving to populated consolation phase details
   * @throws Error if consolation phase not found or no completed matches
   */
  public async populateConsolationDraw(data: PopulateConsolationDrawDto): Promise<{
    message: string;
    losersCount: number;
    matchesCreated: number;
    consolationPhase: PhaseDto;
    losers: string[];
  }> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const result = await this.http
        .post<{
          message: string;
          losersCount: number;
          matchesCreated: number;
          consolationPhase: PhaseDto;
          losers: string[];
        }>(`${this.apiUrl}/populate-consolation`, data)
        .toPromise();

      if (!result) {
        throw new Error('Failed to populate consolation draw');
      }

      return result;
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'Failed to populate consolation draw';
      this.error.set(errorMessage);
      throw new Error(errorMessage);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Promote alternate to Lucky Loser when participant withdraws.
   *
   * Finds the first ALTERNATE in the waiting list and updates their
   * acceptance type to LUCKY_LOSER.
   *
   * @param data - Lucky Loser promotion parameters
   * @returns Promise resolving to promotion result
   * @throws Error if withdrawn participant not found
   */
  public async promoteLuckyLoser(data: PromoteLuckyLoserDto): Promise<{
    message: string;
    withdrawnParticipantId: string;
    promotedParticipantId: string | null;
    registration?: any;
  }> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const result = await this.http
        .post<{
          message: string;
          withdrawnParticipantId: string;
          promotedParticipantId: string | null;
          registration?: any;
        }>(`${this.apiUrl}/promote-lucky-loser`, data)
        .toPromise();

      if (!result) {
        throw new Error('Failed to promote Lucky Loser');
      }

      return result;
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'Failed to promote Lucky Loser';
      this.error.set(errorMessage);
      throw new Error(errorMessage);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Get all phases for a bracket.
   *
   * @param bracketId - ID of the bracket
   * @returns Promise resolving to array of phases
   */
  public async getPhasesByBracket(bracketId: string): Promise<PhaseDto[]> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const result = await this.http
        .get<PhaseDto[]>(`${this.apiUrl}`, {
          params: {bracketId},
        })
        .toPromise();

      return result || [];
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'Failed to load phases';
      this.error.set(errorMessage);
      throw new Error(errorMessage);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Create a new tournament phase with an associated empty bracket.
   *
   * Creates an empty bracket and a phase within it, ready to receive participants
   * and have matches generated. Use to set up qualifying rounds or additional draws.
   *
   * @param data - Phase creation parameters
   * @returns Promise resolving to created bracket and phase
   * @throws Error if tournament or category not found
   *
   * @example
   * ```typescript
   * await phaseService.createPhase({
   *   tournamentId: 'trn_123',
   *   categoryId: 'cat_456',
   *   phaseName: 'Qualifying Round',
   *   phaseType: 'QUALIFYING',
   *   bracketType: 'ROUND_ROBIN',
   * });
   * ```
   */
  public async createPhase(data: {
    tournamentId: string;
    categoryId: string;
    phaseName: string;
    phaseType?: 'QUALIFYING' | 'MAIN' | 'CONSOLATION' | 'CUSTOM';
    bracketType?: 'SINGLE_ELIMINATION' | 'ROUND_ROBIN' | 'MATCH_PLAY';
  }): Promise<{
    message: string;
    bracket: any;
    phase: PhaseDto;
  }> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const result = await this.http
        .post<{message: string; bracket: any; phase: PhaseDto}>(`${this.apiUrl}/create`, data)
        .toPromise();

      if (!result) {
        throw new Error('Failed to create phase');
      }

      return result;
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'Failed to create phase';
      this.error.set(errorMessage);
      throw new Error(errorMessage);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Delete a custom phase and its associated bracket.
   * Only CUSTOM phases can be deleted; auto-generated phases (MAIN, QUALIFYING, CONSOLATION) are protected.
   *
   * @param phaseId - ID of the phase to delete
   * @returns Promise resolving to deletion confirmation
   * @throws Error if phase is not CUSTOM type or is linked by other phases
   *
   * @example
   * ```typescript
   * await phaseService.deletePhase('phs_123');
   * ```
   */
  public async deletePhase(phaseId: string): Promise<{
    message: string;
    deletedPhaseId: string;
    deletedBracket: boolean;
  }> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const result = await this.http
        .delete<{message: string; deletedPhaseId: string; deletedBracket: boolean}>(`${this.apiUrl}/${phaseId}`)
        .toPromise();

      if (!result) {
        throw new Error('Failed to delete phase');
      }

      return result;
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'Failed to delete phase';
      this.error.set(errorMessage);
      throw new Error(errorMessage);
    } finally {
      this.loading.set(false);
    }
  }
}
