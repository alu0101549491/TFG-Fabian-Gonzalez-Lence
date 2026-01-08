/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 8, 2026
 * @file src/main.tsx
 * @desc Application entry point for the Music Web Player. This file is the main entry point for the React application.
 *       It imports the root App component, finds the root DOM element where React will mount, validates that the root
 *       element exists, creates a React root using React 18's createRoot API, and renders the App component wrapped
 *       in React.StrictMode (enabled in development to identify unsafe lifecycle methods, warn about legacy APIs,
 *       detect unexpected side effects, and only runs in development mode).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/2-MusicWebPlayer}
 * @see {@link https://typescripttutorial.net}
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
