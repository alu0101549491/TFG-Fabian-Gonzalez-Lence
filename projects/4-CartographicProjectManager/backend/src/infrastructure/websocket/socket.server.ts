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
import {PermissionRepository} from '../repositories/permission.repository.js';
import {ProjectRepository} from '../repositories/project.repository.js';

const permissionRepository = new PermissionRepository();
const projectRepository = new ProjectRepository();

async function canJoinProjectRoom(
  userId: string,
  userRole: unknown,
  projectId: string
): Promise<boolean> {
  if (!projectId) return false;

  // Allow privileged roles to join any project room
  if (userRole === 'ADMINISTRATOR' || userRole === 'ADMIN') {
    return true;
  }

  // Check if user is the client of the project
  const project = await projectRepository.findById(projectId);
  if (project && project.clientId === userId) {
    return true;
  }

  // Check if user has explicit permissions
  const permission = await permissionRepository.findByUserAndProject(
    userId,
    projectId
  );
  return permission !== null;
}

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
    const userRole = socket.data.userRole;
    logInfo(`WebSocket client connected: ${userId}`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Join project room (frontend emits 'join:project')
    socket.on(
      'join:project',
      async (
        data: {projectId: string},
        ack?: (result: {ok: boolean; reason?: string}) => void
      ) => {
        try {
          const projectId = data.projectId;

          const authorized = await canJoinProjectRoom(
            userId,
            userRole,
            projectId
          );
          if (!authorized) {
            logInfo(
              `WebSocket join denied: user=${userId} project=${projectId}`
            );
            ack?.({ok: false, reason: 'unauthorized'});
            return;
          }

          const roomName = `project:${projectId}`;
          socket.join(roomName);
          logInfo(`User ${userId} joined project room ${projectId}`);
          ack?.({ok: true});
        } catch (error) {
          logError('WebSocket join:project error:', error as Error);
          ack?.({ok: false, reason: 'error'});
        }
      }
    );

    // Leave project room (frontend emits 'leave:project')
    socket.on('leave:project', (data: {projectId: string}) => {
      const projectId = data.projectId;
      const roomName = `project:${projectId}`;
      socket.leave(roomName);
      logInfo(`User ${userId} left project room ${projectId}`);
    });

    // Legacy: Subscribe to project updates (keep for compatibility)
    socket.on(
      'project:subscribe',
      async (
        projectId: string,
        ack?: (result: {ok: boolean; reason?: string}) => void
      ) => {
        try {
          const authorized = await canJoinProjectRoom(
            userId,
            userRole,
            projectId
          );
          if (!authorized) {
            logInfo(
              `WebSocket subscribe denied: user=${userId} project=${projectId}`
            );
            ack?.({ok: false, reason: 'unauthorized'});
            return;
          }

          socket.join(`project:${projectId}`);
          logInfo(`User ${userId} subscribed to project ${projectId}`);
          ack?.({ok: true});
        } catch (error) {
          logError('WebSocket project:subscribe error:', error as Error);
          ack?.({ok: false, reason: 'error'});
        }
      }
    );

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
    logError('WebSocket emit failed: io not initialized');
    return;
  }
  const room = `project:${projectId}`;
  io.to(room).emit(event, data);
  logInfo(`Emitted '${event}' to room '${room}'`);
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
