/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 8, 2026
 * @file infrastructure/websocket/websocket.service.ts
 * @desc Angular service wrapper for WebSocket client with centralized connection management.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable, inject, OnDestroy} from '@angular/core';
import {SocketClient} from './socket-client';
import {AuthStateService} from '@presentation/services/auth-state.service';

/**
 * WebSocket service for real-time communication.
 * Provides a singleton SocketClient instance with automatic connection management.
 */
@Injectable({providedIn: 'root'})
export class WebSocketService implements OnDestroy {
  private readonly authStateService = inject(AuthStateService);
  private readonly client = new SocketClient();
  private connectionAttempted = false;

  /**
   * Connects to the WebSocket server with authentication.
   * Automatically uses the current user's JWT token.
   *
   * @returns True if connection successful or already connected
   */
  public connect(): boolean {
    if (this.client.isConnected()) {
      return true;
    }

    const token = this.authStateService.getToken();
    if (!token) {
      console.warn('[WebSocketService] No auth token available, skipping connection');
      return false;
    }

    try {
      this.client.connect(token);
      this.connectionAttempted = true;
      return true;
    } catch (error) {
      console.error('[WebSocketService] Connection failed:', error);
      return false;
    }
  }

  /**
   * Disconnects from the WebSocket server.
   */
  public disconnect(): void {
    this.client.disconnect();
    this.connectionAttempted = false;
  }

  /**
   * Subscribes to a specific event channel.
   *
   * @param event - The event name to listen for
   * @param callback - The callback to invoke when the event is received
   */
  public on<T>(event: string, callback: (data: T) => void): void {
    // Ensure connected before subscribing
    if (!this.client.isConnected() && !this.connectionAttempted) {
      this.connect();
    }
    this.client.on(event, callback);
  }

  /**
   * Emits an event to the server.
   *
   * @param event - The event name to emit
   * @param data - The data payload to send
   */
  public emit<T>(event: string, data: T): void {
    if (!this.client.isConnected()) {
      console.warn('[WebSocketService] Cannot emit - not connected');
      return;
    }
    this.client.emit(event, data);
  }

  /**
   * Checks whether the socket is currently connected.
   *
   * @returns True if the connection is active
   */
  public isConnected(): boolean {
    return this.client.isConnected();
  }

  /**
   * Cleanup on service destruction.
   */
  public ngOnDestroy(): void {
    this.disconnect();
  }
}
