const originalEnv = process.env;

// Helper to mock process.env for each test
const mockEnv = (envVars: Record<string, string | undefined>) => {
  process.env = { ...originalEnv, ...envVars };
};

describe('API Configuration Module', () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeAll(() => {
    // Spy on console.warn to capture warnings without printing them during tests
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterAll(() => {
    // Restore the original console.warn after all tests are done
    consoleWarnSpy.mockRestore();
    // Restore the original process.env after all tests are done
    process.env = originalEnv;
  });

  beforeEach(() => {
    // Reset modules before each test to ensure a fresh import of the 'api' module
    // This is crucial because API_BASE_URL is a module-level constant initialized once.
    jest.resetModules();
    // Clear any previous calls to console.warn for a clean slate in each test
    consoleWarnSpy.mockClear();
  });

  describe('API_BASE_URL', () => {
    it('should use REACT_APP_API_BASE_URL if it is set', () => {
      mockEnv({ REACT_APP_API_BASE_URL: 'http://custom-react-app.com/api', API_BASE_URL: undefined, NODE_ENV: 'development' });
      // Dynamically import the module after setting process.env
      const { API_BASE_URL } = require('../src/config/api');
      expect(API_BASE_URL).toBe('http://custom-react-app.com/api');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should use generic API_BASE_URL if REACT_APP_API_BASE_URL is not set', () => {
      mockEnv({ REACT_APP_API_BASE_URL: undefined, API_BASE_URL: 'http://custom-node-app.com/api', NODE_ENV: 'development' });
      const { API_BASE_URL } = require('../src/config/api');
      expect(API_BASE_URL).toBe('http://custom-node-app.com/api');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should prioritize REACT_APP_API_BASE_URL over generic API_BASE_URL', () => {
      mockEnv({ REACT_APP_API_BASE_URL: 'http://priority-react.com/api', API_BASE_URL: 'http://fallback-node.com/api', NODE_ENV: 'development' });
      const { API_BASE_URL } = require('../src/config/api');
      expect(API_BASE_URL).toBe('http://priority-react.com/api');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should use the default development URL if no environment variables are set', () => {
      mockEnv({ REACT_APP_API_BASE_URL: undefined, API_BASE_URL: undefined, NODE_ENV: 'development' });
      const { API_BASE_URL } = require('../src/config/api');
      expect(API_BASE_URL).toBe('http://localhost:3000/api');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should log a warning and use default URL if no env vars set in production environment', () => {
      mockEnv({ REACT_APP_API_BASE_URL: undefined, API_BASE_URL: undefined, NODE_ENV: 'production' });
      const { API_BASE_URL } = require('../src/config/api');
      expect(API_BASE_URL).toBe('http://localhost:3000/api');
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('API_BASE_URL environment variable is not set.')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Please ensure it is configured correctly for production deployments.')
      );
    });

    it('should log a warning and use default URL if no env vars set in test environment', () => {
      mockEnv({ REACT_APP_API_BASE_URL: undefined, API_BASE_URL: undefined, NODE_ENV: 'test' });
      const { API_BASE_URL } = require('../src/config/api');
      expect(API_BASE_URL).toBe('http://localhost:3000/api');
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('API_BASE_URL environment variable is not set.')
      );
    });

    it('should not log a warning if no env vars set in development environment', () => {
      mockEnv({ REACT_APP_API_BASE_URL: undefined, API_BASE_URL: undefined, NODE_ENV: 'development' });
      const { API_BASE_URL } = require('../src/config/api');
      expect(API_BASE_URL).toBe('http://localhost:3000/api');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('API_ENDPOINTS', () => {
    let API_ENDPOINTS: typeof import('../src/config/api').API_ENDPOINTS;

    beforeAll(() => {
      // Ensure a consistent environment for API_ENDPOINTS import, as it doesn't depend on env vars
      mockEnv({ REACT_APP_API_BASE_URL: undefined, API_BASE_URL: undefined, NODE_ENV: 'development' });
      API_ENDPOINTS = require('../src/config/api').API_ENDPOINTS;
    });

    it('should be an object', () => {
      expect(typeof API_ENDPOINTS).toBe('object');
      expect(API_ENDPOINTS).not.toBeNull();
    });

    it('should be frozen to prevent modification', () => {
      expect(Object.isFrozen(API_ENDPOINTS)).toBe(true);

      // Attempt to modify an existing property
      const originalLoginPath = API_ENDPOINTS.auth.login;
      try {
        // @ts-ignore - Intentionally trying to modify a frozen object for testing
        API_ENDPOINTS.auth.login = '/new/auth/login';
      } catch (e: any) {
        // In strict mode, this will throw a TypeError
        expect(e).toBeInstanceOf(TypeError);
        expect(e.message).toMatch(/Cannot assign to read only property 'login'/);
      }
      expect(API_ENDPOINTS.auth.login).toBe(originalLoginPath); // Should remain unchanged

      // Attempt to add a new property
      try {
        // @ts-ignore - Intentionally trying to add a property to a frozen object
        API_ENDPOINTS.newCategory = { test: '/test' };
      } catch (e: any) {
        // In strict mode, this will throw a TypeError
        expect(e).toBeInstanceOf(TypeError);
        expect(e.message).toMatch(/Cannot add property newCategory, object is not extensible/);
      }
      expect((API_ENDPOINTS as any).newCategory).toBeUndefined(); // Should not be added
    });

    describe('static endpoints', () => {
      it('auth.login should return correct path', () => {
        expect(API_ENDPOINTS.auth.login).toBe('/auth/login');
      });

      it('auth.register should return correct path', () => {
        expect(API_ENDPOINTS.auth.register).toBe('/auth/register');
      });

      it('auth.logout should return correct path', () => {
        expect(API_ENDPOINTS.auth.logout).toBe('/auth/logout');
      });

      it('auth.refreshToken should return correct path', () => {
        expect(API_ENDPOINTS.auth.refreshToken).toBe('/auth/refresh-token');
      });

      it('auth.forgotPassword should return correct path', () => {
        expect(API_ENDPOINTS.auth.forgotPassword).toBe('/auth/forgot-password');
      });

      it('auth.resetPassword should return correct path', () => {
        expect(API_ENDPOINTS.auth.resetPassword).toBe('/auth/reset-password');
      });

      it('users.getAll should return correct path', () => {
        expect(API_ENDPOINTS.users.getAll).toBe('/users');
      });

      it('users.create should return correct path', () => {
        expect(API_ENDPOINTS.users.create).toBe('/users');
      });

      it('users.profile should return correct path', () => {
        expect(API_ENDPOINTS.users.profile).toBe('/users/profile');
      });

      it('products.getAll should return correct path', () => {
        expect(API_ENDPOINTS.products.getAll).toBe('/products');
      });

      it('products.create should return correct path', () => {
        expect(API_ENDPOINTS.products.create).toBe('/products');
      });

      it('orders.getAll should return correct path', () => {
        expect(API_ENDPOINTS.orders.getAll).toBe('/orders');
      });

      it('orders.create should return correct path', () => {
        expect(API_ENDPOINTS.orders.create).toBe('/orders');
      });
    });

    describe('dynamic endpoints', () => {
      it('users.getById should return correct path for string ID', () => {
        expect(API_ENDPOINTS.users.getById('user123')).toBe('/users/user123');
      });

      it('users.getById should return correct path for number ID', () => {
        expect(API_ENDPOINTS.users.getById(456)).toBe('/users/456');
      });

      it('users.update should return correct path for string ID', () => {
        expect(API_ENDPOINTS.users.update('user789')).toBe('/users/user789');
      });

      it('users.update should return correct path for number ID', () => {
        expect(API_ENDPOINTS.users.update(789)).toBe('/users/789');
      });

      it('users.delete should return correct path for string ID', () => {
        expect(API_ENDPOINTS.users.delete('userABC')).toBe('/users/userABC');
      });

      it('users.delete should return correct path for number ID', () => {
        expect(API_ENDPOINTS.users.delete(101)).toBe('/users/101');
      });

      it('products.getById should return correct path for string ID', () => {
        expect(API_ENDPOINTS.products.getById('prodXYZ')).toBe('/products/prodXYZ');
      });

      it('products.getById should return correct path for number ID', () => {
        expect(API_ENDPOINTS.products.getById(202)).toBe('/products/202');
      });

      it('products.update should return correct path for string ID', () => {
        expect(API_ENDPOINTS.products.update('prodDEF')).toBe('/products/prodDEF');
      });

      it('products.update should return correct path for number ID', () => {
        expect(API_ENDPOINTS.products.update(303)).toBe('/products/303');
      });

      it('products.delete should return correct path for string ID', () => {
        expect(API_ENDPOINTS.products.delete('prodGHI')).toBe('/products/prodGHI');
      });

      it('products.delete should return correct path for number ID', () => {
        expect(API_ENDPOINTS.products.delete(404)).toBe('/products/404');
      });

      it('orders.getById should return correct path for string ID', () => {
        expect(API_ENDPOINTS.orders.getById('orderJKL')).toBe('/orders/orderJKL');
      });

      it('orders.getById should return correct path for number ID', () => {
        expect(API_ENDPOINTS.orders.getById(505)).toBe('/orders/505');
      });

      it('orders.updateStatus should return correct path for string ID', () => {
        expect(API_ENDPOINTS.orders.updateStatus('orderMNO')).toBe('/orders/orderMNO/status');
      });

      it('orders.updateStatus should return correct path for number ID', () => {
        expect(API_ENDPOINTS.orders.updateStatus(606)).toBe('/orders/606/status');
      });
    });
  });
});