import React from 'react';

/**
 * @file src/App.lazy.tsx
 * @description This file defines a lazy-loaded version of the main App component.
 *              It can be used with React.Suspense for code splitting.
 *              The original file was empty, which is not a valid component declaration.
 */
const AppLazy = React.lazy(() => import('./App'));

export default AppLazy;
