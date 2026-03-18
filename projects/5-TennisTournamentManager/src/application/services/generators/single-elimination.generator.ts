/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file src/application/services/generators/single-elimination.generator.ts
 * @desc Single Elimination (Knockout) bracket generator implementation
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable, inject} from '@angular/core';
import {IBracketGenerator} from '../../interfaces/bracket-generator.interface';
import {Bracket} from '@domain/entities/bracket';
import {Match} from '@domain/entities/match';
import {Registration} from '@domain/entities/registration';
import {BracketType} from '@domain/enumerations/bracket-type';
import {MatchStatus} from '@domain/enumerations/match-status';
import {SeedingService} from '../seeding.service';

/**
 * Single Elimination bracket generator.
 * Implements the Strategy Pattern for Single Elimination (Knockout) format
 * where losers are immediately eliminated.
 * 
 * Algorithm:
 * - Calculate nearest power of 2 for bracket size
 * - Place participants in bracket positions
 * - Add Byes for gaps (power of 2 - participant count)
 * - Generate rounds progressively (winner advances)
 * - Byes are placed to benefit top seeds
 */
@Injectable({providedIn: 'root'})
export class SingleEliminationGenerator implements IBracketGenerator {
  private readonly MIN_PARTICIPANTS = 2;
  private readonly seedingService = inject(SeedingService);

  /**
   * Generates a Single Elimination bracket structure.
   *
   * @param registrations - List of confirmed participant registrations
   * @param _categoryId - ID of the category for this bracket (unused, reserved for future use)
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
        `Cannot generate Single Elimination bracket: minimum ${this.MIN_PARTICIPANTS} participants required, ` +
        `got ${registrations.length}`
      );
    }

    // Sort registrations by seed number (ascending - lower is better)
    const sortedRegistrations = this.sortBySeed(registrations);
    const participantIds = sortedRegistrations.map(r => r.participantId);
    
    const bracketId = this.generateBracketId();
    const phaseId = this.generatePhaseId();
    
    // Calculate bracket size (nearest power of 2)
    const bracketSize = this.calculateBracketSize(participantIds.length);
    const totalRounds = Math.log2(bracketSize);
    const byesNeeded = bracketSize - participantIds.length;

    // Generate first round matches with strategic seeding
    const matches = this.generateFirstRoundMatches(
      sortedRegistrations, // Pass registrations for seed information
      bracketId,
      phaseId,
      bracketSize,
      byesNeeded
    );

    // Create bracket structure
    const structure = JSON.stringify({
      type: 'SINGLE_ELIMINATION',
      bracketSize,
      byesCount: byesNeeded,
      rounds: totalRounds,
      participants: participantIds,
      firstRoundMatches: matches.length
    });

    return new Bracket({
      id: bracketId,
      tournamentId,
      phaseId,
      bracketType: BracketType.SINGLE_ELIMINATION,
      size: bracketSize,
      totalRounds,
      structure,
      matches,
      seeds: sortedRegistrations.map(r => r.participantId),
      isPublished: false,
      createdAt: new Date()
    });
  }

  /**
   * Validates that registrations meet Single Elimination requirements.
   *
   * @param registrations - List of participant registrations to validate
   * @returns True if valid for Single Elimination format
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
   * Calculates the bracket size (nearest power of 2).
   *
   * @param participantCount - Number of participants
   * @returns Bracket size (power of 2)
   * @private
   */
  private calculateBracketSize(participantCount: number): number {
    return Math.pow(2, Math.ceil(Math.log2(participantCount)));
  }

  /**
   * Generates first round matches with strategic Bye placement and strategic seeding.
   * 
   * Uses SeedingService to place seeds strategically:
   * - Seeds 1-2: Opposite bracket halves
   * - Seeds 3-4: Opposite quarters
   * - Seeds 5-8: Opposite eighths
   * 
   * Byes are distributed to benefit top seeds:
   * - Top seeds receive Byes first
   * - Ensures protected path for higher seeds
   *
   * @param registrations - List of registrations (seeded order)
   * @param bracketId - ID of the bracket
   * @param phaseId - ID of the phase
   * @param bracketSize - Size of the bracket (power of 2)
   * @param _byesNeeded - Number of Byes required (unused, Byes handled automatically)
   * @returns Array of first round matches
   * @private
   */
  private generateFirstRoundMatches(
    registrations: Registration[],
    bracketId: string,
    phaseId: string,
    bracketSize: number,
    _byesNeeded: number
  ): Match[] {
    const matches: Match[] = [];
    const positions: (string | null)[] = new Array(bracketSize).fill( null);

    // Separate seeded and unseeded registrations
    const seeded = registrations.filter(r => r.seed !== null);
    const unseeded = registrations.filter(r => r.seed === null);

    // Get strategic positions for seeded participants
    if (seeded.length > 0) {
      const seedPositions = this.seedingService.calculateSingleEliminationPositions(
        seeded,
        bracketSize
      );

      // Place seeded participants at strategic positions (1-indexed → 0-indexed)
      for (const sp of seedPositions) {
        positions[sp.drawPosition - 1] = sp.participantId;
      }
    }

    // Fill remaining positions with unseeded participants
    let unseededIndex = 0;
    for (let i = 0; i < bracketSize && unseededIndex < unseeded.length; i++) {
      if (positions[i] === null) {
        positions[i] = unseeded[unseededIndex].participantId;
        unseededIndex++;
      }
    }

    // Generate first round matches
    let matchCounter = 0;
    for (let i = 0; i < bracketSize; i += 2) {
      const player1 = positions[i];
      const player2 = positions[i + 1];

      // Both players present - regular match
      if (player1 && player2) {
        matches.push(new Match({
          id: this.generateMatchId(bracketId, Math.floor(i / 2)),
          bracketId,
          phaseId,
          player1Id: player1,
          player2Id: player2,
          status: MatchStatus.SCHEDULED,
          matchOrder: matchCounter++,
          createdAt: new Date(),
          updatedAt: new Date()
        }));
      }
      // One player present - Bye match
      else if (player1 && !player2) {
        matches.push(new Match({
          id: this.generateMatchId(bracketId, `bye_${i}`),
          bracketId,
          phaseId,
          player1Id: player1,
          player2Id: 'BYE',
          winnerId: player1,
          status: MatchStatus.BYE,
          matchOrder: matchCounter++,
          createdAt: new Date(),
          updatedAt: new Date()
        }));
      }
      else if (!player1 && player2) {
        matches.push(new Match({
          id: this.generateMatchId(bracketId, `bye_${i}`),
          bracketId,
          phaseId,
          player1Id: player2,
          player2Id: 'BYE',
          winnerId: player2,
          status: MatchStatus.BYE,
          matchOrder: matchCounter++,
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
   * @param matchIdentifier - Match identifier (number or string)
   * @private
   */
  private generateMatchId(bracketId: string, matchIdentifier: number | string): string {
    return `${bracketId}_match_${matchIdentifier}`;
  }
}
