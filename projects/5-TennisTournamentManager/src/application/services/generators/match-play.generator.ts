/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file src/application/services/generators/match-play.generator.ts
 * @desc Match Play bracket generator implementation
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable} from '@angular/core';
import {IBracketGenerator} from '../../interfaces/bracket-generator.interface';
import {Bracket} from '@domain/entities/bracket';
import {Match} from '@domain/entities/match';
import {Registration} from '@domain/entities/registration';
import {BracketType} from '@domain/enumerations/bracket-type';
import {MatchStatus} from '@domain/enumerations/match-status';

/**
 * Match Play bracket generator.
 * Implements the Strategy Pattern for Match Play format where there's
 * no fixed draw structure - participants can play multiple matches against
 * various opponents throughout the tournament period.
 * 
 * Algorithm:
 * - Creates open competition structure
 * - Optionally generates initial pairings based on ranking
 * - Allows free pairing during tournament
 * - No elimination - continuous play format
 */
@Injectable({providedIn: 'root'})
export class MatchPlayGenerator implements IBracketGenerator {
  private readonly MIN_PARTICIPANTS = 2;

  /**
   * Generates a Match Play bracket structure.
   * 
   * For Match Play, we create an open structure that allows participants
   * to freely schedule matches. Optionally generates initial suggested pairings
   * based on similar rankings.
   *
   * @param registrations - List of confirmed participant registrations
   * @param _categoryId - ID of the category for this bracket (unused in current implementation)
   * @param tournamentId - ID of the tournament
   * @returns Generated bracket with optional initial pairings
   */
  public async generate(
    registrations: Registration[],
    _categoryId: string,
    tournamentId: string
  ): Promise<Bracket> {
    // Validate input
    if (!this.validate(registrations)) {
      throw new Error(
        `Cannot generate Match Play bracket: minimum ${this.MIN_PARTICIPANTS} participants required, ` +
        `got ${registrations.length}`
      );
    }

    // Sort by ranking/seed for better initial pairings
    const sortedRegistrations = this.sortBySeed(registrations);
    const participantIds = sortedRegistrations.map(r => r.participantId);
    
    const bracketId = this.generateBracketId();
    const phaseId = this.generatePhaseId();

    // Generate optional initial pairings (similar ranking levels)
    const initialMatches = this.generateInitialPairings(
      participantIds,
      bracketId,
      phaseId
    );

    // Create bracket structure
    const structure = JSON.stringify({
      type: 'MATCH_PLAY',
      openFormat: true,
      participants: participantIds,
      initialPairings: initialMatches.length,
      allowFreeScheduling: true,
      minMatchesPerParticipant: 0, // No minimum requirement by default
      maxMatchesPerParticipant: null // No maximum limit by default
    });

    return new Bracket({
      id: bracketId,
      tournamentId,
      phaseId,
      bracketType: BracketType.MATCH_PLAY,
      size: participantIds.length,
      totalRounds: 1, // Match Play doesn't have traditional rounds
      structure,
      matches: initialMatches,
      seeds: sortedRegistrations.map(r => r.participantId),
      isPublished: false,
      createdAt: new Date()
    });
  }

  /**
   * Validates that registrations meet Match Play requirements.
   *
   * @param registrations - List of participant registrations to validate
   * @returns True if valid for Match Play format
   */
  public validate(registrations: Registration[]): boolean {
    return registrations.length >= this.MIN_PARTICIPANTS;
  }

  /**
   * Sorts registrations by seed number (nulls go last).
   *
   * @param registrations - Registrations to sort
   * @returns Sorted registrations
   * @private
   */
  private sortBySeed(registrations: Registration[]): Registration[] {
    return [...registrations].sort((a, b) => {
      if (a.seed === null) return 1;
      if (b.seed === null) return -1;
      return a.seed - b.seed;
    });
  }

  /**
   * Generates initial suggested pairings for Match Play.
   * 
   * Strategy: Pair participants of similar ranking levels to ensure
   * competitive matches at the start. This creates a better experience
   * while still maintaining the open format of Match Play.
   *
   * @param participantIds - List of participant IDs (sorted by seed)
   * @param bracketId - ID of the bracket
   * @param phaseId - ID of the phase
   * @returns Array of initial suggested matches
   * @private
   */
  private generateInitialPairings(
    participantIds: string[],
    bracketId: string,
    phaseId: string
  ): Match[] {
    const matches: Match[] = [];
    const participants = [...participantIds];

    // Pair participants of similar ranking levels
    let matchCounter = 0;

    // If odd number, one participant gets a suggested match later
    const isOddNumber = participants.length % 2 !== 0;
    const pairingCount = isOddNumber 
      ? Math.floor(participants.length / 2) 
      : participants.length / 2;

    // Strategy: Pair consecutive participants (similar rankings)
    for (let i = 0; i < pairingCount; i++) {
      const player1Index = i * 2;
      const player2Index = i * 2 + 1;

      if (player1Index < participants.length && player2Index < participants.length) {
        matches.push(new Match({
          id: this.generateMatchId(bracketId, matchCounter++),
          bracketId,
          phaseId,
          player1Id: participants[player1Index],
          player2Id: participants[player2Index],
          status: MatchStatus.SCHEDULED,
          matchOrder: matchCounter,
          createdAt: new Date(),
          updatedAt: new Date()
        }));
      }
    }

    return matches;
  }

  /**
   * Generates a unique bracket ID.
   * @private
   */
  private generateBracketId(): string {
    return `brk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generates a unique phase ID.
   * @private
   */
  private generatePhaseId(): string {
    return `phs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generates a unique match ID.
   * @param bracketId - Bracket ID prefix
   * @param matchNumber - Match number within bracket
   * @private
   */
  private generateMatchId(bracketId: string, matchNumber: number): string {
    return `${bracketId}_match_${matchNumber}`;
  }
}
