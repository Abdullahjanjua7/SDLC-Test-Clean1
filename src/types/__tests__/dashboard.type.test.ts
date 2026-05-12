import {
  DashboardId,
  WidgetId,
  LayoutItem,
  TimeSeriesDataPoint,
} from './dashboard.type'; // Assuming the file is named dashboard.type.ts

describe('Dashboard Type Definitions', () => {

  // Test DashboardId type
  it('should correctly define DashboardId as a string type', () => {
    const dashboardId: DashboardId = 'dashboard-uuid-123';
    expect(typeof dashboardId).toBe('string');
    expect(dashboardId).toBe('dashboard-uuid-123');
  });

  // Test WidgetId type
  it('should correctly define WidgetId as a string type', () => {
    const widgetId: WidgetId = 'widget-id-abc';
    expect(typeof widgetId).toBe('string');
    expect(widgetId).toBe('widget-id-abc');
  });

  // Test LayoutItem interface
  describe('LayoutItem', () => {
    it('should correctly define a LayoutItem with only required properties', () => {
      const layoutItem: LayoutItem = {
        x: 0,
        y: 0,
        w: 2,
        h: 1,
      };

      expect(layoutItem).toEqual({ x: 0, y: 0, w: 2, h: 1 });
      expect(typeof layoutItem.x).toBe('number');
      expect(typeof layoutItem.y).toBe('number');
      expect(typeof layoutItem.w).toBe('number');
      expect(typeof layoutItem.h).toBe('number');
    });

    it('should correctly define a LayoutItem with some optional properties', () => {
      const layoutItemWithSomeOptions: LayoutItem = {
        x: 1,
        y: 1,
        w: 3,
        h: 2,
        minW: 1,
        static: true,
      };

      expect(layoutItemWithSomeOptions).toEqual({
        x: 1, y: 1, w: 3, h: 2, minW: 1, static: true,
      });
      expect(typeof layoutItemWithSomeOptions.minW).toBe('number');
      expect(typeof layoutItemWithSomeOptions.static).toBe('boolean');
      expect(layoutItemWithSomeOptions.maxW).toBeUndefined();
    });

    it('should correctly define a LayoutItem with all optional properties', () => {
      const layoutItemWithAllOptions: LayoutItem = {
        x: 1,
        y: 2,
        w: 3,
        h: 4,
        minW: 1,
        maxW: 5,
        minH: 2,
        maxH: 6,
        static: true,
      };

      expect(layoutItemWithAllOptions).toEqual({
        x: 1, y: 2, w: 3, h: 4,
        minW: 1, maxW: 5, minH: 2, maxH: 6, static: true,
      });
      expect(typeof layoutItemWithAllOptions.minW).toBe('number');
      expect(typeof layoutItemWithAllOptions.maxW).toBe('number');
      expect(typeof layoutItemWithAllOptions.minH).toBe('number');
      expect(typeof layoutItemWithAllOptions.maxH).toBe('number');
      expect(typeof layoutItemWithAllOptions.static).toBe('boolean');
    });

    it('should match snapshot for a typical LayoutItem structure', () => {
      const typicalLayoutItem: LayoutItem = {
        x: 2,
        y: 3,
        w: 4,
        h: 2,
        minW: 1,
        maxW: 6,
        static: false,
      };
      expect(typicalLayoutItem).toMatchSnapshot();
    });
  });

  // Test TimeSeriesDataPoint interface
  describe('TimeSeriesDataPoint', () => {
    it('should correctly define a TimeSeriesDataPoint with a string timestamp', () => {
      const dataPointWithStringTimestamp: TimeSeriesDataPoint = {
        timestamp: '2023-10-27T10:00:00Z',
      };

      expect(dataPointWithStringTimestamp.timestamp).toBe('2023-10-27T10:00:00Z');
      expect(typeof dataPointWithStringTimestamp.timestamp).toBe('string');
    });

    it('should correctly define a TimeSeriesDataPoint with a number timestamp (Unix milliseconds)', () => {
      const dataPointWithNumberTimestamp: TimeSeriesDataPoint = {
        timestamp: 1678886400000, // Example Unix timestamp in milliseconds
      };

      expect(dataPointWithNumberTimestamp.timestamp).toBe(1678886400000);
      expect(typeof dataPointWithNumberTimestamp.timestamp).toBe('number');
    });

    it('should match snapshot for a typical TimeSeriesDataPoint structure', () => {
      const typicalDataPoint: TimeSeriesDataPoint = {
        timestamp: '2023-10-27T11:30:00Z',
      };
      expect(typicalDataPoint).toMatchSnapshot();
    });
  });
});