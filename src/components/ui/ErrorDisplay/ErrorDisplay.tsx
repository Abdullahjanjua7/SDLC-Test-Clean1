// src/components/ErrorDisplay/ErrorDisplay.tsx
import React from 'react';
import styles from './ErrorDisplay.module.css';

/**
 * Props for the ErrorDisplay component.
 */
interface ErrorDisplayProps {
  /**
   * The main error message to be displayed. This is typically a user-friendly summary.
   */
  message: string;
  /**
   * Optional detailed information about the error, such as a stack trace or specific error codes.
   * This content will be displayed within an expandable <details> element.
   */
  details?: string;
  /**
   * Optional callback function to be invoked when the user dismisses the error.
   * If provided, a close button will be rendered.
   */
  onClose?: () => void;
  /**
   * Optional unique identifier for the error, useful for logging or support.
   * This will be displayed subtly within the details section if provided.
   */
  errorId?: string;
}

/**
 * A premium, accessible React component for displaying error messages gracefully.
 * It features glassmorphism aesthetics, rounded corners, soft elevation, and strict TypeScript typing.
 *
 * @param {ErrorDisplayProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered ErrorDisplay component.
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  details,
  onClose,
  errorId,
}) => {
  const messageId = React.useId(); // Unique ID for aria-labelledby
  const detailsId = React.useId(); // Unique ID for aria-describedby

  return (
    <div
      className={styles.errorContainer}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      aria-labelledby={messageId}
      {...(details ? { 'aria-describedby': detailsId } : {})}
    >
      <div className={styles.contentWrapper}>
        {/* Error Icon */}
        <div className={styles.iconWrapper} aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={styles.errorIcon}
          >
            <path
              fillRule="evenodd"
              d="M9.401 3.003c1.155-2.056 3.867-2.056 5.022 0L22.94 17.136c1.159 2.061-.436 4.664-2.717 4.664H3.777c-2.281 0-3.876-2.603-2.718-4.664L9.401 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Message and Details */}
        <div className={styles.messageWrapper}>
          <p id={messageId} className={styles.message}>
            {message}
          </p>
          {details && (
            <details className={styles.detailsContainer}>
              <summary className={styles.detailsSummary}>
                Show Details
                <span className={styles.detailsToggleIcon} aria-hidden="true">
                  ▼
                </span>
              </summary>
              <div id={detailsId} className={styles.detailsContent}>
                <pre className={styles.detailsPre}>{details}</pre>
                {errorId && (
                  <p className={styles.errorId}>Error ID: {errorId}</p>
                )}
              </div>
            </details>
          )}
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close error message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={styles.closeIcon}
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;