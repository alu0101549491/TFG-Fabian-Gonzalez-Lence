/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/shared/constants.ts
 * @desc Application-wide constants used across all layers.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/** Base URL for the REST API. Uses Vite proxy in dev, full URL in production. */
export const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-production-domain.com/api'  // Update for production
  : '/api';  // Uses Vite proxy to localhost:3000 in development

/** WebSocket connection URL. */
export const WS_URL = import.meta.env.PROD
  ? 'https://your-production-domain.com'  // Update for production
  : 'http://localhost:3000';  // Development WebSocket server

/** JWT token key in local storage. */
export const JWT_STORAGE_KEY = 'tennis_jwt_token';

/** Session timeout in milliseconds (30 minutes per NFR12). */
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

/** Maximum concurrent users supported (per NFR9). */
export const MAX_CONCURRENT_USERS = 100;

/** Maximum simultaneous active tournaments (per NFR9). */
export const MAX_ACTIVE_TOURNAMENTS = 20;

/** Real-time sync threshold in milliseconds (per NFR5). */
export const REALTIME_SYNC_THRESHOLD_MS = 5000;

/**
 * Server-to-client WebSocket events.
 * Events emitted by backend and received by frontend clients.
 */
export enum ServerEvent {
  // Match Events
  MATCH_CREATED = 'match:created',
  MATCH_UPDATED = 'match:updated',
  MATCH_SCORE_UPDATED = 'match:score-updated',
  MATCH_STATE_CHANGED = 'match:state-changed',
  MATCH_SCHEDULED = 'match:scheduled',
  
  // Tournament Events
  TOURNAMENT_CREATED = 'tournament:created',
  TOURNAMENT_UPDATED = 'tournament:updated',
  TOURNAMENT_STATUS_CHANGED = 'tournament:status-changed',
  
  // Bracket Events
  BRACKET_GENERATED = 'bracket:generated',
  BRACKET_UPDATED = 'bracket:updated',
  
  // Standing Events
  STANDINGS_UPDATED = 'standings:updated',
  RANKINGS_UPDATED = 'rankings:updated',
  
  // Order of Play Events
  ORDER_OF_PLAY_PUBLISHED = 'order-of-play:published',
  ORDER_OF_PLAY_UPDATED = 'order-of-play:updated',
  
  // Registration Events
  REGISTRATION_CREATED = 'registration:created',
  REGISTRATION_UPDATED = 'registration:updated',
  REGISTRATION_STATUS_CHANGED = 'registration:status-changed',
  
  // Announcement Events
  ANNOUNCEMENT_CREATED = 'announcement:created',
  ANNOUNCEMENT_PUBLISHED = 'announcement:published',
  ANNOUNCEMENT_UPDATED = 'announcement:updated',
  
  // Notification Events
  NOTIFICATION_NEW = 'notification:new',
  NOTIFICATION_COUNT = 'notification:count',
  
  // Connection Events
  CONNECTED = 'connected',
  ERROR = 'error',
}

/**
 * Client-to-server WebSocket events.
 * Events emitted by frontend clients and received by backend.
 */
export enum ClientEvent {
  // Room Management
  JOIN_TOURNAMENT = 'join:tournament',
  LEAVE_TOURNAMENT = 'leave:tournament',
  JOIN_USER = 'join:user',
  LEAVE_USER = 'leave:user',
  
  // Ping/Heartbeat
  PING = 'ping',
}
