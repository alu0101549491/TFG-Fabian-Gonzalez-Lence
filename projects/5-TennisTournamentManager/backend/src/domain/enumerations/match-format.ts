/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 22, 2026
 * @file backend/src/domain/enumerations/match-format.ts
 * @desc Enumeration representing different match formats in tennis.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Represents the format of a tennis match.
 * Defines the number of sets and tiebreak rules.
 */
export enum MatchFormat {
  /** Best of 3 sets with final set tiebreak to 10 points (common in modern tournaments). */
  BEST_OF_3_FINAL_SET_TIEBREAK = 'BEST_OF_3_FINAL_SET_TIEBREAK',
  /** Best of 3 sets with final set played to advantage (no tiebreak). */
  BEST_OF_3_ADVANTAGE = 'BEST_OF_3_ADVANTAGE',
  /** Best of 5 sets with final set tiebreak to 10 points (Grand Slams 2019+). */
  BEST_OF_5_FINAL_SET_TIEBREAK = 'BEST_OF_5_FINAL_SET_TIEBREAK',
  /** Best of 5 sets with final set played to advantage (traditional Grand Slam format). */
  BEST_OF_5_ADVANTAGE = 'BEST_OF_5_ADVANTAGE',
  /** Single pro-set: first to 8 games with tiebreak at 7-7 (exhibition/practice). */
  PRO_SET = 'PRO_SET',
  /** Short format: best of 3 sets, first 2 sets to 4 games, 3rd set super tiebreak to 10. */
  SHORT_SETS = 'SHORT_SETS',
  /** Fast4 format: 4 games per set, tiebreak at 3-3, no-ad scoring, super tiebreak at 1-1 sets. */
  FAST4 = 'FAST4',
  /** Single super tiebreak to 10 points (one-set decider). */
  SUPER_TIEBREAK = 'SUPER_TIEBREAK',
}
