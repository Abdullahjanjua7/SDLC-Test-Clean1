import { theme } from './theme'; // Assuming the theme object is exported from 'theme.ts'

// Helper regex for validating CSS units and formats
const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const RGBA_COLOR_REGEX = /^rgba\(\d{1,3},\s*\d{1,3},\s*\d{1,3},\s*(0?\.\d+|1)\)$/;
const REM_UNIT_REGEX = /^\d+(\.\d+)?rem$/;
const PX_UNIT_REGEX = /^\d+px$/;
const SHADOW_REGEX = /^(none|(-?\d+(\.\d+)?(px|rem)\s+){2,4}rgba\(\d{1,3},\s*\d{1,3},\s*\d{1,3},\s*(0?\.\d+|1)\)(,\s*(-?\d+(\.\d+)?(px|rem)\s+){2,4}rgba\(\d{1,3},\s*\d{1,3},\s*\d{1,3},\s*(0?\.\d+|1)\))*)$/;


describe('Theme Design Tokens', () => {
  // Snapshot test for the entire theme object to catch any unintended changes
  it('should have a consistent structure and values (snapshot test)', () => {
    expect(theme).toMatchSnapshot();
  });

  describe('Colors', () => {
    it('should define primary color palette with valid hex codes', () => {
      expect(theme.colors.primary.main).toMatch(HEX_COLOR_REGEX);
      expect(theme.colors.primary.light).toMatch(HEX_COLOR_REGEX);
      expect(theme.colors.primary.dark).toMatch(HEX_COLOR_REGEX);
      expect(theme.colors.primary.contrastText).toMatch(HEX_COLOR_REGEX);
    });

    it('should define neutral colors with valid hex codes', () => {
      Object.values(theme.colors.neutral).forEach(color => {
        expect(color).toMatch(HEX_COLOR_REGEX);
      });
    });

    it('should define success, error, warning, info color palettes with valid hex codes', () => {
      ['success', 'error', 'warning', 'info'].forEach(paletteKey => {
        const palette = theme.colors[paletteKey as keyof typeof theme.colors];
        expect(palette.main).toMatch(HEX_COLOR_REGEX);
        expect(palette.light).toMatch(HEX_COLOR_REGEX);
        expect(palette.dark).toMatch(HEX_COLOR_REGEX);
        expect(palette.contrastText).toMatch(HEX_COLOR_REGEX);
      });
    });

    it('should define text colors with valid rgba or hex codes', () => {
      expect(theme.colors.text.primary).toMatch(RGBA_COLOR_REGEX);
      expect(theme.colors.text.secondary).toMatch(RGBA_COLOR_REGEX);
      expect(theme.colors.text.disabled).toMatch(RGBA_COLOR_REGEX);
    });

    it('should define background colors with valid hex codes', () => {
      expect(theme.colors.background.default).toMatch(HEX_COLOR_REGEX);
      expect(theme.colors.background.paper).toMatch(HEX_COLOR_REGEX);
    });

    it('should define divider color with a valid rgba or hex code', () => {
      expect(theme.colors.divider).toMatch(RGBA_COLOR_REGEX);
    });
  });

  describe('Typography', () => {
    it('should define font families as non-empty strings', () => {
      expect(typeof theme.typography.fontFamily.primary).toBe('string');
      expect(theme.typography.fontFamily.primary).not.toBe('');
      expect(typeof theme.typography.fontFamily.secondary).toBe('string');
      expect(theme.typography.fontFamily.secondary).not.toBe('');
    });

    it('should define font sizes in rem units', () => {
      Object.values(theme.typography.fontSizes).forEach(size => {
        expect(size).toMatch(REM_UNIT_REGEX);
      });
    });

    it('should define font weights as numbers', () => {
      Object.values(theme.typography.fontWeights).forEach(weight => {
        expect(typeof weight).toBe('number');
        expect(weight).toBeGreaterThanOrEqual(100);
        expect(weight).toBeLessThanOrEqual(900);
      });
    });

    it('should define line heights as numbers', () => {
      Object.values(theme.typography.lineHeights).forEach(lineHeight => {
        expect(typeof lineHeight).toBe('number');
        expect(lineHeight).toBeGreaterThan(0);
      });
    });
  });

  describe('Spacing', () => {
    it('should define spacing values in rem units', () => {
      Object.values(theme.spacing).forEach(value => {
        expect(value).toMatch(REM_UNIT_REGEX);
      });
    });

    it('should have a base spacing unit of 0.25rem (4px)', () => {
      expect(theme.spacing['1']).toBe('0.25rem');
    });
  });

  describe('BorderRadius', () => {
    it('should define border-radius values in rem or px units, or "0px" or "9999px"', () => {
      Object.values(theme.borderRadius).forEach(value => {
        if (value === '0px' || value === '9999px') {
          expect(typeof value).toBe('string');
        } else {
          expect(value).toMatch(REM_UNIT_REGEX);
        }
      });
    });
  });

  describe('Shadows', () => {
    it('should define shadow values as valid CSS box-shadow strings or "none"', () => {
      Object.values(theme.shadows).forEach(shadow => {
        expect(shadow).toMatch(SHADOW_REGEX);
      });
    });
  });

  describe('ZIndex', () => {
    it('should define z-index values as numbers or "auto"', () => {
      Object.values(theme.zIndex).forEach(value => {
        expect(typeof value === 'number' || value === 'auto').toBe(true);
        if (typeof value === 'number') {
          expect(value).toBeGreaterThanOrEqual(0);
        }
      });
    });

    it('should have z-index values in a logical ascending order for common layers', () => {
      expect(theme.zIndex.base).toBeLessThan(theme.zIndex.dropdown);
      expect(theme.zIndex.dropdown).toBeLessThan(theme.zIndex.sticky);
      expect(theme.zIndex.sticky).toBeLessThan(theme.zIndex.fixed);
      expect(theme.zIndex.fixed).toBeLessThan(theme.zIndex.modalBackdrop);
      expect(theme.zIndex.modalBackdrop).toBeLessThan(theme.zIndex.modal);
      expect(theme.zIndex.modal).toBeLessThan(theme.zIndex.popover);
      expect(theme.zIndex.popover).toBeLessThan(theme.zIndex.tooltip);
      expect(theme.zIndex.tooltip).toBeLessThan(theme.zIndex.snackbar);
      expect(theme.zIndex.snackbar).toBeLessThan(theme.zIndex.overlay);
    });
  });

  describe('Breakpoints', () => {
    it('should define breakpoints in px units', () => {
      Object.values(theme.breakpoints).forEach(breakpoint => {
        expect(breakpoint).toMatch(PX_UNIT_REGEX);
      });
    });

    it('should have breakpoints in ascending order (mobile-first)', () => {
      const breakpointValues = Object.values(theme.breakpoints)
        .map(bp => parseInt(bp.replace('px', ''), 10))
        .filter(val => !isNaN(val)); // Filter out '0px' if it causes issues with comparison logic, or handle it.

      for (let i = 0; i < breakpointValues.length - 1; i++) {
        expect(breakpointValues[i]).toBeLessThanOrEqual(breakpointValues[i + 1]);
      }
    });

    it('should start with a "xs" breakpoint of 0px', () => {
      expect(theme.breakpoints.xs).toBe('0px');
    });
  });
});