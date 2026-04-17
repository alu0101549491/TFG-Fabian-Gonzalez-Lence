/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/infrastructure/websocket/socket-client.ts
 * @desc WebSocket client using Socket.io-client for real-time synchronization (<5s per NFR5).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {io, type Socket} from 'socket.io-client';
import {WS_URL} from '@shared/constants';

/**
 * Centralized WebSocket client for real-time event communication.
 *
 * Handles:
 * - Match score updates in real time
 * - Order of play changes
 * - Notification delivery
 * - Tournament status changes
 *
 * Supports automatic reconnection and JWT-authenticated connections.
 */
export class SocketClient {
  private socket: Socket | null = null;

  /**
   * Establishes the WebSocket connection with JWT authentication.
   *
   * @param token - The JWT token for authentication
   */
  public connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(WS_URL, {
      auth: {token},
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('[WebSocket] Connected to server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason);
    });
  }

  /**
   * Disconnects the WebSocket connection.
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Subscribes to a specific event channel.
   *
   * @param event - The event name to listen for
   * @param callback - The callback to invoke when the event is received
   */
  public on<T>(event: string, callback: (data: T) => void): void {
    if (!this.socket) {
      throw new Error('Socket not connected. Call connect() first.');
    }
    this.socket.on(event, callback);
  }

  /**
   * Emits an event to the server.
   *
   * @param event - The event name to emit
   * @param data - The data payload to send
   */
  public emit<T>(event: string, data: T): void {
    if (!this.socket) {
      throw new Error('Socket not connected. Call connect() first.');
    }
    this.socket.emit(event, data);
  }

  /**
   * Checks whether the socket is currently connected.
   *
   * @returns True if the connection is active
   */
  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}
