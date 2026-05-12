import React, { lazy, Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import App from './App';

// Mock CSS modules to prevent issues with undefined styles during testing
// This proxy ensures that class names are returned as strings, allowing
// `toHaveClass` assertions to work correctly.
jest.mock('./App.module.css', () => ({
  __esModule: true,
  default: new Proxy(
    {},
    {
      get: (target, prop) => prop,
    }
  ),
}));

// Mock the actual lazy-loaded page components.
// In the provided App.tsx, the Routes currently use Fallback components directly,
// so these mocks won't be hit by the main routing tests.
// However, it's good practice to mock them if they are defined.
jest.mock('./pages/Home', () => ({
  __esModule: true,
  default: () => <div>Mocked Home Page Content</div>,
}));
jest.mock('./pages/About', () => ({
  __esModule: true,
  default: () => <div>Mocked About Page Content</div>,
}));
jest.mock('./pages/Dashboard', () => ({
  __esModule: true,
  default: () => <div>Mocked Dashboard Page Content</div>,
}));
jest.mock('./pages/Settings', () => ({
  __esModule: true,
  default: () => <div>Mocked Settings Page Content</div>,
}));

// Helper function to render the App component within a MemoryRouter
// This allows controlling the initial URL for routing tests.
const renderApp = (initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>
  );
};

describe('App Component', () => {
  // Clear all mocks before each test to ensure isolation
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Basic Rendering Tests ---
  test('renders the main layout elements', () => {
    renderApp();

    expect(screen.getByRole('banner', { name: /my elite app/i })).toBeInTheDocument(); // Header
    expect(screen.getByRole('navigation', { name: /main sidebar navigation/i })).toBeInTheDocument(); // Sidebar
    expect(screen.getByRole('main')).toBeInTheDocument(); // Main content area
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // Footer
  });

  test('renders the application title in the header', () => {
    renderApp();
    expect(screen.getByRole('heading', { name: /my elite app/i })).toBeInTheDocument();
  });

  test('renders the copyright information in the footer', () => {
    renderApp();
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} My Elite App. All rights reserved.`)).toBeInTheDocument();
  });

  // --- Initial Route and Content Tests ---
  test('renders the Home page content by default on "/" route', async () => {
    renderApp();
    expect(screen.getByRole('heading', { name: /welcome home!/i })).toBeInTheDocument();
    expect(screen.getByText(/this is the main content area/i)).toBeInTheDocument();
  });

  // --- Navigation and Routing Tests ---
  test('navigates to Dashboard page when Dashboard link is clicked', async () => {
    renderApp();
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });

    await userEvent.click(dashboardLink);

    expect(screen.getByRole('heading', { name: /dashboard overview/i })).toBeInTheDocument();
    expect(screen.getByText(/your key metrics at a glance/i)).toBeInTheDocument();
    expect(dashboardLink).toHaveClass('activeLink'); // Check active class
    expect(dashboardLink).toHaveAttribute('aria-current', 'page'); // Check aria-current
  });

  test('navigates to About page when About link is clicked', async () => {
    renderApp();
    const aboutLink = screen.getByRole('link', { name: /about/i });

    await userEvent.click(aboutLink);

    expect(screen.getByRole('heading', { name: /about us/i })).toBeInTheDocument();
    expect(screen.getByText(/learn more about our mission/i)).toBeInTheDocument();
    expect(aboutLink).toHaveClass('activeLink');
    expect(aboutLink).toHaveAttribute('aria-current', 'page');
  });

  test('navigates to Settings page when Settings link is clicked', async () => {
    renderApp();
    const settingsLink = screen.getByRole('link', { name: /settings/i });

    await userEvent.click(settingsLink);

    expect(screen.getByRole('heading', { name: /application settings/i })).toBeInTheDocument();
    expect(screen.getByText(/configure your preferences here/i)).toBeInTheDocument();
    expect(settingsLink).toHaveClass('activeLink');
    expect(settingsLink).toHaveAttribute('aria-current', 'page');
  });

  test('navigates back to Home page when Home link is clicked from another route', async () => {
    renderApp(['/dashboard']); // Start on dashboard
    expect(screen.getByRole('heading', { name: /dashboard overview/i })).toBeInTheDocument();

    const homeLink = screen.getByRole('link', { name: /home/i });
    await userEvent.click(homeLink);

    expect(screen.getByRole('heading', { name: /welcome home!/i })).toBeInTheDocument();
    expect(homeLink).toHaveClass('activeLink');
    expect(homeLink).toHaveAttribute('aria-current', 'page');
  });

  test('header navigation links work correctly and show 404 for unhandled routes', async () => {
    renderApp();
    const profileLink = screen.getByRole('link', { name: /profile/i });
    const notificationsLink = screen.getByRole('link', { name: /notifications/i });

    // Click Profile link
    await userEvent.click(profileLink);
    // Since there's no route for /profile, it should show 404
    expect(screen.getByRole('heading', { name: /404: not found/i })).toBeInTheDocument();
    expect(profileLink).toHaveClass('activeLink'); // Check active class for header navlink

    // Click Notifications link
    await userEvent.click(notificationsLink);
    // Since there's no route for /notifications, it should show 404
    expect(screen.getByRole('heading', { name: /404: not found/i })).toBeInTheDocument();
    expect(notificationsLink).toHaveClass('activeLink'); // Check active class for header navlink
  });

  test('footer navigation links have correct href attributes', () => {
    renderApp();
    const privacyLink = screen.getByRole('link', { name: /privacy policy/i });
    const termsLink = screen.getByRole('link', { name: /terms of service/i });

    expect(privacyLink).toHaveAttribute('href', '/privacy');
    expect(termsLink).toHaveAttribute('href', '/terms');
  });

  test('displays 404 page for unknown routes', () => {
    renderApp(['/non-existent-route']);
    expect(screen.getByRole('heading', { name: /404: not found/i })).toBeInTheDocument();
    expect(screen.getByText(/the page you are looking for does not exist/i)).toBeInTheDocument();
  });

  // --- Accessibility Tests ---
  test('header has role="banner" and its navigation has correct aria-label', () => {
    renderApp();
    expect(screen.getByRole('banner', { name: /my elite app/i })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /primary application navigation/i })).toBeInTheDocument();
  });

  test('sidebar has role="navigation" and correct aria-label', () => {
    renderApp();
    expect(screen.getByRole('navigation', { name: /main sidebar navigation/i })).toBeInTheDocument();
  });

  test('main content area has role="main"', () => {
    renderApp();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  test('footer has role="contentinfo" and its navigation has correct aria-label', () => {
    renderApp();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /secondary footer navigation/i })).toBeInTheDocument();
  });

  test('active NavLink has aria-current="page" attribute', async () => {
    renderApp(); // Home is active by default
    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toHaveAttribute('aria-current', 'page');

    await userEvent.click(screen.getByRole('link', { name: /dashboard/i }));
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');
    expect(homeLink).not.toHaveAttribute('aria-current', 'page'); // Home should no longer be current
  });

  // --- Suspense Fallback Test (Demonstration for actual lazy components) ---
  // NOTE: The provided App.tsx uses Fallback components directly in its Routes,
  // not the lazy-loaded ones. Therefore, the Suspense fallback will *not* be
  // triggered by the current App component's routing logic.
  // This test demonstrates how one *would* test the Suspense fallback if the
  // lazy components were actually used in the Routes with a delay.
  test('displays loading fallback when a lazy component is loading', async () => {
    // Create a mock lazy component that resolves after a delay
    const DelayedLazyComponent = lazy(() =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({ default: () => <div>Delayed Lazy Content