/**
 * Mock for src/utils/env.ts to avoid import.meta issues in Jest
 */
export function getBaseUrl(): string {
  return '/';
}
