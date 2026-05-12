import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExportButton } from './ExportButton';
import styles from './ExportButton.module.css'; // Import styles to check class names

// Mock the CSS module to ensure class names are predictable strings for testing
// This is often not strictly necessary if you just check for the presence of the class,
// but can be useful if you need to assert specific generated class names.
jest.mock('./ExportButton.module.css', () => ({
  exportButton: 'mock-export-button',
  icon: 'mock-icon',
  label: 'mock-label',
}));

describe('ExportButton', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear(); // Clear mock calls before each test
  });

  // Test 1: Renders with default props and checks basic structure
  test('renders the button with default aria-label and icon', () => {
    render(<ExportButton onClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: 'Export data' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass(styles.exportButton);
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('aria-label', 'Export data');
    expect(button).toHaveAttribute('aria-disabled', 'false');

    const icon = button.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass(styles.icon);
    expect(icon).toHaveAttribute('aria-hidden', 'true');

    // Ensure no children span is rendered by default
    expect(button.querySelector(`.${styles.label}`)).not.toBeInTheDocument();
  });

  // Test 2: Renders with children (text)
  test('renders with children text', () => {
    render(<ExportButton onClick={mockOnClick}>Export Now</ExportButton>);

    const button = screen.getByRole('button', { name: 'Export Now' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Export Now');

    const labelSpan = button.querySelector(`.${styles.label}`);
    expect(labelSpan).toBeInTheDocument();
    expect(labelSpan).toHaveTextContent('Export Now');
  });

  // Test 3: Renders with custom ariaLabel
  test('renders with a custom ariaLabel', () => {
    render(<ExportButton onClick={mockOnClick} ariaLabel="Download Report" />);

    const button = screen.getByRole('button', { name: 'Download Report' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Download Report');
  });

  // Test 4: Renders with children and custom ariaLabel
  test('renders with children and a custom ariaLabel', () => {
    render(
      <ExportButton onClick={mockOnClick} ariaLabel="Download Report">
        Download
      </ExportButton>
    );

    // The accessible name should prioritize children if present, but aria-label is also set
    const button = screen.getByRole('button', { name: 'Download' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Download');
    expect(button).toHaveAttribute('aria-label', 'Download Report'); // aria-label is still set
  });

  // Test 5: Renders when disabled
  test('renders the button in a disabled state', () => {
    render(<ExportButton onClick={mockOnClick} disabled />);

    const button = screen.getByRole('button', { name: 'Export data' });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  // Test 6: Renders with an additional className
  test('applies an additional className', () => {
    const customClass = 'my-custom-class';
    render(<ExportButton onClick={mockOnClick} className={customClass} />);

    const button = screen.getByRole('button', { name: 'Export data' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass(styles.exportButton);
    expect(button).toHaveClass(customClass);
  });

  // Test 7: Renders with other standard button attributes
  test('applies other standard button attributes', () => {
    render(<ExportButton onClick={mockOnClick} id="export-btn" data-testid="export-button-test" />);

    const button = screen.getByTestId('export-button-test');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('id', 'export-btn');
  });

  // Test 8: onClick callback is called when the button is clicked
  test('calls onClick when the button is clicked', () => {
    render(<ExportButton onClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: 'Export data' });
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  // Test 9: onClick callback is NOT called when the button is clicked and disabled
  test('does not call onClick when the button is clicked and disabled', () => {
    render(<ExportButton onClick={mockOnClick} disabled />);

    const button = screen.getByRole('button', { name: 'Export data' });
    fireEvent.click(button);

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  // Test 10: Accessibility - checks accessible name with children
  test('has the correct accessible name when children are present', () => {
    render(<ExportButton onClick={mockOnClick}>Download File</ExportButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveAccessibleName('Download File');
  });

  // Test 11: Accessibility - checks accessible name with only ariaLabel
  test('has the correct accessible name when only ariaLabel is present', () => {
    render(<ExportButton onClick={mockOnClick} ariaLabel="Download File" />);
    const button = screen.getByRole('button');
    expect(button).toHaveAccessibleName('Download File');
  });

  // Test 12: Accessibility - checks accessible name priority (children over ariaLabel)
  test('prioritizes children for accessible name over ariaLabel if both are present', () => {
    render(
      <ExportButton onClick={mockOnClick} ariaLabel="Download File">
        Export Data
      </ExportButton>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAccessibleName('Export Data');
  });

  // Test 13: Icon always present
  test('the ExportIcon is always rendered', () => {
    const { rerender } = render(<ExportButton onClick={mockOnClick} />);
    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();

    rerender(<ExportButton onClick={mockOnClick} children="Test" />);
    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();

    rerender(<ExportButton onClick={mockOnClick} disabled />);
    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
  });
});