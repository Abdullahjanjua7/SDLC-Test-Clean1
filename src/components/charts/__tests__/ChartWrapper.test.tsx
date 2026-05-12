import React from 'react';
import { render, screen } from '@testing-library/react';
import ChartWrapper from './ChartWrapper';
import '@testing-library/jest-dom';

// Mock React.useId to ensure consistent IDs in tests for aria-labelledby
// This provides a predictable ID like 'test-id' for assertions.
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useId: jest.fn(() => 'test-id'),
}));

// Mock CSS Modules to prevent Jest from failing on import and to allow
// testing class names applied from the module.
jest.mock('./ChartWrapper.module.css', () => ({
  chartWrapper: 'chartWrapper',
  title: 'title',
  content: 'content',
  stateMessage: 'stateMessage',
  spinner: 'spinner',
  errorMessage: 'errorMessage',
}));

describe('ChartWrapper', () => {
  // A simple test component to represent the children passed to ChartWrapper
  const TestChildComponent = () => <div data-testid="chart-content">Chart Content</div>;

  // Test Case 1: Renders children correctly when no special state is active
  test('renders children when not loading and no error', () => {
    render(<ChartWrapper><TestChildComponent /></ChartWrapper>);

    expect(screen.getByTestId('chart-content')).toBeInTheDocument();
    expect(screen.queryByText('Loading chart data...')).not.toBeInTheDocument();
    expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
  });

  // Test Case 2: Displays loading state when isLoading is true
  test('displays loading state when isLoading is true', () => {
    render(<ChartWrapper isLoading><TestChildComponent /></ChartWrapper>);

    expect(screen.getByText('Loading chart data...')).toBeInTheDocument();
    // Check for the spinner with its accessibility attributes
    expect(screen.getByRole('status', { name: 'Loading chart data' })).toBeInTheDocument();
    // Ensure children are not rendered
    expect(screen.queryByTestId('chart-content')).not.toBeInTheDocument();
    expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();

    // Check aria-live attribute on the loading message container
    const loadingMessageContainer = screen.getByText('Loading chart data...').closest('div');
    expect(loadingMessageContainer).toHaveAttribute('aria-live', 'polite');
  });

  // Test Case 3: Displays default error message when isError is true
  test('displays default error message when isError is true', () => {
    render(<ChartWrapper isError><TestChildComponent /></ChartWrapper>);

    expect(screen.getByText('Error: An unexpected error occurred.')).toBeInTheDocument();
    // Ensure children are not rendered
    expect(screen.queryByTestId('chart-content')).not.toBeInTheDocument();
    expect(screen.queryByText('Loading chart data...')).not.toBeInTheDocument();

    // Check accessibility attributes for the error message container
    const errorMessageContainer = screen.getByText('Error: An unexpected error occurred.').closest('div');
    expect(errorMessageContainer).toHaveAttribute('aria-live', 'assertive');
    expect(errorMessageContainer).toHaveAttribute('role', 'alert');
  });

  // Test Case 4: Displays custom error message when isError and errorMessage are true
  test('displays custom error message when isError and errorMessage are true', () => {
    const customErrorMessage = 'Failed to retrieve chart data.';
    render(<ChartWrapper isError errorMessage={customErrorMessage}><TestChildComponent /></ChartWrapper>);

    expect(screen.getByText(`Error: ${customErrorMessage}`)).toBeInTheDocument();
    expect(screen.queryByTestId('chart-content')).not.toBeInTheDocument();
  });

  // Test Case 5: Renders title when provided
  test('renders title when provided', () => {
    const chartTitle = 'My Dashboard Chart';
    render(<ChartWrapper title={chartTitle}><TestChildComponent /></ChartWrapper>);

    const titleElement = screen.getByRole('heading', { level: 2, name: chartTitle });
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveTextContent(chartTitle);

    // Verify accessibility: the section should be linked to the title
    const section = screen.getByRole('region', { name: chartTitle });
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('aria-labelledby', `chart-wrapper-title-test-id`);
    expect(titleElement).toHaveAttribute('id', `chart-wrapper-title-test-id`);
  });

  // Test Case 6: Does not render title when not provided
  test('does not render title when not provided', () => {
    render(<ChartWrapper><TestChildComponent /></ChartWrapper>);

    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
    // Ensure the region does not have aria-labelledby if no title
    expect(screen.getByRole('region')).not.toHaveAttribute('aria-labelledby');
  });

  // Test Case 7: Applies custom className to the root element
  test('applies custom className to the root element', () => {
    const customClass = 'extra-styling-for-chart';
    render(<ChartWrapper className={customClass}><TestChildComponent /></ChartWrapper>);

    const section = screen.getByRole('region');
    // Check for the module class and the custom class
    expect(section).toHaveClass('chartWrapper'); // From ChartWrapper.module.css mock
    expect(section).toHaveClass(customClass);
  });

  // Test Case 8: Accessibility - root element has correct role and aria-labelledby (if title exists)
  test('root element has correct accessibility attributes', () => {
    const chartTitle = 'Accessible Chart';
    render(<ChartWrapper title={chartTitle}><TestChildComponent /></ChartWrapper>);

    const section = screen.getByRole('region', { name: chartTitle });
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('role', 'region');
    expect(section).toHaveAttribute('aria-labelledby', 'chart-wrapper-title-test-id');
  });

  // Test Case 9: Priority - isLoading takes precedence over isError
  test('isLoading takes precedence over isError when both are true', () => {
    render(<ChartWrapper isLoading isError errorMessage="This error should not be visible"><TestChildComponent /></ChartWrapper>);

    expect(screen.getByText('Loading chart data...')).toBeInTheDocument();
    expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
    expect(screen.queryByTestId('chart-content')).not.toBeInTheDocument();
  });

  // Test Case 10: Combines title with loading state
  test('renders title along with loading state', () => {
    const chartTitle = 'Loading Data Chart';
    render(<ChartWrapper title={chartTitle} isLoading><TestChildComponent /></ChartWrapper>);

    expect(screen.getByRole('heading', { level: 2, name: chartTitle })).toBeInTheDocument();
    expect(screen.getByText('Loading chart data...')).toBeInTheDocument();
    expect(screen.queryByTestId('chart-content')).not.toBeInTheDocument();
  });

  // Test Case 11: Combines title with error state
  test('renders title along with error state', () => {
    const chartTitle = 'Failed Data Chart';
    const customErrorMessage = 'Data could not be loaded.';
    render(<ChartWrapper title={chartTitle} isError errorMessage={customErrorMessage}><TestChildComponent /></ChartWrapper>);

    expect(screen.getByRole('heading', { level: 2, name: chartTitle })).toBeInTheDocument();
    expect(screen.getByText(`Error: ${customErrorMessage}`)).toBeInTheDocument();
    expect(screen.queryByTestId('chart-content')).not.toBeInTheDocument();
  });

  // Test Case 12: No props (default behavior)
  test('renders children and no title, loading, or error messages when no props are provided', () => {
    render(<ChartWrapper><TestChildComponent /></ChartWrapper>);

    expect(screen.getByTestId('chart-content')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
    expect(screen.queryByText('Loading chart data...')).not.toBeInTheDocument();
    expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
  });
});