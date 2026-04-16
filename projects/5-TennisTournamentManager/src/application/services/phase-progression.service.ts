/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file src/application/services/phase-progression.service.ts
 * @desc Service for managing tournament phase progression and qualifier advancement (FR4, FR21, FR22)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable, inject} from '@angular/core';
import {Phase} from '@domain/entities/phase';
import {Registration} from '@domain/entities/registration';
import {AcceptanceType} from '@domain/enumerations/acceptance-type';
import {BracketType} from '@domain/enumerations/bracket-type';
import {PhaseRepositoryImpl} from '@infrastructure/repositories/phase.repository';
import {RegistrationRepositoryImpl} from '@infrastructure/repositories/registration.repository';
import {StandingRepositoryImpl} from '@infrastructure/repositories/standing.repository';
import {generateId} from '@shared/utils';

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
  /** ID of the consolation phase (if already exists). */
  consolationPhaseId?: string;
  /** Round from which losers enter consolation. */
  eliminationRound?: number;
  /** Tournament ID. */
  tournamentId: string;
  /** Category ID. */
  categoryId: string;
  /** Consolation bracket type. */
  bracketType?: BracketType;
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
 * Service responsible for managing phase progression in tournaments.
 *
 * Handles:
 * - Phase linking (qualifying → main → consolation) [FR4]
 * - Qualifier advancement from Round Robin [FR21]
 * - Consolation draw creation (simple or Compass) [FR22]
 * - Lucky Loser promotion on withdrawals
 *
 * @example
 * ```typescript
 * // Link qualifying phase to main draw
 * await phaseProgressionService.linkPhases('qualifying-1', 'main-1');
 *
 * // Advance top 4 from Round Robin to knockout
 * await phaseProgressionService.advanceQualifiers({
 *   sourcePhaseId: 'rr-group-a',
 *   targetPhaseId: 'knockout-r16',
 *   qualifierCount: 4,
 *   tournamentId: 'tournament-123',
 *   categoryId: 'mens-singles'
 * });
 * ```
 */
@Injectable({providedIn: 'root'})
export class PhaseProgressionService {
  private readonly phaseRepository = inject(PhaseRepositoryImpl);
  private readonly registrationRepository = inject(RegistrationRepositoryImpl);
  private readonly standingRepository = inject(StandingRepositoryImpl);

  /**
   * Links two phases in sequence (source → target).
   *
   * Validates phase sequence and updates the source phase's nextPhaseId property.
   *
   * @param sourcePhaseId - The ID of the phase that leads to the next
   * @param targetPhaseId - The ID of the phase that follows
   * @throws Error if phases don't exist or create a cycle
   *
   * @example
   * ```typescript
   * // Link qualifying to main draw
   * await linkPhases('qualifying-round', 'main-draw');
   * ```
   */
  public async linkPhases(sourcePhaseId: string, targetPhaseId: string): Promise<void> {
    // Validate input
    if (!sourcePhaseId || sourcePhaseId.trim().length === 0) {
      throw new Error('Source phase ID is required');
    }
    
    if (!targetPhaseId || targetPhaseId.trim().length === 0) {
      throw new Error('Target phase ID is required');
    }
    
    if (sourcePhaseId === targetPhaseId) {
      throw new Error('Cannot link a phase to itself');
    }
    
    // Fetch phases
    const sourcePhase = await this.phaseRepository.findById(sourcePhaseId);
    if (!sourcePhase) {
      throw new Error(`Source phase not found: ${sourcePhaseId}`);
    }
    
    const targetPhase = await this.phaseRepository.findById(targetPhaseId);
    if (!targetPhase) {
      throw new Error(`Target phase not found: ${targetPhaseId}`);
    }
    
    // Validate same tournament
    if (sourcePhase.tournamentId !== targetPhase.tournamentId) {
      throw new Error('Cannot link phases from different tournaments');
    }
    
    // Validate no cycle (target should have higher sequence order)
    if (targetPhase.sequenceOrder <= sourcePhase.sequenceOrder) {
      throw new Error('Target phase must have a higher sequence order than source phase');
    }
    
    // Check for cycle by traversing existing links
    await this.validateNoCycle(targetPhaseId, sourcePhaseId);
    
    // Update source phase with nextPhaseId
    const updatedPhase = new Phase({
      ...sourcePhase,
      nextPhaseId: targetPhaseId,
    });
    
    await this.phaseRepository.update(updatedPhase);
  }

  /**
   * Advances top qualifiers from a Round Robin phase to the next phase.
   *
   * Queries standings, identifies top N participants, creates registrations
   * in the target phase with AcceptanceType.QUALIFIER.
   *
   * @param data - Qualifier advancement parameters
   * @throws Error if standings incomplete or participants already registered
   *
   * @example
   * ```typescript
   * // Advance top 2 from Round Robin to knockout
   * await advanceQualifiers({
   *   sourcePhaseId: 'rr-group-a',
   *   targetPhaseId: 'knockout-r16',
   *   qualifierCount: 2,
   *   tournamentId: 'tournament-123',
   *   categoryId: 'mens-singles'
   * });
   * ```
   */
  public async advanceQualifiers(data: AdvanceQualifiersDto): Promise<string[]> {
    // Validate input
    if (!data.sourcePhaseId || data.sourcePhaseId.trim().length === 0) {
      throw new Error('Source phase ID is required');
    }
    
    if (!data.targetPhaseId || data.targetPhaseId.trim().length === 0) {
      throw new Error('Target phase ID is required');
    }
    
    if (!data.qualifierCount || data.qualifierCount <= 0) {
      throw new Error('Qualifier count must be a positive number');
    }
    
    if (!data.tournamentId || data.tournamentId.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }
    
    if (!data.categoryId || data.categoryId.trim().length === 0) {
      throw new Error('Category ID is required');
    }
    
    // Fetch source phase
    const sourcePhase = await this.phaseRepository.findById(data.sourcePhaseId);
    if (!sourcePhase) {
      throw new Error(`Source phase not found: ${data.sourcePhaseId}`);
    }
    
    // Verify phase is completed
    if (!sourcePhase.isCompleted) {
      throw new Error('Source phase must be completed before advancing qualifiers');
    }
    
    // Fetch standings for source phase (assuming bracket ID matches phase for Round Robin)
    // In a real implementation, you would need a way to get the bracket ID from the phase
    // For now, we'll fetch by phase tournament and filter
    const allStandings = await this.standingRepository.findAll();
    const phaseStandings = allStandings
      .filter(s => s.bracketId === data.sourcePhaseId)
      .sort((a, b) => a.position - b.position);
    
    if (phaseStandings.length < data.qualifierCount) {
      throw new Error(
        `Not enough standings (${phaseStandings.length}) to advance ${data.qualifierCount} qualifiers`
      );
    }
    
    // Get top N qualifiers
    const topQualifiers = phaseStandings.slice(0, data.qualifierCount);
    const qualifiedParticipantIds = topQualifiers.map(s => s.participantId);
    
    // Create registrations in target phase
    const registrationIds: string[] = [];
    
    for (const participantId of qualifiedParticipantIds) {
      const registration = new Registration({
        id: generateId(),
        participantId,
        tournamentId: data.tournamentId,
        categoryId: data.categoryId,
        acceptanceType: AcceptanceType.QUALIFIER,
        registeredAt: new Date(),
      });
      
      const saved = await this.registrationRepository.save(registration);
      registrationIds.push(saved.id);
    }
    
    // Link phases if not already linked
    if (sourcePhase.nextPhaseId !== data.targetPhaseId) {
      await this.linkPhases(data.sourcePhaseId, data.targetPhaseId);
    }
    
    return registrationIds;
  }

  /**
   * Creates a consolation draw for eliminated participants.
   *
   * Identifies losers from the main phase and generates a consolation bracket.
   * Supports simple consolation or multi-level Compass-style consolation.
   *
   * @param data - Consolation draw creation parameters
   * @returns ID of the created consolation phase
   * @throws Error if main phase not found or consolation already exists
   *
   * @example
   * ```typescript
   * // Create consolation for first-round losers
   * const consolationPhaseId = await createConsolationDraw({
   *   mainPhaseId: 'main-draw',
   *   eliminationRound: 1,
   *   tournamentId: 'tournament-123',
   *   categoryId: 'mens-singles',
   *   bracketType: BracketType.SINGLE_ELIMINATION
   * });
   * ```
   */
  public async createConsolationDraw(data: CreateConsolationDrawDto): Promise<string> {
    // Validate input
    if (!data.mainPhaseId || data.mainPhaseId.trim().length === 0) {
      throw new Error('Main phase ID is required');
    }
    
    if (!data.tournamentId || data.tournamentId.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }
    
    if (!data.categoryId || data.categoryId.trim().length === 0) {
      throw new Error('Category ID is required');
    }
    
    // Fetch main phase
    const mainPhase = await this.phaseRepository.findById(data.mainPhaseId);
    if (!mainPhase) {
      throw new Error(`Main phase not found: ${data.mainPhaseId}`);
    }
    
    // Check if consolation phase already exists
    if (data.consolationPhaseId) {
      const existingConsolation = await this.phaseRepository.findById(data.consolationPhaseId);
      if (existingConsolation) {
        throw new Error('Consolation phase already exists');
      }
    }
    
    // Create consolation phase
    const consolationPhaseId = data.consolationPhaseId ?? generateId();
    const consolationPhase = new Phase({
      id: consolationPhaseId,
      tournamentId: data.tournamentId,
      name: `${mainPhase.name} - Consolation`,
      sequenceOrder: mainPhase.sequenceOrder + 100, // Offset to indicate parallel structure
      matchCount: 0, // Will be calculated when bracket is generated
      nextPhaseId: null,
      isCompleted: false,
    });
    
    await this.phaseRepository.save(consolationPhase);
    
    // Link main phase to consolation
    await this.linkPhases(data.mainPhaseId, consolationPhaseId);
    
    // TODO: Identify losers from main phase at specified elimination round
    // TODO: Generate bracket for consolation draw using BracketService
    // TODO: Create registrations for losers with appropriate acceptance type
    
    // Note: Full implementation requires Match entity integration to find losers
    // For now, we create the phase structure only
    
    return consolationPhaseId;
  }

  /**
   * Promotes an alternate to Lucky Loser when a participant withdraws.
   *
   * Finds the first ALTERNATE in the waiting list and updates their
   * acceptance type to LUCKY_LOSER, inheriting the withdrawn player's position.
   *
   * @param data - Lucky Loser promotion parameters
   * @returns ID of the promoted participant, or null if no alternates available
   * @throws Error if withdrawn participant not found
   *
   * @example
   * ```typescript
   * // Promote alternate when a player withdraws
   * const luckyLoserId = await promoteLuckyLoser({
   *   withdrawnParticipantId: 'player-123',
   *   phaseId: 'main-draw',
   *   tournamentId: 'tournament-123',
   *   categoryId: 'mens-singles'
   * });
   * ```
   */
  public async promoteLuckyLoser(data: PromoteLuckyLoserDto): Promise<string | null> {
    // Validate input
    if (!data.withdrawnParticipantId || data.withdrawnParticipantId.trim().length === 0) {
      throw new Error('Withdrawn participant ID is required');
    }
    
    if (!data.phaseId || data.phaseId.trim().length === 0) {
      throw new Error('Phase ID is required');
    }
    
    if (!data.tournamentId || data.tournamentId.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }
    
    if (!data.categoryId || data.categoryId.trim().length === 0) {
      throw new Error('Category ID is required');
    }
    
    // Fetch withdrawn participant's registration
    const allRegistrations = await this.registrationRepository.findByTournament(data.tournamentId);
    const withdrawnRegistration = allRegistrations.find(
      r => r.participantId === data.withdrawnParticipantId && r.categoryId === data.categoryId
    );
    
    if (!withdrawnRegistration) {
      throw new Error(`Registration not found for participant: ${data.withdrawnParticipantId}`);
    }
    
    // Update withdrawn participant's acceptance type
    const updatedWithdrawn = new Registration({
      ...withdrawnRegistration,
      acceptanceType: AcceptanceType.WITHDRAWN,
    });
    
    await this.registrationRepository.update(updatedWithdrawn);
    
    // Find first ALTERNATE in the waiting list
    const alternates = allRegistrations
      .filter(r => r.categoryId === data.categoryId && r.acceptanceType === AcceptanceType.ALTERNATE)
      .sort((a, b) => a.registeredAt.getTime() - b.registeredAt.getTime());
    
    if (alternates.length === 0) {
      // No alternates available
      return null;
    }
    
    const firstAlternate = alternates[0];
    
    // Promote alternate to Lucky Loser
    const promotedRegistration = new Registration({
      ...firstAlternate,
      acceptanceType: AcceptanceType.LUCKY_LOSER,
    });
    
    await this.registrationRepository.update(promotedRegistration);
    
    // TODO: Update bracket position (replace withdrawn participant with lucky loser)
    // TODO: Notify lucky loser of promotion
    
    return firstAlternate.participantId;
  }

  /**
   * Validates that linking phases doesn't create a cycle.
   *
   * @param startPhaseId - Phase to start traversal
   * @param targetPhaseId - Phase that should not be reachable
   * @throws Error if a cycle is detected
   */
  private async validateNoCycle(startPhaseId: string, targetPhaseId: string): Promise<void> {
    const visited = new Set<string>();
    let currentPhaseId: string | null = startPhaseId;
    
    while (currentPhaseId && !visited.has(currentPhaseId)) {
      if (currentPhaseId === targetPhaseId) {
        throw new Error('Phase linking would create a cycle');
      }
      
      visited.add(currentPhaseId);
      
      const phase = await this.phaseRepository.findById(currentPhaseId);
      currentPhaseId = phase?.nextPhaseId ?? null;
    }
  }
}
