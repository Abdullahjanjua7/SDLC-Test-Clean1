/**
 * Represents a single data point for a chart series.
 * Can be a simple number, an [x, y] tuple, or an object with x and y properties.
 * For more complex charts (e.g., bubble, candlestick), additional properties might be needed.
 */
export type ChartDataPoint = number | [any, number] | { x: any; y: number | number[] | null; [key: string]: any };

/**
 * Defines the available chart types.
 */
export type ChartType =
  | 'line'
  | 'bar'
  | 'area'
  | 'pie'
  | 'donut'
  | 'radialBar'
  | 'scatter'
  | 'bubble'
  | 'heatmap'
  | 'candlestick'
  | 'radar'
  | 'treemap';

/**
 * Generic type for a color, which can be a single string, an array of strings, or a function returning a string.
 */
export type ChartColor = string | string[] | ((value: any) => string);

/**
 * Defines font weight options.
 */
export type ChartFontWeight = 'normal' | 'bold' | 'bolder' | 'lighter' | number;

/**
 * Defines text alignment options.
 */
export type ChartAlign = 'left' | 'center' | 'right';

/**
 * Defines vertical alignment options.
 */
export type ChartVertical