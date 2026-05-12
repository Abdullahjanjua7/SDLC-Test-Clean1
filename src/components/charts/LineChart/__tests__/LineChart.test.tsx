// src/components/LineChart/LineChart.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LineChart from './LineChart';

// Mock Date.now() for consistent timestamp generation in tests
const MOCK_DATE = new Date('2023-01-01T12:00:00.000Z');
const MOCK_TIMESTAMP = MOCK_DATE.getTime();

// Helper function to generate test data
const generateData = (count: number, startTimestamp = MOCK_TIMESTAMP, startValue = 100) => {
  return Array.from({ length: count }).map((_, i) => ({
    timestamp: startTimestamp + i * 3600 * 1000, // Hourly data
    value: startValue + Math.sin(i * 0.5) * 50 + i * 2,
  }));
};

describe('LineChart', () => {
  // Mock Date.prototype.toLocaleDateString and toLocaleString for consistent output
  // This is important because the component uses these methods for tick labels and tooltips.
  const originalToLocaleDateString = Date.prototype.toLocaleDateString;
  const originalToLocaleString = Date.prototype.toLocaleString;

  beforeAll(() => {
    // Mock toLocaleDateString to return a fixed string
    Date.prototype.toLocaleDateString = jest.fn((_locales, _options) => '1/1/2023');
    // Mock toLocaleString to return a fixed string for tooltip
    Date.prototype.toLocaleString = jest.fn((_locales, _options) => '1/1/2023, 12:00:00 PM');
  });

  afterAll(() => {
    // Restore original Date prototype methods after all tests
    Date.prototype.toLocaleDateString = originalToLocaleDateString;
    Date.prototype.toLocaleString = originalToLocaleString;
  });

  it('renders without crashing', () => {
    const data = generateData(5);
    render(<LineChart data={data} title="Test Chart" />);
    expect(screen.getByLabelText('Line chart titled Test Chart')).toBeInTheDocument();
  });

  it('displays the chart title', () => {
    const data = generateData(5);
    render(<LineChart data={data} title="My Awesome Chart" />);
    // figcaption is semantically a heading for the figure
    expect(screen.getByRole('heading', { name: 'My Awesome Chart' })).toBeInTheDocument();
  });

  it('displays default axis labels when not provided', () => {
    const data = generateData(5);
    render(<LineChart data={data} title="Test Chart" />);
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });

  it('displays custom axis labels when provided', () => {
    const data = generateData(5);
    render(<LineChart data={data} title="Test Chart" xAxisLabel="Custom X" yAxisLabel="Custom Y" />);
    expect(screen.getByText('Custom X')).toBeInTheDocument();
    expect(screen.getByText('Custom Y')).toBeInTheDocument();
  });

  it('renders an SVG element with correct dimensions', () => {
    const data = generateData(5);
    render(<LineChart data={data} title="Test Chart" width={600} height={300} />);
    const svg = screen.getByLabelText('Line chart titled Test Chart').querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '600');
    expect(svg).toHaveAttribute('height', '300');
  });

  it('renders with default dimensions when not provided', () => {
    const data = generateData(5);
    render(<LineChart data={data} title="Test Chart" />);
    const svg = screen.getByLabelText('Line chart titled Test Chart').querySelector('svg');
    expect(svg).toHaveAttribute('width', '800');
    expect(svg).toHaveAttribute('height', '400');
  });

  it('renders line and area paths when data is provided', () => {
    const data = generateData(5);
    render(<LineChart data={data} title="Test Chart" />);
    const svg = screen.getByLabelText('Line chart titled Test Chart').querySelector('svg');
    const linePath = svg?.querySelector('path.line');
    const areaPath = svg?.querySelector('path.area');

    expect(linePath).toBeInTheDocument();
    expect(areaPath).toBeInTheDocument();
    // Check that 'd' attribute exists and is not empty, indicating path generation
    expect(linePath).toHaveAttribute('d');
    expect(areaPath).toHaveAttribute('d');
    expect(linePath?.getAttribute('d')).not.toBe('');
    expect(areaPath?.getAttribute('d')).not.toBe('');
  });

  it('does not render line or area paths when no data is provided', () => {
    render(<LineChart data={[]} title="Test Chart" />);
    const svg = screen.getByLabelText('Line chart titled Test Chart').querySelector('svg');
    const linePath = svg?.querySelector('path.line');
    const areaPath = svg?.querySelector('path.area');

    expect(linePath).not.toBeInTheDocument();
    expect(areaPath).not.toBeInTheDocument();
  });

  it('applies custom line and area colors', () => {
    const data = generateData(5);
    render(<LineChart data={data} title="Test Chart" lineColor="red" areaColor="blue" />);
    const svg = screen.getByLabelText('Line chart titled Test Chart').querySelector('svg');
    const linePath = svg?.querySelector('path.line');
    const areaPath = svg?.querySelector('path.area');

    expect(linePath).toHaveAttribute('stroke', 'red');
    expect(areaPath).toHaveAttribute('fill', 'blue');
  });

  it('renders x and y axis ticks', () => {
    const data = generateData(5);
    render(<LineChart data={data} title="Test Chart" />);
    const svg = screen.getByLabelText('Line chart titled Test Chart').querySelector('svg');

    // Check for x-axis ticks
    const xTicks = svg?.querySelectorAll('.x-axis .tick');
    expect(xTicks?.length).toBeGreaterThan(0);
    expect(screen.getByText('1/1/2023')).toBeInTheDocument(); // Check for a formatted date label from mock

    // Check for y-axis ticks
    const yTicks = svg?.querySelectorAll('.y-axis .tick');
    expect(yTicks?.length).toBeGreaterThan(0);
    // Use a regex to match the default toFixed(1) format, e.g., "100.0"
    expect(screen.getByText(/\d+\.\d/)).toBeInTheDocument();
  });

  // --- Interaction Tests (Tooltip) ---

  it('shows tooltip on mousemove over the chart area', () => {
    const data = generateData(5);
    render(<LineChart data={data} title="Test Chart" />);
    const svg = screen.getByLabelText('Line chart titled Test Chart').querySelector('svg');

    expect(screen.queryByTestId('chart-tooltip')).not.toBeInTheDocument();

    // Simulate mousemove over the SVG.
    // clientX/Y are relative to the viewport. We pick a point within the chart's bounds.
    fireEvent.mouseMove(svg!, { clientX: 400, clientY: 200 });

    const tooltip = screen.getByTestId('chart-tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveStyle('visibility: visible');
    // Check content based on default formatter and mocked Date.toLocaleString
    expect(tooltip).toHaveTextContent('Time: 1/1/2023, 12:00:00 PM');
    expect(tooltip).toHaveTextContent('Value:'); // Check for value part
  });

  it('hides tooltip on mouseleave from the chart area', () => {
    const data = generateData(5);
    render(<LineChart data={data} title="Test Chart" />);
    const svg = screen.getByLabelText('Line chart titled Test Chart').querySelector('svg');

    fireEvent.mouseMove(svg!, { clientX: 400, clientY: 200 });
    expect(screen.getByTestId('chart-tooltip')).toBeInTheDocument();

    fireEvent.mouseLeave(svg!);
    const tooltip = screen.getByTestId('chart-tooltip');
    expect(tooltip).toHaveStyle('visibility: hidden');
  });

  it('uses custom tooltipFormatter when provided', () => {
    const customFormatter = jest.fn((d) => `Custom: ${d.value.toFixed(0)} @ ${d.timestamp}`);
    const data = generateData(5);
    render(<LineChart data={data} title="Test Chart" tooltipFormatter={customFormatter} />);
    const svg = screen.getByLabelText('Line chart titled Test Chart').querySelector('svg');

    fireEvent.mouseMove(svg!, { clientX: 400, clientY: 200 });

    expect(customFormatter).toHaveBeenCalled();
    const tooltip = screen.getByTestId('chart-tooltip');
    expect(tooltip).toHaveTextContent('Custom:');
    expect(tooltip).toHaveTextContent('@');
  });

  it('does not show tooltip if no data is present', () => {
    render(<LineChart data={[]} title="Test Chart" />);
    const svg = screen.getByLabelText('Line chart titled Test Chart').querySelector('svg');

    fireEvent.mouseMove(svg!, { clientX: 400, clientY: 200 });
    expect(screen.queryByTestId('chart-tooltip')).not.toBeInTheDocument();
  });

  // --- Edge Cases and Specific Data Scenarios ---

  it('handles single data point gracefully', () => {
    const data = [{ timestamp: MOCK_TIMESTAMP, value: 50 }];
    render(<LineChart data={data} title="Single Point Chart" />);
    const svg = screen.getByLabelText('Line chart titled Single Point Chart').querySelector('svg');
    const linePath = svg?.querySelector('path.line');
    const areaPath = svg?.querySelector('path.area');

    expect(linePath).toBeInTheDocument();
    expect(areaPath).toBeInTheDocument();
    expect(linePath?.getAttribute('d')).not.toBe('');
    expect(areaPath?.getAttribute('d')).not.toBe('');

    // Check if tooltip works for single point
    fireEvent.mouseMove(svg!, { clientX: 400, clientY: 200 });
    expect(screen.getByTestId('chart-tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('chart-tooltip')).toHaveTextContent('Value: 50.00');
  });

  it('handles data with all same timestamps', () => {
    const data = [
      { timestamp: MOCK_TIMESTAMP, value: 10 },
      { timestamp: MOCK_TIMESTAMP, value: 20