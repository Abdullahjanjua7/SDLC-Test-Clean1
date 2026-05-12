/**
 * @file Utility functions for formatting raw API data for display.
 * @module dataFormatter
 */

/**
 * Options for formatting dates. Extends Intl.DateTimeFormatOptions.
 */
export type DateFormatOptions = Intl.DateTimeFormatOptions;

/**
 * Options for formatting currencies.
 */
export interface CurrencyFormatOptions {
  /** The currency code to use (e.g., 'USD', 'EUR'). Defaults to 'USD'. */
  currencyCode?: string;
  /** The locale to use for formatting (e.g., 'en-US', 'de-DE'). Defaults to user's locale. */
  locale?: string;
  /** The minimum number of fraction digits to use. */
  minimumFractionDigits?: number;
  /** The maximum number of fraction digits to use. */
  maximumFractionDigits?: number;
}

/**
 * Options for truncating strings.
 */
export interface TruncateStringOptions {
  /** The string to append if the text is truncated. Defaults to '...'. */
  ellipsis?: string;
}

/**
 * Formats a date into a human-readable string based on the specified locale and options.
 * Handles various date input types and invalid dates gracefully.
 *
 * @param dateInput The date to format. Can be a Date object, an ISO string, a timestamp (number), null, or undefined.
 * @param options Optional formatting options for Intl.DateTimeFormat.
 * @param locale Optional locale string (e.g., 'en-US', 'de-DE'). Defaults to user's locale.
 * @returns The formatted date string, or an empty string if the input is invalid or null/undefined.
 *
 * @example
 * // Basic usage
 * formatDate(new Date('2023-01-15T10:00:00Z'));
 * // Expected: "Jan 15, 2023" (depends on locale)
 *
 * formatDate('2023-01-15T10:00:00Z', { dateStyle: 'full', timeStyle: 'short' }, 'en-US');
 * // Expected: "Sunday, January 15, 2023 at 10:00 AM"
 *
 * formatDate(1673776800000, { year: 'numeric', month: 'long', day: 'numeric' });
 * // Expected: "January 15, 2023"
 *
 * @example
 * // Handling invalid input
 * formatDate(null);
 * // Expected: ""
 *
 * formatDate(undefined);
 * // Expected: ""
 *
 * formatDate('invalid-date-string');
 * // Expected: ""
 *
 * formatDate(new Date('invalid'));
 * // Expected: ""
 */
export function formatDate(
  dateInput: string | Date | number | null | undefined,
  options?: DateFormatOptions,
  locale?: string
): string {
  if (dateInput === null || dateInput === undefined) {
    return '';
  }

  const date = new Date(dateInput);

  if (isNaN(date.getTime())) {
    // Invalid date
    return '';
  }

  try {
    return new Intl.DateTimeFormat(locale || undefined, options).format(date);
  } catch (error) {
    console.error('dataFormatter: Error formatting date:', error);
    return ''; // Fallback for formatting errors
  }
}

/**
 * Formats a number as a currency string based on the specified locale and currency code.
 * Handles non-numeric, null, or undefined inputs gracefully.
 *
 * @param amount The number to format as currency. Can be a number, null, or undefined.
 * @param options Optional formatting options including currencyCode, locale, and fraction digits.
 * @returns The formatted currency string, or an empty string if the input is invalid or null/undefined.
 *
 * @example
 * // Basic usage
 * formatCurrency(1234.56);
 * // Expected: "$1,234.56" (defaults to USD, user's locale)
 *
 * formatCurrency(1234.56, { currencyCode: 'EUR', locale: 'de-DE' });
 * // Expected: "1.234,56 €"
 *
 * formatCurrency(99.99, { currencyCode: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
 * // Expected: "£100"
 *
 * @example
 * // Handling invalid input
 * formatCurrency(null);
 * // Expected: ""
 *
 * formatCurrency(undefined);
 * // Expected: ""
 *
 * formatCurrency(NaN);
 * // Expected: ""
 *
 * formatCurrency(Infinity);
 * // Expected: ""
 *
 * formatCurrency(-123.45, { currencyCode: 'JPY' });
 * // Expected: "-¥123"
 */
export function formatCurrency(
  amount: number | null | undefined,
  options?: CurrencyFormatOptions
): string {
  if (amount === null || amount === undefined || isNaN(amount) || !isFinite(amount)) {
    return '';
  }

  const { currencyCode = 'USD', locale, minimumFractionDigits, maximumFractionDigits } = options || {};

  try {
    return new Intl.NumberFormat(locale || undefined, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: minimumFractionDigits,
      maximumFractionDigits: maximumFractionDigits,
    }).format(amount);
  } catch (error) {
    console.error('dataFormatter: Error formatting currency:', error);
    return ''; // Fallback for formatting errors
  }
}

/**
 * Capitalizes the first letter of a string.
 * Handles null, undefined, or empty strings gracefully.
 *
 * @param str The string to capitalize.
 * @returns The capitalized string, or an empty string if the input is null, undefined, or empty.
 *
 * @example
 * capitalizeString('hello world');
 * // Expected: "Hello world"
 *
 * capitalizeString('typescript');
 * // Expected: "Typescript"
 *
 * capitalizeString('');
 * // Expected: ""
 *
 * capitalizeString(null);
 * // Expected: ""
 *
 * capitalizeString(undefined);
 * // Expected: ""
 *
 * capitalizeString('a');
 * // Expected: "A"
 */
export function capitalizeString(str: string | null | undefined): string {
  if (str === null || str === undefined || str.length === 0) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncates a string to a specified maximum length, appending an ellipsis if truncated.
 * Handles null, undefined, or empty strings, and invalid maxLength values gracefully.
 *
 * @param str The string to truncate.
 * @param maxLength The maximum length of the string before truncation. Must be a positive number.
 * @param options Optional options including the ellipsis string.
 * @returns The truncated string, or an empty string if the input string is null/undefined or maxLength is invalid.
 *
 * @example
 * // Basic usage
 * truncateString('This is a long string.', 10);
 * // Expected: "This is..."
 *
 * truncateString('Short string.', 20);
 * // Expected: "Short string."
 *
 * truncateString('Another example', 7, { ellipsis: '...' });
 * // Expected: "Anothe..."
 *
 * truncateString('Hello', 3, { ellipsis: '..' });
 * // Expected: "H.."
 *
 * @example
 * // Handling edge cases
 * truncateString(null, 10);
 * // Expected: ""
 *
 * truncateString(undefined, 10);
 * // Expected: ""
 *
 * truncateString('', 10);
 * // Expected: ""
 *
 * truncateString('Test', 0);
 * // Expected: ""
 *
 * truncateString('Test', -5);
 * // Expected: ""
 *
 * truncateString('Very long text', 3, { ellipsis: '...' });
 * // Expected: "..." (maxLength is too small to fit any characters plus ellipsis)
 *
 * truncateString('Test', 3, { ellipsis: '' });
 * // Expected: "Tes"
 */
export function truncateString(
  str: string | null | undefined,
  maxLength: number,
  options?: TruncateStringOptions
): string {
  if (str === null || str === undefined || str.length === 0) {
    return '';
  }

  const ellipsis = options?.ellipsis ?? '...';

  if (maxLength <= 0) {
    return '';
  }

  if (str.length <= maxLength) {
    return str;
  }

  const charsToKeep = maxLength - ellipsis.length;

  if (charsToKeep < 0) {
    // If maxLength is smaller than ellipsis length, return truncated ellipsis
    return ellipsis.slice(0, maxLength);
  }

  return str.slice(0, charsToKeep) + ellipsis;
}

/**
 * Formats a boolean-like value into a custom text string (e.g., 'Yes'/'No', 'Active'/'Inactive').
 *
 * @param value The value to evaluate as boolean. Can be any type.
 * @param trueText The string to return if the value is truthy. Defaults to 'Yes'.
 * @param falseText The string to return if the value is falsy. Defaults to 'No'.
 * @returns The `trueText` if the value is truthy, otherwise `falseText`.
 *
 * @example
 * formatBoolean(true);
 * // Expected: "Yes"
 *
 * formatBoolean(false);
 * // Expected: "No"
 *
 * formatBoolean(1);
 * // Expected: "Yes"
 *
 * formatBoolean(0);
 * // Expected: "No"
 *
 * formatBoolean('hello');
 * // Expected: "Yes"
 *
 * formatBoolean('');
 * // Expected: "No"
 *
 * formatBoolean(null);
 * // Expected: "No"
 *
 * formatBoolean(undefined);
 * // Expected: "No"
 *
 * formatBoolean(true, 'Active', 'Inactive');
 * // Expected: "Active"
 *
 * formatBoolean(false, 'Enabled', 'Disabled');
 * // Expected: "Disabled"
 */
export function formatBoolean(
  value: any,
  trueText: string = 'Yes',
  falseText: string = 'No'
): string {
  return !!value ? trueText : falseText;
}