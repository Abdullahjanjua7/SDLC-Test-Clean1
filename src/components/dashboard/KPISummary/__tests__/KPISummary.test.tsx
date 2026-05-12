import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import KPISummary from './KPISummary';
import styles from './KPISummary.module.css';

// Extend Jest with jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock a simple MetricCard component for testing children
const MockMetricCard: React.FC<{ title: string; value: string }> = ({ title, value }) => (
  <div data-testid="metric-card">
    <h3>{title}</h3>
    <p>{value}</p>
  </div>
);

describe('KPISummary', () => {
  // Clean up after each test to ensure a fresh DOM
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test Case 1: Basic rendering and structure
  test('should render the KPISummary container with correct structure and classes', () => {
    render(<KPISummary><div>Test Child</div></KPISummary>);

    // Verify the main section element
    const sectionElement = screen.getByRole('region', { name: 'Key Performance Indicators Summary' });
    expect(sectionElement).toBeInTheDocument();
    expect(sectionElement).toHaveClass(styles.kpiSummaryContainer);

    // Verify the inner wrapper div
    const wrapperDiv = sectionElement.querySelector(`.${styles.kpiCardsWrapper}`);
    expect(wrapperDiv).toBeInTheDocument();
    expect(wrapperDiv).toHaveClass(styles.kpiCardsWrapper);

    // Verify the child is rendered inside the wrapper
    expect(screen.getByText('Test Child')).toBeInTheDocument();
    expect(wrapperDiv).toContainElement(screen.getByText('Test Child'));
  });

  // Test Case 2: Rendering with a single child
  test('should render a single child component correctly', () => {
    render(
      <KPISummary>
        <MockMetricCard title="Total Sales" value="$1,234,567" />
      </KPISummary>
    );

    const metricCard = screen.getByTestId('metric-card');
    expect(metricCard).toBeInTheDocument();
    expect(screen.getByText('Total Sales')).toBeInTheDocument();
    expect(screen.getByText('$1,234,567')).toBeInTheDocument();
  });

  // Test Case 3: Rendering with multiple children
  test('should render multiple child components correctly', () => {
    render(
      <KPISummary>
        <MockMetricCard title="Total Sales" value="$1,234,567" />
        <MockMetricCard title="New Customers" value="500" />
        <MockMetricCard title="Conversion Rate" value="2.5%" />
      </KPISummary>
    );

    const metricCards = screen.getAllByTestId('metric-card');
    expect(metricCards).toHaveLength(3);

    expect(screen.getByText('Total Sales')).toBeInTheDocument();
    expect(screen.getByText('New Customers')).toBeInTheDocument();
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
  });

  // Test Case 4: Rendering with no children
  test('should render the container but no children when none are provided', () => {
    render(<KPISummary />);

    const sectionElement = screen.getByRole('region', { name: 'Key Performance Indicators Summary' });
    expect(sectionElement).toBeInTheDocument();

    const wrapperDiv = sectionElement.querySelector(`.${styles.kpiCardsWrapper}`);
    expect(wrapperDiv).toBeInTheDocument();
    expect(wrapperDiv).toBeEmptyDOMElement(); // The wrapper div should be empty
  });

  // Test Case 5: Accessibility check with axe-core
  test('should be accessible', async () => {
    const { container } = render(
      <KPISummary>
        <MockMetricCard title="Accessibility Test" value="100%" />
      </KPISummary>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // Test Case 6: Verify accessibility attributes
  test('should have correct aria-label and role for accessibility', () => {
    render(<KPISummary><div>Child</div></KPISummary>);

    const sectionElement = screen.getByRole('region');
    expect(sectionElement).toBeInTheDocument();
    expect(sectionElement).toHaveAttribute('aria-label', 'Key Performance Indicators Summary');
    expect(sectionElement).toHaveAttribute('role', 'region');
  });

  // Test Case 7: User interactions (not directly applicable to this container, but demonstrate a child interaction)
  test('should allow interaction with child components if they have interactive elements', () => {
    const handleClick = jest.fn();
    const InteractiveChild: React.FC = () => (
      <button onClick={handleClick} data-testid="interactive-button">
        Click Me
      </button>
    );

    render(
      <KPISummary>
        <InteractiveChild />
      </KPISummary>
    );

    const button = screen.getByTestId('interactive-button');
    expect(button).toBeInTheDocument();

    // Simulate a click on the child's interactive element
    button.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});