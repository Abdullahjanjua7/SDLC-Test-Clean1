import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styles from './DateRangePicker.module.css';

// --- Date Utility Helpers (simplified for this example, in a real app use date-fns or similar) ---
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
    if (!d1