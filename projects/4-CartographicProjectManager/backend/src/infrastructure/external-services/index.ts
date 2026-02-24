/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 24, 2026
 * @file backend/src/infrastructure/external-services/index.ts
 * @desc Barrel export for external service integrations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

export {
  DropboxService,
  type IDropboxService,
  type DropboxConfig,
  type DropboxFileMetadata,
  type TemporaryLinkResponse,
} from './dropbox.service.js';
