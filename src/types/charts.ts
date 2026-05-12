/**
 * src/types/charts.ts
 * TypeScript interfaces for chart data structures and options.
 */

/**
 * Represents a generic color type for chart elements.
 * Can be a single CSS color string, an array of strings for multiple elements,
 * or a CanvasGradient/CanvasPattern for more complex fills.
 */
export type ChartColor = string | string[] | CanvasGradient | CanvasPattern;

/**
 * Defines font properties for text elements in a chart.
 */
export interface ChartFont {
  /** Font family. */
  family?: string;
  /** Font size in pixels. */
  size?: number;
  /** Font style (e.g., 'normal', 'italic', 'oblique'). */
  style?: string;
  /** Font weight (e.g., 'normal', 'bold', 'bolder', 'lighter', or a number like 400, 700). */
  weight?: string | number;
  /** Line height. Can be a number (multiplier) or a string (e.g., '1.2', '12px'). */
  lineHeight?: number | string;
}

/**
 * Defines padding for chart elements.
 * Can be a single number for uniform padding, or an object for specific sides.
 */
export type ChartPadding = number | {
  /** Padding on the top side. */
  top?: number;
  /** Padding on the right side. */
  right?: number