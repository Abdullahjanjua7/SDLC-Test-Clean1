// Save original process.env to restore it after tests
const originalEnv = process.env;

describe('apiConfig', () => {
  let consoleErrorSpy: jest.SpyInstance;

  // Reset modules and process.env before each test to ensure isolation
  beforeEach(() => {
    jest.resetModules(); // Clears the module cache, allowing re-import with new env vars
    process.env = { ...originalEnv }; // Restore original env vars for a clean slate
  });

  // Restore original process.env and console.error after each test
  afterEach(() => {
    process.env = originalEnv; // Restore original process.env
    if (consoleErrorSpy) {
      consoleErrorSpy.mockRestore(); // Restore original console.error
    }
  });

  describe('baseURL determination (getApiBaseUrl)', () => {
    const defaultProdUrl = 'https://api.yourproductiondomain.com/v1';
    const defaultDevUrl = 'http://localhost:3001/v1';

    it('should return production URL from REACT_APP_API_BASE_URL_PROD if NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';
      process.env.REACT_APP_API_BASE_URL_PROD = 'https://custom.prod.com/api';
      const { apiConfig } = require('../src/config/apiConfig');
      expect(apiConfig.baseURL).toBe('https://custom.prod.com/api');
    });

    it('should return default production URL if NODE_ENV is production and REACT_APP_API_BASE_URL_PROD is not set', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.REACT_APP_API_BASE_URL_PROD;
      const { apiConfig } = require('../src/config/apiConfig');
      expect(apiConfig.baseURL).toBe(defaultProdUrl);
    });

    it('should return development URL from REACT_APP_API_BASE_URL_DEV if NODE_ENV is development', () => {
      process.env.NODE_ENV = 'development';
      process.env.REACT_APP_API_BASE_URL_DEV = 'http://custom.dev.com/api';
      const { apiConfig } = require('../src/config/apiConfig');
      expect(apiConfig.baseURL).toBe('http://custom.dev.com/api');
    });

    it('should return default development URL if NODE_ENV is development and REACT_APP_API_BASE_URL_DEV is not set', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.REACT_APP_API_BASE_URL_DEV;
      const { apiConfig } = require('../src/config/apiConfig');
      expect(apiConfig.baseURL).toBe(defaultDevUrl);
    });

    it('should return URL from REACT_APP_API_BASE_URL if NODE_ENV is neither production nor development', () => {
      process.env.NODE_ENV = 'test';
      process.env.REACT_APP_API_BASE_URL = 'http://custom.test.com/api';
      const { apiConfig } = require('../src/config/apiConfig');
      expect(apiConfig.baseURL).toBe('http://custom.test.com/api');
    });

    it('should return default development URL if NODE_ENV is neither production nor development and REACT_APP_API_BASE_URL is not set', () => {
      process.env.NODE_ENV = 'test';
      delete process.env.REACT_APP_API_BASE_URL;
      const { apiConfig } = require('../src/config/apiConfig');
      expect(apiConfig.baseURL).toBe(defaultDevUrl);
    });

    it('should return default development URL if NODE_ENV is not set at all', () => {
      delete process.env.NODE_ENV;
      delete process.env.REACT_APP_API_BASE_URL;
      const { apiConfig } = require('../src/config/apiConfig');
      expect(apiConfig.baseURL).toBe(defaultDevUrl);
    });
  });

  describe('endpoints object', () => {
    // Import apiConfig once for these tests, as endpoint paths are static
    let currentApiConfig: typeof import('../src/config/apiConfig').apiConfig;

    beforeAll(() => {
      // Set a default environment for consistency, though it doesn't affect endpoint paths
      process.env.NODE_ENV = 'test';
      process.env.REACT_APP_API_BASE_URL = 'http://test.api.com/v1';
      currentApiConfig = require('../src/config/apiConfig').apiConfig;
    });

    it('should have the correct top-level structure', () => {
      expect(currentApiConfig.endpoints).toBeDefined();
      expect(currentApiConfig.endpoints.users).toBeDefined();
      expect(currentApiConfig.endpoints.products).toBeDefined();
      expect(currentApiConfig.endpoints.auth).toBeDefined();
      expect(currentApiConfig.endpoints.healthCheck).toBeDefined();
    });

    it('should contain correct static user endpoints', () => {
      expect(currentApiConfig.endpoints.users.base).toBe('/users');
      expect(currentApiConfig.endpoints.users.profile).toBe('/users/profile');
    });

    it('should contain correct static auth endpoints', () => {
      expect(currentApiConfig.endpoints.auth.login).toBe('/auth/login');
      expect(currentApiConfig.endpoints.auth.register).toBe('/auth/register');
      expect(currentApiConfig.endpoints.auth.refreshToken).toBe('/auth/refresh-token');
      expect(currentApiConfig.endpoints.auth.logout).toBe('/auth/logout');
    });

    it('should contain correct healthCheck endpoint', () => {
      expect(currentApiConfig.endpoints.healthCheck).toBe('/health');
    });

    it('should correctly generate dynamic product details endpoint', () => {
      const productId = '123';
      expect(currentApiConfig.endpoints.products.base).toBe('/products');
      expect(currentApiConfig.endpoints.products.details(productId)).toBe(`/products/${productId}`);
      expect(currentApiConfig.endpoints.products.details('abc-def')).toBe(`/products/abc-def`);
    });
  });

  describe('getEndpointUrl utility function', () => {
    let currentApiConfig: typeof import('../src/config/apiConfig').apiConfig;
    const testBaseUrl = 'http://test.api.com/v1';
    const testBaseUrlTrailingSlash = 'http://test.api.com/v1/';

    beforeAll(() => {
      // Set a specific base URL for these tests to ensure consistent results
      process.env.NODE_ENV = 'test';
      process.env.REACT_APP_API_BASE_URL = testBaseUrl;
      currentApiConfig = require('../src/config/apiConfig').apiConfig;
    });

    it('should correctly combine baseURL and endpoint path starting with a slash', () => {
      const endpoint = '/users';
      expect(currentApiConfig.getEndpointUrl(endpoint)).toBe(`${testBaseUrl}${endpoint}`);
    });

    it('should correctly combine baseURL and endpoint path not starting with a slash', () => {
      const endpoint = 'users';
      expect(currentApiConfig.getEndpointUrl(endpoint)).toBe(`${testBaseUrl}/${endpoint}`);
    });

    it('should correctly combine baseURL (with trailing slash) and endpoint path starting with a slash', () => {
      // Re-import apiConfig with a base URL that has a trailing slash
      jest.resetModules();
      process.env.NODE_ENV = 'test';
      process.env.REACT_APP_API_BASE_URL = testBaseUrlTrailingSlash;
      const { apiConfig: configWithTrailingSlash } = require('../src/config/apiConfig');

      const endpoint = '/products';
      // Expected: trailing slash from base should be removed, no double slash
      expect(configWithTrailingSlash.getEndpointUrl(endpoint)).toBe(`${testBaseUrl}${endpoint}`);
    });

    it('should correctly combine baseURL (with trailing slash) and endpoint path not starting with a slash', () => {
      // Re-import apiConfig with a base URL that has a trailing slash
      jest.resetModules();
      process.env.NODE_ENV = 'test';
      process.env.REACT_APP_API_BASE_URL = testBaseUrlTrailingSlash;
      const { apiConfig: configWithTrailingSlash } = require('../src/config/apiConfig');

      const endpoint = 'products';
      // Expected: trailing slash from base should be removed, leading slash added to path
      expect(configWithTrailingSlash.getEndpointUrl(endpoint)).toBe(`${testBaseUrl}/${endpoint}`);
    });

    it('should correctly combine baseURL with a dynamic endpoint path', () => {
      const productId = '456';
      const dynamicEndpoint = currentApiConfig.endpoints.products.details(productId);
      expect(currentApiConfig.getEndpointUrl(dynamicEndpoint)).toBe(`${testBaseUrl}/products/${productId}`);
    });

    // Error conditions
    it('should throw an error for null endpoint path and log to console.error', () => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => currentApiConfig.getEndpointUrl(null as any)).toThrow('Invalid endpoint path provided to getEndpointUrl.');
      expect(consoleErrorSpy).toHaveBeenCalledWith('API Config Error: Invalid or empty endpoint path provided.', { endpointPath: null });
    });

    it('should throw an error for undefined endpoint path and log to console.error', () => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => currentApiConfig.getEndpointUrl(undefined as any)).toThrow('Invalid endpoint path provided to getEndpointUrl.');
      expect(consoleErrorSpy).toHaveBeenCalledWith('API Config Error: Invalid or empty endpoint path provided.', { endpointPath: undefined });
    });

    it('should throw an error for an empty string endpoint path and log to console.error', () => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => currentApiConfig.getEndpointUrl('')).toThrow('Invalid endpoint path provided to getEndpointUrl.');
      expect(consoleErrorSpy).toHaveBeenCalledWith('API Config Error: Invalid or empty endpoint path provided.', { endpointPath: '' });
    });

    it('should throw an error for a non-string endpoint path (number) and log to console.error', () => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => currentApiConfig.getEndpointUrl(123 as any)).toThrow('Invalid endpoint path provided to getEndpointUrl.');
      expect(consoleErrorSpy).toHaveBeenCalledWith('API Config Error: Invalid or empty endpoint path provided.', { endpointPath: 123 });
    });

    it('should throw an error for a non-string endpoint path (object) and log to console.error', () => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => currentApiConfig.getEndpointUrl({} as any)).toThrow('Invalid endpoint path provided to getEndpointUrl.');
      expect(consoleErrorSpy).toHaveBeenCalledWith('API Config Error: Invalid or empty endpoint path provided.', { endpointPath: {} });
    });
  });
});