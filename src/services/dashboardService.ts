/**
 * @file dashboardService.ts
 * @description Service layer for making API calls to fetch dashboard data.
 */

/**
 * Interface representing the structure of a single dashboard data point.
 * Extend this with all relevant fields for your dashboard.
 */
export interface DashboardData {
  /** The total number of sales. */
  totalSales: number;
  /** The total number of orders. */
  totalOrders: number;
  /** The average value of an order. */
  averageOrderValue: number;
  /** A list of sales broken down by product. */
  salesByProduct: Array<{ productId: string; productName: string; sales: number }>;
  /** A list of sales broken down by region. */
  salesByRegion: Array<{ region: string; sales: number }>;
  /** The date and time when the data was last updated. */
  lastUpdated: string;
  // Add more specific dashboard metrics as needed
  [key: string]: any; // Allow for flexible additional properties
}

/**
 * Interface for options that can be passed when fetching dashboard data.
 */
export interface FetchDashboardOptions {
  /** Optional start date for data filtering (e.g., 'YYYY-MM-DD'). */
  startDate?: string;
  /** Optional end date for data filtering (e.g., 'YYYY-MM-DD'). */
  endDate?: string;
  /** Optional region to filter data by. */
  region?: string;
  /** Optional product category to filter data by. */
  productCategory?: string;
  /** Any other custom filters as key-value pairs. */
  [key: string]: string | undefined;
}

/**
 * Generic interface for a standardized API response.
 * @template T The type of the data payload if the request was successful.
 */
export interface ApiResponse<T> {
  /** Indicates whether the API call was successful. */
  success: boolean;
  /** The data payload, present if `success` is true. */
  data?: T;
  /** A message providing more details about the response (e.g., success message, error message). */
  message?: string;
  /** The HTTP status code of the response. */
  statusCode?: number;
  /** An error object or string, present if `success` is false. */
  error?: string | object;
}

/**
 * Service class for interacting with the dashboard API endpoint.
 * This class encapsulates all API calls related to fetching dashboard data,
 * providing a clean interface for components to consume.
 */
export class DashboardService {
  private readonly API_BASE_URL: string;

  /**
   * Creates an instance of DashboardService.
   * @param baseURL The base URL for the dashboard API endpoint.
   *                Defaults to '/api/dashboard' if not provided.
   */
  constructor(baseURL: string = '/api/dashboard') {
    this.API_BASE_URL = baseURL;
  }

  /**
   * Fetches dashboard data from the API.
   * This method constructs the request URL with optional query parameters,
   * handles network requests, and processes the API response, including error handling.
   *
   * @param options Optional parameters to filter or customize the dashboard data request.
   * @returns A Promise that resolves to an `ApiResponse<DashboardData>`.
   *          The `success` property indicates the outcome, and `data` or `error`
   *          will contain the relevant payload.
   */
  public async fetchDashboardData(options?: FetchDashboardOptions): Promise<ApiResponse<DashboardData>> {
    const queryParams = this.buildQueryParams(options);
    const url = `${this.API_BASE_URL}${queryParams ? `?${queryParams}` : ''}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add any authorization headers if needed
          // 'Authorization': `Bearer ${yourAuthToken}`,
        },
      });

      const responseData: ApiResponse<DashboardData> = await response.json();

      if (!response.ok) {
        // If HTTP status is not 2xx, treat it as an error
        return {
          success: false,
          message: responseData.message || `API request failed with status ${response.status}`,
          statusCode: response.status,
          error: responseData.error || 'Unknown API error',
        };
      }

      // Assuming the API always returns a 'success' flag in the body for 2xx responses
      if (!responseData.success) {
        return {
          success: false,
          message: responseData.message || 'Operation failed as per API response.',
          statusCode: response.status,
          error: responseData.error || 'API reported failure.',
        };
      }

      return {
        success: true,
        data: responseData.data,
        message: responseData.message || 'Dashboard data fetched successfully.',
        statusCode: response.status,
      };
    } catch (error: any) {
      // Handle network errors or issues with parsing the response
      console.error('Error fetching dashboard data:', error);
      return {
        success: false,
        message: 'Failed to connect to the dashboard service or process response.',
        statusCode: 500, // Indicate a client-side or network error
        error: error.message || 'Network error or unexpected issue.',
      };
    }
  }

  /**
   * Builds URL query parameters from the given options object.
   * @private
   * @param options The options object containing key-value pairs for query parameters.
   * @returns A string representing the URL query parameters (e.g., "startDate=2023-01-01&region=EMEA").
   */
  private buildQueryParams(options?: FetchDashboardOptions): string {
    if (!options) {
      return '';
    }
    const params = new URLSearchParams();
    for (const key in options) {
      if (Object.prototype.hasOwnProperty.call(options, key)) {
        const value = options[key];
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      }
    }
    return params.toString();
  }
}

// Example of how to use the service:
/*
// In your component or data fetching logic:
import { DashboardService, DashboardData, ApiResponse } from './dashboardService';

const dashboardService = new DashboardService();

async function getDashboardMetrics() {
  try {
    const response: ApiResponse<DashboardData> = await dashboardService.fetchDashboardData({
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      region: 'North America'
    });

    if (response.success && response.data) {
      console.log('Dashboard Data:', response.data);
      // Update your UI with response.data
    } else {
      console.error('Failed to fetch dashboard data:', response.message, response.error);
      // Display error message to the user
    }
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    // Handle catastrophic errors
  }
}

// Call the function to fetch data
// getDashboardMetrics();
*/