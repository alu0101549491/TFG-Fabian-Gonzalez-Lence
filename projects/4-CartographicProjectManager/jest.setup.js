// Setup file for Jest with Vue Testing Library
require('@testing-library/jest-dom');

// Polyfill for structuredClone if not available (Node < 17)
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Mock IntersectionObserver
class IntersectionObserverMock {
  constructor() {
    this.observe = jest.fn();
    this.unobserve = jest.fn();
    this.disconnect = jest.fn();
  }
}
global.IntersectionObserver = IntersectionObserverMock;

// Mock ResizeObserver
class ResizeObserverMock {
  constructor() {
    this.observe = jest.fn();
    this.unobserve = jest.fn();
    this.disconnect = jest.fn();
  }
}
global.ResizeObserver = ResizeObserverMock;

// Mock WebSocket for Socket.io testing
class WebSocketMock {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocketMock.CONNECTING;
    this.send = jest.fn();
    this.close = jest.fn();
  }
}
WebSocketMock.CONNECTING = 0;
WebSocketMock.OPEN = 1;
WebSocketMock.CLOSING = 2;
WebSocketMock.CLOSED = 3;
global.WebSocket = WebSocketMock;
