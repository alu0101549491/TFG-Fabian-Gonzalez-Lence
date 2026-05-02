# GLOBAL CONTEXT

**Project:** Cartographic Project Manager (CPM)

**Description:** A web and mobile application for comprehensive management of cartographic projects that facilitates collaboration between an administrator (professional cartographer) and multiple clients simultaneously. The system enables detailed tracking of project status, bidirectional task assignment between administrator and clients with 5 possible states, internal messaging per project with file attachments, calendar view for delivery date management, and technical file sharing through Dropbox integration.

**Architecture:** Layered Architecture with Clean Architecture principles
- Domain Layer → Application Layer → Infrastructure Layer → Presentation Layer
- **Shared Layer** (current) → Used by all layers

**Current module:** Shared Layer - Constants and Utilities

## File Structure Reference
```
4-CartographicProjectManager/
├── src/
│   ├── application/                        # ✅ Already implemented
│   ├── domain/                             # ✅ Already implemented
│   ├── infrastructure/                     # ✅ Already implemented
│   ├── presentation/
│   │   └── ...
│   └── shared/
│       ├── index.ts                        # 🎯 TO IMPLEMENT
│       ├── constants.ts                    # 🎯 TO IMPLEMENT
│       └── utils.ts                        # 🎯 TO IMPLEMENT
```

---

# INPUT ARTIFACTS

## 1. Requirements Specification (Relevant Constants)

### Project Constants (Section 9)
- **Project code format:** CART-YYYY-NNN (e.g., CART-2025-001)
- **Project sections:** Report and Annexes, Plans, Specifications, Budget
- **Status colors:**
  - Red: Has pending tasks, near deadline
  - Green: No pending tasks, on track
  - Yellow: Pending review or attention needed
  - Gray: Finalized

### Task Constants (Section 10)
- **Maximum description length:** 1000 characters
- **Maximum comments length:** 2000 characters
- **Status workflow:** PENDING → IN_PROGRESS → PARTIAL → PERFORMED → COMPLETED
- **Priority levels:** URGENT, HIGH, MEDIUM, LOW

### Message Constants (Section 11)
- **Maximum content length:** 5000 characters
- **Message types:** NORMAL, SYSTEM

### File Constants (Section 12)
- **Maximum file size:** 50 MB
- **Supported formats:**
  - Documents: PDF, DOC, DOCX, TXT, RTF
  - Cartography: KML, KMZ, SHP, SHX, DBF, PRJ
  - Images: JPG, JPEG, PNG, TIFF, GIF, WEBP
  - Spreadsheets: XLS, XLSX, CSV
  - CAD: DWG, DXF
  - Compressed: ZIP, RAR

### Authentication Constants (NFR7)
- **JWT token expiration:** 24 hours
- **Refresh token expiration:** 7 days
- **Session timeout:** 30 minutes of inactivity
- **Max failed login attempts:** 5
- **Lockout duration:** 15 minutes

### Notification Constants (Section 13)
- **WhatsApp rate limit:** 1 message per 30 minutes per project
- **Notification retention:** 30 days

### Validation Constants
- **Email pattern:** Standard email regex
- **Phone pattern:** E.164 format (+XXXXXXXXXXX)
- **Project code pattern:** CART-YYYY-NNN
- **Coordinate ranges:** Latitude [-90, 90], Longitude [-180, 180]

### UI Constants (Section 14)
- **Items per page (pagination):** 10, 25, 50
- **Recent messages to show:** 10
- **Dashboard project limit:** 10
- **Calendar range:** ±3 months from current date

## 2. Utility Functions Needed

Based on the implemented layers, these utilities are needed:

**ID Generation:**
- Generate unique IDs for entities (UUID v4)

**Date Utilities:**
- Format dates for display
- Calculate days between dates
- Check if date is overdue
- Parse ISO date strings

**String Utilities:**
- Truncate text with ellipsis
- Capitalize first letter
- Slugify for URLs
- Extract file extension

**Number Utilities:**
- Format file sizes (bytes to KB/MB/GB)
- Format currency (optional)
- Clamp number to range

**Validation Utilities:**
- Validate email format
- Validate phone format
- Validate project code format
- Validate coordinate ranges

**Array Utilities:**
- Group by key
- Sort by multiple keys
- Remove duplicates
- Chunk array

**Object Utilities:**
- Deep clone
- Pick/omit keys
- Check if empty

**Color Utilities:**
- Get status color for project
- Get priority color for task

---

# SPECIFIC TASK

Implement the Shared Layer modules. These provide constants and utility functions used across all application layers.

## Files to implement:

### 1. **constants.ts**

**Responsibilities:**
- Define all application-wide constants
- Organize constants by domain area
- Export as readonly/frozen objects
- Include TypeScript types for constant values

**Constants to define:**

```typescript
/**
 * ============================================
 * APPLICATION CONFIGURATION
 * ============================================
 */

/**
 * API configuration
 */
export const API = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  TIMEOUT: 30000,
  UPLOAD_TIMEOUT: 300000,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
} as const;

/**
 * WebSocket configuration
 */
export const WEBSOCKET = {
  URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000',
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
 * Project section identifiers (for internal use)
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
 * Project status colors for UI
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

export const TASK = {
  DESCRIPTION_MAX_LENGTH: 1000,
  COMMENTS_MAX_LENGTH: 2000,
  
  // Valid status transitions
  STATUS_TRANSITIONS: {
    PENDING: ['IN_PROGRESS', 'PARTIAL', 'PERFORMED'],
    IN_PROGRESS: ['PENDING', 'PARTIAL', 'PERFORMED'],
    PARTIAL: ['PENDING', 'IN_PROGRESS', 'PERFORMED'],
    PERFORMED: ['COMPLETED', 'PENDING'], // PENDING for rejection
    COMPLETED: [], // Terminal state
  } as const,
} as const;

/**
 * Task priority colors for UI
 */
export const TASK_PRIORITY_COLORS = {
  URGENT: '#DC2626', // Red-600
  HIGH: '#EA580C',   // Orange-600
  MEDIUM: '#CA8A04', // Yellow-600
  LOW: '#16A34A',    // Green-600
} as const;

/**
 * Task status colors for UI
 */
export const TASK_STATUS_COLORS = {
  PENDING: '#6B7280',     // Gray-500
  IN_PROGRESS: '#2563EB', // Blue-600
  PARTIAL: '#F59E0B',     // Amber-500
  PERFORMED: '#8B5CF6',   // Violet-500
  COMPLETED: '#10B981',   // Emerald-500
} as const;

/**
 * ============================================
 * MESSAGE
 * ============================================
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

export const FILE = {
  MAX_SIZE_BYTES: 50 * 1024 * 1024, // 50 MB
  MAX_SIZE_MB: 50,
  CHUNK_SIZE_BYTES: 8 * 1024 * 1024, // 8 MB for chunked uploads
  
  SUPPORTED_EXTENSIONS: {
    DOCUMENTS: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
    CARTOGRAPHY: ['.kml', '.kmz', '.shp', '.shx', '.dbf', '.prj'],
    IMAGES: ['.jpg', '.jpeg', '.png', '.tiff', '.tif', '.gif', '.webp'],
    SPREADSHEETS: ['.xls', '.xlsx', '.csv'],
    CAD: ['.dwg', '.dxf'],
    COMPRESSED: ['.zip', '.rar'],
  } as const,
  
  // All supported extensions flattened
  ALL_SUPPORTED_EXTENSIONS: [
    '.pdf', '.doc', '.docx', '.txt', '.rtf',
    '.kml', '.kmz', '.shp', '.shx', '.dbf', '.prj',
    '.jpg', '.jpeg', '.png', '.tiff', '.tif', '.gif', '.webp',
    '.xls', '.xlsx', '.csv',
    '.dwg', '.dxf',
    '.zip', '.rar',
  ] as const,
  
  MIME_TYPES: {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
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
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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

export const ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  
  // Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Business rules
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  PROJECT_HAS_PENDING_TASKS: 'PROJECT_HAS_PENDING_TASKS',
  
  // Network
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  SERVER_ERROR: 'SERVER_ERROR',
  
  // Not found
  NOT_FOUND: 'NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
  
  // Conflict
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  DUPLICATE_PROJECT_CODE: 'DUPLICATE_PROJECT_CODE',
  
  // File
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
} as const;

/**
 * ============================================
 * HTTP STATUS CODES
 * ============================================
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
 * Type exports for constant values
 */
export type ProjectSection = typeof PROJECT.SECTIONS[number];
export type ProjectSectionKey = keyof typeof PROJECT_SECTIONS;
export type SupportedFileExtension = typeof FILE.ALL_SUPPORTED_EXTENSIONS[number];
export type ItemsPerPageOption = typeof UI.ITEMS_PER_PAGE_OPTIONS[number];
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
export type Route = typeof ROUTES[keyof typeof ROUTES];
```

---

### 2. **utils.ts**

**Responsibilities:**
- Provide utility functions used across the application
- Pure functions with no side effects
- Fully typed with generics where appropriate
- Well-documented with JSDoc

**Utility Functions to implement:**

```typescript
/**
 * ============================================
 * ID GENERATION
 * ============================================
 */

/**
 * Generate a UUID v4
 * @returns Unique identifier string
 */
export function generateId(): string;

/**
 * Generate a short unique ID (8 characters)
 * @returns Short unique identifier
 */
export function generateShortId(): string;

/**
 * Generate a project code
 * @param year - Project year
 * @param sequence - Sequence number
 * @returns Formatted project code (e.g., CART-2025-001)
 */
export function generateProjectCode(year: number, sequence: number): string;

/**
 * ============================================
 * DATE UTILITIES
 * ============================================
 */

/**
 * Format date for display
 * @param date - Date to format
 * @param format - Format string (default: 'dd/MM/yyyy')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | null | undefined, format?: string): string;

/**
 * Format date and time for display
 * @param date - Date to format
 * @returns Formatted datetime string
 */
export function formatDateTime(date: Date | string | null | undefined): string;

/**
 * Format time only
 * @param date - Date to format
 * @returns Formatted time string (HH:mm)
 */
export function formatTime(date: Date | string | null | undefined): string;

/**
 * Format date as relative time (e.g., "2 hours ago", "in 3 days")
 * @param date - Date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string): string;

/**
 * Calculate days between two dates
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of days (can be negative)
 */
export function daysBetween(startDate: Date | string, endDate: Date | string): number;

/**
 * Calculate days until a date from today
 * @param date - Target date
 * @returns Number of days until date (negative if past)
 */
export function daysUntil(date: Date | string): number;

/**
 * Check if a date is in the past
 * @param date - Date to check
 * @returns True if date is before today
 */
export function isPastDate(date: Date | string): boolean;

/**
 * Check if a date is today
 * @param date - Date to check
 * @returns True if date is today
 */
export function isToday(date: Date | string): boolean;

/**
 * Check if a date is overdue (past due date and not completed)
 * @param dueDate - Due date
 * @param isCompleted - Whether the item is completed
 * @returns True if overdue
 */
export function isOverdue(dueDate: Date | string, isCompleted?: boolean): boolean;

/**
 * Parse date from various formats
 * @param value - Date value to parse
 * @returns Date object or null if invalid
 */
export function parseDate(value: unknown): Date | null;

/**
 * Get start and end of a month
 * @param date - Date within the month
 * @returns Object with start and end dates
 */
export function getMonthRange(date: Date): { start: Date; end: Date };

/**
 * Add days to a date
 * @param date - Base date
 * @param days - Days to add (can be negative)
 * @returns New date
 */
export function addDays(date: Date, days: number): Date;

/**
 * ============================================
 * STRING UTILITIES
 * ============================================
 */

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to append (default: '...')
 * @returns Truncated text
 */
export function truncate(text: string | null | undefined, maxLength: number, suffix?: string): string;

/**
 * Capitalize first letter of string
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export function capitalize(text: string): string;

/**
 * Capitalize first letter of each word
 * @param text - Text to transform
 * @returns Title case text
 */
export function toTitleCase(text: string): string;

/**
 * Convert string to slug (URL-friendly)
 * @param text - Text to slugify
 * @returns Slugified text
 */
export function slugify(text: string): string;

/**
 * Extract file extension from filename
 * @param filename - Filename to extract from
 * @returns Extension with dot (e.g., '.pdf') or empty string
 */
export function getFileExtension(filename: string): string;

/**
 * Get filename without extension
 * @param filename - Full filename
 * @returns Filename without extension
 */
export function getFileNameWithoutExtension(filename: string): string;

/**
 * Check if string is empty or whitespace only
 * @param value - Value to check
 * @returns True if empty or whitespace
 */
export function isEmpty(value: string | null | undefined): boolean;

/**
 * Check if string is not empty
 * @param value - Value to check
 * @returns True if not empty
 */
export function isNotEmpty(value: string | null | undefined): boolean;

/**
 * Sanitize string for display (remove HTML tags)
 * @param text - Text to sanitize
 * @returns Sanitized text
 */
export function sanitizeHtml(text: string): string;

/**
 * ============================================
 * NUMBER UTILITIES
 * ============================================
 */

/**
 * Format file size in human-readable format
 * @param bytes - Size in bytes
 * @param decimals - Decimal places (default: 2)
 * @returns Formatted size (e.g., '2.5 MB')
 */
export function formatFileSize(bytes: number, decimals?: number): string;

/**
 * Parse file size string to bytes
 * @param sizeString - Size string (e.g., '2.5 MB')
 * @returns Size in bytes
 */
export function parseFileSize(sizeString: string): number;

/**
 * Clamp number to range
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number;

/**
 * Format number with thousand separators
 * @param value - Number to format
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted number string
 */
export function formatNumber(value: number, locale?: string): string;

/**
 * Calculate percentage
 * @param value - Current value
 * @param total - Total value
 * @param decimals - Decimal places (default: 0)
 * @returns Percentage value
 */
export function percentage(value: number, total: number, decimals?: number): number;

/**
 * ============================================
 * VALIDATION UTILITIES
 * ============================================
 */

/**
 * Validate email format
 * @param email - Email to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean;

/**
 * Validate phone number format (E.164)
 * @param phone - Phone number to validate
 * @returns True if valid phone format
 */
export function isValidPhone(phone: string): boolean;

/**
 * Validate project code format
 * @param code - Project code to validate
 * @returns True if valid project code format
 */
export function isValidProjectCode(code: string): boolean;

/**
 * Validate coordinate (latitude or longitude)
 * @param value - Coordinate value
 * @param type - 'latitude' or 'longitude'
 * @returns True if valid coordinate
 */
export function isValidCoordinate(value: number, type: 'latitude' | 'longitude'): boolean;

/**
 * Validate file extension
 * @param filename - Filename to check
 * @returns True if supported file type
 */
export function isValidFileExtension(filename: string): boolean;

/**
 * Validate file size
 * @param sizeInBytes - File size in bytes
 * @returns True if within size limit
 */
export function isValidFileSize(sizeInBytes: number): boolean;

/**
 * ============================================
 * ARRAY UTILITIES
 * ============================================
 */

/**
 * Group array items by key
 * @param array - Array to group
 * @param keyFn - Function to get group key
 * @returns Map of grouped items
 */
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Map<K, T[]>;

/**
 * Sort array by multiple keys
 * @param array - Array to sort
 * @param comparators - Comparator functions in priority order
 * @returns Sorted array (new array)
 */
export function sortByMultiple<T>(
  array: T[],
  ...comparators: Array<(a: T, b: T) => number>
): T[];

/**
 * Remove duplicate items from array
 * @param array - Array with potential duplicates
 * @param keyFn - Function to get unique key (default: identity)
 * @returns Array with duplicates removed
 */
export function uniqueBy<T, K>(array: T[], keyFn?: (item: T) => K): T[];

/**
 * Chunk array into smaller arrays
 * @param array - Array to chunk
 * @param size - Chunk size
 * @returns Array of chunks
 */
export function chunk<T>(array: T[], size: number): T[][];

/**
 * Find item in array and return with index
 * @param array - Array to search
 * @param predicate - Search predicate
 * @returns Object with item and index, or null
 */
export function findWithIndex<T>(
  array: T[],
  predicate: (item: T, index: number) => boolean
): { item: T; index: number } | null;

/**
 * ============================================
 * OBJECT UTILITIES
 * ============================================
 */

/**
 * Deep clone an object
 * @param obj - Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T;

/**
 * Pick specific keys from object
 * @param obj - Source object
 * @param keys - Keys to pick
 * @returns Object with only picked keys
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;

/**
 * Omit specific keys from object
 * @param obj - Source object
 * @param keys - Keys to omit
 * @returns Object without omitted keys
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;

/**
 * Check if object is empty
 * @param obj - Object to check
 * @returns True if object has no own properties
 */
export function isEmptyObject(obj: object | null | undefined): boolean;

/**
 * Merge objects deeply
 * @param target - Target object
 * @param sources - Source objects
 * @returns Merged object
 */
export function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T;

/**
 * ============================================
 * COLOR UTILITIES
 * ============================================
 */

/**
 * Get status color for project
 * @param status - Project status
 * @param hasPendingTasks - Whether project has pending tasks
 * @returns Color string ('red', 'green', 'yellow', 'gray')
 */
export function getProjectStatusColor(
  status: string,
  hasPendingTasks: boolean
): 'red' | 'green' | 'yellow' | 'gray';

/**
 * Get color for task priority
 * @param priority - Task priority
 * @returns Hex color code
 */
export function getTaskPriorityColor(priority: string): string;

/**
 * Get color for task status
 * @param status - Task status
 * @returns Hex color code
 */
export function getTaskStatusColor(status: string): string;

/**
 * ============================================
 * TYPE GUARDS
 * ============================================
 */

/**
 * Check if value is defined (not null or undefined)
 * @param value - Value to check
 * @returns True if defined
 */
export function isDefined<T>(value: T | null | undefined): value is T;

/**
 * Check if value is a valid Date
 * @param value - Value to check
 * @returns True if valid Date
 */
export function isValidDate(value: unknown): value is Date;

/**
 * Check if value is an array
 * @param value - Value to check
 * @returns True if array
 */
export function isArray<T>(value: unknown): value is T[];

/**
 * Check if value is an object (not null, not array)
 * @param value - Value to check
 * @returns True if object
 */
export function isObject(value: unknown): value is Record<string, unknown>;

/**
 * ============================================
 * ASYNC UTILITIES
 * ============================================
 */

/**
 * Delay execution
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after delay
 */
export function delay(ms: number): Promise<void>;

/**
 * Debounce function calls
 * @param fn - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void;

/**
 * Throttle function calls
 * @param fn - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void;

/**
 * Retry async operation with exponential backoff
 * @param operation - Async operation to retry
 * @param maxAttempts - Maximum retry attempts
 * @param baseDelayMs - Base delay in milliseconds
 * @returns Promise with operation result
 */
export function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts?: number,
  baseDelayMs?: number
): Promise<T>;
```

---

### 3. **index.ts** (Barrel Export)

**Responsibilities:**
- Re-export all constants and utilities
- Provide single entry point for shared module

**Content:**

```typescript
// Export all constants
export * from './constants';

// Export all utilities
export * from './utils';
```

---

# CONSTRAINTS AND STANDARDS

## Code:
- **Language:** TypeScript 5.x
- **Code style:** Google TypeScript Style Guide
- **Maximum cyclomatic complexity:** 10
- **Maximum function length:** 30 lines

## Mandatory best practices:
- **Pure Functions:** Utility functions should have no side effects
- **Type Safety:** Full TypeScript types with generics where appropriate
- **Documentation:** JSDoc for all exports
- **Immutability:** Never mutate input parameters
- **Constants:** Use `as const` for constant objects
- **Tree Shaking:** Export individual items for better tree shaking

## Performance considerations:
- Avoid unnecessary object creation in frequently called functions
- Use native methods where possible
- Consider memoization for expensive computations

## Testing considerations:
- All utility functions should be easily testable
- No dependencies on browser APIs (except where clearly documented)
- Predictable output for given input

---

# DELIVERABLES

1. **Complete source code** for all 3 files (constants.ts + utils.ts + index.ts)

2. **For constants.ts:**
   - All application-wide constants organized by domain
   - Type exports for constant values
   - Frozen/readonly objects with `as const`
   - Environment variable fallbacks

3. **For utils.ts:**
   - All utility functions with full implementations
   - JSDoc documentation for each function
   - TypeScript generics where appropriate
   - No external dependencies (except date-fns if needed)

4. **Edge cases to handle:**
   - Null/undefined inputs
   - Empty strings/arrays
   - Invalid dates
   - Boundary values for numbers
   - Unicode strings

---

# OUTPUT FORMAT

For each file, provide the complete implementation:

```typescript
// src/shared/constants.ts
[Complete code here]
```

```typescript
// src/shared/utils.ts
[Complete code here]
```

```typescript
// src/shared/index.ts
[Complete code here]
```

**Design decisions made:**
- [Decision 1 and justification]
- [Decision 2 and justification]

**Possible future improvements:**
- [Improvement 1]
- [Improvement 2]
