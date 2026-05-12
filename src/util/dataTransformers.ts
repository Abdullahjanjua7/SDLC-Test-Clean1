/**
 * @file Utility functions for transforming raw API data into chart-ready formats.
 * @module dataTransformers
 */

/**
 * Represents a single data point for a simple category-value chart (e.g., bar, line).
 */
export interface ChartCategoryValue {
  /** The category label (e.g., month, region name). */
  category: string;
  /** The numeric value associated with the category. */
  value: number;
}

/**
 * Represents a single data point for a multi-series category-value chart (e.g., grouped bar, multi-line).
 * It includes a category and dynamic properties for each series.
 * Example: `{ category: 'Jan', 'Series A': 10, 'Series B': 5 }`
 */
export interface ChartMultiSeriesCategoryValue {
  /** The main category label (e.g., month, year). */
  category: string;
  /** Dynamic properties where keys are series names (strings) and values are numbers. */
  [seriesName: string]: string | number; // category is string, series values are numbers
}

/**
 * Represents a single slice or segment for a pie or donut chart.
 */
export interface ChartPieData {
  /** The label for the pie slice (e.g., product name, status). */
  label: string;
  /** The numeric value representing the size of the slice. */
  value: number;
}

/**
 * Defines the available aggregation types for values.
 */
export type AggregationType = 'sum' | 'count' | 'average' | 'min' | 'max';

/**
 * Helper function to aggregate an array of numbers based on a specified aggregation type.
 * Handles empty arrays by returning 0 to prevent issues with chart rendering.
 *
 * @param {number[]} values An array of numeric values to aggregate.
 * @param {AggregationType} type The type of aggregation to perform.
 * @returns {number} The aggregated value. Returns 0 if the input array is empty.
 */
function aggregateValues(values: number[], type: AggregationType): number {
  if (values.length === 0) {
    // For charting, returning 0 is generally safer than Infinity/-Infinity or NaN
    // as it won't break chart rendering and represents 'no value' for the group.
    return 0;
  }

  switch (type) {
    case 'sum':
      return values.reduce((acc, val) => acc + val, 0);
    case 'count':
      return values.length;
    case 'average':
      return values.reduce((acc, val) => acc + val, 0) / values.length;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    default:
      // This case should ideally not be reached due to TypeScript's type checking
      // but provides a safe fallback.
      return 0;
  }
}

/**
 * Transforms an array of raw data objects into a single-series category-value format
 * suitable for bar, line, or area charts. It groups data by a specified category key
 * and aggregates a value key.
 *
 * @template T The type of the raw data objects. Must be an object with string keys.
 * @param {T[]} data The array of raw data objects.
 * @param {keyof T}