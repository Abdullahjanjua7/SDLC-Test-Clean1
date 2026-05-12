// exportUtils.ts

// --- PDF Export Dependencies ---
// Make sure to install:
// npm install jspdf jspdf-autotable
// or
// yarn add jspdf jspdf-autotable
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // This extends jsPDF with the autoTable method

// --- Excel Export Dependencies ---
// Make sure to install:
// npm install xlsx
// or
// yarn add xlsx
import * as XLSX from 'xlsx';

/**
 * @typedef {object} PdfExportOptions
 * @property {string} [title] - Optional title for the PDF document, displayed at the top center.
 * @property {'portrait' | 'landscape'} [orientation='portrait'] - Page orientation.
 * @property {'pt' | 'mm' | 'cm' | 'in'} [unit='pt'] - Unit for measurements.
 * @property {number} [fontSize=10] - Default font size for the document content.
 * @property {object} [margins] - Page margins for the table content.
 * @property {number} [margins.top=10] - Top margin.
 * @property {number} [margins.bottom=10] - Bottom margin.
 * @property {number} [margins.left=10] - Left margin.
 * @property {number} [margins.right=10] - Right margin.
 * @property {object} [autoTableOptions] - Additional options to pass directly to jspdf-autotable.
 *                                         See https://jspdf.github.io/jspdf-autotable/docs/options/
 */
export interface PdfExportOptions {
    title?: string;
    orientation?: 'portrait' | 'landscape';
    unit?: 'pt' | 'mm' | 'cm' | 'in';
    fontSize?: number;
    margins?: { top?: number; bottom?: number; left?: number; right?: number; };
    autoTableOptions?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * Exports tabular data to a PDF document using jspdf and jspdf-autotable.
 *
 * This function takes an array of headers and data, then generates a PDF file
 * with a table. It supports both array of objects and array of arrays for data.
 *
 * @param {string[]} headers - An array of strings representing the table headers.
 * @param {Array<Record<string, any>> | Array<any[]>} data - The data to export. Can be an array of objects (where keys match headers) or an array of arrays.
 * @param {string} filename - The desired filename for the exported PDF (e.g., "report.pdf"). The `.pdf` extension will be added if missing.
 * @param {PdfExportOptions} [options] - Optional configuration for PDF generation.
 *
 * @throws {Error} If `headers` is not an array or is empty.
 * @throws {Error} If `data` is not an array.
 * @throws {Error} If `filename` is not a string or is empty.
 * @throws {Error} If `jspdf` or `jspdf-autotable` are not properly installed or accessible.
 *
 * @example
 * // Example 1: Exporting an array of objects
 * const pdfHeaders = ['ID', 'Name', 'Email'];
 * const pdfData = [
 *   { ID: 1, Name: 'Alice', Email: 'alice@example.com' },
 *   { ID: 2, Name: 'Bob', Email: 'bob@example.com' },
 *   { ID: 3, Name: 'Charlie', Email: 'charlie@example.com' },
 * ];
 * exportToPdf(pdfHeaders, pdfData, 'users_report.pdf', {
 *   title: 'User List Report',
 *   orientation: 'landscape',
 *   margins: { top: 20, left: 15, right: 15 },
 *   autoTableOptions: {
 *     styles: { fillColor: [200, 255, 200] },
 *     headStyles: { fillColor: [50, 100, 50] },
 *   }
 * });
 *
 * @example
 * // Example 2: Exporting an array of arrays
 * const pdfHeadersArray = ['Product', 'Quantity', 'Price (USD)'];
 * const pdfDataArray = [
 *   ['Laptop', 5, 1200],
 *   ['Mouse', 20, 25],
 *   ['Keyboard', 10, 75],
 *   ['Monitor', 8, 300],
 * ];
 * exportToPdf(pdfHeadersArray, pdfDataArray, 'products_summary.pdf', {
 *   title: 'Product Inventory Summary',
 *   fontSize: 12
 * });
 *
 * @example
 * // Example 3: Handling empty data
 * exportToPdf(['Col1', 'Col2'], [], 'empty_data.pdf', { title: 'Empty Report' });
 */
export function exportToPdf(
    headers: string[],
    data: Array<Record<string, any>> | Array<any[]>, // eslint-disable-line @typescript-eslint/no-explicit-any
    filename: string,
    options?: PdfExportOptions
): void {
    if (!Array.isArray(headers) || headers.length === 0) {
        throw new Error('PDF Export Error: Headers must be a non-empty array of strings.');
    }
    if (!Array.isArray(data)) {
        throw new Error('PDF Export Error: Data must be an array.');
    }
    if (typeof filename !== 'string' || filename.trim() === '') {
        throw new Error('PDF Export Error: Filename must be a non-empty string.');
    }

    try {
        const defaultOptions: PdfExportOptions = {
            orientation: 'portrait',
            unit: 'pt',
            fontSize: 10,
            margins: { top: 10, bottom: 10, left: 10, right: 10 }, // Default margins for the table content
            autoTableOptions: {}
        };
        const mergedOptions = { ...defaultOptions, ...options };
        mergedOptions.margins = { ...defaultOptions.margins, ...options?.margins };

        const doc = new jsPDF(mergedOptions.orientation, mergedOptions.unit, 'a4');
        doc.setFontSize(mergedOptions.fontSize || 10);

        // Map data to an array of arrays if it's an array of objects
        const finalData = data.map(row => {
            if (Array.isArray(row)) {
                return row;
            }
            // If data is an array of objects, map it to an array of values based on headers
            return headers.map(header => (row as Record<string, any>)[header] ?? ''); // eslint-disable-line @typescript-eslint/no-explicit-any
        });

        let startY = mergedOptions.margins?.top || 10; // Initial Y position for content, respecting top margin

        if (mergedOptions.title) {
            doc.setFontSize((mergedOptions.fontSize || 10) + 4); // Larger font for title
            doc.text(mergedOptions.title, doc.internal.pageSize.getWidth() / 2, startY, { align: 'center' });
            doc.setFontSize(mergedOptions.fontSize || 10); // Reset font size
            startY += 15; // Move Y down after title for table
        }

        // Ensure startY is at least the default top margin if no