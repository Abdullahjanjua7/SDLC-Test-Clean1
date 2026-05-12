// src/components/ExportButton/ExportButton.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExportButton from './ExportButton';

// Mock CSS modules to ensure consistent class names for testing
jest.mock('./ExportButton.module.css', () => ({
  button: 'mock-button',
  disabled: 'mock-disabled',
  spinner: 'mock-spinner',
  icon: 'mock-icon',
  label: 'mock-label',
}));

describe('ExportButton', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    // Clear mock calls before each test
    mockOnClick.mockClear();
  });

  // Test Case 1: Renders with default "Export" text and icon
  test('renders with default "Export" text and icon when no children are provided', () => {
    render(<ExportButton onClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: 'Export data' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Export');

    // Check for the presence of the icon (aria-hidden=true)
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toBeInTheDocument();

    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('mock-button');
    expect(button).not.toHaveClass('mock-disabled');
    expect(button).toHaveAttribute('aria-label', 'Export data');
    expect(button).toHaveAttribute('aria-busy', 'false');
  });

  // Test Case 2: Renders with custom children
  test('renders with custom children text', () => {
    render(<ExportButton onClick={mockOnClick}>Download Report</ExportButton>);

    const button = screen.getByRole('button', { name: 'Download Report' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Download Report');
    expect(button).not.toHaveTextContent('Export'); // Should not have default text
  });

  // Test Case 3: Calls onClick handler when clicked
  test('calls the onClick handler when the button is clicked', () => {
    render(<ExportButton onClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: 'Export data' });
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  // Test Case 4: Displays loading state correctly
  test('displays loading spinner and is disabled when loading prop is true', () => {
    render(<ExportButton onClick={mockOnClick} loading={true} />);

    const button = screen.getByRole('button', { name: 'Exporting data, please wait' });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(button).toHaveClass('mock-disabled');
    expect(button).toHaveAttribute('aria-label', 'Exporting data, please wait');
    expect(button).toHaveAttribute('aria-busy', 'true');

    // Check for spinner presence
    const spinner = screen.getByRole('status', { name: 'Loading' });
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('mock-spinner');

    // Ensure default text/children and icon are not visible
    expect(button).not.toHaveTextContent('Export');
    expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();

    // Clicking while loading should not trigger onClick
    fireEvent.click(button);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  // Test Case 5: Is disabled when disabled prop is true
  test('is disabled when the disabled prop is true', () => {
    render(<ExportButton onClick={mockOnClick} disabled={true} />);

    const button = screen.getByRole('button', { name: 'Export data' });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(button).toHaveClass('mock-disabled');
    expect(button).toHaveAttribute('aria-label', 'Export data');
    expect(button).toHaveAttribute('aria-busy', 'false'); // Not busy if just disabled, not loading

    // Ensure icon and text are still visible
    expect(button).toHaveTextContent('Export');
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();

    // Clicking a disabled button should not trigger onClick
    fireEvent.click(button);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  // Test Case 6: Is disabled when both loading and disabled props are true
  test('is disabled and shows spinner when both loading and disabled props are true', () => {
    render(<ExportButton onClick={mockOnClick} loading={true} disabled={true} />);

    const button = screen.getByRole('button', { name: 'Exporting data, please wait' });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(button).toHaveClass('mock-disabled');
    expect(button).toHaveAttribute('aria-label', 'Exporting data, please wait');
    expect(button).toHaveAttribute('aria-busy', 'true');

    // Check for spinner presence
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument(); // Icon should not be present

    fireEvent.click(button);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  // Test Case 7: Applies custom className
  test('applies additional CSS class names', () => {
    render(<ExportButton onClick={mockOnClick} className="my-custom-class" />);

    const button = screen.getByRole('button', { name: 'Export data' });
    expect(button).toHaveClass('mock-button');
    expect(button).toHaveClass('my-custom-class');
  });

  // Test Case 8: Passes through additional standard button attributes
  test('passes through additional standard HTML button attributes', () => {
    render(
      <ExportButton
        onClick={mockOnClick}
        data-testid="export-button-test"
        id="unique-export-button"
        title="Click to export"
      />
    );

    const button = screen.getByTestId('export-button-test');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('id', 'unique-export-button');
    expect(button).toHaveAttribute('title', 'Click to export');
  });

  // Test Case 9: Accessibility - SVG icon has aria-hidden
  test('SVG icon has aria-hidden="true" for accessibility', () => {
    render(<ExportButton onClick={mockOnClick} />);
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  // Test Case 10: Accessibility - Spinner has role="status" and aria-label
  test('spinner has role="status" and aria-label for accessibility', () => {
    render(<ExportButton onClick={mockOnClick} loading={true} />);
    const spinner = screen.getByRole('status', { name: 'Loading' });
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  // Test Case 11: Button type is explicitly "button"
  test('button has type="button" to prevent accidental form submission', () => {
    render(<ExportButton onClick={mockOnClick} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });

  // Test Case 12: Ensures no children and not loading still shows default text
  test('shows default "Export" text when not loading and no children are provided', () => {
    render(<ExportButton onClick={mockOnClick} />);
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument(); // No spinner
  });
});