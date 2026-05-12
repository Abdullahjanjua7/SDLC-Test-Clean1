import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardLayout from './DashboardLayout';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';

// Extend Jest with axe matchers
expect.extend(toHaveNoViolations);

// Mock CSS modules to get predictable class names for testing
jest.mock('./DashboardLayout.module.css', () => ({
  layoutContainer: 'mock-layout-container',
  topbar: 'mock-topbar',
  sidebar: 'mock-sidebar',
  mainContent: 'mock-main-content',
}));

describe('DashboardLayout', () => {
  const mockSidebarContent = <div>Sidebar Content</div>;
  const mockTopbarContent = <h1>Topbar Title</h1>;
  const mockChildrenContent = <p>Main Content Area</p>;

  // Test 1: Renders all provided content correctly
  test('renders sidebar, topbar, and children content', () => {
    render(
      <DashboardLayout
        sidebar={mockSidebarContent}
        topbar={mockTopbarContent}
        children={mockChildrenContent}
      />
    );

    expect(screen.getByText('Sidebar Content')).toBeInTheDocument();
    expect(screen.getByText('Topbar Title')).toBeInTheDocument();
    expect(screen.getByText('Main Content Area')).toBeInTheDocument();
  });

  // Test 2: Applies the optional className prop to the main container
  test('applies custom className to the layout container', () => {
    const customClass = 'my-custom-layout';
    render(
      <DashboardLayout
        sidebar={mockSidebarContent}
        topbar={mockTopbarContent}
        children={mockChildrenContent}
        className={customClass}
      />
    );

    const layoutContainer = screen.getByRole('region', { name: 'Dashboard Layout' });
    expect(layoutContainer).toHaveClass('mock-layout-container');
    expect(layoutContainer).toHaveClass(customClass);
  });

  // Test 3: Renders without the optional className prop
  test('renders correctly without a custom className', () => {
    render(
      <DashboardLayout
        sidebar={mockSidebarContent}
        topbar={mockTopbarContent}
        children={mockChildrenContent}
      />
    );

    const layoutContainer = screen.getByRole('region', { name: 'Dashboard Layout' });
    expect(layoutContainer).toHaveClass('mock-layout-container');
    expect(layoutContainer).not.toHaveClass('undefined'); // Ensure no 'undefined' class is added
  });

  // Test 4: Checks for correct HTML structure and CSS classes
  test('renders with correct HTML elements and CSS classes', () => {
    render(
      <DashboardLayout
        sidebar={mockSidebarContent}
        topbar={mockTopbarContent}
        children={mockChildrenContent}
      />
    );

    const layoutContainer = screen.getByRole('region', { name: 'Dashboard Layout' });
    expect(layoutContainer).toBeInTheDocument();
    expect(layoutContainer).toHaveClass('mock-layout-container');

    const topbar = screen.getByRole('banner', { name: 'Dashboard Top Navigation' });
    expect(topbar).toBeInTheDocument();
    expect(topbar.tagName).toBe('HEADER');
    expect(topbar).toHaveClass('mock-topbar');

    const sidebar = screen.getByRole('navigation', { name: 'Dashboard Sidebar Navigation' });
    expect(sidebar).toBeInTheDocument();
    expect(sidebar.tagName).toBe('ASIDE');
    expect(sidebar).toHaveClass('mock-sidebar');

    const mainContent = screen.getByRole('main', { name: 'Dashboard Main Content Area' });
    expect(mainContent).toBeInTheDocument();
    expect(mainContent.tagName).toBe('MAIN');
    expect(mainContent).toHaveClass('mock-main-content');
  });

  // Test 5: Accessibility checks
  test('should be accessible', async () => {
    const { container } = render(
      <DashboardLayout
        sidebar={mockSidebarContent}
        topbar={mockTopbarContent}
        children={mockChildrenContent}
      />
    );

    // Check for specific ARIA roles and labels
    expect(screen.getByRole('region', { name: 'Dashboard Layout' })).toBeInTheDocument();
    expect(screen.getByRole('banner', { name: 'Dashboard Top Navigation' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Dashboard Sidebar Navigation' })).toBeInTheDocument();
    expect(screen.getByRole('main', { name: 'Dashboard Main Content Area' })).toBeInTheDocument();

    // Run axe-core accessibility check
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // Test 6: Ensures children are rendered within the main content area
  test('children are correctly placed within the main content area', () => {
    render(
      <DashboardLayout
        sidebar={mockSidebarContent}
        topbar={mockTopbarContent}
        children={<div><p>Child 1</p><p>Child 2</p></div>}
      />
    );

    const mainContentArea = screen.getByRole('main', { name: 'Dashboard Main Content Area' });
    expect(mainContentArea).toContainElement(screen.getByText('Child 1'));
    expect(mainContentArea).toContainElement(screen.getByText('Child 2'));
  });

  // Test 7: Ensures sidebar content is within the aside element
  test('sidebar content is correctly placed within the sidebar navigation area', () => {
    render(
      <DashboardLayout
        sidebar={<div><nav><ul><li>Item 1</li></ul></nav></div>}
        topbar={mockTopbarContent}
        children={mockChildrenContent}
      />
    );

    const sidebarNav = screen.getByRole('navigation', { name: 'Dashboard Sidebar Navigation' });
    expect(sidebarNav).toContainElement(screen.getByText('Item 1'));
  });

  // Test 8: Ensures topbar content is within the header element
  test('topbar content is correctly placed within the topbar banner area', () => {
    render(
      <DashboardLayout
        sidebar={mockSidebarContent}
        topbar={<div><button>Menu</button></div>}
        children={mockChildrenContent}
      />
    );

    const topbarBanner = screen.getByRole('banner', { name: 'Dashboard Top Navigation' });
    expect(topbarBanner).toContainElement(screen.getByRole('button', { name: 'Menu' }));
  });
});