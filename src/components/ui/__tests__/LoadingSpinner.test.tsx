// src/components/LoadingSpinner/LoadingSpinner.test.tsx
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

// Mock the CSS module to ensure class names are consistent for testing
// In a real project, you might use identity-obj-proxy in jest.config.js
// but for a single component, a manual mock is fine.
jest.mock('./LoadingSpinner.module.css', () => ({
  spinnerContainer: 'spinnerContainer',
  spinner: 'spinner',
  visuallyHidden: 'visuallyHidden',
}));

describe('LoadingSpinner', () => {
  afterEach(cleanup);

  // Test Case 1: Renders with default props
  test('renders correctly with default props', () => {
    render(<LoadingSpinner />);

    // Check for the main container with accessibility attributes
    const spinnerContainer = screen.getByRole('status', { name: 'Loading' });
    expect(spinnerContainer).toBeInTheDocument();
    expect(spinnerContainer).toHaveAttribute('aria-live', 'polite');
    expect(spinnerContainer).toHaveClass('spinnerContainer');

    // Check for the visually hidden text
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toHaveClass('visuallyHidden');

    // Check the spinner element's default styles
    const spinnerElement = spinnerContainer.querySelector('.spinner');
    expect(spinnerElement).toBeInTheDocument();
    expect(spinnerElement).toHaveStyle('width: 48px');
    expect(spinnerElement).toHaveStyle('height: 48px');
    expect(spinnerElement).toHaveStyle('--spinner-color: #6366F1');
    // Default color #6366F1 (rgb(99, 102, 241)) with 0.2 opacity
    expect(spinnerElement).toHaveStyle('--spinner-border-color: rgba(99, 102, 241, 0.2)');
  });

  // Test Case 2: Renders with custom size prop
  test('applies custom size prop correctly', () => {
    const customSize = 72;
    render(<LoadingSpinner size={customSize} />);

    const spinnerContainer = screen.getByRole('status', { name: 'Loading' });
    const spinnerElement = spinnerContainer.querySelector('.spinner');

    expect(spinnerElement).toHaveStyle(`width: ${customSize}px`);
    expect(spinnerElement).toHaveStyle(`height: ${customSize}px`);
  });

  // Test Case 3: Renders with custom color prop (hex)
  test('applies custom hex color prop correctly and derives border color', () => {
    const customColor = '#FF0000'; // Red
    render(<LoadingSpinner color={customColor} />);

    const spinnerContainer = screen.getByRole('status', { name: 'Loading' });
    const spinnerElement = spinnerContainer.querySelector('.spinner');

    expect(spinnerElement).toHaveStyle(`--spinner-color: ${customColor}`);
    // #FF0000 (rgb(255, 0, 0)) with 0.2 opacity
    expect(spinnerElement).toHaveStyle('--spinner-border-color: rgba(255, 0, 0, 0.2)');
  });

  // Test Case 4: Renders with custom color prop (shorthand hex)
  test('applies custom shorthand hex color prop correctly and derives border color', () => {
    const customColor = '#F00'; // Red shorthand
    render(<LoadingSpinner color={customColor} />);

    const spinnerContainer = screen.getByRole('status', { name: 'Loading' });
    const spinnerElement = spinnerContainer.querySelector('.spinner');

    expect(spinnerElement).toHaveStyle(`--spinner-color: ${customColor}`);
    // #F00 (rgb(255, 0, 0)) with 0.2 opacity
    expect(spinnerElement).toHaveStyle('--spinner-border-color: rgba(255, 0, 0, 0.2)');
  });

  // Test Case 5: Renders with custom color prop (non-hex, should fallback for border color)
  test('applies custom non-hex color prop and uses fallback border color', () => {
    const customColor = 'blue';
    render(<LoadingSpinner color={customColor} />);

    const spinnerContainer = screen.getByRole('status', { name: 'Loading' });
    const spinnerElement = spinnerContainer.querySelector('.spinner');

    expect(spinnerElement).toHaveStyle(`--spinner-color: ${customColor}`);
    // For non-hex colors, hexToRgb returns null, so it should fallback to rgba(0, 0, 0, 0.1)
    expect(spinnerElement).toHaveStyle('--spinner-border-color: rgba(0, 0, 0, 0.1)');
  });

  // Test Case 6: Renders with custom className prop
  test('applies custom className prop correctly', () => {
    const customClassName = 'my-custom-spinner-class';
    render(<LoadingSpinner className={customClassName} />);

    const spinnerContainer = screen.getByRole('status', { name: 'Loading' });
    expect(spinnerContainer).toHaveClass('spinnerContainer');
    expect(spinnerContainer).toHaveClass(customClassName);
  });

  // Test Case 7: Renders with a combination of all props
  test('applies all custom props correctly', () => {
    const customSize = 100;
    const customColor = '#00FF00'; // Green
    const customClassName = 'combined-spinner-class';

    render(<LoadingSpinner size={customSize} color={customColor} className={customClassName} />);

    const spinnerContainer = screen.getByRole('status', { name: 'Loading' });
    expect(spinnerContainer).toHaveClass('spinnerContainer');
    expect(spinnerContainer).toHaveClass(customClassName);

    const spinnerElement = spinnerContainer.querySelector('.spinner');
    expect(spinnerElement).toBeInTheDocument();
    expect(spinnerElement).toHaveStyle(`width: ${customSize}px`);
    expect(spinnerElement).toHaveStyle(`height: ${customSize}px`);
    expect(spinnerElement).toHaveStyle(`--spinner-color: ${customColor}`);
    // #00FF00 (rgb(0, 255, 0)) with 0.2 opacity
    expect(spinnerElement).toHaveStyle('--spinner-border-color: rgba(0, 255, 0, 0.2)');
  });

  // Test Case 8: Accessibility attributes verification
  test('has correct accessibility attributes', () => {
    render(<LoadingSpinner />);

    const spinnerContainer = screen.getByRole('status');
    expect(spinnerContainer).toBeInTheDocument();
    expect(spinnerContainer).toHaveAttribute('aria-live', 'polite');
    expect(spinnerContainer).toHaveAttribute('aria-label', 'Loading');

    // Verify the accessible name using getByRole with name option
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();

    // Verify visually hidden text for screen readers
    const visuallyHiddenText = screen.getByText('Loading...');
    expect(visuallyHiddenText).toBeInTheDocument();
    expect(visuallyHiddenText).toHaveClass('visuallyHidden');
  });
});