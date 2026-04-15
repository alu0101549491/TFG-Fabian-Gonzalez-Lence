/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file backend/src/shared/constants/websocket-events.ts
 * @desc WebSocket event type definitions for real-time synchronization (NFR5)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * Server-to-client WebSocket events
 * Events emitted by backend and received by frontend clients
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
  NOTIFICATION_READ = 'notification:read',
  NOTIFICATION_DELETED = 'notification:deleted',
  NOTIFICATIONS_REFRESH = 'notifications:refresh',
  
  // Connection Events
  CONNECTED = 'connected',
  ERROR = 'error',
}

/**
 * Client-to-server WebSocket events
 * Events emitted by frontend clients and received by backend
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

/**
 * WebSocket room prefixes for namespacing
 */
export enum RoomPrefix {
  TOURNAMENT = 'tournament:',
  USER = 'user:',
  MATCH = 'match:',
  BRACKET = 'bracket:',
}
