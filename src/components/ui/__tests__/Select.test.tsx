import React from 'react';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Select from './Select';

// Mock useId for consistent IDs in tests, as it's a React 18+ hook
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useId: jest.fn(() => 'mock-id'),
}));

const mockOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
  { value: 'date', label: 'Date' },
];

const mockOnChange = jest.fn();

describe('Select', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset useId mock for each test to ensure it returns 'mock-id'
    (jest.requireMock('react') as any).useId.mockImplementation(() => 'mock-id');
  });

  // Helper to get the select button by its accessible name
  const getSelectButton = (name: RegExp | string = /select an option/i) => {
    return screen.getByRole('button', { name });
  };

  // Helper to open the dropdown
  const openDropdown = async (button: