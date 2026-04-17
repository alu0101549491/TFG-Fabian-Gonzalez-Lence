/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 1, 2026
 * @file backend/src/shared/utils/cdn-helper.ts
 * @desc CDN URL helper utilities for static asset serving (NFR21).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {config} from '../config';

/**
 * Resolves a static asset path to either CDN URL or local server URL.
 * 
 * **CDN Mode Enabled** (production):
 * - `/uploads/avatars/user-123.webp` → `https://cdn.example.com/uploads/avatars/user-123.webp`
 * 
 * **CDN Mode Disabled** (development):
 * - `/uploads/avatars/user-123.webp` → `/uploads/avatars/user-123.webp` (served by Express)
 * 
 * @param path - Asset path relative to server root (e.g., `/uploads/avatars/user-123.webp`)
 * @returns Full URL to asset (CDN if enabled, local otherwise)
 * 
 * @example
 * ```typescript
 * const avatarUrl = getCdnUrl('/uploads/avatars/user-123.webp');
 * // Development: '/uploads/avatars/user-123.webp'
 * // Production: 'https://cdn.example.com/uploads/avatars/user-123.webp'
 * ```
 */
export function getCdnUrl(path: string): string {
  if (!config.cdn.enabled || !config.cdn.baseUrl) {
    // CDN disabled or not configured - serve from local server
    return path;
  }

  // Remove leading slash if present (CDN base URL includes it)
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Combine CDN base URL with asset path
  const cdnBaseUrl = config.cdn.baseUrl.endsWith('/') 
    ? config.cdn.baseUrl.slice(0, -1) 
    : config.cdn.baseUrl;
  
  return `${cdnBaseUrl}/${cleanPath}`;
}

/**
 * Checks if CDN is enabled and configured.
 * 
 * @returns True if CDN is enabled and baseUrl is set
 */
export function isCdnEnabled(): boolean {
  return config.cdn.enabled && !!config.cdn.baseUrl;
}

/**
 * Gets the appropriate base URL for static assets.
 * 
 * @returns CDN base URL if enabled, empty string otherwise (relative paths)
 */
export function getStaticBaseUrl(): string {
  return isCdnEnabled() ? config.cdn.baseUrl : '';
}
