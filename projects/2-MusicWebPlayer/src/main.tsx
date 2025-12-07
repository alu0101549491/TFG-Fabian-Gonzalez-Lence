/**
 * @module main
 * @description
 * Application entry point for the Music Web Player.
 *
 * This file is the main entry point for the React application. It:
 * 1. Imports the root App component
 * 2. Finds the root DOM element where React will mount
 * 3. Validates that the root element exists
 * 4. Creates a React root using React 18's createRoot API
 * 5. Renders the App component wrapped in React.StrictMode
 *
 * React.StrictMode is enabled in development to:
 * - Identify unsafe lifecycle methods
 * - Warn about legacy APIs
 * - Detect unexpected side effects
 * - Only runs in development mode
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.css';

/**
 * Get the root DOM element where React will mount.
 * Throws an error if the element doesn't exist.
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Failed to find the root element. ' +
    'Make sure there is a <div id="root"></div> in your index.html'
  );
}

/**
 * Create React root and render the application.
 *
 * React.StrictMode:
 * - Identifies unsafe lifecycles
 * - Warns about legacy APIs
 * - Detects unexpected side effects
 * - Only runs in development mode
 */
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
