/**
 * @file TypeScript interfaces for dashboard data structures and API responses.
 */

// --- 1. Basic IDs and Common Types ---

/** Unique identifier for a dashboard. */
export type DashboardId = string;
/** Unique identifier for a widget within a dashboard. */
export type WidgetId = string;

/** Common properties for layout items, often used with grid layout libraries (e.g., react-grid-layout). */
export interface LayoutItem {
  /** X position in grid units. */
  x: number;
  /** Y position in grid units. */
  y: number;
  /** Width in grid units. */
  w: number;
  /** Height in grid units. */
  h: number;
  /** Minimum width in grid units. */
  minW?: number;
  /** Maximum width in grid units. */
  maxW?: number;
  /** Minimum height in grid units. */
  minH?: number;
  /** Maximum height in grid units. */
  maxH?: number;
  /** If true, the item cannot be moved or resized. */
  static?: boolean;
}

// --- 2. Widget Data Types ---

/** Represents a single data point in a time series or categorical chart. */
export interface TimeSeriesDataPoint {
  /** The timestamp or category label for the data point. Can be a Date string, Unix timestamp, or category name. */
  timestamp: string | number;
  /**