import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import DateRangePicker from '../src/DateRangePicker'; // Adjust path if needed

// Mock CSS modules to prevent issues with Jest
jest.mock('../src/DateRangePicker.module.css', () => ({
  __esModule: true,
  default: {
    dateRangePicker: 'dateRangePicker',
    input: 'input',
    popover: 'popover',
    calendar: 'calendar',
    calendarHeader: 'calendarHeader',
    currentMonth: 'currentMonth',
    weekdays: 'weekdays',
    weekday: 'weekday',
    daysGrid: 'daysGrid',
    day: 'day',
    dayEmpty: 'dayEmpty',
    daySelectedStart: 'daySelectedStart',
    daySelectedEnd: 'daySelectedEnd',
    dayInRange: 'dayInRange',
    dayDisabled: 'dayDisabled',
  },
}));

// Helper function to get a date without time for comparison
const getDateOnly = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

// Helper to format dates for display consistently with the mock component
const formatDateForDisplay = (date: Date | null, locale: string = 'en-US') => {
  if (!date) return '';
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

describe('DateRangePicker', () => {
  const mockOnRangeChange = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date to control `new Date()` calls for consistent calendar rendering
    jest.useFakeTimers();
    // Set a fixed date for `new Date()` to ensure consistent month display
    jest.setSystemTime(new Date(2023, 10, 15)); // November 15, 2023
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // --- 1. Initial Render Tests ---
  test('renders input with placeholder when no dates are selected', () => {
    render(<DateRangePicker startDate={null} endDate={null} onRangeChange={mockOnRangeChange} />);
    const input = screen.getByRole('textbox', { name: 'Date range picker' });
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('placeholder', 'Select a date range');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); // Calendar should not be open
  });

  test('renders input with custom placeholder', () => {
    render(<DateRangePicker startDate={null} endDate={null} onRangeChange={mockOnRangeChange} placeholder="Choose your dates" />);
    const input = screen.getByRole('textbox', { name: 'Date range picker' });
    expect(input).toHaveAttribute('placeholder', 'Choose your dates');
  });

  test('renders input with formatted dates when startDate and endDate are provided', () => {
    const startDate = new Date(2023, 0, 15); // Jan 15, 2023
    const endDate = new Date(2023, 0, 20); // Jan 20, 2023
    render(<DateRangePicker startDate={startDate} endDate={endDate} onRangeChange={mockOnRangeChange} />);
    const input = screen.getByRole('textbox', { name: 'Date range picker' });
    expect(input).toHaveValue('Jan 15, 2023 - Jan 20, 2023');
  });

  test('applies custom className to the root element', () => {
    render(<DateRangePicker startDate={null} endDate={null} onRangeChange={mockOnRangeChange} className="my-custom-picker" />);
    const pickerRoot = screen.getByRole('textbox', { name: 'Date range picker' }).closest('.dateRangePicker');
    expect(pickerRoot).toHaveClass('my-custom-picker');
  });

  test('input has correct ARIA attributes initially', () => {
    render(<DateRangePicker startDate={null} endDate={null} onRangeChange={mockOnRangeChange} />);
    const input = screen.getByRole('textbox', { name: 'Date range picker' });
    expect(input).toHaveAttribute('aria-label', 'Date range picker');
    expect(input).toHaveAttribute('aria-haspopup', 'dialog');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('readOnly');
  });

  // --- 2. Opening/Closing Calendar ---
  test('clicking the input opens the calendar popover', async () => {
    render(<DateRangePicker startDate={null} endDate={null} onRangeChange={mockOnRangeChange} />);
    const input = screen.getByRole('textbox', { name: 'Date range picker' });

    await user.click(input);

    const calendar = screen.getByRole('dialog', { name: /calendar/i });
    expect(calendar).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('November 2023')).toBeInTheDocument(); // Based on fixed system time
  });

  test('clicking the input again closes the calendar popover', async () => {
    render(<DateRangePicker startDate={null} endDate={null} onRangeChange={mockOnRangeChange} />);
    const input = screen.getByRole('textbox', { name: 'Date range picker' });

    await user.click(input); // Open
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(input); // Close
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  test('clicking outside the picker closes the calendar popover', async () => {
    render(
      <div>
        <DateRangePicker startDate={null} endDate={null} onRangeChange={mockOnRangeChange} />
        <button>Outside Button</button>
      </div>
    );
    const input = screen.getByRole('textbox', { name: 'Date range picker' });
    const outsideButton = screen.getByRole('button', { name: 'Outside Button' });

    await user.click(input); // Open
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(outsideButton); // Click outside
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  test('pressing Escape key closes the calendar popover', async () => {
    render(<DateRangePicker startDate={null} endDate={null} onRangeChange={mockOnRangeChange} />);
    const input = screen.getByRole('textbox', { name: 'Date range picker' });

    await user.click(input); // Open
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  // --- 3. Date Selection - Basic ---
  test('allows selecting a start date and then an end date', async () => {
    render(<DateRangePicker startDate={null} endDate={null} onRangeChange={mockOnRangeChange} />);
    const input = screen.getByRole('textbox', { name: 'Date range picker' });

    await user.click(input); // Open calendar

    // Select start date (e.g., Nov 10, 2023)
    const day10 = screen.getByRole('button', { name: 'Friday, November 10, 2023' });
    await user.click(day10);
    expect(input).toHaveValue('Nov 10, 2023 -'); // Only start date selected
    expect(day10).toHaveClass('daySelectedStart');
    expect(mockOnRangeChange).not.toHaveBeenCalled(); // Not called until end date is selected

    // Select end date (e.g., Nov 15, 2023)
    const day15 = screen.getByRole('button', { name: 'Wednesday, November 15, 2023' });
    await user.click(day15);

    expect(mockOnRangeChange).toHaveBeenCalledTimes(1);
    expect(mockOnRangeChange).toHaveBeenCalledWith(getDateOnly(new Date(2023, 10, 10)), getDateOnly(new Date(2023, 10, 15)));
    expect(input).toHaveValue('Nov 10, 2023 - Nov 15, 2023');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); // Calendar closes
  });

  test('selecting a single date sets both start and end to that date', async () => {
    render(<DateRangePicker startDate={null} endDate={null} onRangeChange={mockOnRangeChange} />);
    const input = screen.getByRole('textbox', { name: 'Date range picker' });

    await user.click(input); // Open calendar

    // Select a date (e.g., Nov 15, 2023)
    const day15 = screen.getByRole('button', { name: 'Wednesday, November 15, 2023' });
    await user.click(day15); // Selects start
    await user.click(day15); // Selects end (same date)

    expect(mockOnRangeChange).toHaveBeenCalledTimes(1);
    expect(mockOnRangeChange).toHaveBeenCalledWith(getDateOnly(new Date(2023, 10, 15)), getDateOnly(new Date(2023, 10, 15)));
    expect(input).toHaveValue('Nov 15, 2023 - Nov 15, 2023');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); // Calendar closes
  });

  test('selecting an end date earlier than start date swaps them', async () => {
    render(<DateRangePicker startDate={null} endDate={null} onRangeChange={mockOnRangeChange} />);
    const input = screen.getByRole('textbox', { name: 'Date range picker' });

    await user.click(input); // Open calendar

    // Select start date (e.g., Nov 20, 2023)
    const day20 = screen.getByRole('button', { name: 'Monday, November 20, 2023' });
    await user.click(day20);
    expect(input).toHaveValue('Nov 20, 2023 -');

    // Select end date (e.g., Nov 10, 2023) - earlier than start
    const day10 = screen.getByRole('button', { name: 'Friday, November 10, 2023' });
    await user.click(day10);

    expect(mockOnRangeChange).toHaveBeenCalledTimes(1);
    // Expect the dates to be swapped: start=Nov 10, end=Nov 20
    expect(mockOnRangeChange).toHaveBeenCalledWith(getDateOnly(new Date(2023, 10, 10)), getDateOnly(new Date(2023, 10, 20)));
    expect(input).toHaveValue('Nov 10, 2023 - Nov 20, 2023');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('clearing a selection by starting a new range', async () => {
    const initialStartDate = new Date(2023, 10, 10);
    const initialEndDate = new Date(2023, 10, 15);
    const { rerender } = render(
      <DateRangePicker startDate={initialStartDate} endDate={initialEndDate} onRangeChange={mockOnRangeChange} />
    );
    const input = screen.getByRole('textbox', { name: 'Date range picker' });
    expect(input).toHaveValue('Nov 10, 2023 - Nov 15, 2023');

    await user.click(input); // Open calendar

    // Select a new start date (e.g., Nov 25, 2023)
    const day25 = screen.getByRole('button', { name: 'Saturday, November 25, 2023' });
    await user.click(day25);

    // Input should reflect the new start date, old end date cleared
    expect(input).toHaveValue('Nov 25, 2023 -');
    expect(mockOnRangeChange).not.toHaveBeenCalled(); // Not called yet

    // Select a new end date (e.g., Nov 28, 2023)
    const day28 = screen.getByRole('button', { name: 'Tuesday, November 28, 2023' });
    await user.click(day28);

    expect(mockOnRangeChange).toHaveBeenCalledTimes(1);
    expect(mockOnRangeChange).toHaveBeenCalledWith(getDateOnly(new Date(2023, 10, 25)), getDateOnly(new Date(2023, 10, 28)));
    expect(input).toHaveValue('Nov 25, 2023 - Nov 28, 2023');
  });

  // --- 4. Date Selection - Edge Cases/Props ---
  test('dates before minDate are disabled and unselectable', async () => {
    const minDate = new Date(2023, 10, 10); // Nov 10, 2023
    render(<DateRangePicker startDate={null} endDate={null} onRangeChange={mockOnRangeChange} minDate={minDate} />);
    const input = screen.getByRole('textbox', { name: 'Date range picker' });

    await user.click(input); // Open calendar

    const day9 = screen.getByRole('button', { name: 'Thursday, November 9, 2023' });
    const day10 = screen.getByRole('