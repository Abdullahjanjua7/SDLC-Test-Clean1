/**
 * @file src/config/app.ts
 * @description Application-wide configuration settings.
 * This file defines core application parameters, environment variables,
 * and default values. Sensitive information like database credentials
 * or API keys should ideally be loaded from environment variables
 * and not hardcoded here.
 */

/**
 * Interface defining the structure of the application configuration object.
 * This provides type safety and clarity for configuration properties.
 */
interface AppConfig {
  /**
   * The name of the application.
   * Used for logging, display, etc.
   */
  name: string;
  /**
   * The current environment the application is running in.
   * 'development' for local development, 'production' for live deployments,
   * 'test' for testing environments.
   */
  env: 'development' | 'production' | 'test';
  /**
   * The port number on which the application server will listen.
   */
  port: number;
  /**
   * The hostname or IP address the application server will bind to.
   * '0.0.0.0' binds to all available network interfaces.
   */
  hostname: string;
  /**
   * The base URL of the application.
   * Useful for generating absolute URLs (e.g., for API documentation, email links).
   */
  url: string;
  /**
   * The prefix for all API routes.
   * E.g., if '/api/v1', then an endpoint like '/users' becomes '/api/v1/users'.
   */
  apiPrefix: string;
  /**
   * The logging level for the application.
   * Controls the verbosity of logs.
   * 'debug': Most verbose, useful for development.
   * 'info': General operational information.
   * 'warn': Potentially problematic situations.
   * 'error': Error events.
   * 'silent': No logs.
   */
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'silent';
  /**
   * Configuration for Cross-Origin Resource Sharing (CORS).
   * Can be:
   * - `string`: A single origin (e.g., 'http://localhost:4200').
   * - `string[]`: An array of allowed origins.
   * - `true`: Reflect the request origin (not recommended for production).
   * - `false`: Disable CORS (no 'Access-Control-Allow-Origin' header).
   * - `'*'`: Allow all origins (use with caution, especially in production).
   *
   * It's highly recommended to specify explicit origins in production.
   */
  corsOrigin: string | string[] | boolean;
}

/**
 * The application configuration object.
 * Values are loaded from environment variables first, falling back to sensible defaults.
 * This allows for easy environment-specific configuration without code changes.
 */
const appConfig: AppConfig = {
  /**
   * Application name. Defaults to 'MyTypeScriptApp'.
   */
  name: process.env.APP_NAME || 'MyTypeScriptApp',

  /**
   * Current environment. Validates against allowed environments.
   * Defaults to 'development'.
   */
  env: (() => {
    const env = process.env.NODE_ENV;
    const validEnvs: AppConfig['env'][] = ['development', 'production', 'test'];
    return env && validEnvs.includes(env as AppConfig['env']) ? (env as AppConfig['env']) : 'development';
  })(),

  /**
   * Server port. Parses from environment variable or defaults to 3000.
   */
  port: parseInt(process.env.PORT || '3000', 10),

  /**
   * Server hostname. Defaults to '0.0.0.0' (listens on all interfaces).
   */
  hostname: process.env.HOSTNAME || '0.0.0.0',

  /**
   * Base URL of the application. Constructed using hostname and port,
   * or overridden by APP_URL environment variable.
   */
  url: process.env.APP_URL || `http://${process.env.HOSTNAME || 'localhost'}:${process.env.PORT || '3000'}`,

  /**
   * API route prefix. Defaults to '/api/v1'.
   */
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  /**
   * Logging level. Validates against allowed levels.
   * Defaults to 'info'.
   */
  logLevel: (() => {
    const level = process.env.LOG_LEVEL;
    const validLevels: AppConfig['logLevel'][] = ['debug', 'info', 'warn', 'error', 'silent'];
    return level && validLevels.includes(level as AppConfig['logLevel']) ? (level as AppConfig['logLevel']) : 'info';
  })(),

  /**
   * CORS origin configuration.
   * - If `CORS_ORIGIN` env var is 'true', allows reflection.
   * - If `CORS_ORIGIN` env var is '*', allows all.
   * - If `CORS_ORIGIN` env var is a comma-separated string, parses into an array.
   * - Otherwise, defaults to '*' in development and `false` (disabled) in production.
   */
  corsOrigin: (() => {
    const corsEnv = process.env.CORS_ORIGIN;
    if (corsEnv) {
      if (corsEnv.toLowerCase() === 'true') return true;
      if (corsEnv === '*') return '*';
      // Assume it's a comma-separated list of origins
      return corsEnv.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
    // Default CORS behavior based on environment
    return process.env.NODE_ENV === 'development' ? '*' : false;
  })(),
};

export default appConfig;