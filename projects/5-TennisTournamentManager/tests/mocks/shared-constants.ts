/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 14, 2026
 * @file tests/mocks/shared-constants.ts
 * @desc Jest-safe shared constants mock for unit tests that import the HTTP client stack.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

export const API_BASE_URL = '/api';
export const WS_URL = 'http://localhost:3000';
export const JWT_STORAGE_KEY = 'tennis_jwt_token';
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
export const MAX_CONCURRENT_USERS = 100;
export const MAX_ACTIVE_TOURNAMENTS = 20;
export const REALTIME_SYNC_THRESHOLD_MS = 5000;

export enum ServerEvent {
  MATCH_CREATED = 'match:created',
  MATCH_UPDATED = 'match:updated',
  MATCH_SCORE_UPDATED = 'match:score-updated',
  MATCH_STATE_CHANGED = 'match:state-changed',
  MATCH_SCHEDULED = 'match:scheduled',
  TOURNAMENT_CREATED = 'tournament:created',
  TOURNAMENT_UPDATED = 'tournament:updated',
  TOURNAMENT_STATUS_CHANGED = 'tournament:status-changed',
  BRACKET_GENERATED = 'bracket:generated',
  BRACKET_UPDATED = 'bracket:updated',
  STANDINGS_UPDATED = 'standings:updated',
  RANKINGS_UPDATED = 'rankings:updated',
  ORDER_OF_PLAY_PUBLISHED = 'order-of-play:published',
  ORDER_OF_PLAY_UPDATED = 'order-of-play:updated',
  REGISTRATION_CREATED = 'registration:created',
  REGISTRATION_UPDATED = 'registration:updated',
  REGISTRATION_STATUS_CHANGED = 'registration:status-changed',
  ANNOUNCEMENT_CREATED = 'announcement:created',
  ANNOUNCEMENT_PUBLISHED = 'announcement:published',
  ANNOUNCEMENT_UPDATED = 'announcement:updated',
  NOTIFICATION_NEW = 'notification:new',
  NOTIFICATION_COUNT = 'notification:count',
  NOTIFICATION_READ = 'notification:read',
  NOTIFICATION_DELETED = 'notification:deleted',
  NOTIFICATIONS_REFRESH = 'notifications:refresh',
  CONNECTED = 'connected',
  ERROR = 'error',
}

export enum ClientEvent {
  JOIN_TOURNAMENT = 'join:tournament',
  LEAVE_TOURNAMENT = 'leave:tournament',
  JOIN_USER = 'join:user',
  LEAVE_USER = 'leave:user',
  PING = 'ping',
}