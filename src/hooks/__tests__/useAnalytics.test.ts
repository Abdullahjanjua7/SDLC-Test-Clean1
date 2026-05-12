import { renderHook, act, waitFor } from '@testing-library/react-hooks';
import { useAnalytics, AnalyticsConfig, AnalyticsService } from '../src/hooks/useAnalytics'; // Adjust path as needed

// --- Mocking Strategy ---
// We need to mock the internal `createMockAnalyticsService` function
// to control the behavior of the analytics service instance created by the hook.
// This requires mocking the entire module and overriding `createMockAnalyticsService`.

// Define mock functions and service instance globally in the test file
// These will be assigned when the module is mocked and reset before each test.
let mockInit: jest.Mock;
let mockTrack: jest.Mock;
let mockIdentify: jest.Mock;
let mockPage: jest.Mock;
let mockAnalyticsServiceInstance: jest.Mocked<AnalyticsService>;

// Mock the module where `useAnalytics` and `createMockAnalyticsService` reside.
// This `jest.mock` call must be at the top level of the test file.
jest.mock('../src/hooks/useAnalytics', () => { // Adjust path to your hook file
  const actualModule = jest.requireActual('../src/hooks/useAnalytics');

  // Initialize the mock functions and service instance here.
  // These will be the actual `jest.fn()` instances that we can control and assert on.
  // Their implementations will be set in `beforeEach` to mimic the original `createMockAnalyticsService`'s logging.
  mockInit =