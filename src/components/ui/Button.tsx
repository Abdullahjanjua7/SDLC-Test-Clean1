import React from 'react';
import styles from './Button.module.css';

/**
 * Defines the available visual variants for the Button component.
 * - 'primary': Solid background, prominent.
 * - 'secondary': Solid background, less prominent than primary.
 * - 'tertiary': Text-only, minimal styling.
 * - 'ghost': Outlined, transparent background.
 * - 'glass': Translucent background with glassmorphism effect.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'glass';

/**
 * Defines the available sizes for the Button component.
 * - 'small': Compact button.
 * - 'medium': Standard size button.
 * - 'large': Larger button for emphasis.
 */
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * Defines the standard HTML button types.
 */
export type ButtonType = 'button' | 'submit' | 'reset';

/**
 * Props interface for the Button component.
 * Extends standard HTML button attributes for full flexibility.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The visual style variant of the button.
   * @default 'primary'
   */
  variant?: ButtonVariant;
  /**
   * The size of the button.
   * @default 'medium'
   */
  size?: ButtonSize;
  /**
   * If true, the button will be disabled and non-interactive.
   * @default false
   */
  disabled?: boolean;
  /**
   * If true, a loading spinner will be displayed, and the button will be disabled.
   * @default false
   */
  loading?: boolean;
  /**
   * Callback function invoked when the button is clicked.
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /**
   * The content to be rendered inside the button.
   */
  children: React.ReactNode;
  /**
   * Additional CSS class names to apply to the button.
   */
  className?: string;
  /**
   * The type of the button (e.g., 'submit', 'button').
   * @default 'button'
   */
  type?: ButtonType;
  /**
   * A descriptive label for accessibility, especially useful for icon-only buttons.
   */
  'aria-label'?: string;
  /**
   * An icon or element to display to the left of the button's children.
   */
  iconLeft?: React.ReactNode;
  /**
   * An icon or element to display to the right of the button's children.
   */
  iconRight?: React.ReactNode;
  /**
   * If true, the button will take up the full width of its parent container.
   * @default false
   */
  fullWidth?: boolean;
}

/**
 * A highly reusable and aesthetically refined Button component.
 * Supports various visual styles, sizes, and states, with built-in accessibility and loading indicators.
 *
 * @param {ButtonProps} props - The properties for the Button component.
 * @returns {JSX.Element} The rendered Button component.
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  children,
  className,
  type = 'button',
  'aria-label': ariaLabel,
  iconLeft,
  iconRight,
  fullWidth = false,
  ...rest
}) => {
  // Combine CSS module classes based on props
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled, // Apply disabled styles if either disabled or loading
    loading && styles.loading, // Apply loading-specific styles
    className, // Allow external class overrides
  ]
    .filter(Boolean) // Remove any falsey values (e.g., when fullWidth is false)
    .join(' ');

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      event.preventDefault(); // Prevent click if disabled or loading
      return;
    }
    onClick?.(event); // Call the provided onClick handler
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading} // HTML disabled attribute
      aria-label={ariaLabel}
      aria-busy={loading ? 'true' : undefined} // ARIA attribute for loading state
      {...rest} // Pass any other standard HTML button attributes
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {!loading && iconLeft && <span className={styles.iconLeft}>{iconLeft}</span>}
      {!loading && <span className={styles.content}>{children}</span>}
      {!loading && iconRight && <span className={styles.iconRight}>{iconRight}</span>}
    </button>
  );
};

export default Button;