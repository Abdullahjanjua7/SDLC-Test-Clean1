import { DashboardService, DashboardData, ApiResponse, FetchDashboardOptions } from './dashboardService';

// Mock data for successful API responses
const mockDashboardData: DashboardData = {
  totalSales: 12345.67,
  totalOrders: 500,
  averageOrderValue: 24.69,
  salesByProduct: [
    { productId: 'P001', productName: 'Product A', sales: 5000 },
    { productId: 'P002', productName: 'Product B', sales: 7000 },
  ],
  salesByRegion: [
    { region: 'North', sales: 8000 },
    { region: 'South', sales: 4000 },
  ],
  lastUpdated: '2023-10-27T10:00:00Z',
  additionalMetric: 100,
};

const mockSuccessApiResponse: ApiResponse<DashboardData> = {
  success: true,
  data: mockDashboardData,
  message: 'Dashboard data fetched successfully.',
  statusCode: 200,
};

// Mock data for API responses indicating business logic failure (but HTTP 200 OK)
const mockApiFailureResponse: ApiResponse<DashboardData> = {
  success: false,
  message: 'No data available for the selected period.',
  error: 'DATA_NOT_FOUND',
  statusCode: 200,
};

// Mock data for HTTP error responses
const mockHttpErrorApiResponse: ApiResponse<DashboardData> = {
  success: false,
  message: 'Internal Server Error',
  error: 'SERVER_ERROR',
  statusCode: 500,
};

describe('DashboardService', () => {
  let service: DashboardService;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset the service instance before each test
    service = new DashboardService();
    // Spy on the global fetch function
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    // Clear all mocks after each test
    jest.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with the default API_BASE_URL if none is provided', () => {
      const defaultService = new DashboardService();
      expect((defaultService as any).API_BASE_URL).toBe('/api/dashboard');
    });

    it('should initialize with the provided API_BASE_URL', () => {
      const customBaseUrl = 'https://api.example.com/v1/dashboard';
      const customService = new DashboardService(customBaseUrl);
      expect((customService as any).API_BASE_URL).toBe(customBaseUrl);
    });
  });

  describe('fetchDashboardData', () => {
    it('should fetch dashboard data successfully without options', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockSuccessApiResponse),
      });

      const response = await service.fetchDashboardData();

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith('/api/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(response).toEqual(mockSuccessApiResponse);
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockDashboardData);
    });

    it('should fetch dashboard data successfully with all options', async () => {
      const options: FetchDashboardOptions = {
        startDate: '2023-01-01',
        endDate: '2023-01-31',
        region: 'EMEA',
        productCategory: 'Electronics',
        customFilter: 'value',
      };

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockSuccessApiResponse),
      });

      const response = await service.fetchDashboardData(options);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/dashboard?startDate=2023-01-01&endDate=2023-01-31&region=EMEA&productCategory=Electronics&customFilter=value',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(response).toEqual(mockSuccessApiResponse);
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockDashboardData);
    });

    it('should handle API response where success is false but HTTP status is 200', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true, // HTTP status is OK
        status: 200,
        json: () => Promise.resolve(mockApiFailureResponse), // API body indicates failure
      });

      const response = await service.fetchDashboardData({ startDate: '2023-01-01' });

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(response).toEqual(mockApiFailureResponse);
      expect(response.success).toBe(false);
      expect(response.message).toBe('No data available for the selected period.');
      expect(response.error).toBe('DATA_NOT_FOUND');
      expect(response.statusCode).toBe(200);
    });

    it('should handle HTTP error responses (e.g., 500 Internal Server Error)', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false, // HTTP status is NOT OK
        status: 500,
        json: () => Promise.resolve(mockHttpErrorApiResponse),
      });

      const response = await service.fetchDashboardData();

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(response.success).toBe(false);
      expect(response.message).toBe('Internal Server Error');
      expect(response.error).toBe('SERVER_ERROR');
      expect(response.statusCode).toBe(500);
    });

    it('should handle HTTP error responses with a generic message if API response has no message', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ success: false }), // Minimal error response from API
      });

      const response = await service.fetchDashboardData();

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(response.success).toBe(false);
      expect(response.message).toBe('API request failed with status 404');
      expect(response.error).toBe('Unknown API error');
      expect(response.statusCode).toBe(404);
    });

    it('should handle network errors (e.g., no internet connection)', async () => {
      const networkError = new Error('Failed to fetch');
      fetchSpy.mockRejectedValueOnce(networkError);

      // Spy on console.error to prevent it from polluting test output and to assert it's called
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const response = await service.fetchDashboardData();

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(response.success).toBe(false);
      expect(response.message).toBe('Failed to connect to the dashboard service or process response.');
      expect(response.statusCode).toBe(500);
      expect(response.error).toBe('Failed to fetch');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching dashboard data:', networkError);

      consoleErrorSpy.mockRestore();
    });

    it('should handle invalid JSON response from the server', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('Invalid JSON')), // Simulate JSON parsing error
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const response = await service.fetchDashboardData();

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(response.success).toBe(false);
      expect(response.message).toBe('Failed to connect to the dashboard service or process response.');
      expect(response.statusCode).toBe(500);
      expect(response.error).toBe('Invalid JSON');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching dashboard data:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });

    it('should correctly build query parameters with mixed options (some undefined/null/empty)', async () => {
      const options: FetchDashboardOptions = {
        startDate: '2023-01-01',
        endDate: undefined, // Should be ignored
        region: 'APAC',
        productCategory: '', // Should be ignored
        anotherFilter: null as any, // Should be ignored
        validFilter: 'active',
      };

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockSuccessApiResponse),
      });

      await service.fetchDashboardData(options);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/dashboard?startDate=2023-01-01&region=APAC&validFilter=active',
        expect.any(Object)
      );
    });
  });

  // Indirectly testing buildQueryParams through fetchDashboardData
  describe('buildQueryParams (private method - indirectly tested)', () => {
    it('should return an empty string if no options are provided', () => {
      // Accessing private method for direct testing, though it's implicitly covered
      const queryParams = (service as any).buildQueryParams();
      expect(queryParams).toBe('');
    });

    it('should return an empty string if options object is empty', () => {
      const queryParams = (service as any).buildQueryParams({});
      expect(queryParams).toBe('');
    });

    it('should correctly build query parameters from a simple options object', () => {
      const options: FetchDashboardOptions = {
        startDate: '2023-01-01',
        endDate: '2023-01-31',
      };
      const queryParams = (service as any).buildQueryParams(options);
      expect(queryParams).toBe('startDate=2023-01-01&endDate=2023-01-31');
    });

    it('should encode URI components in query parameters', () => {
      const options: FetchDashboardOptions = {
        region: 'North America',
        productCategory: 'Electronics & Gadgets',
      };
      const queryParams = (service as any).buildQueryParams(options);
      expect(queryParams).toBe('region=North+America&productCategory=Electronics+%26+Gadgets');
    });
  });
});