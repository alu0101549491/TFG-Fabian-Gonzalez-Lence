/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 8, 2026
 * @file src/shared/utils/tennis-score-validator.ts
 * @desc Frontend tennis score validation utility following ITF/ATP rules
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://www.itftennis.com/en/about-us/governance/rules-and-regulations/}
 * @see {@link https://typescripttutorial.net}
 */

export interface TennisSetScore {
  setNumber: number;
  participant1Games: number;
  participant2Games: number;
  tiebreakParticipant1?: number | null;
  tiebreakParticipant2?: number | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface TennisValidationOptions {
  /** Best of 5 sets format (3 sets to win) - default: false (best of 3) */
  bestOfFive?: boolean;
  /** Allow super tiebreak (first to 10 points) in final set - default: false */
  allowSuperTiebreak?: boolean;
}

/**
 * Tennis score validator implementing ITF/ATP rules.
 * 
 * Standard Tennis Rules:
 * - Normal set: First to 6 games, must win by 2 (6-4, 6-3, 7-5)
 * - Tiebreak at 6-6: First to 7 points, must win by 2
 * - Valid set scores: 6-0, 6-1, 6-2, 6-3, 6-4, 7-5, 7-6(TB)
 * - Invalid scores: 6-5 (incomplete), 6-6 (needs tiebreak), 8-4 (impossible)
 * - Winner must have more games/points than loser
 * - Tiebreak required at 6-6 or 7-6
 * - Best of 3: First to 2 sets wins (maximum 3 sets)
 * - Best of 5: First to 3 sets wins (maximum 5 sets)
 * 
 * @example
 * ```typescript
 * const validator = new TennisScoreValidator();
 * const result = validator.validateSet({ 

 *   participant1Games: 6, 
 *   participant2Games: 7 
 * });
 * if (!result.isValid) {
 *   console.error(result.errors); // ["Invalid score 6-7: Only 7-5 and 7-6 are valid"]
 * }
 * ```
 */
export class TennisScoreValidator {
  private readonly options: Required<TennisValidationOptions>;

  constructor(options: TennisValidationOptions = {}) {
    this.options = {
      bestOfFive: options.bestOfFive ?? false,
      allowSuperTiebreak: options.allowSuperTiebreak ?? false,
    };
  }

  /**
   * Validates a complete match score with all sets.
   * 
   * @param sets - Array of set scores
   * @returns Validation result with errors if invalid
   */
  public validateMatch(sets: TennisSetScore[]): ValidationResult {
    const errors: string[] = [];

    if (!sets || sets.length === 0) {
      errors.push('Match must have at least one set');
      return {isValid: false, errors};
    }

    // Validate number of sets
    const maxSets = this.options.bestOfFive ? 5 : 3;
    if (sets.length > maxSets) {
      errors.push(`Match cannot have more than ${maxSets} sets (best of ${this.options.bestOfFive ? '5' : '3'} format)`);
    }

    // Validate each set
    sets.forEach((set) => {
      const setValidation = this.validateSet(set, false);
      if (!setValidation.isValid) {
        errors.push(...setValidation.errors.map(err => `Set ${set.setNumber}: ${err}`));
      }
    });

    // Count sets won
    const participant1Sets = this.countSetsWon(sets, 1);
    const participant2Sets = this.countSetsWon(sets, 2);
    const setsToWin = this.options.bestOfFive ? 3 : 2;

    if (participant1Sets < setsToWin && participant2Sets < setsToWin) {
      errors.push(`Match is incomplete: Neither player has won ${setsToWin} sets (Player 1: ${participant1Sets}, Player 2: ${participant2Sets})`);
    }

    if (participant1Sets === participant2Sets) {
      errors.push('Invalid match result: Both players have equal sets won');
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
   * @param isFinalSet - Whether this is the final set
   * @returns Validation result with errors if invalid
   */
  public validateSet(set: TennisSetScore, isFinalSet: boolean = false): ValidationResult {
    const errors: string[] = [];
    const {participant1Games, participant2Games, tiebreakParticipant1, tiebreakParticipant2} = set;

    // Basic validations
    if (participant1Games < 0 || participant2Games < 0) {
      errors.push('Games cannot be negative');
    }

    if (participant1Games === 0 && participant2Games === 0) {
      errors.push('At least one player must have won games');
    }

    const winnerGames = Math.max(participant1Games, participant2Games);
    const loserGames = Math.min(participant1Games, participant2Games);

    // Winner must have at least 6 games
    if (winnerGames < 6) {
      errors.push(`Set is incomplete: Winner must have at least 6 games (current: ${winnerGames}-${loserGames})`);
      return {isValid: false, errors}; // Return early, further validation doesn't make sense
    }

    // Validate specific score patterns
    if (winnerGames === 6) {
      // Normal set: 6-0, 6-1, 6-2, 6-3, 6-4
      if (loserGames === 5) {
        errors.push(`Invalid score 6-5: Set is incomplete, must continue to 7-5`);
      } else if (loserGames === 6) {
        errors.push(`Invalid score 6-6: Set cannot end tied, must play tiebreak or continue to 7-5`);
      } else if (loserGames > 6) {
        errors.push(`Invalid score 6-${loserGames}: Loser cannot have more than 4 games when winner has 6`);
      }
    } else if (winnerGames === 7) {
      // Extended set: 7-5 or 7-6 with tiebreak
      if (loserGames === 6) {
        // 7-6: Must have tiebreak
        const tiebreakValidation = this.validateTiebreak(
          participant1Games === 7 ? tiebreakParticipant1 : tiebreakParticipant2,
          participant1Games === 7 ? tiebreakParticipant2 : tiebreakParticipant1,
          isFinalSet && this.options.allowSuperTiebreak
        );
        if (!tiebreakValidation.isValid) {
          errors.push(...tiebreakValidation.errors);
        }
      } else if (loserGames === 5) {
        // 7-5: Valid, no tiebreak
        if (tiebreakParticipant1 !== null && tiebreakParticipant1 !== undefined) {
          errors.push('7-5 score should not have tiebreak points');
        }
        if (tiebreakParticipant2 !== null && tiebreakParticipant2 !== undefined) {
          errors.push('7-5 score should not have tiebreak points');
        }
      } else {
        errors.push(`Invalid score 7-${loserGames}: Only 7-5 and 7-6 with tiebreak are valid`);
      }
    } else if (winnerGames > 7) {
      // Extended sets beyond 7 (rare, but allowed in some formats)
      // Must win by exactly 2 games
      if (winnerGames - loserGames !== 2) {
        errors.push(`Invalid score ${winnerGames}-${loserGames}: Extended sets must be won by exactly 2 games (e.g., 9-7, 11-9, 13-11)`);
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
      errors.push('Missing tiebreak points for set winner (required for 7-6 scores)');
      return {isValid: false, errors};
    }

    if (loserPoints === null || loserPoints === undefined) {
      errors.push('Missing tiebreak points for set loser (required for 7-6 scores)');
      return {isValid: false, errors};
    }

    if (winnerPoints < 0 || loserPoints < 0) {
      errors.push('Tiebreak points cannot be negative');
    }

    const minPoints = isSuperTiebreak ? 10 : 7;
    const tiebreakName = isSuperTiebreak ? 'super tiebreak' : 'standard tiebreak';

    if (winnerPoints < minPoints) {
      errors.push(`Tiebreak winner must have at least ${minPoints} points (${tiebreakName}), got ${winnerPoints}`);
    }

    if (winnerPoints <= loserPoints) {
      errors.push(`Invalid tiebreak score ${winnerPoints}-${loserPoints}: Winner must have more points than loser`);
    }

    // Must win by 2 points
    const margin = winnerPoints - loserPoints;
    if (margin < 2) {
      errors.push(`Invalid tiebreak score ${winnerPoints}-${loserPoints}: Must win by at least 2 points`);
    }

    // Check for impossible tiebreak scores
    if (winnerPoints === minPoints && loserPoints >= minPoints - 1) {
      errors.push(`Invalid tiebreak ${winnerPoints}-${loserPoints}: Cannot be ${minPoints}-${minPoints - 1}, must win by 2 (valid: ${minPoints}-${minPoints - 2}, ${minPoints + 1}-${minPoints - 1}, ${minPoints + 2}-${minPoints}, etc.)`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Counts sets won by a participant.
   * 
   * @param sets - Array of set scores
   * @param participant - 1 or 2
   * @returns Number of sets won by the participant
   */
  private countSetsWon(sets: TennisSetScore[], participant: 1 | 2): number {
    return sets.filter(set => {
      const p1Games = set.participant1Games;
      const p2Games = set.participant2Games;
      return participant === 1 ? p1Games > p2Games : p2Games > p1Games;
    }).length;
  }

  /**
   * Provides user-friendly suggestions for fixing invalid scores.
   * 
   * @param set - The invalid set score
   * @returns Array of suggested valid scores
   */
  public suggestValidScores(set: TennisSetScore): string[] {
    const {participant1Games, participant2Games} = set;
    const suggestions: string[] = [];

    if (participant1Games === 6 && participant2Games === 5) {
      suggestions.push('Continue to 7-5');
      suggestions.push('Or play tiebreak at 6-6 if opponent wins next game');
    } else if (participant1Games === 5 && participant2Games === 6) {
      suggestions.push('Continue to 5-7');
      suggestions.push('Or play tiebreak at 6-6 if you win next game');
    } else if (participant1Games === 6 && participant2Games === 6) {
      suggestions.push('Must play tiebreak (7-6 with tiebreak points)');
    } else if (participant1Games === 7 && participant2Games === 6) {
      suggestions.push('Add tiebreak points (e.g., 7-6(7-5) or 7-6(7-3))');
    } else if (participant1Games === 6 && participant2Games === 7) {
      suggestions.push('Add tiebreak points (e.g., 6-7(5-7) or 6-7(3-7))');
    }

    return suggestions;
  }
}
