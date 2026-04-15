/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file shared/utils/id-generator.ts
 * @desc Utility functions for generating unique identifiers with prefixes (e.g., usr_123, trn_456).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {randomBytes} from 'crypto';

/**
 * Generates a unique ID with a given prefix.
 * Format: prefix_randomstring (e.g., usr_a1b2c3d4)
 *
 * @param prefix - The prefix for the ID (e.g., 'usr', 'trn')
 * @param length - Number of random characters to generate (default: 8)
 * @returns A unique ID string
 */
export function generateId(prefix: string, length: number = 8): string {
  const randomStr = randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
  return `${prefix}_${randomStr}`;
}

/**
 * Generates a UUID v4.
 *
 * @returns A UUID string
 */
export function generateUUID(): string {
  return randomBytes(16).toString('hex').replace(
    /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
    '$1-$2-$3-$4-$5'
  );
}
