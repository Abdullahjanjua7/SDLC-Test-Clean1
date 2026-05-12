import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ExportButton from './ExportButton';

// Extend Jest with jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock CSS modules to return class names as strings for easier testing
jest.mock('./ExportButton.module.css', () => ({
  exportButton: 'exportButton',
  loadingState: 'loadingState',
  spinner: 'spinner',
  icon: 'icon',
  buttonText: 'buttonText',
}));

describe('ExportButton', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  // Test Case 1: Renders with default props and content
  test('renders with default "Export Data" text and calls onClick', () => {
    render(<ExportButton onClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: 'Export Data' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Export Data');
    expect(button).toHaveClass('exportButton');
    expect(button).not.toHaveClass('loadingState');
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('type', 'button');
    expect(screen.getByLabelText('Export Data')).toBeInTheDocument(); // Check aria-label
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // SVG icon

    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  // Test Case 2: Renders with custom children (string)
  test('renders with custom string children', () => {
    render(<ExportButton onClick={mockOnClick}>Download Report</ExportButton>);

    const button = screen.getByRole('button', { name: 'Download Report' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Download Report');
    expect(button).toHaveAttribute('aria-label', 'Download Report');

    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  // Test Case 3: Renders with custom children (ReactNode)
  test('renders with custom ReactNode children', () => {
    const CustomIcon = () => <span data-testid="custom-icon">🚀</span>;
    render(
      <ExportButton onClick={mockOnClick}>
        <CustomIcon /> Export Now
      </ExportButton>
    );

    const button = screen.getByRole('button', { name: 'Export Now' });
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(button).toHaveTextContent('Export Now');
    // When children is a ReactNode, default aria-label falls back to 'Export data'
    expect(button).toHaveAttribute('aria-label', 'Export data');

    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  // Test Case 4: Renders in loading state
  test('renders in loading state with spinner and is disabled', () => {
    render(<ExportButton onClick={mockOnClick} loading />);

    const button = screen.getByRole('button', { name: 'Loading...' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('exportButton');
    expect(button).toHaveClass('loadingState');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');

    // Check for spinner
    const spinner = screen.getByRole('status', { name: 'Loading...' });
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('spinner');
    expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument(); // SVG icon should not be present

    fireEvent.click(button);
    expect(mockOnClick).not.toHaveBeenCalled(); // onClick should not be called when loading
  });

  // Test Case 5: Renders in disabled state
  test('renders in disabled state and does not call onClick', () => {
    render(<ExportButton onClick={mockOnClick} disabled />);

    const button = screen.getByRole('button', { name: 'Export Data' });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(button).not.toHaveClass('loadingState'); // Should not have loading class
    expect(button).not.toHaveAttribute('aria-busy'); // Should not be aria-busy

    fireEvent.click(button);
    expect(mockOnClick).not.toHaveBeenCalled(); // onClick should not be called when disabled
  });

  // Test Case 6: Renders when both loading and disabled are true (loading takes precedence for visual/interaction)
  test('renders in loading state when both loading and disabled are true', () => {
    render(<ExportButton onClick={mockOnClick} loading disabled />);

    const button = screen.getByRole('button', { name: 'Loading...' });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(button).toHaveClass('loadingState'); // Loading class should be present
    expect(button).toHaveAttribute('aria-busy', 'true');

    const spinner = screen.getByRole('status', { name: 'Loading...' });
    expect(spinner).toBeInTheDocument();
    expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  // Test Case 7: Applies custom className
  test('applies custom className', () => {
    render(<ExportButton onClick={mockOnClick} className="my-custom-class" />);

    const button = screen.getByRole('button', { name: 'Export Data' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('exportButton');
    expect(button).toHaveClass('my-custom-class');
  });

  // Test Case 8: Applies custom aria-label
  test('applies custom aria-label', () => {
    render(<ExportButton onClick={mockOnClick} aria-label="Initiate Download" />);

    const button = screen.getByRole('button', { name: 'Initiate Download' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Initiate Download');
  });

  // Test Case 9: Passes through other standard button attributes
  test('passes through other standard HTML button attributes', () => {
    render(<ExportButton onClick={mockOnClick} id="export-btn" data-testid="export-button-test" />);

    const button = screen.getByTestId('export-button-test');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('id', 'export-btn');
  });

  // Test Case 10: Accessibility check (default state)
  test('should not have accessibility violations in default state', async () => {
    const { container } = render(<ExportButton onClick={mockOnClick} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // Test Case 11: Accessibility check (loading state)
  test('should not have accessibility violations in loading state', async () => {
    const { container } = render(<ExportButton onClick={mockOnClick} loading />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // Test Case 12: Accessibility check (disabled state)
  test('should not have accessibility violations in disabled state', async () => {
    const { container } = render(<ExportButton onClick={mockOnClick} disabled />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // Test Case 13: SVG icon has aria-hidden="true"
  test('SVG icon has aria-hidden="true" in non-loading state', () => {
    render(<ExportButton onClick={mockOnClick} />);
    const svgIcon = screen.getByRole('img', { hidden: true });
    expect(svgIcon).toBeInTheDocument();
    expect(svgIcon).toHaveAttribute('aria-hidden', 'true');
  });

  // Test Case 14: Button type is explicitly "button"
  test('button has type="button"', () => {
    render(<ExportButton onClick={mockOnClick} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });
});