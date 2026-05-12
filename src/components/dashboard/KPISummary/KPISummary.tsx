import React from 'react';
import styles from './KPISummary.module.css';

/**
 * @interface KPISummaryProps
 * @description Defines the props for the KPISummary component.
 * As a container, it primarily accepts children to render the MetricCards within it.
 */
interface KPISummaryProps {
  /**
   * The child elements to be rendered within the KPISummary container.
   * Typically, these would be `MetricCard` components or similar KPI display elements.
   */
  children: React.ReactNode;
}

/**
 * @component KPISummary
 * @description A premium container component designed to display a collection of Key Performance Indicator (KPI) cards.
 * It applies a sophisticated glassmorphism effect, soft elevation, and rounded corners for an elite UI experience.
 *
 * @param {KPISummaryProps} props - The properties for the component.
 * @returns {JSX.Element} A section element acting as a visually enhanced container for KPI cards.
 */
const KPISummary: React.FC<KPISummaryProps> = ({ children }) => {
  return (
    <section
      className={styles.kpiSummaryContainer}
      aria-label="Key Performance Indicators Summary"
      role="region" // Explicitly define role for better screen reader context
    >
      <div className={styles.kpiCardsWrapper}>
        {children}
      </div>
    </section>
  );
};

export default KPISummary;