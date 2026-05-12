/**
 * @file Global theme variables and design tokens for the application.
 * This file defines a comprehensive set of design tokens including colors,
 * typography, spacing, shadows, and breakpoints to ensure a consistent
 * look and feel across the application.
 *
 * Best practices followed:
 * - Use of TypeScript interfaces for strong type checking.
 * - Semantic naming for design tokens.
 * - Consistent unit usage (rem for spacing and font sizes, px for breakpoints).
 * - Grouping related tokens into logical objects.
 * - Extensive comments for clarity and documentation.
 *
 * Error Handling:
 * For a static configuration file, traditional error handling (e.g., try-catch)
 * is not applicable. "Errors" are primarily addressed through:
 * - TypeScript's static analysis: Ensures all defined tokens conform to their
 *   respective types and interfaces, catching typos or missing properties at compile time.
 * - Semantic naming and clear documentation: Reduces misinterpretation and misuse of tokens.
 * - Valid CSS values: All token values are defined as valid CSS strings or numbers,
 *   preventing runtime CSS parsing errors.
 */

// --- Interfaces for Type Safety ---

/**
 * Defines the structure for a color palette, including main, light, dark,
 * and contrast text variants.
 */
interface ColorPalette {
  main: string;
  light: string;
  dark: string;
  contrastText: string;
}

/**
 * Defines the structure for neutral colors, typically shades of grey, black, and white.
 */
interface NeutralColors {
  white: string;
  black: string;
  grey100: string;
  grey200: string;
  grey300: string;
  grey400: string;
  grey500: string;
  grey600: string;
  grey700: string;
  grey800: string;
  grey900: string;
}

/**
 * Defines the complete color system for the application.
 */
interface Colors {
  primary: ColorPalette;
  secondary: ColorPalette;
  neutral: NeutralColors;
  success: ColorPalette;
  error: ColorPalette;
  warning: ColorPalette;
  info: ColorPalette;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  background: {
    default: string;
    paper: string;
  };
  divider: string;
}

/**
 * Defines typography settings including font families, sizes, weights, and line heights.
 */
interface Typography {
  fontFamily: {
    primary: string;
    secondary: string;
  };
  fontSizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
  };
  fontWeights: {
    thin: number;
    extralight: number;
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
    black: number;
  };
  lineHeights: {
    none: number;
    tight: number;
    snug: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
}

/**
 * Defines spacing values, typically based on a consistent grid (e.g., 4px or 8px).
 * Keys are string representations of numbers (e.g., '0.5', '1', '2') mapping to rem values.
 */
interface Spacing {
  [key: string]: string;
}

/**
 * Defines border-radius values.
 */
interface BorderRadius {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

/**
 * Defines box-shadow values.
 */
interface Shadows {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

/**
 * Defines z-index values for layering elements.
 */
interface ZIndex {
  auto: 'auto';
  base: number;
  dropdown: number;
  sticky: number;
  fixed: number;
  modalBackdrop: number;
  modal: number;
  popover: number;
  tooltip: number;
  snackbar: number;
  overlay: number;
}

/**
 * Defines breakpoints for responsive design.
 * Values are min-width for a mobile-first approach.
 */
interface Breakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;