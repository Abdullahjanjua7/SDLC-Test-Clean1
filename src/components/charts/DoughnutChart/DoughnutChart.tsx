// DoughnutChart.tsx
import React, { useMemo } from 'react';
import styles from './DoughnutChart.module.css';

// 1. Interfaces for strict TypeScript typing
interface DoughnutChartData {
  /** The label for this segment (e.g., "Sales", "Marketing"). */
  label: string;
  /** The numerical value for this segment. */
  value: number;
  /** The color for this segment (e.g., '#FF6384', 'rgb(255, 99, 132)'). */
  color: string;
}

interface DoughnutChartProps {
  /** An array of data points for the doughnut chart. */
  data: DoughnutChartData[];
  /** Optional title for the chart. */
  title?: string;
  /** Diameter of the chart in pixels (e.g., 200 for 200px width/height). Defaults to 200. */
  size?: number;
  /** Width of the doughnut ring in pixels. Defaults to 30. */
  strokeWidth?: number;
  /** Position of the legend relative to the chart. Defaults to 'right'. */
  legendPosition?: 'right' | 'bottom' | 'none';
  /** Optional text to display in the center of the doughnut. Overrides `centerValueFormatter`. */
  centerLabel?: string;
  /** Function to format the total value displayed in the center. Defaults to `toLocaleString()`. */
  centerValueFormatter?: (totalValue: number) => string;
  /** An ARIA label for the overall chart container, useful if `title` is not provided. */
  ariaLabel?: string;
}

// 2. DoughnutChart Component Implementation
const DoughnutChart: React.FC<DoughnutChartProps> = ({
  data,
  title,
  size = 200,
  strokeWidth = 30,
  legendPosition = 'right',
  centerLabel,
  centerValueFormatter = (value) => value.toLocaleString(),
  ariaLabel,
}) => {
  // Memoize total value calculation for performance
  const totalValue = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  // Handle cases where no data is provided
  if (!data || data.length === 0 || totalValue === 0) {
    return (
      <div
        className={styles.doughnutChartContainer}
        role="group"
        aria-label={ariaLabel || (title ? `${title} doughnut chart with no data` : "Doughnut chart with no data")}
      >
        {title && <h3 className={styles.chartHeader}>{title}</h3>}
        <p className={styles.noDataMessage}>No data available to display the chart.</p>
      </div>
    );
  }

  // Calculate SVG properties
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const viewBoxSize = size; // SVG viewBox width/height
  const center = viewBoxSize / 2; // Center coordinate for SVG elements

  let currentOffset = 0; // Tracks the start point of each segment for stroke-dashoffset

  // Memoize segment calculations
  const segments = useMemo(() => {
    return data.map((item, index) => {
      const percentage = item.value / totalValue;
      const strokeDasharray = `${percentage * circumference} ${circumference}`;
      const strokeDashoffset = -currentOffset; // Negative offset to draw clockwise from the top
      currentOffset += percentage * circumference; // Accumulate offset for the next segment

      return {
        ...item,
        strokeDasharray,
        strokeDashoffset,
        percentage: (percentage * 100).toFixed(1), // Percentage formatted to one decimal place
        id: `doughnut-segment-${index}-${item.label.replace(/\s/g, '-')}`, // Unique ID for each segment
      };
    });
  }, [data, totalValue, circumference]); // Recalculate only if data or dimensions change

  // Generate unique IDs for ARIA attributes
  const chartId = useMemo(() => `doughnut-chart-${Math.random().toString(36).substr(2, 9)}`, []);
  const titleId = title ? `${chartId}-title` : undefined;

  return (
    <div
      className={`${styles.doughnutChartContainer} ${styles[`legend-${legendPosition}`]}`}
      role="group"
      aria-label={ariaLabel || (title ? `${title} doughnut chart` : "Doughnut chart")}
      aria-labelledby={titleId}
    >
      {title && (
        <h3 id={titleId} className={styles.chartHeader}>
          {title}
        </h3>
      )}

      <div className={styles.chartContent}>
        <div className={styles.chartSVGWrapper} style={{ width: size, height: size }}>
          <svg
            className={styles.chartSVG}
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            aria-hidden="true" // Hide the SVG from screen readers as legend provides info
          >
            {/* Background circle for the doughnut effect */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#e0e0e0" // A light grey background for the ring
              strokeWidth={strokeWidth}
            />

            {/* Doughnut segments */}
            {segments.map((segment) => (
              <circle
                key={segment.id}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={segment.strokeDasharray}
                strokeDashoffset={segment.strokeDashoffset}
                className={styles.chartSegment}
              />
            ))}

            {/* Center text for total value or custom label */}
            <text
              x={center}
              y={center}
              textAnchor="middle"
              dominantBaseline="middle"
              className={styles.centerText}
            >
              {centerLabel || centerValueFormatter(totalValue)}
            </text>
          </svg>
        </div>

        {/* Legend display based on legendPosition prop */}
        {legendPosition !== 'none' && (
          <div className={styles.legend} role="list" aria-label="Chart legend">
            {segments.map((segment) => (
              <div key={segment.id} className={styles.legendItem} role="listitem">
                <span
                  className={styles.legendColorBox}
                  style={{ backgroundColor: segment.color }}
                  aria-hidden="true" // Color box is visual, not semantic
                ></span>
                <span className={styles.legendLabel}>
                  {segment.label}: <strong className={styles.legendValue}>{segment.value}</strong> ({segment.percentage}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoughnutChart;