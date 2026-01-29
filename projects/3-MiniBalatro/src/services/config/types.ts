// ============================================
// FILE: src/services/config/types.ts
// ============================================

/**
 * Minimal typed interfaces for balancing definitions loaded from JSON.
 * Keeps runtime-safe shapes and helps consumers avoid `any`.
 */
export interface JokerDefinition {
  id: string;
  name: string;
  description?: string;
  type: string; // 'chips' | 'mult' | 'multiplier' | 'economic' | 'permanentUpgrade'
  value?: number;
  condition?: string;
}

export interface PlanetDefinition {
  id: string;
  name: string;
  description?: string;
  targetHandType?: any;
  chipsBonus?: number;
  multBonus?: number;
}

export interface TarotDefinition {
  id: string;
  name: string;
  description?: string;
  effectType?: any;
  effectValue?: number;
  targetRequired?: boolean;
}
