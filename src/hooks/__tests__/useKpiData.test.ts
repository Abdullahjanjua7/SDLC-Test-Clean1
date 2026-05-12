import { renderHook, act, waitFor } from '@testing-library/react-hooks';
import { useKpiData } from './useKpiData'; // Assuming the hook is in useKpiData.ts
import * as KpiApi from './useKpiData'; // Import the module to spy on fetchKpiDataApi

// Helper to create mock KPI data
const mockKpiData = (id: string, value: number = 123.45) => ({
  id: id,
  name: `KPI ${id.toUpperCase()}`,
  value: value,
  unit: '$',
  timestamp: new Date().toISOString(),
  trend: 'up' as const,
  details: {},
});

describe('useKpiData', () => {
  let fetchKpiDataApiSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Spy on the actual fetchKpiDataApi function to control its behavior
    fetchKpiDataApiSpy = jest.spyOn(KpiApi, 'fetchKpiDataApi');
  });

  // 1. Test the hook's initial state
  test('should return initial state correctly when autoFetch is true (default)', async () => {
    // Mock a successful API call for the initial fetch
    fetchKpiDataApiSpy.mockResolvedValueOnce(mockKpiData('kpi-sales'));

    const { result, waitForNextUpdate } = renderHook(() => useKpiData('kpi-sales'));

    // Initial state immediately after render, before the async fetch completes
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(true); // Should be loading if autoFetch is true
    expect(result.current.error).toBeNull();

    // Wait for the fetch to complete and state to update
    await waitForNextUpdate();

    // State after successful fetch
    expect(result.current.data).toEqual(expect.objectContaining({ id: 'kpi-sales' }));
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(fetchKpiDataApiSpy).toHaveBeenCalledTimes(1);
    expect(fetchKpiDataApiSpy).toHaveBeenCalledWith('kpi-sales', undefined, undefined);
  });

  test('should return initial state correctly when autoFetch is false', () => {
    const { result } = renderHook(() => useKpiData('kpi-users', undefined, undefined, { autoFetch: false }));

    // Initial state: no fetch should occur
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false); // Should not be loading if autoFetch is false
    expect(result.current.error).toBeNull();
    expect(fetchKpiDataApiSpy).not.toHaveBeenCalled();
  });

  test('should use initialData if provided and autoFetch is false', () => {
    const initialData = mockKpiData('kpi-initial', 500);
    const { result } = renderHook(() => useKpiData('kpi-initial', undefined, undefined, { initialData, autoFetch: false }));

    expect(result.current.data).toEqual(initialData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(fetchKpiDataApiSpy).not.toHaveBeenCalled();
  });

  test('should replace initialData with fetched data when autoFetch is true', async () => {
    const initialData = mockKpiData('kpi-initial', 500);
    const fetchedData = mockKpiData('kpi-initial', 999);
    fetchKpiDataApiSpy.mockResolvedValueOnce(fetchedData);

    const { result, waitForNextUpdate } = renderHook(() => useKpiData('kpi-initial', undefined, undefined, { initialData, autoFetch: true }));

    // Initial state reflects initialData, but loading is true because autoFetch is active
    expect(result.current.data).toEqual(initialData);
    expect(result.current.loading