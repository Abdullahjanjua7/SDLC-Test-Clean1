import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * @module api
 * @description
 * This module provides a pre-configured Axios instance for making API calls.
 * It includes request and response interceptors for common tasks like
 * adding authentication tokens and handling API errors.
 *
 * The base URL for API requests is determined by the `REACT_APP_API_BASE_URL`
 * environment variable. If not set, it defaults to '/api'.
 *
 * @example
 * // To use the API instance:
 * import api from './api';
 *
 * async function fetchData() {
 *   try {
 *     const response = await api.get('/data');
 *     console.log(response.data);
 *   } catch (error) {
 *     console.error('API call failed:', error);
 *   }
 * }
 *
 * // To make a POST request:
 * async function postData(payload: any) {
 *   try {
 *     const response = await api.post('/items', payload);
 *     console.log('Item created:', response.data);
 *   } catch (error) {
 *     console.error('Failed to create item:', error);
 *   }
 * }
 */

/**
 * The base URL for the API.
 * Defaults to '/api' if `process.env.REACT_APP_API_BASE_URL` is not defined.
 * @type {string}
 */
const API_BASE_URL: string = process.env.REACT_APP_API_BASE_URL || '/api';

/**
 * Creates an Axios instance with default configurations.
 * @type {AxiosInstance}
 */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor:
 * Adds an authorization token to the request headers if available in localStorage.
 *
 * @param {AxiosRequestConfig} config - The Axios request configuration.
 * @returns {AxiosRequestConfig} The modified request configuration.
 *
 * @example
 * // Unit Test Example (using Jest and `jest-localstorage-mock` or similar)
 * // Mock localStorage and axios.create for testing interceptors
 *
 * import axios from 'axios';
 * import api from './api'; // Assuming 'api' is the exported instance
 *
 * jest.mock('axios', () => ({
 *   create: jest.fn(() => ({
 *     interceptors: {
 *       request: { use: jest.fn() },
 *       response: { use: jest.fn() },
 *     },
 *     get: jest.fn(),
 *     post: jest.fn(),
 *     // ... other methods if needed
 *   })),
 * }));
 *
 * describe('API Request Interceptor', () => {
 *   beforeEach(() => {
 *     // Clear all mocks before each test
 *     jest.clearAllMocks();
 *     // Re-import api to ensure interceptors are re-applied after mocks
 *     jest.resetModules();
 *     require('./api'); // Re-import the module to re-run the interceptor setup
 *   });
 *
 *   it('should add Authorization header if token exists in localStorage', async () => {
 *     const mockToken = 'test-jwt-token';
 *     localStorage.setItem('authToken', mockToken);
 *
 *     const mockConfig: AxiosRequestConfig = { headers: {} };
 *     // Manually call the interceptor logic
 *     const requestInterceptor = (axios.create as jest.Mock).mock.results[0].value.interceptors.request.use.mock.calls[0][0];
 *     const modifiedConfig = requestInterceptor(mockConfig);
 *
 *     expect(modifiedConfig.headers).toHaveProperty('Authorization', `Bearer ${mockToken}`);
 *     localStorage.removeItem('authToken'); // Clean up
 *   });
 *
 *   it('should not add Authorization header if token does not exist in localStorage', async () => {
 *     localStorage.removeItem('authToken'); // Ensure no token
 *
 *     const mockConfig: AxiosRequestConfig = { headers: {} };
 *     const requestInterceptor = (axios.create as jest.Mock).mock.results[0].value.interceptors.request.use.mock.calls[0][0];
 *     const modifiedConfig = requestInterceptor(mockConfig);
 *
 *     expect(modifiedConfig.headers).not.toHaveProperty('Authorization');
 *   });
 *
 *   it('should preserve existing headers', async () => {
 *     const mockToken = 'test-jwt-token';
 *     localStorage.setItem('authToken', mockToken);
 *
 *     const mockConfig: AxiosRequestConfig = { headers: { 'X-Custom-Header': 'value' } };
 *     const requestInterceptor = (axios.create as jest.Mock).mock.results[0].value.interceptors.request.use.mock.calls[0][0];
 *     const modifiedConfig = requestInterceptor(mockConfig);
 *
 *     expect(modifiedConfig.headers).toHaveProperty('Authorization', `Bearer ${mockToken}`);
 *     expect(modifiedConfig.headers).toHaveProperty('X-Custom-Header', 'value');
 *     localStorage.removeItem('authToken');
 *   });
 * });
 */
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('authToken'); // Or sessionStorage, or a cookie
    if (token) {
      // Ensure headers object exists
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    // Do something with request error
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor:
 * Handles successful responses and errors globally.
 *
 * @param {AxiosResponse} response - The Axios response object.
 * @returns {AxiosResponse} The response object.
 *
 * @param {AxiosError} error - The Axios error object.
 * @returns {Promise<AxiosError>} A rejected promise with the error.
 *
 * @example
 * // Unit Test Example (using Jest)
 * // Mock localStorage and axios.create for testing interceptors
 *
 * import axios from 'axios';
 * import api from './api'; // Assuming 'api' is the exported instance
 *
 * jest.mock('axios', () => ({
 *   create: jest.fn(() => ({
 *     interceptors: {
 *       request: { use: jest.fn() },
 *       response: { use: jest.fn() },
 *     },
 *     get: jest.fn(),
 *     post: jest.fn(),
 *     // ... other methods if needed
 *   })),
 * }));
 *
 * describe('API Response Interceptor', () => {
 *   let consoleErrorSpy: jest.SpyInstance;
 *
 *   beforeEach(() => {
 *     jest.clearAllMocks();
 *     jest.resetModules();
 *     require('./api'); // Re-import the module to re-run the interceptor setup
 *     consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
 *   });
 *
 *   afterEach(() => {
 *     consoleErrorSpy.mockRestore();
 *   });
 *
 *   it('should return the response for successful requests', async () => {
 *     const mockResponse: AxiosResponse = {
 *       data: { message: 'Success' },
 *       status: 200,
 *       statusText: 'OK',
 *       headers: {},
 *       config: {},
 *     };
 *     const responseInterceptor = (axios.create as jest.Mock).mock.results[0].value.interceptors.response.use.mock.calls[0][0];
 *     const result = responseInterceptor(mockResponse);
 *
 *     expect(result).toEqual(mockResponse);
 *     expect(consoleErrorSpy).not.toHaveBeenCalled();
 *   });
 *
 *   it('should handle 401 Unauthorized errors', async () => {
 *     const mockError: AxiosError = {
 *       name: 'AxiosError',
 *       message: 'Request failed with status code 401',
 *       config: {},
 *       isAxiosError: true,
 *       response: {
 *         data: { message: 'Unauthorized' },
 *         status: 401,
 *         statusText: 'Unauthorized',
 *         headers: {},
 *         config: {},
 *       },
 *       toJSON: () => ({}),
 *     };
 *
 *     const errorInterceptor = (axios.create as jest.Mock).mock.results[0].value.interceptors.response.use.mock.calls[0][1];
 *
 *     await expect(errorInterceptor(mockError)).rejects.toEqual(mockError);
 *     expect(consoleErrorSpy).toHaveBeenCalledWith('API Response Error (401):', mockError.response?.data);
 *     // You might add a test here for redirecting or clearing token if that logic was implemented
 *   });
 *
 *   it('should handle 403 Forbidden errors', async () => {
 *     const mockError: AxiosError = {
 *       name: 'AxiosError',
 *       message: 'Request failed with status code 403',
 *       config: {},
 *       isAxiosError: true,
 *       response: {
 *         data: { message: 'Forbidden' },
 *         status: 403,
 *         statusText: 'Forbidden',
 *         headers: {},
 *         config: {},
 *       },
 *       toJSON: () => ({}),
 *     };
 *
 *     const errorInterceptor = (axios.create as jest.Mock).mock.results[0].value.interceptors.response.use.mock.calls[0][1];
 *
 *     await expect(errorInterceptor(mockError)).rejects.toEqual(mockError);
 *     expect(consoleErrorSpy).toHaveBeenCalledWith('API Response Error (403):', mockError.response?.data);
 *   });
 *
 *   it('should handle generic 500 Internal Server Error', async () => {
 *     const mockError: AxiosError = {
 *       name: 'AxiosError',
 *       message: 'Request failed with status code 500',
 *       config: {},
 *       isAxiosError: true,
 *       response: {
 *         data: { message: 'Internal Server Error' },
 *         status: 500,
 *         statusText: 'Internal Server Error',
 *         headers: {},
 *         config: {},
 *       },
 *       toJSON: () => ({}),
 *     };
 *
 *     const errorInterceptor = (axios.create as jest.Mock).mock.results[0].value.interceptors.response.use.mock.calls[0][1];
 *
 *     await expect(errorInterceptor(mockError)).rejects.toEqual(mockError);
 *     expect(consoleErrorSpy).toHaveBeenCalledWith('API Response Error (500):', mockError.response?.data);
 *   });
 *
 *   it('should handle network errors (no response)', async () => {
 *     const mockError: AxiosError = {
 *       name: 'AxiosError',
 *       message: 'Network Error',
 *       config: {},
 *       isAxiosError: true,
 *       toJSON: () => ({}),
 *     };
 *
 *     const errorInterceptor = (axios.create as jest.Mock).mock.results[0].value.interceptors.response.use.mock.calls[0][1];
 *
 *     await expect(errorInterceptor(mockError)).rejects.toEqual(mockError);
 *     expect(consoleErrorSpy).toHaveBeenCalledWith('API Network Error:', mockError.message);
 *   });
 *
 *   it('should handle request timeout errors', async () => {
 *     const mockError: AxiosError = {
 *       name: 'AxiosError',
 *       message: 'timeout of 10000ms exceeded',
 *       code: 'ECONNABORTED',
 *       config: {},
 *       isAxiosError: true,
 *       toJSON: () => ({}),
 *     };
 *
 *     const errorInterceptor = (axios.create as jest.Mock).mock.results[0].value.interceptors.response.use.mock.calls[0][1];
 *
 *     await expect(errorInterceptor(mockError)).rejects.toEqual(mockError);
 *     expect(consoleErrorSpy).toHaveBeenCalledWith('API Request Timeout:', mockError.message);
 *   });
 * });
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Any status code that lies within the range of 2xx causes this function to trigger
    return response;
  },
  (error: AxiosError) => {
    // Any status codes that falls outside the range of 2xx causes this function to trigger
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      switch (status) {
        case 400:
          console.error('API Response Error (400 Bad Request):', data);
          // Handle bad request, e.g., display validation errors
          break;
        case 401:
          console.error('API Response Error (401 Unauthorized):', data);
          // Handle unauthorized access, e.g., redirect to login, clear token
          // Example: localStorage.removeItem('authToken'); window.location.href = '/login';
          break;
        case 403:
          console.error('API Response Error (403 Forbidden):', data);
          // Handle forbidden access, e.g., show access denied message
          break;
        case 404:
          console.error('API Response Error (404 Not Found):', data);
          // Handle not found errors
          break;
        case 500:
          console.error('API Response Error (500 Internal Server Error):', data);
          // Handle server errors, e.g., show a generic error message
          break;
        default:
          console.error(`API Response Error (${status}):`, data);
          break;
      }
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      if (error.code === 'ECONNABORTED') {
        console.error('API Request Timeout:', error.message);
      } else {
        console.error('API No Response Received:', error.request);
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;