import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardShell from './DashboardShell';

// Mock CSS modules to prevent issues during testing and ensure consistent class names
jest.mock('./DashboardShell.module.css', () => ({
  container: 'mock-container',
  header: 'mock-header',
  headerPlaceholder: 'mock-headerPlaceholder',
  headerTitle: 'mock-headerTitle',
  headerActions: 'mock-headerActions',
  sidebar: 'mock-sidebar',
  sidebarPlaceholder: 'mock-sidebarPlaceholder',
  logoArea: 'mock-logoArea',
  logoText: 'mock-logoText',
  navList: 'mock-navList',
  navItem: 'mock-navItem',
  navLink: 'mock-navLink',
  mainContent: 'mock-mainContent',
  actionButton: 'mock-actionButton',
}));

describe('DashboardShell', () => {
  // Test Case 1: Renders children content correctly
  test('renders children content correctly', () => {
    const testChildren = <div data-testid="child-content">Main Dashboard Content</div>;
    render(<DashboardShell>{testChildren}</DashboardShell>);

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Main Dashboard Content')).toBeInTheDocument();
  });

  // Test Case 2: Renders custom header content when provided
  test('renders custom header content when provided', () => {
    const customHeader = <h2 data-testid="custom-header">My Custom Header</h2>;
    render(<DashboardShell headerContent={customHeader}>Children</DashboardShell>);

    expect(screen.getByTestId('custom-header')).toBeInTheDocument();
    expect(screen.getByText('My Custom Header')).toBeInTheDocument();
    // Ensure default header content is NOT rendered
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('mock-headerPlaceholder')).not.toBeInTheDocument();
  });

  // Test Case 3: Renders custom sidebar content when provided
  test('renders custom sidebar content when provided', () => {
    const customSidebar = <nav data-testid="custom-sidebar">Custom Sidebar Menu</nav>;
    render(<DashboardShell sidebarContent={customSidebar}>Children</DashboardShell>);

    expect(screen.getByTestId('custom-sidebar')).toBeInTheDocument();
    expect(screen.getByText('Custom Sidebar Menu')).toBeInTheDocument();
    // Ensure default sidebar content is NOT rendered
    expect(screen.queryByText('App Logo')).not.toBeInTheDocument();
    expect(screen.queryByText('Overview')).not.toBeInTheDocument();
    expect(screen.queryByText('mock-sidebarPlaceholder')).not.toBeInTheDocument();
  });

  // Test Case 4: Renders both custom header and sidebar content
  test('renders both custom header and sidebar content', () => {
    const customHeader = <h2 data-testid="custom-header">Custom Header</h2>;
    const customSidebar = <nav data-testid="custom-sidebar">Custom Sidebar</nav>;
    render(
      <DashboardShell headerContent={customHeader} sidebarContent={customSidebar}>
        Children
      </DashboardShell>
    );

    expect(screen.getByTestId('custom-header')).toBeInTheDocument();
    expect(screen.getByTestId('custom-sidebar')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument(); // Default header
    expect(screen.queryByText('App Logo')).not.toBeInTheDocument(); // Default sidebar
  });

  // Test Case 5: Renders default header content when headerContent is not provided
  test('renders default header content when headerContent is not provided', () => {
    render(<DashboardShell>Children</DashboardShell>);

    const header = screen.getByRole('banner', { name: 'Dashboard Header' });
    expect(header).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument(); // Default title
    // Check for the presence of the placeholder div using its mocked class
    expect(header.querySelector('.mock-headerPlaceholder')).toBeInTheDocument();
    expect(header.querySelector('.mock-headerTitle')).toBeInTheDocument();
    expect(header.querySelector('.mock-headerActions')).toBeInTheDocument();
  });

  // Test Case 6: Renders default sidebar content when sidebarContent is not provided
  test('renders default sidebar content when sidebarContent is not provided', () => {
    render(<DashboardShell>Children</DashboardShell>);

    const nav = screen.getByRole('navigation', { name: 'Main Navigation' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByText('App Logo')).toBeInTheDocument(); // Default logo text
    expect(screen.getByText('Overview')).toBeInTheDocument(); // Default nav item
    expect(screen.getByText('Analytics')).toBeInTheDocument(); // Default nav item
    expect(screen.getByText('Reports')).toBeInTheDocument(); // Default nav item
    expect(screen.getByText('Settings')).toBeInTheDocument(); // Default nav item
    // Check for the presence of the placeholder div using its mocked class
    expect(nav.querySelector('.mock-sidebarPlaceholder')).toBeInTheDocument();
    expect(nav.querySelector('.mock-logoArea')).toBeInTheDocument();
    expect(nav.querySelector('.mock-logoText')).toBeInTheDocument();
    expect(nav.querySelector('.mock-navList')).toBeInTheDocument();
  });

  // Test Case 7: Accessibility - checks for correct ARIA labels and semantic elements
  test('has correct ARIA labels and semantic elements for accessibility', () => {
    render(<DashboardShell>Children</DashboardShell>);

    // Check main layout container aria-label
    expect(screen.getByLabelText('Dashboard Layout')).toBeInTheDocument();
    expect(screen.getByLabelText('Dashboard Layout')).toHaveClass('mock-container');

    // Check header semantic element and aria-label
    const header = screen.getByRole('banner', { name: 'Dashboard Header' });
    expect(header).toBeInTheDocument();
    expect(header.tagName).toBe('HEADER');
    expect(header).toHaveClass('mock-header');

    // Check navigation semantic element and aria-label
    const nav = screen.getByRole('navigation', { name: 'Main Navigation' });
    expect(nav).toBeInTheDocument();
    expect(nav.tagName).toBe('NAV');
    expect(nav).toHaveClass('mock-sidebar');

    // Check main content semantic element and aria-label
    const main = screen.getByRole('main', { name: 'Dashboard Content Area' });
    expect(main).toBeInTheDocument();
    expect(main.tagName).toBe('MAIN');
    expect(main).toHaveClass('mock-mainContent');
  });

  // Test Case 8: Accessibility - default navigation links
  test('default navigation links have correct attributes', () => {
    render(<DashboardShell>Children</DashboardShell>);

    const overviewLink = screen.getByRole('link', { name: 'Overview' });
    expect(overviewLink).toBeInTheDocument();
    expect(overviewLink).toHaveAttribute('href', '#');
    expect(overviewLink).toHaveAttribute('aria-current', 'page');
    expect(overviewLink).toHaveClass('mock-navLink');

    const analyticsLink = screen.getByRole('link', { name: 'Analytics' });
    expect(analyticsLink).toBeInTheDocument();
    expect(analyticsLink).toHaveAttribute('href', '#');
    expect(analyticsLink).not.toHaveAttribute('aria-current'); // Only Overview should have it by default
    expect(analyticsLink).toHaveClass('mock-navLink');

    // Check other links as well
    expect(screen.getByRole('link', { name: 'Reports' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument();
  });

  // Test Case 9: Snapshot test to ensure UI consistency with custom content
  test('matches snapshot with custom header and sidebar content', () => {
    const { asFragment } = render(
      <DashboardShell
        headerContent={<div data-testid="snapshot-header">Snapshot Header</div>}
        sidebarContent={<div data-testid="snapshot-sidebar">Snapshot Sidebar</div>}
      >
        <div data-testid="snapshot-children">Snapshot Children</div>
      </DashboardShell>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  // Test Case 10: Snapshot test with default content
  test('matches snapshot with default header and sidebar content', () => {
    const { asFragment } = render(
      <DashboardShell>
        <div data-testid="snapshot-children-default">Snapshot Children Default</div>
      </DashboardShell>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});