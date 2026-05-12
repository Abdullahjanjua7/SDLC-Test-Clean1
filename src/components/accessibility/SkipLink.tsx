import React from 'react';
import styles from './SkipLink.module.css';

/**
 * @interface SkipLinkProps
 * Defines the props for the SkipLink component.
 */
interface SkipLinkProps {
  /**
   * The href attribute for the skip link, typically pointing to the ID of the main content area (e.g., "#main-content").
   */
  href: string;
  /**
   * The content of the skip link, usually descriptive text like "Skip to main content".
   */
  children: React.ReactNode;
  /**
   * Optional CSS class name to apply additional styling to the skip link.
   */
  className?: string;
}

/**
 * SkipLink Component
 *
 * An accessibility component that provides a mechanism for keyboard and screen reader users
 * to bypass repetitive navigation and jump directly to the main content of a page.
 * It is visually hidden until focused, then appears with a clear, styled presentation.
 *
 * Adheres to premium UI guidelines:
 * - Uses CSS Modules for isolated and maintainable styling.
 * - Features rounded corners and soft elevation when visible.
 * - Strictly typed with TypeScript for robust development.
 * - Employs semantic HTML (`<a>`) and standard accessibility patterns (visually hidden until focus).
 *
 * @param {SkipLinkProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered SkipLink component.
 */
export const SkipLink: React.FC<SkipLinkProps> = ({ href, children, className }) => {
  return (
    <a
      href={href}
      className={`${styles.skipLink} ${className || ''}`}
      // A common practice is to add role="link" for clarity, though <a> is semantic.
      // For a skip link, its purpose is usually clear from context and text.
      // aria-label could be used if `children` is not descriptive enough, but here it should be.
    >
      {children}
    </a>
  );
};

// Default export for convenience
export default SkipLink;