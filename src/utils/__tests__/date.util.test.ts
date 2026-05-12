// date.util.test.ts

import { _toDate, formatDate } from './date.util'; // Assuming _toDate is exported for testing purposes.
                                                  // If not, it would need to be tested indirectly or temporarily exported.

// Set a fixed timezone for consistent test results, especially for Intl.DateTimeFormat
// This ensures that locale-dependent formats (like 'short', 'medium') produce predictable output.
process.env.TZ = 'UTC';

describe('date.util', () => {

    // A fixed date for consistent testing across different scenarios
    const TEST_DATE_UTC = new Date('2023-10-27T10:30:00.123Z'); // 10:30:00.123 AM UTC, Oct 27, 2023
    const TEST_TIMESTAMP = 1698393000123; // Corresponds to TEST_DATE_UTC
    const TEST_DATE_STRING_ISO = '2023-10-27T10:30:00.123Z';
    const TEST_DATE_STRING_COMMON = 'October 27, 2023 10:30:00 UTC'; // A string that new Date() can parse

    describe('_toDate', () => {
        it('should convert a valid Date object to a Date object', () => {
            const date = new Date();
            expect(_toDate(date)).toBeInstanceOf(Date);
            expect(_toDate(date)).toEqual(date);
        });

        it('should return null for an invalid Date object', () => {
            const invalidDate = new Date('invalid date string');
            expect(_toDate(invalidDate)).toBeNull();
        });

        it('should convert a valid ISO string to a Date object', () => {
            const date = _toDate(TEST_DATE_STRING_ISO);
            expect(date).toBeInstanceOf(Date);
            expect(date?.toISOString()).toBe(TEST_DATE_STRING_ISO);
        });

        it('should convert a valid common date string to a Date object', () => {
            const date = _toDate(TEST_DATE_STRING_COMMON);
            expect(date).toBeInstanceOf(Date);
            expect(date?.toISOString()).toBe(TEST_DATE_STRING_ISO); // Should parse to the same UTC date
        });

        it('should return null for an invalid date string', () => {
            expect(_toDate('not a date')).toBeNull();
            expect(_toDate('')).toBeNull();
        });

        it('should convert a valid number timestamp to a Date object', () => {
            const date = _toDate(TEST_TIMESTAMP);
            expect(date).toBeInstanceOf(Date);
            expect(date?.getTime()).toBe(TEST_TIMESTAMP);
        });

        it('should return null for an invalid number timestamp (NaN)', () => {
            expect(_toDate(NaN)).toBeNull();
        });

        it('should return null for other input types (null, undefined, object, boolean)', () => {
            expect(_toDate(null as any)).toBeNull();
            expect(_toDate(undefined as any)).toBeNull();
            expect(_toDate({} as any)).toBeNull();
            expect(_toDate(true as any)).toBeNull();
        });
    });

    describe('formatDate', () => {

        // Test with various valid date inputs
        it('should format a Date object correctly', () => {
            expect(formatDate(TEST_DATE_UTC, 'short', 'en-US')).toBe('10/27/23, 10:30 AM');
        });

        it('should format an ISO string correctly', () => {
            expect(formatDate(TEST_DATE_STRING_ISO, 'medium', 'en-US')).toBe('Oct 27, 2023, 10:30:00 AM');
        });

        it('should format a timestamp number correctly', () => {
            expect(formatDate(TEST_TIMESTAMP, 'long', 'en-US')).toBe('October 27, 2023 at 10:30:00 AM GMT');
        });

        // Test with invalid date inputs
        it('should return an empty string for an invalid Date object', () => {
            expect(formatDate(new Date('invalid'), 'short')).toBe('');
        });

        it('should return an empty string for an invalid date string', () => {
            expect(formatDate('not a date', 'short')).toBe('');
        });

        it('should return an empty string for an invalid timestamp (NaN)', () => {
            expect(formatDate(NaN, 'short')).toBe('');
        });

        it('should return an empty string for null or undefined date input', () => {
            expect(formatDate(null as any, 'short')).toBe('');
            expect(formatDate(undefined as any, 'short')).toBe('');
        });

        // Test with different presets (en-US locale, UTC timezone due to process.env.TZ)
        describe('with string presets (en-US, UTC)', () => {
            it('should format with "short" preset', () => {
                expect(formatDate(TEST_DATE_UTC, 'short', 'en-US')).toBe('10/27/23, 10:30 AM');
            });

            it('should format with "medium" preset', () => {
                expect(formatDate(TEST_DATE_UTC, 'medium', 'en-US')).toBe('Oct 27, 2023, 10:30:00 AM');
            });

            it('should format with "long" preset', () => {
                expect(formatDate(TEST_DATE_UTC, 'long', 'en-US')).toBe('October 27, 2023 at 10:30:00 AM GMT');
            });

            it('should format with "full" preset', () => {
                expect(formatDate(TEST_DATE_UTC, 'full', 'en-US')).toBe('Friday, October 27, 2023 at 10:30:00 AM Coordinated Universal Time');
            });

            it('should format with "dateOnly" preset', () => {
                expect(formatDate(TEST_DATE_UTC, 'dateOnly', 'en-US')).toBe('10/27/2023');
            });

            it('should format with "timeOnly" preset', () => {
                expect(formatDate(TEST_DATE_UTC, 'timeOnly', 'en-US')).toBe('10:30:00 AM');
            });

            it('should format with "isoDate" preset (UTC date part)', () => {
                expect(formatDate(TEST_DATE_UTC, 'isoDate')).toBe('2023-10-27');
            });

            it('should format with "isoDateTime" preset (UTC full ISO string)', () => {
                expect(formatDate(TEST_DATE_UTC, 'isoDateTime')).toBe('2023-10-27T10:30:00.123Z');
            });
        });

        // Test with different locales
        describe('with different locales', () => {
            it('should format correctly for de-DE locale (dateOnly)', () => {
                expect(formatDate(TEST_DATE_UTC, 'dateOnly', 'de-DE')).toBe('27.10.2023');
            });

            it('should format correctly for fr-FR locale (short)', () => {
                expect(formatDate(TEST_DATE_UTC, 'short', 'fr-FR')).toBe('27/10/2023 10:30');
            });

            it('should use default locale (en-US) if locale is not provided', () => {
                expect(formatDate(TEST_DATE_UTC, 'dateOnly')).toBe('10/27/2023');
            });

            it('should use default locale (en-US) if locale is an empty string', () => {
                expect(formatDate(TEST_DATE_UTC, 'dateOnly', '')).toBe('10/27/2023');
            });

            it('should handle invalid locale gracefully (fall back to default or system locale)', () => {
                // Intl.DateTimeFormat typically falls back to a default if locale is invalid
                // With process.env.TZ='UTC', 'xx-YY' might behave like 'en-US' or system default.
                // We expect it to still produce a valid date string, not an error.
                const result = formatDate(TEST_DATE_UTC, 'dateOnly', 'xx-YY');
                expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/); // Check for common date format pattern
                expect(result).toBe('10/27/2023'); // Assuming it falls back to en-US
            });
        });

        // Test with Intl.DateTimeFormatOptions object
        describe('with Intl.DateTimeFormatOptions object', () => {
            it('should format with custom options (year, month, day)', () => {
                const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
                expect(formatDate(TEST_DATE_UTC, options, 'en-US')).toBe('October 27, 2023');
            });

            it('should format with custom options including time and timezone', () => {
                const options: Intl.DateTimeFormatOptions = {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZoneName: 'short',
                    timeZone: 'UTC' // Explicitly set timezone for consistency
                };
                expect(formatDate(TEST_DATE_UTC, options, 'en-US')).toBe('Friday, October 27, 2023 at 10:30:00 AM UTC');
            });

            it('should format with custom options and a different locale', () => {
                const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
                expect(formatDate(TEST_DATE_UTC, options, 'de-DE')).toBe('27. Oktober 2023');
            });

            it('should handle options that result in an invalid format (e.g., conflicting options)', () => {
                // Intl.DateTimeFormat is robust, but if options are truly invalid, it might throw or produce unexpected results.
                // Our function should still return a string, or an empty string if it fails internally.
                const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', hourCycle: 'h11' };
                const result = formatDate(TEST_DATE_UTC, options, 'en-US');
                expect(result).toBe('October 27, 2023, 10 AM'); // Example output, depends on Intl.DateTimeFormat behavior
            });
        });

        // Edge cases
        it('should handle dates at the beginning of the year', () => {
            const date = new Date('2024-01-01T00:00:00Z');
            expect(formatDate(date, 'dateOnly', 'en-US')).toBe('01/01/2024');
        });

        it('should handle dates at the end of the year', () => {
            const date = new Date('2023-12-31T23:59:59Z');
            expect(formatDate(date, 'dateOnly', 'en-US')).toBe('12/31/2023');
        });

        it('should handle dates with zero milliseconds', () => {
            const date = new Date('2023-10-27T10:30:00.000Z');
            expect(formatDate(date, 'isoDateTime')).toBe('2023-10-27T10:30:00.000Z');
        });

        it('should handle dates with non-zero milliseconds', () => {
            const date = new Date('2023-10-27T10:30:00.999Z');
            expect(formatDate(date, 'isoDateTime')).toBe('2023-10-27T10:30:00.999Z');
        });

        it('should return empty string if options is an invalid type', () => {
            // TypeScript would typically prevent this, but for runtime robustness
            expect(formatDate(TEST_DATE_UTC, 123 as any)).toBe('');
            expect(formatDate(TEST_DATE_UTC, true as any)).toBe('');
            expect(formatDate(TEST_DATE_UTC, null as any)).toBe('');
            expect(formatDate(TEST_DATE_UTC, undefined as any)).toBe('');
        });

        it('should return empty string if options preset is unknown', () => {
            expect(formatDate(TEST_DATE_UTC, 'unknownPreset' as any)).toBe('');
        });
    });
});