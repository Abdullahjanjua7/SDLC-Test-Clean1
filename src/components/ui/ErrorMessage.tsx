import React from 'react';
import styles from './ErrorMessage.module.css';

/**
 * Props for the ErrorMessage component.
 */
interface ErrorMessageProps {
  /**
   * The error message string to be displayed.
   * This prop is mandatory.
   */
  message: string;
  /**
   * Optional unique identifier for the component's root element.
   */
  id?: string;
  /**
   * Optional additional CSS class names to apply to the root element.
   * Useful for external styling or utility classes.
   */
  className?: string;
}

/**
 * ErrorMessage Component
 *
 * A gracefully styled and accessible component for displaying error messages.
 * It features a clear visual design with an icon, rounded corners, and a soft shadow.
 *
 * @param {ErrorMessageProps} props - The properties for the component.
 * @returns {JSX.Element | null} The rendered error message component, or null if no message is provided.
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, id, className }) => {
  // If no message is provided, render nothing to avoid empty error containers.
  // This assumes 'message' is always intended to be present when the component is rendered.
  if (!message) {
    return null;
  }

  return (
    <div
      id={id}
      // Combine CSS module classes with any external class names provided
      className={`${styles.errorMessageContainer} ${className || ''}`}
      role="alert" // ARIA role to announce the element as an alert
      aria-live="assertive" // Ensures screen readers announce changes immediately
      aria-atomic="true" // Ensures the entire content of the alert is announced
    >
      {/* SVG Icon for visual emphasis. aria-hidden="true" makes it decorative for screen readers. */}
      <svg
        className={styles.errorIcon}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
      {/* Paragraph for the actual error message text */}
      <p className={styles.errorMessageText}>{message}</p>
    </div>
  );
};

export default ErrorMessage;