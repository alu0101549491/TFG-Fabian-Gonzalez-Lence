// ============================================
// FILE: src/main.tsx
// ============================================

/**
 * Mini Balatro - React Application Entry Point
 *
 * This file initializes the React application and mounts it to the DOM.
 * It also imports global styles and sets up the development environment.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './views/App';

/**
 * Initialize the application
 */
const initializeApp = () => {
  // Get root element
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('Root element not found. Make sure index.html has a div with id="root"');
  }

  // Create React root
  const root = ReactDOM.createRoot(rootElement);

  // Render application
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Development mode logging
  if (import.meta.env.DEV) {
    console.log('🎮 Mini Balatro - Development Mode');
    console.log('Version:', '1.0.0');
    console.log('Environment:', import.meta.env.MODE);
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
