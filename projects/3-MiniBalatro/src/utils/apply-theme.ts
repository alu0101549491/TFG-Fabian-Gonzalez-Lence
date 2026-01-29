/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/utils/apply-theme.ts
 * @desc Theme application utilities for managing CSS custom properties and color constants.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { COLORS } from './constants';

/**
 * Theme structure matching COLORS constant.
 */
export interface ThemeColors {
  [key: string]: string;
}

/**
 * Validates if a string is a valid hex color.
 * @param color - Color string to validate
 * @returns True if valid hex color
 */
const isValidHexColor = (color: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

/**
 * Validates theme colors and logs warnings for invalid values.
 * @param colors - Theme colors object to validate
 */
const validateThemeColors = (colors: ThemeColors): void => {
  Object.entries(colors).forEach(([key, value]) => {
    if (!isValidHexColor(value)) {
      console.warn(`Invalid color value for ${key}: ${value}. Using default.`);
    }
  });
};

/**
 * Applies color constants from TypeScript to CSS custom properties.
 * This creates a single source of truth for colors across the application.
 * 
 * Call this function once during application initialization to inject
 * the color values into the CSS :root variables.
 * 
 * @param theme - Optional theme colors object (defaults to COLORS from constants)
 */
export function applyThemeColors(theme: ThemeColors = COLORS): void {
  // SSR safety check
  if (typeof document === 'undefined') {
    console.warn('applyThemeColors called in non-browser environment');
    return;
  }

  // Validate theme colors
  validateThemeColors(theme);

  const root = document.documentElement;

  // Apply all theme colors dynamically
  Object.entries(theme).forEach(([key, value]) => {
    // Convert key from SCREAMING_SNAKE_CASE to kebab-case
    const cssVarName = key.toLowerCase().replace(/_/g, '-');
    const cssVar = cssVarName.startsWith('victory-') || cssVarName.startsWith('defeat-') 
      ? `--${cssVarName}` 
      : `--color-${cssVarName}`;
    root.style.setProperty(cssVar, value);
  });

  console.log('Theme colors applied successfully');
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
 * @returns Computed CSS variable value or empty string if not in browser
 */
export function getCSSVariable(varName: string): string {
  if (typeof document === 'undefined') {
    return '';
  }
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--${varName}`)
    .trim();
}
