/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file src/application/services/tiebreak-resolver.service.ts
 * @desc Service for resolving ties in tournament standings using six sequential criteria (FR42).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Injectable} from '@angular/core';
import {Standing} from '@domain/entities/standing';
import {Match} from '@domain/entities/match';
import {MatchStatus} from '@domain/enumerations/match-status';

/**
 * Interface for tiebreak result containing all relevant data for comparison.
 */
export interface TiebreakData {
  participantId: string;
  matchesWon: number;
  matchesLost: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  seedNumber: number | null;
  headToHeadWins: Map<string, number>;
}

/**
 * TiebreakResolver service.
 * Implements the Chain of Responsibility pattern to apply six sequential tiebreaker criteria
 * according to FR42: Set ratio → Game ratio → Set/game difference → Head-to-head → 
 * Draw ranking → Random draw.
 */
@Injectable({providedIn: 'root'})
export class TiebreakResolverService {
  /**
   * Resolves ties between standings using sequential tiebreaker criteria.
   *
   * @param tiedStandings - Array of standings with identical points
   * @param allMatches - All matches in the category for head-to-head calculation
   * @returns Sorted standings with ties resolved
   */
  public resolveTies(tiedStandings: Standing[], allMatches: Match[]): Standing[] {
    if (tiedStandings.length <= 1) {
      return tiedStandings;
    }

    // Build tiebreak data for each participant
    const tiebreakData = this.buildTiebreakData(tiedStandings, allMatches);

    // Apply tiebreaker criteria sequentially
    let sortedData = [...tiebreakData];

    // 1. Set ratio
    sortedData = this.applyCriterionIfNeeded(sortedData, this.compareBySetRatio);

    // 2. Game ratio
    if (this.hasTies(sortedData)) {
      sortedData = this.applyCriterionIfNeeded(sortedData, this.compareByGameRatio);
    }

    // 3. Set/game difference
    if (this.hasTies(sortedData)) {
      sortedData = this.applyCriterionIfNeeded(sortedData, this.compareBySetDifference);
    }

    // 4. Head-to-head
    if (this.hasTies(sortedData)) {
      sortedData = this.applyHeadToHead(sortedData);
    }

    // 5. Draw ranking (seed number)
    if (this.hasTies(sortedData)) {
      sortedData = this.applyCriterionIfNeeded(sortedData, this.compareBySeedNumber);
    }

    // 6. Random draw (last resort)
    if (this.hasTies(sortedData)) {
      sortedData = this.applyRandomDraw(sortedData);
    }

    // Map back to standings with updated positions
    return this.mapToStandings(sortedData, tiedStandings);
  }

  /**
   * Builds comprehensive tiebreak data from standings and matches.
   * @private
   */
  private buildTiebreakData(standings: Standing[], matches: Match[]): TiebreakData[] {
    return standings.map(standing => {
      const headToHeadWins = this.calculateHeadToHead(
        standing.participantId,
        standings.map(s => s.participantId),
        matches
      );

      return {
        participantId: standing.participantId,
        matchesWon: standing.matchesWon,
        matchesLost: standing.matchesLost,
        setsWon: standing.setsWon,
        setsLost: standing.setsLost,
        gamesWon: standing.gamesWon,
        gamesLost: standing.gamesLost,
        seedNumber: null, // Standing entity doesn't have seed information
        headToHeadWins
      };
    });
  }

  /**
   * Calculates head-to-head record against tied opponents.
   * @private
   */
  private calculateHeadToHead(
    participantId: string,
    tiedParticipantIds: string[],
    matches: Match[]
  ): Map<string, number> {
    const wins = new Map<string, number>();

    // Find all completed matches involving this participant against tied opponents
    const relevantMatches = matches.filter(match =>
      match.status === MatchStatus.COMPLETED &&
      (match.player1Id === participantId || match.player2Id === participantId) &&
      (tiedParticipantIds.includes(match.player1Id!) || tiedParticipantIds.includes(match.player2Id!))
    );

    // Count wins
    for (const match of relevantMatches) {
      if (match.winnerId === participantId) {
        const opponentId = match.player1Id === participantId ? match.player2Id! : match.player1Id!;
        wins.set(opponentId, (wins.get(opponentId) || 0) + 1);
      }
    }

    return wins;
  }

  /**
   * Checks if there are still ties in the current sorting.
   * @private
   */
  private hasTies(data: TiebreakData[]): boolean {
    // Group by all current criteria and check if any group has > 1 participant
    // For simplicity, check if sequential items are duplicates
    for (let i = 0; i < data.length - 1; i++) {
      if (this.areFullyTied(data[i], data[i + 1])) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if two participants are still tied after current criteria.
   * @private
   */
  private areFullyTied(a: TiebreakData, b: TiebreakData): boolean {
    // Compare all criteria applied so far
    return (
      this.calculateSetRatio(a) === this.calculateSetRatio(b) &&
      this.calculateGameRatio(a) === this.calculateGameRatio(b) &&
      this.calculateSetDifference(a) === this.calculateSetDifference(b)
    );
  }

  /**
   * Applies a comparison criterion to the data.
   * @private
   */
  private applyCriterionIfNeeded(
    data: TiebreakData[],
    compareFn: (a: TiebreakData, b: TiebreakData) => number
  ): TiebreakData[] {
    return [...data].sort(compareFn);
  }

  /**
   * Criterion 1: Compare by set ratio (sets won / sets lost).
   * Higher ratio wins.
   * @private
   */
  private compareBySetRatio = (a: TiebreakData, b: TiebreakData): number => {
    const ratioA = this.calculateSetRatio(a);
    const ratioB = this.calculateSetRatio(b);
    return ratioB - ratioA; // Descending (higher is better)
  };

  /**
   * Criterion 2: Compare by game ratio (games won / games lost).
   * Higher ratio wins.
   * @private
   */
  private compareByGameRatio = (a: TiebreakData, b: TiebreakData): number => {
    const ratioA = this.calculateGameRatio(a);
    const ratioB = this.calculateGameRatio(b);
    return ratioB - ratioA; // Descending (higher is better)
  };

  /**
   * Criterion 3: Compare by set difference (sets won - sets lost).
   * Higher difference wins.
   * @private
   */
  private compareBySetDifference = (a: TiebreakData, b: TiebreakData): number => {
    const diffA = this.calculateSetDifference(a);
    const diffB = this.calculateSetDifference(b);
    return diffB - diffA; // Descending (higher is better)
  };

  /**
   * Criterion 4: Apply head-to-head results between tied players.
   * @private
   */
  private applyHeadToHead(data: TiebreakData[]): TiebreakData[] {
    // For 2 players, direct comparison is simple
    if (data.length === 2) {
      const [player1, player2] = data;
      const player1Wins = player1.headToHeadWins.get(player2.participantId) || 0;
      const player2Wins = player2.headToHeadWins.get(player1.participantId) || 0;

      if (player1Wins > player2Wins) {
        return [player1, player2];
      } else if (player2Wins > player1Wins) {
        return [player2, player1];
      }
      return data; // Still tied
    }

    // For 3+ players, create mini-standings considering only matches between tied players
    return [...data].sort((a, b) => {
      const aWins = Array.from(a.headToHeadWins.values()).reduce((sum, w) => sum + w, 0);
      const bWins = Array.from(b.headToHeadWins.values()).reduce((sum, w) => sum + w, 0);
      return bWins - aWins; // Descending (more wins is better)
    });
  }

  /**
   * Criterion 5: Compare by seed number at draw time.
   * Lower seed number wins (seed 1 is better than seed 2).
   * @private
   */
  private compareBySeedNumber = (a: TiebreakData, b: TiebreakData): number => {
    // Null seeds go last
    if (a.seedNumber === null) return 1;
    if (b.seedNumber === null) return -1;
    return a.seedNumber - b.seedNumber; // Ascending (lower seed is better)
  };

  /**
   * Criterion 6: Random draw (last resort).
   * @private
   */
  private applyRandomDraw(data: TiebreakData[]): TiebreakData[] {
    return [...data].sort(() => Math.random() - 0.5);
  }

  /**
   * Calculates set ratio, handling division by zero.
   * @private
   */
  private calculateSetRatio(data: TiebreakData): number {
    if (data.setsLost === 0) {
      return data.setsWon > 0 ? 999 : 0; // Maximum value if no sets lost
    }
    return data.setsWon / data.setsLost;
  }

  /**
   * Calculates game ratio, handling division by zero.
   * @private
   */
  private calculateGameRatio(data: TiebreakData): number {
    if (data.gamesLost === 0) {
      return data.gamesWon > 0 ? 999 : 0; // Maximum value if no games lost
    }
    return data.gamesWon / data.gamesLost;
  }

  /**
   * Calculates set difference.
   * @private
   */
  private calculateSetDifference(data: TiebreakData): number {
    return data.setsWon - data.setsLost;
  }

  /**
   * Maps sorted tiebreak data back to standings with updated positions.
   * @private
   */
  private mapToStandings(sortedData: TiebreakData[], originalStandings: Standing[]): Standing[] {
    const standingMap = new Map(originalStandings.map(s => [s.participantId, s]));

    return sortedData.map((data, index) => {
      const standing = standingMap.get(data.participantId)!;
      return new Standing({
        id: standing.id,
        bracketId: standing.bracketId,
        participantId: standing.participantId,
        position: index + 1, // Update position based on tiebreaker resolution
        matchesPlayed: standing.matchesPlayed,
        matchesWon: standing.matchesWon,
        matchesLost: standing.matchesLost,
        setsWon: standing.setsWon,
        setsLost: standing.setsLost,
        gamesWon: standing.gamesWon,
        gamesLost: standing.gamesLost,
        points: standing.points,
        updatedAt: standing.updatedAt
      });
    });
  }
}
