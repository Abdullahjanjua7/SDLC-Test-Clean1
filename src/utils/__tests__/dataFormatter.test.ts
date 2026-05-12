import {
  formatDate,
  formatCurrency,
  capitalizeString,
  truncateString,
  formatBoolean,
  DateFormatOptions,
  CurrencyFormatOptions,
  TruncateStringOptions,
} from './dataFormatter'; // Adjust the path as necessary

// Mock Intl.DateTimeFormat and Intl.NumberFormat for consistent testing
// We'll mock the constructor and its format method to control output and test arguments.
const mockDateTimeFormatInstance = {
  format: jest.fn((date: Date) => `MOCKED_DATE_FORMAT(${date.toISOString()})`),
};
const mockDateTimeFormat = jest.fn(
  (locale?: string, options?: DateFormatOptions) => {
    // Simulate some basic Intl behavior for specific cases if needed,
    // but primarily focus on capturing arguments.
    if (locale === 'en-US' && options?.dateStyle === 'full') {
      return { format: jest.fn(() => 'Sunday, January 15, 2023') };
    }
    if (locale === 'de-DE' && options?.dateStyle === 'short') {
      return { format: jest.fn(() => '15.01.23') };
    }
    if (locale === 'en-US' && options?.year === 'numeric' && options?.month === 'long' && options?.day === 'numeric') {
      return { format: jest.fn(() => 'January 15, 2023') };
    }
    return mockDateTimeFormatInstance;
  }
);

const mockNumberFormatInstance = {
  format: jest.fn((number: number) => `MOCKED_CURRENCY_FORMAT(${number})`),
};
const mockNumberFormat = jest.fn(
  (locale?: string, options?: Intl.NumberFormatOptions) => {
    // Simulate some basic Intl behavior for specific cases if needed.
    if (options?.style === 'currency') {
      const currency = options.currency || 'USD';
      const minF = options.minimumFractionDigits ?? 2;
      const maxF = options.maximumFractionDigits ?? 2;

      if (locale === 'en-US' && currency === 'USD') {
        return { format: jest.fn((num) => `$${num.toFixed(maxF)}`) };
      }
      if (locale === 'de-DE' && currency === 'EUR') {
        return { format: jest.fn((num) => `${num.toFixed(maxF).replace('.', ',')} €`) };
      }
      if (currency === 'GBP' && minF === 0 && maxF === 0) {
        return { format: jest.fn((num) => `£${Math.round(num)}`) };
      }
      if (currency === 'JPY') {
        return { format: jest.fn((num) => `¥${Math.round(num)}`) };
      }
    }
    return mockNumberFormatInstance;
  }
);

// Store original Intl to restore after tests
const originalIntl = global.Intl;

// Mock console.error to prevent test output pollution and check calls
let consoleErrorSpy: jest.SpyInstance;

beforeAll(() => {
  // Partially mock global.Intl to control DateTimeFormat and NumberFormat
  global.Intl = {
    ...originalIntl, // Keep other Intl properties intact
    DateTimeFormat: mockDateTimeFormat as any, // Cast to any because we're partially implementing
    NumberFormat: mockNumberFormat as any,
  };
});

afterAll(() => {
  global.Intl = originalIntl; // Restore original Intl
});

beforeEach(() => {
  // Clear mocks before each test to ensure isolation
  mockDateTimeFormat.mockClear();
  mockDateTimeFormatInstance.format.mockClear();
  mockNumberFormat.mockClear();
  mockNumberFormatInstance.format.mockClear();
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorSpy.mockRestore(); // Restore console.error after each test
});

describe('formatDate', () => {
  const testDate = new Date('2023-01-15T10:00:00Z');
  const testTimestamp = 1673776800000; // Corresponds to 2023-01-15T10:00:00Z

  it('should format a Date object with default options and locale', () => {
    const result = formatDate(testDate);
    expect(mockDateTimeFormat).toHaveBeenCalledWith(undefined, undefined);
    expect(mockDateTimeFormatInstance.format).toHaveBeenCalledWith(testDate);
    expect(result).toBe(`MOCKED_DATE_FORMAT(${testDate.toISOString()})`);
  });

  it('should format an ISO string with default options and locale', () => {
    const isoString = '2023-01-15T10:00:00Z';
    const result = formatDate(isoString);
    expect(mockDateTimeFormat).toHaveBeenCalledWith(undefined, undefined);
    expect(mockDateTimeFormatInstance.format).toHaveBeenCalledWith(new Date(isoString));
    expect(result).toBe(`MOCKED_DATE_FORMAT(${testDate.toISOString()})`);
  });

  it('should format a timestamp with default options and locale', () => {
    const result = formatDate(testTimestamp);
    expect(mockDateTimeFormat).toHaveBeenCalledWith(undefined, undefined);
    expect(mockDateTimeFormatInstance.format).toHaveBeenCalledWith(new Date(testTimestamp));
    expect(result).toBe(`MOCKED_DATE_FORMAT(${testDate.toISOString()})`);
  });

  it('should format with specified options and locale (en-US)', () => {
    const options: DateFormatOptions = { dateStyle: 'full', timeStyle: 'short' };
    const locale = 'en-US';
    const result = formatDate(testDate, options, locale);
    expect(mockDateTimeFormat).toHaveBeenCalledWith(locale, options);
    // This specific mock returns a fixed string for this combination
    expect(result).toBe('Sunday, January 15, 2023');
  });

  it('should format with specified options and locale (de-DE)', () => {
    const options: DateFormatOptions = { dateStyle: 'short' };
    const locale = 'de-DE';
    const result = formatDate(testDate, options, locale);
    expect(mockDateTimeFormat).toHaveBeenCalledWith(locale, options);
    // This specific mock returns a fixed string for this combination
    expect(result).toBe('15.01.23');
  });

  it('should format with specific date parts', () => {
    const options: DateFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const result = formatDate(testTimestamp, options);
    expect(mockDateTimeFormat).toHaveBeenCalledWith(undefined, options);
    expect(result).toBe('January 15, 2023');
  });

  it('should return an empty string for null input', () => {
    expect(formatDate(null)).toBe('');
    expect(mockDateTimeFormat).not.toHaveBeenCalled();
  });

  it('should return an empty string for undefined input', () => {
    expect(formatDate(undefined)).toBe('');
    expect(mockDateTimeFormat).not.toHaveBeenCalled();
  });

  it('should return an empty string for an invalid date string', () => {
    expect(formatDate('invalid-date-string')).toBe('');
    expect(mockDateTimeFormat).not.toHaveBeenCalled();
  });

  it('should return an empty string for an invalid Date object', () => {
    expect(formatDate(new Date('invalid'))).toBe('');
    expect(mockDateTimeFormat).not.toHaveBeenCalled();
  });

  it('should return an empty string and log error if Intl.DateTimeFormat.format throws', () => {
    mockDateTimeFormatInstance.format.mockImplementationOnce(() => {
      throw new Error('Intl formatting error');
    });
    const result = formatDate(testDate);
    expect(result).toBe('');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'dataFormatter: Error formatting date:',
      expect.any(Error)
    );
  });
});

describe('formatCurrency', () => {
  it('should format a positive number with default options (USD, user locale)', () => {
    const amount = 1234.56;
    const result = formatCurrency(amount);
    expect(mockNumberFormat).toHaveBeenCalledWith(undefined, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: undefined,
      maximumFractionDigits: undefined,
    });
    expect(result).toBe(`$${amount.toFixed(2)}`);
  });

  it('should format a negative number with default options (USD, user locale)', () => {
    const amount = -1234.56;
    const result = formatCurrency(amount);
    expect(mockNumberFormat).toHaveBeenCalledWith(undefined, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: undefined,
      maximumFractionDigits: undefined,
    });
    expect(result).toBe(`$${amount.toFixed(2)}`);
  });

  it('should format zero with default options', () => {
    const amount = 0;
    const result = formatCurrency(amount);
    expect(mockNumberFormat).toHaveBeenCalledWith(undefined, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: undefined,
      maximumFractionDigits: undefined,
    });
    expect(result).toBe(`$${amount.toFixed(2)}`);
  });

  it('should format with specified currency and locale (EUR, de-DE)', () => {
    const amount = 1234.56;
    const options: CurrencyFormatOptions = { currencyCode: 'EUR', locale: 'de-DE' };
    const result = formatCurrency(amount, options);
    expect(mockNumberFormat).toHaveBeenCalledWith('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: undefined,
      maximumFractionDigits: undefined,
    });
    expect(result).toBe(`${amount.toFixed(2).replace('.', ',')} €`);
  });

  it('should format with custom fraction digits (GBP, 0 decimals)', () => {
    const amount = 99.99;
    const options: CurrencyFormatOptions = {
      currencyCode: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    };
    const result = formatCurrency(amount, options);
    expect(mockNumberFormat).toHaveBeenCalledWith(undefined, {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    expect(result).toBe(`£${Math.round(amount)}`);
  });

  it('should format JPY (no decimals)', () => {
    const amount = -123.45;
    const options: CurrencyFormatOptions = { currencyCode: 'JPY' };
    const result = formatCurrency(amount, options);
    expect(mockNumberFormat).toHaveBeenCalledWith(undefined, {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: undefined,
      maximumFractionDigits: undefined,
    });
    expect(result).toBe(`¥${Math.round(amount)}`);
  });

  it('should return an empty string for null input', () => {
    expect(formatCurrency(null)).toBe('');
    expect(mockNumberFormat).not.toHaveBeenCalled();
  });

  it('should return an empty string for undefined input', () => {
    expect(formatCurrency(undefined)).toBe('');
    expect(mockNumberFormat).not.toHaveBeenCalled();
  });

  it('should return an empty string for NaN input', () => {
    expect(formatCurrency(NaN)).toBe('');
    expect(mockNumberFormat).not.toHaveBeenCalled();
  });

  it('should return an empty string for Infinity input', () => {
    expect(formatCurrency(Infinity)).toBe('');
    expect(mockNumberFormat).not.toHaveBeenCalled();
  });

  it('should return an empty string for -Infinity input', () => {
    expect(formatCurrency(-Infinity)).toBe('');
    expect(mockNumberFormat).not.toHaveBeenCalled();
  });

  it('should return an empty string and log error if Intl.NumberFormat.format throws', () => {
    mockNumberFormatInstance.format.mockImplementationOnce(() => {
      throw new Error('Intl formatting error');
    });
    const result = formatCurrency(100);
    expect(result).toBe('');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'dataFormatter: Error formatting currency:',
      expect.any(Error)
    );
  });
});

describe('capitalizeString', () => {
  it('should capitalize the first letter of a lowercase string', () => {
    expect(capitalizeString('hello world')).toBe('Hello world');
  });

  it('should capitalize the first letter of an uppercase string', () => {
    expect(capitalizeString('TYPESCRIPT')).toBe('TYPESCRIPT'); // First letter already capitalized
  });

  it('should capitalize the first letter of a mixed case string', () => {
    expect(capitalizeString('tYpEsCrIpT')).toBe('TYpEsCrIpT');
  });

  it('should capitalize a single character string', () => {
    expect(capitalizeString('a')).toBe('A');
  });

  it('should return an empty string for an empty string input', () => {
    expect(capitalizeString('')).toBe('');
  });

  it('should return an empty string for null input', () => {
    expect(capitalizeString(null)).toBe('');
  });

  it('should return an empty string for undefined input', () => {
    expect(capitalizeString(undefined)).toBe('');
  });

  it('should handle strings starting with non-alphabetic characters', () => {
    expect(capitalizeString('123test')).toBe('123test'); // Numbers are not capitalized
    expect(capitalizeString('!hello')).toBe('!hello');
  });
});

describe('truncateString', () => {
  it('should truncate a long string with default ellipsis', () => {
    const str = 'This is a very long string that needs to be truncated.';
    expect(truncateString(str, 10)).toBe('This is...');
  });

  it('should not truncate a string shorter than maxLength', () => {
    const str = 'Short string.';
    expect(truncateString(str, 20)).toBe('Short string.');
  });

  it('should not truncate a string equal to maxLength', () => {
    const str = 'Exact length'; // 12 chars
    expect(truncateString(str, 12)).toBe('Exact length');
  });

  it('should truncate with a custom ellipsis', () => {
    const str = 'Another example string.';
    const options: TruncateStringOptions = { ellipsis: '..' };
    expect(truncateString(str, 7, options)).toBe('Anoth..');
  });

  it('should handle an empty ellipsis', () => {
    const str = 'Test string';
    const options: TruncateStringOptions = { ellipsis: '' };
    expect(truncateString(str, 5, options)).toBe('Test ');
  });

  it('should return an empty string for null input', () => {
    expect(truncateString(null, 10)).toBe('');
  });

  it('should return an empty string for undefined input', () => {
    expect(truncateString(undefined, 10)).toBe('');
  });

  it('should return an empty string for an empty string input', () => {
    expect(truncateString('', 10)).toBe('');
  });

  it('should return an empty string for maxLength of 0', () => {
    expect(truncateString('Test', 0)).toBe('');
  });

  it('should return an empty string for negative maxLength', () => {
    expect(truncateString('Test', -5)).toBe('');
  });

  it('should return only ellipsis if maxLength is less than ellipsis length', () => {
    expect(truncateString('Very long text', 3, { ellipsis: '...' })).toBe('...');
    expect(truncateString('Very long text', 2, { ellipsis: '...' })).toBe('..');
    expect(truncateString('Very long text', 1, { ellipsis: '...' })).toBe('.');
  });

  it('should return only ellipsis if maxLength is equal to ellipsis length', () => {
    expect(truncateString('Short', 3, { ellipsis: '...' })).toBe('...');
  });

  it('should handle maxLength just enough for one character plus ellipsis', () => {
    expect(truncateString('Hello world', 4, { ellipsis: '...' })).toBe('H...');
  });
});

describe('formatBoolean', () => {
  it('should return "Yes" for true', () => {
    expect(formatBoolean(true)).toBe('Yes');
  });

  it('should return "No" for false', () => {
    expect(formatBoolean(false)).toBe('No');
  });

  it('should return "Yes" for truthy number (1)', () => {
    expect(formatBoolean(1)).toBe('Yes');
  });

  it('should return "No" for falsy number (0)', () => {
    expect(formatBoolean(0)).toBe('No');
  });

  it('should return "Yes" for truthy string', () => {
    expect(formatBoolean('hello')).toBe('Yes');
  });

  it('should return "No" for falsy string (empty)', () => {
    expect(formatBoolean('')).toBe('No');
  });

  it('should return "No" for null', () => {
    expect(formatBoolean(null)).toBe('No');
  });

  it('should return "No" for undefined', () => {
    expect(formatBoolean(undefined)).toBe('No');
  });

  it('should return "No" for NaN', () => {
    expect(formatBoolean(NaN)).toBe('No');
  });

  it('should return "Yes" for an empty array (truthy in JS)', () => {
    expect(formatBoolean([])).toBe('Yes');
  });

  it('should return "Yes" for an empty object (truthy in JS)', () => {
    expect(formatBoolean({})).toBe('Yes');
  });

  it('should use custom trueText and falseText', () => {
    expect(formatBoolean(true, 'Active', 'Inactive')).toBe('Active');
    expect(formatBoolean(false, 'Active', 'Inactive')).toBe('Inactive');
  });

  it('should use custom trueText and falseText with truthy/falsy values', () => {
    expect(formatBoolean(1, 'Enabled', 'Disabled')).toBe('Enabled');
    expect(formatBoolean(0, 'Enabled', 'Disabled')).toBe('Disabled');
  });
});