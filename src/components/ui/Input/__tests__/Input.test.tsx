import React, { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from './Input'; // Assuming the component file is Input.tsx

// Mock CSS modules to return class names as strings
// This is a common setup for Jest with CSS Modules
const mockStyles = new Proxy(
  {},
  {
    get: (target, prop) => prop,
  }
);
jest.mock('./Input.module.css', () => mockStyles);

describe('Input', () => {
  // Define a set of default props for convenience
  const defaultProps = {
    id: 'test-input',
    label: 'Test Label',
    value: 'initial value',
    onChange: jest.fn(), // Mock the onChange handler
  };

  // Clear all mock calls before each test to ensure isolation
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test Case 1: Renders with essential props (label, input, value)
  test('renders with essential props and default type "text"', () => {
    render(<Input {...defaultProps} />);

    // Check if the label is rendered and correctly associated with the input
    const labelElement = screen.getByLabelText(defaultProps.label);
    expect(labelElement).toBeInTheDocument();
    expect(labelElement).toHaveAttribute('for', defaultProps.id);
    expect(labelElement).toHaveClass('label');

    // Check if the input element is rendered
    const inputElement = screen.getByRole('textbox', { name: defaultProps.label });
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveValue(defaultProps.value);
    expect(inputElement).toHaveAttribute('id', defaultProps.id);
    expect(inputElement).toHaveAttribute('type', 'text'); // Default type
    expect(inputElement).toHaveAttribute('name', defaultProps.id); // Default name
    expect(inputElement).toHaveClass('input'); // Base class from CSS module
  });

  // Test Case 2: Handles user interaction - onChange
  test('calls onChange handler with correct event when input value changes', () => {
    render(<Input {...defaultProps} />);
    const inputElement = screen.getByRole('textbox', { name: defaultProps.label });

    const newValue = 'new value typed';
    fireEvent.change(inputElement, { target: { value: newValue } });

    // Verify that onChange was called exactly once
    expect(defaultProps.onChange).toHaveBeenCalledTimes(1);
    // Verify that onChange was called with an event object containing the new value
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: newValue }),
      })
    );
  });

  // Test Case 3: Renders with different `type` attributes
  test('renders with specified type attribute (e.g., "password")', () => {
    render(<Input {...defaultProps} type="password" />);
    const inputElement = screen.getByLabelText(defaultProps.label);
    expect(inputElement).toHaveAttribute('type', 'password');
  });

  test('handles number type correctly, including value', () => {
    render(<Input {...defaultProps} type="number" value={123} />);
    const inputElement = screen.getByLabelText(defaultProps.label);
    expect(inputElement).toHaveAttribute('type', 'number');
    expect(inputElement).toHaveValue(123); // Value should be number for type="number"
  });

  // Test Case 4: Renders with `placeholder`
  test('renders with placeholder attribute', () => {
    const placeholderText = 'Enter your name here';
    render(<Input {...defaultProps} placeholder={placeholderText} />);
    const inputElement = screen.getByPlaceholderText(placeholderText);
    expect(inputElement).toBeInTheDocument();
  });

  // Test Case 5: Renders with `name` attribute
  test('renders with custom name attribute', () => {
    const customName = 'usernameField';
    render(<Input {...defaultProps} name={customName} />);
    const inputElement = screen.getByLabelText(defaultProps.label);
    expect(inputElement).toHaveAttribute('name', customName);
  });

  test('name attribute defaults to id if not explicitly provided', () => {
    // Render without a 'name' prop
    render(<Input {...defaultProps} name={undefined} />);
    const inputElement = screen.getByLabelText(defaultProps.label);
    expect(inputElement).toHaveAttribute('name', defaultProps.id);
  });

  // Test Case 6: Handles `disabled` state
  test('renders as disabled when disabled prop is true', () => {
    render(<Input {...defaultProps} disabled />);
    const inputElement = screen.getByLabelText(defaultProps.label);
    expect(inputElement).toBeDisabled(); // RTL assertion for disabled
    expect(inputElement).toHaveClass('inputDisabled'); // Check for specific CSS class
  });

  // Test Case 7: Handles `readOnly` state
  test('renders as read-only when readOnly prop is true', () => {
    render(<Input {...defaultProps} readOnly />);
    const inputElement = screen.getByLabelText(defaultProps.label);
    expect(inputElement).toHaveAttribute('readonly');
  });

  // Test Case 8: Handles `required` state (and accessibility)
  test('renders with required attribute and indicator when required prop is true', () => {
    render(<Input {...defaultProps} required />);
    const inputElement = screen.getByLabelText(defaultProps.label);
    expect(inputElement).toHaveAttribute('required');
    // Check for the visual required indicator (*)
    const requiredIndicator = screen.getByText('*');
    expect(requiredIndicator).toBeInTheDocument();
    expect(requiredIndicator).toHaveClass('requiredIndicator');
  });

  // Test Case 9: Displays `error` message and applies accessibility attributes
  test('displays error message, applies error styling, and accessibility attributes', () => {
    const errorMessage = 'This field has an error.';
    render(<Input {...defaultProps} error={errorMessage} />);

    const inputElement = screen.getByLabelText(defaultProps.label);
    const errorElement = screen.getByText(errorMessage);

    // Check if the error message is rendered
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveClass('errorMessage');
    expect(errorElement).toHaveAttribute('id', `${defaultProps.id}-error`);
    expect(errorElement).toHaveAttribute('role', 'alert'); // Accessibility role for live regions

    // Check input element for error-related attributes and classes
    expect(inputElement).toHaveClass('inputError');
    expect(inputElement).toHaveAttribute('aria-invalid', 'true'); // Indicate invalid state
    expect(inputElement).toHaveAttribute('aria-describedby', `${defaultProps.id}-error`); // Link to error message
  });

  test('does not display error message or apply error styling when error prop is not provided', () => {
    render(<Input {...defaultProps} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument(); // No error message with role="alert"
    const inputElement = screen.getByLabelText(defaultProps.label);
    expect(inputElement).not.toHaveClass('inputError');
    expect(inputElement).not.toHaveAttribute('aria-invalid');
    expect(inputElement).not.toHaveAttribute('aria-describedby');
  });

  // Test Case 10: Renders `leadingIcon`
  test('renders leading icon when provided', () => {
    const LeadingIcon = <span data-testid="leading-icon">🔍</span>;
    render(<Input {...defaultProps} leadingIcon={LeadingIcon} />);
    expect(screen.getByTestId('leading-icon')).toBeInTheDocument();
    const inputElement = screen.getByLabelText(defaultProps.label);
    expect(inputElement).toHaveClass('inputWithLeadingIcon'); // Check for specific CSS class
  });

  // Test Case 11: Renders `trailingIcon`
  test('renders trailing icon when provided', () => {
    const TrailingIcon = <span data-testid="trailing-icon">❌</span>;
    render(<Input {...defaultProps} trailingIcon={TrailingIcon} />);
    expect(screen.getByTestId('trailing-icon')).toBeInTheDocument();
    const inputElement = screen.getByLabelText(defaultProps.label);
    expect(inputElement).toHaveClass('inputWithTrailingIcon'); // Check for specific CSS class
  });

  // Test Case 12: Applies custom `className`
  test('applies custom className to the input element', () => {
    const customClass = 'my-custom-input-style';
    render(<Input {...defaultProps} className={customClass} />);
    const inputElement = screen.getByLabelText(defaultProps.label);
    expect(inputElement).toHaveClass(customClass);
    expect(inputElement).toHaveClass('input'); // Should still retain the base input class
  });

  // Test Case 13: Forwards `ref` to the underlying input element
  test('forwards ref to the HTML input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input {...defaultProps} ref={ref} />);
    const inputElement = screen.getByLabelText(defaultProps.label);
    expect(ref.current).toBe(inputElement); // Verify ref points to the correct DOM element
  });

  // Test Case 14: Passes through additional HTML input attributes (`rest` props)
  test('passes through any additional standard HTML input attributes', () => {
    render(<Input {...defaultProps} data-test-id="custom-input-id" maxLength={20} />);
    const inputElement = screen.getByLabelText(defaultProps.label);
    expect(inputElement).toHaveAttribute('data-test-id', 'custom-input-id');
    expect(inputElement).toHaveAttribute('maxLength', '20');
  });

  // Test Case 15: Comprehensive scenario with multiple props combined
  test('renders correctly with a complex combination of props', () => {
    const complexErrorMessage = 'Invalid email format.';
    const ComplexLeadingIcon = <span data-testid="complex-leading-icon">📧</span>;
    const ComplexTrailingIcon = <span data-testid="complex-trailing-icon">✅</span>;
    const complexCustomClass = 'complex-input-styling';
    const mockComplexOnChange = jest.fn();

    render(
      <Input
        id="complex-email-input"
        label="Email Address"
        value="user@example.com"
        onChange={mockComplexOnChange}
        type="email"
        placeholder="Enter your email"
        name="email"
        disabled={false}
        readOnly={false}
        required={true}
        error={complexErrorMessage}
        leadingIcon={ComplexLeadingIcon}
        trailingIcon={ComplexTrailingIcon}
        className={complexCustomClass}
        data-qa="email-field"
        autoComplete="email"
      />
    );

    const labelElement = screen.getByLabelText('Email Address');
    expect(labelElement).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument(); // Required indicator

    const inputElement = screen.getByRole('textbox', { name: 'Email Address' });
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveValue('user@example.com');
    expect(inputElement).toHaveAttribute('id', 'complex-email-input');
    expect(inputElement).toHaveAttribute('type', 'email');
    expect(inputElement).toHaveAttribute('placeholder', 'Enter your email');
    expect(inputElement).toHaveAttribute('name', 'email');
    expect(inputElement).toHaveAttribute('required');
    expect(inputElement).not.toBeDisabled();
    expect(inputElement).not.toHaveAttribute('readonly');
    expect(inputElement).toHaveAttribute('autoComplete', 'email');
    expect(inputElement).toHaveAttribute('data-qa', 'email-field');

    // Error message and accessibility
    expect(screen.getByText(complexErrorMessage)).toBeInTheDocument();
    expect(inputElement).toHaveClass('inputError');
    expect(inputElement).toHaveAttribute('aria-invalid', 'true');
    expect(inputElement).toHaveAttribute('aria-describedby', 'complex-email-input-error');
    expect(screen.getByText(complexErrorMessage)).toHaveAttribute('role', 'alert');

    // Icons
    expect(screen.getByTestId('complex-leading-icon')).toBeInTheDocument();
    expect(screen.getByTestId('complex-trailing-icon')).toBeInTheDocument();
    expect(inputElement).toHaveClass('inputWithLeadingIcon');
    expect(inputElement).toHaveClass('inputWithTrailingIcon');

    // Custom class
    expect(inputElement).toHaveClass(complexCustomClass);
    expect(inputElement).toHaveClass('input'); // Base class still present

    // Interaction check
    fireEvent.change(inputElement, { target: { value: 'new@example.com' } });
    expect(mockComplexOnChange).toHaveBeenCalledTimes(1);
  });
});