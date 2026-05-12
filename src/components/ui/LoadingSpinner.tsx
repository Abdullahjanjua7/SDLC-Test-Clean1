// src/components/LoadingSpinner/LoadingSpinner.tsx
import React from 'react';
import styles from './LoadingSpinner.module.css';

/**
 * @interface LoadingSpinnerProps
 * Defines the props for the LoadingSpinner component.
 */
interface LoadingSpinnerProps {
  /**
   * The size of the spinner in pixels (width and height).
   * @default 48
   */
  size?: number;
  /**
   * The primary color of the spinner. This color will be used for the animating part
   * and a lighter shade for the background track.
   * Accepts any valid CSS color string (e.g., '#6366F1', 'rgb(99, 102, 241)', 'blue').
   * @default '#6366F1' (Indigo 500)
   */
  color?: string;
  /**
   * Optional CSS class name to apply to the spinner's outer container.
   * Useful for external layout or positioning.
   */
  className?: string;
}

/**
 * Helper function to convert a hex color string to an RGB object.
 * Used for calculating a lighter RGBA background color for the spinner track.
 * @param hex The hex color string (e.g., '#RRGGBB' or '#RGB').
 * @returns An object with r, g, b properties, or null if the hex is invalid.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * LoadingSpinner Component
 *
 * An animated loading spinner designed for indicating data fetching or processing states.
 * It features a clean, modern aesthetic with smooth animation, customizable size and color,
 * and built-in accessibility features.
 *
 * @param {LoadingSpinnerProps} props - The props for the component.
 * @returns {JSX.Element} A React functional component.
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 48, // Default size in pixels
  color = '#6366F1', // Default color: Indigo 500
  className,
}) => {
  // Calculate a lighter background color for the spinner track
  // This creates a nice contrast with the main spinner color.
  const rgbColor = hexToRgb(color);
  const spinnerBorderColor = rgbColor
    ? `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.2)` // 20% opacity of the main color
    : 'rgba(0, 0, 0, 0.1)'; // Fallback to a light grey if color conversion fails

  // Inline styles for dynamic properties like size and CSS variables
  const spinnerStyle: React.CSSProperties = {
    width: size,
    height: size,
    // Define CSS variables to be consumed by the CSS Module
    '--spinner-color': color,
    '--spinner-border-color': spinnerBorderColor,
  } as React.CSSProperties; // Type assertion for custom CSS properties

  return (
    <div
      className={`${styles.spinnerContainer} ${className || ''}`}
      role="status" // Indicates that this element is a live region whose content is advisory information
      aria-live="polite" // Screen readers should announce changes to this region when convenient
      aria-label="Loading" // Provides an accessible name for the spinner
    >
      <div className={styles.spinner} style={spinnerStyle}>
        {/* Visually hidden text for screen readers that might not fully interpret aria-label on a non-interactive element */}
        <span className={styles.visuallyHidden}>Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;