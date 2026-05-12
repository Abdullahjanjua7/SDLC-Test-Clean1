import React from 'react';
import styles from './DashboardShell.module.css';

/**
 * @interface DashboardShellProps
 * @description Defines the props for the DashboardShell component.
 */
interface DashboardShellProps {
  /**
   * The content to be rendered within the main dashboard area.
   * This typically includes pages, widgets, or other components.
   */
  children: React.ReactNode;
}

/**
 * @component DashboardShell
 * @description
 * Main layout wrapper component for a dashboard application.
 * It integrates a top navigation bar (Navbar), a left-hand sidebar,
 * and a primary content area using CSS Grid.
 *
 * Features:
 * - CSS Grid for responsive and robust layout.
 * - Glassmorphism effect for Navbar and Sidebar using `backdrop-filter`.
 * - Soft shadows and rounded corners for a modern, elevated UI.
 * - Semantic HTML5 elements and ARIA attributes for enhanced accessibility.
 * - CSS Modules for scoped and maintainable styling.
 *
 * @param {DashboardShellProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered dashboard shell layout.
 */
const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  return (
    <div className={styles.shellContainer} role="grid" aria-label="Dashboard layout container">
      {/* Navbar Area */}
      <header className={styles.navbar} role="banner" aria-label="Dashboard navigation header">
        <h1 className={styles.navbarTitle}>Dashboard</h1>
        <div className={styles.navbarActions}>
          {/* Placeholder for user profile, notifications, etc. */}
          <button aria-label="User profile settings" className={styles.navbarActionButton}>
            User Profile
          </button>
        </div>
      </header>

      {/* Sidebar Area */}
      <aside className={styles.sidebar} role="navigation" aria-label="Main sidebar navigation">
        <nav>
          <ul className={styles.sidebarNavList}>
            <li>
              <a href="#" className={`${styles.sidebarNavItem} ${styles.sidebarNavItemActive}`} aria-current="page">
                Overview
              </a>
            </li>
            <li>
              <a href="#" className={styles.sidebarNavItem}>
                Analytics
              </a>
            </li>
            <li>
              <a href="#" className={styles.sidebarNavItem}>
                Reports
              </a>
            </li>
            <li>
              <a href="#" className={styles.sidebarNavItem}>
                Settings
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent} role="main" aria-label="Main content area">
        {children}
      </main>
    </div>
  );
};

export default DashboardShell;