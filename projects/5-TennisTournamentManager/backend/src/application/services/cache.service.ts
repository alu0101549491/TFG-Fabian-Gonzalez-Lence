/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 1, 2026
 * @file backend/src/application/services/cache.service.ts
 * @desc In-memory cache service for expensive operations (NFR21).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {config} from '../../shared/config';

/**
 * Cache entry with value and expiration timestamp.
 */
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Simple in-memory cache service for performance optimization.
 * 
 * **Features**:
 * - TTL-based expiration (default: 5 minutes)
 * - Manual invalidation by key or pattern
 * - Automatic cleanup of expired entries
 * - Configurable enable/disable via environment
 * 
 * **Use Cases**:
 * - Tournament lists (frequently read, rarely changed)
 * - Leaderboard/standings (expensive calculations)
 * - User statistics (aggregated data)
 * - Notification counts
 * 
 * **Limitations**:
 * - In-memory only (lost on restart)
 * - Not suitable for horizontal scaling (use Redis for production)
 * - No persistence or replication
 * 
 * @example
 * ```typescript
 * const cache = CacheService.getInstance();
 * 
 * // Get tournaments list with caching
 * const tournaments = cache.getOrSet('tournaments:active', async () => {

 * }, 600); // Cache for 10 minutes
 * 
 * // Invalidate on update
 * cache.delete('tournaments:active');
 * ```
 */
export class CacheService {
  private static instance: CacheService;
  private readonly cache: Map<string, CacheEntry<any>>;
  private cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Private constructor for singleton pattern.
   */
  private constructor() {
    this.cache = new Map();
    this.startCleanupInterval();
  }

  /**
   * Gets singleton instance of CacheService.
   */
  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Gets a cached value by key.
   * 
   * @param key - Cache key
   * @returns Cached value or null if not found/expired
   */
  public get<T>(key: string): T | null {
    if (!config.cache.enabled) {
      return null;
    }

    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Sets a value in cache with TTL.
   * 
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttlSeconds - TTL in seconds (default: from config)
   */
  public set<T>(key: string, value: T, ttlSeconds?: number): void {
    if (!config.cache.enabled) {
      return;
    }

    const ttl = ttlSeconds ?? config.cache.ttlSeconds;
    const expiresAt = Date.now() + ttl * 1000;

    this.cache.set(key, {
      value,
      expiresAt,
    });
  }

  /**
   * Gets value from cache or computes it using provided function.
   * 
   * @param key - Cache key
   * @param computeFn - Function to compute value if not cached
   * @param ttlSeconds - TTL in seconds (default: from config)
   * @returns Cached or computed value
   */
  public async getOrSet<T>(
    key: string,
    computeFn: () => Promise<T>,
    ttlSeconds?: number,
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const value = await computeFn();
    this.set(key, value, ttlSeconds);
    
    return value;
  }

  /**
   * Deletes a single cache entry.
   * 
   * @param key - Cache key to delete
   */
  public delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Deletes all cache entries matching a pattern.
   * 
   * @param pattern - Regex pattern or string prefix
   * @example
   * ```typescript
   * cache.deletePattern('tournaments:'); // Delete all tournament caches
   * cache.deletePattern(/^user:.*-stats$/); // Delete all user stats
   * ```
   */
  public deletePattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' 
      ? new RegExp(`^${pattern}`) 
      : pattern;

    for (const key of Array.from(this.cache.keys())) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clears entire cache.
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Gets cache statistics.
   * 
   * @returns Current cache stats (size, expired count)
   */
  public getStats(): {size: number; expiredCount: number} {
    const now = Date.now();
    let expiredCount = 0;

    for (const entry of Array.from(this.cache.values())) {
      if (now > entry.expiresAt) {
        expiredCount++;
      }
    }

    return {
      size: this.cache.size,
      expiredCount,
    };
  }

  /**
   * Starts automatic cleanup interval for expired entries.
   * Runs every 60 seconds.
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 60000); // Every minute
  }

  /**
   * Removes all expired entries from cache.
   */
  private cleanupExpired(): void {
    const now = Date.now();
    
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Stops cleanup interval (for testing/shutdown).
   */
  public stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}
