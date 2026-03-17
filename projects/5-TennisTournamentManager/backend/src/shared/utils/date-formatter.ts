/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file shared/utils/date-formatter.ts
 * @desc Utility functions for date formatting and manipulation.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * Formats a Date object to ISO 8601 string.
 *
 * @param date - The date to format
 * @returns ISO 8601 formatted string
 */
export function formatToISO(date: Date): string {
  return date.toISOString();
}

/**
 * Parses an ISO 8601 string to a Date object.
 *
 * @param isoString - The ISO string to parse
 * @returns A Date object
 */
export function parseISO(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Checks if a date is in the past.
 *
 * @param date - The date to check
 * @returns True if the date is in the past
 */
export function isPast(date: Date): boolean {
  return date < new Date();
}

/**
 * Checks if a date is in the future.
 *
 * @param date - The date to check
 * @returns True if the date is in the future
 */
export function isFuture(date: Date): boolean {
  return date > new Date();
}
