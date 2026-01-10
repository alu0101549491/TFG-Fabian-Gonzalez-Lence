import React from 'react';
import {GameBoard} from './components/game-board/GameBoard';

/**
 * Root application component.
 * Manages top-level routing and game state.
 */
const App: React.FC = () => {
  // TODO: Implement app state and routing
  return (
    <div className="app">
      <GameBoard />
    </div>
  );
};

export default App;