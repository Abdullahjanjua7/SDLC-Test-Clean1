import { useState, useEffect, useCallback, useRef } from 'react';

// --- Type Definitions ---

/**
 * Configuration interface for the analytics service.
 * Extend this with properties specific to your chosen analytics provider (e.g., Segment, Google Analytics).
 */
interface AnalyticsConfig {
  /**
   * The API key or tracking ID for your analytics service.
   * This is a required example property; adjust based on your actual analytics provider.
   */
  apiKey: string;
  /**
   * Optional flag to enable debug logging for the analytics service.
   */
  debug?: boolean;
  // Add other specific config properties here, e.g., `segmentWriteKey`, `gaTrackingId`
}

/**
 * Interface for a generic analytics service.
 * This defines the core methods that the `useAnalytics` hook expects.
 * Implementations of this interface would wrap your actual analytics library.
 */
interface AnalyticsService {
  /**
   * Initializes the analytics service with the given configuration.
   * This method should be idempotent if called multiple times.
   * @param config The configuration object for the analytics service.
   */
  init: (config: AnalyticsConfig) => Promise<void>;
  /**
   * Tracks a custom event with optional properties.
   * @param eventName The name of the event to track (e.g., "Product Added to Cart").
   * @param properties Optional key-value pairs to associate with the event (e.g., `{ productId: '123', quantity: 1 }`).
   */
  track: (eventName: string, properties?: Record<string, any>) => void;
  /**
   * Identifies a user with a unique ID and optional traits.
   * This links subsequent events to a specific user.
   * @param userId The unique identifier for the user (e.g., 'user-123', 'john.doe@example.com').
   * @param traits Optional key-value pairs describing the user (e.g., `{ name: 'John Doe', email: 'john.doe@example.com' }`).
   */
  identify: (userId: string, traits?: Record<string, any>) => void;
  /**
   * Tracks a page view with an optional path and properties.
   * @param path Optional path of the page. Defaults to current `window.location.pathname + window.location.search`.
   * @param properties Optional key-value pairs to associate with the page view.
   */
  page: (path?: string, properties?: Record<string, any>) => void;
}

/**
 * A simple mock analytics service for demonstration purposes.
 * In a real application, this would be an actual analytics library (e.g., Segment, Google Analytics).
 * This mock logs actions to the console and simulates async initialization.
 */
const createMockAnalyticsService = (): AnalyticsService => {
  let _isInitialized = false; // Internal state for the mock service instance
  return {
    init: async (config: AnalyticsConfig) => {
      if (_isInitialized) {
        console.warn('Mock Analytics: Service already initialized