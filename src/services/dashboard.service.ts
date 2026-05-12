/**
 * Interface representing a single metric item in the dashboard data.
 */
interface MetricItem {
  id: string;
  name: string;
  value: number;
  unit: string;
  change?: number; // Optional: percentage change from previous period
  trend?: 'up' | 'down' | 'neutral'; // Optional: trend indicator
}

/**
 * Interface representing a single chart series data point.
 */
interface ChartDataPoint {
  timestamp: string; // ISO date string (e.g., '2023-01-01T00:00:00Z')
  value: number;
}

/**
 * Interface representing a single chart in the dashboard data.
 */
interface DashboardChart {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'area';
  series: ChartDataPoint[];
}

/**
 * Interface representing the structure of the successful dashboard data response.
 */
interface DashboardData {
  summaryMetrics: MetricItem[];
  recentActivity: any[]; // Placeholder for a more specific activity interface if needed
  charts: DashboardChart[];
  lastUpdated: string; // ISO date string indicating when the data was last updated
}

/**
 * Interface for the structure of an API error response body.
 */
interface DashboardErrorResponse {
  code: string;
  message: string;
  details?: string; // Optional: more detailed error information
}

/**
 * Interface for options that can be passed when fetching dashboard data.
 */
interface FetchDashboardOptions {
  startDate?: string; // ISO date string (e.g., '2023-01-01')
  endDate?: string;   // ISO date string (e.g., '2023-01-31')
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year'; // Predefined periods
  userId?: string; // Optional user ID to filter data for a specific user
}

/**
 * Custom error class for DashboardService operations.
 * Provides structured error information including HTTP status,
 * API-specific error code, and details.
 */
class DashboardServiceError extends Error {
  public readonly name: string = 'DashboardServiceError';
  public readonly status?: number;
  public readonly code?: string;
  public readonly details?: string;

  /**
   * Creates an instance of DashboardServiceError.
   * @param {string} message - A human-readable error message.
   * @param {number} [status] - The HTTP status code of the response (if applicable).
   * @param {string} [code] - An API-specific error code.
   * @param {string} [details] - Additional technical details about the error.
   */
  constructor(message: string, status?: number, code?: string, details?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    // Set the prototype explicitly to ensure `instanceof` works correctly
    Object.setPrototypeOf(this, DashboardServiceError.prototype);
  }
}

/**
 * Service class for making API calls to fetch dashboard data.
 * Encapsulates all logic related to dashboard data retrieval,
 * including API endpoint construction, request execution,
 * error handling, and response parsing.
 */
class DashboardService {
  private readonly API_BASE_URL: string;
  private readonly DASHBOARD_ENDPOINT: string = '/dashboard';

  /**
   * Creates an instance of DashboardService.
   * @param {string} apiBaseUrl The base URL for the dashboard API (e.g., 'https://api.example.com/v1').
   * @throws {Error} If `apiBaseUrl` is not provided.
   */
  constructor(apiBaseUrl: string) {
    if (!apiBaseUrl) {
      throw new Error('DashboardService: apiBaseUrl cannot be empty.');
    }
    // Ensure base URL does not end with a slash to prevent double slashes when concatenating endpoints
    this.API_BASE_URL = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
  }

  /**
   * Constructs the full API URL for fetching dashboard data, including query parameters.
   * @private
   * @param {FetchDashboardOptions} options - Options for filtering dashboard data.
   * @returns {string} The full URL for the API call.
   */
  private buildApiUrl(options: FetchDashboardOptions): string {
    const url = new URL(`${this.API_BASE_URL}${this.DASHBOARD_ENDPOINT}`);

    // Append query parameters based on provided options
    if (options.startDate) {
      url.searchParams.append('startDate', options.startDate);
    }
    if (options.endDate) {
      url.searchParams.append('endDate', options.endDate);
    }
    if (options.period) {
      url.searchParams.append('period', options.period);
    }
    if (options.userId) {
      url.searchParams.append('userId', options.userId);
    }

    return url.toString();
  }

  /**
   * Fetches comprehensive dashboard data from the API.
   * This method handles constructing the request, executing it,
   * parsing the response, and robustly handling various error scenarios.
   *
   * @param {FetchDashboardOptions} [options={}] - Optional parameters to filter the dashboard data.
   * @returns {Promise<DashboardData>} A promise that resolves with the structured dashboard data.
   * @throws {DashboardServiceError} Throws a custom error if the API call fails,
   *                                 including network issues, HTTP errors, or unexpected responses.
   */
  public async fetchDashboardData(options: FetchDashboardOptions = {}): Promise<DashboardData> {
    const url = this.buildApiUrl(options);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Example: Add authorization headers if your API requires authentication
          // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      // Check if the HTTP response was successful (status code 2xx)
      if (!response.ok) {
        let errorData: DashboardErrorResponse | undefined;
        try {
          // Attempt to parse the error response body as JSON
          errorData = await response.json();
        } catch (jsonError) {
          // If the error response is not JSON or parsing fails, create a generic error
          throw new DashboardServiceError(
            `API call failed with status ${response.status}: ${response.statusText}. Could not parse error details.`,
            response.status
          );
        }

        // Throw a structured error with details from the API response
        throw new DashboardServiceError(
          errorData?.message || `Failed to fetch dashboard data. Status: ${response.status}`,
          response.status,
          errorData?.code,
          errorData?.details
        );
      }

      // Parse the successful response body as JSON
      const data: DashboardData = await response.json();
      return data;

    } catch (error) {
      // Re-throw our custom error if it was already caught and re-thrown internally
      if (error instanceof DashboardServiceError) {
        throw error;
      } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
        // This specific TypeError often indicates a network error (e.g., CORS issue, no internet connection, invalid URL)
        throw new DashboardServiceError(
          'Network error or API is unreachable. Please check your internet connection or API availability.',
          0, // No HTTP status code for network errors
          'NETWORK_ERROR',
          (error as Error).message
        );
      } else {
        // Catch any other unexpected errors during the fetch process
        throw new DashboardServiceError(
          `An unexpected error occurred while fetching dashboard data: ${(error as Error).message}`,
          undefined, // No HTTP status code
          'UNKNOWN_ERROR',
          (error as Error).stack // Include stack trace for debugging
        );
      }
    }
  }

  /**
   * Refreshes data for a specific chart on the dashboard.
   * This is an example of a more granular API call a service might offer.
   *
   * @param {string} chartId - The unique identifier of the chart to refresh.
   * @param {FetchDashboardOptions} [options={}] - Optional parameters to filter the chart data.
   * @returns {Promise<DashboardChart>} A promise that resolves with the updated chart data.
   * @throws {DashboardServiceError} Throws an error if the API call fails.
   */
  public async refreshChartData(chartId: string, options: FetchDashboardOptions = {}): Promise<DashboardChart> {
    const url = new URL(`${this.API_BASE_URL}${this.DASHBOARD_ENDPOINT}/charts/${chartId}`);

    if (options.startDate) url.searchParams.append('startDate', options.startDate);
    if (options.endDate) url.searchParams.append('endDate', options.endDate);
    if (options.period) url.searchParams.append('period', options.period);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorData: DashboardErrorResponse | undefined;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          throw new DashboardServiceError(
            `API call failed for chart ${chartId} with status ${response.status}: ${response.statusText}.`,
            response.status
          );
        }
        throw new DashboardServiceError(
          errorData?.message || `Failed to refresh chart ${chartId}. Status: ${response.status}`,
          response.status,
          errorData?.code,
          errorData?.details
        );
      }

      const data: DashboardChart = await response.json();
      return data;

    } catch (error) {
      if (error instanceof DashboardServiceError) {
        throw error;
      } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new DashboardServiceError(
          `Network error or API is unreachable while refreshing chart ${chartId}.`,
          0,
          'NETWORK_ERROR',
          (error as Error).message
        );
      } else {
        throw new DashboardServiceError(
          `An unexpected error occurred while refreshing chart ${chartId}: ${(error as Error).message}`,
          undefined,
          'UNKNOWN_ERROR',
          (error as Error).stack
        );
      }
    }
  }
}

// Export the service class and all relevant interfaces for use in other modules.
export {
  DashboardService,
  DashboardServiceError,
  DashboardData,
  MetricItem,
  DashboardChart,
  ChartDataPoint,
  DashboardErrorResponse,
  FetchDashboardOptions,
};