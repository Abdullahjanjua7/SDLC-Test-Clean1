import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SkipLink } from './SkipLink'; // Assuming named export

// Mock CSS modules to ensure class names are resolved consistently in tests.
// This prevents issues where `styles.skipLink` might be undefined without a CSS loader.
jest.mock('./SkipLink.module.css', () => ({
  skipLink: 'mock-skip-link-class',
}));

describe('SkipLink', () => {
  const defaultProps = {
    href: '#main-content',
    children: 'Skip to main content',
  };

  // Test 1: Renders correctly with basic props
  test('renders the skip link with correct href and text content', () => {
    render(<SkipLink {...defaultProps} />);

    const linkElement = screen.getByRole('link', { name: /skip to main content/i });

    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', defaultProps.href);
    expect(linkElement).toHaveTextContent(defaultProps.children);
    expect(linkElement).toHaveClass('mock-skip-link-class'); // Check for the mocked CSS module class
  });

  // Test 2: Applies additional className prop
  test('applies the additional className prop alongside the default style', () => {
    const customClassName = 'my-custom-class';
    render(<SkipLink {...defaultProps} className={customClassName} />);

    const linkElement = screen.getByRole('link', { name: /skip to main content/i });

    expect(linkElement).toHaveClass('mock-skip-link-class');
    expect(linkElement).toHaveClass(customClassName);
  });

  // Test 3: Renders correctly when className is an empty string
  test('renders correctly when className prop is an empty string', () => {
    render(<SkipLink {...defaultProps} className="" />);

    const linkElement = screen.getByRole('link', { name: /skip to main content/i });

    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveClass('mock-skip-link-class');
    // Ensure no empty class attribute or an empty string class is added
    expect(linkElement.className).not.toContain('  '); // Check for double spaces from concatenation
  });

  // Test 4: Handles different children types (e.g., ReactNode)
  test('renders children as a complex ReactNode', () => {
    const complexChildren = (
      <>
        <span>Skip</span> to <strong>main content</strong> area
      </>
    );
    render(<SkipLink href="#content">{complexChildren}</SkipLink>);

    const linkElement = screen.getByRole('link', { name: /skip to main content area/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toContainHTML('<span>Skip</span> to <strong>main content</strong> area');
  });

  // Test 5: Accessibility - Focus behavior
  test('is focusable and remains in the document when focused', () => {
    render(<SkipLink {...defaultProps} />);

    const linkElement = screen.getByRole('link', { name: /skip to main content/i });

    // Simulate focus event
    fireEvent.focus(linkElement);

    // The element should still be in the document and have focus
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveFocus();
  });

  // Test 6: Accessibility - Role and accessible name
  test('has the correct ARIA role and accessible name derived from children', () => {
    render(<SkipLink {...defaultProps} />);

    // Using getByRole with a name ensures both role and accessible name are correct
    const linkElement = screen.getByRole('link', { name: defaultProps.children });

    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', defaultProps.href);
  });

  // Test 7: Accessibility - Ensures no aria-hidden attribute is present
  test('does not have aria-hidden attribute, as it is an interactive element', () => {
    render(<SkipLink {...defaultProps} />);
    const linkElement = screen.getByRole('link', { name: /skip to main content/i });
    expect(linkElement).not.toHaveAttribute('aria-hidden');
  });

  // Test 8: User interaction - Click (verifying href, not actual navigation)
  test('clicking the link does not cause an error and has the correct href attribute', () => {
    // For a simple anchor tag, fireEvent.click simulates the browser's default behavior.
    // We primarily test that the `href` attribute is correct, as the browser handles the navigation.
    // Mocking window.location is generally not needed for simple hash links unless
    // a custom onClick handler is preventing default or performing other actions.
    render(<SkipLink {...defaultProps} />);
    const linkElement = screen.getByRole('link', { name: /skip to main content/i });

    // Simulate a click event
    fireEvent.click(linkElement);

    // Assert that the href attribute is correctly set, which is the primary contract
    // for a skip link to function correctly in a browser.
    expect(linkElement).toHaveAttribute('href', defaultProps.href);
  });

  // Test 9: Renders with a different href value
  test('renders with a different href value', () => {
    const newHref = '#another-section';
    render(<SkipLink href={newHref}>Go to another section</SkipLink>);

    const linkElement = screen.getByRole('link', { name: /go to another section/i });

    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', newHref);
  });
});