import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock CSS modules
jest.mock('./DateRangePicker.module.css', () => ({
    __esModule: true,
    default: new Proxy({}, {
        get: (target, prop) => prop,
    }),
}));

// --- Date Utility Helpers (as provided in the snippet, completed for functionality) ---
const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth() + 1, 0);
const addMonths = (date: Date, amount: number): Date => {
    const newDate = new Date(date);
    newDate.setMonth(date.getMonth() + amount);
    return newDate;
};
const addDays = (date: Date, amount: number): Date => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + amount);
    return newDate;
};
const isSameDay = (d1: Date | null, d2: Date | null): boolean => {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};
const isSameMonth = (d1: Date | null, d2: Date | null): boolean => {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
};
const isBefore = (d1: Date, d2: Date): boolean => d1.getTime() < d2.getTime();
const isAfter = (d1: Date, d2: Date): boolean => d1.getTime() > d2.getTime();
const isBetween = (date: Date, start: Date, end: Date): boolean =>
    (isAfter(date, start) || isSameDay(date, start)) && (isBefore(date, end) || isSameDay(date, end));

// --- DateRangePicker Component (reconstructed based on common patterns and provided snippet) ---
interface DateRangePickerProps {
    initialStartDate?: Date | null;
    initialEndDate?: Date | null;
    minDate?: Date | null;
    maxDate?: Date | null;
    onChange?: (startDate: Date | null, endDate: Date | null) => void;
    dateFormat?: string; // e.g., 'MM/dd/yyyy'
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
    initialStartDate = null,
    initialEndDate = null,
    minDate = null,
    maxDate = null,
    onChange,
    dateFormat = 'MM/dd/yyyy',
}) => {
    const [startDate, setStartDate] = useState<Date | null>(initialStartDate);
    const [endDate, setEndDate] = useState<Date | null>(initialEndDate);
    const [currentMonth, setCurrentMonth] = useState<Date>(initialStartDate || new Date());

    useEffect(() => {
        setStartDate(initialStartDate);
        setEndDate(initialEndDate);
        if (initialStartDate) {
            setCurrentMonth(initialStartDate);
        }
    }, [initialStartDate, initialEndDate]);

    const formatDisplayDate = useCallback((date: Date | null): string => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        if (dateFormat === 'dd/MM/yyyy') return `${day}/${month}/${year}`;
        if (dateFormat === 'yyyy-MM-dd') return `${year}-${month}-${day}`;
        return `${month}/${day}/${year}`; // Default 'MM/dd/yyyy'
    }, [dateFormat]);

    const handleDateClick = useCallback((date: Date) => {
        if (minDate && isBefore(date, minDate) && !isSameDay(date, minDate)) return;
        if (maxDate && isAfter(date, maxDate) && !isSameDay(date, maxDate)) return;

        let newStartDate = startDate;
        let newEndDate = endDate;

        if (!startDate || (startDate && endDate)) {
            // No date selected, or both dates selected (start new selection)
            newStartDate = date;
            newEndDate = null;
        } else if (isBefore(date, startDate)) {
            // Clicked date is before current startDate, make it the new startDate
            newStartDate = date;
            newEndDate = null;
        } else {
            // Clicked date is after or same as current startDate, make it endDate
            newEndDate = date;
        }

        setStartDate(newStartDate);
        setEndDate(newEndDate);
        onChange?.(newStartDate, newEndDate);
    }, [startDate, endDate, minDate, maxDate, onChange]);

    const handlePrevMonth = useCallback(() => {
        setCurrentMonth(prev => addMonths(prev, -1));
    }, []);

    const handleNextMonth = useCallback(() => {
        setCurrentMonth(prev => addMonths(prev, 1));
    }, []);

    const renderCalendarDays = useMemo(() => {
        const days = [];
        const firstDayOfMonth = startOfMonth(currentMonth);
        const lastDayOfMonth = endOfMonth(currentMonth);

        // Pad start with previous month's days
        const startDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 6 for Saturday
        for (let i = 0; i < startDayOfWeek; i++) {
            const prevMonthDay = addDays(firstDayOfMonth, -(startDayOfWeek - i));
            days.push({ date: prevMonthDay, isCurrentMonth: false });
        }

        // Current month's days
        let day = firstDayOfMonth;
        while (isSameMonth(day, currentMonth)) {
            days.push({ date: day, isCurrentMonth: true });
            day = addDays(day, 1);
        }

        // Pad end with next month's days to fill a 6-week grid
        const totalDays = days.length;
        const remainingCells = 42 - totalDays; // 6 rows * 7 days
        for (let i = 0; i < remainingCells; i++) {
            const nextMonthDay = addDays(lastDayOfMonth, i + 1);
            days.push({ date: nextMonthDay, isCurrentMonth: false });
        }

        return days.map((dayInfo, index) => {
            const { date, isCurrentMonth } = dayInfo;
            const isDisabled =
                (minDate && isBefore(date, minDate) && !isSameDay(date, minDate)) ||
                (maxDate && isAfter(date, maxDate) && !isSameDay(date, maxDate));
            const isSelectedStart = isSameDay(date, startDate);
            const isSelectedEnd = isSameDay(date, endDate);
            const isInRange = startDate && endDate && isBetween(date, startDate, endDate) && !isSelectedStart && !isSelectedEnd;

            return (
                <button
                    key={index}
                    className={`${styles.day} ${isCurrentMonth ? styles.currentMonth : styles.otherMonth} ${isDisabled ? styles.disabled : ''} ${isSelectedStart ? styles.selectedStart : ''} ${isSelectedEnd ? styles.selectedEnd : ''} ${isInRange ? styles.inRange : ''}`}
                    onClick={() => handleDateClick(date)}
                    disabled={isDisabled}
                    aria-label={formatDisplayDate(date)}
                    aria-selected={isSelectedStart || isSelectedEnd ? 'true' : undefined}
                    aria-disabled={isDisabled ? 'true' : undefined}
                >
                    {date.getDate()}
                </button>
            );
        });
    }, [currentMonth, startDate, endDate, minDate, maxDate, handleDateClick, formatDisplayDate]);

    const currentMonthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
        <div className={styles.dateRangePicker}>
            <div className={styles.header}>
                <button onClick={handlePrevMonth} aria-label="Previous Month">&lt;</button>
                <span className={styles.currentMonthDisplay} aria-live="polite">{currentMonthName}</span>
                <button onClick={handleNextMonth} aria-label="Next Month">&gt;</button>
            </div>
            <div className={styles.selectedDatesDisplay}>
                <span aria-label="Selected start date">{formatDisplayDate(startDate)}</span> -
                <span aria-label="Selected end date">{formatDisplayDate(endDate)}</span>
            </div>
            <div className={styles.calendarGrid} role="grid" aria-labelledby="currentMonthDisplay">
                {/* Weekday headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className={styles.weekdayHeader} role="columnheader">{day}</div>
                ))}
                {renderCalendarDays}
            </div>
        </div>
    );
};

export default DateRangePicker;

// --- Test File ---
describe('DateRangePicker', () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();

    // Mock Date to control current time for consistent tests
    const MOCK_DATE = new Date('2023-10-15T12:00:00.000Z'); // October 15, 2023
    const MOCK_DATE_STRING_MMDDYYYY = '10/15/2023';

    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(MOCK_DATE);
    });

    afterEach(() => {
        cleanup();
        mockOnChange.mockClear();
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    // Helper to get a date button by its day number
    const getDayButton = (day: number) => screen.getByRole('button', { name: new RegExp(`^10/${day}/2023$`) });
    const getDayButtonByLabel = (label: string) => screen.getByRole('button', { name: label });

    // Helper to format date for display based on default 'MM/dd/yyyy'
    const formatDateForDisplay = (date: Date | null) => {
        if (!date) return '';
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    // Helper to check if a date button has a specific class
    const expectDateButtonToHaveClass = (day: number, className: string) => {
        expect(getDayButton(day)).toHaveClass(className);
    };

    // Helper to check if a date button does NOT have a specific class
    const expectDateButtonToNotHaveClass = (day: number, className: string) => {
        expect(getDayButton(day)).not.toHaveClass(className);
    };

    // --- 1. Tests all component functionality & 2. Tests different prop combinations ---

    test('renders without crashing and displays current month by default', () => {
        render(<DateRangePicker />);
        expect(screen.getByText('October 2023')).toBeInTheDocument();
        expect(screen.getByLabelText('Selected start date')).toHaveTextContent('');
        expect(screen.getByLabelText('Selected end date')).toHaveTextContent('');
        expect(getDayButton(15)).toBeInTheDocument(); // MOCK_DATE's day
    });

    test('renders with initialStartDate and initialEndDate correctly selected', () => {
        const initialStart = new Date('2023-10-10T12:00:00.000Z');
        const initialEnd = new Date('2023-10-20T12:00:00.000Z');
        render(<DateRangePicker initialStartDate={initialStart} initialEndDate={initialEnd} />);

        expect(screen.getByLabelText('Selected start date')).toHaveTextContent('10/10/2023');
        expect(screen.getByLabelText('Selected end date')).toHaveTextContent('10/20/2023');

        expectDateButtonToHaveClass(10, 'selectedStart');
        expectDateButtonToHaveClass(20, 'selectedEnd');
        expectDateButtonToHaveClass(15, 'inRange'); // A day between start and end
    });

    test('renders with only initialStartDate correctly selected', () => {
        const initialStart = new Date('2023-10-10T12:00:00.000Z');
        render(<DateRangePicker initialStartDate={initialStart} />);

        expect(screen.getByLabelText('Selected start date')).toHaveTextContent('10/10/2023');
        expect(screen.getByLabelText('Selected end date')).toHaveTextContent('');

        expectDateButtonToHaveClass(10, 'selectedStart');
        expectDateButtonToNotHaveClass(10, 'selectedEnd');
    });

    test('renders with only initialEndDate (should not happen in a real picker, but testing prop handling)', () => {
        const initialEnd = new Date('2023-10-20T12:00:00.000Z');
        render(<DateRangePicker initialEndDate={initialEnd} />);

        // If only end date is provided, start date should be null, and end date should not be selected
        // as it requires a start date first. The component logic sets startDate first.
        // However, the useEffect will set it, so let's test that it's set but not 'selectedStart'
        expect(screen.getByLabelText('Selected start date')).toHaveTextContent('');
        expect(screen.getByLabelText('Selected end date')).toHaveTextContent('10/20/2023'); // Still displays it
        expect(getDayButton(20)).not.toHaveClass('selectedStart');
        expect(getDayButton(20)).not.toHaveClass('selectedEnd'); // Not selected if no start date
    });

    test('updates initial dates when props change', () => {
        const { rerender } = render(<DateRangePicker initialStartDate={new Date('2023-10-01')} />);
        expect(screen.getByLabelText('Selected start date')).toHaveTextContent('10/01/2023');

        rerender(<DateRangePicker initialStartDate={new Date('2023-10-05')} initialEndDate={new Date('2023-10-10')} />);
        expect(screen.getByLabelText('Selected start date')).toHaveTextContent('10/05/2023');
        expect(screen.getByLabelText('Selected end date')).toHaveTextContent('10/10/2023');
        expectDateButtonToHaveClass(5, 'selectedStart');
        expectDateButtonToHaveClass(10, 'selectedEnd');
    });

    // --- 3. Tests user interactions (clicks, form inputs, etc.) ---

    test('allows selecting a start date', async () => {
        render(<DateRangePicker onChange={mockOnChange} />);

        await user.click(getDayButton(10)); // Click day 10

        expect(screen.getByLabelText('Selected start date')).toHaveTextContent('10/10/2023');
        expect(screen.getByLabelText('Selected end date')).toHaveTextContent('');
        expectDateButtonToHaveClass(10, 'selectedStart');
        expect(mockOnChange).toHaveBeenCalledWith(new Date('2023-10-10T12:00:00.000Z'), null);
    });

    test('allows selecting an end date after a start date', async () => {
        render(<DateRangePicker onChange={mockOnChange} />);

        await user.click(getDayButton(10)); // Select start date
        mockOnChange.mockClear(); // Clear previous call

        await user.click(getDayButton(20)); // Select end date

        expect(screen.getByLabelText('Selected start date')).toHaveTextContent('10/10/2023');
        expect(screen.getByLabelText('Selected end date')).toHaveTextContent('10/20/2023');
        expectDateButtonToHaveClass(10, 'selectedStart');
        expectDateButtonToHaveClass(20, 'selectedEnd');
        expectDateButtonToHaveClass(15, 'inRange');
        expect(mockOnChange).toHaveBeenCalledWith(new Date('2023-10-10T12:00:00.000Z'), new Date('2023-10-20T12:00:00.000Z'));
    });

    test('resets selection if a date before current start date is clicked', async () => {
        render(<DateRangePicker onChange={mockOnChange} />);

        await user.