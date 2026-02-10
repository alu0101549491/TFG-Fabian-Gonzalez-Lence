/**
 * @module application/services/common/utils
 * @description Utility functions for services.
 * @category Application
 */

/**
 * Generates a unique identifier.
 * @returns A unique ID string
 */
export function generateId(): string {
  // Generate random ID using crypto API (browser/Node.js compatible)
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}

/**
 * Formats bytes into human-readable string.
 * @param bytes - Number of bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Gets file extension from filename.
 * @param filename - The filename
 * @returns File extension including dot (e.g., ".pdf")
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot >= 0 ? filename.substring(lastDot).toLowerCase() : '';
}

/**
 * Truncates a string to specified length.
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @returns Truncated string with ellipsis if needed
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}
