// exportUtils.test.ts

import { exportToPdf, PdfExportOptions } from './exportUtils';

// --- Mocking jsPDF and jspdf-autotable ---
// jspdf-autotable extends jsPDF, so we mock the jsPDF instance to include the autoTable method.
const mockAutoTable = jest.fn();
const mockSetFontSize = jest.fn();
const mockText = jest.fn();
const mockSave = jest.fn();
// Mock internal.pageSize.getWidth() for title centering
const mockGetPageWidth = jest.fn(() => 595.28); // Standard A4 width in pt (portrait)

// Mock the jsPDF class constructor
const mockJsPDF = jest.fn().mockImplementation((orientation, unit, format) => {
    return {
        orientation,
        unit,
        format,
        setFontSize: mockSetFontSize,
        text: mockText,
        save: mockSave,
        autoTable: mockAutoTable, // This is where jspdf-autotable extends jsPDF
        internal: {
            pageSize: {
                getWidth: mockGetPageWidth,
            },
        },
    };
});

// Mock the jspdf module
jest.mock('jspdf', () => {
    return {
        __esModule: true,
        default: mockJsPDF,
    };
});

// Note: 'jspdf-autotable' is a side-effect import that extends `jsPDF.prototype`.
// By mocking `jsPDF` itself and ensuring our mock instance has `autoTable`,
// we effectively cover the integration with `jspdf-autotable`.

describe('exportToPdf', () => {
    // Clear all mocks before each test to ensure isolation
    beforeEach(() => {
        mockJsPDF.mockClear();
        mockAutoTable.mockClear();
        mockSetFontSize.mockClear();
        mockText.mockClear();
        mockSave.mockClear();
        mockGetPageWidth.mockClear();
    });

    // Test 1: Basic functionality - Exporting data from an array of objects
    test('should export data from an array of objects to PDF correctly', () => {
        const headers = ['ID', 'Name', 'Email'];
        const data = [
            { ID: 1, Name: 'Alice', Email: 'alice@example.com' },
            { ID: 2, Name: 'Bob', Email: 'bob@example.com' },
        ];
        const filename = 'users_report.pdf';

        exportToPdf(headers, data, filename);

        // Verify jsPDF constructor was called with default options
        expect(mockJsPDF).toHaveBeenCalledTimes(1);
        expect(mockJsPDF).toHaveBeenCalledWith('portrait', 'pt', 'a4');

        // Verify font size was set (default 10)
        expect(mockSetFontSize).toHaveBeenCalledWith(10);

        // Verify autoTable was called with correct headers and mapped data
        expect(mockAutoTable).toHaveBeenCalledTimes(1);
        expect(mockAutoTable).toHaveBeenCalledWith(
            expect.objectContaining({
                head: [headers],
                body: [[1, 'Alice', 'alice@example.com'], [2, 'Bob', 'bob@example.com']],
                startY: 10, // Default top margin
                margin: { top: 10, bottom: 10, left: 10, right: 10 }, // Default margins
            })
        );

        // Verify save was called with the correct filename
        expect(mockSave).toHaveBeenCalledTimes(1);
        expect(mockSave).toHaveBeenCalledWith(filename);
    });

    // Test 2: Basic functionality - Exporting data from an array of arrays
    test('should export data from an array of arrays to PDF correctly', () => {
        const headers = ['Product', 'Quantity', 'Price'];
        const data = [
            ['Laptop', 5, 1200],
            ['Mouse', 20, 25],
        ];
        const filename = 'products_summary.pdf';

        exportToPdf(headers, data, filename);

        // Verify jsPDF constructor and font size
        expect(mockJsPDF).toHaveBeenCalledTimes(1);
        expect(mockJsPDF).toHaveBeenCalledWith('portrait', 'pt', 'a4');
        expect(mockSetFontSize).toHaveBeenCalledWith(10);

        // Verify autoTable was called with correct headers and data (passed directly)
        expect(mockAutoTable).toHaveBeenCalledTimes(1);
        expect(mockAutoTable).toHaveBeenCalledWith(
            expect.objectContaining({
                head: [headers],
                body: data, // Array of arrays should be passed as is
                startY: 10,
                margin: { top: 10, bottom: 10, left: 10, right: 10 },
            })
        );

        // Verify save was called
        expect(mockSave).toHaveBeenCalledTimes(1);
        expect(mockSave).toHaveBeenCalledWith(filename);
    });

    // Test 3: Options handling - Title
    test('should include a title at the top center if provided in options', () => {
        const headers = ['Col1'];
        const data = [['Val1']];
        const filename = 'titled_report.pdf';
        const options: PdfExportOptions = { title: 'My Awesome Report' };

        exportToPdf(headers, data, filename, options);

        // Verify text method was called for the title
        expect(mockText).toHaveBeenCalledTimes(1);
        expect(mockText).toHaveBeenCalledWith(
            options.title,
            mockGetPageWidth() / 2, // Centered horizontally
            10, // Default top margin
            { align: 'center' }
        );

        // Verify font size was adjusted for title and then reset
        expect(mockSetFontSize).toHaveBeenCalledWith(14); // Default 10 + 4
        expect(mockSetFontSize).toHaveBeenCalledWith(10); // Reset to default

        // Verify autoTable startY is adjusted after the title
        expect(mockAutoTable).toHaveBeenCalledWith(
            expect.objectContaining({
                startY: 25, // 10 (initial Y) + 15 (after title)
            })
        );
    });

    // Test 4: Options handling - All custom options (orientation, unit, fontSize, margins, autoTableOptions)
    test('should apply all provided custom options correctly', () => {
        const headers = ['A', 'B'];
        const data = [['1', '2']];
        const filename = 'custom_settings.pdf';
        const options: PdfExportOptions = {
            orientation: 'landscape',
            unit: 'mm',
            fontSize: 12,
            margins: { top: 25, left: 20, right: 20, bottom: 15 },
            autoTableOptions: {
                styles: { fillColor: [200, 255, 200], fontStyle: 'bold' },
                headStyles: { fillColor: [50, 100, 50], textColor: [255, 255, 255] },
                columnStyles: { 0: { cellWidth: 50 } },
            },
        };

        exportToPdf(headers, data, filename, options);

        // Verify jsPDF constructor with custom orientation and unit
        expect(mockJsPDF).toHaveBeenCalledWith(options.orientation, options.unit, 'a4');

        // Verify font size with custom value
        expect(mockSetFontSize).toHaveBeenCalledWith(options.fontSize);

        // Verify autoTable with custom margins and autoTableOptions
        expect(mockAutoTable).toHaveBeenCalledWith(
            expect.objectContaining({
                head: [headers],
                body: data,
                startY: options.margins?.top,
                margin: options.margins,
                ...options.autoTableOptions, // Spread custom autoTableOptions
            })
        );
        expect(mockSave).toHaveBeenCalledWith(filename);
    });

    // Test 5: Edge case - Empty data array
    test('should export an empty table if the data array is empty', () => {
        const headers = ['Col1', 'Col2'];
        const data: any[] = [];
        const filename = 'empty_data.pdf';

        exportToPdf(headers, data, filename);

        expect(mockJsPDF).toHaveBeenCalledTimes(1);
        expect(mockAutoTable).toHaveBeenCalledTimes(1);
        expect(mockAutoTable).toHaveBeenCalledWith(
            expect.objectContaining({
                head: [headers],
                body: [], // Body should be empty
            })
        );
        expect(mockSave).toHaveBeenCalledWith(filename);
    });

    // Test 6: Edge case - Data with missing keys (for array of objects)
    test('should handle missing keys in data objects gracefully by using empty strings', () => {
        const headers = ['ID', 'Name', 'Email'];
        const data = [
            { ID: 1, Name: 'Alice' }, // Missing Email
            { ID: 2, Email: 'bob@example.com' }, // Missing Name
            { ID: 3, Name: 'Charlie', Email: 'charlie@example.com' }, // Complete
        ];
        const filename = 'partial_object_data.pdf';

        exportToPdf(headers, data, filename);

        expect(mockAutoTable).toHaveBeenCalledWith(
            expect.objectContaining({
                body: [
                    [1, 'Alice', ''],
                    [2, '', 'bob@example.com'],
                    [3, 'Charlie', 'charlie@example.com'],
                ],
            })
        );
    });

    // Test 7: Filename without .pdf extension - should add it
    test('should add ".pdf" extension to the filename if it is missing', () => {
        const headers = ['A'];
        const data = [['1']];
        const filenameWithoutExt = 'report_no_ext';

        exportToPdf(headers, data, filenameWithoutExt);

        expect(mockSave).toHaveBeenCalledWith('report_no_ext.pdf');
    });

    // Test 8: Filename with .pdf extension - should not modify it
    test('should not modify the filename if it already has a ".pdf" extension', () => {
        const headers = ['A'];
        const data = [['1']];
        const filenameWithExt = 'report.pdf';

        exportToPdf(headers, data, filenameWithExt);

        expect(mockSave).toHaveBeenCalledWith('report.pdf');
    });

    // Test 9: Error handling - Invalid headers (not an array)
    test('should throw an error if headers is not an array', () => {
        const headers: any = 'not an array';
        const data = [['1']];
        const filename = 'error.pdf';

        expect(() => exportToPdf(headers, data, filename)).toThrow(
            'PDF Export Error: Headers must be a non-empty array of strings.'
        );
    });

    // Test 10: Error handling - Empty headers array
    test('should throw an error if headers is an empty array', () => {
        const headers: string[] = [];
        const data = [['1']];
        const filename = 'error.pdf';

        expect(() => exportToPdf(headers, data, filename)).toThrow(
            'PDF Export Error: Headers must be a non-empty array of strings.'
        );
    });

    // Test 11: Error handling - Invalid data (not an array)
    test('should throw an error if data is not an array', () => {
        const headers = ['Col1'];
        const data: any = 'not an array';
        const filename = 'error.pdf';

        expect(() => exportToPdf(headers, data, filename)).toThrow(
            'PDF Export Error: Data must be an array.'
        );
    });

    // Test 12: Error handling - Invalid filename (not a string)
    test('should throw an error if filename is not a string', () => {
        const headers = ['Col1'];
        const data = [['1']];
        const filename: any = 123;

        expect(() => exportToPdf(headers, data, filename)).toThrow(
            'PDF Export Error: Filename must be a non-empty string.'
        );
    });

    // Test 13: Error handling - Empty filename string
    test('should throw an error if filename is an empty string', () => {
        const headers = ['Col1'];
        const data = [['1']];
        const filename = '';

        expect(() => exportToPdf(headers, data, filename)).toThrow(
            'PDF Export Error: Filename must be a non-empty string.'
        );
    });

    // Test 14: Default margins should be merged with partially provided margins
    test('should merge default margins with partially provided custom margins', () => {
        const headers = ['A'];
        const data = [['1']];
        const filename = 'partial_margins.pdf';
        const options: PdfExportOptions = {
            margins: { top: 25, left: 5 }, // Only top and left provided
        };

        exportToPdf(headers, data, filename, options);

        expect(mockAutoTable).toHaveBeenCalledWith(
            expect.objectContaining({
                startY: 25, // Uses provided top margin
                margin: { top: 25, bottom: 10, left: 5, right: 10 }, // Merged with defaults