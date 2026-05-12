// date.util.ts

/**
 * Internal helper to convert various date inputs into a Date object.
 * This function ensures consistency and handles invalid date inputs gracefully.
 *
 * @param input The date input (Date object, string, or number timestamp).
 * @returns A valid Date object if the input can be parsed, otherwise null.
 */
function _toDate(input: Date | string | number): Date | null {
    if (input instanceof Date) {
        return isNaN(input.getTime()) ? null : input;
    }
    if (typeof input === 'string' || typeof input === 'number') {
        const date = new Date(input);
        return isNaN(date.getTime()) ? null : date;
    }
    return null;
}

/**
 * Formats a date into a string based on specified options and locale.
 * This utility leverages `Intl.DateTimeFormat` for robust and localized formatting.
 *
 * @param dateInput The date to format (Date object, string, or number timestamp).
 * @param options Formatting options. Can be `Intl.DateTimeFormatOptions` or a string preset:
 *   - 'short': e.g., "10/27/23, 10:00 AM"
 *   - 'medium': e.g., "Oct 27, 2023, 10:00:00 AM"
 *   - 'long': e.g., "October 27, 2023 at 10:00:00 AM GMT+00:00"
 *   - 'full': e.g., "Friday, October 27, 2023 at 10:00:00 AM Coordinated Universal Time"
 *   - 'dateOnly': e.g., "10/27/2023"
 *   - 'timeOnly': e.g., "10:00:00 AM"
 *   - 'isoDate': e.g., "2023-10-27" (UTC date part)
 *   - 'isoDateTime': e.g., "2023-10-27T10:00:00.000Z" (UTC full ISO string)
 * @param locale The locale string (e.g., 'en-US', 'de-DE', 'fr-FR'). Defaults to 'en-US'.
 * @returns The formatted date string, or an empty string if the input date is invalid.
 *
 * @example
 * // Basic usage with options object
 * formatDate(new Date('2023-10-27T10:00:00Z'), { year: 'numeric', month: 'long', day: 'numeric' });
 * // Expected output (en-US): "October 27, 2023"
 *
 * @example
 * // Using string presets
 * formatDate('2023-10-27T10:00:00Z', 'short');
 * // Expected output (en-US): "10/27/23, 10:00 AM"
 *
 * formatDate(1678886400000, 'dateOnly', 'de-DE'); // Timestamp for 2023-03-15T00:00:00Z
 * // Expected output (de-DE): "15.3.2023"
 *
 * @example
 * // ISO formats
 * formatDate(new Date('2023-10-27T10:30:00.123Z'), 'isoDate');
 * // Expected output: "2023-10-27"
 *
 * formatDate(new Date('2023-10-27T10:30:00.