/**
 * @module infrastructure
 * @description Barrel export for the entire Infrastructure layer.
 * The Infrastructure layer contains concrete implementations of
 * repository interfaces, external service adapters, WebSocket
 * handlers, and HTTP client configuration.
 * @category Infrastructure
 */

export * from './repositories';
export * from './websocket';
export * from './http';
export * from './persistence/token.storage';
