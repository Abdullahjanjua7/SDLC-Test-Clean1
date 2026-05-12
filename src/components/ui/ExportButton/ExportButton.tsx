// src/components/ExportButton/ExportButton.tsx
import React, { ButtonHTMLAttributes } from 'react';
import styles from './ExportButton.module.css';

/**
 * Props for the ExportButton component.
 * Extends standard HTML button attributes for full compatibility.
 */
interface ExportButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The content to display inside the button. This can be text, other React nodes, etc.
   * If not provided, the button can be icon-only, but `aria-label` becomes crucial.
   */
  children?: React.ReactNode;
  /**
   * Whether the button is currently in a loading state.
   * When true, a spinner replaces the icon/text, and the button is disabled.
   * @default false
   */
  loading?: boolean;
  /**
   * An optional custom icon to display alongside the text.
   * If not provided, a default download/export SVG icon will be used.
   */
  icon?: React.ReactNode;
  /**
   * A descriptive label for accessibility, especially important for icon-only buttons
   * or when the `children` content is not sufficiently descriptive.
   * If `children` is a string, it will be used as a fallback if `aria-label` is not provided.
   * Otherwise, a default "Export data" label is used.
   */
  'aria-label'?: string;
}

/**
 * Default SVG icon for export functionality.
 * This provides a consistent visual if no custom icon is passed.
 */
const DefaultExportIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

/**
 * ExportButton component to trigger data export.
 * Features: Glassmorphism, soft shadows, rounded corners, loading state, and accessibility.
 */
const ExportButton: React.FC<ExportButtonProps> = ({
  children,
  loading = false,
  icon,
  disabled,
  'aria-label': ariaLabel,
  onClick,
  className, // Allows consumers to pass additional class names
  ...rest
}) => {
  // Determine the effective disabled state, considering both `disabled` prop and `loading` state.
  const isDisabled = disabled || loading;

  // Content to display inside the button, dynamically changing based on loading state.
  const buttonContent = (
    <>
      {loading ? (
        // Spinner for loading state, with ARIA attributes for accessibility.
        <span className={styles.spinner} role="status" aria-label="Loading data..."></span>
      ) : (
        // Render custom icon if provided, otherwise use the default export icon.
        icon || <DefaultExportIcon className={styles.icon} />
      )}
      {/* Render children (text) if provided */}
      {children && <span className={styles.text}>{children}</span>}
    </>
  );

  // Combine base styles with conditional styles for disabled and loading states.
  // `filter(Boolean)` removes any `undefined` or `null` entries from the array.
  const combinedClassName = [
    styles.button,
    isDisabled && styles.disabled,
    loading && styles.loadingState,
    className, // Append any consumer-provided class names
  ].filter(Boolean).join(' ');

  // Determine the appropriate ARIA label for accessibility.
  const effectiveAriaLabel = ariaLabel || (typeof children === 'string' ? children : 'Export data');

  return (
    <button
      type="button" // Explicitly set type to "button" to prevent accidental form submissions.
      className={combinedClassName}
      onClick={onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled} // ARIA attribute for assistive technologies.
      aria-label={effectiveAriaLabel} // Provides a descriptive label for screen readers.
      {...rest} // Pass any other standard button attributes (e.g., id, data-testid).
    >
      {buttonContent}
    </button>
  );
};

export default ExportButton;