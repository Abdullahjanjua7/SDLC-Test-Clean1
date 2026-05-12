import React, { InputHTMLAttributes, forwardRef } from 'react';
import styles from './Input.module.css';

/**
 * @interface InputProps
 * @extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>
 *
 * Defines the props for the Input component.
 * Omits 'value' and 'onChange' from standard HTML input attributes to redefine them
 * with stricter types for controlled component usage.
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  /**
   * Unique identifier for the input. Essential for accessibility (linking label).
   */
  id: string;
  /**
   * The label text displayed above the input field. Essential for accessibility.
   */
  label: string;
  /**
   * The current value of the input field (for controlled components).
   */
  value: string | number;
  /**
   * Callback function triggered when the input value changes.
   * @param event The change event from the HTML input element.
   */
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Optional error message to display below the input.
   * Triggers error styling and ARIA attributes when present.
   */
  error?: string;
  /**
   * Optional React node to display as a leading icon inside the input field.
   */
  leadingIcon?: React.ReactNode;
  /**
   * Optional React node to display as a trailing icon inside the input field.
   */
  trailingIcon?: React.ReactNode;
  /**
   * Optional class name to apply to the input element for external styling overrides.
   */
  className?: string;
}

/**
 * Input Component
 *
 * A reusable, accessible, and visually enhanced input field component.
 * It supports various HTML input types, controlled component patterns,
 * error handling, and optional icon adornments.
 *
 * @param {InputProps} props - The props for the Input component.
 * @param {React.Ref<HTMLInputElement>} ref - Ref to the underlying HTMLInputElement.
 * @returns {JSX.Element} The rendered Input component.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      type = 'text',
      value,
      onChange,
      placeholder,
      name,
      disabled = false,
      readOnly = false,
      required = false,
      error,
      leadingIcon,
      trailingIcon,
      className, // Custom class for the input element itself
      ...rest // Captures any other standard HTML input attributes
    },
    ref
  ) => {
    const hasError = !!error;

    // Dynamically compose CSS classes for the input element
    const inputClasses = [
      styles.input,
      hasError && styles.inputError,
      disabled && styles.inputDisabled,
      leadingIcon && styles.inputWithLeadingIcon,
      trailingIcon && styles.inputWithTrailingIcon,
      className, // Allow external class overrides
    ].filter(Boolean).join(' ');

    return (
      <div className={styles.inputGroup}>
        {label && (
          <label htmlFor={id} className={styles.label}>
            {label}
            {required && <span className={styles.requiredIndicator}>*</span>}
          </label>
        )}
        <div className={styles.inputWrapper}>
          {leadingIcon && <div className={styles.leadingIcon}>{leadingIcon}</div>}
          <input
            ref={ref}
            id={id}
            name={name || id} // Fallback to id if name is not provided for form submission
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            aria-describedby={hasError ? `${id}-error` : undefined} // Link error message for screen readers
            aria-invalid={hasError} // Indicate invalid state for accessibility
            className={inputClasses}
            {...rest} // Spread any other standard HTML input attributes
          />
          {trailingIcon && <div className={styles.trailingIcon}>{trailingIcon}</div>}
        </div>
        {hasError && (
          <p id={`${id}-error`} role="alert" className={styles.errorMessage}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;