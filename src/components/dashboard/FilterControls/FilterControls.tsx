// src/components/FilterControls/FilterControls.tsx
import React from 'react';
import styles from './FilterControls.module.css';

/**
 * Props for the FilterControls component.
 */
interface FilterControlsProps {
  /**
   * The content to be rendered inside the filter controls container.
   * This typically includes individual filter components (e.g., DatePicker, CategorySelect).
   */
  children?: React.ReactNode;
  /**
   * An optional title for the filter controls section.
   * This will be rendered as an h2 and used for accessibility (aria-labelledby).
   */
  title?: string;
  /**
   * An optional, additional CSS class name to apply to the root element.
   * Useful for external styling overrides or composition.
   */
  className?: string;
}

/**
 * FilterControls component: A sophisticated container for various dashboard filters.
 * It provides a premium glassmorphism aesthetic with soft elevations and rounded corners,
 * and ensures accessibility through semantic HTML and ARIA attributes.
 *
 * @param {FilterControlsProps} props - The properties for the component.
 * @returns {React.FC<FilterControlsProps>} A React functional component.
 */
const FilterControls: React.FC<FilterControlsProps> = ({ children, title, className }) => {
  // Generate a unique ID for the title if provided, for aria-labelledby association.
  // In a real-world app, consider using a more robust ID generation strategy (e.g., React's useId hook for React 18+).
  const titleId = title ? `filter-controls-title-${Math.random().toString(36).substring(2, 11)}` : undefined;

  return (
    <section
      className={`${styles.filterControlsContainer} ${className || ''}`.trim()}
      aria-labelledby={titleId}
      aria-label={!title ? "Dashboard Filter Controls" : undefined}
      role="group" // Explicitly define this as a group of related controls for assistive technologies.
    >
      {title && (
        <h2 id={titleId} className={styles.filterControlsTitle}>
          {title}
        </h2>
      )}
      <div className={styles.filterControlsContent}>
        {children}
      </div>
    </section>
  );
};

export default FilterControls;