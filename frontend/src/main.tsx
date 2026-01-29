/**
 * Application Entry Point
 * 
 * This is where React mounts the app to the DOM.
 * 
 * WHY StrictMode:
 * - Helps find potential problems in the app
 * - Warns about deprecated APIs
 * - Only runs in development (no production impact)
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Get the root element from index.html
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Check index.html has <div id="root">');
}

// Create React root and render the app
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* 
      BrowserRouter enables client-side routing
      WHY: Allows navigation without page reloads
    */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);