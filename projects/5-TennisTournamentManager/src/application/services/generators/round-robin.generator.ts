/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file src/application/services/generators/round-robin.generator.ts
 * @desc Round Robin bracket generator implementation
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
 * Round Robin bracket generator.
 * Implements the Strategy Pattern for Round Robin tournament format where
 * all participants play against each other in their group.
 * 
 * Algorithm:
 * - Divides participants into groups (default 1 group)
 * - Generates all possible pairings within each group
 * - Handles Byes for odd number of participants (rotating rest)
 */
@Injectable({providedIn: 'root'})
export class RoundRobinGenerator implements IBracketGenerator {
  private readonly MIN_PARTICIPANTS = 2;

  /**
   * Generates a Round Robin bracket structure.
   *
   * @param registrations - List of confirmed participant registrations
   * @param _categoryId - ID of the category for this bracket (unused in current implementation)
   * @param tournamentId - ID of the tournament
   * @returns Generated bracket with all matches
   */
  public async generate(
    registrations: Registration[],
    _categoryId: string,
    tournamentId: string
  ): Promise<Bracket> {
    // Validate input
    if (!this.validate(registrations)) {
      throw new Error(
        `Cannot generate Round Robin bracket: minimum ${this.MIN_PARTICIPANTS} participants required, ` +
        `got ${registrations.length}`
      );
    }

    // Extract participant IDs
    const participantIds = registrations.map(r => r.participantId);
    const bracketId = this.generateBracketId();
    const phaseId = this.generatePhaseId();
    
    // Calculate number of rounds (n-1 for even, n for odd with rotating Bye)
    const isOddNumber = participantIds.length % 2 !== 0;
    const totalRounds = isOddNumber ? participantIds.length : participantIds.length - 1;

    // Generate all matches using Round Robin algorithm
    const matches = this.generateRoundRobinMatches(
      participantIds,
      bracketId,
      phaseId
    );

    // Create bracket structure
    const structure = JSON.stringify({
      type: 'ROUND_ROBIN',
      groups: [{
        id: 1,
        participants: participantIds,
        matches: matches.map(m => m.id)
      }],
      rounds: totalRounds,
      hasOddParticipants: isOddNumber
    });

    return new Bracket({
      id: bracketId,
      tournamentId,
      phaseId,
      bracketType: BracketType.ROUND_ROBIN,
      size: participantIds.length,
      totalRounds,
      structure,
      matches,
      seeds: [],
      isPublished: false,
      createdAt: new Date()
    });
  }

  /**
   * Validates that registrations meet Round Robin requirements.
   *
   * @param registrations - List of participant registrations to validate
   * @returns True if valid for Round Robin format
   */
  public validate(registrations: Registration[]): boolean {
    return registrations.length >= this.MIN_PARTICIPANTS;
  }

  /**
   * Generates all Round Robin matches for the participants.
   * 
   * Uses the standard Round Robin algorithm:
   * - Fix one participant in position
   * - Rotate others clockwise for each round
   * - If odd number, add a "BYE" participant that rotates
   *
   * @param participantIds - List of participant IDs
   * @param bracketId - ID of the bracket
   * @param phaseId - ID of the phase
   * @returns Array of generated matches
   * @private
   */
  private generateRoundRobinMatches(
    participantIds: string[],
    bracketId: string,
    phaseId: string
  ): Match[] {
    const matches: Match[] = [];
    let participants = [...participantIds];

    // Add BYE participant if odd number
    const isOddNumber = participants.length % 2 !== 0;
    if (isOddNumber) {
      participants.push('BYE');
    }

    const numParticipants = participants.length;
    const numRounds = numParticipants - 1;
    const matchesPerRound = numParticipants / 2;
    let matchCounter = 0;

    // Generate matches for each round
    for (let round = 0; round < numRounds; round++) {
      // Generate pairings for this round
      for (let i = 0; i < matchesPerRound; i++) {
        const player1Index = i;
        const player2Index = numParticipants - 1 - i;

        const player1 = participants[player1Index];
        const player2 = participants[player2Index];

        // Skip matches involving BYE
        if (player1 === 'BYE' || player2 === 'BYE') {
          continue;
        }

        // Create match
        matches.push(new Match({
          id: this.generateMatchId(bracketId, matchCounter++),
          bracketId,
          phaseId,
          player1Id: player1,
          player2Id: player2,
          status: MatchStatus.NOT_SCHEDULED,
          matchOrder: matchCounter,
          createdAt: new Date(),
          updatedAt: new Date()
        }));
      }

      // Rotate participants (keep first one fixed, rotate others)
      if (round < numRounds - 1) {
        const fixed = participants[0];
        const rotating = participants.slice(1);
        rotating.unshift(rotating.pop()!);
        participants = [fixed, ...rotating];
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
