/**
 * @file src/types/dashboardTypes.ts
 * @description TypeScript interfaces for dashboard data structures (KPIs, charts, tables, text widgets, and overall dashboard layout).
 */

/**
 * Represents the trend direction for a Key Performance Indicator (KPI).
 */
export type KpiTrend = 'up' | 'down' | 'stable';

/**
 * Represents the status or health of a Key Performance Indicator (KPI).
 */
export type KpiStatus = 'good' | 'warning' | 'critical' | 'info';

/**
 * Defines the structure for a single Key Performance Indicator (KPI).
 */
export interface IKpiData {
  /**
   * Unique identifier for the KPI.
   */
  id: string;
  /**
   * The display label for the KPI (e.g., "Total Sales").
   */
  label: string;
  /**
   * The primary value of the KPI. Can be a number or a formatted string.
   */
  value: number | string;
  /**
   * Optional unit for the KPI value (e.g., "$", "%", "units").
   */
  unit?: string;
  /**
   * A brief description or explanation of the KPI.
   */
  description?: string;
  /**
   * The trend direction compared to a previous period.
   */
  trend?: KpiTrend;
  /**
   * The numerical value representing the change (e.g., 5.2 for 5.2% increase).
   */
  trendValue?: number;
  /**
   * Optional unit for the trend value (e.g., "%").
   */
  trendUnit?: string;
  /**
   * The status or health indicator for the KPI.
   */
  status?: KpiStatus;
  /**
   * Timestamp of when the KPI data was last updated (ISO 8601 string).
   */
  lastUpdated?: string;
  /**
   * Optional URL for more details related to the KPI.
   */
  detailsUrl?: string;
}

/**
 * Represents the various types of charts supported in the dashboard.
 */
export type ChartType =
  | 'bar'
  | 'line'
  | 'pie'
  | 'doughnut'
  | 'area'
  | 'scatter'
  | 'radar'
  | 'polarArea'
  | 'bubble';

/**
 * Represents a single data point within a chart dataset.
 * Can be a simple number, or an object for more complex charts like scatter plots.
 */
export type ChartDataPoint = number | { x: number | string; y: number | string; [key: string]: any };

/**
 * Defines the structure for a single dataset within a chart.
 */
export interface IChartDataset {
  /**
   * The label for this dataset (e.g., "Sales 2023").
   */
  label: string;
  /**
   * An array of data points for this dataset.
   */
  data: ChartDataPoint[];
  /**
   * Optional background color(s) for the dataset elements (e.g., bars, pie slices).
   */
  backgroundColor?: string | string[];
  /**
   * Optional border color(s) for the dataset elements.
   */
  borderColor?: string | string[];
  /**
   * Optional border width for the dataset elements.
   */
  borderWidth?: number;
  /**
   * For line charts, whether the area below the line should be filled.
   */
  fill?: boolean | 'origin' | 'start' | 'end';
  /**
   * For line charts, the bezier curve tension (0 for straight lines).
   */
  tension?: number;
  /**
   * Any other chart library-specific properties for the dataset.
   */
  [key: string]: any;
}

/**
 * Defines the overall data structure for a chart.
 */
export interface IChartData {
  /**
   * Optional labels for the x-axis or categories (e.g., months, product names).
   */
  labels?: string[];
  /**
   * An array of datasets to be displayed in the chart.
   */
  datasets: IChartDataset[];
  /**
   * Any other chart library-specific data properties.
   */
  [key: string]: any;
}

/**
 * Defines the generic options structure for a chart.
 * These options are typically specific to the charting library being used (e.g., Chart.js, Echarts).
 */
export type IChartOptions = Record<string, any>;

/**
 * Defines the alignment for text within a table column.
 */
export type TableColumnAlign = 'left' | 'center' | 'right';

/**
 * Defines the structure for a single column in a table widget.
 */
export interface ITableColumn {
  /**
   * Unique identifier for the column (should match keys in `ITableRow`).
   */
  id: string;
  /**
   * The display label for the column header.
   */
  label: string;
  /**
   * Optional alignment for the column's content.
   */
  align?: TableColumnAlign;
  /**
   * Optional function to format the cell value for display.
   * @param value The raw value of the cell.
   * @returns The formatted string for display.
   */
  format?: (value: any) => string;
  /**
   * Optional width for the column (e.g., "100px", "20%").
   */
  width?: string;
  /**
   * Whether the column is sortable.
   */
  sortable?: boolean;
  /**
   * Any other table library-specific properties for the column.
   */
  [key: string]: any;
}

/**
 * Defines the structure for a single row in a table widget.
 * Keys should correspond to `ITableColumn.id`.
 */
export type ITableRow = Record<string, any>;

/**
 * Defines the direction for sorting a table.
 */
export type TableSortDirection = 'asc' | 'desc';

/**
 * Represents the various types of widgets that can be placed on a dashboard.
 */
export type DashboardWidgetType = 'kpi' | 'chart' | 'table' | 'text';

/**
 * Base interface for all dashboard widgets, containing common properties.
 */
export interface IBaseDashboardWidget {
  /**
   * Unique identifier for the widget.
   */
  id: string;
  /**
   * The title displayed for the widget.
   */
  title: string;
  /**
   * A brief description of the widget's purpose or content.
   */
  description?: string;
  /**
   * The type of widget (e.g., 'kpi', 'chart', 'table', 'text').
   */
  type: DashboardWidgetType;
  /**
   * Timestamp of when the widget data was last updated (ISO 8601 string).
   */
  lastUpdated?: string;
  /**
   * Optional URL for more details related to the widget.
   */
  detailsUrl?: string;
}

/**
 * Interface for a KPI widget, displaying one or more KPIs.
 */
export interface IKpiWidget extends IBaseDashboardWidget {
  type: 'kpi';
  /**
   * An array of KPI data objects to be displayed within this widget.
   * A single widget might display multiple related KPIs.
   */
  data: IKpiData[];
}

/**
 * Interface for a Chart widget, displaying various types of charts.
 */
export interface IChartWidget extends IBaseDashboardWidget {
  type: 'chart';
  /**
   * The specific type of chart to render (e.g., 'bar', 'line', 'pie').
   */
  chartType: ChartType;
  /**
   * The data structure for the chart.
   */
  data: IChartData;
  /**
   * Optional configuration options for the chart, specific to the charting library.
   */
  options?: IChartOptions;
}

/**
 * Interface for a Table widget, displaying tabular data.
 */
export interface ITableWidget extends IBaseDashboardWidget {
  type: 'table';
  /**
   * Definitions for the columns in the table.
   */
  columns: ITableColumn[];
  /**
   * The actual data rows for the table.
   */
  rows: ITableRow[];
  /**
   * Optional pagination settings for the table.
   */
  pagination?: {
    /**
     * The current page number (1-indexed).
     */
    page: number;
    /**
     * The number of rows per page.
     */
    pageSize: number;
    /**
     * The total number of rows available.
     */
    total: number;
  };
  /**
   * Optional sorting settings for the table.
   */
  sort?: {
    /**
     * The ID of the column currently being sorted.
     */
    columnId: string;
    /**
     * The direction of the sort.
     */
    direction: TableSortDirection;
  };
}

/**
 * Defines the format for the content of a text widget.
 */
export type TextWidgetFormat = 'markdown' | 'html' | 'plain';

/**
 * Interface for a Text widget, displaying rich text content.
 */
export interface ITextWidget extends IBaseDashboardWidget {
  type: 'text';
  /**
   * The content of the text widget. Can be plain text, Markdown, or HTML.
   */
  content: string;
  /**
   * The format of the content (e.g., 'markdown', 'html', 'plain').
   */
  format?: TextWidgetFormat;
}

/**
 * A union type representing any possible dashboard widget.
 */
export type DashboardWidget = IKpiWidget | IChartWidget | ITableWidget | ITextWidget;

/**
 * Defines the layout properties for a single widget within a grid-based dashboard.
 * Inspired by react-grid-layout properties.
 */
export interface IDashboardLayoutItem {
  /**
   * The ID of the widget this layout item refers to.
   */
  i: string;
  /**
   * X position in grid units.
   */
  x: number;
  /**
   * Y position in grid units.
   */
  y: number;
  /**
   * Width in grid units.
   */
  w: number;
  /**
   * Height in grid units.
   */
  h: number;
  /**
   * Minimum width in grid units.
   */
  minW?: number;
  /**
   * Maximum width in grid units.
   */
  maxW?: number;
  /**
   * Minimum height in grid units.
   */
  minH?: number;
  /**
   * Maximum height in grid units.
   */
  maxH?: number;
  /**
   * If true, the item cannot be moved or resized.
   */
  static?: boolean;
  /**
   * If false, the item cannot be dragged.
   */
  isDraggable?: boolean;
  /**
   * If false, the item cannot be resized.
   */
  isResizable?: boolean;
}

/**
 * Defines the structure for a single page or tab within a multi-page dashboard.
 */
export interface IDashboardPage {
  /**
   * Unique identifier for the dashboard page.
   */
  id: string;
  /**
   * The title of the page (e.g., "Overview", "Sales Performance").
   */
  title: string;
  /**
   * A brief description of the page's content.
   */
  description?: string;
  /**
   * An array of widgets displayed on this page.
   */
  widgets: DashboardWidget[];
  /**
   * Optional layout configuration for the widgets on this page.
   * If not provided, widgets might be rendered in a default flow or stacked layout.
   */
  layout?: IDashboardLayoutItem[];
}

/**
 * Defines the comprehensive structure for an entire dashboard.
 */
export interface IDashboard {
  /**
   * Unique identifier for the dashboard.
   */
  id: string;
  /**
   * The name of the dashboard.
   */
  name: string;
  /**
   * A detailed description of the dashboard's purpose and content.
   */
  description?: string;
  /**
   * An array of pages that constitute the dashboard.
   * A dashboard can be single-page or multi-page (tabs).
   */
  pages: IDashboardPage[];
  /**
   * Timestamp of when the dashboard configuration was last updated (ISO 8601 string).
   */
  lastUpdated?: string;
  /**
   * Timestamp of when the dashboard was created (ISO 8601 string).
   */
  createdAt?: string;
  /**
   * Optional ID of the user or entity that owns/created the dashboard.
   */
  ownerId?: string;
  /**
   * Optional tags for categorization or search.
   */
  tags?: string[];
}