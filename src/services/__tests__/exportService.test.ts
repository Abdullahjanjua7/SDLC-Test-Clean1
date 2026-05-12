// Mock jspdf and jspdf-autotable
// We need to mock the jsPDF constructor and the methods called on its instance.
// jspdf-autotable extends the jsPDF prototype, adding the autoTable method.
// For testing, we can simply ensure our mocked jsPDF instance has an autoTable method.
const mockSave = jest.fn();
const mockSetFontSize = jest.fn();
const mockText = jest.fn();
const mockGetWidth = jest.fn().mockReturnValue(210); // A4 width in mm for internal.pageSize.getWidth()
const mockAutoTable = jest.fn(); // This will be the mock for the autoTable method

jest.mock('jspdf', () => {
    return {
        jsPDF: jest.fn().mockImplementation(() => {
            return {
                setFontSize: mockSetFontSize,
                text: mockText,
                internal: {
                    pageSize: {
                        getWidth: mockGetWidth
                    }
                },
                save: mockSave,
                // autoTable is added to the prototype by 'jspdf-autotable',
                // but for testing purposes, we can directly add it to our mock instance
                // as the service calls it on the instance.
                autoTable: mockAutoTable,
            };
        }),
    };
});

// Mock xlsx library functions
const mockJsonToSheet = jest.fn();
const mockBookNew = jest