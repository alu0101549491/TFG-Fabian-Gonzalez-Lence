/**
 * @module App
 * @category Components
 * @description
 * Root application component that serves as the entry point for the Music Web Player.
 * This component provides the overall layout structure and renders the main Player component.
 */

import React from 'react';
import { Player } from './components/Player';
import './styles/main.css';

/**
 * Root application component.
 * @returns React component
 * @category Components
 */
const App: React.FC = () => {
  return (
    <div className="app">
      {/* Skip to content link for accessibility */}
      {/*
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
      */}

      {/* Application header */}
      <header className="app-header">
        <div className="app-header__content">
          {/*<span className="app-header__icon" aria-hidden="true">🎵</span>*/}
          <h1 className="app-header__title">Music Web Player</h1>
        </div>
      </header>

      {/* Main content area */}
      <main id="main-content" className="app-main">
        <Player />
      </main>

      {/* Optional footer - can be uncommented when needed */}
      {/* <footer className="app-footer">
        <p>
          Built with React + TypeScript | &copy; 2025 Music Web Player
        </p>
      </footer> */}
    </div>
  );
};

export default App;
