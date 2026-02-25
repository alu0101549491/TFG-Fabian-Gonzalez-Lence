/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file src/infrastructure/websocket/socket.server.ts
 * @desc WebSocket server configuration using Socket.io for real-time features
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Server} from 'socket.io';
import type {Server as HttpServer} from 'http';
import {WEBSOCKET} from '@shared/constants.js';
import {logInfo, logError} from '@shared/logger.js';
import {verifyAccessToken} from '../auth/jwt.service.js';

/**
 * Socket.io server instance
 */
export let io: Server;

/**
 * Initialize WebSocket server
 *
 * @param httpServer - HTTP server instance
 */
export function initializeSocketServer(httpServer: HttpServer): void {
  io = new Server(httpServer, {
    cors: {
      origin: WEBSOCKET.CORS_ORIGIN,
      credentials: true,
    },
    pingInterval: WEBSOCKET.PING_INTERVAL,
    pingTimeout: WEBSOCKET.PING_TIMEOUT,
  });

  // Authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const payload = verifyAccessToken(token);
      socket.data.userId = payload.userId;
      socket.data.userRole = payload.role;
      next();
    } catch (error) {
      next(new Error('Invalid authentication token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    logInfo(`WebSocket client connected: ${userId}`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Join project room (frontend emits 'join:project')
    socket.on('join:project', (data: {projectId: string}) => {
      const projectId = data.projectId;
      const roomName = `project:${projectId}`;
      socket.join(roomName);
      console.log(`✅ [WebSocket] User ${userId} joined room '${roomName}'`);
      logInfo(`User ${userId} joined project room ${projectId}`);
    });

    // Leave project room (frontend emits 'leave:project')
    socket.on('leave:project', (data: {projectId: string}) => {
      const projectId = data.projectId;
      const roomName = `project:${projectId}`;
      socket.leave(roomName);
      console.log(`👋 [WebSocket] User ${userId} left room '${roomName}'`);
      logInfo(`User ${userId} left project room ${projectId}`);
    });

    // Legacy: Subscribe to project updates (keep for compatibility)
    socket.on('project:subscribe', (projectId: string) => {
      socket.join(`project:${projectId}`);
      logInfo(`User ${userId} subscribed to project ${projectId}`);
    });

    // Legacy: Unsubscribe from project updates (keep for compatibility)
    socket.on('project:unsubscribe', (projectId: string) => {
      socket.leave(`project:${projectId}`);
      logInfo(`User ${userId} unsubscribed from project ${projectId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logInfo(`WebSocket client disconnected: ${userId}`);
    });

    // Error handler
    socket.on('error', (error) => {
      logError('WebSocket error:', error as Error);
    });
  });

  logInfo('✓ WebSocket server initialized');
}

/**
 * Emit event to specific user
 *
 * @param userId - User ID
 * @param event - Event name
 * @param data - Event data
 */
export function emitToUser(
  userId: string,
  event: string,
  data: unknown
): void {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}

/**
 * Emit event to all users in a project
 *
 * @param projectId - Project ID
 * @param event - Event name
 * @param data - Event data
 */
export function emitToProject(
  projectId: string,
  event: string,
  data: unknown
): void {
  if (!io) {
    console.log('❌ [WebSocket] Cannot emit - io not initialized');
    return;
  }
  const room = `project:${projectId}`;
  console.log(`🔊 [WebSocket] Emitting '${event}' to room '${room}'`);
  io.to(room).emit(event, data);
  console.log(`✅ [WebSocket] Event emitted to room '${room}'`);
}

/**
 * Emit event to all connected clients
 *
 * @param event - Event name
 * @param data - Event data
 */
export function emitToAll(event: string, data: unknown): void {
  if (!io) return;
  io.emit(event, data);
}
