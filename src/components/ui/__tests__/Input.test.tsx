import React, { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input, InputProps } from './Input';

// Mock CSS modules to return class names as strings for easier testing
jest.mock('./Input.module.css', () => ({
  inputContainer: 'mock-input-container',
  label: 'mock-label',
  inputField: 'mock-input-field',
  inputError: 'mock-input-error',
  errorMessage: 'mock-error-message',
}));

// Mock useId to return a consistent value for testing purposes
// This ensures generated IDs are predictable in tests.
const MOCK_USE_ID = 'mock-generated-id';
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useId: jest.fn(() => MOCK_USE_ID),
}));

describe('Input', () => {
  // Reset the useId mock before each test to ensure consistency
  beforeEach(() => {
    (React.useId as jest.Mock).mockClear();
    (React.useId as jest.Mock).mockReturnValue(MOCK_USE_ID);
  });

  // Helper function to render the component with default props
  const renderInput = (props?: InputProps) => {
    return render(<Input {...props} />);
  };

  // Test Case 1: Renders without crashing and displays a basic input
  test('renders a basic input field', () => {
    renderInput();
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveClass('mock-input-field');
    expect(inputElement).not.toHaveClass('mock-input-error');
  });

  // Test Case 2: Renders with a label and associates it correctly
  test('renders with a label and associates it with the input', () => {
    const labelText = 'Username';
    renderInput({ label: labelText });

    const labelElement = screen.getByText(labelText);
    const inputElement = screen.getByLabelText(labelText);

    expect(labelElement).toBeInTheDocument();
    expect(inputElement).toBeInTheDocument();
    expect(labelElement).toHaveAttribute('for', inputElement.id);
    expect(labelElement).toHaveClass('mock-label');
  });

  // Test Case 3: Renders with an error message and applies error state
  test('renders with an error message and applies error state', () => {
    const errorMessage = 'This field is required.';
    renderInput({ error: errorMessage });

    const inputElement = screen.getByRole('textbox');
    const errorElement = screen.getByText(errorMessage);

    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveClass('mock-error-message');
    expect(errorElement).toHaveAttribute('role', 'alert');
    expect(inputElement).toHaveClass('mock-input-error');
    expect(inputElement).toHaveAttribute('aria-invalid', 'true');
    expect(inputElement).toHaveAttribute('aria-describedby', errorElement.id);
  });

  // Test Case 4: Does not render label or error if props are not provided
  test('does not render label or error if props are not provided', () => {
    renderInput();
    expect(screen.queryByRole('textbox')).toBeInTheDocument(); // Input itself should be there
    expect(screen.queryByLabelText(/./)).not.toBeInTheDocument(); // No label
    expect(screen.queryByRole('alert')).not.toBeInTheDocument(); // No error message
  });

  // Test Case 5: Applies custom `className` to the input element
  test('applies custom className to the input element', () => {
    const customClass = 'my-custom-input-class';
    renderInput({ className: customClass });

    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveClass('mock-input-field', customClass);
  });

  // Test Case 6: Applies custom `containerClassName` to the container div
  test('applies custom containerClassName to the container div', () => {
    const customContainerClass = 'my-custom-container';
    const { container } = renderInput({ containerClassName: customContainerClass });

    const containerDiv = container.firstChild;
    expect(containerDiv).toHaveClass('mock-input-container', customContainerClass);
  });

  // Test Case 7: Uses provided `id` prop
  test('uses the provided id prop for input and label association', () => {
    const customId = 'my-custom-input-id';
    const labelText = 'Custom ID Input';
    renderInput({ id: customId, label: labelText });

    const inputElement = screen.getByRole('textbox');
    const labelElement = screen.getByText(labelText);

    expect(inputElement).toHaveAttribute('id', customId);
    expect(labelElement).toHaveAttribute('for', customId);
    expect(React.useId).not.toHaveBeenCalled(); // Should not call useId if id is provided
  });

  // Test Case 8: Generates an ID using `useId` when `id` prop is not provided
  test('generates an ID using useId when id prop is not provided', () => {
    renderInput({ label: 'Generated ID Input' });

    const inputElement = screen.getByRole('textbox');
    const labelElement = screen.getByText('Generated ID Input');

    expect(React.useId).toHaveBeenCalledTimes(1);
    expect(inputElement).toHaveAttribute('id', MOCK_USE_ID);
    expect(labelElement).toHaveAttribute('for', MOCK_USE_ID);
  });

  // Test Case 9: Handles user input and calls onChange handler
  test('handles user input and calls onChange handler', async () => {
    const handleChange = jest.fn();
    renderInput({ onChange: handleChange });

    const inputElement = screen.getByRole('textbox');
    const testValue = 'hello world';

    await userEvent.type(inputElement, testValue);

    expect(inputElement).toHaveValue(testValue);
    expect(handleChange).toHaveBeenCalledTimes(testValue.length); // Called for each character
  });

  // Test Case 10: Forwards ref to the underlying input element
  test('forwards ref to the underlying input element', () => {
    const ref = createRef<HTMLInputElement>();
    renderInput({ ref });

    const inputElement = screen.getByRole('textbox');
    expect(ref.current).toBe(inputElement);
  });

  // Test Case 11: Supports standard HTML input attributes (e.g., type, placeholder, value, disabled)
  test('supports standard HTML input attributes', () => {
    const placeholderText = 'Enter your email';
    const initialValue = 'test@example.com';
    renderInput({
      type: 'email',
      placeholder: placeholderText,
      defaultValue: initialValue,
      disabled: true,
      name: 'emailField',
    });

    const inputElement = screen.getByRole('textbox', { name: 'emailField' }); // Use name for role query if available
    expect(inputElement).toHaveAttribute('type', 'email');
    expect(inputElement).toHaveAttribute('placeholder', placeholderText);
    expect(inputElement).toHaveValue(initialValue);
    expect(inputElement).toBeDisabled();
    expect(inputElement).toHaveAttribute('name', 'emailField');
  });

  // Test Case 12: Accessibility - aria-invalid and aria-describedby are correctly set with error
  test('accessibility: aria-invalid and aria-describedby are correctly set with error', () => {
    const errorMessage = 'Invalid input';
    renderInput({ label: 'Test Input', error: errorMessage });

    const inputElement = screen.getByLabelText('Test Input');
    const errorElement = screen.getByText(errorMessage);

    expect(inputElement).toHaveAttribute('aria-invalid', 'true');
    expect(inputElement).toHaveAttribute('aria-describedby', errorElement.id);
    expect(errorElement).toHaveAttribute('id', `${inputElement.id}-error`);
  });

  // Test Case 13: Accessibility - aria-invalid is false when no error
  test('accessibility: aria-invalid is false when no error', () => {
    renderInput({ label: 'Test Input' });
    const inputElement = screen.getByLabelText('Test Input');
    expect(inputElement).toHaveAttribute('aria-invalid', 'false');
    expect(inputElement).not.toHaveAttribute('aria-describedby');
  });

  // Test Case 14: Input value can be controlled
  test('input value can be controlled', async () => {
    const handleChange = jest.fn();
    const { rerender } = render(<Input value="initial" onChange={handleChange} />);
    const inputElement = screen.getByRole('textbox');

    expect(inputElement).toHaveValue('initial');

    // Simulate typing, value should not change if not updated by parent
    await userEvent.type(inputElement, 'a');
    expect(inputElement).toHaveValue('initial'); // Value remains 'initial' because it's controlled
    expect(handleChange).toHaveBeenCalledTimes(1);

    // Rerender with new value
    rerender(<Input value="updated" onChange={handleChange} />);
    expect(inputElement).toHaveValue('updated');
  });

  // Test Case 15: Input is readOnly when readOnly prop is true
  test('input is readOnly when readOnly prop is true', async () => {
    const handleChange = jest.fn();
    renderInput({ readOnly: true, value: 'read only text', onChange: handleChange });

    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveAttribute('readonly');
    expect(inputElement).toHaveValue('read only text');

    // Attempt to type, value should not change and onChange should not be called
    await userEvent.type(inputElement, 'new text');
    expect(inputElement).toHaveValue('read only text');
    expect(handleChange).not.toHaveBeenCalled();
  });

  // Test Case 16: Input is not readOnly by default
  test('input is not readOnly by default', () => {
    renderInput();
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).not.toHaveAttribute('readonly');
  });

  // Test Case 17: Input is disabled when disabled prop is true
  test('input is disabled when disabled prop is true', async () => {
    const handleChange = jest.fn();
    renderInput({ disabled: true, value: 'disabled text', onChange: handleChange });

    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toBeDisabled();
    expect(inputElement).toHaveValue('disabled text');

    // Attempt to type, value should not change and onChange should not be called
    await userEvent.type(inputElement, 'new text');
    expect(inputElement).toHaveValue('disabled text');
    expect(handleChange).not.toHaveBeenCalled();
  });

  // Test Case 18: Input is not disabled by default
  test('input is not disabled by default', () => {
    renderInput();
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).not.toBeDisabled();
  });
});