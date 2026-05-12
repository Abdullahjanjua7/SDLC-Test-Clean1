import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock axios.create to control the instance and its interceptors
// We need to capture the interceptor functions that are passed to .use()
const mockAxiosInstance = {
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  head: jest.fn(),
  options: jest.fn(),
  request: jest.fn(),
};

jest.mock('axios', () => ({
  create: jest.fn(() => mockAxiosInstance),
}));

// Declare api variable to hold the imported instance
let api: AxiosInstance;

describe('api.ts', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let requestInterceptorSuccess: (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
  let requestInterceptorError: (error: AxiosError) => Promise<AxiosError>;
  let responseInterceptorSuccess: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>;
  let responseInterceptorError: (error: AxiosError) => Promise<AxiosError>;

  // This runs once before all tests in this describe block
  beforeAll(() => {
    // Set a mock environment variable for testing baseURL
    process.env.REACT_APP_API_BASE_URL = 'http://test-api.com';

    // Re-import the module to ensure it picks up the mocked axios and env var
    jest.resetModules();
    api = require('./api').default;

    // Extract the interceptor functions after the module has been loaded
    // The first call to use() is for the request interceptor
    const requestInterceptorArgs = mockAxiosInstance.interceptors.request.use.mock.calls[0];
    requestInterceptorSuccess = requestInterceptorArgs[0];
    requestInterceptorError = requestInterceptorArgs[1];

    // The first call to use() is for the response interceptor
    const responseInterceptorArgs = mockAxiosInstance.interceptors.response.use.mock.calls[0];
    responseInterceptorSuccess = responseInterceptorArgs[0];
    responseInterceptorError = responseInterceptorArgs[1];
  });

  // This runs before each test
  beforeEach(() => {
    jest.clearAllMocks(); // Clear all mocks on axios and localStorage
    localStorageMock.clear(); // Clear localStorage mock store
    // Spy on console.error to check if errors are logged
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  // This runs after each test
  afterEach(() => {
    consoleErrorSpy.mockRestore(); // Restore original console.error
  });

  // This runs once after all tests in this describe block
  afterAll(() => {
    delete process.env.REACT_APP_API_BASE_URL; // Clean up env var
  });

  // --- 1. Test Axios Instance Configuration ---
  describe('Axios Instance Configuration', () => {
    it('should create an Axios instance with the correct base URL from environment variable', () => {
      expect(axios.create).toHaveBeenCalledTimes(1);
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'http://test-api.com',
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should use default base URL if REACT_APP_API_BASE_URL is not defined', () => {
      // Temporarily delete the env var and re-import the module
      delete process.env.REACT_APP_API_BASE_URL;
      jest.resetModules();
      require('./api').default; // Re-import to trigger axios.create again

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: '/api',
        })
      );
      // Restore for other tests
      process.env.REACT_APP_API_BASE_URL = 'http://test-api.com';
    });

    it('should have request and response interceptors configured', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalledTimes(1);
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalledTimes(1);
    });
  });

  // --- 2. Test Request Interceptor ---
  describe('Request Interceptor', () => {
    it('should add Authorization header if token exists in localStorage', () => {
      const mockToken = 'test-jwt-token';
      localStorageMock.setItem('authToken', mockToken);

      const mockConfig: AxiosRequestConfig = { headers: {} };
      const modifiedConfig = requestInterceptorSuccess(mockConfig);

      expect(modifiedConfig.headers).toHaveProperty('Authorization', `Bearer ${mockToken}`);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('authToken');
    });

    it('should not add Authorization header if token does not exist in localStorage', () => {
      localStorageMock.removeItem('authToken'); // Ensure no token
      expect(localStorageMock.getItem('authToken')).toBeNull();

      const mockConfig: AxiosRequestConfig = { headers: {} };
      const modifiedConfig = requestInterceptorSuccess(mockConfig);

      expect(modifiedConfig.headers).not.toHaveProperty('Authorization');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('authToken');
    });

    it('should preserve existing headers', () => {
      const mockToken = 'test-jwt-token';
      localStorageMock.setItem('authToken', mockToken);

      const mockConfig: AxiosRequestConfig = { headers: { 'X-Custom-Header': 'value' } };
      const modifiedConfig = requestInterceptorSuccess(mockConfig);

      expect(modifiedConfig.headers).toHaveProperty('Authorization', `Bearer ${mockToken}`);
      expect(modifiedConfig.headers).toHaveProperty('X-Custom-Header', 'value');
    });

    it('should initialize headers object if it does not exist in config', () => {
      const mockToken = 'test-jwt-token';
      localStorageMock.setItem('authToken', mockToken);

      const mockConfig: AxiosRequestConfig = {}; // No headers property
      const modifiedConfig = requestInterceptorSuccess(mockConfig);

      expect(modifiedConfig.headers).toBeDefined();
      expect(modifiedConfig.headers).toHaveProperty('Authorization', `Bearer ${mockToken}`);
    });

    it('should handle request interceptor error path', async () => {
      const mockError: AxiosError = {
        name: 'AxiosError',
        message: 'Request setup error',
        config: {},
        isAxiosError: true,
        toJSON: () => ({}),
      };

      await expect(requestInterceptorError(mockError)).rejects.toEqual(mockError);
      expect(consoleErrorSpy).toHaveBeenCalledWith('API Request Error:', mockError);
    });
  });

  // --- 3. Test Response Interceptor ---
  describe('Response Interceptor', () => {
    // Success path
    it('should return the response for successful requests (2xx status)', () => {
      const mockResponse: AxiosResponse = {
        data: { message: 'Success' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };
      const result = responseInterceptorSuccess(mockResponse);

      expect(result).toEqual(mockResponse);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    // Error path: error.response exists (server responded with non-2xx)
    it('should handle 400 Bad Request errors', async () => {
      const mockError: AxiosError = {
        name: 'AxiosError',
        message: 'Request failed with status code 400',
        config: {},
        isAxiosError: true,
        response: {
          data: { errors: ['Invalid input'] },
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {},
        },
        toJSON: () => ({}),
      };

      await expect(responseInterceptorError(mockError)).rejects.toEqual(mockError);
      expect(consoleErrorSpy).toHaveBeenCalledWith('API Response Error (400 Bad Request):', mockError.response?.data);
    });

    it('should handle 401 Unauthorized errors', async () => {
      const mockError: AxiosError = {
        name: 'AxiosError',
        message: 'Request failed with status code 401',
        config: {},
        isAxiosError: true,
        response: {
          data: { message: 'Unauthorized' },
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config: {},
        },
        toJSON: () => ({}),
      };

      await expect(responseInterceptorError(mockError)).rejects.toEqual(mockError);
      expect(consoleErrorSpy).toHaveBeenCalledWith('API Response Error (401 Unauthorized):', mockError.response?.data);
      // Add assertions here if there was logic to clear token or redirect
      // For example: expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
    });

    it('should handle 403 Forbidden errors', async () => {
      const mockError: AxiosError = {
        name: 'AxiosError',
        message: 'Request failed with status code 403',
        config: {},
        isAxiosError: true,
        response: {
          data: { message: 'Forbidden' },
          status: 403,
          statusText: 'Forbidden',
          headers: {},
          config: {},
        },
        toJSON: () => ({}),
      };

      await expect(responseInterceptorError(mockError)).rejects.toEqual(mockError);
      expect(consoleErrorSpy).toHaveBeenCalledWith('API Response Error (403 Forbidden):', mockError.response?.data);
    });

    it('should handle 404 Not Found errors', async () => {
      const mockError: AxiosError = {
        name: 'AxiosError',
        message: 'Request failed with status code 404',
        config: {},
        isAxiosError: true,
        response: {
          data: { message: 'Resource not found' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: {},
        },
        toJSON: () => ({}),
      };

      await expect(responseInterceptorError(mockError)).rejects.toEqual(mockError);
      expect(consoleErrorSpy).toHaveBeenCalledWith('API Response Error (404 Not Found):', mockError.response?.data);
    });

    it('should handle 500 Internal Server Error', async () => {
      const mockError: AxiosError = {
        name: 'AxiosError',
        message: 'Request failed with status code 500',
        config: {},
        isAxiosError: true,
        response: {
          data: { message: 'Internal Server Error' },
          status: 500,
          statusText: 'Internal Server Error