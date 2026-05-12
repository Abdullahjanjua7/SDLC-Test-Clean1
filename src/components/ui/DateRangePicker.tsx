// DateRangePicker.tsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styles from './DateRangePicker.module.css';

// --- Interfaces ---

interface DateRangePickerProps {
  /**
   * The currently selected start date.
   */
  startDate: Date | null;
  /**
   * The currently selected end date.
   */
  endDate: Date | null;
  /**
   * Callback function triggered when the date range changes.
   * @param startDate The new start date.
   * @param endDate The new end date.
   */
  onRangeChange: (startDate: Date | null, endDate: Date | null) => void;
  /**
   * The minimum selectable date. Dates before this will be disabled.
   */
  minDate?: Date;
  /**
   * The maximum selectable date. Dates after this will be disabled.
   */
  maxDate?: Date;
  /**
   * The locale string for date formatting and calendar display (e.g., 'en-US', 'fr-FR').
   * Defaults to 'en-US'.
   */
  locale?: string;
  /**
   * Optional CSS class name to apply to the root element of the picker.
   */
  className?: string;
  /**
   * Placeholder text for the input field when no date range is selected.
   */
  placeholder?: string;
}