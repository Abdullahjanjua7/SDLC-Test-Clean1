/**
 * src/types/kpi.ts
 *
 * TypeScript interfaces for Key Performance Indicator (KPI) data structures.
 * This file defines types for KPI definitions, current data, historical entries,
 * and a complete KPI object, along with related enumerations and utility types.
 */

/**
 * Represents the trend direction of a KPI.
 * - 'up': The KPI's value is increasing.
 * - 'down': The KPI's value is decreasing.
 * - 'stable': The KPI's value is relatively unchanged.
 * - 'neutral': No specific trend is observed or applicable.
 */
export type KpiTrend = 'up' | 'down' | 'stable' | 'neutral';

/**
 * Represents the current status or health of a KPI.
 * - 'good': The KPI is performing well, meeting or exceeding targets.
 * - 'warning': The KPI is approaching a critical state or slightly below target.
 * - 'critical': The KPI is significantly off target or in a problematic state.
 * - 'info': Informational status, no specific performance judgment.
 */
export type KpiStatus = 'good' | 'warning' | 'critical' | 'info';

/**
 * Defines the data type of a KPI's value, useful for formatting and interpretation.
 * - 'number': A general numeric value (e.g., 12345).
 * - 'percentage': A value representing a percentage (e.g., 0.75 for 75%).
 * - 'currency': A monetary value (e.g., 123.45).
 * - 'duration': A time duration (e.g., in seconds, minutes, hours).
 * - 'ratio': A ratio (e.g., 1.5:1).
 */
export type KpiDataType = 'number' | 'percentage' | 'currency' | 'duration' | 'ratio';

/**
 * Defines the static metadata and configuration for a Key Performance Indicator (KPI).
 * This includes properties that typically do not change frequently.
 */
export interface KpiDefinition {
  /**
   * Unique identifier for the KPI.
   * @example "sales-growth-q3"
   */
  id: string;
  /**
   * Display name of the KPI.
   * @example "Quarterly Sales Growth"
   */
  name: string;
  /**
   * A detailed description of what the KPI measures and its significance.
   */
  description?: string;
  /**
   * The category or group the KPI belongs to (e.g., 'Sales', 'Marketing', 'Operations', 'Finance').
   */
  category?: string;
  /**
   * The unit of measurement for the KPI's value (e.g., '%', '$', 'count', 'hours', 'users').
   */
  unit: string;
  /**
   * The data type of the KPI's value, guiding how it should be displayed and interpreted.
   */
  dataType: KpiDataType;
}

/**
 * Represents a single data point in the historical series of a KPI.
 * This is used to track how a KPI's value has changed over time.
 */
export interface KpiHistoricalEntry {
  /**
   * The timestamp when this data point was recorded.
   * Should be an ISO 8601 string for consistency (e.g., "2023-10-27T10:00:00Z").
   */
  timestamp: string;
  /**
   * The value of the KPI at this specific timestamp.
   */
  value: number;
  /**
   * The target value for the KPI at this timestamp, if applicable and varying over time.
   */
  target?: number;
}

/**
 * Represents the current or latest data snapshot for a Key Performance Indicator (KPI).
 * This includes dynamic values that change frequently.
 */
export interface KpiData {
  /**
   * The current measured value of the KPI.
   */
  currentValue: number;
  /**
   * The target value set for the KPI, against which `currentValue` is compared.
   */
  targetValue?: number;
  /**
   * A value for comparison, e.g., previous period's value, budget, or benchmark.
   * This helps in understanding the context of the `currentValue`.
   */
  comparisonValue?: number;
  /**
   * The observed trend of the KPI's value, indicating its direction of change.
   */
  trend?: KpiTrend;
  /**
   * The current status or health of the KPI based on its value and target.
   */
  status?: KpiStatus;
  /**
   * The timestamp when this KPI data was last updated.
   * Should be an ISO 8601 string for consistency (e.g., "2023-10-27T10:30:00Z").
   */
  lastUpdated: string;
}

/**
 * Represents a complete Key Performance Indicator (KPI) object,
 * combining its static definition, current data, and optional historical performance.
 */
export interface Kpi extends KpiDefinition, KpiData {
  /**
   * An array of historical data points for the KPI, ordered chronologically.
   */
  history?: KpiHistoricalEntry[];
  /**
   * General-purpose metadata for the entire KPI object.
   * This can include any additional, unstructured data relevant to the KPI
   * that doesn't fit into the predefined properties.
   */
  metadata?: Record<string, any>;
}

/**
 * Represents a collection or list of Key Performance Indicators.
 * This is useful for displaying multiple KPIs in a dashboard or report.
 */
export type KpiCollection = Kpi[];

/**
 * Represents a summary or aggregated view of a KPI.
 * This type uses the `Pick` utility type to select essential properties,
 * useful for lighter payloads or simplified displays where full details are not needed.
 */
export type KpiSummary = Pick<
  Kpi,
  'id' | 'name' | 'currentValue' | 'targetValue' | 'unit' | 'dataType' | 'trend' | 'status' | 'lastUpdated'
>;