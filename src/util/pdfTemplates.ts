/**
 * @file Utility functions for PDF generation layout and content formatting.
 * @module pdfTemplates
 */

/**
 * Options for calculating a grid cell's position.
 */
export interface GridCellPositionOptions {
  /** The starting X coordinate of the grid. */
  startX: number;
  /** The starting Y coordinate of the grid. */
  startY: number;
  /** The width of each cell in the grid. */
  cellWidth: number;
  /** The height of each cell in the grid. */
  cellHeight: number;
  /** The column index of the desired cell (0-indexed). */
  colIndex: number;
  /** The row index of the desired cell (0-indexed). */
  rowIndex: number;
  /** The horizontal spacing between cells. Defaults to 0. */
  colSpacing?: number;
  /** The vertical spacing between cells. Defaults to 0. */
  rowSpacing?: number;
}

/**
 * Calculates the X coordinate to horizontally center an element within a container.
 *
 * @param containerWidth The total width of the container.
 * @param elementWidth The width of the element to be centered.
 * @returns The X coordinate for the top-left corner of the centered element.
 * @throws {Error} If containerWidth or elementWidth are negative.
 *
 * @example
 * // Unit Test Example: Basic centering
 * // expect(calculateCenteredX(100, 50)).toBe(25);
 *
 * @example
 * // Unit Test Example: Element wider than container (should still center)
 * // expect(calculateCenteredX(50, 100)).toBe(-25);
 *
 * @example
 * // Unit Test Example: Zero width element
 * // expect(calculateCenteredX(100, 0)).toBe(50);
 *
 * @example
 * // Unit Test Example: Negative container width (throws error)
 * // expect(() => calculateCenteredX(-100, 50)).toThrow('Dimensions cannot be negative.');
 */
export function calculateCenteredX(containerWidth: number, elementWidth: number): number {
  if (containerWidth < 0 || elementWidth < 0) {
    throw new Error('Dimensions cannot be negative.');
  }
  return (containerWidth - elementWidth) / 2;
}

/**
 * Calculates the X coordinate to right-align an element within a container, with an optional margin.
 *
 * @param containerWidth The total width of the container.
 * @param elementWidth The width of the element to be right-aligned.
 * @param margin The right margin from the container's edge. Defaults to 0.
 * @returns The X coordinate for the top-left corner of the right-aligned element.
 * @throws {Error} If containerWidth, elementWidth, or margin are negative.
 *
 * @example
 * // Unit Test Example: Basic right alignment
 * // expect(calculateRightAlignedX(100, 20)).toBe(80);
 *
 * @example
 * // Unit Test Example: Right alignment with margin
 * // expect(calculateRightAlignedX(100, 20, 10)).toBe(70);
 *
 * @example
 * // Unit Test Example: Element wider than container (with margin)
 * // expect(calculateRightAlignedX(50, 100, 5)).toBe(-55);
 *
 * @example
 * // Unit Test Example: Zero width element with margin
 * // expect(calculateRightAlignedX(100, 0, 10)).toBe(90);
 *
 * @example
 * // Unit Test Example: Negative element width (throws error)
 * // expect(() => calculateRightAlignedX(100, -20)).toThrow('Dimensions cannot be negative.');
 */
export function calculateRightAlignedX(containerWidth: number, elementWidth: number, margin: number = 0): number {
  if (containerWidth < 0 || elementWidth < 0 || margin < 0) {
    throw new Error('Dimensions cannot be negative.');
  }
  return containerWidth - elementWidth - margin;
}

/**
 * Calculates the Y coordinate to vertically center an element within a container.
 *
 * @param containerHeight The total height of the container.
 * @param elementHeight The height of the element to be centered.
 * @returns The Y coordinate for the top-left corner of the centered element.
 * @throws {Error} If containerHeight or elementHeight are negative.
 *
 * @example
 * // Unit Test Example: Basic vertical centering
 * // expect(calculateVerticalMiddleY(100, 50)).toBe(25);
 *
 * @example
 * // Unit Test Example: Element taller than container
 * // expect(calculateVerticalMiddleY(50, 100)).toBe(-25);
 *
 * @example
 * // Unit Test Example: Zero height element
 * // expect(calculateVerticalMiddleY(100, 0)).toBe(50);
 *
 * @example
 * // Unit Test Example: Negative container height (throws error)
 * // expect(() => calculateVerticalMiddleY(-100, 50)).toThrow('Dimensions cannot be negative.');
 */
export function calculateVerticalMiddleY(containerHeight: number, elementHeight: number): number {
  if (containerHeight < 0 || elementHeight < 0) {
    throw new Error('Dimensions cannot be negative.');
  }
  return (containerHeight - elementHeight) / 2;
}

/**
 * Calculates the X positions for a series of elements to be distributed horizontally within a container.
 * Elements are distributed from left to right, with optional uniform spacing between them.
 *
 * @param containerWidth The total width of the container.
 * @param elementWidths An array of widths for each element to be distributed.
 * @param spacing The uniform spacing to apply between elements. Defaults to 0.
 * @returns An array of X coordinates for the top-left corner of each element.
 * @throws {Error} If containerWidth or any element width or spacing are negative.
 *
 * @example
 * // Unit Test Example: Two elements, no spacing
 * // expect(calculateDistributedXPositions(100, [20, 30])).toEqual([25, 55]);
 *
 * @example
 * // Unit Test Example: Three elements, with spacing
 * // expect(calculateDistributedXPositions(100, [10, 20, 10], 5)).toEqual([27.5, 42.5, 67.5]);
 *
 * @example
 * // Unit Test Example: Empty elementWidths array
 * // expect(calculateDistributedXPositions(100, [])).toEqual([]);
 *
 * @example
 * // Unit Test Example: Single element
 * // expect(calculateDistributedXPositions(100, [50])).toEqual([25]);
 *
 * @example
 * // Unit Test Example: Total elements width + spacing exceeds container
 * // expect(calculateDistributedXPositions(50, [20, 30], 10)).toEqual([-5, 25]); // Still calculates, but might be off-canvas
 *
 * @example
 * // Unit Test Example: Negative spacing (throws error)
 * // expect(() => calculateDistributedXPositions(100, [10, 20], -5)).toThrow('Dimensions cannot be negative.');
 */
export function calculateDistributedXPositions(containerWidth: number, elementWidths: number[], spacing: number = 0): number[] {
  if (containerWidth < 0 || spacing < 0) {
    throw new Error('Dimensions cannot be negative.');
  }
  if (elementWidths.some(w => w < 0)) {
    throw new Error('Element widths cannot be negative.');
  }

  if (elementWidths.length === 0) {
    return [];
  }

  const totalElementsWidth = elementWidths.reduce((sum, width) => sum + width, 0);
  const totalSpacingWidth = (elementWidths.length - 1) * spacing;
  const totalOccupiedWidth = totalElementsWidth + totalSpacingWidth;

  let currentX = calculateCenteredX(containerWidth, totalOccupiedWidth);
  const positions: number[] = [];

  for (let i = 0; i < elementWidths.length; i++) {
    positions.push(currentX);
    currentX += elementWidths[i] + spacing;
  }

  return positions;
}

/**
 * Calculates the top-left (x, y) coordinates for a specific cell within a grid layout.
 *
 * @param options Configuration for the grid cell position calculation.
 * @returns An object containing the `x` and `y` coordinates for the top-left of the cell.
 * @throws {Error} If any dimension (startX, startY, cellWidth, cellHeight, colSpacing, rowSpacing) is negative,
 *                 or if colIndex/rowIndex are negative.
 *
 * @example
 * // Unit Test Example: First cell in a basic grid
 * // expect(calculateGridCellPosition({ startX: 10, startY: 20, cellWidth: 50, cellHeight: 30, colIndex: 0, rowIndex: 0 })).toEqual({ x: 10, y: 20 });
 *
 * @example
 * // Unit Test Example: Cell in the middle of a grid with spacing
 * // expect(calculateGridCellPosition({ startX: 10, startY: 20, cellWidth: 50, cellHeight: 30, colIndex: 1, rowIndex: 2, colSpacing: 5, rowSpacing: 10 })).toEqual({ x: 65, y: 120 });
 *
 * @example
 * // Unit Test Example: Negative colIndex (throws error)
 * // expect(() => calculateGridCellPosition({ startX: 10, startY: 20, cellWidth: 50, cellHeight: 30, colIndex: -1, rowIndex: 0 })).toThrow('colIndex and rowIndex cannot be negative.');
 *
 * @example
 * // Unit Test Example: Negative cellWidth (throws error)
 * // expect(() => calculateGridCellPosition({ startX: 10, startY: 20, cellWidth: -50, cellHeight: 30, colIndex: 0, rowIndex: 0 })).toThrow('Dimensions cannot be negative.');
 */
export function calculateGridCellPosition(options: GridCellPositionOptions): { x: number; y: number } {
  const { startX, startY, cellWidth, cellHeight, colIndex, rowIndex, colSpacing = 0, rowSpacing = 0 } = options;

  if (startX < 0 || startY < 0 || cellWidth < 0 || cellHeight < 0 || colSpacing < 0 || rowSpacing < 0) {
    throw new Error('Dimensions cannot be negative.');
  }
  if (colIndex < 0 || rowIndex < 0) {
    throw new Error('colIndex and rowIndex cannot be negative.');
  }

  const x = startX + colIndex * (cellWidth + colSpacing);
  const y = startY + rowIndex * (cellHeight + rowSpacing);

  return { x, y };
}

/**
 * Formats a number as a currency string using `Intl.NumberFormat`.
 *
 * @param amount The number to format.
 * @param options Optional `Intl.NumberFormatOptions` to customize the formatting.
 *                Defaults to `{ style: 'currency', currency: 'USD', currencyDisplay: 'symbol' }`.
 *                If `currency` is not provided in options, it defaults to 'USD'.
 * @param locale The locale string (e.g., 'en-US', 'de-DE'). Defaults to the user's default locale.
 * @returns The formatted currency string.
 * @throws {Error} If the amount is not a valid number.
 *
 * @example
 * // Unit Test Example: Basic USD formatting
 * // expect(formatCurrency(1234.56)).toBe('$1,234.56');
 *
 * @example
 * // Unit Test Example: Euro formatting
 * // expect(formatCurrency(1234.56, { currency: 'EUR' }, 'de-DE')).toBe('1.234,56 €');
 *
 * @example
 * // Unit Test Example: No decimal places
 * // expect(formatCurrency(100, { minimumFractionDigits: 0, maximumFractionDigits: 0 })).toBe('$100');
 *
 * @example
 * // Unit Test Example: Negative amount
 * // expect(formatCurrency(-500.25)).toBe('-$500.25');
 *
 * @example
 * // Unit Test Example: Invalid amount (throws error)
 * // expect(() => formatCurrency(NaN)).toThrow('Invalid amount provided.');
 */
export function formatCurrency(amount: number, options?: Intl.NumberFormatOptions, locale?: string): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new Error('Invalid amount provided.');
  }

  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'USD', // Default currency if not specified
    currencyDisplay: 'symbol',
  };

  const mergedOptions = { ...defaultOptions, ...options };

  // Ensure currency is set if style is 'currency' but currency is missing in options
  if (mergedOptions.style === 'currency' && !mergedOptions.currency) {
    mergedOptions.currency = 'USD';
  }

  return new Intl.NumberFormat(locale, mergedOptions).format(amount);
}

/**
 * Formats a date into a localized string using `Intl.DateTimeFormat`.
 *
 * @param date The date to format. Can be a `Date` object, a date string, or a timestamp.
 * @param options Optional `Intl.DateTimeFormatOptions` to customize the formatting.
 *                Defaults to `{ year: 'numeric', month: 'short', day: 'numeric' }`.
 * @param locale The locale string (e.g., 'en-US', 'de-DE'). Defaults to the user's default locale.
 * @returns The formatted date string.
 * @throws {Error} If the provided date is invalid.
 *
 * @example
 * // Unit Test Example: Basic date formatting
 * // const date = new Date('2023-01-15T10:00:00Z');
 * // expect(formatDate(date, {}, 'en-US')).toBe('Jan 15, 2023');
 *
 * @example
 * // Unit Test Example: Full date and time
 * // const date = new Date('2023-01-15T10:30:00Z');
 * // expect(formatDate(date, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }, 'en-US')).toBe('January 15, 2023, 10:30 AM');
 *
 * @example
 * // Unit Test Example: Date string input
 * // expect(formatDate('2024-03-01', {}, 'en-US')).toBe('Mar 1, 2024');
 *
 * @example
 * // Unit Test Example: Timestamp input
 * // expect(formatDate(1673779200000, {}, 'en-US')).toBe('Jan 15, 2023'); // Corresponds to 2023-01-15T00:00:00Z
 *
 * @example
 * // Unit Test Example: Invalid date input (throws error)
 * // expect(() => formatDate('invalid date string')).toThrow('Invalid date provided.');
 */
export function formatDate(date: Date | string | number, options?: Intl.DateTimeFormatOptions, locale?: string): string {
  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided.');
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return new Intl.DateTimeFormat(locale, mergedOptions).format(dateObj);
}