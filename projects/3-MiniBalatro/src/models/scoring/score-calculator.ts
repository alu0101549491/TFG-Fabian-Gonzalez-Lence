// ============================================
// FILE: src/models/scoring/score-calculator.ts
// ============================================

import { Card } from '../core/card';
import { HandEvaluator } from '../poker/hand-evaluator';
import { HandUpgradeManager } from '../poker/hand-upgrade-manager';
import { HandResult } from '../poker/hand-result';
import { Joker } from '../special-cards/jokers/joker';
import { JokerPriority } from '../special-cards/jokers/joker-priority.enum';
import { ScoreContext } from './score-context';
import { ScoreResult } from './score-result';
import { ScoreBreakdown } from './score-breakdown';
import { BlindModifier } from '../blinds/blind-modifier';

/**
 * Orchestrates score calculation with strict ordering.
 * Enforces: base values → card bonuses → joker effects (by priority) → final calculation.
 */
export class ScoreCalculator {
  /**
   * Creates a score calculator with required dependencies.
   * @param evaluator - Hand evaluator for determining hand type
   * @param upgradeManager - Manager for hand upgrade values
   * @throws Error if either parameter is null
   */
  constructor(
    private readonly evaluator: HandEvaluator,
    private readonly upgradeManager: HandUpgradeManager
  ) {
    if (!evaluator || !upgradeManager) {
      throw new Error('Evaluator and upgrade manager cannot be null');
    }
  }

  /**
   * Calculates complete score following strict order, returns detailed result.
   * @param cards - Cards played in this hand (1-5)
   * @param jokers - Active jokers to apply
   * @param remainingDeckSize - Cards remaining in deck
   * @param blindModifier - Optional blind modifier (boss effects)
   * @returns ScoreResult with totalScore = chips × mult
   * @throws Error if cards empty or > 5, or remainingDeckSize negative
   */
  public calculateScore(
    cards: Card[],
    jokers: Joker[],
    remainingDeckSize: number,
    blindModifier?: BlindModifier
  ): ScoreResult {
    if (!cards || cards.length === 0 || cards.length > 5) {
      throw new Error('Cards array must contain between 1 and 5 cards');
    }
    if (remainingDeckSize < 0) {
      throw new Error('Remaining deck size cannot be negative');
    }

    console.log('Starting score calculation...');

    // Step 1: Evaluate hand type and get base values
    const handResult = this.evaluator.evaluateHand(cards, this.upgradeManager);
    const context = this.applyBaseValues(handResult, blindModifier);

    // Create breakdown entries for base values (we keep breakdown separate from ScoreContext)
    const breakdown: ScoreBreakdown[] = [
      new ScoreBreakdown(
        'Base Hand',
        handResult.baseChips,
        handResult.baseMult,
        `${handResult.handType} base values`
      )
    ];

    // Step 2: Apply individual card bonuses
    this.applyCardBonuses(context, cards, jokers, breakdown);

    // Step 3: Apply joker effects by priority
    this.applyJokerEffects(context, jokers, breakdown);

    // Step 4: Calculate final score
    const totalScore = this.calculateFinalScore(context);

    const result = new ScoreResult(totalScore, context.chips, context.mult, breakdown);

    console.log(`Score calculation complete: ${totalScore} = ${context.chips} × ${context.mult}`);
    return result;
  }

  /**
   * Creates initial context with base chips and mult from hand type.
   * @param handResult - Hand evaluation result
   * @param blindModifier - Optional blind modifier
   * @returns ScoreContext with base values
   */
  private applyBaseValues(
    handResult: HandResult,
    blindModifier?: BlindModifier
  ): ScoreContext {
    let baseChips = handResult.baseChips;
    let baseMult = handResult.baseMult;

    // Apply blind modifier if present
    if (blindModifier) {
      if (blindModifier.chipsDivisor) {
        baseChips = Math.floor(baseChips / blindModifier.chipsDivisor);
      }
      if (blindModifier.multDivisor) {
        baseMult = Math.floor(baseMult / blindModifier.multDivisor);
      }
    }

    const context = new ScoreContext(
      baseChips,
      baseMult,
      handResult.cards,
      handResult.handType,
      handResult.cards.length // Simplified for example
    );

    console.log(`Base values: ${baseChips} chips, ${baseMult} mult (${handResult.handType})`);
    return context;
  }

  /**
   * Applies individual card chips and per-card joker effects.
   * @param context - Current score context
   * @param cards - Played cards
   * @param jokers - Active jokers
   * @param breakdown - Score breakdown array to append entries to
   */
  private applyCardBonuses(
    context: ScoreContext,
    cards: Card[],
    jokers: Joker[],
    breakdown: ScoreBreakdown[]
  ): void {
    console.log('Applying card bonuses...');

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const cardDisplay = card.getDisplayString();

      // Add card's base chips
      const cardChips = card.getBaseChips();
      context.addChips(cardChips);
      breakdown.push(
        new ScoreBreakdown(
          cardDisplay,
          cardChips,
          0,
          `Base chips from ${cardDisplay}`
        )
      );

      // Add card's mult bonus (from tarot effects)
      if (card.getMultBonus() > 0) {
        context.addMult(card.getMultBonus());
        breakdown.push(
          new ScoreBreakdown(
            cardDisplay,
            0,
            card.getMultBonus(),
            `Mult bonus from ${cardDisplay}`
          )
        );
      }

      // Check per-card joker effects
      for (const joker of jokers) {
        // This is a simplified check - real implementation would need
        // to check if the joker has a per-card condition
        if (joker.canActivate(context)) {
          // Example: Greedy Joker adds +3 mult per Diamond
          // In a real implementation, we'd check the joker's specific condition
          // For this example, we'll assume all per-card jokers add to mult
          const multBonus = 3; // Example value
          context.addMult(multBonus);
          breakdown.push(
            new ScoreBreakdown(
              joker.name,
              0,
              multBonus,
              `${joker.name} on ${cardDisplay}`
            )
          );
        }
      }
    }

    console.log(`After card bonuses: ${context.chips} chips, ${context.mult} mult`);
  }

  /**
   * Applies persistent joker effects in strict priority order.
   * @param context - Current score context
   * @param jokers - Active jokers
   * @param breakdown - Score breakdown array to append entries to
   */
  private applyJokerEffects(context: ScoreContext, jokers: Joker[], breakdown: ScoreBreakdown[]): void {
    console.log('Applying joker effects by priority...');

    // Sort jokers by priority (CHIPS → MULT → MULTIPLIER)
    const sortedJokers = [...jokers].sort((a, b) => {
      return a.getPriority() - b.getPriority();
    });

    // Group jokers by priority
    const priorityGroups = {
      [JokerPriority.CHIPS]: [] as Joker[],
      [JokerPriority.MULT]: [] as Joker[],
      [JokerPriority.MULTIPLIER]: [] as Joker[]
    };

    for (const joker of sortedJokers) {
      priorityGroups[joker.getPriority()].push(joker);
    }

    // Apply effects in priority order
    this.applyPriorityGroup(context, priorityGroups[JokerPriority.CHIPS], 'chips', breakdown);
    this.applyPriorityGroup(context, priorityGroups[JokerPriority.MULT], 'mult', breakdown);
    this.applyPriorityGroup(context, priorityGroups[JokerPriority.MULTIPLIER], 'multiplier', breakdown);

    console.log(`After joker effects: ${context.chips} chips, ${context.mult} mult`);
  }

  /**
   * Applies a group of jokers with the same priority.
   * @param context - Current score context
   * @param jokers - Jokers to apply
   * @param priorityType - Type of priority (for logging)
   * @param breakdown - Score breakdown array to append entries to
   */
  private applyPriorityGroup(
    context: ScoreContext,
    jokers: Joker[],
    priorityType: string,
    breakdown: ScoreBreakdown[]
  ): void {
    for (const joker of jokers) {
      if (joker.canActivate(context)) {
        // Create a temporary context to capture the effect
        const beforeChips = context.chips;
        const beforeMult = context.mult;

        // Apply the joker's effect
        joker.applyEffect(context);

        // Record the breakdown
        const chipsAdded = context.chips - beforeChips;
        const multAdded = context.mult - beforeMult;

        breakdown.push(
          new ScoreBreakdown(
            joker.name,
            chipsAdded,
            multAdded,
            `${joker.name} (${priorityType} priority)`
          )
        );
      }
    }
  }

  /**
   * Computes final score as chips × mult.
   * @param context - Final score context
   * @returns Non-negative integer score
   */
  private calculateFinalScore(context: ScoreContext): number {
    const finalScore = Math.floor(context.chips * context.mult);
    console.log(`Final score: ${finalScore} = ${context.chips} × ${context.mult}`);
    return finalScore;
  }
}