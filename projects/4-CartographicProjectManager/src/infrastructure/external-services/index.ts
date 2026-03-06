/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file src/infrastructure/external-services/index.ts
 * @desc Barrel export for external service integrations (Dropbox)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

// Dropbox Service exports
export {
  DropboxService,
  type IDropboxService,
  type DropboxConfig,
  type DropboxFileMetadata,
  type DropboxFolderMetadata,
  type UploadProgressCallback,
  type DownloadProgressCallback,
  type SharedLinkSettings,
  type TemporaryLinkResponse,
  type DropboxError,
} from './dropbox.service';

// Dropbox error classes
export {
  DropboxApiError,
  DropboxPathNotFoundError,
  DropboxPathConflictError,
  DropboxRateLimitError,
  DropboxInsufficientSpaceError,
} from './dropbox.service';

/**
 * Factory function for creating configured Dropbox service instance
 *
 * @param config - Dropbox configuration
 * @returns Configured Dropbox service
 *
 * @example
 * ```typescript
 * const dropboxService = createDropboxService({
 *   accessToken: process.env.VITE_DROPBOX_ACCESS_TOKEN,
 *   refreshToken: process.env.VITE_DROPBOX_REFRESH_TOKEN
 * });
 *
 * const projectPath = await dropboxService.createProjectFolder('PROJ-001');
 * ```
 */
export function createDropboxService(
  config: DropboxConfig,
): IDropboxService {
  return new DropboxService(config);
}

/**
 * Re-import types for convenience
 */
import type {
  DropboxConfig,
  IDropboxService,
} from './dropbox.service';
import { DropboxService } from './dropbox.service';
