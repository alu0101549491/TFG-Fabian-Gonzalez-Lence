import React from 'react';
import {Player} from '@components/Player';
import './styles/main.css';

/**
 * Root application component.
 * @returns React component
 * @category Components
 */
const App: React.FC = () => {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Music Web Player</h1>
      </header>
      <main className="app-main">
        <Player />
      </main>
    </div>
  );
};

export default App;