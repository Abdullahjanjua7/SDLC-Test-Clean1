import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Assuming your main application component is in App.tsx
import './index.css'; // Optional: Import global styles if you have them

/**
 * The main entry point for the React application.
 * This file is responsible for rendering the root React component into the DOM.
 */
const rootElement = document.getElementById('root');

// Ensure the root element exists before attempting to render the application.
if (!rootElement) {
  // Log an error or throw an exception if the root element is not found,
  // as the application cannot be mounted without it.
  console.error('Failed to find the root element with ID "root".');
  // Optionally, you could display a fallback message or component here
  // if this were a more complex error handling scenario.
} else {
  // Create a React root using ReactDOM.createRoot.
  // This is the recommended way to render React applications starting from React 18.
  const root = ReactDOM.createRoot(rootElement);

  // Render the main application component (`App`) into the root.
  // React.StrictMode is used to highlight potential problems in an application.
  // It activates additional checks and warnings for its descendants during development.
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}