/**
 * @module shared/constants
 * @description Application-wide constants shared across all layers.
 * Includes API URLs, storage keys, default values, and limits.
 * @category Shared
 */

/** Base URL for the backend REST API. */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string
  || 'http://localhost:3000/api';

/** Base URL for the WebSocket server. */
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL as string
  || 'http://localhost:3000';

/** Local storage key for the authentication token. */
export const AUTH_TOKEN_KEY = 'cpm_auth_token';

/** Local storage key for the refresh token. */
export const REFRESH_TOKEN_KEY = 'cpm_refresh_token';

/** Maximum file upload size in bytes (50 MB). */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

/** Default page size for paginated API requests. */
export const DEFAULT_PAGE_SIZE = 20;

/** Notification delivery SLA in milliseconds (NFR12: < 5s). */
export const NOTIFICATION_SLA_MS = 5000;

/** Session timeout in milliseconds (NFR05: 15 min). */
export const SESSION_TIMEOUT_MS = 15 * 60 * 1000;

/** Accepted file MIME types for project uploads. */
export const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/tiff',
  'application/geo+json',
  'application/vnd.google-earth.kml+xml',
];

/** Application version. */
export const APP_VERSION = '1.0.0';
