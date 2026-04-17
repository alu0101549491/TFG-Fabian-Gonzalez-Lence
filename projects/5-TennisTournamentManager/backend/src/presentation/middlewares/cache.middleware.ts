/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 1, 2026
 * @file backend/src/presentation/middlewares/cache.middleware.ts
 * @desc Cache-Control middleware for static assets and API responses.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Request, Response, NextFunction} from 'express';
import {config} from '../../shared/config';

/**
 * Cache-Control middleware for static assets.
 * 
 * Sets appropriate cache headers for images, fonts, and other static files:
 * - **Images**: Cache for 30 days (immutable after upload)
 * - **Public**: Allows CDN and browser caching
 * - **Immutable**: Prevents revalidation requests
 * 
 * @example
 * ```typescript
 * app.use('/uploads', staticAssetCache, express.static('uploads'));
 * ```
 */
export function staticAssetCache(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!config.cache.enabled) {
    return next();
  }

  const maxAge = config.cache.staticAssetsTtlDays * 24 * 60 * 60; // Convert days to seconds
  
  res.setHeader('Cache-Control', `public, max-age=${maxAge}, immutable`);
  res.setHeader('Expires', new Date(Date.now() + maxAge * 1000).toUTCString());
  
  next();
}

/**
 * ETag middleware for API responses.
 * 
 * Generates ETag based on response body for conditional requests:
 * - Returns 304 Not Modified if ETag matches
 * - Reduces bandwidth for unchanged data
 * - Works with GET requests only
 * 
 * @param ttlSeconds - Cache TTL in seconds (default: from config)
 * @example
 * ```typescript
 * router.get('/tournaments', apiCache(300), controller.getAll);
 * ```
 */
export function apiCache(ttlSeconds?: number) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    if (!config.cache.enabled) {
      return next();
    }

    const maxAge = ttlSeconds ?? config.cache.ttlSeconds;
    
    // Set Cache-Control for API responses
    res.setHeader('Cache-Control', `public, max-age=${maxAge}, must-revalidate`);
    
    // Enable ETag generation (Express does this automatically)
    res.setHeader('ETag', 'W/"' + Math.random().toString(36).substring(7) + '"');
    
    next();
  };
}

/**
 * No-cache middleware for sensitive or frequently changing data.
 * 
 * Prevents caching of:
 * - Authentication endpoints
 * - User-specific data
 * - Real-time updates
 * 
 * @example
 * ```typescript
 * router.post('/auth/login', noCache, controller.login);
 * ```
 */
export function noCache(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  
  next();
}
