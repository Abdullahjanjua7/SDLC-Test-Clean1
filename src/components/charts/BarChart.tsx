// BarChart.tsx
import React, { useState, useRef, useMemo, CSSProperties } from 'react';
import styles from './BarChart.module.css';

// --- Interfaces ---

/**
 * Represents a single data point for the bar chart.
 */
interface BarChartDataItem {
  /** The label for the bar (e.g., category name). */
  label: string;
  /** The numerical value of the bar. */
  value: number;
  /** Optional custom color for this specific bar, overrides `barColor` prop. */
  color?: string;
}

/**
 * Props for the BarChart component.
 */
interface BarChartProps {
  /**
   * The data to display in the bar chart.
   * Each item should have a 'label' (string) and a 'value' (number).
   * An optional 'color' can be provided for individual bars.
   */
  data: BarChartDataItem[];
  /**
   * The width of the chart container in pixels.
   * @default 600
   */
  width?: number;
  /**
   * The height of the chart drawing area in pixels.
   * This height is for the bars themselves, excluding title/labels.
   * @default 300
   */
  height?: number;
  /**
   * An optional title for the chart, displayed at the top.
   */
  title?: string;
  /**
   * The default color for bars if not specified in the data item.
   * @default '#6366F1' (Indigo 500)
   */
  barColor?: string;
  /**
   * The color for the labels displayed below each bar.
   * @default '#4B5563' (Gray 700)
   */
  labelColor?: string;
  /**
   * The color for the values displayed on top of each bar.
   * @default '#1F2937' (Gray 900)
   */
  valueColor?: string;
  /**
   * Optional maximum value for the Y-axis. If not provided, it will be
   * automatically calculated from the data. Setting this can provide a fixed scale.
   */
  maxValue?: number;
  /**
   * If true, displays the numerical value on top of each bar.
   * @default true
   */
  showValues?: boolean;
  /**
   * If true, displays an interactive tooltip on bar hover.
   * @default true
   */
  showTooltip?: boolean;
  /**
   * An optional description for accessibility purposes, read by screen readers.
   */
  description?: string;
}

// --- Component ---

const BarChart: React.FC<BarChartProps> = ({
  data,
  width = 600,
  height = 300,
  title,
  barColor = '#6366F1', // Default Indigo 500
  labelColor = '#4B5563', // Default Gray 700
  valueColor = '#1F2937', // Default Gray 900
  maxValue,
  showValues = true,
  showTooltip = true,
  description,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    label: string;
    value: number;
  } | null>(null);

  // Calculate the effective maximum value for scaling bars.
  // Ensures a positive max value even if all data is zero to prevent division by zero.
  const effectiveMaxValue = useMemo(() => {
    if (maxValue !== undefined && maxValue > 0) {
      return maxValue;
    }
    const maxDataValue = Math.max(...data.map(item => item.value));
    return maxDataValue > 0 ? maxDataValue : 1;
  }, [data, maxValue]);

  /**
   * Handles mouse entering a bar to display the tooltip.
   */
  const handleMouseEnter = (
    event: React.MouseEvent<HTMLDivElement>,
    item: BarChartDataItem
  ) => {
    if (!showTooltip) return;

    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const chartRect = chartRef.current?.getBoundingClientRect();

    if (chartRect) {
      setTooltip({
        visible: true,
        x: rect.left - chartRect.left + rect.width / 2, // Center of the bar relative to chart
        y: rect.top - chartRect.top - 10, // Position above the bar
        label: item.label,
        value: item.value,
      });
    }
  };

  /**
   * Handles mouse leaving a bar to hide the tooltip.
   */
  const handleMouseLeave = () => {
    if (!showTooltip) return;
    setTooltip(null);
  };

  // Generate unique IDs for accessibility attributes
  const chartId = useMemo(() => `bar-chart-${Math.random().toString(36).substr(2, 9)}`, []);
  const titleId = title ? `${chartId}-title` : undefined;
  const descriptionId = description ? `${chartId}-description` : undefined;

  return (
    <div
      ref={chartRef}
      className={styles.barChartContainer}
      style={{ width: `${width}px` }}
      role="figure" // Semantic role for a self-contained content
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-label={title || "Interactive Bar Chart"} // Fallback aria-label
    >
      {title && (
        <h2 id={titleId} className={styles.chartTitle}>
          {title}
        </h2>
      )}
      {description && (
        // Visually hidden description for screen readers
        <p id={descriptionId} className={styles.srOnly}>
          {description}
        </p>
      )}

      <div className={styles.chartArea} style={{ height: `${height}px` }}>
        {data.map((item, index) => {
          const barHeightPercentage = (item.value / effectiveMaxValue) * 100;
          const barStyle: CSSProperties = {
            height: `${barHeightPercentage}%`,
            backgroundColor: item.color || barColor,
          };

          return (
            <div
              key={index}
              className={styles.barWrapper}
              onMouseEnter={(e) => handleMouseEnter(e, item)}
              onMouseLeave={handleMouseLeave}
              role="graphics-object" // Role for a graphical object
              aria-label={`${item.label}: ${item.value}`} // Concise label for screen readers
              aria-valuenow={item.value}
              aria-valuemin={0}
              aria-valuemax={effectiveMaxValue}
            >
              {showValues && (
                <span className={styles.barValue} style={{ color: valueColor }}>
                  {item.value}
                </span>
              )}
              <div className={styles.bar} style={barStyle}></div>
              <span className={styles.barLabel} style={{ color: labelColor }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {showTooltip && tooltip?.visible && (
        <div
          className={styles.tooltip}
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)', // Center horizontally, position above
          }}
          role="tooltip" // Semantic role for a tooltip
        >
          <div className={styles.tooltipLabel}>{tooltip.label}</div>
          <div className={styles.tooltipValue}>{tooltip.value}</div>
        </div>
      )}
    </div>
  );
};

export default BarChart;