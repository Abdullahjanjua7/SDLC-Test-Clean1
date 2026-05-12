import React, { InputHTMLAttributes, forwardRef, useId } from 'react';
import styles from './Input.module.css';

/**
 * @interface InputProps
 * @extends InputHTMLAttributes<HTMLInputElement>
 * @description Defines the props for the Input component.
 * It extends standard HTML input attributes for full flexibility.
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * The label text for the input field.
   * This is crucial for accessibility and user guidance.
   */
  label?: string;
  /**
   * An error message to display below the input.
   * When provided, the input will adopt an error visual state.
   */
  error?: string;
  /**
   * Optional class name for the input container.
   */
  containerClassName?: string;
}

/**
 * @component Input
 * @description A styled and accessible input field component.
 * It supports standard HTML input attributes, a label, and an error message.
 * Utilizes CSS Modules for styling and `forwardRef` for ref management.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, containerClassName, id, ...rest }, ref) => {
    // Generate a unique ID if not provided, for accessibility (label-input association)
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className={`${styles.inputContainer} ${containerClassName || ''}`}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`${styles.inputField} ${error ? styles.inputError : ''} ${className || ''}`}
          aria-invalid={!!error}
          aria-describedby={errorId}
          {...rest}
        />
        {error && (
          <p id={errorId} className={styles.errorMessage} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input'; // For better debugging in React DevTools