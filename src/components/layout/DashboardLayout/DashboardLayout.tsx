import React from 'react';
import styles from './DashboardLayout.module.css';

/**
 * @interface DashboardLayoutProps
 * @description Defines the props for the DashboardLayout component.
 * @property {React.ReactNode} sidebar - The content to be rendered in the sidebar area.
 * @property {React.ReactNode} topbar - The content to be rendered in the top bar area.
 * @property {React.ReactNode} children - The main content to be rendered in the central content area.
 * @property {string} [className] - Optional CSS class for custom styling of the main container.
 */
interface DashboardLayoutProps {
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * @function DashboardLayout
 * @description A high-quality React component that provides a responsive and aesthetically pleasing
 *              dashboard layout using CSS Grid. It integrates a topbar, sidebar, and a main content area.
 *              Features include glassmorphism effects, soft shadows, and rounded corners for a modern UI.
 *
 * @param {DashboardLayoutProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered dashboard layout.
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  sidebar,
  topbar,
  children,
  className,
}) => {
  return (
    <div
      className={`${styles.layoutContainer} ${className || ''}`}
      role="region"
      aria-label="Dashboard Layout"
    >
      {/* Topbar Section */}
      <header
        className={styles.topbar}
        role="banner"
        aria-label="Dashboard Top Navigation"
      >
        {topbar}
      </header>

      {/* Sidebar Section */}
      <aside
        className={styles.sidebar}
        role="navigation"
        aria-label="Dashboard Sidebar Navigation"
      >
        {sidebar}
      </aside>

      {/* Main Content Section */}
      <main
        className={styles.mainContent}
        role="main"
        aria-label="Dashboard Main Content Area"
      >
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;