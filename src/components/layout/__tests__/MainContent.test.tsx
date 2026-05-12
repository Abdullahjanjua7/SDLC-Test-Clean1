import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import MainContent from './MainContent';
import styles from './MainContent.module.css';

// Extend Jest's expect with jest-axe matchers
expect.extend(toHaveNoViolations);

describe('MainContent', () => {
  // Test 1: Renders without crashing and displays children
  test('renders children correctly', () => {
    const testContent = 'This is some test content.';
    render(<MainContent>{testContent}</MainContent>);

    const mainElement = screen.getByRole('region', { name: 'Main dashboard content area' });
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveTextContent(testContent);
  });

  // Test 2: Renders with complex children (e.g., a React element)
  test('renders complex React children', () => {
    const ComplexChild = () => <div data-testid="complex-child">Complex Content Here</div>;
    render(
      <MainContent>
        <ComplexChild />
      </MainContent>
    );

    const mainElement = screen.getByRole('region', { name: 'Main dashboard content area' });
    expect(mainElement).toBeInTheDocument();
    expect(screen.getByTestId('complex-child')).toBeInTheDocument();
    expect(screen.getByTestId('complex-child')).toHaveTextContent('Complex Content Here');
  });

  // Test 3: Renders without children
  test('renders correctly when no children are provided', () => {
    render(<MainContent />);

    const mainElement = screen.getByRole('region', { name: 'Main dashboard content area' });
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toBeEmptyDOMElement(); // Should be empty if no children
  });

  // Test 4: Applies the correct CSS class
  test('applies the mainContent CSS class', () => {
    render(<MainContent />);

    const mainElement = screen.getByRole('region', { name: 'Main dashboard content area' });
    // Assuming styles.mainContent resolves to a string (e.g., 'MainContent_mainContent__xyz')
    // In a real setup, Jest's moduleNameMapper would handle CSS modules.
    // We check for the presence of the class name, not its exact generated value.
    expect(mainElement).toHaveClass(styles.mainContent);
  });

  // Test 5: Accessibility - checks for aria-label and role attributes
  test('has correct accessibility attributes', () => {
    render(<MainContent>Test Content</MainContent>);

    const mainElement = screen.getByRole('region');
    expect(mainElement).toHaveAttribute('aria-label', 'Main dashboard content area');
    expect(mainElement).toHaveAttribute('role', 'region');
  });

  // Test 6: Accessibility - axe-core check
  test('should not have any accessibility violations', async () => {
    const { container } = render(<MainContent>Accessible Content</MainContent>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // Test 7: Accessibility - axe-core check with no children
  test('should not have any accessibility violations when empty', async () => {
    const { container } = render(<MainContent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});