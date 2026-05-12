import React from 'react';
import { render, screen } from '@testing-library/react';
import KPICard from './KPICard';
import styles from './KPICard.module.css'; // Import CSS Modules for class name assertions
import {
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
} from '@heroicons/react/24/solid';

// Mock useId for consistent IDs in tests
let mockIdCounter = 0;
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useId: jest.fn(() => {
    mockIdCounter++;
    return `test-id-${mockIdCounter}`;
  }),
}));

// Mock the heroicons to simplify testing their presence.
// We'll just check for the SVG element, not its specific path.
jest.mock('@heroicons/react/24/solid', () => ({
  ArrowUpIcon: (props: any) => <svg data-testid="arrow-up-icon" {...props} />,
  ArrowDownIcon: (props: any) => <svg data-testid="arrow-down-icon" {...props} />,
  MinusIcon: (props: any) => <svg data-testid="minus-icon" {...props} />,
}));

describe('KPICard', () => {
  beforeEach(() => {
    // Reset the mock ID counter before each test to ensure unique IDs per test run
    mockIdCounter = 0;
    (React.useId as jest.Mock).mockClear();
    (React.useId as jest.Mock).mockImplementation(() => {
      mockIdCounter++;
      return `test-id-${mockIdCounter}`;
    });
  });

  // Test Case 1: Renders with basic required props
  test('renders title and value correctly', () => {
    render(<KPICard title="Total Sales" value={12345} />);

    const card = screen.getByRole('region', { name: 'Key Performance Indicator card for Total Sales' });
    expect(card).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Total Sales' })).toBeInTheDocument();
    expect(screen.getByText('12345')).toBeInTheDocument();
    expect(screen.getByLabelText('Current value: 12345')).toBeInTheDocument();
  });

  // Test Case 2: Renders with all optional props
  test('renders with unit, description, and custom icon', () => {
    const CustomIcon = () => <span data-testid="custom-icon">📈</span>;
    render(
      <KPICard
        title="Revenue"
        value="1.2M"
        unit="$"
        description="Total revenue for the quarter"
        icon={<CustomIcon />}
      />
    );

    expect(screen.getByText('1.2M')).toBeInTheDocument();
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('Total revenue for the quarter')).toBeInTheDocument();
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.getByLabelText('Current value: 1.2M $')).toBeInTheDocument();
  });

  // Test Case 3: Renders positive trend (inferred)
  test('renders positive trend correctly when trend > 0', () => {
    render(<KPICard title="Growth" value="100" trend={5.2} />);

    const trendIndicator = screen.getByLabelText('Trend is positive, increased by 5.2 percent.');
    expect(trendIndicator).toBeInTheDocument();
    expect(trendIndicator).toHaveTextContent('5.2%');
    expect(trendIndicator).toHaveClass(styles.trendPositive);
    expect(screen.getByTestId('arrow-up-icon')).toBeInTheDocument();
    expect(screen.getByTestId('arrow-up-icon')).toHaveClass(styles.trendIconPositive);
  });

  // Test Case 4: Renders positive trend (explicit)
  test('renders explicit positive trend correctly', () => {
    render(<KPICard title="Growth" value="100" trend={-10} trendType="positive" />); // Trend value is negative, but type is positive

    const trendIndicator = screen.getByLabelText('Trend is positive, increased by 10 percent.');
    expect(trendIndicator).toBeInTheDocument();
    expect(trendIndicator).toHaveTextContent('10%'); // Displays absolute value
    expect(trendIndicator).toHaveClass(styles.trendPositive);
    expect(screen.getByTestId('arrow-up-icon')).toBeInTheDocument();
    expect(screen.getByTestId('arrow-up-icon')).toHaveClass(styles.trendIconPositive);
  });

  // Test Case 5: Renders negative trend (inferred)
  test('renders negative trend correctly when trend < 0', () => {
    render(<KPICard title="Decline" value="50" trend={-3.1} />);

    const trendIndicator = screen.getByLabelText('Trend is negative, decreased by 3.1 percent.');
    expect(trendIndicator).toBeInTheDocument();
    expect(trendIndicator).toHaveTextContent('3.1%');
    expect(trendIndicator).toHaveClass(styles.trendNegative);
    expect(screen.getByTestId('arrow-down-icon')).toBeInTheDocument();
    expect(screen.getByTestId('arrow-down-icon')).toHaveClass(styles.trendIconNegative);
  });

  // Test Case 6: Renders negative trend (explicit)
  test('renders explicit negative trend correctly', () => {
    render(<KPICard title="Decline" value="50" trend={10} trendType="negative" />); // Trend value is positive, but type is negative

    const trendIndicator = screen.getByLabelText('Trend is negative, decreased by 10 percent.');
    expect(trendIndicator).toBeInTheDocument();
    expect(trendIndicator).toHaveTextContent('10%'); // Displays absolute value
    expect(trendIndicator).toHaveClass(styles.trendNegative);
    expect(screen.getByTestId('arrow-down-icon')).toBeInTheDocument();
    expect(screen.getByTestId('arrow-down-icon')).toHaveClass(styles.trendIconNegative);
  });

  // Test Case 7: Renders neutral trend (inferred)
  test('renders neutral trend correctly when trend is 0', () => {
    render(<KPICard title="Stable" value="200" trend={0} />);

    const trendIndicator = screen.getByLabelText('Trend is neutral, no significant change.');
    expect(trendIndicator).toBeInTheDocument();
    expect(trendIndicator).toHaveTextContent('0%');
    expect(trendIndicator).toHaveClass(styles.trendNeutral);
    expect(screen.getByTestId('minus-icon')).toBeInTheDocument();
    expect(screen.getByTestId('minus-icon')).toHaveClass(styles.trendIconNeutral);
  });

  // Test Case 8: Renders neutral trend (explicit)
  test('renders explicit neutral trend correctly', () => {
    render(<KPICard title="Stable" value="200" trend={5} trendType="neutral" />); // Trend value is positive, but type is neutral

    const trendIndicator = screen.getByLabelText('Trend is neutral, no significant change.');
    expect(trendIndicator).toBeInTheDocument();
    expect(trendIndicator).toHaveTextContent('5%'); // Displays absolute value
    expect(trendIndicator).toHaveClass(styles.trendNeutral);
    expect(screen.getByTestId('minus-icon')).toBeInTheDocument();
    expect(screen.getByTestId('minus-icon')).toHaveClass(styles.trendIconNeutral);
  });

  // Test Case 9: Does not render trend indicator if trend prop is missing
  test('does not render trend indicator if trend prop is not provided', () => {
    render(<KPICard title="No Trend" value="100" />);
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    expect(screen.queryByTestId('arrow-up-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('arrow-down-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('minus-icon')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Trend is/)).not.toBeInTheDocument();
  });

  // Test Case 10: Displays loading state when isLoading is true
  test('displays loading overlay and spinner when isLoading is true', () => {
    render(<KPICard title="Loading Data" value="N/A" isLoading={true} />);

    const card = screen.getByRole('region', { name: 'Key Performance Indicator card for Loading Data' });
    expect(card).toHaveClass(styles.loading);
    expect(card).toHaveAttribute('aria-live', 'polite');

    const loaderOverlay = screen.getByRole('presentation', { hidden: true }); // loaderOverlay has aria-hidden="true"
    expect(loaderOverlay).toBeInTheDocument();
    expect(loaderOverlay).toHaveClass(styles.loaderOverlay);
    expect(loaderOverlay).toHaveAttribute('aria-hidden', 'true');

    const spinner = screen.getByRole('status'); // Spinner is typically role="status" or has an accessible name
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass(styles.spinner);
  });

  // Test Case 11: Does not display loading state when isLoading is false
  test('does not display loading overlay when isLoading is false', () => {
    render(<KPICard title="Data Ready" value="100" isLoading={false} />);

    const card = screen.getByRole('region', { name: 'Key Performance Indicator card for Data Ready' });
    expect(card).not.toHaveClass(styles.loading);
    expect(card).toHaveAttribute('aria-live', 'off');
    expect(screen.queryByRole('presentation', { hidden: true })).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  // Test Case 12: Accessibility - custom ariaLabel for the card
  test('uses custom ariaLabel for the card if provided', () => {
    render(<KPICard title="Custom KPI" value="XYZ" ariaLabel="My custom KPI card" />);
    expect(screen.getByRole('region', { name: 'My custom KPI card' })).toBeInTheDocument();
  });

  // Test Case 13: Accessibility - role and aria-labelledby/aria-describedby
  test('applies correct ARIA attributes for accessibility', () => {
    render(
      <KPICard
        title="Accessibility Test"
        value="123"
        description="This is an accessible card"
      />
    );

    const card = screen.getByRole('region', { name: 'Key Performance Indicator card for Accessibility Test' });
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('role', 'region');

    const titleElement = screen.getByRole('heading', { name: 'Accessibility Test' });
    const descriptionElement = screen.getByText('This is an accessible card');

    // Check if useId was called twice for titleId and descriptionId
    expect(React.useId).toHaveBeenCalledTimes(2);

    // Check aria-labelledby and aria-describedby
    expect(card).toHaveAttribute('aria-labelledby', 'test-id-1');
    expect(titleElement).toHaveAttribute('id', 'test-id-1');

    expect(card).toHaveAttribute('aria-describedby', 'test-id-2');
    expect(descriptionElement).toHaveAttribute('id', 'test-id-2');
  });

  // Test Case 14: Accessibility - aria-describedby is not present if description is missing
  test('aria-describedby is not present if description is missing', () => {
    render(<KPICard title="No Description" value="456" />);

    const card = screen.getByRole('region', { name: 'Key Performance Indicator card for No Description' });
    expect(card).not.toHaveAttribute('aria-describedby');
    expect(React.useId).toHaveBeenCalledTimes(1); // Only for titleId
  });

  // Test Case 15: Value can be a number
  test('renders value correctly when it is a number', () => {
    render(<KPICard title="Numeric Value" value={987.65} />);
    expect(screen.getByText('987.65')).toBeInTheDocument();
    expect(screen.getByLabelText('Current value: 987.65')).toBeInTheDocument();
  });

  // Test Case 16: Value can be a string
  test('renders value correctly when it is a string', () => {
    render(<KPICard title="String Value" value="N/A" />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
    expect(screen.getByLabelText('Current value: N/A')).toBeInTheDocument();
  });

  // Test Case 17: Ensures correct class names are applied for header and content
  test('applies correct CSS module classes', () => {
    render(<KPICard title="Styled Card" value="100" />);
    const card = screen.getByRole('region');
    expect(card).toHaveClass(styles.kpiCard);

    const header = screen.getByText('Styled Card').closest(`.${styles.header}`);
    expect(header).toBeInTheDocument();

    const content = screen.getByText('100').closest(`.${styles.content}`);
    expect(content).toBeInTheDocument();

    const valueContainer = screen.getByText('100').closest(`.${styles.valueContainer}`);
    expect(valueContainer).toBeInTheDocument();
  });
});