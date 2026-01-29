/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/main.tsx
 * @desc React application entry point - initializes and mounts the app to DOM.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './views/App';
import { applyThemeColors } from './utils/apply-theme';

/**
 * Initialize the application
 */
const initializeApp = () => {
  // Apply theme colors from constants.ts to CSS variables
  applyThemeColors();

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
