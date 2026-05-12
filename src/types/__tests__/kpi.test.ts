import {
  KpiTrend,
  KpiStatus,
  KpiDataType,
  KpiDefinition,
  KpiHistoricalEntry,
  KpiData,
  Kpi,
  KpiCollection,
  KpiSummary,
} from '../src/types/kpi'; // Adjust the import path as necessary for your project structure

describe('KPI Type Definitions', () => {

  // Test KpiTrend type alias
  describe('KpiTrend', () => {
    it('should allow valid KpiTrend literal values', () => {
      const trendUp: KpiTrend = 'up';
      const trendDown: KpiTrend = 'down';
      const trendStable: KpiTrend = 'stable';
      const trendNeutral: KpiTrend = 'neutral';

      expect(trendUp).toBe('up');
      expect(trendDown).toBe('down');
      expect(trendStable).toBe('stable');
      expect(trendNeutral).toBe('neutral');

      // TypeScript would prevent assignment of invalid values at compile time.
      // For example: const invalidTrend: KpiTrend = 'unknown'; // This would be a compile error.
    });
  });

  // Test KpiStatus type alias
  describe('KpiStatus', () => {
    it('should allow valid KpiStatus literal values', () => {
      const statusGood: KpiStatus = 'good';
      const statusWarning: KpiStatus = 'warning';
      const statusCritical: KpiStatus = 'critical';
      const statusInfo: KpiStatus = 'info';

      expect(statusGood).toBe('good');
      expect(statusWarning).toBe('warning');
      expect(statusCritical).toBe('critical');
      expect(statusInfo).toBe('info');
    });
  });

  // Test KpiDataType type alias
  describe('KpiDataType', () => {
    it('should allow valid KpiDataType literal values', () => {
      const dataTypeNumber: KpiDataType = 'number';
      const dataTypePercentage: KpiDataType = 'percentage';
      const dataTypeCurrency: KpiDataType = 'currency';
      const dataTypeDuration: KpiDataType = 'duration';
      const dataTypeRatio: KpiDataType = 'ratio';

      expect(dataTypeNumber).toBe('number');
      expect(dataTypePercentage).toBe('percentage');
      expect(dataTypeCurrency).toBe('currency');
      expect(dataTypeDuration).toBe('duration');
      expect(dataTypeRatio).toBe('ratio');
    });
  });

  // Test KpiDefinition interface
  describe('KpiDefinition', () => {
    it('should correctly define a KPI definition with all optional properties', () => {
      const definition: KpiDefinition = {
        id: 'sales-growth-q3',
        name: 'Quarterly Sales Growth',
        description: 'Measures the percentage growth of sales revenue compared to the previous quarter.',
        category: 'Sales',
        unit: '%',
        dataType: 'percentage',
      };

      expect(definition).toEqual({
        id: 'sales-growth-q3',
        name: 'Quarterly Sales Growth',
        description: 'Measures the percentage growth of sales revenue compared to the previous quarter.',
        category: 'Sales',
        unit: '%',
        dataType: 'percentage',
      });
    });

    it('should correctly define a KPI definition with only required properties', () => {
      const definition: KpiDefinition = {
        id: 'active-users',
        name: 'Active Users',
        unit: 'users',
        dataType: 'number',
      };

      expect(definition).toEqual({
        id: 'active-users',
        name: 'Active Users',
        unit: 'users',
        dataType: 'number',
      });
    });

    it('should ensure required properties are present (compile-time check)', () => {
      // The following would cause a TypeScript compile error if uncommented,
      // demonstrating that required properties are enforced by the type system.
      // const invalidDefinition: KpiDefinition = {
      //   id: 'missing-name',
      //   unit: 'count',
      //   dataType: 'number',
      // };
      expect(true).toBe(true); // Placeholder assertion for Jest
    });
  });

  // Test KpiHistoricalEntry interface
  describe('KpiHistoricalEntry', () => {
    it('should correctly define a historical entry with an optional target', () => {
      const entryWithTarget: KpiHistoricalEntry = {
        timestamp: '2023-10-27T10:00:00Z',
        value: 120,
        target: 100,
      };

      expect(entryWithTarget).toEqual({
        timestamp: '2023-10-27T10:00:00Z',
        value: 120,
        target: 100,
      });
    });

    it('should correctly define a historical entry without a target', () => {
      const entryWithoutTarget: KpiHistoricalEntry = {
        timestamp: '2023-10-26T09:00:00Z',
        value: 115,
      };

      expect(entryWithoutTarget).toEqual({
        timestamp: '2023-10-26T09:00:00Z',
        value: 115,
      });
    });
  });

  // Test KpiData interface
  describe('KpiData', () => {
    it('should correctly define KPI current data with all optional properties', () => {
      const data: KpiData = {
        currentValue: 0.78,
        targetValue: 0.75,
        comparisonValue: 0.70,
        trend: 'up',
        status: 'good',
        lastUpdated: '2023-10-27T10:30:00Z',
      };

      expect(data).toEqual({
        currentValue: 0.78,
        targetValue: 0.75,
        comparisonValue: 0.70,
        trend: 'up',
        status: 'good',
        lastUpdated: '2023-10-27T10:30:00Z',
      });
    });

    it('should correctly define KPI current data with only required properties', () => {
      const data: KpiData = {
        currentValue: 1500,
        lastUpdated: '2023-10-27T11:00:00Z',
      };

      expect(data).toEqual({
        currentValue: 1500,
        lastUpdated: '2023-10-27T11:00:00Z',
      });
    });
  });

  // Test Kpi (combined interface)
  describe('Kpi', () => {
    it('should correctly define a complete KPI object with all optional properties', () => {
      const kpi: Kpi = {
        // KpiDefinition properties
        id: 'customer-churn',
        name: 'Customer Churn Rate',
        description: 'Percentage of customers who stopped using a product or service.',
        category: 'Customer Success',
        unit: '%',
        dataType: 'percentage',

        // KpiData properties
        currentValue: 0.05,
        targetValue: 0.03,
        comparisonValue: 0.07,
        trend: 'down', // Lower churn is good
        status: 'warning', // Still above target
        lastUpdated: '2023-10-27T12:00:00Z',

        // Kpi specific properties
        history: [
          { timestamp: '2023-07-01T00:00:00Z', value: 0.08, target: 0.03 },
          { timestamp: '2023-08-01T00:00:00Z', value: 0.07, target: 0.03 },
          { timestamp: '2023-09-01T00:00:00Z', value: 0.06, target: 0.03 },
          { timestamp: '2023-10-01T00:00:00Z', value: 0.05, target: 0.03 },
        ],
        metadata: {
          owner: 'Product Team',
          priority: 'high',
          tags: ['critical', 'monthly'],
        },
      };

      expect(kpi).toEqual({
        id: 'customer-churn',
        name: 'Customer Churn Rate',
        description: 'Percentage of customers who stopped using a product or service.',
        category: 'Customer Success',
        unit: '%',
        dataType: 'percentage',
        currentValue: 0.05,
        targetValue: 0.03,
        comparisonValue: 0.07,
        trend: 'down',
        status: 'warning',
        lastUpdated: '2023-10-27T12:00:00Z',
        history: [
          { timestamp: '2023-07-01T00:00:00Z', value: 0.08, target: 0.03 },
          { timestamp: '2023-08-01T00:00:00Z', value: 0.07, target: 0.03 },
          { timestamp: '2023-09-01T00:00:00Z', value: 0.06, target: 0.03 },
          { timestamp: '2023-10-01T00:00:00Z', value: 0.05, target: 0.03 },
        ],
        metadata: {
          owner: 'Product Team',
          priority: 'high',
          tags: ['critical', 'monthly'],
        },
      });
    });

    it('should correctly define a KPI object with only required properties and no history/metadata', () => {
      const kpi: Kpi = {
        id: 'website-visits',
        name: 'Website Visits',
        unit: 'visits',
        dataType: 'number',
        currentValue: 15000,
        lastUpdated: '2023-10-27T13:00:00Z',
      };

      expect(kpi).toEqual({
        id: 'website-visits',
        name: 'Website Visits',
        unit: 'visits',
        dataType: 'number',
        currentValue: 15000,
        lastUpdated: '2023-10-27T13:00:00Z',
      });
    });
  });

  // Test KpiCollection type alias
  describe('KpiCollection', () => {
    it('should correctly define a collection of KPIs', () => {
      const kpi1: Kpi = {
        id: 'kpi-a', name: 'KPI A', unit: 'units', dataType: 'number',
        currentValue: 100, lastUpdated: '2023-10-27T14:00:00Z',
      };
      const kpi2: Kpi = {
        id: 'kpi-b', name: 'KPI B', unit: '%', dataType: 'percentage',
        currentValue: 0.8, lastUpdated: '2023-10-27T14:01:00Z',
      };

      const collection: KpiCollection = [kpi1, kpi2];

      expect(collection).toEqual([kpi1, kpi2]);
      expect(collection.length).toBe(2);
      expect(collection[0].id).toBe('kpi-a');
      expect(collection[1].dataType).toBe('percentage');
    });

    it('should allow an empty collection of KPIs', () => {
      const emptyCollection: KpiCollection = [];
      expect(emptyCollection).toEqual([]);
      expect(emptyCollection.length).toBe(0);
    });
  });

  // Test KpiSummary type alias (using Pick utility type)
  describe('KpiSummary', () => {
    it('should correctly pick specified properties from a Kpi object', () => {
      const fullKpi: Kpi = {
        id: 'revenue',
        name: 'Total Revenue',
        description: 'Total revenue generated in the period.',
        category: 'Finance',
        unit: '$',
        dataType: 'currency',
        currentValue: 123456.78,
        targetValue: 1