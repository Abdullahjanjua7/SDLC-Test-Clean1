import React from 'react';
import styles from './Navbar.module.css';

/**
 * Props for the Navbar component.
 */
interface NavbarProps {
  /**
   * Content to be displayed on the left side of the Navbar, typically for branding or a logo.
   * This slot is designed to hold elements like a company logo, site title, or a menu toggle.
   */
  brandContent?: React.ReactNode;
  /**
   * Main content for the Navbar, typically navigation links or central information.
   * This slot expands to fill the available space between the brand and action sections.
   */
  children?: React.ReactNode;
  /**
   * Content to be displayed on the right side of the Navbar, typically for user actions or utilities.
   * This slot is ideal for user avatars, notification icons, search bars, or global action buttons.
   */
  actionContent?: React.ReactNode;
  /**
   * An optional ARIA label for the navigation landmark.
   * Defaults to "Global navigation" for improved accessibility.
   */
  ariaLabel?: string;
}

/**
 * Navbar Component
 *
 * A top utility bar designed for global actions, user information, and branding.
 * It features a glassmorphism aesthetic with soft elevation and rounded bottom corners,
 * providing a modern and elegant look.
 *
 * The component is structured with three flexible content slots:
 * - `brandContent`: For branding elements on the left.
 * - `children`: For main navigation or central content.
 * - `actionContent`: For user-specific actions or utilities on the right.
 *
 * @param {NavbarProps} props - The properties for the Navbar component.
 * @returns {JSX.Element} The rendered Navbar component.
 */
const Navbar: React.FC<NavbarProps> = ({
  brandContent,
  children,
  actionContent,
  ariaLabel = 'Global navigation',
}) => {
  return (
    <nav className={styles.navbar} aria-label={ariaLabel}>
      <div className={styles.brandSection}>
        {brandContent}
      </div>
      <div className={styles.mainContent}>
        {children}
      </div>
      <div className={styles.actionSection}>
        {actionContent}
      </div>
    </nav>
  );
};

export default Navbar;