// src/components/LoadingSpinner/LoadingSpinner.tsx
import React from 'react';
import styles from './LoadingSpinner.module.css';

/**
 * Props for the LoadingSpinner component.
 * Currently, no specific props are defined as per specification,
 * but this interface serves as a placeholder for future extensions
 * (e.g., size, color, variant).
 */
interface LoadingSpinnerProps {}

/**
 * An animated loading spinner component designed for visual excellence and accessibility.
 * It provides a clear visual indication of ongoing processes.
 *
 * @component
 * @param {LoadingSpinnerProps} props - The props for the component.
 * @returns {JSX.Element} The rendered loading spinner.
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = () => {
  return (
    <div
      className={styles.spinnerContainer}
      role="status"
      aria-live="polite"
      aria-label="Loading content..."
    >
      <div className={styles.spinner}></div>
    </div>
  );
};

export default LoadingSpinner;