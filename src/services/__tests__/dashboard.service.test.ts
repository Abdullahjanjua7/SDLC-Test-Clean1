import {
  DashboardService,
  DashboardServiceError,
  DashboardData,
  DashboardChart,
  FetchDashboardOptions,
} from './dashboard.service'; // Assuming the service is in dashboard.service.ts

// Mock the global fetch function
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('DashboardService', () => {
  const API_BASE_URL = 'https://api.example.com/v1';
  let service: DashboardService;

  // Mock successful dashboard data
  const mockDashboardData: DashboardData = {
    summaryMetrics: [{
      id: 'm1',
      name: 'Total Sales',
      value: 12345.67,
      unit: '$',
      change: 5.2,
      trend: 'up'
    }, ],
    recentActivity: [],
    charts: [{
      id: 'c1',
      title: 'Sales Trend',
      type: 'line',
      series: [{
        timestamp: '2023-01-01T00:00:00Z',
        value: 100
      }, {
        timestamp: '2023-01-02T00:00:00Z',
        value: 120
      }, ],
    }, ],
    lastUpdated: '2023-10-27T10:00:00Z',
  };

  // Mock successful chart data
  const mockChartData: DashboardChart = {
    id: 'c1',
    title: 'Sales Trend',
    type: 'line',
    series: [{
      timestamp: '2023-01-01T00:00:00Z',
      value: 100
    }, {
      timestamp: '2023-01-02T00:00:00Z',
      value: 120
    }, ],
  };

  beforeEach(() => {
    // Reset the mock before each test
    mockFetch.mockClear();
    service = new DashboardService(API_BASE_URL);
  });

  describe('constructor', () => {
    it('should initialize with the provided API base URL', () => {
      const testService = new DashboardService('http://test.com');
      // Accessing private property for testing purposes
      expect((testService as any).API_BASE_URL).toBe('http://test.com');
    });

    it('should remove trailing slash from API base URL if present', () => {
      const testService = new DashboardService('http://test.com/');
      expect((testService as any).API_BASE_URL).toBe('http://test.com');
    });

    it('should throw an error if apiBaseUrl is not provided', () => {
      expect(() => new DashboardService('')).toThrow('DashboardService: apiBaseUrl cannot be empty.');
      expect(() => new DashboardService(null as any)).toThrow('DashboardService: apiBaseUrl cannot be empty.');
      expect(() => new DashboardService(undefined as any)).toThrow('DashboardService: apiBaseUrl cannot be empty.');
    });
  });

  describe('fetchDashboardData', () => {
    it('should fetch dashboard data successfully with no options', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockDashboardData),
      });

      const data = await service.fetchDashboardData();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(data).toEqual(mockDashboardData);
    });

    it('should fetch dashboard data successfully with all options', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockDashboardData),
      });

      const options: FetchDashboardOptions = {
        startDate: '2023-01-01',
        endDate: '2023-01-31',
        period: 'month',
        userId: 'user123',
      };
      const data = await service.fetchDashboardData(options);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/dashboard?startDate=2023-01-01&endDate=2023-01-31&period=month&userId=user123`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(data).toEqual(mockDashboardData);
    });

    it('should fetch dashboard data successfully with a subset of options', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockDashboardData),
      });

      const options: FetchDashboardOptions = {
        period: 'week',
        userId: 'user456',
      };
      const data = await service.fetchDashboardData(options);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/dashboard?period=week&userId=user456`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(data).toEqual(mockDashboardData);
    });

    it('should throw DashboardServiceError for HTTP 404 with JSON error body', async () => {
      const errorResponse = {
        code: 'NOT_FOUND',
        message: 'Dashboard data not found for the specified criteria.',
        details: 'No data available for the given date range.',
      };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve(errorResponse),
      });

      await expect(service.fetchDashboardData({
        startDate: '2024-01-01'
      })).rejects.toThrow(DashboardServiceError);
      await expect(service.fetchDashboardData({
        startDate: '2024-01-01'
      })).rejects.toMatchObject({
        message: errorResponse.message,
        status: 404,
        code: errorResponse.code,
        details: errorResponse.details,
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should throw DashboardServiceError for HTTP 500 without JSON error body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Failed to parse JSON')), // Simulate non-JSON response
      });

      await expect(service.fetchDashboardData()).rejects.toThrow(DashboardServiceError);
      await expect(service.fetchDashboardData()).rejects.toMatchObject({
        message: 'API call failed with status 500: Internal Server Error. Could not parse error details.',
        status: 500,
        code: undefined,
        details: undefined,
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should throw DashboardServiceError for network errors (Failed to fetch)', async () => {
      mockFetch.mockImplementationOnce(() => Promise.reject(new TypeError('Failed to fetch')));

      await expect(service.fetchDashboardData()).rejects.toThrow(DashboardServiceError);
      await expect(service.fetchDashboardData()).rejects.toMatchObject({
        message: 'Network error or API is unreachable. Please check your internet connection or API availability.',
        status: 0,
        code: 'NETWORK_ERROR',
        details: 'Failed to fetch',
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should throw DashboardServiceError for unexpected errors during fetch', async () => {
      const unexpectedError = new Error('Something went wrong internally');
      mockFetch.mockImplementationOnce(() => Promise.reject(unexpectedError));

      await expect(service.fetchDashboardData()).rejects.toThrow(DashboardServiceError);
      await expect(service.fetchDashboardData()).rejects.toMatchObject({
        message: `An unexpected error occurred while fetching dashboard data: ${unexpectedError.message}`,
        status: undefined,
        code: 'UNKNOWN_ERROR',
      });
      // Check that the original error's message is part of the custom error's message
      await service.fetchDashboardData().catch((e: DashboardServiceError) => {
        expect(e.message).toContain(unexpectedError.message);
        expect(e.stack).toBeDefined(); // Stack trace should be included for unknown errors
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('refreshChartData', () => {
    const chartId = 'c1';

    it('should refresh chart data successfully with no options', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockChartData),
      });

      const data = await service.refreshChartData(chartId);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/dashboard/charts/${chartId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(data).toEqual(mockChartData);
    });

    it('should refresh chart data successfully with options', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockChartData),
      });

      const options: FetchDashboardOptions = {
        startDate: '2023-01-01',
        endDate: '2023-01-31',
        period: 'month',
      };
      const data = await service.refreshChartData(chartId, options);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/dashboard/charts/${chartId}?startDate=2023-01-01&endDate=2023-01-31&period=month`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(data).toEqual(mockChartData);
    });

    it('should throw DashboardServiceError for HTTP 400 with JSON error body', async () => {
      const errorResponse = {
        code: 'INVALID_CHART_ID',
        message: 'Chart ID is invalid.',
      };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve(errorResponse),
      });

      await expect(service.refreshChartData('invalid-id')).rejects.toThrow(DashboardServiceError);
      await expect(service.refreshChartData('invalid-id')).rejects.toMatchObject({
        message: errorResponse.message,
        status: 400,
        code: errorResponse.code,
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should throw DashboardServiceError for HTTP 401 without JSON error body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.reject(new Error('Not JSON')),
      });

      await expect(service.refreshChartData(chartId)).rejects.toThrow(DashboardServiceError);
      await expect(service.refreshChartData(chartId)).rejects.toMatchObject({
        message: `API call failed for chart ${chartId} with status 401: Unauthorized.`,
        status: 401,
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should throw DashboardServiceError for network errors when refreshing chart', async () => {
      mockFetch.mockImplementationOnce(() => Promise.reject(new TypeError('Failed to fetch')));

      await expect(service.refreshChartData(chartId)).rejects.toThrow(DashboardServiceError);
      await expect(service.refreshChartData(chartId)).rejects.toMatchObject({
        message: `Network error or API is unreachable while refreshing chart ${chartId}.`,
        status: 0,
        code: 'NETWORK_ERROR',
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should throw DashboardServiceError for unexpected errors when refreshing chart', async () => {
      const unexpectedError = new Error('Chart processing failed');
      mockFetch.mockImplementationOnce(() => Promise.reject(unexpectedError));

      await expect(service.refreshChartData(chartId)).rejects.toThrow(DashboardServiceError);
      await expect(service.refreshChartData(chartId)).rejects.toMatchObject({
        message: `An unexpected error occurred while refreshing chart ${chartId}: ${unexpectedError.message}`,
        status: undefined,
        code: 'UNKNOWN_ERROR',
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('DashboardServiceError', () => {
    it('should be an instance of Error and DashboardServiceError', () => {
      const error = new DashboardServiceError('Test message');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DashboardServiceError);
    });

    it('should correctly set message, status, code, and details', () => {
      const message = 'Something went wrong';
      const status = 400;
      const code = 'BAD_REQUEST';
      const details = 'Invalid input provided.';
      const error = new DashboardServiceError(message, status, code, details);

      expect(error.message).toBe(message);
      expect(error.status).toBe(status);
      expect(error.code).toBe(code);
      expect(error.details).toBe(details);
      expect(error.name).toBe('DashboardServiceError');
    });

    it('should handle optional parameters correctly', () => {
      const error1 = new DashboardServiceError('Only message');
      expect(error1.message).toBe('Only message');
      expect(error1.status).toBeUndefined();
      expect(error1.code).toBeUndefined();
      expect(error1.details).toBeUndefined();

      const error2 = new DashboardServiceError('Message and status', 500);
      expect(error2.message).toBe('Message and status');
      expect(error2.status).toBe(500);
      expect(error2.code).toBeUndefined();
      expect(error2.details).toBeUndefined();
    });
  });
});