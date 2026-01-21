// ============================================
// FILE: src/utils/apply-theme.ts
// ============================================

import { COLORS } from './constants';

/**
 * Applies color constants from TypeScript to CSS custom properties.
 * This creates a single source of truth for colors across the application.
 * 
 * Call this function once during application initialization to inject
 * the color values into the CSS :root variables.
 */
export function applyThemeColors(): void {
  const root = document.documentElement;

  // Theme Colors
  root.style.setProperty('--color-bg-primary', COLORS.BG_PRIMARY);
  root.style.setProperty('--color-bg-panel', COLORS.BG_PANEL);
  root.style.setProperty('--color-border', COLORS.BORDER);
  root.style.setProperty('--color-accent', COLORS.ACCENT);

  // Text Colors
  root.style.setProperty('--color-text-primary', COLORS.TEXT_PRIMARY);
  root.style.setProperty('--color-text-secondary', COLORS.TEXT_SECONDARY);
  root.style.setProperty('--color-text-tertiary', COLORS.TEXT_TERTIARY);

  // Suit Colors
  root.style.setProperty('--color-suit-diamonds', COLORS.SUIT_DIAMONDS);
  root.style.setProperty('--color-suit-hearts', COLORS.SUIT_HEARTS);
  root.style.setProperty('--color-suit-spades', COLORS.SUIT_SPADES);
  root.style.setProperty('--color-suit-clubs', COLORS.SUIT_CLUBS);

  // Indicator Colors
  root.style.setProperty('--color-chips', COLORS.CHIPS);
  root.style.setProperty('--color-mult', COLORS.MULT);
  root.style.setProperty('--color-money', COLORS.MONEY);
  root.style.setProperty('--color-success', COLORS.SUCCESS);
  root.style.setProperty('--color-warning', COLORS.WARNING);
  root.style.setProperty('--color-error', COLORS.ERROR);

  // Victory Modal Colors
  root.style.setProperty('--victory-bg-start', COLORS.VICTORY_BG_START);
  root.style.setProperty('--victory-bg-end', COLORS.VICTORY_BG_END);
  root.style.setProperty('--victory-border', COLORS.VICTORY_BORDER);
  root.style.setProperty('--victory-text', COLORS.VICTORY_TEXT);
  root.style.setProperty('--victory-title', COLORS.VICTORY_TITLE);
  root.style.setProperty('--victory-btn-start', COLORS.VICTORY_BTN_START);
  root.style.setProperty('--victory-btn-end', COLORS.VICTORY_BTN_END);
  root.style.setProperty('--victory-btn-hover-start', COLORS.VICTORY_BTN_HOVER_START);
  root.style.setProperty('--victory-btn-hover-end', COLORS.VICTORY_BTN_HOVER_END);

  // Defeat Modal Colors
  root.style.setProperty('--defeat-bg-start', COLORS.DEFEAT_BG_START);
  root.style.setProperty('--defeat-bg-end', COLORS.DEFEAT_BG_END);
  root.style.setProperty('--defeat-border', COLORS.DEFEAT_BORDER);
  root.style.setProperty('--defeat-text', COLORS.DEFEAT_TEXT);
  root.style.setProperty('--defeat-title', COLORS.DEFEAT_TITLE);
  root.style.setProperty('--defeat-btn-start', COLORS.DEFEAT_BTN_START);
  root.style.setProperty('--defeat-btn-end', COLORS.DEFEAT_BTN_END);
  root.style.setProperty('--defeat-btn-hover-start', COLORS.DEFEAT_BTN_HOVER_START);
  root.style.setProperty('--defeat-btn-hover-end', COLORS.DEFEAT_BTN_HOVER_END);

  console.log('Theme colors applied from constants.ts');
}

/**
 * Gets a color value from the constants.
 * Useful for inline styles or canvas rendering.
 * @param colorKey - Key from COLORS object
 * @returns Color hex value
 */
export function getColor(colorKey: keyof typeof COLORS): string {
  return COLORS[colorKey];
}

/**
 * Gets a CSS variable value from the current theme.
 * @param varName - CSS variable name (without -- prefix)
 * @returns Computed CSS variable value
 */
export function getCSSVariable(varName: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--${varName}`)
    .trim();
}
