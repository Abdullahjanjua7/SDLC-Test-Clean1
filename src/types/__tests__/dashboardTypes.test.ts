describe('Dashboard Types', () => {
  // Test KpiTrend type
  it('should correctly assign KpiTrend values', () => {
    const trendUp: KpiTrend = 'up';
    const trendDown: KpiTrend = 'down';
    const trendStable: KpiTrend = 'stable';

    expect(trendUp).toBe('up');
    expect(trendDown).toBe('down');
    expect(trendStable).toBe('stable');

    // @ts-expect-error - Should not allow invalid KpiTrend
    const invalidTrend: KpiTrend = 'sideways';
  });

  // Test KpiStatus type
  it('should correctly assign KpiStatus values', () => {
    const statusGood: KpiStatus = 'good';
    const statusWarning: KpiStatus = 'warning';
    const statusCritical: KpiStatus = 'critical';
    const statusInfo: KpiStatus = 'info';

    expect(statusGood).toBe('good');
    expect(statusWarning).toBe('warning');
    expect(statusCritical).toBe('critical');
    expect(statusInfo).toBe('info');

    // @ts-expect-error - Should not allow invalid KpiStatus
    const invalidStatus: KpiStatus = 'unknown';
  });

  // Test IKpiData interface
  it('should correctly define and assign IKpiData', () => {
    const kpiData: IKpiData = {
      id: 'sales-1',
      label: 'Total Sales',
      value: 123456.78,
      unit: '$',
      description: 'Total sales for the current quarter.',
      trend: 'up',
      trendValue: 5.2,
      trendUnit: '%',
      status: 'good',
      lastUpdated: '2023-10-27T10:00:00Z',
      detailsUrl: '/kpi/sales-1',
    };

    expect(kpiData).toEqual({
      id: 'sales-1',
      label: 'Total Sales',
      value: 123456.78,
      unit: '$',
      description: 'Total sales for the current quarter.',
      trend: 'up',
      trendValue: 5.2,
      trendUnit: '%',
      status: 'good',
      lastUpdated: '2023-10-27T10:00:00Z',
      detailsUrl: '/kpi/sales-1',
    });

    // Test minimal IKpiData
    const minimalKpi: IKpiData = {
      id: 'min-kpi',
      label: 'Minimal KPI',
      value: 100,
    };
    expect(minimalKpi.id).toBe('min-kpi');
    expect(minimalKpi.label).toBe('Minimal KPI');
    expect(minimalKpi.value).toBe(100);

    // Test value as string
    const stringValueKpi: IKpiData = {
      id: 'str-val',
      label: 'String Value',
      value: 'N/A',
    };
    expect(stringValueKpi.value).toBe('N/A');
  });

  // Test ChartType type
  it('should correctly assign ChartType values', () => {
    const barChart: ChartType = 'bar';
    const lineChart: ChartType = 'line';
    const pieChart: ChartType = 'pie';
    const doughnutChart: ChartType = 'doughnut';
    const areaChart: ChartType = 'area';
    const scatterChart: ChartType = 'scatter';
    const radarChart: ChartType = 'radar';
    const polarAreaChart: ChartType = 'polarArea';
    const bubbleChart: ChartType = 'bubble';

    expect(barChart).toBe('bar');
    expect(lineChart).toBe('line');
    expect(pieChart).toBe('pie');
    expect(doughnutChart).toBe('doughnut');
    expect(areaChart).toBe('area');
    expect(scatterChart).toBe('scatter');
    expect(radarChart).toBe('radar');
    expect(polarAreaChart).toBe('polarArea');
    expect(bubbleChart).toBe('bubble');

    // @ts-expect-error - Should not allow invalid ChartType
    const invalidChart: ChartType = 'unknownChart';
  });

  // Test ChartDataPoint type
  it('should correctly assign ChartDataPoint values', () => {
    const numberPoint: ChartDataPoint = 123;
    const objectPoint: ChartDataPoint = {
      x: 10,
      y: 20,
      extra: 'info',
    };
    const stringXPoint: ChartDataPoint = {
      x: 'Jan',
      y: 15,
    };

    expect(numberPoint).toBe(123);
    expect(objectPoint).toEqual({
      x: 10,
      y: 20,
      extra: 'info',
    });
    expect(stringXPoint).toEqual({
      x: 'Jan',
      y: 15,
    });
  });

  // Test IChartDataset interface
  it('should correctly define and assign IChartDataset', () => {
    const dataset: IChartDataset = {
      label: 'Dataset 1',
      data: [10, 20, 15, 25],
      backgroundColor: ['red', 'blue'],
      borderColor: 'black',
      borderWidth: 1,
      fill: true,
      tension: 0.4,
      customProp: 'value',
    };

    expect(dataset).toEqual({
      label: 'Dataset 1',
      data: [10, 20, 15, 25],
      backgroundColor: ['red', 'blue'],
      borderColor: 'black',
      borderWidth: 1,
      fill: true,
      tension: 0.4,
      customProp: 'value',
    });

    // Test minimal dataset
    const minimalDataset: IChartDataset = {
      label: 'Minimal',
      data: [1, 2, 3],
    };
    expect(minimalDataset.label).toBe('Minimal');
    expect(minimalDataset.data).toEqual([1, 2, 3]);
  });

  // Test IChartData interface
  it('should correctly define and assign IChartData', () => {
    const chartData: IChartData = {
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [{
        label: 'Sales',
        data: [100, 120, 90],
      }, {
        label: 'Expenses',
        data: [50, 60, 70],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      }, ],
      customChartDataProp: {
        foo: 'bar'
      },
    };

    expect(chartData).toEqual({
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [{
        label: 'Sales',
        data: [100, 120, 90],
      }, {
        label: 'Expenses',
        data: [50, 60, 70],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      }, ],
      customChartDataProp: {
        foo: 'bar'
      },
    });

    // Test minimal chart data
    const minimalChartData: IChartData = {
      datasets: [{
        label: 'Single',
        data: [5],
      }],
    };
    expect(minimalChartData.datasets.length).toBe(1);
  });

  // Test IChartOptions type
  it('should correctly assign IChartOptions', () => {
    const chartOptions: IChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          display: true
        }
      },
      customOption: 123,
    };

    expect(chartOptions.responsive).toBe(true);
    expect(chartOptions.scales.y.beginAtZero).toBe(true);
    expect(chartOptions.customOption).toBe(123);
  });

  // Test TableColumnAlign type
  it('should correctly assign TableColumnAlign values', () => {
    const alignLeft: TableColumnAlign = 'left';
    const alignCenter: TableColumnAlign = 'center';
    const alignRight: TableColumnAlign = 'right';

    expect(alignLeft).toBe('left');
    expect(alignCenter).toBe('center');
    expect(alignRight).toBe('right');

    // @ts-expect-error - Should not allow invalid TableColumnAlign
    const invalidAlign: TableColumnAlign = 'justify';
  });

  // Test ITableColumn interface
  it('should correctly define and assign ITableColumn', () => {
    const column: ITableColumn = {
      id: 'productName',
      label: 'Product Name',
      align: 'left',
      format: (value: string) => value.toUpperCase(),
      width: '200px',
      sortable: true,
      customColumnProp: true,
    };

    expect(column).toEqual({
      id: 'productName',
      label: 'Product Name',
      align: 'left',
      format: expect.any(Function),
      width: '200px',
      sortable: true,
      customColumnProp: true,
    });
    expect(column.format!('apple')).toBe('APPLE');

    // Test minimal column
    const minimalColumn: ITableColumn = {
      id: 'id',
      label: 'ID',
    };
    expect(minimalColumn.id).toBe('id');
    expect(minimalColumn.label).toBe('ID');
  });

  // Test ITableRow type
  it('should correctly assign ITableRow', () => {
    const row: ITableRow = {
      id: '1',
      productName: 'Laptop',
      price: 1200,
      inStock: true,
      category: 'Electronics',
    };

    expect(row).toEqual({
      id: '1',
      productName: 'Laptop',
      price: 1200,
      inStock: true,
      category: 'Electronics',
    });

    // Test with different types
    const anotherRow: ITableRow = {
      date: '2023-01-01',
      value: 500.50,
    };
    expect(anotherRow.date).toBe('2023-01-01');
  });

  // Test TableSortDirection type
  it('should correctly assign TableSortDirection values', () => {
    const sortAsc: TableSortDirection = 'asc';
    const sortDesc: TableSortDirection = 'desc';

    expect(sortAsc).toBe('asc');
    expect(sortDesc).toBe('desc');

    // @ts-expect-error - Should not allow invalid TableSortDirection
    const invalidSort: TableSortDirection = 'none';
  });

  // Test DashboardWidgetType type
  it('should correctly assign DashboardWidgetType values', () => {
    const kpiType: DashboardWidgetType = 'kpi';
    const chartType: DashboardWidgetType = 'chart';
    const tableType: DashboardWidgetType = 'table';
    const textType: DashboardWidgetType = 'text';

    expect(kpiType).toBe('kpi');
    expect(chartType).toBe('chart');
    expect(tableType).toBe('table');
    expect(textType).toBe('text');

    // @ts-expect-error - Should not allow invalid DashboardWidgetType
    const invalidWidgetType: DashboardWidgetType = 'image';
  });

  // Test IBaseDashboardWidget interface
  it('should correctly define and assign IBaseDashboardWidget', () => {
    const baseWidget: IBaseDashboardWidget = {
      id: 'widget-base-1',
      title: 'Base Widget Title',
      type: 'kpi',
      description: 'A generic base widget.',
      lastUpdated: '2023-10-27T11:00:00Z',
      detailsUrl: '/widget/base-1',
    };

    expect(baseWidget).toEqual({
      id: 'widget-base-1',
      title: 'Base Widget Title',
      type: 'kpi',
      description: 'A generic base widget.',
      lastUpdated: '2023-10-27T11:00:00Z',
      detailsUrl: '/widget/base-1',
    });

    // Test minimal base widget
    const minimalBaseWidget: IBaseDashboardWidget = {
      id: 'min-base',
      title: 'Minimal Base',
      type: 'chart',
    };
    expect(minimalBaseWidget.id).toBe('min-base');
  });

  // Test IKpiWidget interface
  it('should correctly define and assign IKpiWidget', () => {
    const kpiWidget: IKpiWidget = {
      id: 'kpi-widget-1',
      title: 'Sales Overview',
      type: 'kpi',
      data: [{
        id: 'total-sales',
        label: 'Total Sales',
        value: 500000,
        unit: '$',
        trend: 'up',
        trendValue: 10,
      }, {
        id: 'avg-order',
        label: 'Avg. Order Value',
        value: 250,
        unit: '$',
        status: 'info',
      }, ],
    };

    expect(kpiWidget.type).toBe('kpi');
    expect(kpiWidget.data.length).toBe(2);
    expect(kpiWidget.data[0].label).toBe('Total Sales');
  });

  // Test IChartWidget interface
  it('should correctly define and assign IChartWidget', () => {
    const chartWidget: IChartWidget = {
      id: 'chart-widget-1',
      title: 'Monthly Revenue',
      type: 'chart',
      chartType: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [{
          label: 'Revenue',
          data: [10000, 12000, 11000],
        }, ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        },
      },
    };

    expect(chartWidget.type).toBe('chart');
    expect(chartWidget.chartType).toBe('line');
    expect(chartWidget.data.labels).toEqual(['Jan', 'Feb', 'Mar']);
    expect(chartWidget.options?.responsive).toBe(true);
  });

  // Test ITableWidget interface
  it('should correctly define and assign ITableWidget', () => {
    const tableWidget: ITableWidget = {
      id: 'table-widget-1',
      title: 'Product Inventory',
      type: 'table',
      columns: [{
        id: 'name',
        label: 'Product Name'
      }, {
        id: 'stock',
        label: 'Stock',
        align: 'right'
      }, ],
      rows: [{
        name: 'Laptop',
        stock: 50
      }, {
        name: 'Mouse',
        stock: 200
      }, ],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 25,
      },
      sort: {
        columnId: 'name',
        direction: 'asc',
      },
    };

    expect(tableWidget.type).toBe('table');
    expect(tableWidget.columns.length).toBe(2);
    expect(tableWidget.rows.length).toBe(2);
    expect(tableWidget.pagination?.page).toBe(1);
    expect(tableWidget.sort?.columnId).toBe('name');
  });

  // Test TextWidgetFormat type
  it('should correctly assign TextWidgetFormat values', () => {
    const markdownFormat: TextWidgetFormat = 'markdown';
    const htmlFormat: TextWidgetFormat = 'html';
    const plainFormat: TextWidgetFormat = 'plain';

    expect(markdownFormat).toBe('markdown');
    expect(htmlFormat).toBe('html');
    expect(plainFormat).toBe('plain');

    // @ts-expect-error - Should not allow invalid TextWidgetFormat
    const invalidFormat: TextWidgetFormat = 'json';
  });

  // Test ITextWidget interface
  it('should correctly define and assign ITextWidget', () => {
    const textWidget: ITextWidget = {
      id: 'text-widget-1',
      title: 'Welcome Message',
      type: 'text',
      content: '# Welcome to the Dashboard!\nThis is a **markdown** example.',
      format: 'markdown',
    };

    expect(textWidget.type).toBe('text');
    expect(textWidget.content).toContain('markdown');
    expect(textWidget.format).toBe('markdown');

    const plainTextWidget: ITextWidget = {
      id: 'text-widget-2',
      title: 'Plain Text',
      type: 'text',
      content: 'Just some plain text.',
    };
    expect(plainTextWidget.format).toBeUndefined();
  });

  // Test DashboardWidget union type
  it('should correctly assign different widget types to DashboardWidget union', () => {
    const kpiWidget: IKpiWidget = {
      id: 'union-kpi',
      title: 'Union KPI',
      type: 'kpi',
      data: [{
        id: 'u-kpi',
        label: 'U-KPI',
        value: 100
      }],
    };
    const chartWidget: IChartWidget = {
      id: 'union-chart',
      title: 'Union Chart',
      type: 'chart',
      chartType: 'bar',
      data: {
        datasets: [{
          label: 'U-Chart',
          data: [10]
        }]
      },
    };

    const dashboardWidgets: DashboardWidget[] = [kpiWidget, chartWidget];

    expect(dashboardWidgets[0].type).toBe('kpi');
    expect(dashboardWidgets[1].type).toBe('chart');

    // Type narrowing example (runtime check)
    dashboardWidgets.forEach(widget => {
      if (widget.type === 'kpi') {
        expect(widget.data[0].label).toBe('U-KPI');
      } else if (widget.type === 'chart') {
        expect(widget.chartType).toBe('bar');
      }
    });
  });

  // Test IDashboardLayoutItem interface
  it('should correctly define and assign IDashboardLayoutItem', () => {
    const layoutItem: IDashboardLayoutItem = {
      i: 'widget-1',
      x: 0,
      y: 0,
      w: 6,
      h: 4,
      minW: 2,
      maxW: 12,
      minH: 2,
      maxH: 8,
      static: false,
      isDraggable: true,
      isResizable: true,
    };

    expect(layoutItem).toEqual({
      i: 'widget-1',
      x: 0,
      y: 0,
      w: 6,
      h: 4,
      minW: 2,
      maxW: 12,
      minH: 2,
      maxH: 8,
      static: false,
      isDraggable: true,
      isResizable: true,
    });

    // Test minimal layout item
    const minimalLayoutItem: IDashboardLayoutItem = {
      i: 'min-item',
      x: 1,
      y: 1,
      w: 1,
      h: 1,
    };
    expect(minimalLayoutItem.i).toBe('min-item');
  });

  // Test IDashboardPage interface
  it('should correctly define and assign IDashboardPage', () => {
    const kpiWidget: IKpiWidget = {
      id: 'page-kpi-1',
      title: 'Page KPI',
      type: 'kpi',
      data: [{
        id: 'pkpi',
        label: 'Page KPI',
        value: 100
      }],
    };
    const textWidget: ITextWidget = {
      id: 'page-text-1',
      title: 'Page Text',
      type: 'text',
      content: 'Page content',
    };

    const dashboardPage: IDashboardPage = {
      id: 'page-1',
      title: 'Overview Page',
      description: 'Main dashboard overview.',
      widgets: [kpiWidget, textWidget],
      layout: [{
        i: 'page-kpi-1',
        x: 0,
        y: 0,
        w: 6,
        h: 2
      }, {
        i: 'page-text-1',
        x: 6,
        y: 0,
        w: 6,
        h: 2
      }, ],
    };

    expect(dashboardPage.id).toBe('page-1');
    expect(dashboardPage.widgets.length).toBe(2);
    expect(dashboardPage.layout?.length).toBe(2);
    expect(dashboardPage.widgets[0].id).toBe('page-kpi-1');
    expect(dashboardPage.layout![0].i).toBe('page-kpi-1');

    // Test minimal page
    const minimalPage: IDashboardPage = {
      id: 'min-page',
      title: 'Minimal Page',
      widgets: [],
    };
    expect(minimalPage.widgets).toEqual([]);
  });

  // Test IDashboard interface (comprehensive test)
  it('should correctly define and assign IDashboard with nested structures', () => {
    const dashboard: IDashboard = {
      id: 'main-dashboard',
      name: 'Executive Dashboard',
      description: 'Comprehensive view of key business metrics.',
      pages: [{
        id: 'overview-page',
        title: 'Overview',
        widgets: [{
          id: 'total-revenue-kpi',
          title: 'Total Revenue',
          type: 'kpi',
          data: [{
            id: 'rev',
            label: 'Revenue',
            value: 1500000,
            unit: '$',
            trend: 'up'
          }],
        }, {
          id: 'sales-chart',
          title: 'Sales by Month',
          type: 'chart',
          chartType: 'bar',
          data: {
            labels: ['Jan', 'Feb', 'Mar'],
            datasets: [{
              label: 'Sales',
              data: [500000, 600000, 400000]
            }]
          },
        }, ],
        layout: [{
          i: 'total-revenue-kpi',
          x: 0,
          y: 0,
          w: 4,
          h: 2
        }, {
          i: 'sales-chart',
          x: 4,
          y: 0,
          w: 8,
          h: 4
        }, ],
      }, {
        id: 'details-page',
        title: 'Details',
        widgets: [{
          id: 'product-table',
          title: 'Product Performance',
          type: 'table',
          columns: [{
            id: 'product',
            label: 'Product'
          }, {
            id: 'sales',
            label: 'Sales',
            align: 'right'
          }],
          rows: [{
            product: 'Product A',
            sales: 100000
          }, {
            product: 'Product B',
            sales: 50000
          }],
        }, {
          id: 'notes-text',
          title: 'Notes',
          type: 'text',
          content: 'Important notes regarding product performance.',
          format: 'plain',
        }, ],
      }, ],
      lastUpdated: '2023-10-27T12:00:00Z',
      createdAt: '2023-09-01T08:00:00Z',
      ownerId: 'user-123',
      tags: ['sales', 'executive', 'monthly'],
    };

    expect(dashboard.id).toBe('main-dashboard');
    expect(dashboard.name).toBe('Executive Dashboard');
    expect(dashboard.pages.length).toBe(2);
    expect(dashboard.pages[0].title).toBe('Overview');
    expect(dashboard.pages[0].widgets.length).toBe(2);
    expect(dashboard.pages[0].widgets[0].id).toBe('total-revenue-kpi');
    expect((dashboard.pages[0].widgets[0] as IKpiWidget).data[0].value).toBe(1500000);
    expect(dashboard.pages[0].layout![0].i).toBe('total-revenue-kpi');
    expect(dashboard.pages[1].widgets[0].id).toBe('product-table');
    expect((dashboard.pages[1].widgets[0] as ITableWidget).rows[0].product).toBe('Product A');
    expect(dashboard.lastUpdated).toBe('2023-10-27T12:00:00Z');
    expect(dashboard.tags).toEqual(['sales', 'executive', 'monthly']);

    // Test minimal dashboard
    const minimalDashboard: IDashboard = {
      id: 'min-dash',
      name: 'Minimal Dashboard',
      pages: [],
    };
    expect(minimalDashboard.pages).toEqual([]);
  });
});