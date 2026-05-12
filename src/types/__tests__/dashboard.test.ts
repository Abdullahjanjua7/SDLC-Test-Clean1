import {
  MetricValue,
  Unit,
  TrendDirection,
  TrendData,
  TimeSeriesDataPoint,
  TimeSeriesDataSet,
  ChartSeries,
  PieChartSegment,
  TableColumn,
  DashboardWidgetType,
  DashboardWidgetBase,
  MetricCardWidget,
  TimeSeriesChartWidget,
  TableWidget,
  TextWidget,
  PieChartWidget,
  BarChartWidget,
  DashboardWidget,
  DashboardLayoutItem,
  DateRange,
  DashboardFilterType,
  DashboardFilterOption,
  DashboardFilter,
  DashboardFiltersState,
  DashboardDefinition,
  DashboardDataStatus,
} from './dashboard'; // Assuming the file is named dashboard.ts

describe('Dashboard Type Definitions', () => {
  // Test primitive types and enums
  describe('Primitive Types and Enums', () => {
    it('should correctly define MetricValue as a union of number, string, or boolean', () => {
      const numValue: MetricValue = 123;
      const stringValue: MetricValue = 'hello';
      const boolValue: MetricValue = true;

      expect(typeof numValue).toBe('number');
      expect(typeof stringValue).toBe('string');
      expect(typeof boolValue).toBe('boolean');
    });

    it('should correctly define Unit as a string', () => {
      const unit: Unit = 'USD';
      expect(typeof unit).toBe('string');
      expect(unit).toBe('USD');
    });

    it('should correctly define TrendDirection as specific literal strings', () => {
      const up: TrendDirection = 'up';
      const down: TrendDirection = 'down';
      const neutral: TrendDirection = 'neutral';

      expect(up).toBe('up');
      expect(down).toBe('down');
      expect(neutral).toBe('neutral');
      // TypeScript would catch invalid assignments at compile time.
      // const invalid: TrendDirection = 'sideways'; // This would be a compile-time error
    });

    it('should correctly define DashboardWidgetType as specific literal strings', () => {
      const types: DashboardWidgetType[] = [
        'metricCard',
        'timeSeriesChart',
        'table',
        'text',
        'pieChart',
        'barChart',
      ];
      expect(types.length).toBe(6);
      types.forEach((type) => expect(typeof type).toBe('string'));
    });

    it('should correctly define DashboardFilterType as specific literal strings', () => {
      const types: DashboardFilterType[] = [
        'dateRange',
        'select',
        'multiSelect',
        'text',
        'number',
      ];
      expect(types.length).toBe(5);
      types.forEach((type) => expect(typeof type).toBe('string'));
    });
  });

  // Test interfaces
  describe('Interfaces', () => {
    it('should correctly define TrendData interface', () => {
      const trend: TrendData = {
        value: 10.5,
        direction: 'up',
        percentageChange: 5.2,
      };

      expect(trend).toEqual({
        value: 10.5,
        direction: 'up',
        percentageChange: 5.2,
      });
      expect(typeof trend.value).toBe('number');
      expect(typeof trend.direction).toBe('string');
      expect(typeof trend.percentageChange).toBe('number');

      const trendWithoutPercentage: TrendData = {
        value: -2.1,
        direction: 'down',
      };
      expect(trendWithoutPercentage.percentageChange).toBeUndefined();
    });

    it('should correctly define TimeSeriesDataPoint interface with default generic (number)', () => {
      const point1: TimeSeriesDataPoint = {
        timestamp: new Date('2023-01-01T00:00:00Z'),
        value: 100,
      };
      const point2: TimeSeriesDataPoint = {
        timestamp: '2023-01-02T00:00:00Z',
        value: 120.5,
      };

      expect(point1.timestamp).toBeInstanceOf(Date);
      expect(typeof point1.value).toBe('number');
      expect(typeof point2.timestamp).toBe('string');
      expect(typeof point2.value).toBe('number');
    });

    it('should correctly define TimeSeriesDataPoint interface with custom generic (string)', () => {
      const point: TimeSeriesDataPoint<string> = {
        timestamp: '2023-01-03T00:00:00Z',
        value: 'high',
      };

      expect(typeof point.value).toBe('string');
      expect(point.value).toBe('high');
    });

    it('should correctly define TimeSeriesDataSet type with default generic (number)', () => {
      const dataSet: TimeSeriesDataSet = [
        { timestamp: '2023-01-01', value: 10 },
        { timestamp: new Date('2023-01-02'), value: 20 },
      ];

      expect(Array.isArray(dataSet)).toBe(true);
      expect(dataSet.length).toBe(2);
      expect(typeof dataSet[0].value).toBe('number');
    });

    it('should correctly define TimeSeriesDataSet type with custom generic (boolean)', () => {
      const dataSet: TimeSeriesDataSet<boolean> = [
        { timestamp: '2023-01-01', value: true },
        { timestamp: new Date('2023-01-02'), value: false },
      ];

      expect(Array.isArray(dataSet)).toBe(true);
      expect(dataSet.length).toBe(2);
      expect(typeof dataSet[0].value).toBe('boolean');
    });

    it('should correctly define ChartSeries interface with default generic (number)', () => {
      const series: ChartSeries = {
        id: 'sales',
        label: 'Total Sales',
        data: [
          { timestamp: '2023-01-01', value: 100 },
          { timestamp: '2023-01-02', value: 150 },
        ],
        color: '#FF0000',
        type: 'line',
      };

      expect(series.id).toBe('sales');
      expect(series.label).toBe('Total Sales');
      expect(series.data.length).toBe(2);
      expect(series.data[0].value).toBe(100);
      expect(series.color).toBe('#FF0000');
      expect(series.type).toBe('line');

      const minimalSeries: ChartSeries = {
        id: 'revenue',
        label: 'Revenue',
        data: [{ timestamp: '2023-01-01', value: 500 }],
      };
      expect(minimalSeries.color).toBeUndefined();
      expect(minimalSeries.type).toBeUndefined();
    });

    it('should correctly define ChartSeries interface with custom generic (string)', () => {
      const series: ChartSeries<string> = {
        id: 'status',
        label: 'System Status',
        data: [
          { timestamp: '2023-01-01', value: 'online' },
          { timestamp: '2023-01-02', value: 'offline' },
        ],
      };
      expect(series.data[0].value).toBe('online');
      expect(typeof series.data[0].value).toBe('string');
    });

    it('should correctly define PieChartSegment interface', () => {
      const segment: PieChartSegment = {
        label: 'Category A',
        value: 250,
        color: '#ABCDEF',
      };

      expect(segment).toEqual({ label: 'Category A', value: 250, color: '#ABCDEF' });
      expect(typeof segment.label).toBe('string');
      expect(typeof segment.value).toBe('number');
      expect(typeof segment.color).toBe('string');

      const minimalSegment: PieChartSegment = { label: 'Category B', value: 100 };
      expect(minimalSegment.color).toBeUndefined();
    });

    it('should correctly define TableColumn interface with generic T', () => {
      interface MyRowData {
        id: string;
        name: string;
        age: number;
        isActive: boolean;
      }

      const columns: TableColumn<MyRowData>[] = [
        { id: 'id', label: 'ID', sortable: true },
        { id: 'name', label: 'Name', type: 'text' },
        {
          id: 'age',
          label: 'Age',
          type: 'number',
          format: (value) => `${value} years`,
        },
        { id: 'isActive', label: 'Active', type: 'boolean' },
      ];

      expect(columns.length).toBe(4);
      expect(columns[0].id).toBe('id');
      expect(columns[2].format?.(30)).toBe('30 years');
      expect(columns[3].type).toBe('boolean');
    });

    it('should correctly define DashboardWidgetBase interface', () => {
      const baseWidget: DashboardWidgetBase = {
        id: 'widget-1',
        title: 'My Base Widget',
        type: 'metricCard', // Must be a valid DashboardWidgetType
        description: 'A generic widget',
        dataSourceId: 'source-123',
      };

      expect(baseWidget.id).toBe('widget-1');
      expect(baseWidget.title).toBe('My Base Widget');
      expect(baseWidget.type).toBe('metricCard');
      expect(baseWidget.description).toBe('A generic widget');
      expect(baseWidget.dataSourceId).toBe('source-123');

      const minimalBaseWidget: DashboardWidgetBase = {
        id: 'widget-2',
        title: 'Minimal Widget',
        type: 'text',
      };
      expect(minimalBaseWidget.description).toBeUndefined();
    });

    it('should correctly define MetricCardWidget interface', () => {
      const metricCard: MetricCardWidget = {
        id: 'metric-1',
        title: 'Total Revenue',
        type: 'metricCard',
        value: 12345.67,
        unit: 'USD',
        trend: { value: 1200, direction: 'up', percentageChange: 10.5 },
        secondaryLabel: 'Last 30 days',
      };

      expect(metricCard.type).toBe('metricCard');
      expect(metricCard.value).toBe(12345.67);
      expect(metricCard.unit).toBe('USD');
      expect(metricCard.trend?.direction).toBe('up');
      expect(metricCard.secondaryLabel).toBe('Last 30 days');

      const simpleMetricCard: MetricCardWidget = {
        id: 'metric-2',
        title: 'Users Online',
        type: 'metricCard',
        value: 500,
      };
      expect(simpleMetricCard.unit).toBeUndefined();
    });

    it('should correctly define TimeSeriesChartWidget interface', () => {
      const chart: TimeSeriesChartWidget = {
        id: 'chart-1',
        title: 'Daily Active Users',
        type: 'timeSeriesChart',
        series: [
          {
            id: 'dau',
            label: 'DAU',
            data: [
              { timestamp: '2023-01-01', value: 1000 },
              { timestamp: '2023-01-02', value: 1200 },
            ],
            color: 'blue',
          },
        ],
        xAxisLabel: 'Date',
        yAxisLabel: 'Users',
        chartType: 'line',
        stacked: false,
      };

      expect(chart.type).toBe('timeSeriesChart');
      expect(chart.series.length).toBe(1);
      expect(chart.series[0].label).toBe('DAU');
      expect(chart.xAxisLabel).toBe('Date');
      expect(chart.chartType).toBe('line');
      expect(chart.stacked).toBe(false);
    });

    it('should correctly define TableWidget interface with generic T', () => {
      interface ProductRow {
        id: string;
        name: string;
        price: number;
        stock: number;
      }

      const table: TableWidget<ProductRow> = {
        id: 'table-1',
        title: 'Product Inventory',
        type: 'table',
        columns: [
          { id: 'name', label: 'Product Name', type: 'text' },
          { id: 'price', label: 'Price', type: 'currency', sortable: true },
          { id: 'stock', label: 'Stock', type: 'number' },
        ],
        data: [
          { id: 'p1', name: 'Laptop', price: 1200, stock: 50 },
          { id: 'p2', name: 'Mouse', price: 25, stock: 200 },
        ],
        rowsPerPage: 10,
        sortable: true,
      };

      expect(table.type).toBe('table');
      expect(table.columns.length).toBe(3);
      expect(table.data.length).toBe(2);
      expect(table.data[0].name).toBe('Laptop');
      expect(table.rowsPerPage).toBe(10);
      expect(table.sortable).toBe(true);
    });

    it('should correctly define TextWidget interface', () => {
      const textWidget: TextWidget = {
        id: 'text-1',
        title: 'Welcome Message',
        type: 'text',
        content: '<h1>Hello Dashboard!</h1><p>This is a text widget.</p>',
        isHtml: true,
      };

      expect(textWidget.type).toBe('text');
      expect(textWidget.content).toContain('<h1>Hello Dashboard!</h1>');
      expect(textWidget.isHtml).toBe(true);

      const plainTextWidget: TextWidget = {
        id: 'text-2',
        title: 'Plain Text',
        type: 'text',
        content: 'Just plain text.',
      };
      expect(plainTextWidget.isHtml).toBeUndefined();
    });

    it('should correctly define PieChartWidget interface', () => {
      const pieChart: PieChartWidget = {
        id: 'pie-1',
        title: 'Sales by Region',
        type: 'pieChart',
        data: [
          { label: 'North', value: 300, color: 'red' },
          { label: 'South', value: 200, color: 'blue' },
          { label: 'East', value: 150 },
        ],
        donut: true,
      };

      expect(pieChart.type).toBe('pieChart');
      expect(pieChart.data.length).toBe(3);
      expect(pieChart.data[0].label).toBe('North');
      expect(pieChart.donut).toBe(true);
    });

    it('should correctly define BarChartWidget interface', () => {
      const barChart: BarChartWidget = {
        id: 'bar-1',
        title: 'Monthly Sales',
        type: 'barChart',
        categories: ['Jan', 'Feb', 'Mar'],
        series: [
          { id: 's1', label: 'Product A', data: [100, 120, 150], color: 'green' },
          { id: 's2', label: 'Product B', data: [80, 90, 110] },
        ],
        xAxisLabel: 'Month',
        yAxisLabel: 'Sales',
        stacked: true,
        horizontal: false,
      };

      expect(barChart.type).toBe('barChart');
      expect(barChart.categories).toEqual(['Jan', 'Feb', 'Mar']);
      expect(barChart.series.length).toBe(2);
      expect(barChart.series[0].label).toBe('Product A');
      expect(barChart.series[0].data).toEqual([100, 120, 150]);
      expect(barChart.stacked).toBe(true);
      expect(barChart.horizontal).toBe(false);
    });

    it('should correctly define DashboardWidget union type', () => {
      const metricCard: DashboardWidget = {
        id: 'union-metric',
        title: 'Metric',
        type: 'metricCard',
        value: 100,
      };

      const timeSeriesChart: DashboardWidget = {
        id: 'union-chart',
        title: 'Chart',
        type: 'timeSeriesChart',
        series: [{ id: 's1', label: 'Data', data: [{ timestamp: '2023', value: 1 }] }],
      };

      const table: DashboardWidget = {
        id: 'union-table',
        title: 'Table',
        type: 'table',
        columns: [{ id: 'col1', label: 'Column 1' }],
        data: [{ col1: 'value' }],
      };

      expect(metricCard.type).toBe('metricCard');
      expect(timeSeriesChart.type).toBe('timeSeriesChart');
      expect(table.type).toBe('table');

      // Type guards would be used in runtime code to differentiate
      if (metricCard.type === 'metricCard') {
        expect(metricCard.value).toBe(100);
      }
    });

    it('should correctly define DashboardLayoutItem interface', () => {
      const layoutItem: DashboardLayoutItem = {
        i: 'widget-1',
        x: 0,
        y: 0,
        w: 6,
        h: 4,
        minW: 2,
        maxH: 8,
        static: false,
      };

      expect(layoutItem.i).toBe('widget-1');
      expect(layoutItem.x).toBe(0);
      expect(layoutItem.y).toBe(0);
      expect(layoutItem.w).toBe(6);
      expect(layoutItem.h).toBe(4);
      expect(layoutItem.minW).toBe(2);
      expect(layoutItem.maxH).toBe(8);
      expect(layoutItem.static).toBe(false);

      const minimalLayoutItem: DashboardLayoutItem = {
        i: 'widget-2',
        x: 1,
        y: 1,
        w: 3,
        h: 2,
      };
      expect(minimalLayoutItem.minW).toBeUndefined();
    });

    it('should correctly define DateRange interface', () => {
      const dateRange1: DateRange = {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-31'),
      };
      const dateRange2: DateRange = {
        startDate: '2023-02-01T00:00:00Z',
        endDate: '2023-02-28T23:59:59Z',
      };

      expect(dateRange1.startDate).toBeInstanceOf(Date);
      expect(dateRange2.endDate).toBe('2023-02-28T23:59:59Z');
    });

    it('should correctly define DashboardFilterOption interface', () => {
      const option1: DashboardFilterOption = { label: 'Option A', value: 'a' };
      const option2: DashboardFilterOption = { label: 'Option B', value: 123 };

      expect(option1.label).toBe('Option A');
      expect(option1.value).toBe('a');
      expect(option2.value).toBe(123);
    });

    it('should correctly define DashboardFilter interface', () => {
      const dateFilter: DashboardFilter = {
        id: 'dateFilter',
        label: 'Date Range',
        type: 'dateRange',
        defaultValue: { startDate: '2023-01-01', endDate: '2023-01-31' },
      };

      const selectFilter: DashboardFilter = {
        id: 'regionFilter',
        label: 'Region',
        type: 'select',
        options: [
          { label: 'North', value: 'north' },
          { label: 'South', value: 'south' },
        ],
        defaultValue: 'north',
      };

      const textFilter: DashboardFilter = {
        id: 'searchFilter',
        label: 'Search',
        type: 'text',
        placeholder: 'Enter keyword',
      };

      expect(dateFilter.type).toBe('dateRange');
      expect(selectFilter.options?.length).toBe(2);
      expect(selectFilter.defaultValue).toBe('north');
      expect(textFilter.placeholder).toBe('Enter keyword');
    });

    it('should correctly define DashboardFiltersState type', () => {
      const filterState: DashboardFiltersState = {
        dateFilter: { startDate: '2023-03-01', endDate: '2023-03-31' },
        regionFilter: 'east',
        searchFilter: 'active',
        numberFilter: 123,
      };

      expect(filterState.dateFilter).toEqual({
        startDate: '2023-03-01',
        endDate: '2023-03-31',
      });
      expect(filterState.regionFilter).toBe('east');
      expect(filterState.searchFilter).toBe('active');
      expect(filterState.numberFilter).toBe(123);
    });

    it('should correctly define DashboardDefinition interface', () => {
      const dashboard: DashboardDefinition = {
        id: 'my-dashboard',
        name: 'Sales Overview',
        description: 'A comprehensive view of sales data.',
        widgets: [
          {
            id: 'metric-widget',
            title: 'Total Sales',
            type: 'metricCard',
            value: 50000,
            unit: 'USD',
          },
          {
            id: 'chart-widget',
            title: 'Monthly Trend',
            type: 'timeSeriesChart',
            series: [{ id: 's1', label: 'Sales', data: [] }],
          },
        ],
        layout: [
          { i: 'metric-widget', x: 0, y: 0, w: 4, h: 2 },
          { i: 'chart-widget', x: 4, y: 0, w: 8, h: 4 },
        ],
        filters: [
          { id: 'period', label: 'Period', type: 'dateRange' },
          {
            id: 'product',
            label: 'Product',
            type: 'select',
            options: [{ label: 'All', value: 'all' }],
          },
        ],
        initialFilterState: {
          period: { startDate: '2023-01-01', endDate: '2023-12-31' },
        },
        lastUpdated: new Date('2023-10-26T10:00:00Z'),
      };

      expect(dashboard.id).toBe('my-dashboard');
      expect(dashboard.name).toBe('Sales Overview');
      expect(dashboard.widgets.length).toBe(2);
      expect(dashboard.layout.length).toBe(2);
      expect(dashboard.filters?.length).toBe(2);
      expect(dashboard.initialFilterState?.period).toBeDefined();
      expect(dashboard.lastUpdated).toBeInstanceOf(Date);

      const minimalDashboard: DashboardDefinition = {
        id: 'minimal-dash',
        name: 'Minimal Dashboard',
        widgets: [],
        layout: [],
      };
      expect(minimalDashboard.description).toBeUndefined();
    });

    it('should correctly define DashboardDataStatus interface with generic T', () => {
      interface UserData {
        name: string;
        email: string;
      }

      const loadingStatus: DashboardDataStatus<UserData[]> = {
        isLoading: true,
        error: null,
        data: null,
      };

      const successStatus: DashboardDataStatus<UserData[]> = {
        isLoading: false,
        error: null,
        data: [{ name: 'John Doe', email: 'john@example.com' }],
      };

      const errorStatus: DashboardDataStatus<string> = {
        isLoading: false,
        error: 'Failed to fetch data',
        data: null,
      };

      expect(loadingStatus.isLoading).toBe(true);
      expect(loadingStatus.data).toBeNull();

      expect(successStatus.isLoading).toBe(false);
      expect(successStatus.data?.[0].name).toBe('John Doe');

      expect(errorStatus.error).toBe('Failed to fetch data');
      expect(errorStatus.data).toBeNull();
    });
  });
});