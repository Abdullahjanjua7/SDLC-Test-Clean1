import React from 'react';
import { routes, RouteConfig, RoutesConfig } from '../routes'; // Adjust path as necessary

// --- Mocking Setup ---

// Create simple mock components for React.lazy imports.
// These are just placeholder components; their actual rendering logic is not relevant for testing the route configuration.
const MockHomePage = () => null;
const MockAboutPage = () => null;
const MockDashboardPage = () => null;
const MockProfilePage = () => null;
const MockLoginPage = () => null;
const MockRegisterPage = () => null;
const MockNotFoundPage = () => null;
const MockSettingsPage = () => null;
const MockUserListPage = () => null;
const MockUserDetailPage = () => null;
const MockAdminDashboardPage = () => null;

// Mock the actual component files that React.lazy attempts to import.
// This ensures that when React.lazy's factory function is called (e.g., during snapshot serialization),
// it resolves to our mock components instead of trying to load actual files.
jest.mock('../pages/Home', () => ({ __esModule: true, default: MockHomePage }));
jest.mock('../pages/About', () => ({ __esModule: true, default: MockAboutPage }));
jest.mock('../pages/Dashboard', () => ({ __esModule: true, default: MockDashboardPage }));
jest.mock('../pages/Profile', () => ({ __esModule: true, default: MockProfilePage }));
jest.