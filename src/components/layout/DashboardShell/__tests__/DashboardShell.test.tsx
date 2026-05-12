import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import DashboardShell from './DashboardShell';

// Extend Jest's expect with jest-axe matchers
expect.extend(toHaveNoViolations);

describe('DashboardShell', () => {
  // Test 1: Renders the component with basic structure and children
  test('renders the dashboard shell with all main sections and children content', () => {
    const testChildren = <div data-testid="child-content">Hello Dashboard!</div>;
    render(<DashboardShell>{testChildren}</DashboardShell>);

    // Check for main layout container
    const shellContainer = screen.getByRole('grid', { name: 'Dashboard layout container' });
    expect(shellContainer).toBeInTheDocument();

    // Check for Navbar
    const navbar = screen.getByRole('banner', { name: 'Dashboard navigation header' });
    expect(navbar).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'User profile settings' })).toBeInTheDocument();

    // Check for Sidebar
    const sidebar = screen.getByRole('navigation', { name: 'Main sidebar navigation' });
    expect(sidebar).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Analytics' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Reports' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument();

    // Check for Main Content Area
    const mainContent = screen.getByRole('main', { name: 'Main content area' });
    expect(mainContent).toBeInTheDocument();

    // Check if children content is rendered within the main content area
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Hello Dashboard!')).toBeInTheDocument();
  });

  // Test 2: Renders different types of children content
  test('renders complex React elements as children', () => {
    const ComplexChild = () => (
      <section data-testid="complex-child">
        <h2>Welcome!</h2>
        <p>This is a complex child component.</p>
        <button>Action</button>
      </section>
    );
    render(<DashboardShell><ComplexChild /></DashboardShell>);

    expect(screen.getByTestId('complex-child')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Welcome!' })).toBeInTheDocument();
    expect(screen.getByText('This is a complex child component.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  // Test 3: User interactions - clicking buttons and links
  test('user can interact with the user profile button', async () => {
    const user = userEvent.setup();
    render(<DashboardShell><div>Content</div></DashboardShell>);

    const userProfileButton = screen.getByRole('button', { name: 'User profile settings' });
    expect(userProfileButton).toBeInTheDocument();

    // Simulate a click
    await user.click(userProfileButton);
    // In this component, clicking the button doesn't trigger a visible change
    // or call a prop function, so we just ensure the click event doesn't throw errors.
    // If there were an onClick prop, we would mock and assert it was called.
    expect(userProfileButton).toBeEnabled(); // Still enabled after click
  });

  test('user can interact with sidebar navigation links', async () => {
    const user = userEvent.setup();
    render(<DashboardShell><div>Content</div></DashboardShell>);

    const overviewLink = screen.getByRole('link', { name: 'Overview' });
    const analyticsLink = screen.getByRole('link', { name: 'Analytics' });

    expect(overviewLink).toBeInTheDocument();
    expect(analyticsLink).toBeInTheDocument();

    // The "Overview" link has aria-current="page"
    expect(overviewLink).toHaveAttribute('aria-current', 'page');
    expect(analyticsLink).not.toHaveAttribute('aria-current', 'page');

    // Simulate clicking "Analytics" link
    await user.click(analyticsLink);
    // Similar to the button, these links just have href="#"
    // In a real app, this would trigger a route change.
    // Here, we just ensure the click doesn't error and the link is still present.
    expect(analyticsLink).toBeInTheDocument();
  });

  // Test 4: Accessibility
  test('should not have any accessibility violations', async () => {
    const { container } = render(<DashboardShell><div>Test Content</div></DashboardShell>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('has correct ARIA attributes and roles for accessibility', () => {
    render(<DashboardShell><div>Test Content</div></DashboardShell>);

    // Main container
    expect(screen.getByRole('grid', { name: 'Dashboard layout container' })).toBeInTheDocument();

    // Navbar
    expect(screen.getByRole('banner', { name: 'Dashboard navigation header' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'User profile settings' })).toBeInTheDocument();

    // Sidebar
    expect(screen.getByRole('navigation', { name: 'Main sidebar navigation' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Overview', current: 'page' })).toBeInTheDocument(); // Checks aria-current="page"
    expect(screen.getByRole('link', { name: 'Analytics' })).toBeInTheDocument();

    // Main content
    expect(screen.getByRole('main', { name: 'Main content area' })).toBeInTheDocument();
  });

  // Test 5: CSS Modules (indirectly, by checking class names)
  test('applies correct CSS module class names', () => {
    const { container } = render(<DashboardShell><div>Content</div></DashboardShell>);

    // Check for the presence of class names.
    // Note: Jest's moduleNameMapper will transform `styles.shellContainer` into a string like 'shellContainer_hash'.
    // We are checking if the element has *a* class name that matches the pattern, not the exact transformed name.
    // A more robust way is to check for the presence of the element itself, which we do above.
    // For CSS modules, we generally trust the build system to apply them correctly.
    // This test is more for ensuring the class prop is used.
    expect(container.querySelector('div[role="grid"]')).toHaveClass(/shellContainer/);
    expect(container.querySelector('header[role="banner"]')).toHaveClass(/navbar/);
    expect(container.querySelector('aside[role="navigation"]')).toHaveClass(/sidebar/);
    expect(container.querySelector('main[role="main"]')).toHaveClass(/mainContent/);
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveClass(/sidebarNavItemActive/);
  });
});