import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './views/App';
import '../public/assets/styles/global.css';
import '../public/assets/styles/animations.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);