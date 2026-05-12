import React from 'react';
import styles from './MetricCard.module.css';

// --- Interfaces ---

/**
 * Defines the properties for the MetricCard component.
 */
interface MetricCardProps {
  /**
   * The main label for the metric (e.g., "Total Sales", "New Users").
   */
  label: string;
  /**
   * The primary value of the metric. Can be a number or a formatted string.
   */
  value: string | number;
  /**
   * An optional unit to display alongside the value (e.g., "%", "$").
   */
  unit?: string;
  /**
   * The numerical value representing the trend (e.g., 5.2 for 5.2% change).
   * A positive number indicates an increase, a negative number a decrease.
   */
  trendValue?: number;
  /**
   * The type of trend, influencing its visual representation (color, icon).
   * 'positive' for improvement, 'negative' for decline, 'neutral' for no significant change.
   */
  trendType?: 'positive' | 'negative' | 'neutral';
  /**
   * An optional descriptive label for the trend (e.g., "vs last month").
   */
  trendLabel?: string;
  /**
   * An optional React node to display as an icon next to the label or value.
   */
  icon?: React.ReactNode;
  /**
   * If true, the card will display a loading state.
   */
  isLoading?: boolean;
  /**
   * An optional ARIA label for the card, enhancing accessibility.
   */
  ariaLabel?: string;
}

// --- Component ---

/**
 * MetricCard Component
 *
 * Displays a single Key Performance Indicator (KPI) with its value, label,
 * and an optional trend indicator. Features glassmorphism aesthetics,
 * soft shadows, rounded corners, and full TypeScript support.
 *
 * @param {MetricCardProps} props - The properties for the component.
 * @returns {JSX.Element} A React functional component.
 */
const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  trendValue,
  trendType,
  trendLabel,
  icon,
  isLoading = false,
  ariaLabel,
}) => {
  const trendClass = trendType ? styles[trendType] : styles.neutral;
  const trendArrow = trendValue !== undefined ? (
    trendValue > 0 ? '↑' : (trendValue < 0 ? '↓' : '—')
  ) : '';

  const formattedTrendValue = trendValue !== undefined ? `${Math.abs(trendValue).toFixed(1)}%` : '';

  const cardAriaLabel = ariaLabel || `${label} metric card. Current value: ${value}${unit || ''}. ${
    trendValue !== undefined ? `Trend: ${trendValue > 0 ? 'up' : (trendValue < 0 ? 'down' : 'no change')} by ${formattedTrendValue}. ${trendLabel || ''}` : ''
  }`;

  return (
    <article className={styles.metricCard} aria-label={cardAriaLabel}>
      {isLoading ? (
        <div className={styles.loadingState} role="status" aria-live="polite">
          <div className={styles.loadingSpinner}></div>
          <span className={styles.loadingText}>Loading metric...</span>
        </div>
      ) : (
        <>
          <div className={styles.header}>
            {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
            <h3 className={styles.label}>{label}</h3>
          </div>
          <div className={styles.valueContainer}>
            <span className={styles.value}>{value}</span>
            {unit && <span className={styles.unit}>{unit}</span>}
          </div>

          {trendValue !== undefined && (
            <div className={`${styles.trendContainer} ${trendClass}`}>
              <span className={styles.trendArrow} aria-hidden="true">{trendArrow}</span>
              <span className={styles.trendValue}>{formattedTrendValue}</span>
              {trendLabel && <span className={styles.trendLabel}>{trendLabel}</span>}
            </div>
          )}
        </>
      )}
    </article>
  );
};

export default MetricCard;