/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2026-03-13
 * @file e2e/helpers/test-data.ts
 * @desc Deterministic helpers for generating test data.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Generates a unique, URL-safe nonce for test entities.
 */
export function uniqueNonce(prefix: string): string {
  const now = Date.now();
  const rand = Math.random().toString(16).slice(2);
  return `${prefix}-${now}-${rand}`;
}

/**
 * Formats a JS Date into `YYYY-MM-DD` for `<input type="date">` fields.
 */
export function toDateInputValue(date: Date): string {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Returns a date offset from today (local time).
 */
export function daysFromToday(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}
