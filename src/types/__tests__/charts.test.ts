// src/types/__tests__/charts.test.ts
import { ChartColor, ChartFont, ChartPadding } from '../charts';

// Mock CanvasGradient and CanvasPattern for demonstrating ChartColor type compatibility.
// These are runtime objects that ChartColor can represent, so we mock them for testing.
class MockCanvasGradient implements CanvasGradient {
  addColorStop(offset: number, color: string): void { /* no-op */ }
}
class MockCanvasPattern implements CanvasPattern {
  setTransform(transform?: DOMMatrix2DInit): void { /* no-op */ }
}

describe('charts.ts types', () => {
  // --- ChartColor Type Tests ---

  test('ChartColor can represent a single CSS color string', () => {
    const color: ChartColor = 'red';
    expect(color).toBe('red');
  });

  test('ChartColor can represent an array of CSS color strings', () => {
    const colors: ChartColor = ['#FF0000', 'rgb(0,255,0)', 'blue'];
    expect(colors).toEqual(['#FF0000', 'rgb(0,255,0)', 'blue']);
  });

  test('ChartColor can represent a CanvasGradient instance (mocked)', () => {
    const gradient: ChartColor = new MockCanvasGradient();
    expect(gradient).toBeInstanceOf(MockCanvasGradient);
  });

  test('ChartColor can represent a CanvasPattern instance (mocked)', () => {
    const pattern: ChartColor = new MockCanvasPattern();
    expect(pattern).toBeInstanceOf(MockCanvasPattern);
  });

  // --- ChartFont Interface Tests ---

  test('ChartFont can define all font properties', () => {
    const font: ChartFont = {
      family: 'Arial',
      size: 14,
      style: 'italic',
      weight: 'bold',
      lineHeight: 1.5,
    };
    expect(font).toEqual({
      family: 'Arial',
      size: 14,
      style: 'italic',
      weight: 'bold',
      lineHeight: 1.5,
    });
  });

  test('ChartFont can define partial font properties (e.g., only size and weight)', () => {
    const font: ChartFont = {
      size: 12,
      weight: 700,
    };
    expect(font).toEqual({
      size: 12,
      weight: 700,
    });
  });

  test('ChartFont can define lineHeight as a string', () => {
    const font: ChartFont = {
      lineHeight: '1.2em',
    };
    expect(font).toEqual({
      lineHeight: '1.2em',
    });
  });

  test('ChartFont can define weight as a string (e.g., "lighter")', () => {
    const font: ChartFont = {
      weight: 'lighter',
    };
    expect(font).toEqual({
      weight: 'lighter',
    });
  });

  // --- ChartPadding Type Tests ---

  test('ChartPadding can be a single number for uniform padding', () => {
    const padding: ChartPadding = 10;
    expect(padding).toBe(10);
  });

  test('ChartPadding can be an object with top and right properties', () => {
    const padding: ChartPadding = {
      top: 5,
      right: 10,
    };
    expect(padding).toEqual({ top: 5, right: 10 });
  });

  test('ChartPadding can be an object with only the top property', () => {
    const padding: ChartPadding = {
      top: 8,
    };
    expect(padding).toEqual({ top: 8 });
  });

  test('ChartPadding can be an object with only the right property', () => {
    const padding: ChartPadding = {
      right: 12,
    };
    expect(padding).toEqual({ right: 12 });
  });

  // --- Snapshot Testing for Type Structures (via example objects) ---
  // These snapshots verify the structure of example objects that conform to the types.
  // This indirectly helps ensure the types guide correct object creation.

  test('Snapshot of a comprehensive ChartFont example object', () => {
    const fontExample: ChartFont = {
      family: 'Roboto',
      size: 16,
      style: 'normal',
      weight: 'lighter',
      lineHeight: '1.4',
    };
    expect(fontExample).toMatchSnapshot();
  });

  test('Snapshot of a ChartPadding object example', () => {
    const paddingExample: ChartPadding = {
      top: 20,
      right: 15,
    };
    expect(paddingExample).toMatchSnapshot();
  });

  test('Snapshot of a ChartColor array example', () => {
    const colorExample: ChartColor = ['#123456', 'rgba(255,0,0,0.5)', 'hsl(120, 100%, 50%)'];
    expect(colorExample).toMatchSnapshot();
  });
});