import { Chart, ChartOptions } from 'chart.js';

/**
 * Defines the global Chart.js configuration and default options.
 * These settings will be applied to all charts unless specifically
 * overridden by individual chart options.
 *
 * This configuration uses the `ChartOptions` type from Chart.js,
 * which is suitable for setting global defaults via `Chart.defaults.set()`.
 *
 * @see https://www.chartjs.org/docs/latest/general/options.html
 */
export const chartConfig: ChartOptions = {
  // Global responsiveness settings
  responsive: true,
  maintainAspectRatio: false, // Often set to false to allow charts to fill their container
  resizeDelay: 100, // Delay in ms before resizing after a window resize event

  // Global animation settings
  animation: {
    duration: 800, // Default animation duration in milliseconds
    easing: 'easeOutQuart', // Default easing function for animations
    // onComplete: (animation) => { /* console.log('Animation complete'); */ },
  },

  // Global plugin options
  plugins: {
    legend: {
      display: true, // Display legend by default
      position: 'top', // Position legend at the top of the chart
      labels: {
        font: {
          size: 12,
          family: 'Arial, sans-serif',
        },
        color: '#666', // Default legend label color
        boxWidth: 20, // Width of the colored box in the legend
        padding: 10, // Padding between legend items
      },
      // onClick: (e, legendItem, legend) => { /* Custom legend click handler */ },
    },
    tooltip: {
      enabled: true, // Enable tooltips by default
      mode: 'index', // Show all items in the same x-position
      intersect: false, // Don't require the mouse to intersect an element
      backgroundColor: 'rgba(0, 0, 0, 0.7)', // Tooltip background color
      titleFont: {
        size: 14,
        weight: 'bold',
      },
      bodyFont: {
        size: 12,
      },
      padding: 10, // Padding inside the tooltip
      cornerRadius: 4, // Border radius of the tooltip
      displayColors: true, // Display color boxes in the tooltip
      // callbacks: { /* Custom tooltip callbacks */ },
    },
    // Add other plugin configurations here, e.g., datalabels, zoom, etc.
  },

  // Global scale options (for Cartesian charts like bar, line, scatter)
  scales: {
    x: {
      grid: {
        display: false, // Hide x-axis grid lines by default
        drawBorder: false, // Don't draw border for x-axis grid
      },
      ticks: {
        color: '#666', // Default x-axis tick color
        font: {
          size: 10,
        },
      },
      // title: {
      //   display: true,
      //   text: 'X-Axis Label',
      //   font: { size: 12, weight: 'bold' },
      //   color: '#333',
      // },
    },
    y: {
      beginAtZero: true, // Start y-axis at zero by default
      grid: {
        color: 'rgba(0, 0, 0, 0.1)', // Light grid lines for y-axis
        drawBorder: false, // Don't draw border for y-axis grid
      },
      ticks: {
        color: '#666', // Default y-axis tick color
        font: {
          size: 10,
        },
        // callback: (value) => `${value} units`, // Example: add 'units' to y-axis labels
      },
      // title: {
      //   display: true,
      //   text: 'Y-Axis Label',
      //   font: { size: 12, weight: 'bold' },
      //   color: '#333',
      // },
    },
  },

  // Global element options (for styling individual chart elements)
  elements: {
    point: {
      radius: 3, // Default point radius
      backgroundColor: 'rgba(75, 192, 192, 1)', // Default point background color
      borderColor: 'rgba(75, 192, 192, 1)', // Default point border color
      borderWidth: 1, // Default point border width
      hoverRadius: 5, // Point radius on hover
    },
    line: {
      tension: 0.4, // Default line tension (for smooth curves)
      borderWidth: 2, // Default line border width
      borderColor: 'rgba(75, 192, 192, 1)', // Default line border color
      backgroundColor: 'rgba(75, 192, 192, 0.2)', // Default line fill color
      fill: false, // Don't fill area under the line by default
    },
    bar: {
      backgroundColor: 'rgba(75, 192, 192, 0.8)', // Default bar background color
      borderColor: 'rgba(75, 192, 192, 1)', // Default bar border color
      borderWidth: 1, // Default bar border width
      borderRadius: 4, // Default bar border radius
    },
    arc: {
      backgroundColor: 'rgba(75, 192, 192, 0.8)', // Default arc background color (for pie, doughnut)
      borderColor: '#fff', // Default arc border color
      borderWidth: 2, // Default arc border width
    },
  },

  // Layout options
  layout: {
    padding: {
      left: 10,
      right: 10,
      top: 10,
      bottom: 10,
    },
  },
};

/**
 * Applies the global Chart.js configuration.
 * This function should be called once at the application's entry point
 * to set up Chart.js defaults before any charts are rendered.
 *
 * It uses `Chart.defaults.set()` which is the recommended way to
 * apply global options in Chart.js v3 and later.
 */
export const applyGlobalChartConfig = (): void => {
  try {
    if (typeof Chart === 'undefined' || !Chart.defaults || !Chart.defaults.set) {
      console.warn('Chart.js is not loaded or does not support Chart.defaults.set(). Global chart configuration will not be applied.');
      return;
    }

    // Merge our custom configuration with Chart.js defaults.
    // This method intelligently merges nested objects.
    Chart.defaults.set(chartConfig);
    console.info('Global Chart.js configuration applied successfully.');
  } catch (error) {
    console.error('Error applying global Chart.js configuration:', error);
  }
};