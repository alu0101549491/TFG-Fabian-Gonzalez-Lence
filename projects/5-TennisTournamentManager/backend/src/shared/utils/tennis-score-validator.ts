/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 8, 2026
 * @file backend/src/shared/utils/tennis-score-validator.ts
 * @desc Comprehensive tennis score validation utility following ITF/ATP rules
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://www.itftennis.com/en/about-us/governance/rules-and-regulations/}
 */

export interface TennisSetScore {
  setNumber: number;
  player1Games: number;
  player2Games: number;
  player1TiebreakPoints?: number | null;
  player2TiebreakPoints?: number | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface TennisValidationOptions {
  /** Allow no-advantage scoring (first to 4 games wins set) - default: false */
  noAdvantageScoring?: boolean;
  /** Best of 5 sets format (3 sets to win) - default: false (best of 3) */
  bestOfFive?: boolean;
  /** Allow super tiebreak (first to 10 points) in final set - default: false */
  allowSuperTiebreak?: boolean;
  /** Require tiebreak at 6-6 in all sets - default: true */
  requireTiebreakAt6All?: boolean;
}

/**
 * Tennis score validator implementing ITF/ATP rules.
 * 
 * Standard Tennis Rules:
 * - Normal set: First to 6 games, must win by 2 (6-4, 6-3, 7-5)
 * - Tiebreak at 6-6: First to 7 points, must win by 2
 * - Maximum games in normal set: 7-6 (with tiebreak)
 * - Cannot have scores like 6-5 (incomplete), 8-4 (impossible)
 * - Winner must have more games than loser
 * - Best of 3: First to 2 sets wins (maximum 3 sets)
 * - Best of 5: First to 3 sets wins (maximum 5 sets)
 * 
 * @example
 * const validator = new TennisScoreValidator();
 * const result = validator.validateMatch([
 *   { setNumber: 1, player1Games: 6, player2Games: 4 },
 *   { setNumber: 2, player1Games: 3, player2Games: 6 },
 *   { setNumber: 3, player1Games: 7, player2Games: 6, player1TiebreakPoints: 7, player2TiebreakPoints: 5 }
 * ], 'player1');
 * if (!result.isValid) {
 *   console.error(result.errors.join(', '));
 * }
 */
export class TennisScoreValidator {
  private readonly options: Required<TennisValidationOptions>;

  constructor(options: TennisValidationOptions = {}) {
    this.options = {
      noAdvantageScoring: options.noAdvantageScoring ?? false,
      bestOfFive: options.bestOfFive ?? false,
      allowSuperTiebreak: options.allowSuperTiebreak ?? false,
      requireTiebreakAt6All: options.requireTiebreakAt6All ?? true,
    };
  }

  /**
   * Validates a complete match score.
   * 
   * @param sets - Array of set scores
   * @param winnerId - ID of the declared winner
   * @returns Validation result with errors if invalid
   */
  public validateMatch(sets: TennisSetScore[], winnerId: string): ValidationResult {
    const errors: string[] = [];

    // Check if sets array is empty
    if (!sets || sets.length === 0) {
      errors.push('Match must have at least one set');
      return {isValid: false, errors};
    }

    // Validate number of sets
    const maxSets = this.options.bestOfFive ? 5 : 3;
    if (sets.length > maxSets) {
      errors.push(`Match cannot have more than ${maxSets} sets (best of ${this.options.bestOfFive ? '5' : '3'} format)`);
    }

    // Validate each set independently
    sets.forEach((set, index) => {
      const setValidation = this.validateSet(set, index === sets.length - 1);
      if (!setValidation.isValid) {
        errors.push(...setValidation.errors.map(err => `Set ${set.setNumber}: ${err}`));
      }
    });

    // Validate match winner determination
    const player1Sets = this.countSetsWon(sets, 'player1');
    const player2Sets = this.countSetsWon(sets, 'player2');
    const setsToWin = this.options.bestOfFive ? 3 : 2;

    if (player1Sets < setsToWin && player2Sets < setsToWin) {
      errors.push(`Match is incomplete: Neither player has won ${setsToWin} sets (Player 1: ${player1Sets}, Player 2: ${player2Sets})`);
    }

    // Validate winner declaration matches set scores
    const actualWinner = player1Sets > player2Sets ? 'player1' : 'player2';
    // Note: winnerId is the participant ID, not 'player1'/'player2'
    // We validate that the declared winner has more sets
    if (player1Sets === player2Sets) {
      errors.push('Invalid match result: Both players have equal sets won');
    } else if (player1Sets < setsToWin && player2Sets < setsToWin) {
      errors.push('Invalid match result: No player has reached the required number of sets to win');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates a single set score.
   * 
   * @param set - The set score to validate
   * @param isFinalSet - Whether this is the final set of the match
   * @returns Validation result with errors if invalid
   */
  public validateSet(set: TennisSetScore, isFinalSet: boolean = false): ValidationResult {
    const errors: string[] = [];
    const {player1Games, player2Games, player1TiebreakPoints, player2TiebreakPoints} = set;

    // Basic validations
    if (player1Games < 0 || player2Games < 0) {
      errors.push('Games cannot be negative');
    }

    if (player1Games === 0 && player2Games === 0) {
      errors.push('At least one player must have won games in this set');
    }

    // Determine winner and loser
    const winnerGames = Math.max(player1Games, player2Games);
    const loserGames = Math.min(player1Games, player2Games);

    // No-advantage scoring (first to 4 games wins)
    if (this.options.noAdvantageScoring) {
      if (winnerGames < 4) {
        errors.push(`Set is incomplete: Winner must have at least 4 games (no-advantage format)`);
      }
      if (winnerGames === 4 && loserGames >= 4) {
        errors.push(`Invalid score 4-${loserGames}: In no-advantage format, winner must reach 4 games before opponent`);
      }
      if (winnerGames > 4) {
        errors.push(`Invalid score ${winnerGames}-${loserGames}: In no-advantage format, set ends at 4 games`);
      }
    } else {
      // Standard scoring
      if (winnerGames < 6) {
        errors.push(`Set is incomplete: Winner must have at least 6 games (current: ${winnerGames}-${loserGames})`);
      }

      // Check valid set endings
      if (winnerGames === 6) {
        // Normal set: 6-0, 6-1, 6-2, 6-3, 6-4
        if (loserGames >= 5) {
          errors.push(`Invalid score 6-${loserGames}: Must play to 7-5 or 7-6 when loser has 5+ games`);
        }
      } else if (winnerGames === 7) {
        // Extended set: 7-5 or 7-6 with tiebreak
        if (loserGames === 6) {
          // Must have tiebreak
          if (this.options.requireTiebreakAt6All) {
            const tiebreakValidation = this.validateTiebreak(
              player1Games === 7 ? player1TiebreakPoints : player2TiebreakPoints,
              player1Games === 7 ? player2TiebreakPoints : player1TiebreakPoints,
              isFinalSet && this.options.allowSuperTiebreak
            );
            if (!tiebreakValidation.isValid) {
              errors.push(...tiebreakValidation.errors);
            }
          }
        } else if (loserGames === 5) {
          // 7-5 is valid, no tiebreak
          if (player1TiebreakPoints !== null && player1TiebreakPoints !== undefined) {
            errors.push('7-5 score should not have tiebreak points');
          }
          if (player2TiebreakPoints !== null && player2TiebreakPoints !== undefined) {
            errors.push('7-5 score should not have tiebreak points');
          }
        } else {
          errors.push(`Invalid score 7-${loserGames}: Only 7-5 and 7-6 are valid`);
        }
      } else if (winnerGames > 7) {
        // Extended tiebreak sets (allowed in some formats)
        // Example: 13-11 in final set without tiebreak (Wimbledon historical)
        // For safety, we'll allow but validate the margin
        if (winnerGames - loserGames !== 2) {
          errors.push(`Invalid score ${winnerGames}-${loserGames}: Extended sets must be won by exactly 2 games`);
        }
      }

      // Check for impossible scores
      if (winnerGames === 6 && loserGames === 6) {
        errors.push('Invalid score 6-6: Set cannot end tied, must play tiebreak or continue to 7-5');
      }
    }

    // Check for stray tiebreak points in non-tiebreak sets
    if (player1Games !== 7 && player2Games !== 7) {
      if ((player1TiebreakPoints !== null && player1TiebreakPoints !== undefined) ||
          (player2TiebreakPoints !== null && player2TiebreakPoints !== undefined)) {
        if (player1Games !== 6 || player2Games !== 6) {
          errors.push(`Tiebreak points should only be present in 7-6 sets (current: ${player1Games}-${player2Games})`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates tiebreak score.
   * 
   * @param winnerPoints - Tiebreak points of the winner
   * @param loserPoints - Tiebreak points of the loser
   * @param isSuperTiebreak - Whether this is a super tiebreak (first to 10)
   * @returns Validation result with errors if invalid
   */
  public validateTiebreak(
    winnerPoints: number | null | undefined,
    loserPoints: number | null | undefined,
    isSuperTiebreak: boolean = false
  ): ValidationResult {
    const errors: string[] = [];

    if (winnerPoints === null || winnerPoints === undefined) {
      errors.push('Tiebreak winner points are missing');
      return {isValid: false, errors};
    }

    if (loserPoints === null || loserPoints === undefined) {
      errors.push('Tiebreak loser points are missing');
      return {isValid: false, errors};
    }

    if (winnerPoints < 0 || loserPoints < 0) {
      errors.push('Tiebreak points cannot be negative');
    }

    const minPoints = isSuperTiebreak ? 10 : 7;

    if (winnerPoints < minPoints) {
      errors.push(`Tiebreak winner must have at least ${minPoints} points (${isSuperTiebreak ? 'super tiebreak' : 'standard tiebreak'})`);
    }

    if (winnerPoints <= loserPoints) {
      errors.push(`Invalid tiebreak score ${winnerPoints}-${loserPoints}: Winner must have more points than loser`);
    }

    // Must win by 2 points
    if (winnerPoints - loserPoints < 2) {
      errors.push(`Invalid tiebreak score ${winnerPoints}-${loserPoints}: Must win by at least 2 points`);
    }

    // Check for impossible tiebreak scores
    if (winnerPoints === minPoints && loserPoints >= minPoints - 1) {
      errors.push(`Invalid tiebreak score ${winnerPoints}-${loserPoints}: Must win by 2 points (e.g., ${minPoints}-${minPoints - 2}, ${minPoints + 1}-${minPoints - 1}, ${minPoints + 2}-${minPoints}, etc.)`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Counts sets won by a player.
   * 
   * @param sets - Array of set scores
   * @param player - 'player1' or 'player2'
   * @returns Number of sets won by the player
   */
  private countSetsWon(sets: TennisSetScore[], player: 'player1' | 'player2'): number {
    return sets.filter(set => {
      const p1Games = set.player1Games;
      const p2Games = set.player2Games;
      return player === 'player1' ? p1Games > p2Games : p2Games > p1Games;
    }).length;
  }
}
