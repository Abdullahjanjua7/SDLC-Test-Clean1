import {
  formatSeriesData,
  generatePalette,
  calculateMinMax,
  createChartTitle,
  ChartDataPoint,
  MinMaxResult,
  ChartTitleOptions,
} from './chartUtils'; // Adjust the path as necessary

describe('chartUtils', () => {
  // --- formatSeriesData Tests ---
  describe('formatSeriesData', () => {
    interface RawDataItem {
      date?: string;
      value?: number | null | undefined | string;
      timestamp?: number;
      amount?: number;
      id?: number;
      val?: number | null | undefined | string;
      xVal?: any;
      yVal?: number | null | undefined;
    }

    it('should transform basic data with string keys correctly', () => {
      const rawData = [{ date: '2023-01-01', value: 10 }, { date: '2023-01-02', value: 15 }];
      const expected: ChartDataPoint[] = [{ x: '2023-01-01', y: 10 }, { x: '2023-01-02', y: 15 }];
      expect(formatSeriesData(rawData, 'date', 'value')).toEqual(expected);
    });

    it('should transform data using functions for xKey and yKey', () => {
      const rawData = [{ timestamp: 1672531200000, amount: 20.5 }, { timestamp: 1672617600000, amount: 22.1 }];
      const expected: ChartDataPoint[] = [
        { x: new Date(1672531200000), y: 41 },
        { x: new Date(1672617600000), y: 44.2 },
      ];
      const result = formatSeriesData(
        rawData,
        item => new Date(item.timestamp!),
        item => item.amount! * 2
      );
      expect(result).toEqual(expected);
    });

    it('should filter out data points with null y-values', () => {
      const rawData: RawDataItem[] = [{ id: 1, val: 10 }, { id: 2, val: null }, { id: 3, val: 20 }];
      const expected: ChartDataPoint[] = [{ x: 1, y: 10 }, { x: 3, y: 20 }];
      expect(formatSeriesData(rawData, 'id', 'val')).toEqual(expected);
    });

    it('should filter out data points with undefined y-values', () => {
      const rawData: RawDataItem[] = [{ id: 1, val: 10 }, { id: 2, val: undefined }, { id: 3, val: 20 }];
      const expected: ChartDataPoint[] = [{ x: 1, y: 10 }, { x: 3, y: 20 }];
      expect(formatSeriesData(rawData, 'id', 'val')).toEqual(expected);
    });

    it('should filter out data points with non-numeric y-values', () => {
      const rawData: RawDataItem[] = [{ id: 1, val: 10 }, { id: 2, val: 'invalid' }, { id: 3, val: 20 }];
      const expected: ChartDataPoint[] = [{ x: 1, y: 10 }, { x: 3, y: 20 }];
      expect(formatSeriesData(rawData, 'id', 'val' as any)).toEqual(expected);
    });

    it('should filter out data points with NaN y-values', () => {
      const rawData: RawDataItem[] = [{ id: 1, val: 10 }, { id: 2, val: NaN }, { id: 3, val: 20 }];
      const expected: ChartDataPoint[] = [{ x: 1, y: 10 }, { x: 3, y: 20 }];
      expect(formatSeriesData(rawData, 'id', 'val')).toEqual(expected);
    });

    it('should filter out data points with Infinity y-values', () => {
      const rawData: RawDataItem[] = [{ id: 1, val: 10 }, { id: 2, val: Infinity }, { id: 3, val: 20 }];
      const expected: ChartDataPoint[] = [{ x: 1, y: 10 }, { x: 3, y: 20 }];
      expect(formatSeriesData(rawData, 'id', 'val')).toEqual(expected);
    });

    it('should return an empty array for empty input data', () => {
      const rawData: RawDataItem[] = [];
      expect(formatSeriesData(rawData, 'keyX', 'keyY')).toEqual([]);
    });

    it('should return an empty array for null input data', () => {
      expect(formatSeriesData(null as any, 'keyX', 'keyY')).toEqual([]);
    });

    it('should return an empty array for undefined input data', () => {
      expect(formatSeriesData(undefined as any, 'keyX', 'keyY')).toEqual([]);
    });

    it('should return an empty array if no valid y-values are found', () => {
      const rawData: RawDataItem[] = [{ id: 1, val: null }, { id: 2, val: 'abc' }];
      expect(formatSeriesData(rawData, 'id', 'val' as any)).toEqual([]);
    });

    it('should handle missing xKey in some objects gracefully', () => {
      const rawData: RawDataItem[] = [{ id: 1, val: 10 }, { val: 20 }];
      const expected: ChartDataPoint[] = [{ x: 1, y: 10 }, { x: undefined, y: 20 }];
      expect(formatSeriesData(rawData, 'id', 'val')).toEqual(expected);
    });

    it('should handle missing yKey in some objects gracefully', () => {
      const rawData: RawDataItem[] = [{ id: 1, val: 10 }, { id: 2 }];
      const expected: ChartDataPoint[] = [{ x: 1, y: 10 }]; // The second item is filtered out
      expect(formatSeriesData(rawData, 'id', 'val')).toEqual(expected);
    });

    it('should handle objects with non-existent keys when using string keys', () => {
      const rawData = [{ a: 1, b: 2 }];
      const expected: ChartDataPoint[] = [{ x: undefined, y: undefined as any }]; // y is filtered out
      expect(formatSeriesData(rawData, 'nonExistentX' as any, 'nonExistentY' as any)).toEqual([]);
    });

    it('should handle objects with non-existent keys when using function keys', () => {
      const rawData = [{ a: 1, b: 2 }];
      const expected: ChartDataPoint[] = [{ x: undefined, y: undefined as any }]; // y is filtered out
      expect(formatSeriesData(rawData, (item: any) => item.nonExistentX, (item: any) => item.nonExistentY)).toEqual([]);
    });
  });

  // --- generatePalette Tests ---
  describe('generatePalette', () => {
    const DEFAULT_PALETTE = [
      '#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC',
      '#78909C', '#FFCA28', '#26A69A', '#EC407A', '#8D6E63',
    ];
    const CUSTOM_PALETTE = ['#FF0000', '#00FF00', '#0000FF'];

    it('should generate 3 colors from the default palette', () => {
      const expected = ['#42A5F5', '#66BB6A', '#FFA726'];
      expect(generatePalette(3)).toEqual(expected);
    });

    it('should generate 5 colors from a custom palette, cycling when needed', () => {
      const expected = ['#FF0000', '#00FF00', '#0000FF', '#FF0000', '#00FF00'];
      expect(generatePalette(5, CUSTOM_PALETTE)).toEqual(expected);
    });

    it('should generate 0 colors for a count of 0', () => {
      expect(generatePalette(0)).toEqual([]);
    });

    it('should generate an empty array for a negative count', () => {
      expect(generatePalette(-2)).toEqual([]);
    });

    it('should generate colors equal to the custom palette length without cycling', () => {
      expect(generatePalette(3, CUSTOM_PALETTE)).toEqual(CUSTOM_PALETTE);
    });

    it('should generate colors less than the custom palette length', () => {
      const expected = ['#FF0000', '#00FF00'];
      expect(generatePalette(2, CUSTOM_PALETTE)).toEqual(expected);
    });

    it('should fall back to the default palette if custom palette is empty', () => {
      const expected = DEFAULT_PALETTE.slice(0, 2);
      expect(generatePalette(2, [])).toEqual(expected);
    });

    it('should fall back to the default palette if custom palette is null', () => {
      const expected = DEFAULT_PALETTE.slice(0, 2);
      expect(generatePalette(2, null as any)).toEqual(expected);
    });

    it('should fall back to the default palette if custom palette is undefined', () => {
      const expected = DEFAULT_PALETTE.slice(0, 2);
      expect(generatePalette(2, undefined)).toEqual(expected);
    });

    it('should fall back to the default palette if custom palette is not an array', () => {
      const expected = DEFAULT_PALETTE.slice(0, 2);
      expect(generatePalette(2, 'not an array' as any)).toEqual(expected);
    });

    it('should generate a large number of colors, demonstrating cycling', () => {
      const expected = [
        ...DEFAULT_PALETTE, // 10 colors
        DEFAULT_PALETTE[0], DEFAULT_PALETTE[1], // 2 more colors
      ];
      expect(generatePalette(12)).toEqual(expected);
    });
  });

  // --- calculateMinMax Tests ---
  describe('calculateMinMax', () => {
    interface DataItem {
      id: number;
      value?: number | string | null | undefined;
      score?: number;
      name?: string;
    }

    it('should calculate min and max for an array of numbers', () => {
      const data = [10, 5, 20, 15];
      const expected: MinMaxResult = { min: 5, max: 20 };
      expect(calculateMinMax(data)).toEqual(expected);
    });

    it('should calculate min and max for an array of objects with a specified key', () => {
      const data: DataItem[] = [{ id: 1, value: 10 }, { id: 2, value: 5 }, { id: 3, value: 20 }];
      const expected: MinMaxResult = { min: 5, max: 20 };
      expect(calculateMinMax(data, 'value')).toEqual(expected);
    });

    it('should return null for an empty array', () => {
      const data: number[] = [];
      expect(calculateMinMax(data)).toBeNull();
    });

    it('should return null for null input data', () => {
      expect(calculateMinMax(null as any)).toBeNull();
    });

    it('should return null for undefined input data', () => {
      expect(calculateMinMax(undefined as any)).toBeNull();
    });

    it('should ignore non-numeric values in a number array', () => {
      const data = [10, 'invalid', 5, null, 20, undefined, NaN, Infinity, -Infinity];
      const expected: MinMaxResult = { min: 5, max: 20 };
      expect(calculateMinMax(data as any)).toEqual(expected);
    });

    it('should ignore non-numeric values for the key in an array of objects', () => {
      const data: DataItem[] = [{ id: 1, value: 10 }, { id: 2, value: 'abc' }, { id: 3, value: 20 }, { id: 4, value: null }, { id: 5, value: NaN }];
      const expected: MinMaxResult = { min: 10, max: 20 };
      expect(calculateMinMax(data, 'value' as any)).toEqual(expected);
    });

    it('should return null if the key is missing in all objects', () => {
      const data: DataItem[] = [{ id: 1, score: 10 }, { id: 2, score: 5 }];
      expect(calculateMinMax(data, 'value')).toBeNull();
    });

    it('should return null if no valid numbers are found in a number array', () => {
      const data = ['a', null, undefined, NaN, Infinity, -Infinity];
      expect(calculateMinMax(data as any)).toBeNull();
    });

    it('should return null if no valid numbers are found for the key in an object array', () => {
      const data: DataItem[] = [{ id: 1, value: null }, { id: 2, value: 'abc' }];
      expect(calculateMinMax(data, 'value' as any)).toBeNull();
    });

    it('should handle a single valid number in an array', () => {
      const data = [42];
      const expected: MinMaxResult = { min: 42, max: 42 };
      expect(calculateMinMax(data)).toEqual(expected);
    });

    it('should handle a single valid object with key in an array', () => {
      const data: DataItem[] = [{ id: 1, value: 42 }];
      const expected: MinMaxResult = { min: 42, max: 42 };
      expect(calculateMinMax(data, 'value')).toEqual(expected);
    });

    it('should handle negative numbers correctly', () => {
      const data = [-10, -5, -20, -15];
      const expected: MinMaxResult = { min: -20, max: -5 };
      expect(calculateMinMax(data)).toEqual(expected);
    });

    it('should handle mixed positive and negative numbers', () => {
      const data = [-10, 5, -20, 15];
      const expected: MinMaxResult = { min: -20, max: 15 };
      expect(calculateMinMax(data)).toEqual(expected);
    });

    it('should handle zero correctly', () => {
      const data = [0, 5, -5];
      const expected: MinMaxResult = { min: -5, max: 5 };
      expect(calculateMinMax(data)).toEqual(expected);
    });

    it('should return null if key is provided but data is not an array of objects', () => {
      const data = [1, 2, 3];
      expect(calculateMinMax(data, 'value' as any)).toBeNull();
    });
  });

  // --- createChartTitle Tests ---
  describe('createChartTitle', () => {
    it('should create a basic title configuration', () => {
      const expected: ChartTitleOptions = {
        display: true,
        text: 'Sales Performance',
        position: 'top',
        color: '#666',
        padding: 10,
      };
      expect(createChartTitle('Sales Performance')).toEqual(expected);
    });

    it('should create a title with a subtitle and custom position', () => {
      const expected: ChartTitleOptions = {
        display: true,
        text: ['Monthly Revenue', 'Q1 2023'],
        position: 'bottom',
        color: '#666',
        padding: 10,
      };
      expect(createChartTitle('Monthly Revenue', 'Q1 2023', 'bottom')).toEqual(expected);
    });

    it('should create a title with custom font options and color/padding', () => {
      const expected: ChartTitleOptions = {
        display: true,
        text: 'User Activity',
        position: 'top',
        font: { size: 18, weight: 'bold', family: 'Arial' },
        color: '#333',
        padding: 15,
      };
      expect(createChartTitle('User Activity', undefined, 'top', { size: 18, weight: 'bold', family: 'Arial' }, '#333', 15)).toEqual(expected);
    });

    it('should return null for an empty title string', () => {
      expect(createChartTitle('')).toBeNull();
    });

    it('should return null for a title string with only whitespace', () => {
      expect(createChartTitle('   ')).toBeNull();
    });

    it('should ignore a subtitle string with only whitespace', () => {
      const expected: ChartTitleOptions = {
        display: true,
        text: 'Main Title',
        position: 'top',
        color: '#666',
        padding: 10,
      };
      expect(createChartTitle('Main Title', '   ')).toEqual(expected);
    });

    it('should handle partial font options (only size)', () => {
      const expected: ChartTitleOptions = {
        display: true,
        text: 'Partial Font',
        position: 'top',
        font: { size: 20 },
        color: '#666',
        padding: 10,
      };
      expect(createChartTitle('Partial Font', undefined, 'top', { size: 20 })).toEqual(expected);
    });

    it('should handle partial font options (only weight)', () => {
      const expected: ChartTitleOptions = {
        display: true,
        text: 'Partial Font',
        position: 'top',
        font: { weight: 'lighter' },
        color: '#666',
        padding: 10,
      };
      expect(createChartTitle('Partial Font', undefined, 'top', { weight: 'lighter' })).toEqual(expected);
    });

    it('should use default position, color, and padding when not provided', () => {
      const expected: ChartTitleOptions = {
        display: true,
        text: 'Default Options',
        position: 'top',
        color: '#666',
        padding: 10,
      };
      expect(createChartTitle('Default Options')).toEqual(expected);
    });

    it('should correctly set position to "left"', () => {
      const expected: ChartTitleOptions = {
        display: true,
        text: 'Left Title',
        position: 'left',
        color: '#666',
        padding: 10,
      };
      expect(createChartTitle('Left Title', undefined, 'left')).toEqual(expected);
    });

    it('should correctly set position to "right"', () => {
      const expected: ChartTitleOptions = {
        display: true,
        text: 'Right Title',
        position: 'right',
        color: '#666',
        padding: 10,
      };
      expect(createChartTitle('Right Title', undefined, 'right')).toEqual(expected);
    });
  });
});