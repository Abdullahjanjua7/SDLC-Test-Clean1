/**
 * @file chartUtils.ts
 * @description Utility functions for preparing chart data and common chart configurations.
 */

/**
 * Represents a generic data point with an x-value and a numeric y-value.
 */
export interface ChartDataPoint {
  x: any;
  y: number;
}

/**
 * Represents the minimum and maximum values found in a dataset.
 */
export interface MinMaxResult {
  min: number;
  max: number;
}

/**
 * Represents common chart title configuration.
 */
export interface ChartTitleOptions {
  display: boolean;
  text: string | string[];
  position?: 'top' | 'bottom' | 'left' | 'right';
  font?: {
    size?: number;
    weight?: string;
    family?: string;
  };
  color?: string;
  padding?: number;
}

/**
 * Transforms an array of raw data objects into a standard `{ x, y }` format,
 * suitable for many line, scatter, or bar charts.
 *
 * @template T The type of the raw data objects in the input array.
 * @param {T[]} data The array of raw data objects to transform.
 * @param {keyof T | ((item: T) => any)} xKey The key in `T` for the x-axis value, or a function to extract it.
 * @param {keyof T | ((item: T) => number | null | undefined)} yKey The key in `T` for the y-axis value, or a function to extract it.
 * @returns {ChartDataPoint[]} An array of `{ x: any, y: number }` objects.
 *          Returns an empty array if the input data is empty or invalid.
 *
 * @example
 * // Unit Test Example: Basic transformation
 * const rawData1 = [{ date: '2023-01-01', value: 10 }, { date: '2023-01-02', value: 15 }];
 * const formatted1 = formatSeriesData(rawData1, 'date', 'value');
 * // Expected: [{ x: '2023-01-01', y: 10 }, { x: '2023-01-02', y: 15 }]
 *
 * @example
 * // Unit Test Example: Using functions for keys
 * const rawData2 = [{ timestamp: 1672531200000, amount: 20.5 }, { timestamp: 1672617600000, amount: 22.1 }];
 * const formatted2 = formatSeriesData(
 *   rawData2,
 *   item => new Date(item.timestamp),
 *   item => item.amount * 2
 * );
 * // Expected: [{ x: new Date(1672531200000), y: 41 }, { x: new Date(1672617600000), y: 44.2 }]
 *
 * @example
 * // Unit Test Example: Handling null/undefined y-values
 * const rawData3 = [{ id: 1, val: 10 }, { id: 2, val: null }, { id: 3, val: 20 }, { id: 4, val: undefined }];
 * const formatted3 = formatSeriesData(rawData3, 'id', 'val');
 * // Expected: [{ x: 1, y: 10 }, { x: 3, y: 20 }] (null/undefined y-values are filtered out)
 *
 * @example
 * // Unit Test Example: Handling non-numeric y-values
 * const rawData4 = [{ id: 1, val: 10 }, { id: 2, val: 'invalid' }, { id: 3, val: 20 }];
 * const formatted4 = formatSeriesData(rawData4, 'id', 'val' as any); // Type assertion for test
 * // Expected: [{ x: 1, y: 10 }, { x: 3, y: 20 }] (non-numeric y-values are filtered out)
 *
 * @example
 * // Unit Test Example: Empty input data
 * const rawData5: any[] = [];
 * const formatted5 = formatSeriesData(rawData5, 'keyX', 'keyY');
 * // Expected: []
 */
export function formatSeriesData<T>(
  data: T[],
  xKey: keyof T | ((item: T) => any),
  yKey: keyof T | ((item: T) => number | null | undefined)
): ChartDataPoint[] {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  return data.reduce((acc: ChartDataPoint[], item: T) => {
    let xValue: any;
    if (typeof xKey === 'function') {
      xValue = xKey(item);
    } else {
      xValue = item[xKey];
    }

    let yValue: number | null | undefined;
    if (typeof yKey === 'function') {
      yValue = yKey(item);
    } else {
      yValue = item[yKey] as any; // Type assertion as we'll validate it
    }

    // Filter out data points where yValue is null, undefined, or not a finite number
    if (yValue !== null && yValue !== undefined && typeof yValue === 'number' && Number.isFinite(yValue)) {
      acc.push({ x: xValue, y: yValue });
    }
    return acc;
  }, []);
}

/**
 * A default palette of distinct colors for charts.
 */
const DEFAULT_CHART_PALETTE: string[] = [
  '#42A5F5', // Blue
  '#66BB6A', // Green
  '#FFA726', // Orange
  '#EF5350', // Red
  '#AB47BC', // Purple
  '#78909C', // Blue Grey
  '#FFCA28', // Amber
  '#26A69A', // Teal
  '#EC407A', // Pink
  '#8D6E63', // Brown
];

/**
 * Generates an array of distinct colors for chart series.
 * If `count` exceeds the length of `baseColors` (or default palette), colors will cycle.
 *
 * @param {number} count The number of colors to generate. Must be a non-negative integer.
 * @param {string[]} [baseColors=DEFAULT_CHART_PALETTE] An optional array of primary colors to use.
 * @returns {string[]} An array of hex color strings. Returns an empty array if `count` is 0 or negative.
 *
 * @example
 * // Unit Test Example: Generate 3 colors from default palette
 * const colors1 = generatePalette(3);
 * // Expected: ['#42A5F5', '#66BB6A', '#FFA726']
 *
 * @example
 * // Unit Test Example: Generate 5 colors from a custom palette
 * const customPalette = ['#FF0000', '#00FF00', '#0000FF'];
 * const colors2 = generatePalette(5, customPalette);
 * // Expected: ['#FF0000', '#00FF00', '#0000FF', '#FF0000', '#00FF00'] (cycles)
 *
 * @example
 * // Unit Test Example: Generate 0 colors
 * const colors3 = generatePalette(0);
 * // Expected: []
 *
 * @example
 * // Unit Test Example: Generate negative number of colors
 * const colors4 = generatePalette(-2);
 * // Expected: []
 */
export function generatePalette(count: number, baseColors: string[] = DEFAULT_CHART_PALETTE): string[] {
  if (count <= 0) {
    return [];
  }

  if (!Array.isArray(baseColors) || baseColors.length === 0) {
    // Fallback to default if custom palette is invalid
    baseColors = DEFAULT_CHART_PALETTE;
  }

  const palette: string[] = [];
  for (let i = 0; i < count; i++) {
    palette.push(baseColors[i % baseColors.length]);
  }
  return palette;
}

/**
 * Calculates the minimum and maximum values from a numeric array or a specific numeric key
 * within an array of objects.
 *
 * @template T The type of objects in the array if `data` is an array of objects.
 * @param {number[] | T[]} data The array of numbers or array of objects to analyze.
 * @param {keyof T} [key] Optional. The key in `T` to extract numeric values from if `data` is an array of objects.
 * @returns {MinMaxResult | null} An object `{ min: number, max: number }` or `null` if the data is empty,
 *          contains no valid numbers, or the key is not found/invalid.
 *
 * @example
 * // Unit Test Example: Array of numbers
 * const data1 = [10, 5, 20, 15];
 * const result1 = calculateMinMax(data1);
 * // Expected: { min: 5, max: 20 }
 *
 * @example
 * // Unit Test Example: Array of objects with a key
 * const data2 = [{ id: 1, value: 10 }, { id: 2, value: 5 }, { id: 3, value: 20 }];
 * const result2 = calculateMinMax(data2, 'value');
 * // Expected: { min: 5, max: 20 }
 *
 * @example
 * // Unit Test Example: Empty array
 * const data3: number[] = [];
 * const result3 = calculateMinMax(data3);
 * // Expected: null
 *
 * @example
 * // Unit Test Example: Array with non-numeric values (should ignore them)
 * const data4 = [10, 'invalid', 5, null, 20, undefined];
 * const result4 = calculateMinMax(data4 as any); // Type assertion for test
 * // Expected: { min: 5, max: 20 }
 *
 * @example
 * // Unit Test Example: Array of objects with missing key
 * const data5 = [{ id: 1, val: 10 }, { id: 2, val: 5 }];
 * const result5 = calculateMinMax(data5, 'nonExistentKey' as any); // Type assertion for test
 * // Expected: null
 *
 * @example
 * // Unit Test Example: Array of objects with non-numeric values for the key
 * const data6 = [{ id: 1, value: 10 }, { id: 2, value: 'abc' }, { id: 3, value: 20 }];
 * const result6 = calculateMinMax(data6, 'value' as any); // Type assertion for test
 * // Expected: { min: 10, max: 20 }
 */
export function calculateMinMax<T>(data: number[] | T[], key?: keyof T): MinMaxResult | null {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  let minVal: number = Infinity;
  let maxVal: number = -Infinity;
  let foundValidNumber = false;

  for (const item of data) {
    let value: any;
    if (key !== undefined && typeof item === 'object' && item !== null && key in item) {
      value = (item as any)[key];
    } else if (key === undefined && typeof item === 'number') {
      value = item;
    } else {
      // Skip if key is provided but item is not an object, or key is not found
      // or if key is not provided but item is not a number
      continue;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      minVal = Math.min(minVal, value);
      maxVal = Math.max(maxVal, value);
      foundValidNumber = true;
    }
  }

  if (foundValidNumber) {
    return { min: minVal, max: maxVal };
  }

  return null;
}

/**
 * Creates a common chart title configuration object, suitable for various charting libraries.
 * This function provides a structured way to define chart titles and subtitles.
 *
 * @param {string} title The main chart title.
 * @param {string} [subtitle] Optional subtitle for the chart.
 * @param {'top' | 'bottom' | 'left' | 'right'} [position='top'] The position of the title on the chart.
 * @param {object} [fontOptions] Optional font styling for the title.
 * @param {number} [fontOptions.size] Font size in pixels.
 * @param {string} [fontOptions.weight] Font weight (e.g., 'normal', 'bold', 'bolder', 'lighter', '100'-'900').
 * @param {string} [fontOptions.family] Font family (e.g., 'Arial', 'sans-serif').
 * @param {string} [color='#666'] Font color for the title.
 * @param {number} [padding=10] Padding around the title.
 * @returns {ChartTitleOptions | null} An object representing the title configuration, or `null` if the title is empty.
 *
 * @example
 * // Unit Test Example: Basic title
 * const title1 = createChartTitle('Sales Performance');
 * // Expected: { display: true, text: 'Sales Performance', position: 'top', color: '#666', padding: 10 }
 *
 * @example
 * // Unit Test Example: Title with subtitle and custom position
 * const title2 = createChartTitle('Monthly Revenue', 'Q1 2023', 'bottom');
 * // Expected: { display: true, text: ['Monthly Revenue', 'Q1 2023'], position: 'bottom', color: '#666', padding: 10 }
 *
 * @example
 * // Unit Test Example: Title with custom font and color
 * const title3 = createChartTitle('User Activity', undefined, 'top', { size: 18, weight: 'bold' }, '#333', 15);
 * // Expected: { display: true, text: 'User Activity', position: 'top', font: { size: 18, weight: 'bold' }, color: '#333', padding: 15 }
 *
 * @example
 * // Unit Test Example: Empty title
 * const title4 = createChartTitle('');
 * // Expected: null
 *
 * @example
 * // Unit Test Example: Title with only whitespace
 * const title5 = createChartTitle('   ');
 * // Expected: null
 */
export function createChartTitle(
  title: string,
  subtitle?: string,
  position: 'top' | 'bottom' | 'left' | 'right' = 'top',
  fontOptions?: { size?: number; weight?: string; family?: string },
  color: string = '#666',
  padding: number = 10
): ChartTitleOptions | null {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    return null;
  }

  const textArray: string[] = [trimmedTitle];
  if (subtitle && subtitle.trim()) {
    textArray.push(subtitle.trim());
  }

  const titleConfig: ChartTitleOptions = {
    display: true,
    text: textArray.length > 1 ? textArray : trimmedTitle,
    position: position,
    color: color,
    padding: padding,
  };

  if (fontOptions) {
    titleConfig.font = {};
    if (fontOptions.size) {
      titleConfig.font.size = fontOptions.size;
    }
    if (fontOptions.weight) {
      titleConfig.font.weight = fontOptions.weight;
    }
    if (fontOptions.family) {
      titleConfig.font.family = fontOptions.family;
    }
  }

  return titleConfig;
}