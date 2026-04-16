/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 20, 2026
 * @file shared/pipes/enum-format.pipe.ts
 * @desc Pipe for formatting enum values from UPPER_SNAKE_CASE to human-readable format.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Pipe, PipeTransform} from '@angular/core';

/**
 * EnumFormatPipe transforms UPPER_SNAKE_CASE enum values to human-readable format.
 *
 * @example
 * ```html
 * <!-- Input: DIRECT_ACCEPTANCE -->
 * {{ 'DIRECT_ACCEPTANCE' | enumFormat }}
 * <!-- Output: Direct Acceptance -->
 *
 * <!-- Input: POINTS_BASED -->
 * {{ 'POINTS_BASED' | enumFormat }}
 * <!-- Output: Points Based -->
 * ```
 */
@Pipe({
  name: 'enumFormat',
  standalone: true,
})
export class EnumFormatPipe implements PipeTransform {
  /**
   * Transforms an enum value to human-readable format.
   *
   * @param value - The enum value in UPPER_SNAKE_CASE format
   * @returns Formatted string in Title Case
   */
  public transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    // Split by underscore, convert to lowercase, then capitalize first letter of each word
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
