import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // This import extends the jsPDF prototype with autoTable
import * as XLSX from 'xlsx';

/**
 * Interface for defining a column in an export.
 * @template T The type of the data object from which the column data is extracted.
 */
export interface ExportColumn<T> {
    /** The header text to display for the column. */
    header: string;
    /** The key in the data object (T) to extract the value for this column. */
    dataKey: keyof T;
    /** Optional: A function to format the cell value before display. */
    formatter?: (value: T[keyof T], row: T) => string | number;
    /** Optional: Column width for PDF exports (e.g., 'auto', 'wrap', or a number). */
    width?: 'auto' | 'wrap' | number;
}

/**
 * Options for PDF export.
 * @template T The type of the data objects being exported.
 */
export interface PdfExportOptions<T> {
    /** The desired filename for the exported PDF (e.g., "report.pdf"). */
    filename: string;
    /** An array of data objects to be exported. */
    data: T[];
    /** An array of column definitions specifying headers and data keys. */
    columns: ExportColumn<T>[];
    /** Optional: A title to display at the top of the PDF. */
    title?: string;
    /** Optional: Page orientation ('portrait' or 'landscape'). Defaults to 'portrait'. */
    orientation?: 'portrait' | 'landscape';
    /** Optional: Unit for measurements ('pt', 'mm', 'cm', 'in'). Defaults to 'mm'. */
    unit?: 'pt' | 'mm' | 'cm' | 'in';
    /** Optional: Page format ('a3', 'a4', 'a5', 'letter', 'legal' or [width, height]). Defaults to 'a4'. */
    format?: 'a3' | 'a4' | 'a5' | 'letter' | 'legal' | [number, number];
    /** Optional: Additional options for jspdf-autotable. */
    autoTableOptions?: any;
}

/**
 * Options for Excel export.
 * @template T The type of the data objects being exported.
 */
export interface ExcelExportOptions<T> {
    /** The desired filename for the exported Excel file (e.g., "report.xlsx"). */
    filename: string;
    /** An array of data objects to be exported. */
    data: T[];
    /** An array of column definitions specifying headers and data keys. */
    columns: ExportColumn<T>[];
    /** Optional: The name of the worksheet. Defaults to "Sheet1". */
    sheetName?: string;
}

/**
 * Service for handling PDF and Excel export logic using jspdf and xlsx.
 * This service encapsulates the logic for transforming data into exportable formats
 * and triggering the download.
 */
export class ExportService {

    constructor() {
        // No dependencies to inject for this example, but a constructor
        // is useful for future dependency injection (e.g., a logger, a file saver utility).
    }

    /**
     * Exports data to a PDF file.
     *
     * @template T The type of the data objects being exported.
     * @param {PdfExportOptions<T>} options The options for PDF export.
     * @returns {Promise<void>} A promise that resolves when the PDF is generated and downloaded, or rejects on error.
     * @throws {Error} If there is an error during PDF generation or download.
     */
    public async exportToPdf<T>(options: PdfExportOptions<T>): Promise<void> {
        try {
            if (!options.data || options.data.length === 0) {
                throw new Error('No data provided for PDF export.');
            }
            if (!options.columns || options.columns.length === 0) {
                throw new Error('No columns defined for PDF export.');
            }

            const doc = new jsPDF(options.orientation, options.unit, options.format);

            if (options.title) {
                doc.setFontSize(18);
                doc.text(options.title, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
            }

            const head = [options.columns.map(col => col.header)];
            const body = options.data.map(row =>
                options.columns.map(col => {
                    const value = row[col.dataKey];
                    return col.formatter ? col.formatter(value, row) : String(value ?? '');
                })
            );

            // Calculate column widths if specified
            const columnStyles: { [key: number]: { cellWidth?: 'auto' | 'wrap' | number } } = {};
            options.columns.forEach((col, index) => {
                if (col.width) {
                    columnStyles[index] = { cellWidth: col.width };
                }
            });

            (doc as any).autoTable({
                startY: options.title ? 30 : 15,
                head: head,
                body: body,
                theme: 'grid',
                headStyles: { fillColor: [22, 160, 133] },
                columnStyles: columnStyles,
                ...options.autoTableOptions, // Allow overriding autoTable options
            });

            doc.save(options.filename.endsWith('.pdf') ? options.filename : `${options.filename}.pdf`);
        } catch (error: any) {
            console.error('Error exporting to PDF:', error);
            throw new Error(`Failed to export PDF: ${error.message || 'Unknown error'}`);
        }
    }

    /**
     * Exports data to an Excel file.
     *
     * @template T The type of the data objects being exported.
     * @param {ExcelExportOptions<T>} options The options for Excel export.
     * @returns {Promise<void>} A promise that resolves when the Excel file is generated and downloaded, or rejects on error.
     * @throws {Error} If there is an error during Excel generation or download.
     */
    public async exportToExcel<T>(options: ExcelExportOptions<T>): Promise<void> {
        try {
            if (!options.data || options.data.length === 0) {
                throw new Error('No data provided for Excel export.');
            }
            if (!options.columns || options.columns.length === 0) {
                throw new Error('No columns defined for Excel export.');
            }

            // Prepare data in a format suitable for xlsx.utils.json_to_sheet
            const exportData = options.data.map(row => {
                const rowObject: { [key: string]: string | number } = {};
                options.columns.forEach(col => {
                    const value = row[col.dataKey];
                    rowObject[col.header] = col.formatter ? col.formatter(value, row) : String(value ?? '');
                });
                return rowObject;
            });

            const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
            const workbook: XLSX.WorkBook = XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Sheet1');

            // Write and download the file
            XLSX.writeFile(workbook, options.filename.endsWith('.xlsx') ? options.filename : `${options.filename}.xlsx`);
        } catch (error: any) {
            console.error('Error exporting to Excel:', error);
            throw new Error(`Failed to export Excel: ${error.message || 'Unknown error'}`);
        }
    }
}