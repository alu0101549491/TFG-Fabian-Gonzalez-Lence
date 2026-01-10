import {Card} from '../core/card';
import {Joker} from '../special-cards/jokers/joker';
import {HandEvaluator} from '../poker/hand-evaluator';
import {HandUpgradeManager} from '../poker/hand-upgrade-manager';
import {ScoreResult} from './score-result';
import {ScoreContext} from './score-context';
import {BlindModifier} from '../blinds/blind-modifier';

/**
 * Calculates final scores for played hands.
 * Enforces strict calculation order: base → cards → chip jokers → 
 * mult jokers → multiplier jokers.
 */
export class ScoreCalculator {
  private evaluator: HandEvaluator;
  private upgradeManager: HandUpgradeManager;

  /**
   * Creates a new ScoreCalculator instance.
   * @param {HandEvaluator} evaluator - Hand evaluator
   * @param {HandUpgradeManager} upgradeManager - Hand upgrade manager
   */
  constructor(
      evaluator: HandEvaluator,
      upgradeManager: HandUpgradeManager
  ) {
    this.evaluator = evaluator;
    this.upgradeManager = upgradeManager;
  }

  /**
   * Calculates the total score for a played hand.
   * @param {Card[]} cards - Cards in the played hand
   * @param {Joker[]} jokers - Active joker cards
   * @param {BlindModifier} blindModifier - Optional blind modifier
   * @return {ScoreResult} Complete score calculation result
   */
  public calculateScore(
      cards: Card[],
      jokers: Joker[],
      blindModifier?: BlindModifier
  ): ScoreResult {
    // TODO: Implement score calculation with strict ordering
    return new ScoreResult(0, 0, 0, []);
  }

  /**
   * Applies base values from hand type and upgrades.
   * @param {HandResult} handResult - Evaluated hand result
   * @return {ScoreContext} Initial score context
   */
  private applyBaseValues(handResult: any): ScoreContext {
    // TODO: Implement base value application
    return new ScoreContext(0, 0, [], handResult.handType, 0);
  }

  /**
   * Applies chip and mult bonuses from cards.
   * @param {ScoreContext} context - Current score context
   * @param {Card[]} cards - Cards to process
   */
  private applyCardBonuses(context: ScoreContext, cards: Card[]): void {
    // TODO: Implement card bonus application
  }

  /**
   * Applies joker effects in priority order.
   * @param {ScoreContext} context - Current score context
   * @param {Joker[]} jokers - Jokers to process
   */
  private applyJokerEffects(context: ScoreContext, jokers: Joker[]): void {
    // TODO: Implement joker effect application with priority sorting
  }

  /**
   * Calculates final score from chips and mult.
   * @param {ScoreContext} context - Final score context
   * @return {number} Total score (chips × mult)
   */
  private calculateFinalScore(context: ScoreContext): number {
    // TODO: Implement final score calculation
    return context.chips * context.mult;
  }
}