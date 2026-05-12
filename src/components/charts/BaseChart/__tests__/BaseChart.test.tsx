import React from 'react';
import { render, screen } from '@testing-library/react';
import BaseChart from './BaseChart';
import { ChartData, ChartOptions, ChartType } from 'chart.js';

// Mock the Chart.js library and its registerables.
// This prevents actual Chart.js rendering in JSDOM, which is not supported,
// and allows us to test if `register` is called.
const mockRegister = jest.fn();
jest.mock('chart.js', () => ({
  Chart: jest.fn(), // Mock the Chart class itself if it were directly used
  registerables: [], // Mock registerables as an empty array
  ChartJS: {
    register: mockRegister, // Mock the register method
  },
  // Export types as they are used in the component's props
  ChartData: {} as ChartData,
  ChartOptions: {} as ChartOptions,
  ChartType: {} as ChartType,
}));

// Mock the react-chartjs-2 Chart component.
// This is crucial to prevent actual canvas rendering errors in the test environment.
const MockChartComponent = jest.fn(() => null); // Returns null to avoid rendering anything
jest.mock('react-chartjs-2', () => ({
  Chart: MockChartComponent,
}));

// Mock CSS Modules to prevent issues with undefined styles
jest.mock('./BaseChart.module.css', () => ({
  chartContainer: 'mock-chart-container',
}));

describe('BaseChart', () => {
  const mockChartData: ChartData = {
    labels: ['Red', 'Blue', 'Yellow'],
    datasets: [
      {
        label: '# of Votes',
        data: [12, 19, 3],
        backgroundColor: ['rgba(255, 99, 132, 0.2)'],
        borderColor: ['rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const mockChartType: ChartType = 'bar';

  beforeEach(() => {
    // Clear all mocks before each test to ensure isolation
    jest.clearAllMocks();
  });

  // Test 1: Basic rendering with required props
  test('renders the chart container with correct role and aria-label', () => {
    render(<BaseChart data={mockChartData} type={mockChartType} />);

    const chartContainer = screen.getByRole('img', { name: 'Data visualization chart' });
    expect(chartContainer).toBeInTheDocument();
    expect(chartContainer).toHaveClass('mock-chart-container');
  });

  // Test 2: ChartJS.registerables is called once globally
  test('ChartJS.registerables is called on component load', () => {
    // Render the component multiple times to ensure register is called only once
    // due to its global nature in the component file.
    render(<BaseChart data={mockChartData} type={mockChartType} />);
    render(<BaseChart data={mockChartData} type={mockChartType} />);
    expect(mockRegister).toHaveBeenCalledTimes(1);
    expect(mockRegister).toHaveBeenCalledWith(...[]); // Called with mocked registerables
  });

  // Test 3: Passes data and type props correctly to react-chartjs-2 Chart component
  test('passes data and type props to the Chart component', () => {
    render(<BaseChart data={mockChartData} type={mockChartType} />);

    expect(MockChartComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        data: mockChartData,
        type: mockChartType,
      }),
      {} // Second argument is context, usually empty for functional components
    );
  });

  // Test 4: Applies default options when no custom options are provided
  test('applies default chart options when none are provided', () => {
    render(<BaseChart data={mockChartData} type={mockChartType} />);

    const passedOptions = MockChartComponent.mock.calls[0][0].options;

    expect(passedOptions).toBeDefined();
    expect(passedOptions?.responsive).toBe(true);
    expect(passedOptions?.maintainAspectRatio).toBe(false);
    expect(passedOptions?.plugins?.legend?.position).toBe('top');
    expect(passedOptions?.scales?.x?.grid?.display).toBe(false);
    expect(passedOptions?.scales?.y?.grid?.color).toBe('rgba(0, 0, 0, 0.05)');
  });

  // Test 5: Custom options override default options
  test('custom options override default options', () => {
    const customOptions: ChartOptions = {
      responsive: false, // Override default true
      plugins: {
        legend: {
          position: 'bottom' as const, // Override default 'top'
        },
      },
      scales: {
        x: {
          grid: {
            display: true, // Override default false
          },
        },
      },
    };

    render(<BaseChart data={mockChartData} type={mockChartType} options={customOptions} />);

    const passedOptions = MockChartComponent.mock.calls[0][0].options;

    expect(passedOptions?.responsive).toBe(false); // Custom override applied
    expect(passedOptions?.plugins?.legend?.position).toBe('bottom'); // Custom override applied
    expect(passedOptions?.scales?.x?.grid?.display).toBe(true); // Custom override applied
    // Ensure other default options are still present if not overridden
    expect(passedOptions?.maintainAspectRatio).toBe(false);
    expect(passedOptions?.scales?.y?.grid?.color).toBe('rgba(0, 0, 0, 0.05)');
  });

  // Test 6: Deep merging of options
  test('deeply merges custom options with default options', () => {
    const customOptions: ChartOptions = {
      plugins: {
        tooltip: {
          backgroundColor: 'red', // Override default
          titleFont: {
            size: 20, // Override default
          },
        },
      },
    };

    render(<BaseChart data={mockChartData} type={mockChartType} options={customOptions} />);

    const passedOptions = MockChartComponent.mock.calls[0][0].options;

    // Check overridden properties
    expect(passedOptions?.plugins?.tooltip?.backgroundColor).toBe('red');
    expect(passedOptions?.plugins?.tooltip?.titleFont?.size).toBe(20);

    // Check properties that should still come from defaults
    expect(passedOptions?.plugins?.tooltip?.mode).toBe('index');
    expect(passedOptions?.plugins?.tooltip?.bodyFont?.size).toBe(14);
  });

  // Test 7: Applies additional className to the container
  test('applies additional className to the chart container', () => {
    const customClassName = 'my-custom-chart-style';
    render(<BaseChart data={mockChartData} type={mockChartType} className={customClassName} />);

    const chartContainer = screen.getByRole('img');
    expect(chartContainer).toHaveClass('mock-chart-container');
    expect(chartContainer).toHaveClass(customClassName);
  });

  // Test 8: Custom ariaLabel is applied
  test('applies custom ariaLabel to the chart container', () => {
    const customAriaLabel = 'My custom chart description';
    render(<BaseChart data={mockChartData} type={mockChartType} ariaLabel={customAriaLabel} />);

    const chartContainer = screen.getByRole('img', { name: customAriaLabel });
    expect(chartContainer).toBeInTheDocument();
  });

  // Test 9: Accessibility check for default aria-label
  test('has default aria-label for accessibility', () => {
    render(<BaseChart data={mockChartData} type={mockChartType} />);
    const chartContainer = screen.getByRole('img');
    expect(chartContainer).toHaveAttribute('aria-label', 'Data visualization chart');
  });

  // Test 10: Component does not re-render Chart component if props are identical (due to memo)
  // Note: This is a basic check. React.memo's effectiveness is more about performance
  // and less about functional correctness, and can be tricky to test perfectly.
  // We'll check if MockChartComponent is called only once for identical props.
  test('does not re-render Chart component if props are identical', () => {
    const { rerender } = render(<BaseChart data={mockChartData} type={mockChartType} />);
    expect(MockChartComponent).toHaveBeenCalledTimes(1);

    rerender(<BaseChart data={mockChartData} type={mockChartType} />);
    // MockChartComponent should still have been called only once if memo works as expected
    // (or if the parent component didn't trigger a re-render with new props).
    // In this specific setup, rerender with identical props will still cause the wrapper
    // component to execute, but `memo` should prevent the actual `Chart` component from re-rendering.
    // However, our mock `MockChartComponent` is called by the `BaseChart` function itself,
    // so if `BaseChart` re-executes, `MockChartComponent` will be called again.
    // A more robust test for `memo` would involve checking if the *actual* Chart.js instance
    // is recreated, which is beyond the scope of mocking `react-chartjs-2`.
    // For now, we'll ensure it's called when props *do* change.
    expect(MockChartComponent).toHaveBeenCalledTimes(1); // Still 1 call if memo prevents re-render of its child
  });

  // Test 11: Component re-renders Chart component if props change
  test('re-renders Chart component if props change', () => {
    const { rerender } = render(<BaseChart data={mockChartData} type={mockChartType} />);
    expect(MockChartComponent).toHaveBeenCalledTimes(1);

    const newChartData: ChartData = {
      labels: ['Green', 'Purple'],
      datasets: [{ label: 'New Data', data: [5, 10] }],
    };

    rerender(<BaseChart data={newChartData} type={mockChartType} />);
    expect(MockChartComponent).toHaveBeenCalledTimes(2); // Should be called again with new data
    expect(MockChartComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        data: newChartData,
      }),
      {}
    );
  });
});