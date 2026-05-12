/**
 * @fileoverview Utility functions for date formatting and manipulation.
 */

/**
 * Internal helper to parse various date inputs into a valid Date object.
 * Throws an error if the input cannot be parsed into a valid Date.
 * @param {Date | string | number} dateInput - The date input (Date object, ISO string, timestamp).
 * @returns {Date} A valid Date object.
 * @throws {Error} If the dateInput is invalid.
 */
function _parseDateInput(dateInput: Date | string | number): Date {
    let date: Date;

    if (dateInput instanceof Date) {
        date = dateInput;
    } else if (typeof dateInput === 'string' || typeof dateInput === 'number') {
        date = new Date(dateInput);
    } else {
        throw new Error('Invalid date input type. Expected Date, string, or number.');
    }

    if (!isValidDate(date)) {
        throw new Error(`Invalid date: "${dateInput}" could not be parsed into a valid Date.`);
    }

    return date;
}

/**
 * Checks if a given value is a valid Date object.
 * @param {any} value - The value to check.
 * @returns {boolean} True if the value is a valid Date object, false otherwise.
 *
 * @example
 * // Unit Test Examples:
 * console.assert(isValidDate(new Date()) === true, 'isValidDate: current date');
 * console.assert(isValidDate(new Date('invalid date string')) === false, 'isValidDate: invalid string');
 * console.assert(isValidDate(null) === false, 'isValidDate: null');
 * console.assert(isValidDate('2023-01-01') === false, 'isValidDate: string (not Date object)');
 */
export function isValidDate(value: any): boolean {
    return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Formats a date into a specified string format.
 *
 * @param {Date | string | number} dateInput - The date to format. Can be a Date object, ISO string, or timestamp.
 * @param {string} [format='YYYY-MM-DD'] - The format string.
 *   Supported tokens:
 *   - `YYYY`: Full year (e.g., 2023)
 *   - `YY`: Short year (e.g., 23)
 *   - `MM`: Month with leading zero (01-12)
 *   - `M`: Month without leading zero (1-12)
 *   - `DD`: Day of month with leading zero (01-31)
 *   - `D`: Day of month without leading zero (1-31)
 *   - `HH`: Hours (24-hour, 00-23)
 *   - `H`: Hours (24-hour, 0-23)
 *   - `hh`: Hours (12-hour, 01-12)
 *   - `h`: Hours (12-hour, 1-12)
 *   - `mm`: Minutes (00-59)
 *   - `m`: Minutes (0-59)
 *   - `ss`: Seconds (00-59)
 *   - `s`: Seconds (0-59)
 *   - `SSS`: Milliseconds (000-999)
 *   - `A`: AM/PM (uppercase)
 *   - `a`: am/pm (lowercase)
 * @returns {string} The formatted date string.
 * @throws {Error} If the dateInput is invalid.
 *
 * @example
 * // Unit Test Examples:
 * const date = new Date(2023, 0, 15, 14, 35, 8, 123); // Jan 15, 2023 14:35:08.123
 * console.assert(formatDate(date, 'YYYY-MM-DD HH:mm:ss.SSS') === '2023-01-15 14:35:08.123', 'formatDate: full datetime');
 * console.assert(formatDate(date, 'MM/DD/YYYY') === '01/15/2023', 'formatDate: MM/DD/YYYY');
 * console.assert(formatDate(date, 'D M YYYY') === '15 1 2023', 'formatDate: D M YYYY');
 * console.assert(formatDate(date, 'hh:mm:ss A') === '02:35:08 PM', 'formatDate: 12-hour with AM/PM');
 * console.assert(formatDate(date, 'h:m:s a') === '2:35:8 pm', 'formatDate: 12-hour unpadded with am/pm');
 * console.assert(formatDate('2024-02-29T10:00:00Z', 'YYYY-MM-DD') === '2024-02-29', 'formatDate: ISO string input');
 * console.assert(formatDate(1673793308123, 'DD/MM/YY H:m:s') === '15/01/23 14:35:8', 'formatDate: timestamp input');
 * try {
 *     formatDate('invalid date');
 *     console.assert(false, 'formatDate: invalid date should throw error');
 * } catch (e) {
 *     console.assert(e instanceof Error, 'formatDate: invalid date throws Error');
 * }
 */
export function formatDate(dateInput: Date | string | number, format: string = 'YYYY-MM-DD'): string {
    const date = _parseDateInput(dateInput);

    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const milliseconds = date.getMilliseconds();

    const pad = (num: number, length: number = 2): string => num.toString().padStart(length, '0');

    const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12-hour clock

    const replacements: { [key: string]: string | number } = {
        'YYYY': year,
        'YY': String(year).slice(-2),
        'MM': pad(month),
        'M': month,
        'DD': pad(day),
        'D': day,
        'HH': pad(hours), // 24-hour padded
        'H': hours, // 24-hour unpadded
        'hh': pad(hours12), // 12-hour padded
        'h': hours12, // 12-hour unpadded
        'mm': pad(minutes),
        'm': minutes,
        'ss': pad(seconds),
        's': seconds,
        'SSS': pad(milliseconds, 3),
        'A': hours >= 12 ? 'PM' : 'AM',
        'a': hours >= 12 ? 'pm' : 'am',
    };

    let result = format;
    // Sort keys by length descending to ensure 'YYYY' is replaced before 'YY', 'HH' before 'H', etc.
    const sortedKeys =