import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Sidebar from './Sidebar';

// Extend Jest with jest-axe matchers for accessibility testing
expect.extend(toHaveNoViolations);

describe('Sidebar', () => {
  // Test 1: Ensures the main sidebar component renders correctly
  it('should render the main navigation sidebar with its appropriate role and label', () => {
    render(<Sidebar />);
    const sidebarElement = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(sidebarElement).toBeInTheDocument();
    expect(sidebarElement.tagName).toBe('ASIDE');
    expect(sidebarElement).toHaveAttribute('aria-label', 'Main navigation');
  });

  // Test 2: Verifies the logo link and its accessibility features
  it('should render the logo link with correct href, aria-label, and screen-reader-only text', () => {
    render(<Sidebar />);
    const logoLink = screen.getByLabelText('Go to home page');
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');

    // Check for the screen-reader-only text
    const srOnlyLogoText = screen.getByText('App Logo');
    expect(srOnlyLogoText).toBeInTheDocument();
    expect(srOnlyLogoText.tagName).toBe('SPAN'); // Ensure it's a span as defined

    // Check for the presence of the SVG icon within the logo link
    expect(logoLink.querySelector('svg')).toBeInTheDocument();
  });

  // Test 3: Checks if all primary navigation links are rendered and have correct attributes
  it('should render all primary navigation links with their respective hrefs', () => {
    render(<Sidebar />);

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    const projectsLink = screen.getByRole('link', { name: /projects/i });
    const tasksLink = screen.getByRole('link', { name: /tasks/i });
    const settingsLink = screen.getByRole('link', { name: /settings/i });

    expect(dashboardLink).toBeInTheDocument();
    expect(projectsLink).toBeInTheDocument();
    expect(tasksLink).toBeInTheDocument();
    expect(settingsLink).toBeInTheDocument();

    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(projectsLink).toHaveAttribute('href', '/projects');
    expect(tasksLink).toHaveAttribute('href', '/tasks');
    expect(settingsLink).toHaveAttribute('href', '/settings');
  });

  // Test 4: Verifies that the "Dashboard" link is correctly marked as the current page
  it('should mark the Dashboard link as the current page using aria-current="page"', () => {
    render(<Sidebar />);
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');
  });

  // Test 5: Ensures all navigation links contain an SVG icon
  it('should render SVG icons for all navigation links', () => {
    render(<Sidebar />);

    // Get all navigation links within the nav element
    const navList = screen.getByRole('navigation', { name: 'Main navigation' }).querySelector('ul');
    expect(navList).toBeInTheDocument();

    const navLinks = navList ? Array.from(navList.querySelectorAll('a')) : [];
    expect(navLinks.length).toBe(5); // Logo link + 4 nav links

    // Filter for the actual navigation links (excluding the logo link)
    const primaryNavLinks = navLinks.filter(link => link.getAttribute('href') !== '/');

    primaryNavLinks.forEach(link => {
      expect(link.querySelector('svg')).toBeInTheDocument();
    });
  });

  // Test 6: Checks if the copyright information is present in the footer
  it('should render the copyright information in the footer', () => {
    render(<Sidebar />);
    const copyrightText = screen.getByText(/© 2023 Elite UI/i);
    expect(copyrightText).toBeInTheDocument();
    expect(copyrightText.tagName).toBe('P');
  });

  // Test 7: Comprehensive accessibility check using jest-axe
  it('should not have any accessibility violations', async () => {
    const { container } = render(<Sidebar />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // No specific tests for prop combinations or user interactions (clicks) are needed
  // because:
  // 1. The component's `SidebarProps` interface is empty, meaning it accepts no custom props.
  // 2. User interactions for static `<a>` tags typically involve browser navigation,
  //    which React Testing Library does not simulate. The presence of correct `href`
  //    attributes is sufficient to confirm their intended functionality.
});