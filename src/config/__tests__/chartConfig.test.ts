import { chartConfig, applyGlobalChartConfig } from '../src/chartConfig';
import { Chart, ChartOptions } from 'chart.js'; // Import for type checking, actual Chart will be mocked

// Mock the entire 'chart.js' module
jest.mock('chart.js', () => ({
  Chart: {
    defaults: {
      set: jest.fn(),
    },
  },
  // We need to export ChartOptions for type compatibility if the original module uses it
  // For testing purposes, we can use a simple type or even 'any' if not strictly needed for runtime logic
  ChartOptions: {} as ChartOptions, // Mock ChartOptions type
}));

describe('chartConfig', () => {
  it('should be an object of ChartOptions type', () => {
    expect(typeof chartConfig).toBe('object');
    expect(chartConfig).toBeDefined();
    // A basic type check, more detailed checks below
  });

  it('should define global responsiveness settings', () => {
    expect(chartConfig.responsive).toBe(true);
    expect(chartConfig.maintainAspectRatio).toBe(false);
    expect(chartConfig.resizeDelay).toBe(100);
  });

  it('should define global animation settings', () => {
    expect(chartConfig.animation).toBeDefined();
    expect(chartConfig.animation?.duration).toBe(800);
    expect(chartConfig.animation?.easing).toBe('easeOutQuart');
  });

  it('should define global legend plugin options', () => {
    expect(chartConfig.plugins?.legend).toBeDefined();
    expect(chartConfig.plugins?.legend?.display).toBe(true);
    expect(chartConfig.plugins?.legend?.position).toBe('top');
    expect(chartConfig.plugins?.legend?.labels?.font?.size).toBe(12);
    expect(chartConfig.plugins?.legend?.labels?.color).toBe('#666');
  });

  it('should define global tooltip plugin options', () => {
    expect(chartConfig.plugins?.tooltip).toBeDefined();
    expect(chartConfig.plugins?.tooltip?.enabled).toBe(true);
    expect(chartConfig.plugins?.tooltip?.mode).toBe('index');
    expect(chartConfig.plugins?.tooltip?.intersect).toBe(false);
    expect(chartConfig.plugins?.tooltip?.backgroundColor).toBe('rgba(0, 0, 0, 0.7)');
    expect(chartConfig.plugins?.tooltip?.titleFont?.size).toBe(14);
    expect(chartConfig.plugins?.tooltip?.bodyFont?.size).toBe(12);
  });

  it('should define global x-axis scale options', () => {
    expect(chartConfig.scales?.x).toBeDefined();
    expect(chartConfig.scales?.x?.grid?.display).toBe(false);
    expect(chartConfig.scales?.x?.ticks?.color).toBe('#666');
    expect(chartConfig.scales?.x?.ticks?.font?.size).toBe(10);
  });

  it('should define global y-axis scale options', () => {
    expect(chartConfig.scales?.y).toBeDefined();
    expect(chartConfig.scales?.y?.beginAtZero).toBe(true);
    expect(chartConfig.scales?.y?.grid?.color).toBe('rgba(0, 0, 0, 0.1)');
    expect(chartConfig.scales?.y?.ticks?.color).toBe('#666');
    expect(chartConfig.scales?.y?.ticks?.font?.size).toBe(10);
  });

  it('should define global element options for point, line, bar, and arc', () => {
    expect(chartConfig.elements?.point?.radius).toBe(3);
    expect(chartConfig.elements?.line?.tension).toBe(0.4);
    expect(chartConfig.elements?.bar?.borderRadius).toBe(4);
    expect(chartConfig.elements?.arc?.borderWidth).toBe(2);
  });

  it('should define global layout padding', () => {
    expect(chartConfig.layout?.padding).toEqual({
      left: 10,
      right: 10,
      top: 10,
      bottom: 10,
    });
  });
});

describe('applyGlobalChartConfig', () => {
  let chartDefaultsSetMock: jest.Mock;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset the mock before each test
    chartDefaultsSetMock = (Chart.defaults.set as jest.Mock).mockClear();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original console methods
    consoleWarnSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleErrorSpy.mockRestore();

    // Ensure Chart.defaults.set is reset to its original mock implementation
    (Chart.defaults.set as jest.Mock).mockImplementation(() => {});
    // Reset Chart to its default mock structure
    (Chart as any).defaults = { set: chartDefaultsSetMock };
  });

  it('should call Chart.defaults.set with the correct configuration', () => {
    applyGlobalChartConfig();
    expect(chartDefaultsSetMock).toHaveBeenCalledTimes(1);
    expect(chartDefaultsSetMock).toHaveBeenCalledWith(chartConfig);
    expect(consoleInfoSpy).toHaveBeenCalledWith('Global Chart.js configuration applied successfully.');
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should log a warning if Chart is undefined', () => {
    // Temporarily set Chart to undefined for this test
    const originalChart = (global as any).Chart;
    (global as any).Chart = undefined;

    applyGlobalChartConfig();

    expect(chartDefaultsSetMock).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Chart.js is not loaded or does not support Chart.defaults.set(). Global chart configuration will not be applied.'
    );
    expect(consoleInfoSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    // Restore original Chart
    (global as any).Chart = originalChart;
  });

  it('should log a warning if Chart.defaults is undefined', () => {
    // Temporarily modify Chart.defaults
    const originalDefaults = (Chart as any).defaults;
    (Chart as any).defaults = undefined;

    applyGlobalChartConfig();

    expect(chartDefaultsSetMock).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Chart.js is not loaded or does not support Chart.defaults.set(). Global chart configuration will not be applied.'
    );
    expect(consoleInfoSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    // Restore original Chart.defaults
    (Chart as any).defaults = originalDefaults;
  });

  it('should log a warning if Chart.defaults.set is undefined', () => {
    // Temporarily modify Chart.defaults.set
    const originalSet = (Chart.defaults as any).set;
    (Chart.defaults as any).set = undefined;

    applyGlobalChartConfig();

    expect(chartDefaultsSetMock).not.toHaveBeenCalled(); // The mock itself won't be called if it's undefined
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Chart.js is not loaded or does not support Chart.defaults.set(). Global chart configuration will not be applied.'
    );
    expect(consoleInfoSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    // Restore original Chart.defaults.set
    (Chart.defaults as any).set = originalSet;
  });

  it('should log an error if Chart.defaults.set throws an error', () => {
    const mockError = new Error('Failed to set defaults');
    chartDefaultsSetMock.mockImplementationOnce(() => {
      throw mockError;
    });

    applyGlobalChartConfig();

    expect(chartDefaultsSetMock).toHaveBeenCalledTimes(1);
    expect(chartDefaultsSetMock).toHaveBeenCalledWith(chartConfig);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error applying global Chart.js configuration:',
      mockError
    );
    expect(consoleInfoSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });
});