// BarChart.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BarChart from './BarChart'; // Adjust path as necessary

// Mock Math.random to ensure consistent IDs for accessibility attributes
// This makes generated IDs predictable for testing purposes.
const MOCKED_RANDOM_VALUE = 0.123456789;
const mockMathRandom = jest.fn(() => MOCKED_RANDOM_VALUE);
const originalMathRandom = Math.random;

beforeAll(() => {
  Math.random = mockMathRandom;
});

afterAll(() => {
  Math.random = originalMathRandom;
});

// Sample data for various test cases
const mockData = [
  { label: 'Category A', value: 10 },
  { label: 'Category B', value: 20, color: '#FF0000' }, // Custom color
  { label: 'Category C', value: 5 },
];

const mockDataZeroValues = [
  { label: 'Cat X', value: 0 },
  { label: 'Cat Y', value: 0 },
];

const mockDataMixedValues = [
  { label: 'Cat P', value: 10 },
  { label: 'Cat Q', value: 0 },
  { label: 'Cat R', value: 5 },
];

describe('BarChart Component', () => {
  // Test 1: Renders with basic data and default props
  test('renders chart with basic data and default props', () => {
    render(<BarChart data={mockData} />);

    // Check if labels are rendered
    expect(screen.getByText('Category A')).toBeInTheDocument();
    expect(screen.getByText('Category B')).toBeInTheDocument();
    expect(screen.getByText('Category C')).toBeInTheDocument();

    // Check if values are rendered (default showValues is true)
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    // Check number of bars (each bar is wrapped in a graphics-object role)
    const bars = screen.getAllByRole('graphics-object');
    expect(bars).toHaveLength(mockData.length);

    // Check default width and height
    const container = screen.getByRole('figure');
    expect(container).toHaveStyle('width: 600px');
    // Use a regex to match the CSS module hashed class name
    expect(container.querySelector('.BarChart_chartArea__*')).toHaveStyle('height: 300px');
  });

  // Test 2: Renders with custom width, height, title, and description
  test('renders with custom width, height, title, and description', () => {
    const customTitle = 'My Custom Chart';
    const customDescription = 'This is a detailed description of the chart.';
    render(
      <BarChart
        data={mockData}
        width={800}
        height={400}
        title={customTitle}
        description={customDescription}
      />
    );

    // Check title
    expect(screen.getByRole('heading', { name: customTitle })).toBeInTheDocument();

    // Check description (visually hidden)
    const descriptionElement = screen.getByText(customDescription);
    expect(descriptionElement).toBeInTheDocument();
    expect(descriptionElement).toHaveClass('BarChart_srOnly__*'); // Check for the srOnly class
    expect(descriptionElement).toHaveAttribute('id', `bar-chart-${mockMathRandom().toString(36).substr(2, 9)}-description`);

    // Check custom width and height
    const container = screen.getByRole('figure');
    expect(container).toHaveStyle('width: 800px');
    expect(container.querySelector('.BarChart_chartArea__*')).toHaveStyle('height: 400px');
  });

  // Test 3: Renders with custom colors for bars, labels, and values
  test('renders bars, labels, and values with custom colors', () => {
    render(
      <BarChart
        data={mockData}
        barColor="#00FF00" // Green
        labelColor="#0000FF" // Blue
        valueColor="#FFFF00" // Yellow
      />
    );

    // Check default bar color (Category A and C should be green)
    const barA = screen.getByLabelText('Category A: 10').querySelector('.BarChart_bar__*');
    expect(barA).toHaveStyle('background-color: #00FF00');

    const barC = screen.getByLabelText('Category C: 5').querySelector('.BarChart_bar__*');
    expect(barC).toHaveStyle('background-color: #00FF00');

    // Check custom bar color from data item (Category B should be red)
    const barB = screen.getByLabelText('Category B: 20').querySelector('.BarChart_bar__*');
    expect(barB).toHaveStyle('background-color: #FF0000');

    // Check label color
    expect(screen.getByText('Category A')).toHaveStyle('color: #0000FF');
    expect(screen.getByText('Category B')).toHaveStyle('color: #0000FF');

    // Check value color
    expect(screen.getByText('10')).toHaveStyle('color: #FFFF00');
    expect(screen.getByText('20')).toHaveStyle('color: #FFFF00');
  });

  // Test 4: `showValues` prop functionality
  test('hides values when showValues is false', () => {
    render(<BarChart data={mockData} showValues={false} />);

    expect(screen.queryByText('10')).not.toBeInTheDocument();
    expect(screen.queryByText('20')).not.toBeInTheDocument();
    expect(screen.queryByText('5')).not.toBeInTheDocument();
  });

  // Test 5: `maxValue` prop and bar height calculation
  test('calculates bar heights correctly with and without maxValue prop', () => {
    // Test without maxValue (auto-calculated)
    const { rerender } = render(<BarChart data={mockData} height={100} />); // Use fixed height for easier calculation
    const effectiveMaxValueAuto = Math.max(...mockData.map(item => item.value)); // 20

    const barAAuto = screen.getByLabelText('Category A: 10').querySelector('.BarChart_bar__*');
    const barBAuto = screen.getByLabelText('Category B: 20').querySelector('.BarChart_bar__*');
    const barCAuto = screen.getByLabelText('Category C: 5').querySelector('.BarChart_bar__*');

    expect(barAAuto).toHaveStyle(`height: ${(10 / effectiveMaxValueAuto) * 100}%`); // 50%
    expect(barBAuto).toHaveStyle(`height: ${(20 / effectiveMaxValueAuto) * 100}%`); // 100%
    expect(barCAuto).toHaveStyle(`height: ${(5 / effectiveMaxValueAuto) * 100}%`);   // 25%

    // Test with maxValue prop
    const customMaxValue = 40;
    rerender(<BarChart data={mockData} height={100} maxValue={customMaxValue} />);

    const barAWithMax = screen.getByLabelText('Category A: 10').querySelector('.BarChart_bar__*');
    const barBWithMax = screen.getByLabelText('Category B: 20').querySelector('.BarChart_bar__*');
    const barCWithMax = screen.getByLabelText('Category C: 5').querySelector('.BarChart_bar__*');

    expect(barAWithMax).toHaveStyle(`height