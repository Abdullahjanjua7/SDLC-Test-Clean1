import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Declare 'require' for TypeScript if 'require.context' is used in a non-Node/Webpack environment.
// This is typically needed when migrating from Webpack to Vite if a compatibility plugin isn't used,
// or if 'require.context' is polyfilled. Without this declaration, TypeScript might report errors
// like 'Cannot find name 'require''.
declare const require: {
  context(directory: string, useSubdirectories: boolean, regExp: RegExp): {
    keys(): string[];
    <T>(id: string): T;
  };
};

const App = () => {
  // WARNING: 'require.context' is a Webpack-specific feature and will not work natively with Vite.
  // If you are using Vite (as indicated by vite.config.ts), this line will likely cause a runtime error
  // unless a specific Vite plugin is configured to emulate this behavior (e.g., vite-plugin-require-context).
  // For native Vite dynamic imports, consider using 'import.meta.glob'.
  const pages = require.context('./pages', false, /\.tsx$/);
  const pageKeys = pages.keys();
  
  // FIX: Added missing '?' for the ternary operator. This was a syntax error.
  const FirstPage = pageKeys.length > 0 ? pages(pageKeys[0]).default : () => <div>No pages generated</div>;
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FirstPage />} />
        <Route path="*" element={<FirstPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
