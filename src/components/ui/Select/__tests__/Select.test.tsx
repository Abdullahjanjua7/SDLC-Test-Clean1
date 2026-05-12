import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select, SelectProps, SelectOption } from './Select';

// Mock CSS modules
jest.mock('./Select.module.css', () => ({
  selectContainer: 'selectContainer',
  selectLabel: 'selectLabel',
  selectTrigger: 'selectTrigger',
  selectedValue: 'selectedValue',
  selectPlaceholder: 'selectPlaceholder',
  arrowIcon: 'arrowIcon',
  arrowUp: 'arrowUp',
  arrowDown: 'arrowDown',
  dropdown: 'dropdown',
  option: 'option',
  optionSelected: 'optionSelected',
  optionHighlighted: 'optionHighlighted',
  noOptions: 'noOptions',
  disabled: 'disabled',
}));

const mockOptions: SelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

const defaultProps: SelectProps = {
  id: 'fruit-select',
  label: 'Choose a fruit',
  options: mockOptions,
  value: null,
  onChange: jest.fn(),
};

describe('Select Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Basic Rendering Tests ---

  test('renders with label and placeholder when no value is selected', () => {
    render(<Select {...defaultProps} />);

    expect(screen.getByLabelText('Choose a fruit')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Choose a fruit' })).toBeInTheDocument();
    expect(screen.getByText('Select an option...')).toBeInTheDocument();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('renders with label and selected value', () => {
    render(<Select {...defaultProps} value="banana" />);

    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.queryByText('Select an option...')).not.toBeInTheDocument();
  });

  test('applies custom placeholder text', () => {
    render(<Select {...defaultProps} placeholder="Pick your fruit" />);
    expect(screen.getByText('Pick your fruit')).toBeInTheDocument();
  });

  test('applies custom className to the container', () => {
    render(<Select {...defaultProps} className="custom-select-class" />);
    expect(screen.getByRole('combobox').parentElement).toHaveClass('custom-select-class');
  });

  // --- Dropdown Open/Close Tests ---

  test('opens dropdown on trigger click', async () => {
    render(<Select {...defaultProps} />);
    const trigger = screen.getByRole('button', { name: 'Choose a fruit' });

    await userEvent.click(trigger);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('option')).toHaveLength(mockOptions.length);
  });

  test('closes dropdown on trigger click when open', async () => {
    render(<Select {...defaultProps} />);
    const trigger = screen.getByRole('button', { name: 'Choose a fruit' });

    await userEvent.click(trigger); // Open
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await userEvent.click(trigger); // Close
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('closes dropdown when clicking outside', async () => {
    render(<Select {...defaultProps} />);
    const trigger = screen.getByRole('button', { name: 'Choose a fruit' });

    await userEvent.click(trigger); // Open
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    // Simulate click outside the component
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  test('closes dropdown on Escape key press', async () => {
    render(<Select {...defaultProps} />);
    const trigger = screen.getByRole('button', { name: 'Choose a fruit' });

    await userEvent.click(trigger); // Open
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveFocus(); // Focus should return to trigger
    });
  });

  test('closes dropdown on Tab key press', async () => {
    render(<Select {...defaultProps} />);
    const trigger = screen.getByRole('button', { name: 'Choose a fruit' });

    await userEvent.click(trigger); // Open
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: 'Tab' });

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  // --- Option Selection Tests ---

  test('calls onChange and closes dropdown when an option is clicked', async () => {
    render(<Select {...defaultProps} />);
    const trigger = screen.getByRole('button', { name: 'Choose a fruit' });

    await userEvent.click(trigger); // Open
    const bananaOption = screen.getByRole('option', { name: 'Banana' });
    expect(bananaOption).toBeInTheDocument();

    await userEvent.click(bananaOption);

    expect(defaultProps.onChange).toHaveBeenCalledTimes(1);
    expect(defaultProps.onChange).toHaveBeenCalledWith('banana');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus(); // Focus should return to trigger
  });

  test('selects option using ArrowDown and Enter keys', async () => {
    render(<Select {...defaultProps} />);
    const trigger = screen.getByRole('button', { name: 'Choose a fruit' });

    // Open dropdown and highlight first item
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-activedescendant', 'fruit-select-option-0');
    expect(screen.getByText('Apple')).toHaveClass('optionHighlighted');

    // Move highlight to Banana
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(trigger).toHaveAttribute('aria-activedescendant', 'fruit-select-option-1');
    expect(screen.getByText('Banana')).toHaveClass('optionHighlighted');

    // Select Banana with Enter
    fireEvent.keyDown(trigger, { key: 'Enter' });

    expect(defaultProps.onChange).toHaveBeenCalledTimes(1);
    expect(defaultProps.onChange).toHaveBeenCalledWith('banana');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  test('selects option using ArrowUp and Space keys', async () => {
    render(<Select {...defaultProps} />);
    const trigger = screen.getByRole('button', { name: 'Choose a fruit' });

    // Open dropdown and highlight last item
    fireEvent.keyDown(trigger, { key: 'ArrowUp' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-activedescendant', 'fruit-select-option-2');
    expect(screen.getByText('Cherry')).toHaveClass('optionHighlighted');

    // Move highlight to Banana
    fireEvent.keyDown(trigger, { key: 'ArrowUp' });
    expect(trigger).toHaveAttribute('aria-activedescendant', 'fruit-select-option-1');
    expect(screen.getByText('Banana')).toHaveClass('optionHighlighted');

    // Select Banana with Space
    fireEvent.keyDown(trigger, { key: ' ' });

    expect(defaultProps.onChange).toHaveBeenCalledTimes(1);
    expect(defaultProps.onChange).toHaveBeenCalledWith('banana');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  test('ArrowDown wraps around from last to first option', async () => {
    render(<Select {...defaultProps} />);
    const trigger = screen.getByRole('button', { name: 'Choose a fruit' });

    await userEvent.click(trigger); // Open
    fireEvent.keyDown(trigger, { key: 'ArrowDown' }); // Apple
    fireEvent.keyDown(trigger, { key: 'ArrowDown' }); // Banana
    fireEvent.keyDown(trigger, { key: 'ArrowDown' }); // Cherry
    expect(trigger).toHaveAttribute('aria-activedescendant', 'fruit-select-option-2');
    expect(screen.getByText('Cherry')).toHaveClass('optionHighlighted');

    fireEvent.keyDown(trigger, { key: 'ArrowDown' }); // Wraps to Apple
    expect(trigger).toHaveAttribute('aria-activedescendant', 'fruit-select-option-0');
    expect(screen.getByText('Apple')).toHaveClass('optionHighlighted');
  });

  test('ArrowUp wraps around from first to last option', async () => {
    render(<Select {...defaultProps} />);
    const trigger = screen.getByRole('button', { name: 'Choose a fruit' });

    await userEvent.click(trigger); // Open
    fireEvent.keyDown(trigger, { key: 'ArrowUp' }); // Cherry
    expect(trigger).toHaveAttribute('aria-activedescendant', 'fruit-select-option-2');
    expect(screen.getByText('Cherry')).toHaveClass('optionHighlighted');

    fireEvent.keyDown(trigger, { key: 'ArrowUp' }); // Banana
    fireEvent.keyDown(trigger, { key: 'ArrowUp' }); // Apple
    expect(trigger).toHaveAttribute('aria-activedescendant', 'fruit-select-option-0');
    expect(screen.getByText('Apple')).toHaveClass('optionHighlighted');

    fireEvent.keyDown(trigger, { key: 'ArrowUp' }); // Wraps to Cherry
    expect(trigger).toHaveAttribute('aria-activedescendant', 'fruit-select-option-2');
    expect(screen.getByText('Cherry')).toHaveClass('optionHighlighted');
  });

  test('initial highlight is on selected option when dropdown opens', async () => {
    render(<Select {...defaultProps} value="banana" />);
    const trigger = screen.getByRole('button', { name: 'Choose a fruit' });

    await userEvent.click(trigger); // Open
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-activedescendant', 'fruit-select-option-1');
    expect(screen.getByText('Banana')).toHaveClass('optionHighlighted');
  });

  test('initial highlight is on first option if no value is selected and ArrowDown is pressed', async () => {
    render(<Select {...defaultProps} value={null} />);
    const trigger = screen.getByRole('button', { name: 'Choose a fruit' });

    fireEvent.keyDown(trigger, { key: 'ArrowDown' }); // Open
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-activedescendant', 'fruit-select-option-0');
    expect(screen.getByText('Apple')).toHaveClass('optionHighlighted');
  });

  test('initial highlight is on last option if no value is selected and ArrowUp is pressed', async () => {
    render(<Select {...defaultProps} value={null} />);
    const trigger = screen.getByRole('button', { name: 'Choose a fruit' });

    fireEvent.keyDown(trigger, { key: 'ArrowUp' }); // Open
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-activedescendant', 'fruit-select-option-2');
    expect(screen.getByText('Cherry')).toHaveClass('optionHighlighted');
  });

  test('mouse hover highlights options', async () => {
    render(<Select {...defaultProps} />);
    const trigger = screen.getByRole('button', { name: 'Choose a fruit' });

    await userEvent.click(trigger); // Open
    const appleOption = screen.getByRole('option', { name: 'Apple' });
    const bananaOption = screen.getByRole('option', { name: 'Banana' });

    fireEvent.mouseEnter(appleOption);
    expect(appleOption).toHaveClass('optionHighlighted');
    expect(trigger).toHaveAttribute('aria-activedescendant', 'fruit-select-option-0');

    fireEvent.mouseEnter(bananaOption);
    expect(appleOption).not.toHaveClass('optionHighlighted');
    expect(bananaOption).toHaveClass('optionHighlighted');
    expect(trigger).toHaveAttribute('aria-activedescendant', 'fruit-select-option-1');
  });

  // --- Disabled State Tests ---

  test('does not open dropdown when disabled', async () => {
    render(<Select {...defaultProps} disabled />);
    const trigger = screen.getByRole('button', { name: 'Choose a fruit' });

    expect(trigger).toBeDisabled();
    expect(trigger).toHaveClass('disabled'); // Check for disabled class on trigger
    expect(screen.getByRole('combobox').parentElement).toHaveClass('disabled'); // Check for disabled class on container

    await userEvent.click(trigger);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('keyboard interactions do not work when disabled', () => {
    render(<Select {...defaultProps} disabled />);
    const trigger = screen.getByRole('button', { name: 'Choose a fruit' });

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(defaultProps.onChange).not.toHaveBeenCalled();

    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  test('clicking an option does not call onChange when disabled', async () => {
    render(<Select {...defaultProps} disabled />);
    const trigger = screen.getByRole('button', { name: 'Choose a fruit' });

    // Manually set isOpen to true for testing purposes (though it shouldn't open when disabled)
    // This scenario is more for ensuring options themselves are not clickable if somehow visible
    // For a truly disabled component, the dropdown wouldn't open.
    // We'll test the trigger's disabled state more directly.
    expect(trigger).toBeDisabled();
    await userEvent.click(trigger); // Should not open
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  // --- Empty Options Test ---

  test('displays "No options available" when options array is empty', async () => {
    render(<Select {...defaultProps} options={[]} />);
    const trigger = screen.getByRole('button', { name: 'Choose a fruit' });

    await userEvent.click(trigger); // Open
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('No options available')).toBeInTheDocument();
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  // --- Accessibility Tests ---

  test('has correct ARIA attributes on container', () => {
    render(<Select {...defaultProps} />);
    const container = screen.getByRole('combobox');

    expect(container).toHaveAttribute('role', 'combobox');
    expect(container).toHaveAttribute('aria-haspopup', 'listbox');
    expect(container).toHaveAttribute('aria-expanded', 'false');
    expect(container).toHaveAttribute('aria-labelledby', 'fruit-select-label');
    expect(container).toHaveAttribute('aria-controls', 'fruit-select-listbox');
  });

  test('has correct ARIA attributes on label', () => {
    render(<Select {...defaultProps} />);
    const label = screen.getByLabelText('Choose a fruit');
    expect(label).toHaveAttribute('id', 'fruit-select-label');
    expect(label).toHaveAttribute('for', 'fruit-select');
  });

  test('has correct ARIA attributes on trigger button', async () => {
    render(<Select {...defaultProps} />);
    const trigger = screen.getByRole('button', { name: 'Choose a fruit' });

    expect(trigger).toHaveAttribute('id', 'fruit-select');
    expect(trigger).toHaveAttribute('type', 'button');
    expect(trigger).toHaveAttribute('aria-label', 'Choose a fruit');
    expect(trigger).not.toHaveAttribute('aria-activedescendant'); // Not active initially
    expect(trigger).not.toBeDisabled();

    await userEvent.click(trigger); // Open
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // After opening, if no value is selected, aria-activedescendant should be undefined
    // If a value is selected, it should point to that option.
    // For this test, we'll check after keyboard navigation.
    fireEvent.keyDown(trigger, { key: 'ArrowDown' }); // Highlight first option
    expect(trigger).toHaveAttribute('aria-activedescendant', 'fruit-select-option-0');
  });

  test('has correct ARIA attributes on dropdown listbox', async () => {
    render(<Select {...defaultProps} />);
    const trigger = screen.getByRole('button', { name: 'Choose a fruit' });

    await userEvent.click(trigger); // Open
    const listbox = screen.getByRole('listbox');

    expect(listbox).toHaveAttribute('id', 'fruit-select-listbox');
    expect(listbox).toHaveAttribute('role', 'listbox');
    expect(listbox).toHaveAttribute('aria-labelledby', 'fruit-select-label');
    expect(listbox).toHaveAttribute('tabIndex', '-1');
  });

  test('has correct ARIA attributes on options', async () => {
    render(<Select {...defaultProps} value="banana" />);
    const trigger = screen.getByRole('button', { name: 'Choose a fruit' });

    await userEvent.click(trigger); // Open
    const options = screen.getAllByRole('option');

    expect(options).toHaveLength(mockOptions.length);

    options.forEach((option, index) => {
      expect(option).toHaveAttribute('id', `fruit-select-option-${index}`);
      expect(option).toHaveAttribute('role', 'option');
      if (mockOptions[index].value === 'banana') {
        expect(option).toHaveAttribute('aria-selected', 'true');
        expect(option).toHaveClass('optionSelected');
      } else {
        expect(option).toHaveAttribute('aria-selected', 'false');
        expect(option).not.toHaveClass('optionSelected');
      }
    });
  });

  test('aria-activedescendant updates correctly with keyboard navigation', async () => {
    render(<Select {...defaultProps} />);
    const trigger = screen.getByRole('button', { name: 'Choose a fruit' });

    fireEvent.keyDown(trigger, { key: 'ArrowDown' }); // Open and highlight Apple
    expect(trigger).toHaveAttribute('aria-activedescendant', 'fruit-select-option-0');

    fireEvent.keyDown(trigger, { key: 'ArrowDown' }); // Highlight Banana
    expect(trigger).toHaveAttribute('aria-activedescendant', 'fruit-select-option-1');

    fireEvent.keyDown(trigger, { key: 'ArrowUp' }); // Highlight Apple
    expect(trigger).toHaveAttribute('aria-activedescendant', 'fruit-select-option-0');

    fireEvent.keyDown(trigger, { key: 'Escape' }); // Close
    expect(trigger).not.toHaveAttribute('aria-activedescendant');
  });

  test('aria-expanded updates correctly', async () => {
    render(<Select {...defaultProps} />);
    const trigger = screen.getByRole('button', { name: 'Choose a fruit' });
    const container = screen.getByRole('combobox');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(container).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger); // Open
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(container).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(trigger); // Close
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(container).toHaveAttribute('aria-expanded', 'false');
  });
});