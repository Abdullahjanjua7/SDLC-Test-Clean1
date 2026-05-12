import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LineChart from './LineChart';
import '@testing-library/jest-dom';

// Mock CSS Modules
jest.mock('./LineChart.module.css', () => ({
  chartContainer: 'chartContainer',
  chartTitle: 'chartTitle',
  svgChart: 'svgChart',
  areaPath: 'areaPath',
  linePath: 'linePath',
  xAxis: 'xAxis',
  yAxis: 'yAxis',
  tickLabel: 'tickLabel',
  axisLabel: 'axisLabel',
  tooltipGroup: 'tooltipGroup',
  tooltipBackground: 'tooltipBackground',
  tooltipText: 'tooltipText',
}));

// Mock Date for consistent date formatting in tests
const MOCK_START_TIMESTAMP = new Date('2023-01-01T00:00:00.000Z').getTime();

// Helper function to generate mock data
const generateData = (count: number, startTimestamp = MOCK_START_TIMESTAMP, valueOffset = 0) => {
  return Array.from({ length: count }).map((_, i) => ({
    timestamp: startTimestamp + i * 3600 * 1000 * 24, // Daily data points
    value: 10 + Math.sin(i * 0.5) * 5 + value