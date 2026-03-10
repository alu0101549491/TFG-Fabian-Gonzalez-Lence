/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 10, 2026
 * @file src/presentation/view-models/project.view-model.ts
 * @desc Presentation-layer view-model types for projects (UI convenience fields).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {ProjectSummaryDto} from '../../application/dto/project-data.dto';
import type {ProjectDetailsDto} from '../../application/dto/project-details.dto';

/**
 * Project list item view model.
 *
 * Extends the transport DTO with UI-only convenience fields.
 */
export interface ProjectSummaryViewModel extends ProjectSummaryDto {
  /** UI status color token/key used by components. */
  readonly statusColor: string;
  /** Whether the project is past its delivery date (UI convenience). */
  readonly isOverdue: boolean;
  /** Days until delivery (negative when overdue). */
  readonly daysUntilDelivery: number;
}

/**
 * Project details view model.
 *
 * Extends the transport DTO with UI-only convenience fields.
 */
export interface ProjectDetailsViewModel extends ProjectDetailsDto {
  /** UI status color token/key used by components. */
  readonly statusColor: string;
  /** Whether the project is past its delivery date (UI convenience). */
  readonly isOverdue: boolean;
  /** Days until delivery (negative when overdue). */
  readonly daysUntilDelivery: number;
}
