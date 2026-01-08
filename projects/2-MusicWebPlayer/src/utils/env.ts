/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 8, 2026
 * @file src/utils/env.ts
 * @desc Provides environment variable access utilities for the Music Web Player application.
 *       Wraps Vite's import.meta.env to make it testable in Jest environment.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/2-MusicWebPlayer}
 * @see {@link https://vitejs.dev/guide/env-and-mode.html}
 */

/**
 * Gets the base URL for the application from environment variables.
 * Falls back to a default value if not set.
 * 
 * @returns The base URL string with trailing slash
 */
export function getBaseUrl(): string {
  // In test environment, return '/' immediately to avoid import.meta issues
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
    return '/';
  }
  
  // In production/dev, use Vite's BASE_URL
  // This line is only executed in browser/Vite environment, not in Jest
  try {
    let baseUrl = import.meta.env.BASE_URL || '/';
    // Ensure it ends with a slash
    if (!baseUrl.endsWith('/')) {
      baseUrl += '/';
    }
    return baseUrl;
  } catch {
    return '/';
  }
}
