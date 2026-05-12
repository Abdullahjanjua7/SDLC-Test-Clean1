import React from 'react';
import { render, screen, cleanup, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import BarChart from './BarChart'; // Adjust path as necessary

// Extend Jest matchers for axe
expect.extend(toHaveNoViolations);

// Mock Math.random to ensure consistent chartId for snapshots and specific queries
// This ensures the generated ID for aria attributes is predictable.
const mockMath = Object.create(global.Math);
mockMath.random = () => 0.5; // Consistent random value
global.Math = mockMath;

const mockData = [
  { label: 'Category A', value: 10 },
  { label: 'Category B', value: 25 },
  { label: 'Category C', value: 15 },
  { label: 'Category D', value: 30 },
];

const mockTitle = 'Sales Performance';

describe('BarChart', () => {
  afterEach(cleanup);

  // --- Basic Rendering and Structure ---
  it('renders the chart title correctly', () => {
    render(<BarChart data={mockData} title={mockTitle} />);
    expect(screen.getByRole('heading', { name: mockTitle, level: 3 })).toBeInTheDocument();
  });

  it('renders the correct number of bars based on data', () => {
    render(<BarChart data={mockData} title={mockTitle} />);
    const svg = screen.getByRole('img', { name: mockTitle });
    // Rect elements with a <title> child are often interpreted as 'graphics-document' by accessibility APIs
    const bars = within(svg).getAllByRole('graphics-document');
    expect(bars).toHaveLength(mockData.length);
  });

  it('renders x-axis labels for each data point', () => {
    render(<BarChart data={mockData} title={mockTitle} />);
    mockData.forEach(point => {
      expect(screen.getByText(point.label)).toBeInTheDocument();
    });
  });

  it('renders y-axis tick labels based on max value', () => {
    render(<BarChart data={mockData} title={mockTitle} />);
    // Max value is 30. With 5 ticks, interval is 10 (0, 10, 20, 30, 40)
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument(); // The calculated max tick can exceed actual max value
  });

  it('applies default width and height if not provided', () => {
    render(<BarChart data={mockData} title={mockTitle} />);
    const container = screen.getByRole('group', { name: mockTitle });
    expect(container).toHaveStyle('width: 500px');
    expect(container).toHaveStyle('height: 300px');
    const svg = screen.getByRole('img', { name: mockTitle });
    expect(svg).toHaveAttribute('width', '500');
    expect(svg).toHaveAttribute('height', '300');
  });

  // --- Prop Testing ---
  it('applies custom width and height', () => {
    const customWidth = 600;
    const customHeight = 400;
    render(<BarChart data={mockData} title={mockTitle} width={customWidth} height={customHeight} />);
    const container = screen.getByRole('group', { name: mockTitle });
    expect(container).toHaveStyle(`width: ${customWidth}px`);
    expect(container).toHaveStyle(`height: ${customHeight}px`);
    const svg = screen.getByRole('img', { name: mockTitle });
    expect(svg).toHaveAttribute('width', customWidth.toString());
    expect(svg).toHaveAttribute('height', customHeight.toString());
  });

  it('applies single custom bar color', () => {
    const customColor = 'red';
    render(<BarChart data={mockData} title={mockTitle} barColor={customColor} />);
    const svg = screen.getByRole('img', { name: mockTitle });
    const bars = within(svg).getAllByRole('graphics-document');
    bars.forEach(bar => {
      expect(bar).toHaveAttribute('fill', customColor);
    });
  });

  it('applies an array of custom bar colors, cycling through them', () => {
    const customColors = ['red', 'blue'];
    render(<BarChart data={mockData} title={mockTitle} barColor={customColors} />);
    const svg = screen.getByRole('img', { name: mockTitle });
    const bars = within(svg).getAllByRole('graphics-document');
    expect(bars[0]).toHaveAttribute('fill', customColors[0]);
    expect(bars[1]).toHaveAttribute('fill', customColors[1]);
    expect(bars[2]).toHaveAttribute('fill', customColors[0]); // Cycles back
    expect(bars[3]).toHaveAttribute('fill', customColors[1]); // Cycles back
  });

  it('applies custom label color', () => {
    const customLabelColor = 'green';
    render(<BarChart data={mockData} title={mockTitle} labelColor={customLabelColor} />);
    // Check an x-axis label
    expect(screen.getByText('Category A')).toHaveAttribute('fill', customLabelColor);
    // Check a y-axis label (e.g., '10')
    expect(screen.getByText('10')).toHaveAttribute('fill', customLabelColor);
  });

  it('applies