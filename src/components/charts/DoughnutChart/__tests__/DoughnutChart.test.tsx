import React from 'react';
import { render, screen, cleanup, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import DoughnutChart from './DoughnutChart';

// Mock CSS module to prevent errors with undefined styles
jest.mock('./DoughnutChart.module.css', () => ({
  doughnutChartContainer: 'doughnutChartContainer',
  chartHeader: 'chartHeader',
  noDataMessage: 'noDataMessage',
  chartContent: 'chartContent',
  chartSVGWrapper: 'chartSVGWrapper',
  chartSVG: 'chartSVG',
  chartSegment: 'chartSegment',
  centerText: 'centerText',
  legend: 'legend',
  legendItem: 'legendItem',
  legendColorBox: 'legendColorBox',
  legendLabel: 'legendLabel',
  legendValue: 'legendValue',
  'legend-right': 'legend-right',
  'legend-bottom': 'legend-bottom',
}));

const mockData = [
  { label: 'Sales', value: 300, color: '#FF6384' },
  { label: 'Marketing', value: 50, color: '#36A2EB' },
  { label: 'Development', value: 100, color: '#FFCE56' },
];

const mockDataSingleSegment = [{ label: 'Single', value: 100, color: '#FF6384' }];

describe('DoughnutChart', () => {
  afterEach(cleanup);

  // --- Basic Rendering Tests ---
  test('renders with title, chart, and legend for valid data', () => {
    render(<DoughnutChart data={mockData} title="Monthly Performance" />);

    // Check title
    expect(screen.getByRole('heading', { name: /monthly performance/i })).toBeInTheDocument();

    // Check main container accessibility
    const chartContainer = screen.getByRole('group', { name: /monthly performance doughnut chart/i });
    expect(chartContainer).toBeInTheDocument();
    expect(chartContainer).toHaveClass('doughnutChartContainer');
    expect(chartContainer).toHaveClass('legend-right'); // Default legend position

    // Check SVG presence and accessibility
    const svgElement = screen.getByRole('img', { hidden: true }); // SVG is aria-hidden="true"
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveAttribute('aria-hidden', 'true');

    // Check center text (total value)
    const totalValue = mockData.reduce((sum, item) => sum + item.value, 0);
    expect(screen.getByText(totalValue.toLocaleString())).toBeInTheDocument();

    // Check legend presence and content
    const legend = screen.getByRole('list', { name: /chart legend/i });
    expect(legend).toBeInTheDocument();

    mockData.forEach((item) => {
      const legendItem = within(legend).getByRole('listitem', { name: new RegExp(`${item.label}: ${item.value}`) });
      expect(legendItem).toBeInTheDocument();
      expect(within(legendItem).getByText(item.label)).toBeInTheDocument();
      expect(within(legendItem).getByText(item.value.toString())).toBeInTheDocument();
      expect(within(legendItem).getByText(/\(\d+\.\d+%\)/)).toBeInTheDocument(); // Check for percentage
      expect(within(legendItem).getByText(item.value.toString()).closest('span')).toHaveClass('legendLabel');
      expect(within(legendItem).getByText(item.value.toString())).toHaveClass('legendValue');
      expect(within(legendItem).getByText(item.value.toString()).previousElementSibling).toHaveClass('legendColorBox');
      expect(within(legendItem).getByText(item.value.toString()).previousElementSibling).toHaveStyle(`background-color: ${item.color}`);
    });
  });

  test('renders correctly with a single data segment', () => {
    render(<DoughnutChart data={mockDataSingleSegment} title="Single Segment Chart" />);

    expect(screen.getByRole('heading', { name: /single segment chart/i })).toBeInTheDocument();
    expect(screen.getByText(mockDataSingleSegment[0].value.toLocaleString())).toBeInTheDocument();

    const legend = screen.getByRole('list', { name: /chart legend/i });
    expect(legend).toBeInTheDocument();
    expect(within(legend).getByRole('listitem', { name: /single: 100/i })).toBeInTheDocument();
    expect(within(legend).getByText('(100.0%)')).toBeInTheDocument(); // Should be 100%
  });

  // --- No Data / Empty State Tests ---
  test('displays "No data available" message when data array is empty', () => {
    render(<DoughnutChart data={[]} title="Empty Chart" />);

    expect(screen.getByRole('heading', { name: /empty chart/i })).toBeInTheDocument();
    expect(screen.getByText(/no data available to display the chart/i)).toBeInTheDocument();
    expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument(); // No SVG
    expect(screen.queryByRole('list', { name: /chart legend/i })).not.toBeInTheDocument(); // No legend
    expect(screen.getByRole('group', { name: /empty chart doughnut chart with no data/i })).toBeInTheDocument();
  });

  test('displays "No data available" message when all data values are zero', () => {
    const zeroData = [{ label: 'A', value: 0, color: 'red' }];
    render(<DoughnutChart data={zeroData} title="Zero Value Chart" />);

    expect(screen.getByRole('heading', { name: /zero value chart/i })).toBeInTheDocument();
    expect(screen.getByText(/no data available to display the chart/i)).toBeInTheDocument();
    expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
    expect(screen.queryByRole('list', { name: /chart legend/i })).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: /zero value chart doughnut chart with no data/i })).toBeInTheDocument();
  });

  // --- Prop Combination Tests ---
  test('applies custom size and strokeWidth correctly', () => {
    const customSize = 300;
    const customStrokeWidth = 50;
    render(
      <DoughnutChart
        data={mockData}
        title="Custom Sized Chart"
        size={customSize}
        strokeWidth={customStrokeWidth}
      />
    );

    const chartSVGWrapper = screen.getByTestId('doughnutChartContainer').querySelector('.chartSVGWrapper');
    expect(chartSVGWrapper).toHaveStyle(`width: ${customSize}px`);
    expect(chartSVGWrapper).toHaveStyle(`height: ${customSize}px`);

    const svgElement = screen.getByRole('img', { hidden: true });
    expect(svgElement).toHaveAttribute('viewBox', `0 0 ${customSize} ${customSize}`);

    // Check background circle and a segment circle for strokeWidth and radius
    const backgroundCircle = svgElement.querySelector('circle[stroke="#e0e0e0"]');
    expect(backgroundCircle).toBeInTheDocument();
    expect(backgroundCircle).toHaveAttribute('stroke-width', customStrokeWidth.toString());
    expect(backgroundCircle).toHaveAttribute('r', ((customSize - customStrokeWidth) / 2).toString());

    const segmentCircle = svgElement.querySelector('.chartSegment');
    expect(segmentCircle).toBeInTheDocument();
    expect(segmentCircle).toHaveAttribute('stroke-width', customStrokeWidth.toString());
    expect(segmentCircle).toHaveAttribute('r', ((customSize - customStrokeWidth) / 2).toString());
  });

  test('displays legend on the bottom when legendPosition is "bottom"', () => {
    render(<DoughnutChart data={mockData} legendPosition="bottom" />);
    const chartContainer = screen.getByRole('group');
    expect(chartContainer).toHaveClass('legend-bottom');
    expect(chartContainer).not.toHaveClass('legend-right');
    expect(screen.getByRole('list', { name: /chart legend/i })).toBeInTheDocument();
  });

  test('does not display legend when legendPosition is "none"', () => {
    render(<DoughnutChart data={mockData} legendPosition="none" />);
    expect(screen.queryByRole('list', { name: /chart legend/i })).not.toBeInTheDocument();
  });

  test('displays centerLabel when provided, overriding centerValueFormatter', () => {
    const customCenterLabel = 'Total Sales';
    render(
      <DoughnutChart
        data={mockData}
        centerLabel={customCenterLabel}
        centerValueFormatter={(value) => `$${value.toFixed(2)}`}
      />
    );
    expect(screen.getByText(customCenterLabel)).toBeInTheDocument();
    const totalValue = mockData.reduce((sum, item) => sum + item.value, 0);
    expect(screen.queryByText(`$${totalValue.toFixed(2)}`)).not.toBeInTheDocument();
  });

  test('uses custom centerValueFormatter when provided and no centerLabel', () => {
    const customFormatter = (value: number) => `Total: ${value} units`;
    const totalValue = mockData.reduce((sum, item) => sum + item.value, 0);
    render(<DoughnutChart data={mockData} centerValueFormatter={customFormatter} />);
    expect(screen.getByText(`Total: ${totalValue} units`)).toBeInTheDocument();
    expect(screen.queryByText(totalValue.toLocaleString())).not.toBeInTheDocument();
  });

  test('applies custom ariaLabel to the chart container', () => {
    const customAriaLabel = 'Detailed sales breakdown chart';
    render(<DoughnutChart data={mockData} ariaLabel={customAriaLabel} />);
    expect(screen.getByRole('group', { name: customAriaLabel })).toBeInTheDocument();
  });

  test('ariaLabel takes precedence over title for aria-label on container', () => {
    const customAriaLabel = 'My specific chart description';
    render(<DoughnutChart data={mockData} title="Chart Title" ariaLabel={customAriaLabel} />);
    const chartContainer = screen.getByRole('group');
    expect(chartContainer).toHaveAttribute('aria-label', customAriaLabel);
    expect(chartContainer).not.toHaveAttribute('aria-label', 'Chart Title doughnut chart');
    expect(chartContainer).toHaveAttribute('aria-labelledby'); // Still linked to title if present
  });

  test('aria-labelledby is correctly linked to the title when title is present', () => {
    render(<DoughnutChart data={mockData} title="Chart Title" />);
    const chartContainer = screen.getByRole('group', { name: /chart title doughnut chart/i });
    const titleElement = screen.getByRole('heading', { name: /chart title/i });
    expect(chartContainer).toHaveAttribute('aria-labelledby', titleElement.id);
  });

  test('aria-label is generated from title if no explicit ariaLabel is provided', () => {
    render(<DoughnutChart data={mockData} title="My Chart" />);
    expect(screen.getByRole('group', { name: 'My Chart doughnut chart' })).toBeInTheDocument();
  });

  test('aria-label is generated as generic if no title or ariaLabel is provided', () => {
    render(<DoughnutChart data={mockData} />);
    expect(screen.getByRole('group', { name: 'Doughnut chart' })).toBeInTheDocument();
  });

  // --- Accessibility Tests ---
  test('legend items have correct roles and attributes', () => {
    render(<DoughnutChart data={mockData} />);
    const legend = screen.getByRole('list', { name: /chart legend/i });
    const legendItems = within(legend).getAllByRole('listitem');

    expect(legendItems).toHaveLength(mockData.length);

    legendItems.forEach((item, index) => {
      const colorBox = item.querySelector('.legendColorBox');
      expect(colorBox).toBeInTheDocument();
      expect(colorBox).toHaveAttribute('aria-hidden', 'true'); // Color box is visual
      expect(item).toHaveTextContent(mockData[index].label);
      expect(item).toHaveTextContent(mockData[index].value.toString());
    });
  });

  test('SVG elements have expected attributes for rendering', () => {
    render(<DoughnutChart data={mockData} />);
    const svgElement = screen.getByRole('img', { hidden: true });

    // Check background circle
    const backgroundCircle = svgElement.querySelector('circle[stroke="#e0e0e0"]');
    expect(backgroundCircle).toBeInTheDocument();
    expect(backgroundCircle).toHaveAttribute('fill', 'transparent');
    expect(backgroundCircle).toHaveAttribute('stroke-width', '30'); // Default strokeWidth

    // Check segment circles
    const segmentCircles = svgElement.querySelectorAll('.chartSegment');
    expect(segmentCircles).toHaveLength(mockData.length);

    segmentCircles.forEach((circle, index) => {
      expect(circle).toHaveAttribute('fill', 'transparent');
      expect(circle).toHaveAttribute('stroke', mockData[index].color);
      expect(circle).toHaveAttribute('stroke-width', '30');
      expect(circle).toHaveAttribute('stroke-dasharray'); // Check for existence
      expect(circle).toHaveAttribute('stroke-dashoffset'); // Check for existence
    });

    // Check center text
    const centerText = svgElement.querySelector('.centerText');
    expect(centerText).toBeInTheDocument();
    expect(centerText).toHaveAttribute('text-anchor', 'middle');
    expect(centerText).toHaveAttribute('dominant-baseline', 'middle');
  });
});