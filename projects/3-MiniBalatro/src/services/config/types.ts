/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/services/config/types.ts
 * @desc Type definitions for JSON-loaded balancing configurations (jokers, planets, tarots).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

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
