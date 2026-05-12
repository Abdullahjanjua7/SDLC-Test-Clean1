/**
 * Represents a generic value for a metric, which can be a number, string, or boolean.
 */
export type MetricValue = number | string | boolean;

/**
 * Represents a unit of measurement for a metric (e.g., "USD", "%", "items").
 */
export type Unit = string;

/**
 * Defines the direction of a trend.
 */
export type TrendDirection = 'up' | 'down' | 'neutral';

/**
 * Represents trend data for a metric, including its value, direction, and optional percentage change.
 */
export interface TrendData {
  /** The numeric value representing the trend (e.g., the change amount). */
  value: number;
  /** The direction of the trend. */
  direction: TrendDirection;
  /** Optional percentage change associated with the trend. */
  percentageChange?: number;
}

/**
 * Represents a single data point in a time series.
 * @template T The type of the value in the time series (defaults to number).
 */
export interface TimeSeriesDataPoint<T = number> {
  /** The timestamp of the data point. Can be a Date object or an ISO string. */
  timestamp: Date | string;
  /** The value at this timestamp. */
  value: T;
}

/**
 * Represents a dataset for a time series, an array of data points.
 * @template T The type of the value in the time series (defaults to number).
 */
export type TimeSeriesDataSet<T = number> = TimeSeriesDataPoint<T>[];

/**
 * Defines a single series within a chart, typically used for time series charts.
 * @template T The type of the value in the series (defaults to number).
 */
export interface ChartSeries<T = number> {
  /** A unique identifier for the series. */
  id: string;
  /** The human-readable label for the series. */
  label: string;
  /** The actual data points for the series. */
  data: TimeSeriesDataSet<T>;
  /** Optional color for rendering the series. */
  color?: string;
  /** Optional type override for this specific series (e.g., 'line', 'bar', 'area'). */
  type?: 'line' | 'bar' | 'area';
}

/**
 * Represents a segment in a pie or donut chart.
 */
export interface PieChartSegment {
  /** The label for this segment. */
  label: string;
  /** The numeric value of this segment. */
  value: number;
  /** Optional color for this segment. */
  color?: string;
}

/**
 * Defines the properties of a column in a table widget.
 * @template T The type of the data object for each row in the table.
 */
export interface TableColumn<T extends Record<string, any>> {
  /** The key from the data object that this column represents. */
  id: keyof T;
  /** The human-readable label for the column header. */
  label: string;
  /** Optional type hint for rendering or sorting (e.g., 'text', 'number', 'date', 'currency'). */
  type?: 'text' | 'number' | 'date' | 'currency' | 'percentage' | 'boolean';
  /** Indicates if the column is sortable. */
  sortable?: boolean;
  /** Optional function to format the cell value for display. */
  format?: (value: T[keyof T]) => string | number | JSX.Element;
}

/**
 * Defines the types of widgets that can be displayed on a dashboard.
 */
export type DashboardWidgetType =
  | 'metricCard'
  | 'timeSeriesChart'
  | 'table'
  | 'text'
  | 'pieChart'
  | 'barChart';

/**
 * Base interface for all dashboard widgets, providing common properties.
 */
export interface DashboardWidgetBase {
  /** A unique identifier for the widget. */
  id: string;
  /** The title displayed for the widget. */
  title: string;
  /** The type of the widget. */
  type: DashboardWidgetType;
  /** Optional description or subtitle for the widget. */
  description?: string;
  /** Optional data source ID if the widget fetches data from a specific source. */
  dataSourceId?: string;
}

/**
 * Represents a metric card widget, displaying a single key metric.
 */
export interface MetricCardWidget extends DashboardWidgetBase {
  type: 'metricCard';
  /** The main value to display on the card. */
  value: MetricValue;
  /** Optional unit for the metric value. */
  unit?: Unit;
  /** Optional trend data to display alongside the value. */
  trend?: TrendData;
  /** Optional secondary label or context for the metric. */
  secondaryLabel?: string;
}

/**
 * Represents a time series chart widget.
 */
export interface TimeSeriesChartWidget extends DashboardWidgetBase {
  type: 'timeSeriesChart';
  /** An array of chart series to display. */
  series: ChartSeries[];
  /** Optional label for the X-axis. */
  xAxisLabel?: string;
  /** Optional label for the Y-axis. */
  yAxisLabel?: string;
  /** The specific chart type to render (e.g., 'line', 'bar', 'area'). */
  chartType?: 'line' | 'bar' | 'area';
  /** Indicates if the chart should stack series. */
  stacked?: boolean;
}

/**
 * Represents a table widget displaying tabular data.
 * @template T The type of the data object for each row in the table.
 */
export interface TableWidget<T extends Record<string, any>> extends DashboardWidgetBase {
  type: 'table';
  /** Definitions for the table columns. */
  columns: TableColumn<T>[];
  /** The actual data rows for the table. */
  data: T[];
  /** Optional number of rows to display per page if pagination is enabled. */
  rowsPerPage?: number;
  /** Indicates if the table should be sortable by columns. */
  sortable?: boolean;
}

/**
 * Represents a text widget for displaying rich text content.
 */
export interface TextWidget extends DashboardWidgetBase {
  type: 'text';
  /** The content of the text widget, can be plain text or HTML. */
  content: string;
  /** Optional flag to indicate if the content is HTML. */
  isHtml?: boolean;
}

/**
 * Represents a pie chart widget.
 */
export interface PieChartWidget extends DashboardWidgetBase {
  type: 'pieChart';
  /** The data segments for the pie chart. */
  data: PieChartSegment[];
  /** Optional flag to render as a donut chart. */
  donut?: boolean;
}

/**
 * Represents a bar chart widget.
 */
export interface BarChartWidget extends DashboardWidgetBase {
  type: 'barChart';
  /** The categories for the bar chart (e.g., product names, regions). */
  categories: string[];
  /** An array of chart series, where each series represents a set of bars for the categories. */
  series: Array<{
    id: string;
    label: string;
    data: number[]; // Data points correspond to categories
    color?: string;
  }>;
  /** Optional label for the X-axis. */
  xAxisLabel?: string;
  /** Optional label for the Y-axis. */
  yAxisLabel?: string;
  /** Indicates if the bars should be stacked. */
  stacked?: boolean;
  /** Indicates if the bars should be horizontal. */
  horizontal?: boolean;
}

/**
 * A union type representing any possible dashboard widget.
 */
export type DashboardWidget =
  | MetricCardWidget
  | TimeSeriesChartWidget
  | TableWidget<Record<string, any>>
  | TextWidget
  | PieChartWidget
  | BarChartWidget;

/**
 * Represents an item's position and size within a dashboard layout grid.
 * Typically used with grid layout libraries (e.g., React Grid Layout).
 */
export interface DashboardLayoutItem {
  /** The ID of the widget this layout item corresponds to. */
  i: string;
  /** X-coordinate (column) of the item. */
  x: number;
  /** Y-coordinate (row) of the item. */
  y: number;
  /** Width of the item in grid units. */
  w: number;
  /** Height of the item in grid units. */
  h: number;
  /** Optional minimum width. */
  minW?: number;
  /** Optional maximum width. */
  maxW?: number;
  /** Optional minimum height. */
  minH?: number;
  /** Optional maximum height. */
  maxH?: number;
  /** If true, the item cannot be moved or resized. */
  static?: boolean;
}

/**
 * Represents a date range, typically used for filtering dashboard data.
 */
export interface DateRange {
  /** The start date of the range. Can be a Date object or an ISO string. */
  startDate: Date | string;
  /** The end date of the range. Can be a Date object or an ISO string. */
  endDate: Date | string;
}

/**
 * Defines the type of a dashboard filter input.
 */
export type DashboardFilterType = 'dateRange' | 'select' | 'multiSelect' | 'text' | 'number';

/**
 * Represents an option for 'select' or 'multiSelect' dashboard filters.
 */
export interface DashboardFilterOption {
  /** The human-readable label for the option. */
  label: string;
  /** The value associated with the option. */
  value: string | number;
}

/**
 * Defines a single filter available for a dashboard.
 */
export interface DashboardFilter {
  /** A unique identifier for the filter. */
  id: string;
  /** The human-readable label for the filter. */
  label: string;
  /** The type of input control for the filter. */
  type: DashboardFilterType;
  /** Optional default value for the filter. */
  defaultValue?: any;
  /** Options for 'select' or 'multiSelect' filter types. */
  options?: DashboardFilterOption[];
  /** Optional placeholder text for text/number inputs. */
  placeholder?: string;
}

/**
 * Represents the current state of all filters applied to a dashboard.
 * The keys are filter IDs and values are the selected filter values.
 */
export type DashboardFiltersState = Record<string, any>;

/**
 * Represents the complete definition of a dashboard, including its widgets and layout.
 */
export interface DashboardDefinition {
  /** A unique identifier for the dashboard. */
  id: string;
  /** The name of the dashboard. */
  name: string;
  /** Optional description of the dashboard. */
  description?: string;
  /** An array of widgets displayed on the dashboard. */
  widgets: DashboardWidget[];
  /** The layout configuration for positioning and sizing widgets. */
  layout: DashboardLayoutItem[];
  /** Optional array of filters available for this dashboard. */
  filters?: DashboardFilter[];
  /** Optional initial state for the dashboard filters. */
  initialFilterState?: DashboardFiltersState;
  /** Optional timestamp for when the dashboard was last updated. */
  lastUpdated?: Date | string;
}

/**
 * A utility type to represent the loading status and data for any dashboard-related data.
 * @template T The type of the data being loaded.
 */
export interface DashboardDataStatus<T> {
  /** Indicates if the data is currently being loaded. */
  isLoading: boolean;
  /** Any error message if data loading failed. */
  error: string | null;
  /** The loaded data, or null if not yet loaded or an error occurred. */
  data: T | null;
}