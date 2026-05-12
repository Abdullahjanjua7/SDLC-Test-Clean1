/**
 * @file src/config/api.ts
 * @description API base URL and endpoint configurations.
 * This file centralizes all API-related configurations, making it easier to manage
 * and update endpoints and base URLs across different environments.
 */

/**
 * Determines the base URL for the API based on the current environment.
 * It prioritizes environment variables for flexibility in deployment.
 *
 * @returns {string} The base URL for API requests.
 */
const getApiBaseUrl = (): string => {
  // Use a specific environment variable for the API base URL.
  // For example, `REACT_APP_API_BASE_URL` for Create React App,
  // or `VITE_API_BASE_URL` for Vite, or simply `API_BASE_URL` for Node.js environments.
  // We'll use `process.env.REACT_APP_API_BASE_URL` as a common example for browser-based apps.
  // If running in a Node.js environment directly, `process.env.API_BASE_URL` might be more appropriate.
  const envApiBaseUrl = process.env.REACT_APP_API_BASE_URL || process.env.API_BASE_URL;

  if (envApiBaseUrl) {
    return envApiBaseUrl;
  }

  // Fallback for development environment if no environment variable is set.
  // This is a common practice to ensure the app works out-of-the-box in dev.
  const defaultDevUrl = 'http://localhost:3000/api';

  // Log a warning if the base URL is not explicitly set, especially in non-development environments.
  // This helps in identifying missing configurations during deployment.
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
    console.warn(
      'API_BASE_URL environment variable is not set. Using default development URL. ' +
      'Please ensure it is configured correctly for production deployments.'
    );
  }

  return defaultDevUrl;
};

/**
 * The resolved base URL for the API.
 * All endpoint paths will be relative to this URL.
 */
export const API_BASE_URL: string = getApiBaseUrl();

/**
 * Defines specific API endpoints.
 * This object groups related endpoints for better organization.
 */
export const API_ENDPOINTS = Object.freeze({
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refreshToken: '/auth/refresh-token',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  users: {
    getAll: '/users',
    getById: (id: string | number) => `/users/${id}`,
    create: '/users',
    update: (id: string | number) => `/users/${id}`,
    delete: (id: string | number) => `/users/${id}`,
    profile: '/users/profile',
  },
  products: {
    getAll: '/products',
    getById: (id: string | number) => `/products/${id}`,
    create: '/products',
    update: (id: string | number) => `/products/${id}`,
    delete: (id: string | number) => `/products/${id}`,
  },
  orders: {
    getAll: '/orders',
    getById: (id: string | number) => `/orders/${id}`,
    create: '/orders',
    updateStatus: (id: string | number) => `/orders/${id}/status`,
  },
  // Add other categories of endpoints as needed
  // Example:
  // categories: {
  //   getAll: '/categories',
  //   getById: (id: string | number) => `/categories/${id}`,
  // },
});

/**
 * Example of how to construct a full API URL:
 * const loginUrl = `${API_BASE_URL}${API_ENDPOINTS.auth.login}`;
 * const userProfileUrl = `${API_BASE_URL}${API_ENDPOINTS.users.profile}`;
 * const specificProductUrl = `${API_BASE_URL}${API_ENDPOINTS.products.getById(123)}`;
 */