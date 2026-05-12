// src/components/ErrorDisplay/ErrorDisplay.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import ErrorDisplay from './ErrorDisplay';

// Extend Jest with jest-axe matchers
expect.extend(toHaveNoViolations);

describe('ErrorDisplay', () => {
  const defaultProps = {
    message: 'An unexpected error occurred.',
  };

  const fullProps = {
    message: 'Failed to load data.',
    details: 'Network request failed with status 500. Please check your internet connection and try again.',
    onClose: jest.fn(),
    errorId: 'ERR-12345',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test Case 1: Renders with only a message
  test('should render the error message correctly when only message prop is provided', () => {
    render(<ErrorDisplay {...defaultProps} />);

    const errorMessage = screen.getByText(defaultProps.message);
    expect(errorMessage).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /close error message/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/show details/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/error id:/i)).not.toBeInTheDocument();
  });

  // Test Case 2: Renders with message and details
  test('should render message and details when details prop is provided', () => {
    render(<ErrorDisplay message="Data fetch error" details="Detailed error info." />);

    expect(screen.getByText('Data fetch error')).toBeInTheDocument();
    const detailsSummary = screen.getByText(/show details/i);
    expect(detailsSummary).toBeInTheDocument();

    // Details content should not be visible initially
    expect(screen.queryByText('Detailed error info.')).not.toBeVisible();

    // Click summary to expand details
    fireEvent.click(detailsSummary);
    expect(screen.getByText('Detailed error info.')).toBeVisible();
  });

  // Test Case 3: Renders with message and onClose button
  test('should render a close button when onClose prop is provided and call it on click', () => {
    const mockOnClose = jest.fn();
    render(<ErrorDisplay message="Action failed" onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: /close error message/i });
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // Test Case 4: Renders with message, details, and errorId
  test('should render errorId within the details section when provided', () => {
    render(<ErrorDisplay message="Error" details="More info" errorId="ABC-123" />);

    const detailsSummary = screen.getByText(/show details/i);
    fireEvent.click(detailsSummary); // Expand details

    expect(screen.getByText('More info')).toBeInTheDocument();
    expect(screen.getByText(/Error ID: ABC-123/i)).toBeInTheDocument();
  });

  // Test Case 5: Renders with all props
  test('should render all elements correctly when all props are provided', () => {
    render(<ErrorDisplay {...fullProps} />);

    expect(screen.getByText(fullProps.message)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close error message/i })).toBeInTheDocument();
    const detailsSummary = screen.getByText(/show details/i);
    expect(detailsSummary).toBeInTheDocument();

    // Details and error ID should not be visible initially
    expect(screen.queryByText(fullProps.details)).not.toBeVisible();
    expect(screen.queryByText(`Error ID: ${fullProps.errorId}`)).not.toBeVisible();

    // Expand details
    fireEvent.click(detailsSummary);
    expect(screen.getByText(fullProps.details)).toBeVisible();
    expect(screen.getByText(`Error ID: ${fullProps.errorId}`)).toBeVisible();

    // Click close button
    fireEvent.click(screen.getByRole('button', { name: /close error message/i }));
    expect(fullProps.onClose).toHaveBeenCalledTimes(1);
  });

  // Test Case 6: Details section expands and collapses
  test('should toggle details visibility on summary click', () => {
    render(<ErrorDisplay message="Test" details="Hidden content" />);

    const detailsSummary = screen.getByText(/show details/i);
    const detailsContent = screen.getByText('Hidden content');

    // Initially collapsed
    expect(detailsContent).not.toBeVisible();

    // Expand
    fireEvent.click(detailsSummary);
    expect(detailsContent).toBeVisible();

    // Collapse
    fireEvent.click(detailsSummary);
    expect(detailsContent).not.toBeVisible();
  });

  // Test Case 7: Accessibility - ARIA roles and attributes
  test('should have correct ARIA roles and attributes for accessibility', () => {
    render(<ErrorDisplay {...fullProps} />);

    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toBeInTheDocument();
    expect(errorContainer).toHaveAttribute('aria-live', 'assertive');
    expect(errorContainer).toHaveAttribute('aria-atomic', 'true');

    // Check aria-labelledby and aria-describedby linkage
    const messageElement = screen.getByText(fullProps.message);
    const messageId = messageElement.id;
    expect(errorContainer).toHaveAttribute('aria-labelledby', messageId);

    const detailsElement = screen.getByText(fullProps.details).closest('div'); // The div with id={detailsId}
    const detailsId = detailsElement?.id;
    expect(errorContainer).toHaveAttribute('aria-describedby', detailsId);

    // Check close button aria-label
    const closeButton = screen.getByRole('button', { name: /close error message/i });
    expect(closeButton).toHaveAttribute('aria-label', 'Close error message');

    // Check icon aria-hidden
    const errorIcon = errorContainer.querySelector('svg');
    expect(errorIcon?.parentElement).toHaveAttribute('aria-hidden', 'true');
    const toggleIcon = screen.getByText(/show details/i).querySelector('span');
    expect(toggleIcon).toHaveAttribute('aria-hidden', 'true');
  });

  // Test Case 8: Accessibility - jest-axe
  test('should not have any accessibility violations', async () => {
    const { container } = render(<ErrorDisplay {...fullProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('should not have accessibility violations when only message is provided', async () => {
    const { container } = render(<ErrorDisplay message="Simple error" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('should not have accessibility violations when details are expanded', async () => {
    const { container } = render(<ErrorDisplay message="Error" details="Details" />);
    fireEvent.click(screen.getByText(/show details/i)); // Expand details
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // Test Case 9: Ensure pre tag is used for details
  test('should render details content inside a <pre> tag', () => {
    render(<ErrorDisplay message="Test" details="Line 1\nLine 2" />);
    fireEvent.click(screen.getByText(/show details/i));
    const preElement = screen.getByText('Line 1\nLine 2');
    expect(preElement).toBeInTheDocument();
    expect(preElement.tagName).toBe('PRE');
  });

  // Test Case 10: No details section if details prop is empty string
  test('should not render details section if details prop is an empty string', () => {
    render(<ErrorDisplay message="Error" details="" />);
    expect(screen.queryByText(/show details/i)).not.toBeInTheDocument();
  });

  // Test Case 11: No errorId displayed if errorId prop is empty string
  test('should not display errorId if errorId prop is an empty string', () => {
    render(<ErrorDisplay message="Error" details="Details" errorId="" />);
    fireEvent.click(screen.getByText(/show details/i));
    expect(screen.queryByText(/Error ID:/i)).not.toBeInTheDocument();
  });
});