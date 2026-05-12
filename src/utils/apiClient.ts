import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * @typedef {object} ApiErrorDetail
 * @property {string} field - The field name that caused the error (e.g., "email").
 * @property {string} message - A specific error message for the field (e.g., "Email is invalid").
 */

/**
 * @typedef {object} ApiErrorResponseData
 * @property {string} message - A general, user-friendly error message.
 * @property {string} [code] - An optional application-specific error code (e.g., "VALIDATION_ERROR").
 * @property {ApiErrorDetail[]} [details] - Optional array of detailed error messages, often for validation errors.
 */

/**
 * Configuration for the API client.
 * @interface ApiClientConfig
 * @property {string} baseURL - The base URL for all API requests.
 * @property {number} [timeout=30000] - The request timeout in milliseconds.
 * @property {string} [authTokenKey='authToken'] - The key used to store the authentication token in localStorage.
 * @property {function(AxiosError<ApiErrorResponseData>): Promise<any>} [onUnauthorized] - Callback for 401 Unauthorized errors.
 * @property {function(AxiosError<ApiErrorResponseData>): Promise<any>} [onForbidden] - Callback for 403 Forbidden errors.
 * @property {function(AxiosError<ApiErrorResponseData>): Promise<any>} [onNotFound] - Callback for 404 Not Found errors.
 * @property {function(AxiosError<ApiErrorResponseData>): Promise<any>} [onServerError] - Callback for 5xx Server errors.
 * @property {function(AxiosError<ApiErrorResponseData>): Promise<any>} [onNetworkError] - Callback for network errors (no response).
 * @property {function(string, AxiosError<ApiErrorResponseData> | undefined): void} [onErrorNotification] - Callback to display error notifications to the user.
 */
interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  authTokenKey?: string;
  onUnauthorized?: (error: AxiosError<ApiErrorResponseData>) => Promise<any>;
  onForbidden?: (error: AxiosError<ApiErrorResponseData>) => Promise<any>;
  onNotFound?: (error: AxiosError<ApiErrorResponseData>) => Promise<any>;
  onServerError?: (error: AxiosError<ApiErrorResponseData>) => Promise<any>;
  onNetworkError?: (error: AxiosError<ApiErrorResponseData>) => Promise<any>;
  onErrorNotification?: (message: string, error?: AxiosError<ApiErrorResponseData>) => void;
}

/**
 * Creates and configures an Axios instance for API communication.
 * This utility provides a robust API client with built-in interceptors for
 * request modification (e.g., adding auth tokens) and response error handling
 * (e.g., unauthorized, server errors, network issues).
 *
 * @param {ApiClientConfig} config - Configuration object for the API client.
 * @returns {AxiosInstance} An Axios instance configured with interceptors.
 *
 * @example
 * // --- Usage Example ---
 *
 * // 1. Initialize the API client
 * const api = apiClient({
 *   baseURL: 'https://api.example.com/v1',
 *   timeout: 15000,
 *   authTokenKey: 'myAppAuthToken',
 *   onUnauthorized: async (error) => {
 *     console.error('Unauthorized! Redirecting to login...', error.response?.data?.message);
 *     // Example: Clear token, redirect to login page
 *     localStorage.removeItem('myAppAuthToken');
 *     window.location.href = '/login';
 *     return Promise.reject(error); // Re-throw to stop further processing
 *   },
 *   onErrorNotification: (message, error) => {
 *     console.error('API Error Notification:', message, error);
 *     // Example: Display a toast notification
 *     // import { toast } from 'react-toastify';
 *     // toast.error(message);
 *   }
 * });
 *
 * // 2. Make requests
 * async function fetchData() {
 *   try {
 *     // Assuming the backend returns { id: 1, name: 'User 1' }
 *     const response = await api.get<{ id: number; name: string }>('/users/1');
 *     console.log('User data:', response.data);
 *   } catch (error) {
 *     // This catch block will only be reached if the specific error handler
 *     // (e.g., onUnauthorized) re-throws the error, or if no specific handler
 *     // was provided for that error type.
 *     console.error('Failed to fetch user:', error);
 *     if (axios.isAxiosError(error)) {
 *       console.error('Axios error details:', error.response?.data);
 *     }
 *   }
 * }
 *
 * async function createUser(userData: { name: string; email: string }) {
 *   try {
 *     const response = await api.post<{ id: number; name: string; email: string }>('/users', userData);
 *     console.log('User created:', response.data);
 *   } catch (error) {
 *     console.error('Failed to create user:', error);
 *     if (axios.isAxiosError(error)) {
 *       console.error('Axios error details:', error.response?.data?.details); // e.g., validation errors
 *     }
 *   }
 * }
 *
 * // 3. Set auth token (e.g., after login)
 * // localStorage.setItem('myAppAuthToken', 'your_jwt_token_here');
 * // fetchData();
 *
 * // 4. Simulate an error (e.g., 404)
 * // api.get('/non-existent-endpoint').catch(err => console.error('Caught 404 error in caller:', err.message));
 *
 * // 5. Simulate a network error (e.g., by going offline)
 * // api.get('/some-endpoint').catch(err => console.error('Caught network error in caller:', err.message));
 */
export const apiClient = (config: ApiClientConfig): AxiosInstance => {
  const {
    baseURL,
    timeout = 30000, // Default timeout of 30 seconds
    authTokenKey = 'authToken',
    onUnauthorized,
    onForbidden,
    onNotFound,
    onServerError,
    onNetworkError,
    onErrorNotification,
  } = config;

  const instance: AxiosInstance = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  /**
   * Request Interceptor: Adds authorization token to headers.
   * @param {AxiosRequestConfig} requestConfig - The request configuration.
   * @returns {AxiosRequestConfig} The modified request configuration.
   */
  instance.interceptors.request.use(
    (requestConfig) => {
      const token = localStorage.getItem(authTokenKey);
      if (token) {
        // Ensure headers object exists
        requestConfig.headers = requestConfig.headers || {};
        // Add Authorization header
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }
      return requestConfig;
    },
    (error: AxiosError) => {
      // This block handles errors that occur *before* the request is sent (e.g., config error)
      console.error('API Request Setup Error:', error.message, error.config?.url);
      onErrorNotification?.(`Request setup failed: ${error.message}`, error);
      return Promise.reject(error);
    }
  );

  /**
   * Response Interceptor: Handles successful responses and error responses.
   * @param {AxiosResponse} response - The response object.
   * @returns {AxiosResponse} The response object.
   */
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // For successful responses, simply return the response.
      // Callers can then access response.data, response.status, etc.
      return response;
    },
    async (error: AxiosError<ApiErrorResponseData>) => {
      const