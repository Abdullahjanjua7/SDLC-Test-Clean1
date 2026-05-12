import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';
import { axe, toHaveNoViolations } from 'jest-axe';

// Extend Jest with axe matchers
expect.extend(toHaveNoViolations);

describe('LoadingSpinner', () => {
  // Test 1: Basic rendering and structure
  it('should render the loading spinner component', () => {
    render(<LoadingSpinner />);

    // Check for the main container element with the appropriate role and label
    const spinnerContainer = screen.getByRole('status', { name: 'Loading content...' });
    expect(spinnerContainer).toBeInTheDocument();

    // Check for the presence of the inner spinner element (assuming it's a direct child or identifiable)
    // Since the inner div has no specific role or text, we might query by testId or className if needed.
    // For now, we'll assume its presence within the container is sufficient, or check its class.
    // A more robust check might involve snapshot testing for structure, but we'll stick to explicit queries.
    const innerSpinner = spinnerContainer.querySelector('div'); // Assuming it's the only direct div child
    expect(innerSpinner).toBeInTheDocument();
    expect(innerSpinner).toHaveClass('spinner'); // Assuming 'spinner' is the class for the inner div
  });

  // Test 2: Accessibility attributes
  it('should have correct accessibility attributes', () => {
    render(<LoadingSpinner />);

    const spinnerContainer = screen.getByRole('status');

    // Check for role="status"
    expect(spinnerContainer).toHaveAttribute('role', 'status');

    // Check for aria-live="polite"
    expect(spinnerContainer).toHaveAttribute('aria-live', 'polite');

    // Check for aria-label
    expect(spinnerContainer).toHaveAttribute('aria-label', 'Loading content...');
    expect(screen.getByLabelText('Loading content...')).toBeInTheDocument();
  });

  // Test 3: Accessibility with axe-core
  it('should be accessible', async () => {
    const { container } = render(<LoadingSpinner />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // Test 4: No user interactions to test as it's a purely visual component.
  // Test 5: No prop combinations to test as LoadingSpinnerProps is empty.
  // If props were added (e.g., size, color), tests would be added here:
  /*
  it('should apply custom size if provided', () => {
    render(<LoadingSpinner size="large" />);
    const spinnerContainer = screen.getByRole('status');
    expect(spinnerContainer).toHaveStyle('width: 64px'); // Example, based on how 'size' prop would be implemented
  });
  */
});