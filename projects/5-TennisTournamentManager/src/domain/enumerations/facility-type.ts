/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 12, 2026
 * @file domain/enumerations/facility-type.ts
 * @desc Enumeration defining the facility type for tennis tournaments (indoor/outdoor).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * Represents the facility type of a tennis tournament venue.
 */
export enum FacilityType {
  /** Indoor facility with controlled environment. */
  INDOOR = 'INDOOR',
  /** Outdoor facility exposed to weather conditions. */
  OUTDOOR = 'OUTDOOR',
}

/**
 * Type guard to check if a value is a valid FacilityType.
 *
 * @param value - Value to check
 * @returns True if value is a valid FacilityType
 */
export function isFacilityType(value: unknown): value is FacilityType {
  return typeof value === 'string' && Object.values(FacilityType).includes(value as FacilityType);
}

/**
 * Gets a human-readable label for each facility type.
 *
 * @param type - The facility type
 * @returns A display-friendly label
 */
export function getFacilityTypeLabel(type: FacilityType): string {
  const labels: Record<FacilityType, string> = {
    [FacilityType.INDOOR]: 'Indoor',
    [FacilityType.OUTDOOR]: 'Outdoor',
  };
  return labels[type];
}
