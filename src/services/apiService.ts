import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * Interface for a standardized successful API response structure.
 * This assumes the backend wraps successful data in a 'data' property.
 * @template T The type of the data payload.
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Interface for structured error details that might come from the backend.
 */
export interface ApiErrorDetails {
  code?: string;
  message: string;
  details?: Record<string, any>; // e.g., validation errors, specific error codes
}

/**
 * Custom error class for API-related errors.
 * Provides a consistent way to handle and report errors from the API service.
 */
export class ApiError extends Error {
  /** The HTTP status code of the response, if available. */
  public readonly statusCode?: number;
  /** Structured error details from the backend, if available. */
  public readonly details?: ApiErrorDetails;
  /** The original error object (e.g., AxiosError), for debugging or advanced handling. */
  public readonly originalError?: unknown;

  /**
   * Creates an instance of ApiError.
   * @param message A human-readable error message.
   * @param statusCode The HTTP status code of the response.
   * @param details Structured error details from the backend.
   * @param originalError The original error object that caused this ApiError.
   */
  constructor(
    message: string,
    statusCode?: number,
    details?: ApiErrorDetails,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    this.originalError = originalError;

    // Set the prototype explicitly to ensure `instanceof` works correctly
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * `ApiService` is an Axios-based service for making API calls to the backend.
 * It provides methods for common HTTP verbs (GET, POST, PUT, DELETE, PATCH)
 * and includes centralized error handling and request configuration.
 */
class ApiService {
  private axiosInstance: AxiosInstance;

  /**
   * Creates an instance of ApiService.
   * @param baseURL The base URL for all API requests (e.g., 'https://api.example.com/v1').
   * @param commonHeaders Optional common headers to include with every request (e.g., 'X-API-Key').
   * @param timeout Optional request timeout in milliseconds. Default is 30000ms (30 seconds).
   */
  constructor(baseURL: string, commonHeaders: Record<string, string> = {}, timeout: number = 30000) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...commonHeaders,
      },
      timeout,
    });

    // Add a response interceptor to handle errors globally and transform them into ApiError.
    this.axiosInstance.interceptors.response.use(
      (response) => response, // For successful responses, just pass them through
      (error) => {
        // For errors, process them through handleError and reject the promise with an ApiError
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Sets or updates an authorization token in the default headers.
   * If `token` is null or undefined, the Authorization header will be removed.
   * @param token The JWT token string (e.g., 'eyJhbGciOiJIUzI1Ni...') or null to remove.
   */
  public setAuthToken(token: string | null): void {
    if (token) {
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.axiosInstance.defaults.headers.common['Authorization'];
    }
  }

  /**
   * A private helper method to process Axios errors and transform them into a custom `ApiError`.
   * This method is primarily used by the Axios response interceptor.
   * @param error The error caught from an Axios request.
   * @returns An `ApiError` instance.
   */
  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      const axiosError: AxiosError<ApiErrorDetails> = error;

      if (axiosError.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx.
        const { status, data } = axiosError.response;
        const message = data?.message || axiosError.message || `Request failed with status ${status}`;
        return new ApiError(message, status, data, axiosError);
      } else if (axiosError.request) {
        // The request was made but no response was received.
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js.
        return new ApiError('Network Error: No response received from server.', undefined, undefined, axiosError);
      } else {
        // Something happened in setting up the request that triggered an Error.
        return new ApiError(`Request setup error: ${axiosError.message}`, undefined, undefined, axiosError);
      }
    } else if (error instanceof Error) {
      // Generic JavaScript error (e.g., from a custom interceptor or other code).
      return new ApiError(error.message, undefined, undefined, error);
    } else {
      // Unknown error type.
      return new ApiError('An unknown error occurred.', undefined, undefined, error);
    }
  }

  /**
   * Performs a GET request to the specified path.
   * @template T The expected type of the `data` property in the successful API response.
   * @param path The API endpoint path (e.g., '/users/123').
   * @param config Optional Axios request configuration (e.g., params, headers).
   * @returns A promise that resolves with the `ApiSuccessResponse<T>` containing the data.
   * @throws {ApiError} If the request fails (e.g., network error, server error).
   */
  public async get<T>(path: string, config?: AxiosRequestConfig): Promise<ApiSuccessResponse<T>> {
    const response: AxiosResponse<ApiSuccessResponse<T>> = await this.axiosInstance.get(path, config);
    return response.data;
  }

  /**
   * Performs a POST request to the specified path with the given data.
   * @template T The expected type of the `data` property in the successful API response.
   * @template D The type of the data payload to send in the request body.
   * @param path The API endpoint path (e.g., '/users').
   * @param data The data payload to send in the request body.
   * @param config Optional Axios request configuration.
   * @returns A promise that resolves with the `ApiSuccessResponse<T>` containing the data.
   * @throws {ApiError} If the request fails.
   */
  public async post<T, D>(path: string, data: D, config?: AxiosRequestConfig): Promise<ApiSuccessResponse<T>> {
    const response: AxiosResponse<ApiSuccessResponse<T>> = await this.axiosInstance.post(path, data, config);
    return response.data;
  }

  /**
   * Performs a PUT request to the specified path with the given data.
   * @template T The expected type of the `data` property in the successful API response.
   * @template D The type of the data payload to send in the request body.
   * @param path The API endpoint path (e.g., '/users/123').
   * @param data The data payload to send in the request body.
   * @param config Optional Axios request configuration.
   * @returns A promise that resolves with the `ApiSuccessResponse<T>` containing the data.
   * @throws {ApiError} If the request fails.
   */
  public async put<T, D>(path: string, data: D, config?: AxiosRequestConfig): Promise<ApiSuccessResponse<T>> {
    const response: AxiosResponse<ApiSuccessResponse<T>> = await this.axiosInstance.put(path, data, config);
    return response.data;
  }

  /**
   * Performs a DELETE request to the specified path.
   * @template T The expected type of the `data` property in the successful API response.
   * @param path The API endpoint path (e.g., '/users/123').
   * @param config Optional Axios request configuration.
   * @returns A promise that resolves with the `ApiSuccessResponse<T>` containing the data.
   * @throws {ApiError} If the request fails.
   */
  public async delete<T>(path: string, config?: AxiosRequestConfig): Promise<ApiSuccessResponse<T>> {
    const response: AxiosResponse<ApiSuccessResponse<T>> = await this.axiosInstance.delete(path, config);
    return response.data;
  }

  /**
   * Performs a PATCH request to the specified path with the given data.
   * @template T The expected type of the `data` property in the successful API response.
   * @template D The type of the data payload to send in the request body.
   * @param path The API endpoint path (e.g., '/users/123').
   * @param data The data payload to send in the request body.
   * @param config Optional Axios request configuration.
   * @returns A promise that resolves with the `ApiSuccessResponse<T>` containing the data.
   * @throws {ApiError} If the request fails.
   */
  public async patch<T, D>(path: string, data: D, config?: AxiosRequestConfig): Promise<ApiSuccessResponse<T>> {
    const response: AxiosResponse<ApiSuccessResponse<T>> = await this.axiosInstance.patch(path, data, config);
    return response.data;
  }
}

// Export the ApiService class for consumers to instantiate.
export { ApiService };