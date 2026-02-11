/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file domain/enumerations/project-type.ts
 * @desc Enumeration defining the categories of cartographic projects.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Represents the type classification of a cartographic project.
 */
export enum ProjectType {
  /** Residential area cartographic work. */
  RESIDENTIAL = 'RESIDENTIAL',
  /** Commercial zone cartographic work. */
  COMMERCIAL = 'COMMERCIAL',
  /** Industrial area cartographic work. */
  INDUSTRIAL = 'INDUSTRIAL',
  /** Public infrastructure cartographic work. */
  PUBLIC = 'PUBLIC',
}

/**
 * Human-readable display names for project types.
 */
export const ProjectTypeDisplayName: Record<ProjectType, string> = {
  [ProjectType.RESIDENTIAL]: 'Residential',
  [ProjectType.COMMERCIAL]: 'Commercial',
  [ProjectType.INDUSTRIAL]: 'Industrial',
  [ProjectType.PUBLIC]: 'Public',
};

/**
 * Type guard to check if a value is a valid ProjectType.
 *
 * @param value - The value to check
 * @returns True if the value is a valid ProjectType
 */
export function isValidProjectType(value: unknown): value is ProjectType {
  return Object.values(ProjectType).includes(value as ProjectType);
}

/**
 * Array of all project types for iteration.
 */
export const ALL_PROJECT_TYPES = Object.values(ProjectType);
