import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChartWrapper from './ChartWrapper';

// Mock CSS modules to prevent issues with undefined styles during testing
// In a real project, this is typically handled by Jest's moduleNameMapper in jest.config.js
// For a standalone test file, we can mock it like this:
jest.mock('./ChartWrapper.module.css', () => ({
  chartWrapper: 'mock-chart-wrapper',
  header: 'mock-header',
  content: 'mock-content',
  overlay: 'mock-overlay',
  loadingSpinner: 'mock-loading-spinner',
  message: 'mock-message',
  errorMessage: 'mock-error-message',
}));

describe('ChartWrapper', () => {
  // A simple child component to ensure content is rendered
  const TestChild = () => <div data-testid="chart-content">My Chart Content</div>;

  // Test 1: Basic Rendering
  test('renders children correctly without title, loading, or error states', () => {
    render(<ChartWrapper><TestChild /></ChartWrapper>);

    // Assert that the child component is present
    expect(screen.getByTestId('chart-content')).toBeInTheDocument();

    // Assert that title, loading, and error elements are NOT present
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument(); // Loading overlay
    expect(screen.queryByRole('alert')).not.toBeInTheDocument(); // Error overlay

    // Assert default aria-label
    expect(screen.getByLabelText('Chart container')).toBeInTheDocument();
    // Assert default aria-live
    expect(screen.getByLabelText('Chart container')).toHaveAttribute('aria-live', 'off');
  });

  // Test 2: Title Prop
  test('renders the title when the title prop is provided', () => {
    const titleText = 'Sales Performance';
    render(<ChartWrapper title={titleText}><TestChild /></ChartWrapper>);

    // Assert that the title heading is present and has the correct text
    const titleElement = screen.getByRole('heading', { level: 2, name: titleText });
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveTextContent(titleText);

    // Assert that the aria-label is derived from the title
    expect(screen.getByLabelText(`${titleText} chart container`)).toBeInTheDocument();
  });

  // Test 3: Loading State (`isLoading`)
  test('displays loading overlay when isLoading is true', () => {
    render(<ChartWrapper isLoading><TestChild /></ChartWrapper>);

    // Assert that the loading overlay is present with correct ARIA attributes
    const loadingOverlay = screen.getByRole('status', { name: 'Loading chart data' });
    expect(loadingOverlay).toBeInTheDocument();
    expect(loadingOverlay).toHaveAttribute('aria-live', 'polite');

    // Assert that the loading message is displayed
    expect(screen.getByText('Loading chart...')).toBeInTheDocument();

    // Assert that the error overlay is NOT present
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // Assert that the main wrapper's aria-live is polite
    expect(screen.getByLabelText('Chart container')).toHaveAttribute('aria-live', 'polite');
  });

  // Test 4: Error State (`isError`)
  test('displays default error overlay when isError is true', () => {
    render(<ChartWrapper isError><TestChild /></ChartWrapper>);

    // Assert that the error overlay is present with correct ARIA attributes
    const errorOverlay = screen.getByRole('alert', { name: 'Chart data error' });
    expect(errorOverlay).toBeInTheDocument();
    expect(errorOverlay).toHaveAttribute('aria-live', 'polite');

    // Assert that the default error message is displayed
    expect(screen.getByText('Failed to load chart data.')).toBeInTheDocument();

    // Assert that the loading overlay is NOT present
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    // Assert that the main wrapper's aria-live is polite
    expect(screen.getByLabelText('Chart container')).toHaveAttribute('aria-live', 'polite');
  });

  test('displays custom error message when isError is true and errorMessage is provided', () => {
    const customErrorMessage = 'Data could not be fetched due to server issues.';
    render(<ChartWrapper isError errorMessage={customErrorMessage}><TestChild /></ChartWrapper>);

    // Assert that the custom error message is displayed
    expect(screen.getByText(customErrorMessage)).toBeInTheDocument();
    expect(screen.queryByText('Failed to load chart data.')).not.toBeInTheDocument();
  });

  // Test 5: Height/MinHeight Props
  test('applies height and minHeight styles correctly when provided as numbers', () => {
    render(<ChartWrapper height={400} minHeight={200}><TestChild /></ChartWrapper>);

    const wrapper = screen.getByLabelText('Chart container');
    expect(wrapper).toHaveStyle('height: 400px');
    expect(wrapper).toHaveStyle('min-height: 200px');
  });

  test('applies height and minHeight styles correctly when provided as strings', () => {
    render(<ChartWrapper height="60vh" minHeight="250px"><TestChild /></ChartWrapper>);

    const wrapper = screen.getByLabelText('Chart container');
    expect(wrapper).toHaveStyle('height: 60vh');
    expect(wrapper).toHaveStyle('min-height: 250px');
  });

  // Test 6: ClassName Prop
  test('applies custom className along with default CSS module class', () => {
    const customClass = 'my-custom-chart-style';
    render(<ChartWrapper className={customClass}><TestChild /></ChartWrapper>);

    const wrapper = screen.getByLabelText('Chart container');
    // Assert that both the mocked CSS module class and the custom class are applied
    expect(wrapper).toHaveClass('mock-chart-wrapper');
    expect(wrapper).toHaveClass(customClass);
  });

  test('handles undefined or null className gracefully', () => {
    const { rerender } = render(<ChartWrapper className={undefined}><TestChild /></ChartWrapper>);
    expect(screen.getByLabelText('Chart container')).toHaveClass('mock-chart-wrapper');
    expect(screen.getByLabelText('Chart container')).not.toHaveClass('undefined');

    rerender(<ChartWrapper className={null}><TestChild /></ChartWrapper>);
    expect(screen.getByLabelText('Chart container')).toHaveClass('mock-chart-wrapper');
    expect(screen.getByLabelText('Chart container')).not.toHaveClass('null');
  });

  // Test 7: AriaLabel Prop
  test('applies custom ariaLabel when provided, overriding default behavior', () => {
    const customAriaLabel = 'Detailed financial chart for Q3';
    render(<ChartWrapper title="Financial Data" ariaLabel={customAriaLabel}><TestChild /></ChartWrapper>);

    // Assert that the custom aria-label is used
    expect(screen.getByLabelText(customAriaLabel)).toBeInTheDocument();
    // Assert that the title-derived aria-label is NOT used
    expect(screen.queryByLabelText('Financial Data chart container')).not.toBeInTheDocument();
  });

  test('derives aria-label from title if ariaLabel is not provided', () => {
    const titleText = 'User Engagement';
    render(<ChartWrapper title={titleText}><TestChild /></ChartWrapper>);

    // Assert that aria-label is correctly derived from the title
    expect(screen.getByLabelText(`${titleText} chart container`)).toBeInTheDocument();
  });

  test('uses default "Chart container" aria-label if neither ariaLabel nor title are provided', () => {
    render(<ChartWrapper><TestChild /></ChartWrapper>);

    // Assert that the fallback default aria-label is used
    expect(screen.getByLabelText('Chart container')).toBeInTheDocument();
  });

  // Test 8: Combined States (isLoading and isError)
  test('renders both loading and error overlays if both isLoading and isError are true', () => {
    // Note: In a typical UI, loading and error states are mutually exclusive.
    // However, the current component's implementation renders both as siblings if both props are true.
    render(<ChartWrapper isLoading isError><TestChild /></ChartWrapper>);

    // Assert that both overlays are present
    expect(screen.getByRole('status', { name: 'Loading chart data' })).toBeInTheDocument();
    expect(screen.getByRole('alert', { name: 'Chart data error' })).toBeInTheDocument();

    // Assert that the main wrapper's aria-live is polite
    expect(screen.getByLabelText('Chart container')).toHaveAttribute('aria-live', 'polite');
  });

  // Test 9: Accessibility (further checks)
  test('main wrapper has correct aria-live attribute based on loading/error state', () => {
    const { rerender } = render(<ChartWrapper><TestChild /></ChartWrapper>);
    const wrapper = screen.getByLabelText('Chart container');

    // Initially off
    expect(wrapper).toHaveAttribute('aria-live', 'off');

    // Becomes polite when loading
    rerender(<ChartWrapper isLoading><TestChild /></ChartWrapper>);
    expect(wrapper).toHaveAttribute('aria-live', 'polite');

    // Becomes polite when error
    rerender(<ChartWrapper isError><TestChild /></ChartWrapper>);
    expect(wrapper).toHaveAttribute('aria-live', 'polite');

    // Stays polite when both
    rerender(<ChartWrapper isLoading isError><TestChild /></ChartWrapper>);
    expect(wrapper).toHaveAttribute('aria-live', 'polite');

    // Returns to off when neither
    rerender(<ChartWrapper><TestChild /></ChartWrapper>);
    expect(wrapper).toHaveAttribute('aria-live', 'off');
  });

  // Test 10: CSS Module Class Application (using the mock)
  test('applies default CSS module class to the main section wrapper', () => {
    render(<ChartWrapper><TestChild /></ChartWrapper>);
    const wrapper = screen.getByLabelText('Chart container');
    expect(wrapper).toHaveClass('mock-chart-wrapper');
  });

  test('applies CSS module class to the header when title is present', () => {
    render(<ChartWrapper title="Test Title"><TestChild /></ChartWrapper>);
    const header = screen.getByRole('heading', { level: 2, name: 'Test Title' });
    expect(header).toHaveClass('mock-header');
  });

  test('applies CSS module class to the content div', () => {
    render(<ChartWrapper><TestChild /></ChartWrapper>);
    // The content div is the parent of TestChild
    const contentDiv = screen.getByTestId('chart-content').parentElement;
    expect(contentDiv).toHaveClass('mock-content');
  });

  test('applies CSS module classes to loading overlay elements', () => {
    render(<ChartWrapper isLoading><TestChild /></ChartWrapper>);
    const loadingOverlay = screen.getByRole('status');
    expect(loadingOverlay).toHaveClass('mock-overlay');
    expect(loadingOverlay.querySelector('.mock-loading-spinner')).toBeInTheDocument();
    expect(loadingOverlay.querySelector('.mock-message')).toBeInTheDocument();
  });

  test('applies CSS module classes to error overlay elements', () => {
    render(<ChartWrapper isError><TestChild /></ChartWrapper>);
    const errorOverlay = screen.getByRole('alert');
    expect(errorOverlay).toHaveClass('mock-overlay');
    expect(errorOverlay.querySelector('.mock-error-message')).toBeInTheDocument();
  });
});