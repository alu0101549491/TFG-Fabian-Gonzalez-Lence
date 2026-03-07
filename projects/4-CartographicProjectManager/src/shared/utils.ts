/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 12, 2026
 * @file src/shared/utils.ts
 * @desc Comprehensive utility functions for the Cartographic Project Manager
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {
  VALIDATION,
  FILE,
  PROJECT,
  PROJECT_STATUS_COLORS,
  TASK_PRIORITY_COLORS,
  TASK_STATUS_COLORS,
} from './constants';

/**
 * ============================================
 * ID GENERATION
 * ============================================
 */

/**
 * Generate a UUID v4 compliant identifier
 *
 * @returns Unique identifier string in UUID v4 format
 *
 * @example
 * ```typescript
 * const id = generateId();
 * // '550e8400-e29b-41d4-a716-446655440000'
 * ```
 */
export function generateId(): string {
  const cryptoObj = globalThis.crypto;
  if (typeof cryptoObj?.randomUUID === 'function') {
    return cryptoObj.randomUUID();
  }

  if (typeof cryptoObj?.getRandomValues !== 'function') {
    throw new Error('Secure UUID generation requires Web Crypto (crypto.getRandomValues).');
  }

  const bytes = new Uint8Array(16);
  cryptoObj.getRandomValues(bytes);

  // RFC 4122 version 4
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  // RFC 4122 variant 1
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  let hex = '';
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, '0');
  }

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Generate a short unique identifier (8 characters)
 *
 * @returns Short unique identifier
 *
 * @example
 * ```typescript
 * const shortId = generateShortId();
 * // 'x7k9m2p4'
 * ```
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Generate a formatted project code
 *
 * @param year - Project year (YYYY)
 * @param sequence - Sequence number (1-999)
 * @returns Formatted project code (CART-YYYY-NNN)
 *
 * @example
 * ```typescript
 * const code = generateProjectCode(2025, 1);
 * // 'CART-2025-001'
 * ```
 */
export function generateProjectCode(year: number, sequence: number): string {
  const paddedSequence = sequence.toString().padStart(3, '0');
  return `${PROJECT.CODE_PREFIX}-${year}-${paddedSequence}`;
}

/**
 * ============================================
 * DATE UTILITIES
 * ============================================
 */

/**
 * Format date for display
 *
 * @param date - Date to format
 * @param format - Format string (default: 'dd/MM/yyyy')
 * @returns Formatted date string or empty string if invalid
 *
 * @example
 * ```typescript
 * formatDate(new Date(2025, 5, 15));
 * // '15/06/2025'
 * ```
 */
export function formatDate(
  date: Date | string | null | undefined,
  format = 'dd/MM/yyyy',
): string {
  if (!date) return '';

  const parsedDate = parseDate(date);
  if (!parsedDate) return '';

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthNamesShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const day = parsedDate.getDate().toString().padStart(2, '0');
  const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
  const monthShort = monthNamesShort[parsedDate.getMonth()];
  const monthFull = monthNames[parsedDate.getMonth()];
  const year = parsedDate.getFullYear();

  return format
    .replace('MMMM', monthFull)
    .replace('MMM', monthShort)
    .replace('dd', day)
    .replace('MM', month)
    .replace('yyyy', year.toString());
}

/**
 * Format date and time for display
*
 * @param date - Date to format
 * @returns Formatted datetime string
 *
 * @example
 * ```typescript
 * formatDateTime(new Date(2025, 5, 15, 14, 30));
 * // '15/06/2025 14:30'
 * ```
 */
export function formatDateTime(
  date: Date | string | null | undefined,
): string {
  if (!date) return '';

  const parsedDate = parseDate(date);
  if (!parsedDate) return '';

  const dateStr = formatDate(parsedDate);
  const hours = parsedDate.getHours().toString().padStart(2, '0');
  const minutes = parsedDate.getMinutes().toString().padStart(2, '0');

  return `${dateStr} ${hours}:${minutes}`;
}

/**
 * Format time only (HH:mm)
 *
 * @param date - Date to format
 * @returns Formatted time string
 *
 * @example
 * ```typescript
 * formatTime(new Date(2025, 5, 15, 14, 30));
 * // '14:30'
 * ```
 */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return '';

  const parsedDate = parseDate(date);
  if (!parsedDate) return '';

  const hours = parsedDate.getHours().toString().padStart(2, '0');
  const minutes = parsedDate.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}

/**
 * Format date as relative time
 *
 * @param date - Date to format
 * @returns Relative time string
 *
 * @example
 * ```typescript
 * formatRelativeTime(new Date(Date.now() - 3600000));
 * // '1 hour ago'
 * ```
 */
export function formatRelativeTime(date: Date | string): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '';

  const now = new Date();
  const diffMs = now.getTime() - parsedDate.getTime();
  const diffSec = Math.abs(Math.floor(diffMs / 1000));
  const isPast = diffMs > 0;

  if (diffSec < 60) {
    return isPast ? 'just now' : 'in a moment';
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return isPast
      ? `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`
      : `in ${diffMin} minute${diffMin > 1 ? 's' : ''}`;
  }

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return isPast
      ? `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`
      : `in ${diffHour} hour${diffHour > 1 ? 's' : ''}`;
  }

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) {
    return isPast
      ? `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
      : `in ${diffDay} day${diffDay > 1 ? 's' : ''}`;
  }

  return formatDate(parsedDate);
}

/**
 * Calculate days between two dates
 *
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of days (can be negative)
 *
 * @example
 * ```typescript
 * daysBetween(new Date(2025, 0, 1), new Date(2025, 0, 15));
 * // 14
 * ```
 */
export function daysBetween(
  startDate: Date | string,
  endDate: Date | string,
): number {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (!start || !end) return 0;

  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculate days until a date from today
 *
 * @param date - Target date
 * @returns Number of days until date (negative if past)
 *
 * @example
 * ```typescript
 * daysUntil(new Date(Date.now() + 86400000));
 * // 1
 * ```
 */
export function daysUntil(date: Date | string): number {
  const target = parseDate(date);
  if (!target) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return daysBetween(today, target);
}

/**
 * Check if a date is in the past
 *
 * @param date - Date to check
 * @returns True if date is before now
 *
 * @example
 * ```typescript
 * isPastDate(new Date(2020, 0, 1));
 * // true
 * ```
 */
export function isPastDate(date: Date | string): boolean {
  const parsed = parseDate(date);
  if (!parsed) return false;

  return parsed.getTime() < Date.now();
}

/**
 * Check if a date is today
 *
 * @param date - Date to check
 * @returns True if date is today
 *
 * @example
 * ```typescript
 * isToday(new Date());
 * // true
 * ```
 */
export function isToday(date: Date | string): boolean {
  const parsed = parseDate(date);
  if (!parsed) return false;

  const today = new Date();
  return (
    parsed.getDate() === today.getDate() &&
    parsed.getMonth() === today.getMonth() &&
    parsed.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if two dates are on the same day
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if dates are on the same day
 *
 * @example
 * ```typescript
 * isSameDay(new Date(2025, 5, 15, 10, 0), new Date(2025, 5, 15, 18, 30));
 * // true
 * ```
 */
export function isSameDay(
  date1: Date | string,
  date2: Date | string,
): boolean {
  const parsed1 = parseDate(date1);
  const parsed2 = parseDate(date2);

  if (!parsed1 || !parsed2) return false;

  return (
    parsed1.getDate() === parsed2.getDate() &&
    parsed1.getMonth() === parsed2.getMonth() &&
    parsed1.getFullYear() === parsed2.getFullYear()
  );
}

/**
 * Check if a date is in the current week
 *
 * @param date - Date to check
 * @returns True if date is in current week
 *
 * @example
 * ```typescript
 * isThisWeek(new Date());
 * // true
 * ```
 */
export function isThisWeek(date: Date | string): boolean {
  const parsed = parseDate(date);
  if (!parsed) return false;

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return parsed >= startOfWeek && parsed < endOfWeek;
}

/**
 * Check if a date is overdue
 *
 * @param dueDate - Due date
 * @param isCompleted - Whether the item is completed
 * @returns True if overdue
 *
 * @example
 * ```typescript
 * isOverdue(new Date(2020, 0, 1), false);
 * // true
 * ```
 */
export function isOverdue(
  dueDate: Date | string,
  isCompleted = false,
): boolean {
  if (isCompleted) return false;

  const parsed = parseDate(dueDate);
  if (!parsed) return false;

  return daysUntil(parsed) < 0;
}

/**
 * Parse date from various formats
 *
 * @param value - Date value to parse
 * @returns Date object or null if invalid
 *
 * @example
 * ```typescript
 * parseDate('2025-06-15');
 * // Date object
 * ```
 */
export function parseDate(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
}

/**
 * Get start and end of a month
 *
 * @param date - Date within the month
 * @returns Object with start and end dates
 *
 * @example
 * ```typescript
 * getMonthRange(new Date(2025, 5, 15));
 * // { start: Date(2025, 5, 1), end: Date(2025, 5, 30) }
 * ```
 */
export function getMonthRange(date: Date): {start: Date; end: Date} {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return {start, end};
}

/**
 * Add days to a date
 *
 * @param date - Base date
 * @param days - Days to add (can be negative)
 * @returns New date
 *
 * @example
 * ```typescript
 * addDays(new Date(2025, 0, 1), 5);
 * // Date(2025, 0, 6)
 * ```
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * ============================================
 * STRING UTILITIES
 * ============================================
 */

/**
 * Truncate text with ellipsis
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to append (default: '...')
 * @returns Truncated text
 *
 * @example
 * ```typescript
 * truncate('Long text here', 8);
 * // 'Long tex...'
 * ```
 */
export function truncate(
  text: string | null | undefined,
  maxLength: number,
  suffix = '...',
): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalize first letter of string
 *
 * @param text - Text to capitalize
 * @returns Capitalized text
 *
 * @example
 * ```typescript
 * capitalize('hello world');
 * // 'Hello world'
 * ```
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Capitalize first letter of each word
 *
 * @param text - Text to transform
 * @returns Title case text
 *
 * @example
 * ```typescript
 * toTitleCase('hello world');
 * // 'Hello World'
 * ```
 */
export function toTitleCase(text: string): string {
  if (!text) return '';

  return text
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Convert string to slug (URL-friendly)
 *
 * @param text - Text to slugify
 * @returns Slugified text
 *
 * @example
 * ```typescript
 * slugify('Hello World!');
 * // 'hello-world'
 * ```
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract file extension from filename
 *
 * @param filename - Filename to extract from
 * @returns Extension with dot (e.g., '.pdf') or empty string
 *
 * @example
 * ```typescript
 * getFileExtension('document.pdf');
 * // '.pdf'
 * ```
 */
export function getFileExtension(filename: string): string {
  if (!filename) return '';

  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';

  return filename.substring(lastDot).toLowerCase();
}

/**
 * Get filename without extension
 *
 * @param filename - Full filename
 * @returns Filename without extension
 *
 * @example
 * ```typescript
 * getFileNameWithoutExtension('document.pdf');
 * // 'document'
 * ```
 */
export function getFileNameWithoutExtension(filename: string): string {
  if (!filename) return '';

  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return filename;

  return filename.substring(0, lastDot);
}

/**
 * Check if string is empty or whitespace only
 *
 * @param value - Value to check
 * @returns True if empty or whitespace
 *
 * @example
 * ```typescript
 * isEmpty('   ');
 * // true
 * ```
 */
export function isEmpty(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}

/**
 * Check if string is not empty
 *
 * @param value - Value to check
 * @returns True if not empty
 *
 * @example
 * ```typescript
 * isNotEmpty('text');
 * // true
 * ```
 */
export function isNotEmpty(value: string | null | undefined): boolean {
  return !isEmpty(value);
}

/**
 * Sanitize string for display (remove HTML tags)
 *
 * @param text - Text to sanitize
 * @returns Sanitized text
 *
 * @example
 * ```typescript
 * sanitizeHtml('<script>alert("XSS")</script>Hello');
 * // 'Hello'
 * ```
 */
export function sanitizeHtml(text: string): string {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, '');
}

/**
 * ============================================
 * NUMBER UTILITIES
 * ============================================
 */

/**
 * Format file size in human-readable format
 *
 * @param bytes - Size in bytes
 * @param decimals - Decimal places (default: 2)
 * @returns Formatted size (e.g., '2.5 MB')
 *
 * @example
 * ```typescript
 * formatFileSize(2621440);
 * // '2.50 MB'
 * ```
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
  );
}

/**
 * Parse file size string to bytes
 *
 * @param sizeString - Size string (e.g., '2.5 MB')
 * @returns Size in bytes
 *
 * @example
 * ```typescript
 * parseFileSize('2.5 MB');
 * // 2621440
 * ```
 */
export function parseFileSize(sizeString: string): number {
  const units: Record<string, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
    TB: 1024 * 1024 * 1024 * 1024,
  };

  const match = sizeString.match(/^([\d.]+)\s*([A-Z]+)$/i);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();

  return value * (units[unit] || 1);
}

/**
 * Clamp number to range
 *
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 *
 * @example
 * ```typescript
 * clamp(150, 0, 100);
 * // 100
 * ```
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Format number with thousand separators
 *
 * @param value - Number to format
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted number string
 *
 * @example
 * ```typescript
 * formatNumber(1234567);
 * // '1,234,567'
 * ```
 */
export function formatNumber(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Calculate percentage
 *
 * @param value - Current value
 * @param total - Total value
 * @param decimals - Decimal places (default: 0)
 * @returns Percentage value
 *
 * @example
 * ```typescript
 * percentage(25, 100);
 * // 25
 * ```
 */
export function percentage(
  value: number,
  total: number,
  decimals = 0,
): number {
  if (total === 0) return 0;
  return parseFloat(((value / total) * 100).toFixed(decimals));
}

/**
 * ============================================
 * VALIDATION UTILITIES
 * ============================================
 */

/**
 * Validate email format
 *
 * @param email - Email to validate
 * @returns True if valid email format
 *
 * @example
 * ```typescript
 * isValidEmail('user@example.com');
 * // true
 * ```
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return VALIDATION.EMAIL_PATTERN.test(email);
}

/**
 * Validate phone number format (E.164)
 *
 * @param phone - Phone number to validate
 * @returns True if valid phone format
 *
 * @example
 * ```typescript
 * isValidPhone('+34612345678');
 * // true
 * ```
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  return VALIDATION.PHONE_PATTERN.test(phone);
}

/**
 * Validate project code format
 *
 * @param code - Project code to validate
 * @returns True if valid project code format
 *
 * @example
 * ```typescript
 * isValidProjectCode('CART-2025-001');
 * // true
 * ```
 */
export function isValidProjectCode(code: string): boolean {
  if (!code) return false;
  return VALIDATION.PROJECT_CODE_PATTERN.test(code);
}

/**
 * Validate coordinate (latitude or longitude)
 *
 * @param value - Coordinate value
 * @param type - 'latitude' or 'longitude'
 * @returns True if valid coordinate
 *
 * @example
 * ```typescript
 * isValidCoordinate(45.5, 'latitude');
 * // true
 * ```
 */
export function isValidCoordinate(
  value: number,
  type: 'latitude' | 'longitude',
): boolean {
  if (typeof value !== 'number' || isNaN(value)) return false;

  if (type === 'latitude') {
    return (
      value >= VALIDATION.COORDINATES.LATITUDE_MIN &&
      value <= VALIDATION.COORDINATES.LATITUDE_MAX
    );
  }

  return (
    value >= VALIDATION.COORDINATES.LONGITUDE_MIN &&
    value <= VALIDATION.COORDINATES.LONGITUDE_MAX
  );
}

/**
 * Validate file extension
 *
 * @param filename - Filename to check
 * @returns True if supported file type
 *
 * @example
 * ```typescript
 * isValidFileExtension('document.pdf');
 * // true
 * ```
 */
export function isValidFileExtension(filename: string): boolean {
  if (!filename) return false;

  const ext = getFileExtension(filename);
  return FILE.ALL_SUPPORTED_EXTENSIONS.includes(
    ext as (typeof FILE.ALL_SUPPORTED_EXTENSIONS)[number],
  );
}

/**
 * Validate file size
 *
 * @param sizeInBytes - File size in bytes
 * @returns True if within size limit
 *
 * @example
 * ```typescript
 * isValidFileSize(5242880);
 * // true (5MB)
 * ```
 */
export function isValidFileSize(sizeInBytes: number): boolean {
  return sizeInBytes > 0 && sizeInBytes <= FILE.MAX_SIZE_BYTES;
}

/**
 * ============================================
 * ARRAY UTILITIES
 * ============================================
 */

/**
 * Group array items by key
 *
 * @param array - Array to group
 * @param keyFn - Function to get group key
 * @returns Map of grouped items
 *
 * @example
 * ```typescript
 * groupBy([{type: 'A', val: 1}, {type: 'B', val: 2}], (item) => item.type);
 * // Map { 'A' => [{type: 'A', val: 1}], 'B' => [{type: 'B', val: 2}] }
 * ```
 */
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K,
): Map<K, T[]> {
  const map = new Map<K, T[]>();

  for (const item of array) {
    const key = keyFn(item);
    const group = map.get(key) || [];
    group.push(item);
    map.set(key, group);
  }

  return map;
}

/**
 * Sort array by multiple keys
 *
 * @param array - Array to sort
 * @param comparators - Comparator functions in priority order
 * @returns Sorted array (new array)
 *
 * @example
 * ```typescript
 * sortByMultiple(
 *   [{a: 1, b: 2}, {a: 1, b: 1}],
 *   (x, y) => x.a - y.a,
 *   (x, y) => x.b - y.b
 * );
 * ```
 */
export function sortByMultiple<T>(
  array: T[],
  ...comparators: Array<(a: T, b: T) => number>
): T[] {
  return [...array].sort((a, b) => {
    for (const comparator of comparators) {
      const result = comparator(a, b);
      if (result !== 0) return result;
    }
    return 0;
  });
}

/**
 * Remove duplicate items from array
 *
 * @param array - Array with potential duplicates
 * @param keyFn - Function to get unique key (default: identity)
 * @returns Array with duplicates removed
 *
 * @example
 * ```typescript
 * uniqueBy([{id: 1}, {id: 2}, {id: 1}], (item) => item.id);
 * // [{id: 1}, {id: 2}]
 * ```
 */
export function uniqueBy<T, K>(
  array: T[],
  keyFn: (item: T) => K = (item) => item as unknown as K,
): T[] {
  const seen = new Set<K>();
  const result: T[] = [];

  for (const item of array) {
    const key = keyFn(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  return result;
}

/**
 * Chunk array into smaller arrays
 *
 * @param array - Array to chunk
 * @param size - Chunk size
 * @returns Array of chunks
 *
 * @example
 * ```typescript
 * chunk([1, 2, 3, 4, 5], 2);
 * // [[1, 2], [3, 4], [5]]
 * ```
 */
export function chunk<T>(array: T[], size: number): T[][] {
  if (size <= 0) return [];

  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
}

/**
 * Find item in array and return with index
 *
 * @param array - Array to search
 * @param predicate - Search predicate
 * @returns Object with item and index, or null
 *
 * @example
 * ```typescript
 * findWithIndex([1, 2, 3], (x) => x > 2);
 * // { item: 3, index: 2 }
 * ```
 */
export function findWithIndex<T>(
  array: T[],
  predicate: (item: T, index: number) => boolean,
): {item: T; index: number} | null {
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i], i)) {
      return {item: array[i], index: i};
    }
  }

  return null;
}

/**
 * ============================================
 * OBJECT UTILITIES
 * ============================================
 */

/**
 * Deep clone an object
 *
 * @param obj - Object to clone
 * @returns Cloned object
 *
 * @example
 * ```typescript
 * deepClone({a: 1, b: {c: 2}});
 * // {a: 1, b: {c: 2}} (new object)
 * ```
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;

  if (obj instanceof Date) return new Date(obj.getTime()) as T;

  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as T;

  if (obj instanceof Object) {
    const clonedObj: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone((obj as Record<string, unknown>)[key]);
      }
    }
    return clonedObj as T;
  }

  return obj;
}

/**
 * Pick specific keys from object
 *
 * @param obj - Source object
 * @param keys - Keys to pick
 * @returns Object with only picked keys
 *
 * @example
 * ```typescript
 * pick({a: 1, b: 2, c: 3}, ['a', 'c']);
 * // {a: 1, c: 3}
 * ```
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;

  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }

  return result;
}

/**
 * Omit specific keys from object
 *
 * @param obj - Source object
 * @param keys - Keys to omit
 * @returns Object without omitted keys
 *
 * @example
 * ```typescript
 * omit({a: 1, b: 2, c: 3}, ['b']);
 * // {a: 1, c: 3}
 * ```
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = {...obj} as Omit<T, K>;

  for (const key of keys) {
    delete (result as T)[key];
  }

  return result;
}

/**
 * Check if object is empty
 *
 * @param obj - Object to check
 * @returns True if object has no own properties
 *
 * @example
 * ```typescript
 * isEmptyObject({});
 * // true
 * ```
 */
export function isEmptyObject(obj: object | null | undefined): boolean {
  if (!obj) return true;
  return Object.keys(obj).length === 0;
}

/**
 * Merge objects deeply
 *
 * @param target - Target object
 * @param sources - Source objects
 * @returns Merged object
 *
 * @example
 * ```typescript
 * deepMerge({a: 1}, {b: 2}, {c: 3});
 * // {a: 1, b: 2, c: 3}
 * ```
 */
export function deepMerge<T extends object>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target;

  const result = {...target};

  for (const source of sources) {
    for (const key in source) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(
          targetValue as object,
          sourceValue as object,
        ) as T[Extract<keyof T, string>];
      } else {
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

/**
 * ============================================
 * COLOR UTILITIES
 * ============================================
 */

/**
 * Get status color for project
 *
 * @param status - Project status
 * @param hasPendingTasks - Whether project has pending tasks
 * @returns Color string ('red', 'green', 'yellow', 'gray')
 *
 * @example
 * ```typescript
 * getProjectStatusColor('ACTIVE', true);
 * // 'red'
 * ```
 */
export function getProjectStatusColor(
  status: string,
  hasPendingTasks: boolean,
): 'red' | 'green' | 'yellow' | 'gray' {
  const colors = PROJECT_STATUS_COLORS as Record<string, unknown>;
  const statusColor = colors[status];

  if (!statusColor) return 'gray';

  if (typeof statusColor === 'string') {
    return statusColor as 'red' | 'green' | 'yellow' | 'gray';
  }

  const statusObj = statusColor as {
    hasPendingTasks: string;
    noPendingTasks: string;
  };
  return (hasPendingTasks
    ? statusObj.hasPendingTasks
    : statusObj.noPendingTasks) as 'red' | 'green' | 'yellow' | 'gray';
}

/**
 * Get color for task priority
 *
 * @param priority - Task priority
 * @returns Hex color code
 *
 * @example
 * ```typescript
 * getTaskPriorityColor('URGENT');
 * // '#DC2626'
 * ```
 */
export function getTaskPriorityColor(priority: string): string {
  const colors = TASK_PRIORITY_COLORS as Record<string, string>;
  return colors[priority] || colors.MEDIUM;
}

/**
 * Get color for task status
 *
 * @param status - Task status
 * @returns Hex color code
 *
 * @example
 * ```typescript
 * getTaskStatusColor('IN_PROGRESS');
 * // '#2563EB'
 * ```
 */
export function getTaskStatusColor(status: string): string {
  const colors = TASK_STATUS_COLORS as Record<string, string>;
  return colors[status] || colors.PENDING;
}

/**
 * ============================================
 * TYPE GUARDS
 * ============================================
 */

/**
 * Check if value is defined (not null or undefined)
 *
 * @param value - Value to check
 * @returns True if defined
 *
 * @example
 * ```typescript
 * isDefined(null);
 * // false
 * ```
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Check if value is a valid Date
 *
 * @param value - Value to check
 * @returns True if valid Date
 *
 * @example
 * ```typescript
 * isValidDate(new Date());
 * // true
 * ```
 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Check if value is an array
 *
 * @param value - Value to check
 * @returns True if array
 *
 * @example
 * ```typescript
 * isArray([1, 2, 3]);
 * // true
 * ```
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Check if value is an object (not null, not array)
 *
 * @param value - Value to check
 * @returns True if object
 *
 * @example
 * ```typescript
 * isObject({a: 1});
 * // true
 * ```
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * ============================================
 * ASYNC UTILITIES
 * ============================================
 */

/**
 * Delay execution
 *
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after delay
 *
 * @example
 * ```typescript
 * await delay(1000); // Wait 1 second
 * ```
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce function calls
 *
 * @param fn - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 *
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query) => search(query), 300);
 * ```
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function debouncedFn(...args: Parameters<T>): void {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, wait);
  };
}

/**
 * Throttle function calls
 *
 * @param fn - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 *
 * @example
 * ```typescript
 * const throttledScroll = throttle(() => handleScroll(), 100);
 * ```
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function throttledFn(...args: Parameters<T>): void {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Retry async operation with exponential backoff
 *
 * @param operation - Async operation to retry
 * @param maxAttempts - Maximum retry attempts (default: 3)
 * @param baseDelayMs - Base delay in milliseconds (default: 1000)
 * @returns Promise with operation result
 *
 * @example
 * ```typescript
 * const result = await retryWithBackoff(() => fetchData(), 3, 1000);
 * ```
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 1000,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxAttempts - 1) {
        const delayMs = baseDelayMs * Math.pow(2, attempt);
        await delay(delayMs);
      }
    }
  }

  throw lastError || new Error('Operation failed after retries');
}

/**
 * Generates a UUID v4 string.
 * @returns A new UUID string.
 */
export function generateUuid(): string {
  // Use native crypto.randomUUID if available (modern browsers and Node.js 14.17+)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback implementation for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
