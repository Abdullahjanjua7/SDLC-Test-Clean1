import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExportButton from './ExportButton';

// Mock CSS modules to ensure class names are rendered as strings
jest.mock('./ExportButton.module.css', () => ({
  button: 'mock-button',
  spinner: 'mock-spinner',
  icon: 'mock-icon',
  text: 'mock-text',
  disabled: 'mock-disabled',
  loadingState: 'mock-loading-state',
}));

// A simple custom icon component for testing purposes
const CustomIcon: React.FC = () => <span data-testid="custom-icon">🚀</span>;

describe('ExportButton', () => {
  // Test 1: Renders with default icon and "Export data" aria-label when no children or aria-label are provided
  it('renders with default icon and "Export data" aria-label when no children or aria-label are provided', () => {
    render(<ExportButton />);
    const button = screen.getByRole('button', { name: 'Export data' });

    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('mock-button');
    expect(screen.getByTestId('default-export-icon')).toBeInTheDocument();
    expect(screen.queryByText('Export')).not.toBeInTheDocument(); // No children text
    expect(button).toHaveAttribute('type', 'button');
    expect(button).not.toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-disabled', 'false');
  });

  // Test 2: Renders with children text
  it('renders with children text', () => {
    render(<ExportButton>Export Data</ExportButton>);
    const button = screen.getByRole('button', { name: 'Export Data' });

    expect(button).toBeInTheDocument();
    expect(screen.getByText('Export Data')).toBeInTheDocument();
    expect(screen.getByText('Export Data')).toHaveClass('mock-text');
    expect(screen.getByTestId('default-export-icon')).toBeInTheDocument(); // Default icon still present
  });

  // Test 3: Renders with a custom icon
  it('renders with a custom icon', () => {
    render(<ExportButton icon={<CustomIcon />} />);
    const button = screen.getByRole('button', { name: 'Export data' });

    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('default-export-icon')).not.toBeInTheDocument();
  });

  // Test 4: Renders with both children and a custom icon
  it('renders with both children and a custom icon', () => {
    render(<ExportButton icon={<CustomIcon />}>Download Report</ExportButton>);
    const button = screen.getByRole('button', { name: 'Download Report' });

    expect(button).toBeInTheDocument();
    expect(screen.getByText('Download Report')).toBeInTheDocument();
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('default-export-icon')).not.toBeInTheDocument();
  });

  // Test 5: Applies additional className prop
  it('applies additional className prop', () => {
    render(<ExportButton className="my-custom-class">Export</ExportButton>);
    const button = screen.getByRole('button', { name: 'Export' });

    expect(button).toHaveClass('mock-button', 'my-custom-class');
  });

  // Test 6: Passes through other standard button attributes
  it('passes through other standard button attributes', () => {
    render(<ExportButton id="export-btn" data-testid="export-button-test" tabIndex={0} />);
    const button = screen.getByTestId('export-button-test');

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('id', 'export-btn');
    expect(button).toHaveAttribute('tabindex', '0');
  });

  // Test 7: Displays a spinner and disables the button when loading is true
  it('displays a spinner and disables the button when loading is true', () => {
    render(<ExportButton loading>Export</ExportButton>);
    const button = screen.getByRole('button', { name: 'Loading data...' });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveClass('mock-button', 'mock-loading-state');
    expect(screen.getByRole('status', { name: 'Loading data...' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Loading data...' })).toHaveClass('mock-spinner');
  });

  // Test 8: Hides children and custom icon when loading is true
  it('hides children and custom icon when loading is true', () => {
    render(
      <ExportButton loading icon={<CustomIcon />}>
        Export
      </ExportButton>
    );
    const button = screen.getByRole('button', { name: 'Loading data...' });

    expect(button).toBeInTheDocument();
    expect(screen.queryByText('Export')).not.toBeInTheDocument();
    expect(screen.queryByTestId('custom-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('default-export-icon')).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Loading data...' })).toBeInTheDocument();
  });

  // Test 9: Disables the button when disabled prop is true
  it('disables the button when disabled prop is true', () => {
    render(<ExportButton disabled>Export</ExportButton>);
    const button = screen.getByRole('button', { name: 'Export' });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveClass('mock-button', 'mock-disabled');
    expect(screen.queryByRole('status')).not.toBeInTheDocument(); // No spinner
  });

  // Test 10: Disables the button when both disabled and loading are true (loading takes precedence visually)
  it('disables the button when both disabled and loading are true', () => {
    render(
      <ExportButton disabled loading>
        Export
      </ExportButton>
    );
    const button = screen.getByRole('button', { name: 'Loading data...' });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    // Both disabled and loadingState classes should be applied, as isDisabled is true and loading is true
    expect(button).toHaveClass('mock-button', 'mock-disabled', 'mock-loading-state');
    expect(screen.getByRole('status', { name: 'Loading data...' })).toBeInTheDocument();
    expect(screen.queryByText('Export')).not.toBeInTheDocument();
  });

  // Test 11: Calls onClick handler when clicked and not disabled/loading
  it('calls onClick handler when clicked and not disabled/loading', () => {
    const handleClick = jest.fn();
    render(<ExportButton onClick={handleClick}>Export</ExportButton>);
    const button = screen.getByRole('button', { name: 'Export' });

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Test 12: Does not call onClick handler when disabled
  it('does not call onClick handler when disabled', () => {
    const handleClick = jest.fn();
    render(
      <ExportButton onClick={handleClick} disabled>
        Export
      </ExportButton>
    );
    const button = screen.getByRole('button', { name: 'Export' });

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  // Test 13: Does not call onClick handler when loading
  it('does not call onClick handler when loading', () => {
    const handleClick = jest.fn();
    render(
      <ExportButton onClick={handleClick} loading>
        Export
      </ExportButton>
    );
    const button = screen.getByRole('button', { name: 'Loading data...' });

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  // Test 14: Uses children text as aria-label fallback
  it('uses children text as aria-label fallback', () => {
    render(<ExportButton>My Custom Export</ExportButton>);
    const button = screen.getByRole('button', { name: 'My Custom Export' });
    expect(button).toBeInTheDocument();
  });

  // Test 15: Uses provided aria-label prop over children text
  it('uses provided aria-label prop over children text', () => {
    render(<ExportButton aria-label="Custom Label">Export Data</ExportButton>);
    const button = screen.getByRole('button', { name: 'Custom Label' });
    expect(button).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export Data' })).not.toBeInTheDocument();
  });

  // Test 16: Ensures type="button" is always set
  it('ensures type="button" is always set', () => {
    render(<ExportButton />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });

  // Test 17: Sets aria-disabled attribute correctly based on disabled and loading states
  it('sets aria-disabled attribute correctly', () => {
    const { rerender } = render(<ExportButton />);
    const button = screen.getByRole('button');

    // Default state
    expect(button).toHaveAttribute('aria-disabled', 'false');

    // When disabled prop is true
    rerender(<ExportButton disabled />);
    expect(button).toHaveAttribute('aria-disabled', 'true');

    // When loading prop is true
    rerender(<ExportButton loading />);
    expect(button).toHaveAttribute('aria-disabled', 'true');

    // When both disabled and loading are true
    rerender(<ExportButton disabled loading />);
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  // Test 18: Renders children that are not strings (e.g., a ReactNode)
  it('renders children that are not strings (e.g., a ReactNode)', () => {
    const NodeChild = () => <span data-testid="node-child">Node Content</span>;
    render(<ExportButton><NodeChild /></ExportButton>);
    const button = screen.getByRole('button', { name: 'Export data' }); // Fallback aria-label
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('node-child')).toBeInTheDocument();
  });

  // Test 19: DefaultExportIcon has correct class
  it('DefaultExportIcon has correct class', () => {
    render(<ExportButton />);
    expect(screen.getByTestId('default-export-icon')).toHaveClass('mock-icon');
  });
});