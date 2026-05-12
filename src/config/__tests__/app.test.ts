describe('appConfig', () => {
  let originalEnv: NodeJS.ProcessEnv;

  // Store the original process.env before any tests run
  beforeAll(() => {
    originalEnv = process.env;
  });

  // Reset modules and process.env before each test
  beforeEach(() => {
    // Clear the module cache to ensure a fresh import of app.ts
    // This is crucial because appConfig is a top-level constant,
    // initialized once when the module is first imported.
    jest.resetModules();
    // Restore process.env to a clean copy of the original
    // This prevents tests from polluting each other's environment variables.
    process.env = { ...originalEnv };
  });

  // Restore the original process.env after all tests are done
  afterAll(() => {
    process.env = originalEnv;
  });

  // Test Case 1: Default values when no environment variables are set
  describe('when no environment variables are set', () => {
    it('should return default configuration values', () => {
      // Ensure all relevant environment variables are undefined for this test
      delete process.env.APP_NAME;
      delete process.env.NODE_ENV;
      delete process.env.PORT;
      delete process.env.HOSTNAME;
      delete process.env.APP_URL;
      delete process.env.API_PREFIX;
      delete process.env.LOG_LEVEL;
      delete process.env.CORS_ORIGIN;

      // Dynamically import the module after setting up the environment
      const appConfig = require('../src/config/app').default;

      expect(appConfig.name).toBe('MyTypeScriptApp');
      expect(appConfig.env).toBe('development');
      expect(appConfig.port).toBe(3000);
      expect(appConfig.hostname).toBe('0.0.0.0');
      expect(appConfig.url).toBe('http://localhost:3000');
      expect(appConfig.apiPrefix).toBe('/api/v1');
      expect(appConfig.logLevel).toBe('info');
      // In development (default), corsOrigin defaults to '*'
      expect(appConfig.corsOrigin).toBe('*');
    });
  });

  // Test Case 2: APP_NAME environment variable
  describe('APP_NAME environment variable', () => {
    it('should set the application name from APP_NAME', () => {
      process.env.APP_NAME = 'CustomAppName';
      const appConfig = require('../src/config/app').default;
      expect(appConfig.name).toBe('CustomAppName');
    });
  });

  // Test Case 3: NODE_ENV environment variable
  describe('NODE_ENV environment variable', () => {
    it('should set env to "production" when NODE_ENV is "production"', () => {
      process.env.NODE_ENV = 'production';
      const appConfig = require('../src/config/app').default;
      expect(appConfig.env).toBe('production');
    });

    it('should set env to "test" when NODE_ENV is "test"', () => {
      process.env.NODE_ENV = 'test';
      const appConfig = require('../src/config/app').default;
      expect(appConfig.env).toBe('test');
    });

    it('should default to "development" for invalid NODE_ENV values', () => {
      process.env.NODE_ENV = 'staging'; // Invalid value
      const appConfig = require('../src/config/app').default;
      expect(appConfig.env).toBe('development');
    });

    it('should default to "development" when NODE_ENV is not set', () => {
      delete process.env.NODE_ENV;
      const appConfig = require('../src/config/app').default;
      expect(appConfig.env).toBe('development');
    });
  });

  // Test Case 4: PORT environment variable
  describe('PORT environment variable', () => {
    it('should parse PORT as a number', () => {
      process.env.PORT = '8080';
      const appConfig = require('../src/config/app').default;
      expect(appConfig.port).toBe(8080);
    });

    it('should default to 3000 if PORT is not set', () => {
      delete process.env.PORT;
      const appConfig = require('../src/config/app').default;
      expect(appConfig.port).toBe(3000);
    });

    it('should result in NaN if PORT is not a valid number string', () => {
      process.env.PORT = 'not-a-number';
      const appConfig = require('../src/config/app').default;
      expect(appConfig.port).toBeNaN();
    });
  });

  // Test Case 5: HOSTNAME environment variable
  describe('HOSTNAME environment variable', () => {
    it('should set hostname from HOSTNAME', () => {
      process.env.HOSTNAME = '192.168.1.1';
      const appConfig = require('../src/config/app').default;
      expect(appConfig.hostname).toBe('192.168.1.1');
    });

    it('should default to "0.0.0.0" if HOSTNAME is not set', () => {
      delete process.env.HOSTNAME;
      const appConfig = require('../src/config/app').default;
      expect(appConfig.hostname).toBe('0.0.0.0');
    });
  });

  // Test Case 6: APP_URL environment variable and URL construction
  describe('APP_URL environment variable and URL construction', () => {
    it('should use APP_URL if provided, overriding hostname and port', () => {
      process.env.APP_URL = 'https://myapi.example.com';
      // Ensure other vars don't interfere if APP_URL is set
      process.env.HOSTNAME = 'somehost';
      process.env.PORT = '9999';
      const appConfig = require('../src/config/app').default;
      expect(appConfig.url).toBe('https://myapi.example.com');
    });

    it('should construct URL from HOSTNAME and PORT if APP_URL is not set', () => {
      delete process.env.APP_URL;
      process.env.HOSTNAME = 'my-custom-host';
      process.env.PORT = '5000';
      const appConfig = require('../src/config/app').default;
      expect(appConfig.url).toBe('http://my-custom-host:5000');
    });

    it('should construct URL from default HOSTNAME ("localhost") and default PORT (3000) if none are set', () => {
      delete process.env.APP_URL;
      delete process.env.HOSTNAME;
      delete process.env.PORT;
      const appConfig = require('../src/config/app').default;
      expect(appConfig.url).toBe('http://localhost:3000');
    });

    it('should construct URL from default HOSTNAME ("localhost") if only PORT is set', () => {
      delete process.env.APP_URL;
      delete process.env.HOSTNAME; // Defaults to 'localhost' in URL construction
      process.env.PORT = '4000';
      const appConfig = require('../src/config/app').default;
      expect(appConfig.url).toBe('http://localhost:4000');
    });

    it('should construct URL from default PORT (3000) if only HOSTNAME is set', () => {
      delete process.env.APP_URL;
      process.env.HOSTNAME = 'another-host';
      delete process.env.PORT; // Defaults to '3000' in URL construction
      const appConfig = require('../src/config/app').default;
      expect(appConfig.url).toBe('http://another-host:3000');
    });
  });

  // Test Case 7: API_PREFIX environment variable
  describe('API_PREFIX environment variable', () => {
    it('should set apiPrefix from API_PREFIX', () => {
      process.env.API_PREFIX = '/api/v2';
      const appConfig = require('../src/config/app').default;
      expect(appConfig.apiPrefix).toBe('/api/v2');
    });

    it('should default to "/api/v1" if API_PREFIX is not set', () => {
      delete process.env.API_PREFIX;
      const appConfig = require('../src/config/app').default;
      expect(appConfig.apiPrefix).toBe('/api/v1');
    });
  });

  // Test Case 8: LOG_LEVEL environment variable
  describe('LOG_LEVEL environment variable', () => {
    it('should set logLevel to "debug" when LOG_LEVEL is "debug"', () => {
      process.env.LOG_LEVEL = 'debug';
      const appConfig = require('../src/config/app').default;
      expect(appConfig.logLevel).toBe('debug');
    });

    it('should set logLevel to "error" when LOG_LEVEL is "error"', () => {
      process.env.LOG_LEVEL = 'error';
      const appConfig = require('../src/config/app').default;
      expect(appConfig.logLevel).toBe('error');
    });

    it('should default to "info" for invalid LOG_LEVEL values', () => {
      process.env.LOG_LEVEL = 'verbose'; // Invalid value
      const appConfig = require('../src/config/app').default;
      expect(appConfig.logLevel).toBe('info');
    });

    it('should default to "info" when LOG_LEVEL is not set', () => {
      delete process.env.LOG_LEVEL;
      const appConfig = require('../src/config/app').default;
      expect(appConfig.logLevel).toBe('info');
    });
  });

  // Test Case 9: CORS_ORIGIN environment variable
  describe('CORS_ORIGIN environment variable', () => {
    it('should return true if CORS_ORIGIN is "true" (case-insensitive)', () => {
      process.env.CORS_ORIGIN = 'TRUE'; // Test case-insensitivity
      const appConfig = require('../src/config/app').default;
      expect(appConfig.corsOrigin).toBe(true);
    });

    it('should return "*" if CORS_ORIGIN is "*"', () => {
      process.env.CORS_ORIGIN = '*';
      const appConfig = require('../src/config/app').default;
      expect(appConfig.corsOrigin).toBe('*');
    });

    it('should parse a single origin string into an array', () => {
      process.env.CORS_ORIGIN = 'http://localhost:4200';
      const appConfig = require('../src/config/app').default;
      expect(appConfig.corsOrigin).toEqual(['http://localhost:4200']);
    });

    it('should parse a comma-separated list of origins into an array', () => {
      process.env.CORS_ORIGIN = 'http://localhost:4200,https://example.com';
      const appConfig = require('../src/config/app').default;
      expect(appConfig.corsOrigin).toEqual(['http://localhost:4200', 'https://example.com']);
    });

    it('should trim and filter empty strings from comma-separated list', () => {
      process.env.CORS_ORIGIN = '  ,  http://test.com  ,  https://another.org , ';
      const appConfig = require('../src/config/app').default;
      expect(appConfig.corsOrigin).toEqual(['http://test.com', 'https://another.org']);
    });

    it('should default to "*" in development environment if CORS_ORIGIN is not set', () => {
      delete process.env.CORS_ORIGIN;
      process.env.NODE_ENV = 'development'; // Explicitly set for this test
      const appConfig = require('../src/config/app').default;
      expect(appConfig.corsOrigin).toBe('*');
    });

    it('should default to false in production environment if CORS_ORIGIN is not set', () => {
      delete process.env.CORS_ORIGIN;
      process.env.NODE_ENV = 'production'; // Explicitly set for this test
      const appConfig = require('../src/config/app').default;
      expect(appConfig.corsOrigin).toBe(false);
    });

    it('should default to false in test environment if CORS_ORIGIN is not set', () => {
      delete process.env.CORS_ORIGIN;
      process.env.NODE_ENV = 'test'; // Explicitly set for this test
      const appConfig = require('../src/config/app').default;
      expect(appConfig.corsOrigin).toBe(false);
    });
  });
});