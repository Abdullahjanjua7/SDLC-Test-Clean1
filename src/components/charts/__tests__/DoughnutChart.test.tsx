import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DoughnutChart from './DoughnutChart'; // Adjust path as necessary
import '@testing-library/jest-dom';

// Mock CSS modules to return class names as strings
jest.mock('./DoughnutChart.module.css', () => ({
  doughnutChartContainer: 'doughnutChartContainer',
  srOnly: 'srOnly',
  doughnutHole: 'doughnutHole',
  doughnutSegment: 'doughnutSegment',
  hovered: 'hovered',
  tooltip: 'tooltip',
  tooltipLabel: 'tooltipLabel',
  tooltipValue: 'tooltipValue',
  tooltipPercentage: 'tooltipPercentage',
}));

const mockData = [
  { label: 'Category A', value: 30, color: '#FF6384' },
  { label: 'Category B', value: 50, color: '#36A2EB' },
  { label: 'Category C', value: 20, color: '#FFCE56' },
];

const mockDataSingleSegment = [
  { label: 'Single Category', value: 100, color: '#FF6384' },
];

const mockDataZeroValues = [
  { label: 'Zero A', value: 0, color: '#FF6384' },
  { label: 'Zero B', value: 0, color: '#36A2EB' },
];

describe('DoughnutChart', () => {
  // --- Basic Rendering & Props ---
  test('renders with default props and basic data', () => {
    render(<DoughnutChart data={mockData} />);

    // Check chart container
    const chartContainer = screen.getByRole('figure', { name: 'Doughnut Chart' });
    expect(chartContainer).toBeInTheDocument();
    expect(chartContainer).toHaveClass('doughnutChartContainer');
    expect(chartContainer).toHaveStyle('width: 200px');
    expect(chartContainer).toHaveStyle('height: 200px');

    // Check SVG element
    const svg = screen.getByRole('img', { hidden: true }); // SVG with aria-hidden="false" is often treated as img by AT
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '200');
    expect(svg).toHaveAttribute('height', '200');
    expect(svg).toHaveAttribute('viewBox', '0 0 200 200');
    expect(svg).toHaveAttribute('aria-hidden', 'false');

    // Check SR-only title and description
    expect(screen.getByText('Doughnut Chart')).toHaveClass('srOnly');
    expect(screen.getByText('Interactive doughnut chart displaying proportions of various categories.')).toHaveClass('srOnly');

    // Check segments (paths are graphics-symbol role)
    const segments = screen.getAllByRole('graphics-symbol');
    expect(segments).toHaveLength(mockData.length);

    // Check doughnut hole (circle is graphics-document role)
    const doughnutHole = screen.getByRole('graphics-document');
    expect(doughnutHole).toBeInTheDocument();
    expect(doughnutHole).toHaveClass('doughnutHole');
    expect(doughnutHole).toHaveAttribute('cx', '100');
    expect(doughnutHole).toHaveAttribute('cy', '100');
    expect(doughnutHole).toHaveAttribute('r', '70'); // (size/2 - strokeWidth) = (200/2 - 30) = 70
  });

  test('renders with custom title and description', () => {
    const customTitle = 'My Custom Chart';
    const customDescription = 'This is a custom description for the chart.';
    render(<DoughnutChart data={mockData} title={customTitle} description={customDescription} />);

    expect(screen.getByRole('figure', { name: customTitle })).toBeInTheDocument();
    expect(screen.getByText(customTitle)).toHaveClass('srOnly');
    expect(screen.getByText(customDescription)).toHaveClass('srOnly');
  });

  test('renders with custom size and strokeWidth', () => {
    const customSize = 300;
    const customStrokeWidth = 50;
    render(<DoughnutChart data={mockData} size={customSize} strokeWidth={customStrokeWidth} />);

    const chartContainer = screen.getByRole('figure');
    expect(chartContainer).toHaveStyle(`width: ${customSize}px`);
    expect(chartContainer).toHaveStyle(`height: ${customSize}px`);

    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toHaveAttribute('width', customSize.toString());
    expect(svg).toHaveAttribute('height', customSize.toString());
    expect(svg).toHaveAttribute('viewBox', `0 0 ${customSize} ${customSize}`);

    // Verify strokeWidth indirectly by checking the radius of the doughnut hole
    const expectedInnerRadius = (customSize / 2) - customStrokeWidth;
    const doughnutHole = screen.getByRole('graphics-document');
    expect(doughnutHole).toHaveAttribute('r', expectedInnerRadius.toString());
  });

  // --- Data Rendering ---
  test('renders correct number of segments with correct colors', () => {
    render(<DoughnutChart data={mockData} />);
    const segments = screen.getAllByRole('graphics-symbol');
    expect(segments).toHaveLength(mockData.length);

    mockData.forEach((item, index) => {
      expect(segments[index]).toHaveAttribute('fill', item.color);
      expect(segments[index]).toHaveClass('doughnutSegment');
    });
  });

  test('renders no segments when data is an empty array', () => {
    render(<DoughnutChart data={[]} />);
    expect(screen.queryAllByRole('graphics-symbol')).toHaveLength(0);
    // Still expect the chart container and doughnut hole
    expect(screen.getByRole('figure')).toBeInTheDocument();
    expect(screen.getByRole('graphics-document')).toBeInTheDocument();
  });

  test('renders no segments when all data values are zero', () => {
    render(<DoughnutChart data={mockDataZeroValues} />);
    expect(screen.queryAllByRole('graphics-symbol')).toHaveLength(0);
    // Still expect the chart container and doughnut hole
    expect(screen.getByRole('figure')).toBeInTheDocument();
    expect(screen.getByRole('graphics-document')).toBeInTheDocument();
  });

  test('renders a full circle for a single data point', () => {
    render(<DoughnutChart data={mockDataSingleSegment} />);
    const segments = screen.getAllByRole('graphics-symbol');
    expect(segments).toHaveLength(1);
    expect(segments[0]).toHaveAttribute('fill', mockDataSingleSegment[0].color);
    // A full circle path is complex; we check it's a non-empty SVG path.
    expect(segments[0]).toHaveAttribute('d');
    expect(segments[0].getAttribute('d')).not.toBe('');
  });

  test('renders correctly when one segment has zero value', () => {
    const dataWithZero = [
      { label: 'A', value: 50, color: 'red' },
      { label: 'B', value: 0, color: 'blue' },
      { label: 'C', value: 50, color: 'green' },
    ];
    render(<DoughnutChart data={dataWithZero} />);
    // Only A and C should render as segments
    const segments = screen.getAllByRole('graphics-symbol');
    expect(segments).toHaveLength(2);
    expect(segments[0]).toHaveAttribute('fill', 'red');
    expect(segments[1]).toHaveAttribute('fill', 'green');

    // Hovering over a non-zero segment should work
    fireEvent.mouseEnter(segments[0]);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(within(screen.getByRole('tooltip')).getByText('A')).toBeInTheDocument();
    expect(within(screen.getByRole('tooltip')).getByText('50.00%')).toBeInTheDocument();
    fireEvent.mouseLeave(segments[0]);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  // --- Interactivity (Mouse Events) ---
  test('displays tooltip on mouse enter and hides on mouse leave', async () => {
    const user = userEvent.setup();