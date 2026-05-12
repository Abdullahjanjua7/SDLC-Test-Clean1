// src/components/LineChart/LineChart.tsx
import React, { useState, useRef, useCallback, useMemo } from 'react';
import styles from './LineChart.module.css';

// --- Interfaces ---

/**
 * Represents a single data point for the line chart.
 * @property {number} timestamp - Unix timestamp in milliseconds (e.g., Date.now()).
 * @property {number} value - The numerical value at the given timestamp.
 */
interface DataPoint {
  timestamp: number;
  value: number;
}

/**
 * Props for the LineChart component.
 * @property {DataPoint[]} data - An array of data points to be displayed.
 * @property {string} title - The main title of the chart.
 * @property {string} [xAxisLabel='Time'] - Label for the X-axis.
 * @property {string} [yAxisLabel='Value'] - Label for the Y-axis.
 * @property {number} [width=800] - The total width of the chart SVG.
 * @property {number} [height=400] - The total height of the chart SVG.
 * @property {string} [lineColor='#007bff'] - Color of the line.
 * @property {string} [areaColor='rgba(0, 123, 255, 0.2)'] - Color of the area under the line.
 * @property {{ top: number; right: number; bottom: number; left: number }} [margin={ top: 20, right: 30, bottom: 60, left: 70 }] - Margins around the chart drawing area.
 * @property {(dataPoint: DataPoint) => string} [tooltipFormatter] - Function to format the content displayed in the tooltip.
 */
interface LineChartProps {
  data: DataPoint[];
  title: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  width?: number;
  height?: number;
  lineColor?: string;
  areaColor?: string;
  margin?: { top: number; right: number; bottom: number; left: number };
  tooltipFormatter?: (dataPoint: DataPoint) => string;
}

// --- Component ---

const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  xAxisLabel = 'Time',
  yAxisLabel = 'Value',
  width = 800,
  height = 400,
  lineColor = '#007bff',
  areaColor = 'rgba(0, 123, 255, 0.2)',
  margin = { top: 20, right: 30, bottom: 60, left: 70 },
  tooltipFormatter = (d) => `Time: ${new Date(d.timestamp).toLocaleString()}\nValue: ${d.value.toFixed(2)}`,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipX, setTooltipX] = useState(0);
  const [tooltipY, setTooltipY] = useState(0);
  const [tooltipContent, setTooltipContent] = useState('');

  // Calculate inner dimensions for the chart drawing area
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Memoize scales, paths, and ticks for performance
  const { xScale, yScale, linePath, areaPath, xTicks, yTicks } = useMemo(() => {
    if (!data || data.length === 0) {
      // Return default empty values if no data
      return {
        xScale: () => 0,
        yScale: () => 0,
        linePath: '',
        areaPath: '',
        xTicks: [],
        yTicks: [],
      };
    }

    // Determine min/max values for scaling
    const minTimestamp = Math.min(...data.map(d => d.timestamp));
    const maxTimestamp = Math.max(...data.map(d => d.timestamp));
    const minValue = Math.min(...data.map(d => d.value));
    const maxValue = Math.max(...data.map(d => d.value));

    // Handle edge cases for single data point or constant values to prevent division by zero
    const timeRange = maxTimestamp - minTimestamp;
    const valueRange = maxValue - minValue;

    // X-axis scale function
    const xScale = (timestamp: number) => {
      if (timeRange === 0) return innerWidth / 2; // Center if all timestamps are the same
      return ((timestamp - minTimestamp) / timeRange) * innerWidth;
    };

    // Add padding to Y-axis for better visual representation, even for constant values
    const yPadding = valueRange === 0 ? 1 : valueRange * 0.1;
    const effectiveMinValue = minValue - yPadding;
    const effectiveMaxValue = maxValue + yPadding;
    const effectiveValueRange = effectiveMaxValue - effectiveMinValue;

    // Y-axis scale function
    const yScale = (value: number) => {
      if (effectiveValueRange === 0) return innerHeight / 2; // Center if all values are the same after padding
      return innerHeight - ((value - effectiveMinValue) / effectiveValueRange) * innerHeight;
    };

    // Generate SVG path string for the line
    const linePath = data
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.timestamp)} ${yScale(d.value)}`)
      .join(' ');

    // Generate SVG path string for the area under the line
    const areaPath =
      linePath +
      ` L ${xScale(maxTimestamp)} ${yScale(effectiveMinValue)} L ${xScale(minTimestamp)} ${yScale(effectiveMinValue)} Z`;

    // Generate X-axis ticks (simplified for demonstration)
    const numXTicks = 5;
    const xTicks = Array.from({ length: numXTicks }).map((_, i) => {
      const timestamp = minTimestamp + (i / (numXTicks - 1)) * timeRange;
      return {
        value: timestamp,
        label: new Date(timestamp).toLocaleDateString(), // Format date for display
        x: xScale(timestamp),
      };
    });

    // Generate Y-axis ticks (simplified for demonstration)
    const numYTicks = 5;
    const yTicks = Array.from({ length: numYTicks }).map((_, i) => {
      const value = effectiveMinValue + (i / (numYTicks - 1)) * effectiveValueRange;
      return {
        value: value,
        label: value.toFixed(1), // Format value for display
        y: yScale(value),
      };
    });

    return { xScale, yScale, linePath, areaPath, xTicks, yTicks };
  }, [data, innerWidth, innerHeight]); // Dependencies for memoization

  /**
   * Handles mouse movement over the SVG to display tooltips.
   * Finds the closest data point to the mouse cursor.
   */
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current || data.length === 0) return;

      const svgRect = svgRef.current.getBoundingClientRect();
      // Calculate mouseX relative to the inner chart area
      const mouseX = event.clientX - svgRect.left - margin.left;

      let closestPoint: DataPoint | null = null;
      let minDistance = Infinity;

      // Iterate through data points to find the one closest to the mouseX
      for (const point of data) {
        const pointX = xScale(point.timestamp);
        const distance = Math.abs(pointX - mouseX);
        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = point;
        }
      }

      if (closestPoint) {
        setTooltipVisible(true);
        // Position tooltip relative to the SVG container
        setTooltipX(xScale(closestPoint.timestamp) + margin.left);
        setTooltipY(yScale(closestPoint.value) + margin.top);
        setTooltipContent(tooltipFormatter(closestPoint));
      } else {
        setTooltipVisible(false);
      }
    },
    [data, xScale, yScale, margin, tooltipFormatter]
  );

  /**
   * Hides the tooltip when the mouse leaves the SVG area.
   */
  const handleMouseLeave = useCallback(() => {
    setTooltipVisible(false);
  }, []);

  return (
    <figure
      className={styles.lineChartContainer}
      style={{ width: width, height: height }}
      aria-label={`Line chart titled ${title}`}
    >
      <figcaption className={styles.chartTitle} id