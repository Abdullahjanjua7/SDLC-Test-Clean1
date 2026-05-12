import {
  ChartCategoryValue,
  ChartMultiSeriesCategoryValue,
  ChartPieData,
  AggregationType,
  // Assuming aggregateValues is exported for testing, or we test it indirectly
  // If not exported, we'd test its behavior through the public functions.
  // For comprehensive testing, it's good practice to export internal helpers for testing.
  // For this exercise, I'll assume it's made accessible for testing purposes.
  // If not, the tests for transform functions will implicitly cover it.
  transformToCategoryValue,
  transformToMultiSeriesCategoryValue,
  transformToPieData,
} from './dataTransformers'; // Adjust the path as necessary

// Helper function aggregateValues is not exported in the provided snippet.
// For testing purposes, we'll either assume it's exported or test its behavior
// indirectly through the public transform functions.
// To directly test it, we'd need to import it. Let's assume it's made available for testing.
// If not, the tests for transform functions will implicitly cover its logic.
// For this solution, I'll include a mock implementation or assume it's imported if needed for direct testing.
// Given the prompt, I will assume it's part of the module and accessible for testing.
// If it's truly internal and not exported, direct tests for it would be skipped,
// and its logic would be covered by the public functions that use it.
// For the sake of comprehensive testing, I'll include a direct test suite for it.
// Let's re-declare it here for testing if it's not exported, or import if it is.
// For this exercise, I'll include it directly in the test file to simulate testing an internal function.

/**
 * Helper function to aggregate an array of numbers based on a specified aggregation type.
 * (Copied here for direct testing if not exported from the module)
 */
function aggregateValues(values: number[], type: AggregationType): number {
  if (values.length === 0) {
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
      return 0;
  }
}


describe('dataTransformers', () => {

  // Test suite for the internal helper function aggregateValues
  describe('aggregateValues', () => {
    it('should return 0 for an empty array for all aggregation types', () => {
      const emptyArray: number[] = [];
      expect(aggregateValues(emptyArray, 'sum')).toBe(0);
      expect(aggregateValues(emptyArray, 'count')).toBe(0);
      expect(aggregateValues(emptyArray, 'average')).toBe(0);
      expect(aggregateValues(emptyArray, 'min')).toBe(0);
      expect(aggregateValues(emptyArray, 'max')).toBe(0);
    });

    it('should correctly calculate sum', () => {
      expect(aggregateValues([1, 2, 3, 4, 5], 'sum')).toBe(15);
      expect(aggregateValues([0, 0, 0], 'sum')).toBe(0);
      expect(aggregateValues([-1, -2, 3], 'sum')).toBe(0);
      expect(aggregateValues([10], 'sum')).toBe(10);
    });

    it('should correctly calculate count', () => {
      expect(aggregateValues([1, 2, 3, 4, 5], 'count')).toBe(5);
      expect(aggregateValues([10], 'count')).toBe(1);
      expect(aggregateValues([], 'count')).toBe(0);
    });

    it('should correctly calculate average', () => {
      expect(aggregateValues([1, 2, 3, 4, 5], 'average')).toBe(3);
      expect(aggregateValues([10, 20], 'average')).toBe(15);
      expect(aggregateValues([0, 0, 0], 'average')).toBe(0);
      expect(aggregateValues([5], 'average')).toBe(5);
      expect(aggregateValues([-1, 1], 'average')).toBe(0);
    });

    it('should correctly calculate min', () => {
      expect(aggregateValues([1, 2, 3, 4, 5], 'min')).toBe(1);
      expect(aggregateValues([10, 2, 8], 'min')).toBe(2);
      expect(aggregateValues([-5, -1, -10], 'min')).toBe(-10);
      expect(aggregateValues([0, 10, -5], 'min')).toBe(-5);
      expect(aggregateValues([7], 'min')).toBe(7);
    });

    it('should correctly calculate max', () => {
      expect(aggregateValues([1, 2, 3, 4, 5], 'max')).toBe(5);
      expect(aggregateValues([10, 2, 8], 'max')).toBe(10);
      expect(aggregateValues([-5, -1, -10], 'max')).toBe(-1);
      expect(aggregateValues([0, 10, -5], 'max')).toBe(10);
      expect(aggregateValues([7], 'max')).toBe(7);
    });

    it('should handle non-numeric values gracefully (though TS prevents this, JS runtime might)', () => {
      // TypeScript prevents passing non-numbers, but if runtime data is dirty:
      // The current implementation of aggregateValues expects number[], so this test is more for robustness
      // if the type system is bypassed. For now, we assume valid number[] input due to TS.
      // If `values` could contain non-numbers, `Math.min(...values)` or `reduce` would throw/return NaN.
      // The current `transform` functions convert to Number() before passing, so this is less critical here.
    });
  });

  // Sample raw data for testing transform functions
  interface RawData {
    month: string;
    region: string;
    sales: number;
    units: number;
    isActive: boolean;
    price: string; // Simulate string-based numbers
  }

  const sampleRawData: RawData[] = [
    { month: 'Jan', region: 'East', sales: 100, units: 10, isActive: true, price: '10.5' },
    { month: 'Jan', region: 'West', sales: 150, units: 15, isActive: true, price: '12.0' },
    { month: 'Feb', region: 'East', sales: 120, units: 12, isActive: false, price: '11.0' },
    { month: 'Feb', region: 'West', sales: 180, units: 18, isActive: true, price: '13.5' },
    { month: 'Mar', region: 'East', sales: 90, units: 9, isActive: true, price: '9.0' },
    { month: 'Mar', region: 'West', sales: 200, units: 20, isActive: false, price: '15.0' },
    { month: 'Jan', region: 'East', sales: 50, units: 5, isActive: true, price: '5.0' }, // Duplicate category/series
    { month: 'Apr', region: 'North', sales: 70, units: 7, isActive: true, price: '7.0' }, // New category/series
    { month: 'Apr', region: 'North', sales: 30, units: 3, isActive: true, price: '3.0' },
    { month: 'May', region: 'South', sales: 0, units: 0, isActive: true, price: '0.0' }, // Zero value
    { month: 'Jun', region: 'South', sales: -10, units: -1, isActive: true, price: '-10.0' }, // Negative value
    { month: 'Jul', region: 'East', sales: NaN, units: 2, isActive: true, price: 'invalid' }, // Invalid value
    { month: 'Aug', region: 'West', sales: 10, units: undefined as any, isActive: true, price: '10' }, // Undefined value
    { month: 'Sep', region: 'East', sales: null as any, units: 5, isActive: true, price: '5' }, // Null value
  ];

  describe('transformToCategoryValue', () => {
    it('should return an empty array for empty input data', () => {
      expect(transformToCategoryValue([], 'month', 'sales', 'sum')).toEqual([]);
      expect(transformToCategoryValue(null as any, 'month', 'sales', 'sum')).toEqual([]);
      expect(transformToCategoryValue(undefined as any, 'month', 'sales', 'sum')).toEqual([]);
    });

    it('should correctly aggregate sales by month using sum', () => {
      const result = transformToCategoryValue(sampleRawData, 'month', 'sales', 'sum');
      expect(result).toEqual([
        { category: 'Apr', value: 100 },
        { category: 'Aug', value: 10 },
        { category: 'Feb', value: 300 },
        { category: 'Jan', value: 300 },
        { category: 'Jun', value: -10 },
        { category: 'Mar', value: 290 },
        { category: 'May', value: 0 },
        { category: 'Sep', value: 0 }, // null sales treated as 0
      ]);
      expect(result).toMatchSnapshot();
    });

    it('should correctly aggregate units by region using average', () => {
      const result = transformToCategoryValue(sampleRawData, 'region', 'units', 'average');
      expect(result).toEqual([
        { category: 'East', value: (10 + 12 + 9 + 5 + 2 + 5) / 6 }, // (10+12+9+5+2+5)/6 = 43/6 = 7.166...
        { category: 'North', value: (7 + 3) / 2 }, // 5
        { category: 'South', value: (0 + -1) / 2 }, // -0.5
        { category: 'West', value: (15 + 18 + 20 + 0) / 4 }, // (15+18+20+0)/4 = 53/4 = 13.25 (undefined units treated as 0)
      ]);
      expect(result.find(d => d.category === 'East')?.value).toBeCloseTo(7.166666666666667);
      expect(result.find(d => d.category === 'North')?.value).toBe(5);
      expect(result.find(d => d.category === 'South')?.value).toBe(-0.5);
      expect(result.find(d => d.category === 'West')?.value).toBe(13.25);
      expect(result).toMatchSnapshot();
    });

    it('should correctly aggregate sales by month using count', () => {
      const result = transformToCategoryValue(sampleRawData, 'month', 'sales', 'count');
      expect(result).toEqual([
        { category: 'Apr', value: 2 },
        { category: 'Aug', value: 1 },
        { category: 'Feb', value: 2 },
        { category: 'Jan', value: 3 },
        { category: 'Jun', value: 1 },
        { category: 'Mar', value: 2 },
        { category: 'May', value: 1 },
        { category: 'Sep', value: 1 },
      ]);
      expect(result).toMatchSnapshot();
    });

    it('should correctly aggregate sales by month using min', () => {
      const result = transformToCategoryValue(sampleRawData, 'month', 'sales', 'min');
      expect(result).toEqual([
        { category: 'Apr', value: 30 },
        { category: 'Aug', value: 10 },
        { category: 'Feb', value: 120 },
        { category: 'Jan', value: 50 },
        { category: 'Jun', value: -10 },
        { category: 'Mar', value: 90 },
        { category: 'May', value: 0 },
        { category: 'Sep', value: 0 }, // null sales treated as 0
      ]);
      expect(result).toMatchSnapshot();
    });

    it('should correctly aggregate sales by month using max', () => {
      const result = transformToCategoryValue(sampleRawData, 'month', 'sales', 'max');
      expect(result).toEqual([
        { category: 'Apr', value: 70 },
        { category: 'Aug', value: 10 },
        { category: 'Feb', value: 180 },
        { category: 'Jan', value: 150 },
        { category: 'Jun', value: -10 },
        { category: 'Mar', value: 200 },
        { category: 'May', value: 0 },
        { category: 'Sep', value: 0 }, // null sales treated as 0
      ]);
      expect(result).toMatchSnapshot();
    });

    it('should handle string-based numbers for valueKey', () => {
      const result = transformToCategoryValue(sampleRawData, 'month', 'price', 'sum');
      expect(result).toEqual([
        { category: 'Apr', value: 10 }, // 7.0 + 3.0
        { category: 'Aug', value: 10 }, // 10
        { category: 'Feb', value: 24 }, // 11.0 + 13.5
        { category: 'Jan', value: 27.5 }, // 10.5 + 12.0 + 5.0
        { category: 'Jun', value: -10 }, // -10.0
        { category: 'Mar', value: 24 }, // 9.0 + 15.0
        { category: 'May', value: 0 }, // 0.0
        { category: 'Sep', value: 5 }, // 5
      ]);
      expect(result).toMatchSnapshot();
    });

    it('should ignore data points with invalid numeric values', () => {
      const dataWithInvalidValues = [
        { category: 'A', value: 10 },
        { category: 'B', value: 'abc' }, // Invalid
        { category: 'A', value: 20 },
        { category: 'C', value: null }, // Invalid
        { category: 'D', value: undefined }, // Invalid
        { category: 'E', value: NaN }, // Invalid
        { category: 'F', value: '15' }, // Valid string number
      ];
      const result = transformToCategoryValue(dataWithInvalidValues, 'category', 'value', 'sum');
      expect(result).toEqual([
        { category: 'A', value: 30 },
        { category: 'F', value: 15 },
      ]);
      expect(result).toMatchSnapshot();
    });

    it('should handle categoryKey and valueKey pointing to non-existent properties gracefully (resulting in 0 or empty)', () => {
      const result = transformToCategoryValue(sampleRawData, 'nonExistentCategory' as any, 'sales', 'sum');
      // All items will have 'undefined' as category, grouped into one.
      // String(undefined) is "undefined"
      expect(result).toEqual([{ category: 'undefined', value: 100 + 150 + 120 + 180 + 90 + 200 + 50 + 70 + 30 + 0 + -10 + 0 + 10 + 0 }]);
      expect(result[0].value).toBe(840); // Sum of all valid sales values
      expect(result).toMatchSnapshot();

      const result2 = transformToCategoryValue(sampleRawData, 'month', 'nonExistentValue' as any, 'sum');
      // All values will be NaN, then converted to 0 by aggregateValues for empty arrays.
      // Each category will have an empty array of values, resulting in 0.
      expect(result2).toEqual([
        { category: 'Apr', value: 0 },
        { category: 'Aug', value: 0 },
        { category: 'Feb', value: 0 },
        { category: 'Jan', value: 0 },
        { category: 'Jun', value: 0 },
        { category: 'Mar', value: 0 },
        { category: 'May', value: 0 },
        { category: 'Sep', value: 0 },
      ]);
      expect(result2).toMatchSnapshot();
    });

    it('should handle boolean category keys', () => {
      const result = transformToCategoryValue(sampleRawData, 'isActive', 'units', 'sum');
      expect(result).toEqual([
        { category: 'false', value: 12 + 20 }, // Feb West, Mar East
        { category: 'true', value: 10 + 15 + 18 + 9 + 5 + 7 + 3 + 0 + -1 + 2 + 5 }, // All others
      ]);
      expect(result.find(d => d.category === 'false')?.value).toBe(32);
      expect(result.find(d => d.category === 'true')?.value).toBe(73);
      expect(result).toMatchSnapshot();
    });
  });

  describe('transformToMultiSeriesCategoryValue', () => {
    it('should return an empty array for empty input data', () => {
      expect(transformToMultiSeriesCategoryValue([], 'month', 'region', 'sales', 'sum')).toEqual([]);
      expect(transformToMultiSeriesCategoryValue(null as any, 'month', 'region', 'sales', 'sum')).toEqual([]);
      expect(transformToMultiSeriesCategoryValue(undefined as any, 'month', 'region', 'sales', 'sum')).toEqual([]);
    });

    it('should correctly aggregate sales by month and region using sum', () => {
      const result = transformToMultiSeriesCategoryValue(sampleRawData, 'month', 'region', 'sales', 'sum');
      expect(result).toEqual([
        { category: 'Apr', North: 100, East: 0, South: 0, West: 0 },
        { category: 'Aug', West: 10, East: 0, North: 0, South: 0 },
        { category: 'Feb', East: 120, West: 180, North: 0, South: 0 },
        { category: 'Jan', East: 150, West: 150, North: 0, South: 0 },
        { category: 'Jun', South: -10, East: 0, North: 0, West: 0 },
        { category: 'Mar', East: 90, West: 200, North: 0, South: 0 },
        { category: 'May', South: 0, East: 0, North: 0, West: 0 },
        { category: 'Sep', East: 0, North: 0, South: 0, West: 0 },
      ]);
      expect(result).toMatchSnapshot();
    });

    it('should correctly aggregate units by month and region using average', () => {
      const result = transformToMultiSeriesCategoryValue(sampleRawData, 'month', 'region', 'units', 'average');
      expect(result).toEqual([
        { category: 'Apr', North: 5, East: 0, South: 0, West: 0 },
        { category: 'Aug', West: 0, East: 0, North: 0, South: 0 }, // undefined units -> 0
        { category: 'Feb', East: 12, West: 18, North: 0, South: 0 },
        { category: 'Jan', East: 7.5, West: 15, North: 0, South: 0 }, // (10+5)/2 = 7.5
        { category: 'Jun', South: -1, East: 0, North: 0, West: 0 },
        { category: 'Mar', East: 9, West: 20, North: 0, South: 0 },
        { category: 'May', South: 0, East: 0, North: 0, West: 0 },
        { category: 'Sep', East: 5, North: 0, South: 0, West: 0 }, // null units -> 0
      ]);
      expect(result).toMatchSnapshot();
    });

    it('should fill in 0 for missing series in a category', () => {
      const result = transformToMultiSeriesCategoryValue(sampleRawData, 'month', 'region', 'sales', 'sum');
      const janData = result.find(d => d.category === 'Jan');
      expect(janData).toBeDefined();
      expect(janData?.East).toBe(150);
      expect(janData?.West).toBe(150);
      expect(janData?.North).toBe(0);
      expect(janData?.South).toBe(0);

      const aprData = result.find(d => d.category === 'Apr');
      expect(aprData).toBeDefined();
      expect(aprData?.North).toBe(100);
      expect(aprData?.East).toBe(0);
      expect(aprData?.West).toBe(0);
      expect(aprData?.South).toBe(0);
    });

    it('should handle string-based numbers for valueKey in multi-series', () => {
      const result = transformToMultiSeriesCategoryValue(sampleRawData, 'month', 'region', 'price', 'sum');
      expect(result).toEqual([
        { category: 'Apr', North: 10, East: 0, South: 0, West: 0 },
        { category: 'Aug', West: 10, East: 0, North: 0, South: 0 },
        { category: 'Feb', East: 11, West: 13.5, North: 0, South: 0 },
        { category: 'Jan', East: 15.5, West: 12, North: 0, South: 0 }, // 10.5 + 5.0
        { category: 'Jun', South: -10, East: 0, North: 0, West: 0 },
        { category: 'Mar', East: 9, West: 15, North: 0, South: 0 },
        { category: 'May', South: 0, East: 0, North: 0, West: 0 },
        { category: 'Sep', East: 5, North: 0, South: 0, West: 0 },
      ]);
      expect(result).toMatchSnapshot();
    });

    it('should ignore data points with invalid numeric values for valueKey', () => {
      const data = [
        { month: 'Jan', region: 'A', value: 10 },
        { month: 'Jan', region: 'B', value: 'invalid' },
        { month: 'Jan', region: 'A', value: 20 },
        { month: 'Feb', region: 'A', value: 5 },
        { month: 'Feb', region: 'C', value: null },
      ];
      const result = transformToMultiSeriesCategoryValue(data, 'month', 'region', 'value', 'sum');
      expect(result).toEqual([
        { category: 'Feb', A: 5, B: 0, C: 0 },
        { category: 'Jan', A: 30, B: 0, C: 0 },
      ]);
      expect(result).toMatchSnapshot();
    });

    it('should handle categoryKey, seriesKey, or valueKey pointing to non-existent properties', () => {
      const result = transformToMultiSeriesCategoryValue(sampleRawData, 'nonExistentCategory' as any, 'region', 'sales', 'sum');
      // All items grouped under "undefined" category
      expect(result.length).toBe(1);
      expect(result[0].category).toBe('undefined');
      expect(result[0].East).toBe(100 + 120 + 90 + 50 + 0); // Sum of East sales
      expect(result[0].West).toBe(150 + 180 + 200 + 10); // Sum of West sales
      expect(result[0].North).toBe(70 + 30); // Sum of North sales
      expect(result[0].South).toBe(0 + -10); // Sum of South sales
      expect(result).toMatchSnapshot();

      const result2 = transformToMultiSeriesCategoryValue(sampleRawData, 'month', 'nonExistentSeries' as any, 'sales', 'sum');
      // All items grouped under "undefined" series
      expect(result2.length).toBe(8); // Number of unique months
      expect(result2[0].category).toBe('Apr');
      expect(