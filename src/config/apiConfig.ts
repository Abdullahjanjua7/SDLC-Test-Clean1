/**
 * @file src/config/apiConfig.ts
 * @description Configuration for API base URL and specific endpoints.
 * This file centralizes all API-related paths for easy management and updates across the application.
 */

/**
 * Determines the base URL for the API based on the current environment.
 * It checks `process.env.NODE_ENV` to differentiate between development and production.
 * Environment variables (e.g., `REACT_APP_API_BASE_URL_PROD`, `REACT_APP_API_BASE_URL_DEV`)
 * are used for flexibility, falling back to sensible defaults if not set.
 *
 * @returns {string} The base URL for API requests.
 */
const getApiBaseUrl = (): string => {
  if (process.env.NODE_ENV === 'production') {
    // Production API base URL
    // Expects an environment variable like REACT_APP_API_BASE_URL_PROD
    return process.env.REACT_APP_API_BASE_URL_PROD || 'https://api.yourproductiondomain.com/v1';
  } else if (process.env.NODE_ENV === 'development') {
    // Development API base URL
    // Expects an environment variable like REACT_APP_API_BASE_URL_DEV
    return process.env.REACT_APP_API_BASE_URL_DEV || 'http://localhost:3001/v1';
  } else {
    // Default for other environments (e.g., test, staging) or if NODE_ENV is not set
    // Expects an environment variable like REACT_APP_API_BASE_URL
    return process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/v1';
  }
};

/**
 * The resolved base URL for all API requests.
 * This constant holds the determined base URL for the current environment.
 */
const API_BASE_URL: string = getApiBaseUrl();

/**
 * Defines the structure for our API endpoints.
 * This interface provides type safety and autocompletion when accessing endpoints.
 * Nested objects can be used to categorize endpoints (e.g., 'auth', 'users').
 */
interface ApiEndpoints {
  users: {
    base: string;
    profile: string;
    // Add more user-related endpoints here
  };
  products: {
    base: string;
    details: (id: string) => string; // Example of a dynamic endpoint
    // Add more product-related endpoints here
  };
  auth: {
    login: string;
    register: string;
    refreshToken: string;
    logout: string;
  };
  // Add more top-level categories as needed
  healthCheck: string;
}

/**
 * An object containing all specific API endpoints.
 * These are relative paths that will be appended to the `API_BASE_URL`.
 * Using relative paths makes the configuration environment-agnostic.
 */
const endpoints: ApiEndpoints = {
  users: {
    base: '/users',
    profile: '/users/profile',
  },
  products: {
    base: '/products',
    details: (id: string) => `/products/${id}`, // Dynamic endpoint example
  },
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refreshToken: '/auth/refresh-token',
    logout: '/auth/logout',
  },
  healthCheck: '/health',
};

/**
 * The main API configuration object.
 * Exports the base URL and all defined endpoints, along with a utility function
 * to construct full URLs.
 */
export const apiConfig = {
  /**
   * The base URL for all API requests.
   * This URL is determined by the current environment (development, production, etc.).
   */
  baseURL: API_BASE_URL,

  /**
   * An object containing all specific API endpoints.
   * Each key represents a resource or category, and its value is the relative path
   * or a function to generate a path for dynamic endpoints.
   */
  endpoints: endpoints,

  /**
   * A utility function to construct a full absolute URL for a given API endpoint.
   * This function handles joining the base URL and the endpoint path correctly,
   * ensuring proper URL formatting.
   *
   * @param {string} endpointPath The relative path of the endpoint (e.g., '/users', '/products/123').
   * @returns {string} The full absolute URL for the endpoint.
   * @throws {Error} If an invalid or empty endpoint path is provided.
   */
  getEndpointUrl: (endpointPath: string): string => {
    if (!endpointPath || typeof endpointPath !== 'string') {
      // Log an error and throw to indicate a critical configuration or usage issue.
      // This helps catch mistakes early during development.
      console.error('API Config Error: Invalid or empty endpoint path provided.', { endpointPath });
      throw new Error('Invalid endpoint path provided to getEndpointUrl.');
    }

    // Ensure the base URL doesn't end with a slash and the endpoint path starts with one
    // to prevent double slashes or missing slashes.
    const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const path = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;

    return `${base}${path}`;
  },
};

// Example usage (for internal testing or documentation, not part of the export):
/*
console.log('API Base URL:', apiConfig.baseURL);
console.log('Users Base Endpoint:', apiConfig.endpoints.users.base);
console.log('Login Endpoint:', apiConfig.endpoints.auth.login);
console.log('Full Users URL:', apiConfig.getEndpointUrl(apiConfig.endpoints.users.base));
console.log('Full Product Details URL (ID 123):', apiConfig.getEndpointUrl(apiConfig.endpoints.products.details('123')));

try {
  // Example of intentionally providing an invalid path to test error handling
  apiConfig.getEndpointUrl(null as any);
} catch (error: any) {
  console.error('Caught expected error:', error.message);
}
*/