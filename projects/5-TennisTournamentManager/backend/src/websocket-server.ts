/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file backend/src/websocket-server.ts
 * @desc WebSocket server setup using Socket.io for real-time updates.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Server as HTTPServer} from 'http';
import {Server as SocketIOServer, Socket} from 'socket.io';
import {config} from './shared/config';

let io: SocketIOServer | null = null;

/**
 * Initializes Socket.io server for WebSocket connections.
 *
 * @param httpServer - HTTP server instance
 * @returns Socket.io server instance
 */
export function setupWebSocketServer(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.corsOrigin,
      credentials: true,
    },
  });
  
  io.on('connection', (socket: Socket) => {
    console.log(`WebSocket client connected: ${socket.id}`);
    
    // Join tournament room
    socket.on('join:tournament', (tournamentId: string) => {
      socket.join(`tournament:${tournamentId}`);
      console.log(`Client ${socket.id} joined tournament ${tournamentId}`);
    });
    
    // Leave tournament room
    socket.on('leave:tournament', (tournamentId: string) => {
      socket.leave(`tournament:${tournamentId}`);
      console.log(`Client ${socket.id} left tournament ${tournamentId}`);
    });
    
    // Join user room for notifications
    socket.on('join:user', (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`Client ${socket.id} joined user room ${userId}`);
    });
    
    socket.on('disconnect', () => {
      console.log(`WebSocket client disconnected: ${socket.id}`);
    });
  });
  
  console.log('✓ WebSocket server initialized');
  
  return io;
}

/**
 * Emits a match update event to a tournament room.
 *
 * @param tournamentId - Tournament ID
 * @param matchData - Match data to emit
 */
export function emitMatchUpdate(tournamentId: string, matchData: unknown): void {
  if (io) {
    io.to(`tournament:${tournamentId}`).emit('match:updated', matchData);
  }
}

/**
 * Emits an order of play change event to a tournament room.
 *
 * @param tournamentId - Tournament ID
 * @param orderOfPlayData - Order of play data
 */
export function emitOrderOfPlayChange(tournamentId: string, orderOfPlayData: unknown): void {
  if (io) {
    io.to(`tournament:${tournamentId}`).emit('order-of-play:changed', orderOfPlayData);
  }
}

/**
 * Emits a notification to a specific user.
 *
 * @param userId - User ID
 * @param notification - Notification data
 */
export function emitNotification(userId: string, notification: unknown): void {
  if (io) {
    io.to(`user:${userId}`).emit('notification:new', notification);
  }
}

/**
 * Gets the Socket.io server instance.
 *
 * @returns Socket.io server instance or null
 */
export function getSocketIO(): SocketIOServer | null {
  return io;
}
