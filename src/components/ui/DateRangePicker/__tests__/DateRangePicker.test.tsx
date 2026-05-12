import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DateRangePicker from './DateRangePicker'; // Adjust path as necessary
import { format, addDays, subDays, startOfDay, endOfDay, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale'; // Import a locale for consistent formatting in tests

// Mock CSS modules
jest.mock('./DateRangePicker.module.css', () => ({
  container: 'container',
  inputGroup: 'inputGroup',
  input: 'input',
  separator: 'separator',
  calendarPopover: 'calendarPopover',
  calendarGrid: 'calendarGrid',
  calendarDate: 'calendarDate',
  disabled: 'disabled',
  selectedStart: 'selectedStart',
  selectedEnd: 'selectedEnd',
  inRange: 'inRange',
  clearButton: 'clearButton',
}));

// Helper to format dates consistently for input value assertions
const formatDateForInput = (date: Date | null): string => {
  if (!date) return '';
  // Use a consistent format that matches the component's internal formatDate helper
  return format(date, 'MM/dd/yyyy', { locale: enUS });
};

describe('DateRangePicker', () => {
  const mockOnChange = jest.fn();
  let today