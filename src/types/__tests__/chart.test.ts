import {
  ChartDataPoint,
  ChartType,
  ChartColor,
  ChartFontWeight,
  ChartAlign,
  // ChartVertical is incomplete in the provided source code, so it cannot be fully tested.
} from './chart'; // Assuming 'chart.ts' is in the same directory or a known path

describe('Chart Type Definitions Runtime Conformance', () => {
  // --- ChartDataPoint Tests ---
  describe('ChartDataPoint', () => {
    it('should allow a simple number as a data point', () => {
      const data: ChartDataPoint = 100;
      expect(typeof data).toBe('number');
      expect(data).toBe(100);
    });

    it('should allow an [any, number] tuple as a data point', () => {
      const data1: ChartDataPoint = ['Category A', 250];
      expect(Array.isArray(data1)).toBe(true);
      expect(data1.length).toBe(2);
      expect(data1[0]).toBe('Category A');
      expect(data1[1]).toBe(250);
      expect(typeof data1[1]).toBe('number');

      const data2: ChartDataPoint = [new Date(), 300];
      expect(Array.isArray(data2)).toBe(true);
      expect(data2[0]).toBeInstanceOf(Date);
      expect(data2[1]).toBe(300);
    });

    it('should allow an object with x and y properties as a data point', () => {
      const data1: ChartDataPoint = { x: 'Jan', y: 50 };
      expect(typeof data1).toBe('object');
      expect(data1).toHaveProperty('x', 'Jan');
      expect(data1).toHaveProperty('y', 50);
      expect(typeof data1.y).toBe('number');

      const data2: ChartDataPoint = { x: 10, y: [10, 20, 30], label: 'Bubble' };
      expect(typeof data2).toBe('object');
      expect(data2).toHaveProperty('x', 10);
      expect(data2).toHaveProperty('y', [10, 20, 30]);
      expect(Array.isArray(data2.y)).toBe(true);
      expect(data2).toHaveProperty('label', 'Bubble');

      const data3: ChartDataPoint = { x: 'Feb', y: null, extra: true };
      expect(typeof data3).toBe('object');
      expect(data3).toHaveProperty('x', 'Feb');
      expect(data3).toHaveProperty('y', null);
      expect(data3).toHaveProperty('extra', true);
    });
  });

  // --- ChartType Tests ---
  describe('ChartType', () => {
    it('should allow all defined chart types', () => {
      const types: ChartType[] = [
        'line', 'bar', 'area', 'pie', 'donut', 'radialBar', 'scatter',
        'bubble', 'heatmap', 'candlestick', 'radar', 'treemap'
      ];

      types.forEach(type => {
        const chartType: ChartType = type;
        expect(chartType).toBe(type);
      });
    });
  });

  // --- ChartColor Tests ---
  describe('ChartColor', () => {
    it('should allow a single string color', () => {
      const color: ChartColor = '#FF0000';
      expect(typeof color).toBe('string');
      expect(color).toBe('#FF0000');
    });

    it('should allow an array of string colors', () => {
      const colors: ChartColor = ['#FF0000', 'rgb(0,255,0)', 'blue'];
      expect(Array.isArray(colors)).toBe(true);
      expect(colors).toEqual(['#FF0000', 'rgb(0,255,0)', 'blue']);
      expect(colors.length).toBe(3);
      expect(typeof colors[0]).toBe('string');
    });

    it('should allow a function that returns a string color', () => {
      const colorFn: ChartColor = (value: number) => (value > 0 ? 'green' : 'red');
      expect(typeof colorFn).toBe('function');
      expect(colorFn(10)).toBe('green');
      expect(colorFn(-5)).toBe('red');
      expect(colorFn(0)).toBe('red'); // Test edge case
    });
  });

  // --- ChartFontWeight Tests ---
  describe('ChartFontWeight', () => {
    it('should allow predefined string font weights', () => {
      const weight1: ChartFontWeight = 'normal';
      expect(weight1).toBe('normal');
      const weight2: ChartFontWeight = 'bold';
      expect(weight2).toBe('bold');
      const weight3: ChartFontWeight = 'bolder';
      expect(weight3).toBe('bolder');
      const weight4: ChartFontWeight = 'lighter';
      expect(weight4).toBe('lighter');
    });

    it('should allow a number as font weight', () => {
      const weight1: ChartFontWeight = 400;
      expect(typeof weight1).toBe('number');
      expect(weight1).toBe(400);

      const weight2: ChartFontWeight = 700;
      expect(typeof weight2).toBe('number');
      expect(weight2).toBe(700);
    });
  });

  // --- ChartAlign Tests ---
  describe('ChartAlign', () => {
    it('should allow all defined text alignment options', () => {
      const align1: ChartAlign = 'left';
      expect(align1).toBe('left');
      const align2: ChartAlign = 'center';
      expect(align2).toBe('center');
      const align3: ChartAlign = 'right';
      expect(align3).toBe('right');
    });
  });

  // --- ChartVertical (Incomplete in source) ---
  // The ChartVertical type is incomplete in the provided source code.
  // If it were complete (e.g., 'top' | 'middle' | 'bottom'), tests similar to ChartAlign would be added here.
  it('should note that ChartVertical type is incomplete in the source', () => {
    // This is a placeholder to acknowledge the incomplete type.
    // No actual runtime test can be performed for an incomplete type definition.
    expect(true).toBe(true);
  });
});