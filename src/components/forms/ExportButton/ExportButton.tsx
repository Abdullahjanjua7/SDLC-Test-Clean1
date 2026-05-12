// src/components/ExportButton/ExportButton.tsx
import React from 'react';
import styles from './ExportButton.module.css';

/**
 * Props for the ExportButton component.
 * Extends standard HTML button attributes for full flexibility.
 */
interface ExportButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Callback function to be executed when the button is clicked.
   * This is a required prop for the button's functionality.
   */
  onClick: () => void;
  /**
   * If true, the button will display a loading spinner and be disabled.
   * This provides visual feedback for asynchronous export operations.
   * @default false
   */
  loading?: boolean;
  /**
   * The content to display inside the button.
   * If not provided, the button will default to displaying "Export".
   */
  children?: React.ReactNode;
  /**
   * Additional CSS class names to apply to the button for custom styling.
   */
  className?: string;
}

/**
 * A premium React button component designed to trigger data export functionality.
 * It features soft surface elevations, rounded corners, smooth transitions,
 * and a clear loading state with a spinner.
 *
 * @component
 * @example
 * <ExportButton onClick={() => console.log('Export initiated!')}>
 *   Download Report
 * </ExportButton>
 *
 * @example
 * <ExportButton onClick={handleExport} loading={isExporting} disabled={!hasData}>
 *   Export Data
 * </ExportButton>
 */
const ExportButton: React.FC<ExportButtonProps> = ({
  onClick,
  loading = false,
  disabled: propDisabled = false, // Rename to avoid conflict with internal `isDisabled`
  children,
  className,
  ...rest // Capture any other standard button attributes
}) => {
  // Determine the effective disabled state
  const isDisabled = propDisabled || loading;

  return (
    <button
      type="button" // Explicitly set type to "button" to prevent accidental form submission
      className={`${styles.button} ${isDisabled ? styles.disabled : ''} ${className || ''}`}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={loading ? "Exporting data, please wait" : "Export data"}
      aria-busy={loading} // Indicate to screen readers that an operation is in progress
      {...rest} // Spread any additional button attributes
    >
      {loading ? (
        // Display spinner when loading
        <span className={styles.spinner} role="status" aria-label="Loading"></span>
      ) : (
        <>
          {/* Export Icon (SVG for crispness and easy styling) */}
          <svg
            className={styles.icon}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true" // Icon is decorative, text provides primary label
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          {/* Button label, defaults to "Export" */}
          <span className={styles.label}>
            {children || 'Export'}
          </span>
        </>
      )}
    </button>
  );
};

export default ExportButton;