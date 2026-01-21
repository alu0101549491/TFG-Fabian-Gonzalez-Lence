// ============================================
// FILE: src/models/blinds/boss-type.enum.ts
// ============================================

/**
 * Enum defining all boss blind types.
 * Each boss has unique rule modifications.
 */
export enum BossType {
  THE_WALL = 'THE_WALL',
  THE_WATER = 'THE_WATER',
  THE_MOUTH = 'THE_MOUTH',
  THE_NEEDLE = 'THE_NEEDLE',
  THE_FLINT = 'THE_FLINT'
}

/**
 * Returns the display name for a boss type.
 * @param bossType - The boss type to get display name for
 * @returns The display name (e.g., "The Wall")
 */
export function getBossDisplayName(bossType: BossType): string {
  switch (bossType) {
    case BossType.THE_WALL: return 'The Wall';
    case BossType.THE_WATER: return 'The Water';
    case BossType.THE_MOUTH: return 'The Mouth';
    case BossType.THE_NEEDLE: return 'The Needle';
    case BossType.THE_FLINT: return 'The Flint';
    default: return 'Unknown Boss';
  }
}

/**
 * Returns the effect description for a boss type.
 * @param bossType - The boss type to get description for
 * @returns The effect description for UI
 */
export function getBossDescription(bossType: BossType): string {
  switch (bossType) {
    case BossType.THE_WALL: return 'Scoring goal increases to 4× round base';
    case BossType.THE_WATER: return 'Level starts with 0 available discards';
    case BossType.THE_MOUTH: return 'Only one specific type of poker hand is allowed';
    case BossType.THE_NEEDLE: return 'Only 1 hand can be played (goal reduced to 1× base)';
    case BossType.THE_FLINT: return 'Base chips and mult of all hands are halved';
    default: return 'Unknown boss effect';
  }
}