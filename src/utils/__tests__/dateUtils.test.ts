// dateUtils.test.ts

// Assuming the utility functions are in a file named 'dateUtils.ts'
// We import the exported functions. The internal `_parseDateInput` function
// is tested indirectly through `formatDate`'s error handling.
import { isValidDate, formatDate } from './dateUtils';

// NOTE: The provided `formatDate` utility code snippet was incomplete.
// It was missing the loop to actually replace the tokens in the `format` string.
// For these tests to pass, the `formatDate` function should be completed as follows:
/*
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
    const sortedKeys = Object.keys(replacements).sort((a, b) => b.length - a.length);

    for (const key of sortedKeys) {
        result = result.replace(new RegExp(key, 'g'), String(replacements[key]));
    }
    return result;
}
*/

describe('isValidDate', () => {
    // Test case 1: Valid Date object
    it('should return true for a valid Date object', () => {
        const date = new Date();
        expect(isValidDate(date)).toBe(true);
    });

    // Test case 2: Valid Date object created from a valid date string
    it('should return true for a Date object created from a valid date string', () => {
        const date = new Date('2023-01-01T12:00:00Z');
        expect(isValidDate(date)).toBe(true);
    });

    // Test case 3: Invalid Date object (e.g., from an unparseable string)
    it('should return false for an invalid Date object', () => {
        const invalidDate = new Date('not a date');
        expect(isValidDate(invalidDate)).toBe(false);
    });

    // Test case 4: Null input
    it('should return false for null', () => {
        expect(isValidDate(null)).toBe(false);
    });

    // Test case 5: Undefined input
    it('should return false for undefined', () => {
        expect(isValidDate(undefined)).toBe(false);
    });

    // Test case 6: String input (not a Date object instance)
    it('should return false for a date string', () => {
        expect(isValidDate('2023-01-01')).toBe(false);
    });

    // Test case 7: Number input (not a Date object instance)
    it('should return false for a timestamp number', () => {
        expect(isValidDate(1672531200000)).toBe(false); // Jan 1, 2023 00:00:00 UTC
    });

    // Test case 8: Empty string
    it('should return false for an empty string', () => {
        expect(isValidDate('')).toBe(false);
    });

    // Test case 9: Arbitrary object
    it('should return false for an arbitrary object', () => {
        expect(isValidDate({})).toBe(false);
    });

    // Test case 10: Array
    it('should return false for an array', () => {
        expect(isValidDate([])).toBe(false);
    });

    // Test case 11: Boolean
    it('should return false for a boolean', () => {
        expect(isValidDate(true)).toBe(false);
    });

    // Test case 12: Zero
    it('should return false for 0', () => {
        expect(isValidDate(0)).toBe(false);
    });
});

describe('formatDate', () => {
    // Reference date: Jan 15, 2023, 2:35:08 PM, 123 milliseconds (local time)
    // Month is 0-indexed in Date constructor (Jan = 0)
    const referenceDate = new Date(2023, 0, 15, 14, 35, 8, 123);
    const referenceTimestamp = referenceDate.getTime();

    // Helper to create an ISO-like string that `new Date()` will parse in local time