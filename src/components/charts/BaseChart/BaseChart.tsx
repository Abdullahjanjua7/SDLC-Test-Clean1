import React, { memo } from 'react';
import { Chart as ChartJS, registerables, ChartData, ChartOptions, ChartType } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import styles from './BaseChart.module.css';

// Register Chart.js components globally.
// This ensures all necessary chart types, scales, and elements are available.
// In a larger application, this registration is often done once in the app's entry file
// (e.g., index.tsx or App.tsx) to avoid redundant calls and centralize Chart.js setup.
// For a self-contained component, including it here ensures the component functions
// correctly out-of-the-box, even if the consumer hasn't explicitly registered them.
ChartJS.register(...registerables);

/**
 * Props for the BaseChart component.
 */
interface BaseChartProps {
  /**
   * The data object for Chart.js. This defines the datasets and labels for the chart.
   * @see https://www.chartjs.org/docs/latest/general/data-structure.html
   */
  data: ChartData;
  /**
   * The options object for Chart.js, allowing extensive customization of chart appearance and behavior.
   * These options will be deeply merged with default options, with provided options taking precedence.
   * @see https://www.chartjs.org/docs/latest/general/options.html
   */
  options?: ChartOptions;
  /**
   * The type of chart to render (e.g., 'bar', 'line', 'pie', 'doughnut', 'polarArea', 'radar', 'bubble', 'scatter').
   * This corresponds to the Chart.js chart types.
   * @see https://www.chartjs.org/docs/latest/charts/
   */
  type: ChartType;
  /**
   * Additional CSS class names to apply to the chart's main container div.
   * Useful for external styling, layout adjustments, or integrating with utility classes.
   */
  className?: string;
  /**
   * An ARIA label for the chart container, providing a concise and descriptive text
   * for users of assistive technologies (e.g., screen readers).
   * Defaults to 'Data visualization chart'.
   */
  ariaLabel?: string;
}

/**
 * BaseChart is a generic wrapper for Chart.js, designed to provide a consistent,
 * responsive, and aesthetically pleasing container for various chart types.
 * It integrates premium UI elements like glassmorphism, rounded corners, and
 * soft surface elevation, while ensuring accessibility and robust configuration.
 */
const BaseChart: React.FC<BaseChartProps> = memo(
  ({ data, options, type, className, ariaLabel = 'Data visualization chart' }) => {
    // Define default Chart.js options for a modern, clean look and optimal responsiveness.
    // These defaults can be overridden by the 'options' prop provided by the consumer.
    const defaultChartOptions: ChartOptions = {
      responsive: true, // Chart will resize to fit its container
      maintainAspectRatio: false, // Allow the chart to fill its container's aspect ratio freely
      plugins: {
        legend: {
          position: 'top' as const, // Position legend at the top of the chart
          labels: {
            font: {
              size: 14,
              family: "'Inter', sans-serif", // Assuming 'Inter' font is available in the project
            },
            color: '#333', // Darker color for better contrast against light backgrounds
            usePointStyle: true, // Use point style (e.g., circle, square) for legend items
            padding: 20, // Padding between legend items and chart area
          },
        },
        tooltip: {
          mode: 'index', // Show all items at a given index when hovering
          intersect: false, // Tooltip always active when hovering over the chart area, not just data points
          backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent dark background for tooltips
          titleFont: {
            size: 16,
            family: "'Inter', sans-serif",
            weight: 'bold',
          },
          bodyFont: {
            size: 14,
            family: "'Inter', sans-serif",
          },
          padding: 10, // Padding inside the tooltip box
          cornerRadius: 6, // Slightly rounded tooltip corners
          displayColors: true, // Show color boxes in tooltip for data series
        },
        // Additional plugins like 'title' or 'datalabels' can be configured here
        // or passed via the 'options' prop for more specific chart needs.
      },
      scales: {
        x: {
          ticks: {
            font: {
              size: 12,
              family: "'Inter', sans-serif",
            },
            color: '#666', // Axis tick label color
          },
          grid: {
            display: false, // Hide x-axis grid lines by default for a cleaner look
            drawBorder: false, // Hide x-axis border line
          },
        },
        y: {
          ticks: {
            font: {
              size: 12,
              family: "'Inter', sans-serif",
            },
            color: '#666',
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)', // Light grid lines for y-axis
            drawBorder: false, // Hide y-axis border line
          },
        },
      },
      // Deeply merge user-provided options with defaults. User options take precedence.
      ...options,
    };

    return (
      <div
        className={`${styles.chartContainer} ${className || ''}`}
        role="img" // ARIA role to indicate that the div contains an image (the chart visualization)
        aria-label={ariaLabel} // ARIA label for accessibility, providing context to screen readers
      >
        <Chart type={type} data={data} options={defaultChartOptions} />
      </div>
    );
  }
);

BaseChart.displayName = 'BaseChart';

export default BaseChart;