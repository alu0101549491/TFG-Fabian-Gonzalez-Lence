/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 12, 2026
 * @file src/shared/constants.ts
 * @desc Application-wide constants organized by domain for the Cartographic Project Manager
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * ============================================
 * APPLICATION CONFIGURATION
 * ============================================
 */

/**
 * API configuration constants
 */
export const API = {
  BASE_URL:
    (import.meta.env.VITE_API_BASE_URL as string) ||
    'http://localhost:3000/api/v1',
  TIMEOUT: 30000,
  UPLOAD_TIMEOUT: 300000,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
} as const;

/**
 * WebSocket configuration constants
 */
export const WEBSOCKET = {
  URL:
    (import.meta.env.VITE_SOCKET_URL as string) || 'http://localhost:3000',
  RECONNECTION_ATTEMPTS: 10,
  RECONNECTION_DELAY: 1000,
  RECONNECTION_DELAY_MAX: 30000,
  PING_INTERVAL: 25000,
  PING_TIMEOUT: 20000,
} as const;

/**
 * ============================================
 * AUTHENTICATION
 * ============================================
 */

/**
 * Authentication and session constants
 */
export const AUTH = {
  TOKEN_EXPIRY_HOURS: 24,
  REFRESH_TOKEN_EXPIRY_DAYS: 7,
  SESSION_TIMEOUT_MINUTES: 30,
  MAX_FAILED_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  TOKEN_STORAGE_KEY: 'cpm_access_token',
  REFRESH_TOKEN_STORAGE_KEY: 'cpm_refresh_token',
  USER_STORAGE_KEY: 'cpm_user',
} as const;

/**
 * ============================================
 * PROJECT
 * ============================================
 */

/**
 * Project-related constants
 */
export const PROJECT = {
  CODE_PREFIX: 'CART',
  CODE_PATTERN: /^CART-\d{4}-\d{3}$/,
  CODE_EXAMPLE: 'CART-2025-001',
  NAME_MAX_LENGTH: 200,
  SECTIONS: [
    'Report and Annexes',
    'Plans',
    'Specifications',
    'Budget',
  ] as const,
  DROPBOX_ROOT_FOLDER: '/CartographicProjects',
} as const;

/**
 * Project section identifiers for internal use
 */
export const PROJECT_SECTIONS = {
  REPORT_AND_ANNEXES: 'ReportAndAnnexes',
  PLANS: 'Plans',
  SPECIFICATIONS: 'Specifications',
  BUDGET: 'Budget',
  TASKS: 'Tasks',
  MESSAGES: 'Messages',
} as const;

/**
 * Project status colors for UI visualization
 */
export const PROJECT_STATUS_COLORS = {
  ACTIVE: {
    hasPendingTasks: 'red',
    noPendingTasks: 'green',
  },
  IN_PROGRESS: {
    hasPendingTasks: 'red',
    noPendingTasks: 'green',
  },
  PENDING_REVIEW: 'yellow',
  FINALIZED: 'gray',
} as const;

/**
 * ============================================
 * TASK
 * ============================================
 */

/**
 * Task-related constants
 */
export const TASK = {
  DESCRIPTION_MAX_LENGTH: 1000,
  COMMENTS_MAX_LENGTH: 2000,

  STATUS_TRANSITIONS: {
    PENDING: ['IN_PROGRESS', 'PARTIAL', 'PERFORMED'],
    IN_PROGRESS: ['PENDING', 'PARTIAL', 'PERFORMED'],
    PARTIAL: ['PENDING', 'IN_PROGRESS', 'PERFORMED'],
    PERFORMED: ['COMPLETED', 'PENDING'],
    COMPLETED: [],
  } as const,
} as const;

/**
 * Task priority colors for UI visualization
 */
export const TASK_PRIORITY_COLORS = {
  URGENT: '#DC2626',
  HIGH: '#EA580C',
  MEDIUM: '#CA8A04',
  LOW: '#16A34A',
} as const;

/**
 * Task status colors for UI visualization
 */
export const TASK_STATUS_COLORS = {
  PENDING: '#6B7280',
  IN_PROGRESS: '#2563EB',
  PARTIAL: '#F59E0B',
  PERFORMED: '#8B5CF6',
  COMPLETED: '#10B981',
} as const;

/**
 * ============================================
 * MESSAGE
 * ============================================
 */

/**
 * Message-related constants
 */
export const MESSAGE = {
  CONTENT_MAX_LENGTH: 5000,
  PREVIEW_LENGTH: 100,
  TYPES: {
    NORMAL: 'NORMAL',
    SYSTEM: 'SYSTEM',
  } as const,
  SYSTEM_SENDER_ID: 'SYSTEM',
} as const;

/**
 * ============================================
 * FILE
 * ============================================
 */

/**
 * File upload and handling constants
 */
export const FILE = {
  MAX_SIZE_BYTES: 50 * 1024 * 1024,
  MAX_SIZE_MB: 50,
  CHUNK_SIZE_BYTES: 8 * 1024 * 1024,

  SUPPORTED_EXTENSIONS: {
    DOCUMENTS: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
    CARTOGRAPHY: ['.kml', '.kmz', '.shp', '.shx', '.dbf', '.prj'],
    IMAGES: ['.jpg', '.jpeg', '.png', '.tiff', '.tif', '.gif', '.webp'],
    SPREADSHEETS: ['.xls', '.xlsx', '.csv'],
    CAD: ['.dwg', '.dxf'],
    COMPRESSED: ['.zip', '.rar'],
  } as const,

  ALL_SUPPORTED_EXTENSIONS: [
    '.pdf',
    '.doc',
    '.docx',
    '.txt',
    '.rtf',
    '.kml',
    '.kmz',
    '.shp',
    '.shx',
    '.dbf',
    '.prj',
    '.jpg',
    '.jpeg',
    '.png',
    '.tiff',
    '.tif',
    '.gif',
    '.webp',
    '.xls',
    '.xlsx',
    '.csv',
    '.dwg',
    '.dxf',
    '.zip',
    '.rar',
  ] as const,

  MIME_TYPES: {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx':
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
    '.rtf': 'application/rtf',
    '.kml': 'application/vnd.google-earth.kml+xml',
    '.kmz': 'application/vnd.google-earth.kmz',
    '.shp': 'application/x-shapefile',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.tiff': 'image/tiff',
    '.tif': 'image/tiff',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx':
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.csv': 'text/csv',
    '.dwg': 'application/acad',
    '.dxf': 'application/dxf',
    '.zip': 'application/zip',
    '.rar': 'application/vnd.rar',
  } as const,
} as const;

/**
 * ============================================
 * NOTIFICATION
 * ============================================
 */

/**
 * Notification-related constants
 */
export const NOTIFICATION = {
  WHATSAPP_RATE_LIMIT_MINUTES: 30,
  RETENTION_DAYS: 30,
  MAX_TITLE_LENGTH: 100,
  MAX_MESSAGE_LENGTH: 500,
} as const;

/**
 * ============================================
 * VALIDATION
 * ============================================
 */

/**
 * Validation patterns and constraints
 */
export const VALIDATION = {
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PATTERN: /^\+[1-9]\d{6,14}$/,
  PROJECT_CODE_PATTERN: /^CART-\d{4}-\d{3}$/,

  COORDINATES: {
    LATITUDE_MIN: -90,
    LATITUDE_MAX: 90,
    LONGITUDE_MIN: -180,
    LONGITUDE_MAX: 180,
  } as const,

  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  USERNAME_PATTERN: /^[a-zA-Z0-9_-]+$/,
} as const;

/**
 * ============================================
 * UI / PAGINATION
 * ============================================
 */

/**
 * UI and pagination constants
 */
export const UI = {
  ITEMS_PER_PAGE_OPTIONS: [10, 25, 50] as const,
  DEFAULT_ITEMS_PER_PAGE: 10,
  RECENT_MESSAGES_LIMIT: 10,
  DASHBOARD_PROJECTS_LIMIT: 10,
  CALENDAR_MONTHS_RANGE: 3,
  DEBOUNCE_DELAY_MS: 300,
  TOAST_DURATION_MS: 5000,
  ANIMATION_DURATION_MS: 200,
} as const;

/**
 * ============================================
 * DATE FORMATS
 * ============================================
 */

/**
 * Date formatting patterns
 */
export const DATE_FORMATS = {
  DISPLAY_DATE: 'dd/MM/yyyy',
  DISPLAY_DATETIME: 'dd/MM/yyyy HH:mm',
  DISPLAY_TIME: 'HH:mm',
  API_DATE: 'yyyy-MM-dd',
  API_DATETIME: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  CALENDAR: 'MMMM yyyy',
  SHORT_DATE: 'dd MMM',
  RELATIVE_THRESHOLD_DAYS: 7,
} as const;

/**
 * ============================================
 * ERROR CODES
 * ============================================
 */

/**
 * Application error codes
 */
export const ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',

  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',

  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  PROJECT_HAS_PENDING_TASKS: 'PROJECT_HAS_PENDING_TASKS',

  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  SERVER_ERROR: 'SERVER_ERROR',

  NOT_FOUND: 'NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',

  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  DUPLICATE_PROJECT_CODE: 'DUPLICATE_PROJECT_CODE',

  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
} as const;

/**
 * ============================================
 * HTTP STATUS CODES
 * ============================================
 */

/**
 * Standard HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * ============================================
 * LOCAL STORAGE KEYS
 * ============================================
 */

/**
 * Local storage key identifiers
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'cpm_access_token',
  REFRESH_TOKEN: 'cpm_refresh_token',
  USER: 'cpm_user',
  THEME: 'cpm_theme',
  LANGUAGE: 'cpm_language',
  SIDEBAR_COLLAPSED: 'cpm_sidebar_collapsed',
  ITEMS_PER_PAGE: 'cpm_items_per_page',
} as const;

/**
 * ============================================
 * ROUTES
 * ============================================
 */

/**
 * Application route paths
 */
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  PROJECTS: '/projects',
  PROJECT_DETAILS: '/projects/:id',
  CALENDAR: '/calendar',
  NOTIFICATIONS: '/notifications',
  BACKUP: '/backup',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const;

/**
 * ============================================
 * TYPE EXPORTS
 * ============================================
 */

/**
 * Type for project sections
 */
export type ProjectSection = (typeof PROJECT.SECTIONS)[number];

/**
 * Type for project section keys
 */
export type ProjectSectionKey = keyof typeof PROJECT_SECTIONS;

/**
 * Type for supported file extensions
 */
export type SupportedFileExtension =
  (typeof FILE.ALL_SUPPORTED_EXTENSIONS)[number];

/**
 * Type for items per page options
 */
export type ItemsPerPageOption = (typeof UI.ITEMS_PER_PAGE_OPTIONS)[number];

/**
 * Type for error codes
 */
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * Type for HTTP status codes
 */
export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

/**
 * Type for storage keys
 */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * Type for application routes
 */
export type Route = (typeof ROUTES)[keyof typeof ROUTES];
