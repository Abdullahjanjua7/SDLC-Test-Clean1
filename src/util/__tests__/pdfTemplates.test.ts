import {
  calculateCenteredX,
  calculateRightAlignedX,
  calculateVerticalMiddleY,
  calculateDistributedXPositions,
  calculateGridCellPosition,
  formatCurrency,
  formatDate,
  GridCellPositionOptions,
} from './pdfTemplates'; // Adjust the path as necessary

describe('pdfTemplates Utility Functions', () => {

  // --- calculateCenteredX ---
  describe('calculateCenteredX', () => {
    it('should calculate the correct X coordinate for basic centering', () => {
      expect(calculateCenteredX(100, 50)).toBe(25);
      expect(calculateCenteredX(200, 100)).toBe(50);
    });

    it('should handle element wider than container', () => {
      expect(calculateCenteredX(50, 100)).toBe(-25);
      expect(calculateCenteredX(10, 20)).toBe(-5);
    });

    it('should handle zero width element', () => {
      expect(calculateCenteredX(100, 0)).toBe(50);
      expect(calculateCenteredX(0, 0)).toBe(0);
    });

    it('should handle zero container width', () => {
      expect(calculateCenteredX(0, 50)).toBe(-25);
    });

    it('should throw an error for negative containerWidth', () => {
      expect(() => calculateCenteredX(-100, 50)).toThrow('Dimensions cannot be negative.');
    });

    it('should throw an error for negative elementWidth', () => {
      expect(() => calculateCenteredX(100, -50)).toThrow('Dimensions cannot be negative.');
    });

    it('should throw an error for both negative dimensions', () => {
      expect(() => calculateCenteredX(-100, -50)).toThrow('Dimensions cannot be negative.');
    });
  });

  // --- calculateRightAlignedX ---
  describe('calculateRightAlignedX', () => {
    it('should calculate the correct X coordinate for basic right alignment', () => {
      expect(calculateRightAlignedX(100, 20)).toBe(80);
      expect(calculateRightAlignedX(200, 50)).toBe(150);
    });

    it('should calculate the correct X coordinate with a margin', () => {
      expect(calculateRightAlignedX(100, 20, 10)).toBe(70);
      expect(calculateRightAlignedX(200, 50, 20)).toBe(130);
    });

    it('should handle zero margin', () => {
      expect(calculateRightAlignedX(100, 20, 0)).toBe(80);
    });

    it('should handle element wider than container (with margin)', () => {
      expect(calculateRightAlignedX(50, 100, 5)).toBe(-55);
      expect(calculateRightAlignedX(10, 20, 0)).toBe(-10);
    });

    it('should handle zero width element with margin', () => {
      expect(calculateRightAlignedX(100, 0, 10)).toBe(90);
      expect(calculateRightAlignedX(50, 0, 0)).toBe(50);
    });

    it('should throw an error for negative containerWidth', () => {
      expect(() => calculateRightAlignedX(-100, 50, 10)).toThrow('Dimensions cannot be negative.');
    });

    it('should throw an error for negative elementWidth', () => {
      expect(() => calculateRightAlignedX(100, -50, 10)).toThrow('Dimensions cannot be negative.');
    });

    it('should throw an error for negative margin', () => {
      expect(() => calculateRightAlignedX(100, 50, -10)).toThrow('Dimensions cannot be negative.');
    });

    it('should throw an error for multiple negative dimensions', () => {
      expect(() => calculateRightAlignedX(-100, -50, -10)).toThrow('Dimensions cannot be negative.');
    });
  });

  // --- calculateVerticalMiddleY ---
  describe('calculateVerticalMiddleY', () => {
    it('should calculate the correct Y coordinate for basic vertical centering', () => {
      expect(calculateVerticalMiddleY(100, 50)).toBe(25);
      expect(calculateVerticalMiddleY(200, 100)).toBe(50);
    });

    it('should handle element taller than container', () => {
      expect(calculateVerticalMiddleY(50, 100)).toBe(-25);
      expect(calculateVerticalMiddleY(10, 20)).toBe(-5);
    });

    it('should handle zero height element', () => {
      expect(calculateVerticalMiddleY(100, 0)).toBe(50);
      expect(calculateVerticalMiddleY(0, 0)).toBe(0);
    });

    it('should handle zero container height', () => {
      expect(calculateVerticalMiddleY(0, 50)).toBe(-25);
    });

    it('should throw an error for negative containerHeight', () => {
      expect(() => calculateVerticalMiddleY(-100, 50)).toThrow('Dimensions cannot be negative.');
    });

    it('should throw an error for negative elementHeight', () => {
      expect(() => calculateVerticalMiddleY(100, -50)).toThrow('Dimensions cannot be negative.');
    });

    it('should throw an error for both negative dimensions', () => {
      expect(() => calculateVerticalMiddleY(-100, -50)).toThrow('Dimensions cannot be negative.');
    });
  });

  // --- calculateDistributedXPositions ---
  describe('calculateDistributedXPositions', () => {
    it('should return an empty array for an empty elementWidths array', () => {
      expect(calculateDistributedXPositions(100, [])).toEqual([]);
    });

    it('should center a single element with no spacing', () => {
      expect(calculateDistributedXPositions(100, [50])).toEqual([25]);
    });

    it('should center a single element with spacing (spacing is ignored for single element)', () => {
      expect(calculateDistributedXPositions(100, [50], 10)).toEqual([25]);
    });

    it('should distribute two elements with no spacing', () => {
      expect(calculateDistributedXPositions(100, [20, 30])).toEqual([25, 55]);
    });

    it('should distribute three elements with spacing', () => {
      expect(calculateDistributedXPositions(100, [10, 20, 10], 5)).toEqual([27.5, 42.5, 67.5]);
    });

    it('should handle elements that collectively exceed container width', () => {
      // Total occupied width: 20 + 30 + 10 (spacing) = 60. Container width = 50.
      // Centered X for 60 in 50: (50 - 60) / 2 = -5.
      // First element starts at -5.
      // Second element starts at -5 + 20 + 10 = 25.
      expect(calculateDistributedXPositions(50, [20, 30], 10)).toEqual([-5, 25]);
    });

    it('should handle zero element widths', () => {
      expect(calculateDistributedXPositions(100, [0, 0, 0], 10)).toEqual([35, 45, 55]);
    });

    it('should handle zero container width', () => {
      expect(calculateDistributedXPositions(0, [10, 10], 5)).toEqual([-12.5, 2.5]);
    });

    it('should throw an error for negative containerWidth', () => {
      expect(() => calculateDistributedXPositions(-100, [10, 20])).toThrow('Dimensions cannot be negative.');
    });

    it('should throw an error for negative spacing', () => {
      expect(() => calculateDistributedXPositions(100, [10, 20], -5)).toThrow('Dimensions cannot be negative.');
    });

    it('should throw an error for negative element widths', () => {
      expect(() => calculateDistributedXPositions(100, [10, -20])).toThrow('Element widths cannot be negative.');
      expect(() => calculateDistributedXPositions(100, [-10, 20])).toThrow('Element widths cannot be negative.');
    });
  });

  // --- calculateGridCellPosition ---
  describe('calculateGridCellPosition', () => {
    it('should calculate the position for the first cell (0,0) with no spacing', () => {
      const options: GridCellPositionOptions = {
        startX: 10,
        startY: 20,
        cellWidth: 50,
        cellHeight: 30,
        colIndex: 0,
        rowIndex: 0,
      };
      expect(calculateGridCellPosition(options)).toEqual({
        x: 10,
        y: 20
      });
    });

    it('should calculate the position for a cell with positive indices and no spacing', () => {
      const options: GridCellPositionOptions = {
        startX: 0,
        startY: 0,
        cellWidth: 50,
        cellHeight: 30,
        colIndex: 1,
        rowIndex: 1,
      };
      expect(calculateGridCellPosition(options)).toEqual({
        x: 50,
        y: 30
      });
    });

    it('should calculate the position for a cell with spacing', () => {
      const options: GridCellPositionOptions = {
        startX: 10,
        startY: 20,
        cellWidth: 50,
        cellHeight: 30,
        colIndex: 1,
        rowIndex: 2,
        colSpacing: 5,
        rowSpacing: 10,
      };
      // x = 10 + 1 * (50 + 5) = 10 + 55 = 65
      // y = 20 + 2 * (30 + 10) = 20 + 80 = 100
      expect(calculateGridCellPosition(options)).toEqual({
        x: 65,
        y: 100
      });
    });

    it('should handle zero cell width/height/spacing', () => {
      const options: GridCellPositionOptions = {
        startX: 10,
        startY: 20,
        cellWidth: 0,
        cellHeight: 0,
        colIndex: 2,
        rowIndex: 3,
        colSpacing: 0,
        rowSpacing: 0,
      };
      expect(calculateGridCellPosition(options)).toEqual({
        x: 10,
        y: 20
      });
    });

    it('should handle large indices', () => {
      const options: GridCellPositionOptions = {
        startX: 0,
        startY: 0,
        cellWidth: 10,
        cellHeight: 10,
        colIndex: 100,
        rowIndex: 50,
        colSpacing: 1,
        rowSpacing: 2,
      };
      // x = 0 + 100 * (10 + 1) = 100 * 11 = 1100
      // y = 0 + 50 * (10 + 2) = 50 * 12 = 600
      expect(calculateGridCellPosition(options)).toEqual({
        x: 1100,
        y: 600
      });
    });

    it('should throw an error for negative startX', () => {
      const options: GridCellPositionOptions = {
        startX: -10,
        startY: 20,
        cellWidth: 50,
        cellHeight: 30,
        colIndex: 0,
        rowIndex: 0,
      };
      expect(() => calculateGridCellPosition(options)).toThrow('Dimensions cannot be negative.');
    });

    it('should throw an error for negative cellWidth', () => {
      const options: GridCellPositionOptions = {
        startX: 10,
        startY: 20,
        cellWidth: -50,
        cellHeight: 30,
        colIndex: 0,
        rowIndex: 0,
      };
      expect(() => calculateGridCellPosition(options)).toThrow('Dimensions cannot be negative.');
    });

    it('should throw an error for negative colSpacing', () => {
      const options: GridCellPositionOptions = {
        startX: 10,
        startY: 20,
        cellWidth: 50,
        cellHeight: 30,
        colIndex: 0,
        rowIndex: 0,
        colSpacing: -5,
      };
      expect(() => calculateGridCellPosition(options)).toThrow('Dimensions cannot be negative.');
    });

    it('should throw an error for negative colIndex', () => {
      const options: GridCellPositionOptions = {
        startX: 10,
        startY: 20,
        cellWidth: 50,
        cellHeight: 30,
        colIndex: -1,
        rowIndex: 0,
      };
      expect(() => calculateGridCellPosition(options)).toThrow('colIndex and rowIndex cannot be negative.');
    });

    it('should throw an error for negative rowIndex', () => {
      const options: GridCellPositionOptions = {
        startX: 10,
        startY: 20,
        cellWidth: 50,
        cellHeight: 30,
        colIndex: 0,
        rowIndex: -1,
      };
      expect(() => calculateGridCellPosition(options)).toThrow('colIndex and rowIndex cannot be negative.');
    });

    it('should throw an error for multiple negative dimensions/indices', () => {
      const options: GridCellPositionOptions = {
        startX: -10,
        startY: 20,
        cellWidth: -50,
        cellHeight: 30,
        colIndex: -1,
        rowIndex: 0,
      };
      expect(() => calculateGridCellPosition(options)).toThrow('Dimensions cannot be negative.');
    });
  });

  // --- formatCurrency ---
  describe('formatCurrency', () => {
    // Mock Intl.NumberFormat to ensure consistent results across environments
    const mockNumberFormat = jest.spyOn(Intl, 'NumberFormat') as jest.Mock;

    beforeEach(() => {
      // Reset mock before each test
      mockNumberFormat.mockClear();
      // Provide a default mock implementation that mimics basic behavior
      mockNumberFormat.mockImplementation((locale, options) => ({
        format: (amount: number) => {
          const style = options?.style || 'decimal';
          const currency = options?.currency || 'USD';
          const currencyDisplay = options?.currencyDisplay || 'symbol';
          const minFraction = options?.minimumFractionDigits ?? 2;
          const maxFraction = options?.maximumFractionDigits ?? 2;

          let formatted = amount.toFixed(minFraction); // Simple approximation

          if (style === 'currency') {
            let symbol = '$';
            if (currency === 'EUR') symbol = '€';
            if (currency === 'JPY') symbol = '¥';

            if (currencyDisplay === 'symbol') {
              formatted = `${symbol}${formatted}`;
            } else if (currencyDisplay === 'code') {
              formatted = `${currency} ${formatted}`;
            } else if (currencyDisplay === 'name') {
              formatted = `${currency} ${formatted}`; // Simplified
            }
          }
          // Add basic thousands separator for USD-like locales
          if (locale === 'en-US' || !locale) {
            formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          } else if (locale === 'de-DE') {
            formatted = formatted.replace('.', ',').replace(/,/g, '.').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'); // Simplified
          }

          return formatted;
        },
      }));
    });

    afterAll(() => {
      mockNumberFormat.mockRestore(); // Restore original implementation
    });

    it('should format a number as USD currency by default (en-US locale)', () => {
      // Using actual Intl.NumberFormat for this test to ensure real behavior
      mockNumberFormat.mockRestore();
      expect(formatCurrency(1234.56, {}, 'en-US')).toBe('$1,234.56');
      expect(formatCurrency(100, {}, 'en-US')).toBe('$100.00');
    });

    it('should format a number as USD currency with default options if none provided', () => {
      // Using actual Intl.NumberFormat for this test to ensure real behavior
      mockNumberFormat.mockRestore();
      expect(formatCurrency(1234.56, undefined, 'en-US')).toBe('$1,234.56');
    });

    it('should format a number with specified currency (EUR, de-DE locale)', () => {
      // Using actual Intl.NumberFormat for this test to ensure real behavior
      mockNumberFormat.mockRestore();
      expect(formatCurrency(1234.56, {
        currency: 'EUR'
      }, 'de-DE')).toBe('1.234,56 €');
    });

    it('should format a number with no decimal places', () => {
      // Using actual Intl.NumberFormat for this test to ensure real behavior
      mockNumberFormat.mockRestore();
      expect(formatCurrency(100, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }, 'en-US')).toBe('$100');
      expect(formatCurrency(1234.567, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }, 'en-US')).toBe('$1,235');
    });

    it('should handle negative amounts', () => {
      // Using actual Intl.NumberFormat for this test to ensure real behavior
      mockNumberFormat.mockRestore();
      expect(formatCurrency(-500.25, {}, 'en-US')).toBe('-$500.25');
      expect(formatCurrency(-1234.56, {
        currency: 'EUR'
      }, 'de-DE')).toBe('-1.234,56 €');
    });

    it('should handle zero amount', () => {
      // Using actual Intl.NumberFormat for this test to ensure real behavior
      mockNumberFormat.mockRestore();
      expect(formatCurrency(0, {}, 'en-US')).toBe('$0.00');
    });

    it('should handle large amounts', () => {
      // Using actual Intl.NumberFormat for this test to ensure real behavior
      mockNumberFormat.mockRestore();
      expect(formatCurrency(123456789.123, {}, 'en-US')).toBe('$123,456,789.12');
    });

    it('should use default currency "USD" if style is "currency" but currency is not provided in options', () => {
      // Using actual Intl.NumberFormat for this test to ensure real behavior
      mockNumberFormat.mockRestore();
      const result = formatCurrency(100, {
        style: 'currency'
      }, 'en-US');
      expect(result).toBe('$100.00');
    });

    it('should throw an error for NaN amount', () => {
      expect(() => formatCurrency(NaN)).toThrow('Invalid amount provided.');
    });

    it('should throw an error for non-number amount (e.g., string)', () => {
      // @ts-ignore: Testing invalid input type
      expect(() => formatCurrency('abc')).toThrow('Invalid amount provided.');
    });

    it('should throw an error for null amount', () => {
      // @ts-ignore: Testing invalid input type
      expect(() => formatCurrency(null)).toThrow('Invalid amount provided.');
    });

    it('should throw an error for undefined amount', () => {
      // @ts-ignore: Testing invalid input type
      expect(() => formatCurrency(undefined)).toThrow('Invalid amount provided.');
    });
  });

  // --- formatDate ---
  describe('formatDate', () => {
    // Mock Intl.DateTimeFormat to ensure consistent results across environments
    const mockDateTimeFormat = jest.spyOn(Intl, 'DateTimeFormat') as jest.Mock;

    beforeEach(() => {
      // Reset mock before each test
      mockDateTimeFormat.mockClear();
      // Provide a default mock implementation that mimics basic behavior
      mockDateTimeFormat.mockImplementation((locale, options) => ({
        format: (date: Date) => {
          const year = options?.year === 'numeric' ? date.getFullYear() : '';
          const month = options?.month === 'short' ? date.toLocaleString('en-US', {
            month: 'short'
          }) :
            options?.month === 'long' ? date.toLocaleString('en-US', {
              month: 'long'
            }) : '';
          const day = options?.day === 'numeric' ? date.getDate() : '';
          const hour = options?.hour === '2-digit' ? date.getUTCHours().toString().padStart(2, '0') : '';
          const minute = options?.minute === '2-digit' ? date.getUTCMinutes().toString().padStart(2, '0') : '';

          let parts = [];
          if (month) parts.push(month);
          if (day) parts.push(day);
          if (year) parts.push(year);

          let dateString = parts.filter(Boolean).join(' ');
          if (locale === 'en-US' && month && day && year) {
            dateString = `${month} ${day}, ${year}`;
          } else if (locale === 'de-DE' && month && day && year) {
            dateString = `${day}. ${month}. ${year}`;
          }

          if (hour && minute) {
            const ampm = parseInt(hour) >= 12 ? 'PM' : 'AM';
            const displayHour = parseInt(hour) % 12 === 0 ? 12 : parseInt(hour) % 12;
            dateString += `, ${displayHour}:${minute} ${ampm}`;
          }

          return dateString.trim();
        },
      }));
    });

    afterAll(() => {
      mockDateTimeFormat.mockRestore(); // Restore original implementation
    });

    it('should format a Date object with default options (en-US locale)', () => {
      // Using actual Intl.DateTimeFormat for this test to ensure real behavior
      mockDateTimeFormat.mockRestore();
      const date = new Date('2023-01-15T10:00:00Z');
      expect(formatDate(date, {}, 'en-US')).toBe('Jan 15, 2023');
    });

    it('should format a date string with default options (en-US locale)', () => {
      // Using actual Intl.DateTimeFormat for this test to ensure real behavior
      mockDateTimeFormat.mockRestore();
      expect(formatDate('2024-03-01', {}, 'en-US')).toBe('Mar 1, 2024');
    });

    it('should format a timestamp with default options (en-US locale)', () => {
      // Using actual Intl.DateTimeFormat for this test to ensure real behavior
      mockDateTimeFormat.mockRestore();
      // Corresponds to 2023-01-15T00:00:00Z
      expect(formatDate(1673740800000, {}, 'en-US')).toBe('Jan 15, 2023');
    });

    it('should format with custom options for full date and time (en-US locale, UTC timezone)', () => {
      // Using actual Intl.DateTimeFormat for this test to ensure real behavior
      mockDateTimeFormat.mockRestore();
      const date = new Date('2023-01-15T10:30:00Z');
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
      };
      expect(formatDate(date, options, 'en-US')).toBe('January 15, 2023, 10:30 AM');
    });

    it('should format with custom options for different locale (de-DE)', () => {
      // Using actual Intl.DateTimeFormat for this test to ensure real behavior
      mockDateTimeFormat.mockRestore();
      const date = new Date('2023-01-15T10:30:00Z');
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      expect(formatDate(date, options, 'de-DE')).toBe('15. Januar 2023');
    });

    it('should handle date with only year and month', () => {
      // Using actual Intl.DateTimeFormat for this test to ensure real behavior
      mockDateTimeFormat.mockRestore();
      const date = new Date('2023-01-15T10:00:00Z');
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long'
      };
      expect(formatDate(date, options, 'en-US')).toBe('January 2023');
    });

    it('should handle date with only time', () => {
      // Using actual Intl.DateTimeFormat for this test to ensure real behavior
      mockDateTimeFormat.mockRestore();
      const date = new Date('2023-01-15T10:00:00Z');
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
      };
      expect(formatDate(date, options, 'en-US')).toBe('10:00 AM');
    });

    it('should throw an error for an invalid date string', () => {
      expect(() => formatDate('invalid date string')).toThrow('Invalid date provided.');
    });

    it('should throw an error for an invalid timestamp (e.g., null)', () => {
      // @ts-ignore: Testing invalid input type
      expect(() => formatDate(null)).toThrow('Invalid date provided.');
    });

    it('should throw an error for undefined date input', () => {
      // @ts-ignore: Testing invalid input type
      expect(() => formatDate(undefined)).toThrow('Invalid date provided.');
    });

    it('should throw an error for NaN date input', () => {
      expect(() => formatDate(NaN)).toThrow('Invalid date provided.');
    });
  });
});