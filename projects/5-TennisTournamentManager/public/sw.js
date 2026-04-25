/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2026-04-25
 * @file public/sw.js
 * @desc Service worker for Tennis Tournament Manager PWA (NFR8).
 *       Implements a cache-first strategy for static assets (HTML, CSS, fonts)
 *       and a network-first strategy for API calls and HTML entry points.
 *       JavaScript bundle files (.js) are intentionally NOT cached by the SW
 *       to prevent cross-deployment hash mismatches (Vite generates new
 *       content-hash filenames on each build; caching old JS causes lazy-loaded
 *       chunks to 404 after a redeployment). The browser's HTTP cache handles
 *       short-lived JS caching instead.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

const CACHE_VERSION = 'ttm-v3-20260425';

/** Static assets cache — stores app shell (HTML, CSS, fonts). */
const STATIC_CACHE = `${CACHE_VERSION}-static`;

/** API responses cache — stores recently fetched API data for offline fallback. */
const API_CACHE = `${CACHE_VERSION}-api`;

/** All known cache names for cleanup during activation. */
const ALL_CACHES = [STATIC_CACHE, API_CACHE];

/** App shell URLs to pre-cache on install. */
const APP_SHELL_URLS = [
  self.registration.scope,
  new URL('manifest.webmanifest', self.registration.scope).toString(),
];

// ─── Install ────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate ───────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !ALL_CACHES.includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─── Fetch ──────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and cross-origin requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Skip Vite HMR WebSocket connections (development)
  if (url.pathname.includes('/@vite') || url.pathname.includes('/@fs') || url.searchParams.has('token')) {
    return;
  }

  const isLocalDevelopment = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

  // Skip JavaScript files on local development hosts to allow HMR.
  if (isLocalDevelopment && (url.pathname.endsWith('.js') || url.pathname.endsWith('.ts'))) {
    return;
  }

  // Skip JavaScript bundle files in production as well.
  // Vite generates content-hashed filenames (e.g. main-ABC123.js) that change
  // on every build. Caching them in the SW means an old main.js served from
  // cache will reference lazy-chunk filenames that no longer exist on the server
  // after a redeployment, causing ERR_ABORTED 404 errors. The browser's built-in
  // HTTP cache provides sufficient short-term caching for JS assets.
  if (url.pathname.endsWith('.js')) {
    return;
  }

  // API routes: network-first, fall back to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(request, API_CACHE));
    return;
  }

  // HTML entry points (index.html): network-first so users always get the
  // latest script tag references after a redeployment.
  if (
    url.pathname === '/' ||
    url.pathname.endsWith('/index.html') ||
    url.pathname.endsWith('/')
  ) {
    event.respondWith(networkFirstWithCache(request, STATIC_CACHE));
    return;
  }

  // Other static assets (CSS, fonts, images, manifests): cache-first
  event.respondWith(cacheFirstWithNetwork(request, STATIC_CACHE));
});

// ─── Strategies ─────────────────────────────────────────────────────────────

/**
 * Cache-first strategy: serve from cache if available, otherwise fetch from
 * network and store in cache for future use.
 *
 * @param {Request} request - The incoming request
 * @param {string} cacheName - Name of the cache to use
 * @returns {Promise<Response>}
 */
async function cacheFirstWithNetwork(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline and no cache — return a minimal offline page
    return new Response('<h1>You are offline</h1><p>Please reconnect to access Tennis Tournament Manager.</p>', {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

/**
 * Network-first strategy: try the network, store in cache on success; fall
 * back to cache on network failure.
 *
 * @param {Request} request - The incoming request
 * @param {string} cacheName - Name of the cache to use
 * @returns {Promise<Response>}
 */
async function networkFirstWithCache(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'Offline — cached data unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
