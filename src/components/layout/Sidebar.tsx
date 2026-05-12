// src/components/Sidebar/Sidebar.tsx
import React from 'react';
import styles from './Sidebar.module.css';

// 1. TypeScript Interfaces for strict typing
/**
 * Defines the structure for a navigation link within the sidebar.
 */
export interface NavLink {
  href: string;
  label: string;
  icon?: React.ReactNode; // Optional icon, can be an SVG, FontAwesome icon, etc.
  isActive?: boolean; // Indicates if this link is currently active/selected
}

/**
 * Props for the Sidebar component.
 */
export interface SidebarProps {
  isOpen: boolean; // Controls the visibility of the sidebar (e.g., for mobile or collapsible views)
  onClose?: () => void; // Optional callback function to close the sidebar (e.g., when clicking an overlay)
  links: NavLink[]; // Array of navigation links to display
  brandName: string; // The name of the brand or application
  brandLogoSrc?: string; // Optional URL for a brand logo image
  className?: string; // Optional className for external styling overrides on the main container
}

/**
 * A responsive navigation sidebar component with branding, links, and premium UI aesthetics.
 *
 * Features:
 * - Glassmorphism effect (backdrop-filter blur)
 * - Soft surface elevation (box-shadow)
 * - Rounded corners
 * - TypeScript for strict type checking
 * - CSS Modules for scoped styling
 * - Accessibility (ARIA labels, semantic HTML)
 * - Collapsible/toggleable via `isOpen` prop
 */
const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  links,
  brandName,
  brandLogoSrc,
  className,
}) => {
  // Combine external className with module styles for the main container
  const sidebarClasses = [
    styles.sidebar,
    isOpen ? styles.sidebarOpen : styles.sidebarClosed,
    className,
  ].filter(Boolean).join(' ');

  return (
    <>
      {/* Overlay for when the sidebar is open, primarily for mobile or collapsible views.
          It captures clicks outside the sidebar to close it. */}
      {isOpen && onClose && (
        <div
          className={styles.overlay}
          onClick={onClose}
          aria-hidden="true" // Hide from accessibility tree as it's a visual/interactive helper
        />
      )}

      <aside
        className={sidebarClasses}
        aria-label="Main navigation sidebar"
        aria-hidden={!isOpen} // Hide content from screen readers when sidebar is closed
      >
        {/* Branding Section */}
        <div className={styles.brand}>
          {brandLogoSrc && (
            <img src={brandLogoSrc} alt={`${brandName} Logo`} className={styles.brandLogo} />
          )}
          <h1 className={styles.brandName}>{brandName}</h1>
        </div>

        {/* Navigation Section */}
        <nav className={styles.nav} aria-label="Primary navigation">
          <ul className={styles.navList}>
            {links.map((link, index) => (
              <li key={index} className={styles.navItem}>
                <a
                  href={link.href}
                  className={`${styles.navLink} ${link.isActive ? styles.navLinkActive : ''}`}
                  aria-current={link.isActive ? 'page' : undefined} // Indicate current page for accessibility
                >
                  {link.icon && <span className={styles.navLinkIcon}>{link.icon}</span>}
                  <span className={styles.navLinkText}>{link.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Optional Footer Section */}
        <div className={styles.sidebarFooter}>
          <p className={styles.footerText}>© {new Date().getFullYear()} {brandName}</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;