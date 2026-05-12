import React from 'react';
import { render, screen } from '@testing-library/react';
import MetricCard from './MetricCard';
import '@testing-library/jest-dom';

// Mock React.useId to ensure consistent IDs for snapshots and specific attribute checks
// This is generally not needed for RTL, but can help with deterministic snapshots if IDs are part of them.
// For this component, the IDs are internal and linked via ARIA attributes, so their exact value isn't critical,
// but mocking can make tests more robust against React's internal useId changes.
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useId: jest.fn(() => 'mock-id'),
}));

describe('MetricCard', () => {
  // Reset useId mock before each test to ensure fresh IDs if needed
  beforeEach(() => {
    (React.useId as jest.Mock).mockClear();
    (React.useId as jest.Mock).mockImplementation(() => 'mock-id');
  });

  // Test Case 1: Renders with minimal required props (title, value)
  test('renders with title and value', () => {
    render(<MetricCard title="Total Sales" value="1,234" />);

    expect(screen.getByRole('heading', { level: 3, name: 'Total Sales' })).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByLabelText('Metric card displaying Total Sales')).toBeInTheDocument();
    expect(screen.getByLabelText('1,234')).toBeInTheDocument(); // aria-label for value
    expect(screen.getByRole('region', { name: 'Metric card displaying Total Sales' })).toBeInTheDocument();
  });

  // Test Case 2: Renders value as a number
  test('renders value when it is a number', () => {
    render(<MetricCard title="Users Online" value={500} />);
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByLabelText('500')).toBeInTheDocument();
  });

  // Test Case 3: Renders with unit
  test('renders with unit', () => {
    render(<MetricCard title="Revenue" value="1000" unit="$" />);
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByLabelText('1000 $')).toBeInTheDocument(); // aria-label for value + unit
  });

  // Test Case 4: Renders with description
  test('renders with description', () => {
    const descriptionText = 'This is a detailed description.';
    render(<MetricCard title="Visitors" value="5000" description={descriptionText} />);

    expect(screen.getByText(descriptionText)).toBeInTheDocument();
    expect(screen.getByRole('paragraph', { name: descriptionText })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Metric card displaying Visitors' })).toHaveAttribute('aria-describedby', expect.stringContaining('metric-card-description-mock-id'));
  });

  // Test Case 5: Renders with icon
  test('renders with icon', () => {
    const TestIcon = <svg data-testid="test-icon" />;
    render(<MetricCard title="Items" value="10" icon={TestIcon} />);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByTestId('test-icon').parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  // Test Case 6: Renders with 'up' trend
  test('renders with "up" trend and trendValue', () => {
    render(<MetricCard title="Growth" value="10%" trend="up" trendValue="+2%" />);

    expect(screen.getByText('+2%')).toBeInTheDocument();
    expect(screen.getByText('▲')).toBeInTheDocument();
    expect(screen.getByLabelText('Trend: +2%, direction up')).toBeInTheDocument();
    expect(screen.getByText('▲').parentElement).toHaveClass('trendUp'); // Check for specific class
  });

  // Test Case 7: Renders with 'down' trend
  test('renders with "down" trend and trendValue', () => {
    render(<MetricCard title="Decline" value="5%" trend="down" trendValue="-1%" />);

    expect(screen.getByText('-1%')).toBeInTheDocument();
    expect(screen.getByText('▼')).toBeInTheDocument();
    expect(screen.getByLabelText('Trend: -1%, direction down')).toBeInTheDocument();
    expect(screen.getByText('▼').parentElement).toHaveClass('trendDown'); // Check for specific class
  });

  // Test Case 8: Renders with 'neutral' trend
  test('renders with "neutral" trend and trendValue', () => {
    render(<MetricCard title="Stable" value="0%" trend="neutral" trendValue="0%" />);

    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByLabelText('Trend: 0%, direction neutral')).toBeInTheDocument();
    expect(screen.getByText('—').parentElement).toHaveClass('trendNeutral'); // Check for specific class
  });

  // Test Case 9: Does not render trend elements if trendValue is missing
  test('does not render trend elements if trendValue is missing', () => {
    render(<MetricCard title="Growth" value="10%" trend="up" />);

    expect(screen.queryByText('+2%')).not.toBeInTheDocument();
    expect(screen.queryByText('▲')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Trend:/)).not.toBeInTheDocument();
  });

  // Test Case 10: Renders loading skeleton when isLoading is true
  test('renders loading skeleton when isLoading is true', () => {
    render(<MetricCard title="Loading Data" value="" isLoading={true} />);

    expect(screen.getByRole('status', { name: 'Loading Loading Data metric card' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');

    // Check for skeleton elements (using class names as indicators)
    const cardElement = screen.getByRole('status');
    expect(cardElement).toHaveClass('loading');
    expect(cardElement.querySelector('.skeletonTitle')).toBeInTheDocument();
    expect(cardElement.querySelector('.skeletonValue')).toBeInTheDocument();
    expect(cardElement.querySelector('.skeletonDescription')).toBeInTheDocument();

    // Ensure actual content is not rendered
    expect(screen.queryByText('Loading Data')).not.toBeInTheDocument();
  });

  // Test Case 11: Renders loading skeleton with icon placeholder
  test('renders loading skeleton with icon placeholder when icon prop is present', () => {
    const TestIcon = <svg data-testid="test-icon" />;
    render(<MetricCard title="Loading Data" value="" isLoading={true} icon={TestIcon} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('status').querySelector('.skeletonCircle')).toBeInTheDocument();
    expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument(); // Actual icon should not be rendered
  });

  // Test Case 12: Accessibility - ARIA attributes and semantic elements
  test('has correct ARIA attributes and semantic elements', () => {
    const TestIcon = <span data-testid="icon">📈</span>;
    render(
      <MetricCard
        title="Performance"
        value="95"
        unit="%"
        description="Overall system performance."
        icon={TestIcon}
        trend="up"
        trendValue="+5%"
      />
    );

    const card = screen.getByRole('region', { name: 'Metric card displaying Performance' });
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('aria-labelledby', expect.stringContaining('metric-card-title-mock-id'));
    expect(card).toHaveAttribute('aria-describedby', expect.stringContaining('metric-card-description-mock-id'));

    const title = screen.getByRole('heading', { level: 3, name: 'Performance' });
    expect(title).toHaveAttribute('id', expect.stringContaining('metric-card-title-mock-id'));

    const value = screen.getByLabelText('95 %');
    expect(value).toHaveAttribute('id', expect.stringContaining('metric-card-value-mock-id'));

    const description = screen.getByRole('paragraph', { name: 'Overall system performance.' });
    expect(description).toHaveAttribute('id', expect.stringContaining('metric-card-description-mock-id'));

    const iconSpan = screen.getByTestId('icon').parentElement;
    expect(iconSpan).toHaveAttribute('aria-hidden', 'true');

    const unitSpan = screen.getByText('%');
    expect(unitSpan).toHaveAttribute('aria-hidden', 'true');

    const trendIndicator = screen.getByText('▲');
    expect(trendIndicator).toHaveAttribute('aria-hidden', 'true');
  });

  // Test Case 13: Footer is not rendered if no description or trend
  test('footer is not rendered if no description or trend is provided', () => {
    render(<MetricCard title="Simple Card" value="100" />);
    expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Trend:/)).not.toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument(); // Assuming footer might get this role
    // More directly, check for the footer div's class
    const card = screen.getByRole('region');
    expect(card.querySelector('.footer')).not.toBeInTheDocument();
  });

  // Test Case 14: Footer is rendered if only description is present
  test('footer is rendered if only description is present', () => {
    render(<MetricCard title="Simple Card" value="100" description="Some text" />);
    expect(screen.getByText('Some text')).toBeInTheDocument();
    const card = screen.getByRole('region');
    expect(card.querySelector('.footer')).toBeInTheDocument();
  });

  // Test Case 15: Footer is rendered if only trend is present
  test('footer is rendered if only trend is present', () => {
    render(<MetricCard title="Simple Card" value="100" trend="up" trendValue="+10%" />);
    expect(screen.getByText('+10%')).toBeInTheDocument();
    const card = screen.getByRole('region');
    expect(card.querySelector('.footer')).toBeInTheDocument();
  });

  // Test Case 16: Snapshot test for a full card (non-loading)
  test('matches snapshot for a full card', () => {
    const { asFragment } = render(
      <MetricCard
        title="Monthly Active Users"
        value="1,234,567"
        unit="users"
        description="Total unique users interacting with the platform."
        icon={<span className="fa fa-users" />}
        trend="up"
        trendValue="+1.5%"
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  // Test Case 17: Snapshot test for loading state
  test('matches snapshot for loading state', () => {
    const { asFragment } = render(
      <MetricCard
        title="Monthly Active Users"
        value=""
        unit="users"
        description="Total unique users interacting with the platform."
        icon={<span className="fa fa-users" />}
        isLoading={true}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});