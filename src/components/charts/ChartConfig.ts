import {
  Chart,
  // Controllers
  BarController,
  LineController,
  PieController,
  DoughnutController,
  PolarAreaController,
  RadarController,
  BubbleController,
  ScatterController,
  // Elements
  ArcElement,
  LineElement,
  PointElement,
  BarElement,
  // Scales
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  // Plugins
  Tooltip,
  Legend,
  Title,
  Subtitle,
  Filler,
  Decimation,
} from 'chart.js';

/**
 * @file src/components/charts/ChartConfig.ts
 * @description Centralized Chart.js defaults and plugin registrations.
 * This file configures Chart.js globally for the entire application.
 * It should be imported and called once at the application's entry point (e.g., main.ts or App.tsx).
 */

/**
 * Configures Chart.js by registering necessary components and setting global defaults.
 * This function should be called once when the application starts.
 */
export function configureChartJs(): void {
  try {
    // 1. Register Chart.js components
    // This is crucial for tree-shaking in Chart.js v3+ and ensures only
    // the components you use are bundled.
    Chart.register(
      // Controllers
      BarController,
      LineController,
      PieController,
      DoughnutController,
      PolarAreaController,
      RadarController,
      BubbleController,
      ScatterController,

      // Elements
      ArcElement,
      LineElement,
      PointElement,
      BarElement,

      // Scales
      CategoryScale,
      LinearScale,
      LogarithmicScale,
      RadialLinearScale,
      TimeScale,
      TimeSeriesScale,

      // Plugins
      Tooltip,
      Legend,
      Title,
      Subtitle,
      Filler,
      Decimation
    );

    // 2. Set Global Defaults
    // These defaults will apply to all charts unless overridden by specific chart options.
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false; // Often desired for custom sizing

    // Font defaults
    Chart.defaults.font.family = "'Roboto', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.font.color = '#666'; // A neutral dark grey

    // Tooltip defaults
    Chart.defaults.plugins.tooltip.mode = 'index'; // Show all items in the same index
    Chart.defaults.plugins.tooltip.intersect = false; // Don't require intersection with an element
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    Chart.defaults.plugins.tooltip.titleColor = '#fff';
    Chart.defaults.plugins.tooltip.bodyColor = '#fff';
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 4;

    // Legend defaults
    Chart.defaults.plugins.legend.position = 'top';
    Chart.defaults.plugins.legend.align = 'start'; // 'start', 'center', 'end'
    Chart.defaults.plugins.legend.labels.boxWidth = 20;
    Chart.defaults.plugins.legend.labels.padding = 10;
    Chart.defaults.plugins.legend.labels.color = '#333';

    // Title defaults
    Chart.defaults.plugins.title.display = false; // Usually set per chart
    Chart.defaults.plugins.title.font.size = 16;
    Chart.defaults.plugins.title.color = '#333';
    Chart.defaults.plugins.title.padding = { top: 10, bottom: 10 };

    // Layout defaults
    Chart.defaults.layout.padding = {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    };

    // Animation defaults
    Chart.defaults.animation.duration = 1000; // Global animation duration
    Chart.defaults.animation.easing = 'easeOutQuart'; // Global easing function

    // Scale defaults (e.g., for linear scales)
    Chart.defaults.scales.linear.grid.color = 'rgba(0, 0, 0, 0.1)'; // Light grid lines
    Chart.defaults.scales.linear.ticks.color = '#666';
    Chart.defaults.scales.linear.ticks.padding = 8;
    Chart.defaults.scales.linear.border.display = false; // Hide axis line

    // Category scale defaults
    Chart.defaults.scales.category.grid.display = false; // Hide vertical grid lines by default
    Chart.defaults.scales.category.ticks.color = '#666';
    Chart.defaults.scales.category.ticks.padding = 8;
    Chart.defaults.scales.category.border.display = false; // Hide axis line

    console.info('Chart.js configured successfully with global defaults and registered components.');

  } catch (error) {
    // Log any errors that occur during Chart.js configuration.
    // This helps in debugging issues related to library loading or incorrect configuration.
    console.error('Error configuring Chart.js:', error);
    // Depending on the application's error handling strategy, you might
    // re-throw the error, display a user-friendly message, or log to a monitoring service.
  }
}