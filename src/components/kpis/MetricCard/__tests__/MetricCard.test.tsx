import React from 'react';
import { render, screen } from '@testing-library/react';
import MetricCard from './MetricCard';
import '@testing-library/jest-dom';

// Mock CSS Modules to ensure class names are applied as strings
// This is a common setup for Jest with CSS Modules, often handled by identity-obj-proxy.
// If not using identity-obj-proxy, you might need a more explicit mock.
jest.mock('./MetricCard.module.css', () => ({
  metricCard: 'metricCard',
  header: 'header',
  icon: 'icon',
  label: 'label',
  valueContainer: 'valueContainer',
  value: 'value',
  unit: 'unit',
  trendContainer: 'trendContainer',
  trendArrow: 'trendArrow',
  trendValue: 'trendValue',
  trendLabel: 'trendLabel',
  positive: 'positive',
  negative: 'negative',
  neutral: 'neutral',
  loadingState: 'loadingState',
  loadingSpinner: 'loadingSpinner',
  loadingText: 'loadingText',
}));

describe('MetricCard', () => {
  // --- Basic Rendering ---
  test('renders with minimal required props (label and value)', () => {
    render(<MetricCard label="Total Sales" value="1,234" />);

    expect(screen.getByRole('heading', { name: /total sales/i })).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByLabelText(/total sales metric card/i)).toBeInTheDocument();
  });

  // --- Prop Combinations ---

  test('renders with a unit', () => {
    render(<MetricCard label="Revenue" value="500" unit="$" />);
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByLabelText(/revenue metric card\. current value: 500\$/i)).toBeInTheDocument();
  });

  test('renders with an icon and ensures it is aria-hidden', () => {
    const TestIcon = () => <span data-testid="test-icon">📈</span>;
    render(<MetricCard label="Growth" value="100" icon={<TestIcon />} />);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toHaveAttribute('aria-hidden', 'true');
  });

  // --- Trend Scenarios ---

  test('renders a positive trend correctly with arrow, value, label, and class', () => {
    render(
      <MetricCard
        label="New Users"
        value="150"
        trendValue={5.2}
        trendType="positive"
        trendLabel="vs last week"
      />
    );

    expect(screen.getByText('↑')).toBeInTheDocument();
    expect(screen.getByText('5.2%')).toBeInTheDocument();
    expect(screen.getByText('vs last week')).toBeInTheDocument();
    const trendContainer = screen.getByText('5.2%').closest('div');
    expect(trendContainer).toHaveClass('trendContainer');
    expect(trendContainer).toHaveClass('positive');
    expect(screen.getByLabelText(/new users metric card\. current value: 150\. trend: up by 5\.2%\. vs last week/i)).toBeInTheDocument();
  });

  test('renders a negative trend correctly with arrow, absolute value, label, and class', () => {
    render(
      <MetricCard
        label="Bounce Rate"
        value="30"
        unit="%"
        trendValue={-2.1}
        trendType="negative"
        trendLabel="vs last month"
      />
    );

    expect(screen.getByText('↓')).toBeInTheDocument();
    expect(screen.getByText('2.1%')).toBeInTheDocument(); // Math.abs applied
    expect(screen.getByText('vs last month')).toBeInTheDocument();
    const trendContainer = screen.getByText('2.1%').closest('div');
    expect(trendContainer).toHaveClass('trendContainer');
    expect(trendContainer).toHaveClass('negative');
    expect(screen.getByLabelText(/bounce rate metric card\. current value: 30%\. trend: down by 2\.1%\. vs last month/i)).toBeInTheDocument();
  });

  test('renders a neutral trend correctly with arrow, value, label, and class', () => {
    render(
      <MetricCard
        label="Conversion Rate"
        value="5.0"
        unit="%"
        trendValue={0}
        trendType="neutral"
        trendLabel="no change"
      />
    );

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('0.0%')).toBeInTheDocument();
    expect(screen.getByText('no change')).toBeInTheDocument();
    const trendContainer = screen.getByText('0.0%').closest('div');
    expect(trendContainer).toHaveClass('trendContainer');
    expect(trendContainer).toHaveClass('neutral');
    expect(screen.getByLabelText(/conversion rate metric card\. current value: 5\.0%\. trend: no change by 0\.0%\. no change/i)).toBeInTheDocument();
  });

  test('defaults trendType to neutral if not provided but trendValue is present', () => {
    render(<MetricCard label="Default Trend" value="100" trendValue={5} />); // trendType not provided
    const trendContainer = screen.getByText('5.0%').closest('div');
    expect(trendContainer).toHaveClass('trendContainer');
    expect(trendContainer).toHaveClass('neutral'); // Should default to neutral class
  });

  test('does not render trend section if trendValue is undefined', () => {
    render(<MetricCard label="Active Users" value="1000" />);
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    expect(screen.queryByText('↑')).not.toBeInTheDocument();
    expect(screen.queryByText('↓')).not.toBeInTheDocument();
    expect(screen.queryByText('—')).not.toBeInTheDocument();
    expect(screen.queryByText(/vs/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/no change/i)).not.toBeInTheDocument();
  });

  // --- Loading State ---

  test('renders loading state when isLoading is true', () => {
    render(<MetricCard label="Loading Data" value="N/A" isLoading={true} />);

    const loadingState = screen.getByRole('status', { name: 'Loading metric...' });
    expect(loadingState).toBeInTheDocument();
    expect(loadingState).toHaveClass('loadingState');
    expect(screen.getByText('Loading metric...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.queryByRole('heading', { name: /loading data/i })).not.toBeInTheDocument();
    expect(screen.queryByText('N/A')).not.toBeInTheDocument();
  });

  test('does not render loading state when isLoading is false (default)', () => {
    render(<MetricCard label="Loaded Data" value="123" isLoading={false} />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /loaded data/i })).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  // --- Accessibility ---

  test('applies custom ariaLabel when provided', () => {
    render(<MetricCard label="Custom Label" value="99" ariaLabel="Important metric for dashboard" />);
    expect(screen.getByLabelText('Important metric for dashboard')).toBeInTheDocument();
    expect(screen.queryByLabelText(/custom label metric card/i)).not.toBeInTheDocument();
  });

  test('generates default ariaLabel correctly for a simple card', () => {
    render(<MetricCard label="Simple Metric" value="42" />);
    expect(screen.getByLabelText('Simple Metric metric card. Current value: 42.')).toBeInTheDocument();
  });

  test('generates default ariaLabel correctly with unit', () => {
    render(<MetricCard label="Price" value="100" unit="$" />);
    expect(screen.getByLabelText('Price metric card. Current value: 100$.')).toBeInTheDocument();
  });

  test('generates default ariaLabel correctly with positive trend', () => {
    render(
      <MetricCard
        label="Sales"
        value="1000"
        unit="$"
        trendValue={10.5}
        trendLabel="last quarter"
      />
    );
    expect(screen.getByLabelText('Sales metric card. Current value: 1000$. Trend: up by 10.5%. last quarter')).toBeInTheDocument();
  });

  test('generates default ariaLabel correctly with negative trend', () => {
    render(
      <MetricCard
        label="Expenses"
        value="500"
        unit="$"
        trendValue={-5.0}
        trendLabel="last year"
      />
    );
    expect(screen.getByLabelText('Expenses metric card. Current value: 500$. Trend: down by 5.0%. last year')).toBeInTheDocument();
  });

  test('generates default ariaLabel correctly with neutral trend', () => {
    render(
      <MetricCard
        label="Stock Price"
        value="150"
        trendValue={0}
        trendLabel="today"
      />
    );
    expect(screen.getByLabelText('Stock Price metric card. Current value: 150. Trend: no change by 0.0%. today')).toBeInTheDocument();
  });

  test('trend arrow has aria-hidden="true"', () => {
    render(<MetricCard label="Trend" value="10" trendValue={5} />);
    expect(screen.getByText('↑')).toHaveAttribute('aria-hidden', 'true');
  });

  // --- Edge Cases / Specific Logic ---

  test('value prop can be a number', () => {
    render(<MetricCard label="Number Value" value={12345} />);
    expect(screen.getByText('12345')).toBeInTheDocument();
  });

  test('trendValue formatting handles single decimal place correctly', () => {
    render(<MetricCard label="Trend" value="10" trendValue={5.0} />);
    expect(screen.getByText('5.0%')).toBeInTheDocument();
  });

  test('trendValue formatting handles multiple decimal places by rounding to one decimal', () => {
    render(<MetricCard label="Trend" value="10" trendValue={5.123} />);
    expect(screen.getByText('5.1%')).toBeInTheDocument();
    render(<MetricCard label="Trend" value="10" trendValue={5.189} />);
    expect(screen.getByText('5.2%')).toBeInTheDocument();
  });

  test('trendValue formatting handles negative numbers by showing absolute value', () => {
    render(<MetricCard label="Trend" value="10" trendValue={-7.89} />);
    expect(screen.getByText('7.9%')).toBeInTheDocument();
  });

  // --- User Interactions ---
  // This component is purely for display and does not have direct user interactions
  // like clicks or form inputs. If it were clickable, an onClick prop
  // would be tested here.
  test('MetricCard is a display component and has no user interactions to test', () => {
    // This test serves as documentation that interaction tests are not applicable.
    const { container } = render(<MetricCard label="Display" value="Only" />);
    expect(container).toBeInTheDocument(); // Just to ensure it renders without errors
  });
});