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
  /** Topographic survey and mapping work. */
  TOPOGRAPHY = 'TOPOGRAPHY',
  /** Cadastral mapping and land registry work. */
  CADASTRE = 'CADASTRE',
  /** Geographic Information System projects. */
  GIS = 'GIS',
  /** Hydrological studies and water resource mapping. */
  HYDROLOGY = 'HYDROLOGY',
  /** Civil engineering projects and infrastructure. */
  CIVIL_ENGINEERING = 'CIVIL_ENGINEERING',
  /** Environmental impact assessment documents. */
  ENVIRONMENTAL_DOCUMENT = 'ENVIRONMENTAL_DOCUMENT',
  /** Study of project alternatives and feasibility. */
  STUDY_OF_ALTERNATIVES = 'STUDY_OF_ALTERNATIVES',
  /** Geological surveys and terrain analysis. */
  GEOLOGICAL_STUDY = 'GEOLOGICAL_STUDY',
  /** Hydrogeological studies and groundwater mapping. */
  HYDROGEOLOGICAL_STUDY = 'HYDROGEOLOGICAL_STUDY',
  /** Risk assessment and hazard mapping studies. */
  RISK_STUDY = 'RISK_STUDY',
  /** Construction project management and oversight. */
  CONSTRUCTION_MANAGEMENT = 'CONSTRUCTION_MANAGEMENT',
  /** Miscellaneous or other types of projects. */
  MISCELLANEOUS = 'MISCELLANEOUS',
}

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
