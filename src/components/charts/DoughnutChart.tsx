import React, { useState, useRef, useMemo, useCallback } from 'react';
import styles from './DoughnutChart.module.css';

// 1. Interfaces
interface DoughnutChartData {
  label: string;
  value: number;
  color: string;
}

interface DoughnutChartProps {
  /**
   * An array of data points for the doughnut chart.
   * Each item should have a label (string), value (number), and color (string).
   */
  data: DoughnutChartData[];
  /**
   * The diameter of the chart in pixels.
   * @default 200
   */
  size?: number;
  /**
   * The thickness of the doughnut ring in pixels.
   * @default 30
   */
  strokeWidth?: number;
  /**
   * The duration of hover animations in milliseconds.
   * @default 200
   */
  animationDuration?: number;
  /**
   * The title of the chart for accessibility and context.
   * @default "Doughnut Chart"
   */
  title?: string;
  /**
   * A description of the chart for accessibility.
   * @default "Interactive doughnut chart displaying proportions of various categories."
   */
  description?: string;
}

interface ArcCoordinates {
  x: number;
  y: number;
}

/**
 * Converts polar coordinates to Cartesian coordinates.
 * Used for calculating SVG arc points.
 */
const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): ArcCoordinates => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians)),
  };
};

/**
 * Generates an SVG path string for a single arc.
 * This is a helper for the `getSegmentPath` function.
 */
const describeArc = (
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  const d = [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ');

  return d;
};

/**
 * DoughnutChart Component
 *
 * An interactive and accessible doughnut chart for displaying proportional data.
 * Features include:
 * - Strict TypeScript typing.
 * - CSS Modules for styling with premium UI aesthetics (glassmorphism, rounded corners, soft shadows).
 * - SVG-based rendering for crisp graphics.
 * - Hover interactivity with a dynamic tooltip.
 * - Accessibility features including ARIA attributes and keyboard navigation.
 */
const DoughnutChart: React.FC<DoughnutChartProps> = ({
  data,
  size = 200,
  strokeWidth = 30,
  animationDuration = 200,
  title = 'Doughnut Chart',
  description = 'Interactive doughnut chart displaying proportions of various categories.',
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<DoughnutChartData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const radius = size / 2;
  const innerRadius = radius - strokeWidth;
  const outerRadius = radius;
  const centerX = radius;
  const centerY = radius;

  // Calculate total value and segment angles
  const totalValue = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  const segments = useMemo(() => {
    let currentAngle = 0; // Start from the top (12 o'clock)
    return data.map((item) => {
      const percentage = totalValue === 0 ? 0 : (item.value / totalValue);
      const startAngle = currentAngle;
      const endAngle = currentAngle + (percentage * 360);
      currentAngle = endAngle;

      return {
        ...item,
        percentage,
        startAngle,
        endAngle,
      };
    });
  }, [data, totalValue]);

  /**
   * Generates the SVG path string for a single doughnut segment.
   * This path connects an outer arc and an inner arc.
   */
  const getSegmentPath = useCallback((segment: typeof segments[0]) => {
    if (segment.percentage === 0) return '';

    const startAngle = segment.startAngle;
    const endAngle = segment.endAngle;

    // Points for the outer arc
    const startOuter = polarToCartesian(centerX, centerY, outerRadius, startAngle);
    const endOuter = polarToCartesian(centerX, centerY, outerRadius, endAngle);

    // Points for the inner arc
    const startInner = polarToCartesian(centerX, centerY, innerRadius, startAngle);
    const endInner = polarToCartesian(centerX, centerY, innerRadius, endAngle);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    // M = Move to, L = Line to, A = Arc to, Z = Close path
    // The path starts at the outer edge, draws the outer arc,
    // then draws a line to the inner edge, draws the inner arc,
    // and finally closes the path.
    return [
      `M ${startOuter.x} ${startOuter.y}`, // Move to the start of the outer arc
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`, // Outer arc
      `L ${endInner.x} ${endInner.y}`, // Line to the end of the inner arc
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y}`, // Inner arc (sweep flag 0 to go counter-clockwise)
      `Z`, // Close path
    ].join(' ');
  }, [centerX, centerY, innerRadius, outerRadius]);

  // Handle mouse events for interactivity
  const handleMouseEnter = useCallback((
    event: React.MouseEvent<SVGPathElement>,
    segment: DoughnutChartData
  ) => {
    setHoveredSegment(segment);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredSegment(null);
    setTooltipPosition(null);
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent<SVGPathElement>) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  }, []);

  // Handle keyboard focus for accessibility
  const handleFocus = useCallback((
    event: React.FocusEvent<SVGPathElement>,
    segment: DoughnutChartData
  ) => {
    setHoveredSegment(segment);
    // Position tooltip relative to the chart container for keyboard focus
    if (chartRef.current) {
      const chartRect = chartRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: chartRect.left + chartRect.width / 2,
        y: chartRect.top + chartRect.height / 2 - 20, // Slightly above center
      });
    }
  }, []);

  const handleBlur = useCallback(() => {
    setHoveredSegment(null);
    setTooltipPosition(null);
  }, []);

  return (
    <div
      ref={chartRef}
      className={styles.doughnutChartContainer}
      style={{ width: size, height: size }}
      role="figure"
      aria-labelledby="chart-title"
      aria-describedby="chart-description"
    >
      <h2 id="chart-title" className={styles.srOnly}>{title}</h2>
      <p id="chart-description" className={styles.srOnly}>{description}</p>

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="false"
      >
        {/* Background circle for the doughnut hole */}
        <circle
          cx={centerX}
          cy={centerY}
          r={innerRadius}
          fill="var(--chart-background-color, #ffffff)"
          className={styles.doughnutHole}
        />

        {segments.map((segment) => {
          const pathD = getSegmentPath(segment);
          if (!pathD) return null; // Don't render if percentage is 0

          return (
            <path
              key={segment.label}
              d={pathD}
              fill={segment.color}
              className={`${styles.doughnutSegment} ${hoveredSegment?.label === segment.label ? styles.hovered : ''}`}